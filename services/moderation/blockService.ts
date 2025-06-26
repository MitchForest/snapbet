import { supabase } from '@/services/supabase/client';
import { Storage } from '@/services/storage/storageService';
import { eventEmitter, ModerationEvents } from '@/utils/eventEmitter';

// Types (will be generated after migration)
export interface BlockedUser {
  blocked_id: string;
  created_at: string | null;
  user: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

// Storage keys for blocked users
const BLOCKED_USERS_KEY = 'blocked_users';
const BLOCKED_IDS_KEY = 'blocked_user_ids';

export class BlockService {
  /**
   * Block a user
   */
  async blockUser(targetUserId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Can't block yourself
      if (user.id === targetUserId) {
        return { success: false, error: "You can't block yourself" };
      }

      // Check if already blocked
      const { data: existing } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('blocker_id', user.id)
        .eq('blocked_id', targetUserId)
        .single();

      if (existing) {
        return { success: false, error: 'User already blocked' };
      }

      // Create block
      const { error } = await supabase.from('blocked_users').insert({
        blocker_id: user.id,
        blocked_id: targetUserId,
      });

      if (error) throw error;

      // Update local cache
      const cachedIds = Storage.general.get<string[]>(BLOCKED_IDS_KEY) || [];
      Storage.general.set(BLOCKED_IDS_KEY, [...cachedIds, targetUserId]);

      // Emit event
      eventEmitter.emit(ModerationEvents.USER_BLOCKED, {
        userId: targetUserId,
        blockedBy: user.id,
      });

      return { success: true };
    } catch (error) {
      console.error('Error blocking user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to block user',
      };
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(targetUserId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', targetUserId);

      if (error) throw error;

      // Update local cache
      const cachedIds = Storage.general.get<string[]>(BLOCKED_IDS_KEY) || [];
      Storage.general.set(
        BLOCKED_IDS_KEY,
        cachedIds.filter((id: string) => id !== targetUserId)
      );

      // Emit event
      eventEmitter.emit(ModerationEvents.USER_UNBLOCKED, {
        userId: targetUserId,
        unblockedBy: user.id,
      });

      return { success: true };
    } catch (error) {
      console.error('Error unblocking user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unblock user',
      };
    }
  }

  /**
   * Get list of blocked users
   */
  async getBlockedUsers(): Promise<{ users: BlockedUser[]; error?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('blocked_users')
        .select(
          `
          blocked_id,
          created_at,
          user:users!blocked_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `
        )
        .eq('blocker_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { users: data || [] };
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      return {
        users: [],
        error: error instanceof Error ? error.message : 'Failed to fetch blocked users',
      };
    }
  }

  /**
   * Get list of blocked user IDs (cached for performance)
   */
  async getBlockedUserIds(): Promise<string[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      // Check cache first
      const cached = Storage.general.get<string[]>(BLOCKED_IDS_KEY);
      if (cached) return cached;

      // Fetch from database
      const { data } = await supabase.rpc('get_blocked_user_ids', {
        p_user_id: user.id,
      });

      const ids = (data || []).map((row) => row.blocked_id);

      // Cache for performance
      Storage.general.set(BLOCKED_IDS_KEY, ids);

      return ids;
    } catch (error) {
      console.error('Error fetching blocked user IDs:', error);
      return [];
    }
  }

  /**
   * Check if a user is blocked
   */
  async isUserBlocked(targetUserId: string): Promise<boolean> {
    const blockedIds = await this.getBlockedUserIds();
    return blockedIds.includes(targetUserId);
  }

  /**
   * Clear cached blocked user IDs
   */
  clearCache(): void {
    Storage.general.delete(BLOCKED_IDS_KEY);
    Storage.general.delete(BLOCKED_USERS_KEY);
  }
}

// Export singleton instance
export const blockService = new BlockService();
