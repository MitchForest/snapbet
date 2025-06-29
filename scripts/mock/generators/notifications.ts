#!/usr/bin/env bun

import { supabase } from '../../supabase-client';
import type { Database } from '@/types/database';
import { AIReasonScorer, UserMetrics } from '@/utils/ai/reasonScoring';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type Post = Tables['posts']['Row'];
type Bet = Tables['bets']['Row'] & {
  game?: Tables['games']['Row'];
  bet_details?: { team?: string } | null;
};
type NotificationInsert = Tables['notifications']['Insert'];

function getRandomTimeOffset(minMinutes: number, maxMinutes: number): number {
  return Math.floor(Math.random() * (maxMinutes - minMinutes) + minMinutes) * 60 * 1000;
}

export async function createNotificationsForUser(
  userId: string,
  mockUsers: User[],
  posts: Post[],
  bets: Bet[]
): Promise<void> {
  const notifications: NotificationInsert[] = [];
  const now = Date.now();

  // Calculate user metrics for smart notifications
  const userMetrics = await calculateUserMetricsForNotifications(userId);

  // 1. Regular notifications (70%)
  // Follow notifications
  const followers = mockUsers.slice(0, 3);
  followers.forEach((follower, _index) => {
    notifications.push({
      user_id: userId,
      type: 'follow',
      data: {
        followerId: follower.id,
        followerUsername: follower.username,
        followerAvatarUrl: follower.avatar_url,
      },
      read: false,
      created_at: new Date(now - getRandomTimeOffset(60, 1440)).toISOString(), // 1-24 hours ago
    });
  });

  // Tail/fade notifications
  const pickPosts = posts.filter((p) => p.post_type === 'pick').slice(0, 5);
  pickPosts.forEach((post, index) => {
    const actor = mockUsers[index % mockUsers.length];
    const action = Math.random() > 0.5 ? 'tail' : 'fade';

    notifications.push({
      user_id: userId,
      type: action,
      data: {
        postId: post.id,
        actorId: actor.id,
        actorUsername: actor.username,
        actorAvatarUrl: actor.avatar_url,
        amount: (Math.floor(Math.random() * 50) + 10) * 100,
      },
      read: index > 2, // First 3 unread
      created_at: new Date(now - getRandomTimeOffset(30, 720)).toISOString(), // 30 min - 12 hours
    });
  });

  // 2. Smart notifications (30%) - with varied timestamps
  const smartNotifs = await createSmartNotifications(userId, mockUsers, bets, posts, userMetrics);

  // Mix smart notifications throughout the timeline
  smartNotifs.forEach((notif, _index) => {
    // Spread them out over the last 48 hours
    const timeOffset = getRandomTimeOffset(30, 2880); // 30 min to 48 hours
    notif.created_at = new Date(now - timeOffset).toISOString();
    notifications.push(notif);
  });

  // Sort by created_at descending (newest first)
  notifications.sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });

  // Insert all notifications
  if (notifications.length > 0) {
    const { error } = await supabase.from('notifications').insert(notifications);
    if (error) {
      console.error('Error creating notifications:', error);
    } else {
      console.log(
        `    Created ${notifications.length} notifications (${smartNotifs.length} smart)`
      );
    }
  }
}

async function calculateUserMetricsForNotifications(userId: string): Promise<UserMetrics> {
  const { data: userBehavior } = await supabase
    .from('users')
    .select(
      `
      bets(bet_type, bet_details, stake, created_at, status, game:games(sport))
    `
    )
    .eq('id', userId)
    .single();

  if (!userBehavior?.bets) {
    return {
      topTeams: [],
      avgStake: 2500,
      activeHours: [19, 20, 21],
      favoriteSport: 'NBA',
      dominantBetType: 'spread',
      stakeStyle: 'Moderate',
    };
  }

  return AIReasonScorer.calculateUserMetrics({
    bets: userBehavior.bets.map((bet) => ({
      bet_type: bet.bet_type,
      bet_details: bet.bet_details as { team?: string } | null,
      stake: bet.stake,
      created_at: bet.created_at || '',
      status: bet.status,
      game: bet.game,
    })),
  });
}

async function createSmartNotifications(
  userId: string,
  mockUsers: User[],
  bets: Bet[],
  posts: Post[],
  userMetrics: UserMetrics
): Promise<NotificationInsert[]> {
  const notifications: NotificationInsert[] = [];
  const types = ['similar_user_bet', 'behavioral_consensus', 'smart_alert'];

  // Get recent bets from mock users
  const recentBets = bets.filter((b) => mockUsers.find((u) => u.id === b.user_id)).slice(0, 15);

  // Create varied smart notifications
  recentBets.forEach((bet, index) => {
    const type = types[index % types.length];
    const user = mockUsers.find((u) => u.id === bet.user_id);
    if (!user) return;

    // Find post associated with this bet
    const betPost = posts.find((p) => p.bet_id === bet.id);

    // Score this bet against user metrics
    const betWithDetails = {
      ...bet,
      created_at: bet.created_at || new Date().toISOString(),
      bet_details: bet.bet_details as { team?: string } | null,
      game: bet.game,
      user: { username: user.username || 'User' },
    };

    const reasons = AIReasonScorer.scoreReasons(
      betWithDetails,
      userMetrics,
      user.username || 'User'
    );

    const topReason = AIReasonScorer.getTopReason(reasons);

    if (type === 'similar_user_bet') {
      notifications.push({
        user_id: userId,
        type,
        data: {
          message: `${user.username} just placed $${bet.stake / 100} on ${bet.bet_details?.team || 'selection'}`,
          betId: bet.id,
          postId: betPost?.id,
          actorId: user.id,
          actorUsername: user.username,
          amount: bet.stake,
          aiReason: topReason,
        },
        read: false,
      });
    } else if (type === 'behavioral_consensus' && index % 3 === 0) {
      // Create consensus notifications less frequently
      const consensusUsers = mockUsers.slice(index, index + 3);
      notifications.push({
        user_id: userId,
        type,
        data: {
          message: `${consensusUsers.length} similar bettors including ${consensusUsers[0].username} bet ${bet.bet_details?.team || 'the same'}`,
          betId: bet.id,
          postId: betPost?.id,
          similarUsers: consensusUsers.map((u) => u.id),
          consensusType: 'behavioral',
          matchingBets: consensusUsers.length,
          aiReason: topReason,
        },
        read: false,
      });
    } else if (type === 'smart_alert' && index % 4 === 0) {
      // Smart alerts even less frequently
      notifications.push({
        user_id: userId,
        type,
        data: {
          message: `Trending pick: ${bet.bet_details?.team || 'selection'} getting heavy action`,
          postId: betPost?.id,
          aiReason: topReason,
        },
        read: false,
      });
    }
  });

  // Return max 10 smart notifications with good variety
  return notifications.slice(0, 10);
}
