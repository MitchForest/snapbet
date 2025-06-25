import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase/client';
import { Storage, CacheUtils, StorageKeys } from '@/services/storage/storageService';
import { followRequestService } from './followRequestService';

interface FollowState {
  isFollowing: boolean;
  isPending?: boolean; // Always false for now, prepared for private accounts
  isMutual: boolean;
  lastChecked: number;
}

interface FollowCounts {
  followers: number;
  following: number;
}

type FollowChangeCallback = (change: {
  type: 'new_follower' | 'lost_follower' | 'new_following' | 'lost_following';
  userId: string;
}) => void;

type CountChangeCallback = (counts: FollowCounts) => void;

interface FollowChangePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: {
    follower_id?: string;
    following_id?: string;
  };
  old?: {
    follower_id?: string;
    following_id?: string;
  };
}

class FollowService {
  private static instance: FollowService;
  private followStateCache = new Map<string, FollowState>();
  private mutualFollowCache = new Map<string, boolean>();
  private subscriptions = new Map<string, RealtimeChannel>();
  private changeCallbacks = new Map<string, Set<FollowChangeCallback>>();
  private countCallbacks = new Map<string, Set<CountChangeCallback>>();

  // Cache configuration
  private readonly FOLLOW_STATE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MUTUAL_FOLLOW_TTL = 60 * 1000; // 1 minute

  private constructor() {
    // Load cached states from storage on init
    this.loadCachedStates();
  }

  static getInstance(): FollowService {
    if (!this.instance) {
      this.instance = new FollowService();
    }
    return this.instance;
  }

  private async loadCachedStates() {
    // Load follow states from MMKV storage
    const cachedStates = Storage.general.get<Record<string, FollowState>>(
      StorageKeys.SOCIAL.FOLLOW_STATES
    );
    if (cachedStates) {
      Object.entries(cachedStates).forEach(([key, state]: [string, FollowState]) => {
        if (!CacheUtils.isExpired(state.lastChecked, this.FOLLOW_STATE_TTL)) {
          this.followStateCache.set(key, state);
        }
      });
    }
  }

  private persistCachedStates() {
    const states: Record<string, FollowState> = {};
    this.followStateCache.forEach((state, key) => {
      states[key] = state;
    });
    Storage.general.set(StorageKeys.SOCIAL.FOLLOW_STATES, states);
  }

  async getFollowState(targetUserId: string, currentUserId?: string): Promise<FollowState> {
    const userId = currentUserId || (await this.getCurrentUserId());
    if (!userId) {
      return { isFollowing: false, isPending: false, isMutual: false, lastChecked: Date.now() };
    }

    const cacheKey = `${userId}:${targetUserId}`;
    const cached = this.followStateCache.get(cacheKey);

    if (cached && !CacheUtils.isExpired(cached.lastChecked, this.FOLLOW_STATE_TTL)) {
      return cached;
    }

    // Fetch fresh state
    const state = await this.fetchFollowState(userId, targetUserId);
    this.followStateCache.set(cacheKey, state);
    this.persistCachedStates();

    // Subscribe to changes if not already
    this.subscribeToUserFollows(userId);

    return state;
  }

  private async fetchFollowState(userId: string, targetUserId: string): Promise<FollowState> {
    const [{ data: followData }, { data: followBackData }] = await Promise.all([
      supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', userId)
        .eq('following_id', targetUserId)
        .single(),
      supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', targetUserId)
        .eq('following_id', userId)
        .single(),
    ]);

    const isPending = await followRequestService.checkPendingRequest(userId, targetUserId);

    return {
      isFollowing: !!followData,
      isPending,
      isMutual: !!followData && !!followBackData,
      lastChecked: Date.now(),
    };
  }

  async toggleFollow(
    targetUserId: string,
    currentlyFollowing: boolean,
    targetUserIsPrivate: boolean // Argument instead of service call
  ): Promise<{ success: boolean; error?: string; isPending?: boolean }> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'Not authenticated' };
      }

      if (currentlyFollowing) {
        // Unfollow - always direct removal
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', userId)
          .eq('following_id', targetUserId);

        if (error) throw error;

        // Update cache
        const cacheKey = `${userId}:${targetUserId}`;
        this.followStateCache.set(cacheKey, {
          isFollowing: false,
          isPending: false,
          isMutual: false,
          lastChecked: Date.now(),
        });

        this.persistCachedStates();
        return { success: true };
      } else {
        // Follow - check if target is private
        if (targetUserIsPrivate) {
          // Create follow request
          const result = await followRequestService.createFollowRequest(
            targetUserId,
            currentlyFollowing
          );

          if (result.success) {
            // Update cache to show pending
            const cacheKey = `${userId}:${targetUserId}`;
            this.followStateCache.set(cacheKey, {
              isFollowing: false,
              isPending: true,
              isMutual: false,
              lastChecked: Date.now(),
            });
            this.persistCachedStates();
          }

          return { ...result, isPending: true };
        } else {
          // Direct follow for public accounts
          const { error } = await supabase.from('follows').insert({
            follower_id: userId,
            following_id: targetUserId,
          });

          if (error) {
            if (error.code === '23505') {
              return { success: false, error: 'Already following this user' };
            }
            throw error;
          }

          // Update cache
          const cacheKey = `${userId}:${targetUserId}`;
          const previousState = this.followStateCache.get(cacheKey);
          this.followStateCache.set(cacheKey, {
            isFollowing: true,
            isPending: false,
            isMutual: previousState?.isMutual || false,
            lastChecked: Date.now(),
          });

          this.persistCachedStates();
          return { success: true };
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      return { success: false, error: 'Failed to update follow status' };
    }
  }

  async isFollowing(userId: string, targetUserId: string): Promise<boolean> {
    const state = await this.getFollowState(targetUserId, userId);
    return state.isFollowing;
  }

  async createFollow(followerId: string, followingId: string): Promise<void> {
    // Used by follow request service when accepting requests
    await supabase.from('follows').insert({
      follower_id: followerId,
      following_id: followingId,
    });

    // Invalidate caches
    this.invalidateFollowCache(followerId, followingId);
  }

  async removeFollower(followerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'Not authenticated' };
      }

      // For now: direct removal
      const { error } = await supabase
        .from('follows')
        .delete()
        .match({ follower_id: followerId, following_id: userId });

      if (error) throw error;

      // TODO: When follow requests exist, check if this was a request
      // and handle differently

      // Invalidate relevant caches
      this.invalidateFollowCache(followerId, userId);

      return { success: true };
    } catch (error) {
      console.error('Error removing follower:', error);
      return { success: false, error: 'Failed to remove follower' };
    }
  }

  async checkMutualFollows(userIds: string[]): Promise<Map<string, boolean>> {
    const userId = await this.getCurrentUserId();
    if (!userId || userIds.length === 0) {
      return new Map(userIds.map((id) => [id, false]));
    }

    // Check cache first
    const results = new Map<string, boolean>();
    const uncachedIds: string[] = [];

    userIds.forEach((id) => {
      const cacheKey = `mutual:${userId}:${id}`;
      const cached = this.mutualFollowCache.get(cacheKey);
      if (cached !== undefined) {
        results.set(id, cached);
      } else {
        uncachedIds.push(id);
      }
    });

    if (uncachedIds.length === 0) {
      return results;
    }

    // Batch fetch uncached mutual follows
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)
      .in('following_id', uncachedIds);

    const followingSet = new Set(data?.map((f) => f.following_id) || []);

    // Check who follows back
    const { data: followBackData } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId)
      .in('follower_id', uncachedIds);

    const followersSet = new Set(followBackData?.map((f) => f.follower_id) || []);

    // Update results and cache
    uncachedIds.forEach((id) => {
      const isMutual = followingSet.has(id) && followersSet.has(id);
      results.set(id, isMutual);

      const cacheKey = `mutual:${userId}:${id}`;
      this.mutualFollowCache.set(cacheKey, isMutual);

      // Clear cache after TTL
      setTimeout(() => {
        this.mutualFollowCache.delete(cacheKey);
      }, this.MUTUAL_FOLLOW_TTL);
    });

    return results;
  }

  async getFollowCounts(userId: string): Promise<FollowCounts> {
    const [{ count: followers }, { count: following }] = await Promise.all([
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId),
    ]);

    return {
      followers: followers || 0,
      following: following || 0,
    };
  }

  subscribeToUserFollows(
    userId: string,
    callbacks?: {
      onChange?: FollowChangeCallback;
      onCountChange?: CountChangeCallback;
    }
  ) {
    const channelKey = `follows:${userId}`;

    // Store callbacks if provided
    if (callbacks?.onChange) {
      if (!this.changeCallbacks.has(userId)) {
        this.changeCallbacks.set(userId, new Set());
      }
      this.changeCallbacks.get(userId)!.add(callbacks.onChange);
    }

    if (callbacks?.onCountChange) {
      if (!this.countCallbacks.has(userId)) {
        this.countCallbacks.set(userId, new Set());
      }
      this.countCallbacks.get(userId)!.add(callbacks.onCountChange);
    }

    // Reuse existing channel if available
    if (this.subscriptions.has(channelKey)) {
      return () => this.unsubscribeFromUserFollows(userId);
    }

    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `follower_id=eq.${userId}`,
        },
        (payload) => {
          this.handleFollowChange(payload, userId, 'following');
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${userId}`,
        },
        (payload) => {
          this.handleFollowChange(payload, userId, 'follower');
        }
      )
      .subscribe();

    this.subscriptions.set(channelKey, channel);

    return () => this.unsubscribeFromUserFollows(userId);
  }

  private async handleFollowChange(
    payload: FollowChangePayload,
    userId: string,
    type: 'follower' | 'following'
  ) {
    // Invalidate relevant caches
    if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
      const otherUserId =
        type === 'follower'
          ? payload.new?.follower_id || payload.old?.follower_id
          : payload.new?.following_id || payload.old?.following_id;

      if (otherUserId) {
        this.invalidateFollowCache(userId, otherUserId);

        // Notify change callbacks
        const changeType =
          payload.eventType === 'INSERT'
            ? type === 'follower'
              ? 'new_follower'
              : 'new_following'
            : type === 'follower'
              ? 'lost_follower'
              : 'lost_following';

        this.changeCallbacks.get(userId)?.forEach((callback) => {
          callback({ type: changeType, userId: otherUserId });
        });
      }

      // Update counts and notify
      const counts = await this.getFollowCounts(userId);
      this.countCallbacks.get(userId)?.forEach((callback) => {
        callback(counts);
      });
    }
  }

  private unsubscribeFromUserFollows(userId: string) {
    const channelKey = `follows:${userId}`;
    const channel = this.subscriptions.get(channelKey);

    if (channel) {
      supabase.removeChannel(channel);
      this.subscriptions.delete(channelKey);
    }

    // Clean up callbacks
    this.changeCallbacks.delete(userId);
    this.countCallbacks.delete(userId);
  }

  private invalidateFollowCache(userId1: string, userId2: string) {
    // Clear specific follow states
    this.followStateCache.delete(`${userId1}:${userId2}`);
    this.followStateCache.delete(`${userId2}:${userId1}`);

    // Clear mutual follow cache
    this.mutualFollowCache.delete(`mutual:${userId1}:${userId2}`);
    this.mutualFollowCache.delete(`mutual:${userId2}:${userId1}`);
  }

  private async getCurrentUserId(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  }

  // Cleanup method for logout
  cleanup() {
    // Unsubscribe from all channels
    this.subscriptions.forEach((channel, _key) => {
      supabase.removeChannel(channel);
    });
    this.subscriptions.clear();

    // Clear all caches
    this.followStateCache.clear();
    this.mutualFollowCache.clear();
    this.changeCallbacks.clear();
    this.countCallbacks.clear();

    // Clear persisted cache
    Storage.general.delete(StorageKeys.SOCIAL.FOLLOW_STATES);
  }
}

export const followService = FollowService.getInstance();
