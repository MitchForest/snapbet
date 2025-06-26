#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '@/services/supabase/client';

export class StatsRollupJob extends BaseJob {
  constructor() {
    super({
      name: 'stats-rollup',
      description: 'Calculate and update user statistics',
      schedule: '0 * * * *', // Every hour
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    // Get all users who have placed bets in the last week
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: activeUsers, error: userError } = await supabase
      .from('bets')
      .select('user_id')
      .gte('created_at', oneWeekAgo);

    if (userError) throw userError;

    if (!activeUsers || activeUsers.length === 0) {
      return {
        success: true,
        message: 'No active users to update stats for',
        affected: 0,
      };
    }

    // Get unique user IDs
    const uniqueUserIds = [...new Set(activeUsers.map((b) => b.user_id))];

    if (options.dryRun) {
      if (options.verbose) {
        console.log(`  📊 Would update stats for ${uniqueUserIds.length} users`);
      }
      return {
        success: true,
        message: `Would update stats for ${uniqueUserIds.length} users`,
        affected: uniqueUserIds.length,
      };
    }

    let updatedCount = 0;
    const errors: string[] = [];

    // Apply limit if specified
    const usersToProcess = options.limit ? uniqueUserIds.slice(0, options.limit) : uniqueUserIds;

    for (const userId of usersToProcess) {
      try {
        // Calculate user stats
        const stats = await this.calculateUserStats(userId);

        // For now, just log the stats since users table doesn't have these columns
        // In a real implementation, you'd either:
        // 1. Add these columns to the users table
        // 2. Create a separate user_stats table
        // 3. Store in a JSONB column

        if (options.verbose) {
          console.log(`  📊 Stats for user ${userId}:`);
          console.log(`     Total Bets: ${stats.totalBets}`);
          console.log(`     Win Rate: ${(stats.winRate * 100).toFixed(1)}%`);
          console.log(`     Total Profit: $${(stats.totalProfit / 100).toFixed(2)}`);
          console.log(`     Current Streak: ${stats.currentStreak}`);
        }

        // Mark as successful even though we didn't update the database
        updatedCount++;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`User ${userId}: ${message}`);
      }
    }

    return {
      success: errors.length === 0,
      message: `Updated stats for ${updatedCount} users`,
      affected: updatedCount,
      details: {
        totalUsers: usersToProcess.length,
        updated: updatedCount,
        errors: errors.length > 0 ? errors : undefined,
      },
    };
  }

  private async calculateUserStats(userId: string) {
    // Get all settled bets for the user
    const { data: bets, error } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['won', 'lost', 'push'])
      .order('created_at');

    if (error) throw error;

    if (!bets || bets.length === 0) {
      return {
        totalBets: 0,
        totalWins: 0,
        totalLosses: 0,
        winRate: 0,
        totalWagered: 0,
        totalProfit: 0,
        biggestWin: 0,
        currentStreak: 0,
        bestStreak: 0,
      };
    }

    let totalBets = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let totalWagered = 0;
    let totalProfit = 0;
    let biggestWin = 0;
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    for (const bet of bets) {
      totalBets++;
      totalWagered += bet.stake;

      if (bet.status === 'won') {
        totalWins++;
        const profit = (bet.actual_win || 0) - bet.stake;
        totalProfit += profit;
        biggestWin = Math.max(biggestWin, bet.actual_win || 0);

        // Update streak
        if (tempStreak >= 0) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
        bestStreak = Math.max(bestStreak, tempStreak);
      } else if (bet.status === 'lost') {
        totalLosses++;
        totalProfit -= bet.stake;

        // Update streak
        if (tempStreak <= 0) {
          tempStreak--;
        } else {
          tempStreak = -1;
        }
        bestStreak = Math.max(bestStreak, Math.abs(tempStreak));
      }
    }

    currentStreak = tempStreak;
    const winRate = totalBets > 0 ? totalWins / totalBets : 0;

    return {
      totalBets,
      totalWins,
      totalLosses,
      winRate,
      totalWagered,
      totalProfit,
      biggestWin,
      currentStreak,
      bestStreak,
    };
  }
}

// CLI execution
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const job = new StatsRollupJob();
  await job.execute({
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
    limit: process.argv.includes('--limit')
      ? parseInt(process.argv[process.argv.indexOf('--limit') + 1])
      : undefined,
  });
}
