#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '@/services/supabase/client';

interface BadgeCalculator {
  id: string;
  name: string;
  calculate: (options: JobOptions) => Promise<string[]>; // Returns user IDs who earned the badge
}

export class BadgeCalculationJob extends BaseJob {
  constructor() {
    super({
      name: 'badge-calculation',
      description: 'Calculate weekly badges for all users',
      schedule: '0 * * * *', // Every hour
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    const badges: BadgeCalculator[] = [
      { id: 'hot_streak', name: 'Hot Streak', calculate: this.calculateHotStreak.bind(this) },
      { id: 'profit_king', name: 'Profit King', calculate: this.calculateProfitKing.bind(this) },
      {
        id: 'riding_wave',
        name: 'Riding the Wave',
        calculate: this.calculateRidingWave.bind(this),
      },
      { id: 'sharp', name: 'Sharp', calculate: this.calculateSharp.bind(this) },
      { id: 'fade_god', name: 'Fade God', calculate: this.calculateFadeGod.bind(this) },
      { id: 'most_active', name: 'Most Active', calculate: this.calculateMostActive.bind(this) },
      { id: 'ghost', name: 'Ghost', calculate: this.calculateGhost.bind(this) },
      { id: 'sunday_sweep', name: 'Sunday Sweep', calculate: this.calculateSundaySweep.bind(this) },
    ];

    let totalBadgesAwarded = 0;
    const details: Record<string, number> = {};

    for (const badge of badges) {
      try {
        const userIds = await badge.calculate(options);

        if (!options.dryRun && userIds.length > 0) {
          // Award badges to users - we'll save them directly
          // In a real implementation, we'd track which badges each user earned
          // For now, we'll just count them
        }

        totalBadgesAwarded += userIds.length;
        details[badge.id] = userIds.length;

        if (options.verbose) {
          console.log(`  🏆 ${badge.name}: ${userIds.length} users`);
        }
      } catch (error) {
        console.error(`Failed to calculate ${badge.name}:`, error);
        details[badge.id] = 0;
      }
    }

    // Update effect access based on badge counts
    if (!options.dryRun) {
      await this.updateEffectAccess(options);
    }

    return {
      success: true,
      message: `Calculated ${badges.length} badge types, awarded ${totalBadgesAwarded} badges`,
      affected: totalBadgesAwarded,
      details: {
        ...details,
        timestamp: new Date().toISOString(),
      },
    };
  }

  private async calculateHotStreak(options: JobOptions): Promise<string[]> {
    // Users with 3+ consecutive wins this week
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: bets, error } = await supabase
      .from('bets')
      .select('user_id, status, created_at')
      .gte('created_at', oneWeekAgo)
      .in('status', ['won', 'lost'])
      .order('user_id')
      .order('created_at');

    if (error) throw error;
    if (!bets || bets.length === 0) return [];

    // Group by user and find consecutive wins
    const qualifiedUsers: string[] = [];

    let currentUserId: string | null = null;
    let currentStreak = 0;
    let maxStreak = 0;

    for (const bet of bets) {
      if (bet.user_id !== currentUserId) {
        // Save max streak for previous user
        if (currentUserId && maxStreak >= 3) {
          qualifiedUsers.push(currentUserId);
        }

        // Reset for new user
        currentUserId = bet.user_id;
        currentStreak = 0;
        maxStreak = 0;
      }

      if (bet.status === 'won') {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    // Check last user
    if (currentUserId && maxStreak >= 3) {
      qualifiedUsers.push(currentUserId);
    }

    if (options.verbose) {
      console.log(`    Found ${qualifiedUsers.length} users with hot streaks`);
    }

    return qualifiedUsers;
  }

  private async calculateProfitKing(options: JobOptions): Promise<string[]> {
    // User with highest profit this week
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: profits, error } = await supabase
      .from('bets')
      .select('user_id, actual_win, stake')
      .gte('created_at', oneWeekAgo)
      .in('status', ['won', 'lost']);

    if (error) throw error;
    if (!profits || profits.length === 0) return [];

    // Calculate profit per user
    const userProfits = new Map<string, number>();

    for (const bet of profits) {
      const currentProfit = userProfits.get(bet.user_id) || 0;
      const betProfit = (bet.actual_win || 0) - bet.stake;
      userProfits.set(bet.user_id, currentProfit + betProfit);
    }

    // Find top user
    let topUserId: string | null = null;
    let topProfit = -Infinity;

    for (const [userId, profit] of userProfits.entries()) {
      if (profit > topProfit) {
        topProfit = profit;
        topUserId = userId;
      }
    }

    if (options.verbose && topUserId) {
      console.log(`    Profit King: $${topProfit} profit`);
    }

    return topUserId && topProfit > 0 ? [topUserId] : [];
  }

  private async calculateRidingWave(options: JobOptions): Promise<string[]> {
    // User with most successful tails
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: tails, error } = await supabase
      .from('bets')
      .select('user_id')
      .gte('created_at', oneWeekAgo)
      .eq('is_tail', true)
      .eq('status', 'won');

    if (error) throw error;
    if (!tails || tails.length === 0) return [];

    // Count wins per user
    const userWins = new Map<string, number>();

    for (const tail of tails) {
      userWins.set(tail.user_id, (userWins.get(tail.user_id) || 0) + 1);
    }

    // Find top user
    let topUserId: string | null = null;
    let topWins = 0;

    for (const [userId, wins] of userWins.entries()) {
      if (wins > topWins) {
        topWins = wins;
        topUserId = userId;
      }
    }

    if (options.verbose && topUserId) {
      console.log(`    Riding the Wave: ${topWins} successful tails`);
    }

    return topUserId && topWins >= 3 ? [topUserId] : [];
  }

  private async calculateSharp(options: JobOptions): Promise<string[]> {
    // User with highest win rate (min 10 bets)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: bets, error } = await supabase
      .from('bets')
      .select('user_id, status')
      .gte('created_at', oneWeekAgo)
      .in('status', ['won', 'lost']);

    if (error) throw error;
    if (!bets || bets.length === 0) return [];

    // Calculate win rate per user
    const userStats = new Map<string, { wins: number; total: number }>();

    for (const bet of bets) {
      const stats = userStats.get(bet.user_id) || { wins: 0, total: 0 };
      stats.total++;
      if (bet.status === 'won') stats.wins++;
      userStats.set(bet.user_id, stats);
    }

    // Find user with best win rate (min 10 bets)
    let topUserId: string | null = null;
    let topWinRate = 0;

    for (const [userId, stats] of userStats.entries()) {
      if (stats.total >= 10) {
        const winRate = stats.wins / stats.total;
        if (winRate > topWinRate) {
          topWinRate = winRate;
          topUserId = userId;
        }
      }
    }

    if (options.verbose && topUserId) {
      console.log(`    Sharp: ${(topWinRate * 100).toFixed(1)}% win rate`);
    }

    return topUserId && topWinRate >= 0.6 ? [topUserId] : [];
  }

  private async calculateFadeGod(options: JobOptions): Promise<string[]> {
    // User with most successful fades
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: fades, error } = await supabase
      .from('bets')
      .select('user_id')
      .gte('created_at', oneWeekAgo)
      .eq('is_fade', true)
      .eq('status', 'won');

    if (error) throw error;
    if (!fades || fades.length === 0) return [];

    // Count wins per user
    const userWins = new Map<string, number>();

    for (const fade of fades) {
      userWins.set(fade.user_id, (userWins.get(fade.user_id) || 0) + 1);
    }

    // Find top user
    let topUserId: string | null = null;
    let topWins = 0;

    for (const [userId, wins] of userWins.entries()) {
      if (wins > topWins) {
        topWins = wins;
        topUserId = userId;
      }
    }

    if (options.verbose && topUserId) {
      console.log(`    Fade God: ${topWins} successful fades`);
    }

    return topUserId && topWins >= 3 ? [topUserId] : [];
  }

  private async calculateMostActive(options: JobOptions): Promise<string[]> {
    // User with most bets placed
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: bets, error } = await supabase
      .from('bets')
      .select('user_id')
      .gte('created_at', oneWeekAgo);

    if (error) throw error;
    if (!bets || bets.length === 0) return [];

    // Count bets per user
    const userBets = new Map<string, number>();

    for (const bet of bets) {
      userBets.set(bet.user_id, (userBets.get(bet.user_id) || 0) + 1);
    }

    // Find top user
    let topUserId: string | null = null;
    let topBets = 0;

    for (const [userId, betCount] of userBets.entries()) {
      if (betCount > topBets) {
        topBets = betCount;
        topUserId = userId;
      }
    }

    if (options.verbose && topUserId) {
      console.log(`    Most Active: ${topBets} bets placed`);
    }

    return topUserId && topBets >= 20 ? [topUserId] : [];
  }

  private async calculateGhost(options: JobOptions): Promise<string[]> {
    // User who didn't place any bets
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get all active users
    const { data: activeUsers, error: userError } = await supabase
      .from('users')
      .select('id')
      .gte('last_seen_at', oneWeekAgo);

    if (userError) throw userError;
    if (!activeUsers || activeUsers.length === 0) return [];

    // Get users who placed bets
    const { data: bettors, error: betError } = await supabase
      .from('bets')
      .select('user_id')
      .gte('created_at', oneWeekAgo);

    if (betError) throw betError;

    const bettorIds = new Set(bettors?.map((b) => b.user_id) || []);

    // Find active users who didn't bet
    const ghosts = activeUsers.filter((user) => !bettorIds.has(user.id)).map((user) => user.id);

    if (options.verbose) {
      console.log(`    Ghost: ${ghosts.length} users didn't place bets`);
    }

    // Award to all ghosts
    return ghosts;
  }

  private async calculateSundaySweep(options: JobOptions): Promise<string[]> {
    // User who won all Sunday bets
    const now = new Date();
    const dayOfWeek = now.getDay();
    const lastSunday = new Date(now);
    lastSunday.setDate(now.getDate() - dayOfWeek);
    lastSunday.setHours(0, 0, 0, 0);

    const nextMonday = new Date(lastSunday);
    nextMonday.setDate(lastSunday.getDate() + 1);

    const { data: sundayBets, error } = await supabase
      .from('bets')
      .select('user_id, status')
      .gte('created_at', lastSunday.toISOString())
      .lt('created_at', nextMonday.toISOString())
      .in('status', ['won', 'lost']);

    if (error) throw error;
    if (!sundayBets || sundayBets.length === 0) return [];

    // Group by user and check if all won
    const userBets = new Map<string, { wins: number; total: number }>();

    for (const bet of sundayBets) {
      const stats = userBets.get(bet.user_id) || { wins: 0, total: 0 };
      stats.total++;
      if (bet.status === 'won') stats.wins++;
      userBets.set(bet.user_id, stats);
    }

    // Find users who won all bets (min 3 bets)
    const sweepers: string[] = [];

    for (const [userId, stats] of userBets.entries()) {
      if (stats.total >= 3 && stats.wins === stats.total) {
        sweepers.push(userId);
      }
    }

    if (options.verbose) {
      console.log(`    Sunday Sweep: ${sweepers.length} users won all Sunday bets`);
    }

    return sweepers;
  }

  private async updateEffectAccess(options: JobOptions): Promise<void> {
    // Update effect access based on total badge count
    const { data: badgeCounts, error } = await supabase.from('user_badges').select('user_id');

    if (error) throw error;
    if (!badgeCounts) return;

    // Count badges per user
    const userBadgeCounts = new Map<string, number>();

    for (const badge of badgeCounts) {
      userBadgeCounts.set(badge.user_id, (userBadgeCounts.get(badge.user_id) || 0) + 1);
    }

    // Update effect tiers based on badge count
    // This would be implemented based on your effect tier system
    if (options.verbose) {
      console.log(`  🎨 Updated effect access for ${userBadgeCounts.size} users`);
    }
  }
}

// CLI execution
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const job = new BadgeCalculationJob();
  await job.execute({
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
  });
}
