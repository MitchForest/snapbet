#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '@/services/supabase/client';

interface UserStats {
  user_id: string;
  total_wagered: number;
  total_won: number;
  win_count: number;
  loss_count: number;
  push_count: number;
  biggest_win: number;
  biggest_loss: number;
  current_streak: number;
  best_streak: number;
  perfect_days: string[];
  team_bet_counts: Record<string, number>;
  fade_profit_generated: number;
  daily_records: Record<string, { wins: number; losses: number; date: string }>;
  last_bet_date?: string;
}

export class StatsRollupJob extends BaseJob {
  constructor() {
    super({
      name: 'stats-rollup',
      description: 'Calculate and update user statistics in bankrolls table',
      schedule: '0 * * * *', // Every hour
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    // Get all users with recent betting activity
    const { data: activeUsers, error: usersError } = await supabase
      .from('bets')
      .select('user_id')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .not('status', 'eq', 'pending');

    if (usersError) throw usersError;

    // Get unique user IDs
    const uniqueUserIds = [...new Set(activeUsers.map((b) => b.user_id))];

    if (options.dryRun) {
      console.log(`Would calculate stats for ${uniqueUserIds.length} users`);
      if (options.verbose) {
        console.log('  Users:', uniqueUserIds.slice(0, 5).join(', '), '...');
      }
      return {
        success: true,
        message: `Would update stats for ${uniqueUserIds.length} users`,
        affected: uniqueUserIds.length,
      };
    }

    // Apply limit if specified
    const usersToProcess = options.limit ? uniqueUserIds.slice(0, options.limit) : uniqueUserIds;

    let successCount = 0;
    const errors: string[] = [];

    for (const userId of usersToProcess) {
      try {
        const stats = await this.calculateUserStats(userId);
        await this.updateBankrollStats(userId, stats);
        successCount++;

        if (options.verbose) {
          console.log(`  ✅ Updated stats for user ${userId}`);
          console.log(`     Win rate: ${this.calculateWinRate(stats)}%`);
          console.log(`     Current streak: ${stats.current_streak}`);
          console.log(`     Total wagered: $${(stats.total_wagered / 100).toFixed(2)}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`User ${userId}: ${errorMessage}`);
        console.error(`  ❌ Failed to update stats for user ${userId}: ${errorMessage}`);
      }
    }

    return {
      success: errors.length === 0,
      message: `Updated stats for ${successCount}/${usersToProcess.length} users`,
      affected: successCount,
      details: {
        totalUsers: usersToProcess.length,
        successCount,
        errorCount: errors.length,
        errors: errors.slice(0, 5), // First 5 errors
      },
    };
  }

  private async calculateUserStats(userId: string): Promise<UserStats> {
    // Get all settled bets for the user
    const { data: bets, error } = await supabase
      .from('bets')
      .select(
        `
        *,
        game:games(
          home_team,
          away_team,
          commence_time
        )
      `
      )
      .eq('user_id', userId)
      .in('status', ['won', 'lost', 'push'])
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!bets || bets.length === 0) {
      return this.getEmptyStats(userId);
    }

    // Calculate basic stats
    const stats: UserStats = {
      user_id: userId,
      total_wagered: 0,
      total_won: 0,
      win_count: 0,
      loss_count: 0,
      push_count: 0,
      biggest_win: 0,
      biggest_loss: 0,
      current_streak: 0,
      best_streak: 0,
      perfect_days: [],
      team_bet_counts: {},
      fade_profit_generated: 0,
      daily_records: {},
      last_bet_date: bets[bets.length - 1].created_at || undefined,
    };

    let currentStreak = 0;
    let streakType: 'win' | 'loss' | null = null;

    // Process each bet
    for (const bet of bets) {
      stats.total_wagered += bet.stake;

      // Count outcomes
      if (bet.status === 'won') {
        stats.win_count++;
        stats.total_won += bet.actual_win || 0;

        const profit = (bet.actual_win || 0) - bet.stake;
        if (profit > stats.biggest_win) {
          stats.biggest_win = profit;
        }

        // Update streak
        if (streakType === 'win') {
          currentStreak++;
        } else {
          currentStreak = 1;
          streakType = 'win';
        }
      } else if (bet.status === 'lost') {
        stats.loss_count++;

        if (bet.stake > stats.biggest_loss) {
          stats.biggest_loss = bet.stake;
        }

        // Update streak
        if (streakType === 'loss') {
          currentStreak--;
        } else {
          currentStreak = -1;
          streakType = 'loss';
        }
      } else if (bet.status === 'push') {
        stats.push_count++;
        // Pushes don't affect streaks
      }

      // Track best streak
      if (Math.abs(currentStreak) > Math.abs(stats.best_streak)) {
        stats.best_streak = currentStreak;
      }

      // Track team bets
      if (bet.bet_type === 'moneyline' || bet.bet_type === 'spread') {
        const betDetails = bet.bet_details as { team?: string };
        const team = betDetails?.team;
        if (team) {
          stats.team_bet_counts[team] = (stats.team_bet_counts[team] || 0) + 1;
        }
      }

      // Track daily records
      const betDate = new Date(bet.created_at || '').toISOString().split('T')[0];
      if (!stats.daily_records[betDate]) {
        stats.daily_records[betDate] = { wins: 0, losses: 0, date: betDate };
      }
      if (bet.status === 'won') {
        stats.daily_records[betDate].wins++;
      } else if (bet.status === 'lost') {
        stats.daily_records[betDate].losses++;
      }

      // Track fade profit (from faded bets)
      if (bet.is_fade && bet.status === 'won') {
        stats.fade_profit_generated += (bet.actual_win || 0) - bet.stake;
      }
    }

    stats.current_streak = currentStreak;

    // Find perfect days (all wins, no losses)
    stats.perfect_days = Object.entries(stats.daily_records)
      .filter(([_, record]) => record.wins > 0 && record.losses === 0)
      .map(([date]) => date);

    return stats;
  }

  private async updateBankrollStats(userId: string, stats: UserStats): Promise<void> {
    // Get current bankroll to calculate season high/low
    const { data: currentBankroll, error: fetchError } = await supabase
      .from('bankrolls')
      .select('balance, season_high, season_low')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const currentBalance = currentBankroll.balance;
    const seasonHigh = Math.max(currentBalance, currentBankroll.season_high || currentBalance);
    const seasonLow = Math.min(currentBalance, currentBankroll.season_low || currentBalance);

    // Update bankroll with calculated stats
    const { error: updateError } = await supabase
      .from('bankrolls')
      .update({
        total_wagered: stats.total_wagered,
        total_won: stats.total_won,
        win_count: stats.win_count,
        loss_count: stats.loss_count,
        push_count: stats.push_count,
        biggest_win: stats.biggest_win,
        biggest_loss: stats.biggest_loss,
        season_high: seasonHigh,
        season_low: seasonLow,
        stats_metadata: {
          current_streak: stats.current_streak,
          best_streak: stats.best_streak,
          perfect_days: stats.perfect_days,
          team_bet_counts: stats.team_bet_counts,
          fade_profit_generated: stats.fade_profit_generated,
          daily_records: stats.daily_records,
          last_bet_date: stats.last_bet_date,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;
  }

  private getEmptyStats(userId: string): UserStats {
    return {
      user_id: userId,
      total_wagered: 0,
      total_won: 0,
      win_count: 0,
      loss_count: 0,
      push_count: 0,
      biggest_win: 0,
      biggest_loss: 0,
      current_streak: 0,
      best_streak: 0,
      perfect_days: [],
      team_bet_counts: {},
      fade_profit_generated: 0,
      daily_records: {},
    };
  }

  private calculateWinRate(stats: UserStats): string {
    const totalBets = stats.win_count + stats.loss_count;
    if (totalBets === 0) return '0.0';
    return ((stats.win_count / totalBets) * 100).toFixed(1);
  }
}

// CLI execution
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const job = new StatsRollupJob();
  const options: JobOptions = {
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
  };

  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
  if (limitArg) {
    options.limit = parseInt(limitArg.split('=')[1], 10);
  }

  await job.execute(options);
}
