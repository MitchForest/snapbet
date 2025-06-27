#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '@/services/supabase/client';

export class NotificationJob extends BaseJob {
  constructor() {
    super({
      name: 'notifications',
      description:
        'Send timely notifications for game starts, bet outcomes, and content expiration',
      schedule: '*/5 * * * *', // Every 5 minutes
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    let totalSent = 0;
    const details: Record<string, number> = {};

    // 1. Game start notifications (15 minutes before)
    const gameStartNotifications = await this.sendGameStartNotifications(options);
    totalSent += gameStartNotifications;
    details.gameStarts = gameStartNotifications;

    // 2. Bet outcome notifications
    const betOutcomeNotifications = await this.sendBetOutcomeNotifications(options);
    totalSent += betOutcomeNotifications;
    details.betOutcomes = betOutcomeNotifications;

    // 3. Content expiration warnings (1 hour before)
    const expirationWarnings = await this.sendExpirationWarnings(options);
    totalSent += expirationWarnings;
    details.expirationWarnings = expirationWarnings;

    // 4. Weekly recap notifications (Monday mornings)
    const weeklyRecaps = await this.sendWeeklyRecaps(options);
    totalSent += weeklyRecaps;
    details.weeklyRecaps = weeklyRecaps;

    return {
      success: true,
      message: `Sent ${totalSent} notifications`,
      affected: totalSent,
      details,
    };
  }

  private async sendGameStartNotifications(_options: JobOptions): Promise<number> {
    this.log('Checking for games starting in 30 minutes...');

    const { data: upcomingGames } = await supabase
      .from('games')
      .select('id, home_team, away_team, commence_time')
      .eq('status', 'scheduled')
      .gte('commence_time', new Date().toISOString())
      .lte('commence_time', new Date(Date.now() + 30 * 60 * 1000).toISOString());

    if (!upcomingGames?.length) {
      this.log('No games starting soon');
      return 0;
    }

    // Get users with bets on these games
    const gameIds = upcomingGames.map((g: { id: string }) => g.id);
    const { data: userBets } = await supabase
      .from('bets')
      .select('user_id, game_id')
      .in('game_id', gameIds)
      .eq('status', 'pending');

    if (!userBets?.length) return 0;

    // Group by user
    const userGames = userBets.reduce((acc: Record<string, string[]>, bet) => {
      if (!acc[bet.user_id]) acc[bet.user_id] = [];
      acc[bet.user_id].push(bet.game_id);
      return acc;
    }, {});

    // Create notifications
    const notifications = Object.entries(userGames).map(([userId, userGameIds]) => {
      const games = upcomingGames.filter((g: { id: string }) => userGameIds.includes(g.id));
      const gameList = games
        .map((g: { home_team: string; away_team: string }) => `${g.home_team} vs ${g.away_team}`)
        .join(', ');

      return {
        user_id: userId,
        type: 'game_start',
        title: 'Games Starting Soon!',
        message: `Your games are starting in 30 minutes: ${gameList}`,
        data: { game_ids: userGameIds },
      };
    });

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
      this.log(`Sent ${notifications.length} game start notifications`);
    }

    return notifications.length;
  }

  private async sendBetOutcomeNotifications(_options: JobOptions): Promise<number> {
    this.log('Checking for settled bets to notify...');

    // Get recently settled bets
    const { data: settledBets } = await supabase
      .from('bets')
      .select(
        `
        id, user_id, stake, potential_win, status,
        games!inner(home_team, away_team, home_score, away_score)
      `
      )
      .in('status', ['won', 'lost', 'push'])
      .gte('settled_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour

    if (!settledBets?.length) {
      this.log('No settled bets to notify');
      return 0;
    }

    // Create notifications
    const notifications = settledBets.map((bet) => {
      const game = bet.games;
      let title = '';
      let message = '';

      switch (bet.status) {
        case 'won':
          title = '🎉 Winner!';
          message = `You won $${(bet.potential_win / 100).toFixed(2)} on ${game.home_team} vs ${game.away_team} (${game.home_score}-${game.away_score})`;
          break;
        case 'lost':
          title = '😔 Better luck next time';
          message = `Your $${(bet.stake / 100).toFixed(2)} bet on ${game.home_team} vs ${game.away_team} didn't hit (${game.home_score}-${game.away_score})`;
          break;
        case 'push':
          title = '🤝 Push';
          message = `Your $${(bet.stake / 100).toFixed(2)} bet on ${game.home_team} vs ${game.away_team} was refunded`;
          break;
      }

      return {
        user_id: bet.user_id,
        type: 'bet_outcome',
        title,
        message,
        data: { bet_id: bet.id },
      };
    });

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
      this.log(`Sent ${notifications.length} bet outcome notifications`);
    }

    return notifications.length;
  }

  private async sendExpirationWarnings(_options: JobOptions): Promise<number> {
    this.log('Checking for content expiring soon...');

    // Check posts expiring in 1 hour
    const { data: expiringPosts } = await supabase
      .from('posts')
      .select('id, user_id, caption')
      .gte('created_at', new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString())
      .lte('created_at', new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString());

    if (!expiringPosts?.length) {
      this.log('No posts expiring soon');
      return 0;
    }

    const notifications = expiringPosts.map((post) => ({
      user_id: post.user_id,
      type: 'content_expiring',
      title: '⏰ Post Expiring Soon',
      message: `Your post "${(post.caption || 'post').substring(0, 50)}..." will expire in 1 hour`,
      data: { post_id: post.id },
    }));

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
      this.log(`Sent ${notifications.length} content expiration warnings`);
    }

    return notifications.length;
  }

  private async sendWeeklyRecaps(options: JobOptions): Promise<number> {
    // Only run on Monday mornings
    const now = new Date();
    if (now.getDay() !== 1 || now.getHours() !== 9) return 0;

    // Get users who were active last week
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data: activeUsers, error } = await supabase
      .from('bets')
      .select('user_id')
      .gte('created_at', oneWeekAgo.toISOString())
      .lte('created_at', now.toISOString());

    if (error) throw error;
    if (!activeUsers || activeUsers.length === 0) return 0;

    const uniqueUserIds = [...new Set(activeUsers.map((b) => b.user_id))];

    // Check for existing weekly recaps sent today
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const { data: existingRecaps } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('type', 'weekly_recap')
      .gte('created_at', todayStart.toISOString());

    const sentUserIds = new Set(existingRecaps?.map((n) => n.user_id) || []);
    const newRecipients = uniqueUserIds.filter((id) => !sentUserIds.has(id));

    if (options.dryRun) {
      if (options.verbose) {
        console.log(`  📊 Would send ${newRecipients.length} weekly recap notifications`);
      }
      return newRecipients.length;
    }

    // Get stats for each user
    const notifications = [];

    for (const userId of newRecipients) {
      const { data: userStats } = await supabase
        .from('bankrolls')
        .select('win_count, loss_count, total_wagered, total_won')
        .eq('user_id', userId)
        .single();

      if (!userStats) continue;

      const winRate =
        userStats.win_count + userStats.loss_count > 0
          ? ((userStats.win_count / (userStats.win_count + userStats.loss_count)) * 100).toFixed(1)
          : '0.0';

      const profit = userStats.total_won - userStats.total_wagered;

      notifications.push({
        user_id: userId,
        type: 'weekly_recap',
        data: {
          message: `Your week: ${winRate}% win rate, ${profit >= 0 ? '+' : ''}$${(profit / 100).toFixed(2)}. Ready for another week? 💪`,
          action: 'view_profile',
          stats: {
            winRate,
            profit,
            wins: userStats.win_count,
            losses: userStats.loss_count,
          },
        },
        read: false,
      });
    }

    if (notifications.length === 0) return 0;

    const { error: insertError } = await supabase.from('notifications').insert(notifications);

    if (insertError) throw insertError;

    if (options.verbose) {
      console.log(`  📊 Sent ${notifications.length} weekly recap notifications`);
    }

    return notifications.length;
  }
}

// CLI execution
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const job = new NotificationJob();
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
