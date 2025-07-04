#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '../supabase-client';
import { aiReasoningService, AIReasonContext } from '@/services/ai/aiReasoningService';

/**
 * Smart Notifications Job
 * Runs every 5 minutes to generate AI-powered notifications for users
 * based on their behavioral patterns and similar users' activities
 */
export class SmartNotificationsJob extends BaseJob {
  constructor() {
    super({
      name: 'smart-notifications',
      description: 'Generate AI-powered notifications based on behavioral patterns',
      schedule: '*/5 * * * *', // Every 5 minutes
      timeout: 300000, // 5 minutes
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    this.log('Starting smart notifications job...');
    let processedCount = 0;
    let notificationsCreated = 0;

    try {
      // Get all users with behavioral embeddings
      const { data: users, error } = await supabase
        .from('users')
        .select('id, username, profile_embedding')
        .not('profile_embedding', 'is', null)
        .neq('username', 'system'); // Exclude system user

      if (error) {
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      if (!users || users.length === 0) {
        this.log('No users with behavioral embeddings found');
        return {
          success: true,
          message: 'No users to process',
          affected: 0,
        };
      }

      this.log(`Processing ${users.length} users for smart notifications`);

      // Process users in batches to avoid overwhelming the system
      const batchSize = options.limit || 10;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (user) => {
            try {
              if (options.verbose) {
                this.log(`Generating smart notifications for user ${user.username}`);
              }
              if (user.profile_embedding) {
                const created = await this.generateSmartNotifications(
                  user.id,
                  user.profile_embedding
                );
                notificationsCreated += created;
              }
              processedCount++;
            } catch (error) {
              console.error(`Error processing user ${user.username}:`, error);
            }
          })
        );

        // Small delay between batches
        if (i + batchSize < users.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return {
        success: true,
        message: `Processed ${processedCount} users, created ${notificationsCreated} notifications`,
        affected: notificationsCreated,
      };
    } catch (error) {
      console.error('Smart notifications job failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        affected: processedCount,
      };
    }
  }

  private async generateSmartNotifications(
    userId: string,
    _profileEmbedding: string
  ): Promise<number> {
    let notificationsCreated = 0;

    try {
      // Initialize AI service if needed
      aiReasoningService.initialize(supabase);

      // Get similar users with AI-generated reasons
      const context: AIReasonContext = {
        fromUserId: userId,
        toUserId: userId, // Self-context for notifications
        contextType: 'notification',
      };

      const similarUsers = await aiReasoningService.getSimilarUsersWithReasons(userId, 30, context);

      if (!similarUsers.length) {
        return 0;
      }

      // Check for notification-worthy activities
      const created1 = await this.checkSimilarUserBets(userId, similarUsers);
      const created2 = await this.checkConsensusPatterns(
        userId,
        similarUsers.map((su) => ({ id: su.user.id, username: su.user.username }))
      );

      notificationsCreated = created1 + created2;
    } catch (error) {
      console.error(`Error generating notifications for user ${userId}:`, error);
    }

    return notificationsCreated;
  }

  private async checkSimilarUserBets(
    userId: string,
    similarUsers: Array<{ user: { id: string; username: string }; primaryReason: string }>
  ): Promise<number> {
    let created = 0;
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    // Get recent bets from similar users
    const { data: recentBets } = await supabase
      .from('bets')
      .select(
        `
        *,
        user:users!user_id(username, display_name),
        game:games!game_id(home_team, away_team, sport)
      `
      )
      .in(
        'user_id',
        similarUsers.map((u) => u.user.id)
      )
      .gte('created_at', twoHoursAgo)
      .eq('archived', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!recentBets?.length) return 0;

    // Create notifications for interesting bets with AI-generated reasons
    for (const bet of recentBets.slice(0, 5)) {
      const betDetails = bet.bet_details as { team?: string } | null;
      const team = betDetails?.team || 'selection';
      const message = `${bet.user.username} just placed $${bet.stake / 100} on ${team}`;

      // Find the similar user's primary reason
      const similarUser = similarUsers.find((su) => su.user.id === bet.user_id);
      const aiReason = similarUser?.primaryReason || 'Similar betting style';

      const { error } = await supabase.from('notifications').insert({
        user_id: userId,
        type: 'similar_user_bet',
        data: {
          message,
          betId: bet.id,
          actorId: bet.user_id,
          actorUsername: bet.user.username,
          amount: bet.stake / 100,
          aiReason,
        },
        read: false,
        created_at: new Date().toISOString(),
      });

      if (!error) created++;
    }

    return created;
  }

  private async checkConsensusPatterns(
    userId: string,
    similarUsers: Array<{ id: string; username: string }>
  ): Promise<number> {
    let created = 0;
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    // Get user's recent bets
    const { data: userBets } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', twoHoursAgo)
      .eq('archived', false)
      .limit(5);

    if (!userBets?.length) return 0;

    // For each bet, check if similar users made the same bet
    for (const userBet of userBets.slice(0, 5)) {
      // Check max 5 bets
      const betDetails = userBet.bet_details as { team?: string } | null;
      if (!betDetails?.team) continue;

      // Split the query to avoid type depth issues
      const similarUserIds = similarUsers.map((u) => u.id);
      const { data: matchingBets } = await supabase
        .from('bets')
        .select('*, user:users!user_id(username)')
        .in('user_id', similarUserIds)
        .eq('game_id', userBet.game_id)
        .eq('bet_type', userBet.bet_type)
        .gte('created_at', twoHoursAgo);

      if (matchingBets) {
        // Filter for same team
        const sameTeamBets = matchingBets.filter((bet) => {
          const details = bet.bet_details as { team?: string } | null;
          return details?.team === betDetails.team;
        });

        if (sameTeamBets.length >= 2) {
          const usernames = sameTeamBets.map((b) => b.user.username).slice(0, 3);
          const message =
            sameTeamBets.length === 2
              ? `${usernames.join(' and ')} also bet ${betDetails.team} ${userBet.bet_type}`
              : `${sameTeamBets.length} similar bettors including ${usernames[0]} bet ${betDetails.team}`;

          // Generate varied AI reason based on consensus pattern
          let aiReason = 'Multiple similar bettors on same pick';

          if (sameTeamBets.length >= 5) {
            aiReason = 'Strong behavioral consensus';
          } else if (userBet.bet_type === 'total') {
            aiReason = 'Similar totals preference';
          } else if (userBet.bet_type === 'spread') {
            aiReason = 'Spread consensus pattern';
          } else if (sameTeamBets.length === 2) {
            aiReason = 'Matching betting behavior';
          }

          const { error } = await supabase.from('notifications').insert({
            user_id: userId,
            type: 'behavioral_consensus',
            data: {
              message,
              betId: userBet.id,
              similarUsers: sameTeamBets.map((b) => b.user_id),
              consensusType: 'behavioral',
              matchingBets: sameTeamBets.length,
              aiReason,
            },
            read: false,
            created_at: new Date().toISOString(),
          });

          if (!error) created++;
        }
      }
    }

    return created;
  }
}

// Support direct execution
const isMainModule = process.argv[1] === __filename;
if (isMainModule) {
  const job = new SmartNotificationsJob();
  const options: JobOptions = {
    verbose: true,
    dryRun: process.argv.includes('--dry-run'),
    limit: process.argv.includes('--limit')
      ? parseInt(process.argv[process.argv.indexOf('--limit') + 1])
      : undefined,
  };

  job
    .execute(options)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Job failed:', error);
      process.exit(1);
    });
}
