import { supabase } from '@/services/supabase/client';
import { calculateUserBadges } from './badgeService';
import { withActiveContent } from '@/utils/database/archiveFilter';

interface BadgeChange {
  userId: string;
  added: string[];
  removed: string[];
}

/**
 * Gets users who have been active in the last N days
 */
export async function getActiveUsers(daysAgo: number = 7): Promise<string[]> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    // Get users who have placed bets recently
    const { data, error } = await withActiveContent(supabase.from('bets').select('user_id'))
      .gte('created_at', cutoffDate.toISOString())
      .order('user_id');

    if (error) {
      console.error('Error fetching active users:', error);
      return [];
    }

    // Get unique user IDs
    const uniqueUserIds = [...new Set(data.map((bet) => bet.user_id))];
    return uniqueUserIds;
  } catch (error) {
    console.error('Error in getActiveUsers:', error);
    return [];
  }
}

/**
 * Gets current badges for a user from the database
 */
export async function getCurrentBadges(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId)
      .is('lost_at', null); // Only active badges

    if (error) {
      console.error('Error fetching current badges:', error);
      return [];
    }

    return data.map((badge) => badge.badge_id);
  } catch (error) {
    console.error('Error in getCurrentBadges:', error);
    return [];
  }
}

/**
 * Updates badge history when badges are added or removed
 */
export async function updateBadgeHistory(
  userId: string,
  added: string[],
  removed: string[]
): Promise<void> {
  try {
    const historyEntries = [
      ...added.map((badgeId) => ({
        user_id: userId,
        badge_id: badgeId,
        action: 'earned' as const,
      })),
      ...removed.map((badgeId) => ({
        user_id: userId,
        badge_id: badgeId,
        action: 'lost' as const,
      })),
    ];

    if (historyEntries.length > 0) {
      const { error } = await supabase.from('badge_history').insert(historyEntries);

      if (error) {
        console.error('Error updating badge history:', error);
      }
    }
  } catch (error) {
    console.error('Error in updateBadgeHistory:', error);
  }
}

/**
 * Updates badges for a single user
 */
export async function updateUserBadges(userId: string): Promise<BadgeChange> {
  try {
    // Get current badges from database
    const currentBadges = await getCurrentBadges(userId);

    // Calculate what badges user should have
    const calculatedBadges = await calculateUserBadges(userId);

    // Determine changes
    const added = calculatedBadges.filter((badge) => !currentBadges.includes(badge));
    const removed = currentBadges.filter((badge) => !calculatedBadges.includes(badge));

    // Update user_badges table
    if (removed.length > 0) {
      // Mark removed badges as lost
      const { error } = await supabase
        .from('user_badges')
        .update({ lost_at: new Date().toISOString() })
        .eq('user_id', userId)
        .in('badge_id', removed)
        .is('lost_at', null);

      if (error) {
        console.error('Error marking badges as lost:', error);
      }
    }

    if (added.length > 0) {
      // Add new badges
      const newBadges = added.map((badgeId) => ({
        user_id: userId,
        badge_id: badgeId,
      }));

      const { error } = await supabase.from('user_badges').insert(newBadges);

      if (error) {
        console.error('Error adding new badges:', error);
      }
    }

    // Update badge history
    if (added.length > 0 || removed.length > 0) {
      await updateBadgeHistory(userId, added, removed);
    }

    return { userId, added, removed };
  } catch (error) {
    console.error('Error updating user badges:', error);
    return { userId, added: [], removed: [] };
  }
}

/**
 * Updates badges for all active users
 */
export async function updateAllUserBadges(): Promise<{
  updated: number;
  errors: number;
  changes: BadgeChange[];
}> {
  console.log('Starting badge update...');
  const startTime = Date.now();

  try {
    // Get active users
    const activeUsers = await getActiveUsers(7);
    console.log(`Found ${activeUsers.length} active users`);

    const changes: BadgeChange[] = [];
    let errors = 0;

    // Update badges for each user
    for (const userId of activeUsers) {
      try {
        const change = await updateUserBadges(userId);
        changes.push(change);

        if (change.added.length > 0 || change.removed.length > 0) {
          console.log(`User ${userId}: +${change.added.length} -${change.removed.length} badges`);
        }
      } catch (error) {
        console.error(`Failed to update badges for ${userId}:`, error);
        errors++;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`Badge update complete in ${duration}ms`);
    console.log(`Updated: ${changes.length}, Errors: ${errors}`);

    return {
      updated: changes.length,
      errors,
      changes,
    };
  } catch (error) {
    console.error('Error in updateAllUserBadges:', error);
    return {
      updated: 0,
      errors: 1,
      changes: [],
    };
  }
}
