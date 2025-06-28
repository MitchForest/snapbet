#!/usr/bin/env bun

import { supabase } from '../../supabase-client';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];

export async function createNotificationsForUser(userId: string, mockUsers: User[]) {
  console.log('\n🔔 Creating notifications...');

  const notifications = [];
  const now = new Date();

  // Get some random mock users for notifications
  const shuffledUsers = [...mockUsers].sort(() => Math.random() - 0.5);

  // 1. Follow notifications (3-5)
  const followCount = Math.floor(Math.random() * 3) + 3;
  for (let i = 0; i < followCount && i < shuffledUsers.length; i++) {
    const follower = shuffledUsers[i];
    const isRead = Math.random() > 0.3; // 70% read
    const createdAt = new Date(now.getTime() - Math.random() * 48 * 60 * 60 * 1000);

    notifications.push({
      id: crypto.randomUUID(),
      user_id: userId,
      type: 'follow' as const,
      data: {
        followerId: follower.id,
        followerUsername: follower.username,
        followerAvatarUrl: follower.avatar_url,
      },
      read: isRead,
      created_at: createdAt.toISOString(),
      read_at: isRead
        ? new Date(createdAt.getTime() + Math.random() * 60 * 60 * 1000).toISOString()
        : null, // Read within an hour
    });
  }

  // 2. Tail/Fade notifications (2-4)
  const tailFadeCount = Math.floor(Math.random() * 3) + 2;
  for (let i = 0; i < tailFadeCount && i < shuffledUsers.length - followCount; i++) {
    const actor = shuffledUsers[followCount + i];
    const isTail = Math.random() > 0.5;
    const isRead = Math.random() > 0.5; // 50% read
    const createdAt = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);

    notifications.push({
      id: crypto.randomUUID(),
      user_id: userId,
      type: isTail ? 'tail' : ('fade' as const),
      data: {
        actorId: actor.id,
        actorUsername: actor.username,
        actorAvatarUrl: actor.avatar_url,
        amount: [10, 20, 50, 100][Math.floor(Math.random() * 4)],
        postId: crypto.randomUUID(),
      },
      read: isRead,
      created_at: createdAt.toISOString(),
      read_at: isRead
        ? new Date(createdAt.getTime() + Math.random() * 60 * 60 * 1000).toISOString()
        : null,
    });
  }

  // 3. Bet outcome notifications (2-3)
  const betOutcomeCount = Math.floor(Math.random() * 2) + 2;
  for (let i = 0; i < betOutcomeCount; i++) {
    const isWin = Math.random() > 0.5;
    const isRead = Math.random() > 0.2; // 80% read
    const createdAt = new Date(now.getTime() - Math.random() * 72 * 60 * 60 * 1000);

    notifications.push({
      id: crypto.randomUUID(),
      user_id: userId,
      type: isWin ? 'bet_won' : ('bet_lost' as const),
      data: {
        betId: crypto.randomUUID(),
        amount: [20, 50, 100, 200][Math.floor(Math.random() * 4)],
        gameInfo: {
          teams: 'Lakers vs Celtics',
          betType: 'spread',
        },
      },
      read: isRead,
      created_at: createdAt.toISOString(),
      read_at: isRead
        ? new Date(createdAt.getTime() + Math.random() * 60 * 60 * 1000).toISOString()
        : null,
    });
  }

  // 4. Milestone notification (1 if user is new)
  notifications.push({
    id: crypto.randomUUID(),
    user_id: userId,
    type: 'milestone' as const,
    data: {
      badgeId: 'rising_star',
      badgeName: 'Rising Star',
      achievement: 'Welcome to Snapbet!',
    },
    read: false, // Always unread
    created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read_at: null,
  });

  // Insert notifications
  if (notifications.length > 0) {
    const { error } = await supabase.from('notifications').insert(notifications);
    if (error) {
      console.error('Error creating notifications:', error);
    } else {
      console.log(`  ✅ Created ${notifications.length} notifications`);
    }
  }

  return notifications;
}
