import { supabase } from '@/services/supabase/client';
import { PostWithType } from '@/types/content';
import { getFollowingIds } from '@/services/api/followUser';
import { Storage, StorageKeys, CacheUtils } from '@/services/storage/storageService';

// Types
export interface FeedCursor {
  timestamp: string;
  id: string;
}

export interface FeedResponse {
  posts: PostWithType[];
  nextCursor: FeedCursor | null;
  hasMore: boolean;
}

interface CachedFeed {
  posts: PostWithType[];
  timestamp: number;
}

// Constants
const POSTS_PER_PAGE = 20;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_FOLLOWING_FOR_REALTIME = 100;

export class FeedService {
  // Get posts from followed users with pagination
  async getFeedPosts(userId: string, cursor?: FeedCursor): Promise<FeedResponse> {
    try {
      // Get following IDs
      const followingIds = await getFollowingIds();

      // Include self in feed
      const userIds = [...followingIds, userId];

      // If no follows, return empty
      if (userIds.length === 0) {
        return { posts: [], nextCursor: null, hasMore: false };
      }

      // Get blocked user IDs to filter out
      const { data: blockedUsers } = await supabase.rpc('get_blocked_user_ids', {
        p_user_id: userId,
      });

      const blockedIds = (blockedUsers || []).map((row) => row.blocked_id);

      // Build query with privacy filter and blocked users filter
      const query = supabase
        .from('posts')
        .select(
          `
          *,
          user:users!user_id (
            id,
            username,
            display_name,
            avatar_url
          ),
          bet:bets!bet_id (*),
          settled_bet:bets!settled_bet_id (*)
        `
        )
        .in('user_id', userIds)
        .is('deleted_at', null)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(POSTS_PER_PAGE + 1); // Get one extra to check hasMore

      // Apply cursor if provided
      if (cursor) {
        query.lt('created_at', cursor.timestamp).not('id', 'eq', cursor.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Type assertion since generated types don't include new columns
      const posts = (data || []) as unknown as PostWithType[];

      // Filter out posts from blocked users and private accounts we don't follow
      // This is a client-side filter as a safety measure
      const visiblePosts = posts.filter((post) => {
        // Filter out blocked users
        if (blockedIds.includes(post.user_id)) {
          return false;
        }

        // Always show own posts
        if (post.user_id === userId) return true;

        // Show posts from users we follow (already filtered by query)
        // or from public accounts
        const userInfo = post.user as { is_private?: boolean };
        return !userInfo?.is_private || followingIds.includes(post.user_id);
      });

      const hasMore = visiblePosts.length > POSTS_PER_PAGE;

      // Remove the extra post if we have more
      if (hasMore) {
        visiblePosts.pop();
      }

      // Determine next cursor
      const nextCursor =
        hasMore && visiblePosts.length > 0
          ? {
              timestamp: visiblePosts[visiblePosts.length - 1].created_at,
              id: visiblePosts[visiblePosts.length - 1].id,
            }
          : null;

      // Cache first page
      if (!cursor) {
        this.cacheFeed(visiblePosts);
      }

      return { posts: visiblePosts, nextCursor, hasMore };
    } catch (error) {
      console.error('Error fetching feed:', error);
      throw error;
    }
  }

  // Get cached feed for instant loading
  getCachedFeed(): PostWithType[] | null {
    const cached = Storage.feed.get<CachedFeed>(StorageKeys.FEED.CACHED_POSTS);

    if (!cached) return null;

    // Check if cache is expired
    if (CacheUtils.isExpired(cached.timestamp, CACHE_TTL)) {
      Storage.feed.delete(StorageKeys.FEED.CACHED_POSTS);
      return null;
    }

    // Filter out expired posts
    const now = new Date().toISOString();
    return cached.posts.filter((post: PostWithType) => post.expires_at > now);
  }

  // Cache feed posts
  private cacheFeed(posts: PostWithType[]): void {
    const cacheData: CachedFeed = {
      posts,
      timestamp: Date.now(),
    };
    Storage.feed.set(StorageKeys.FEED.CACHED_POSTS, cacheData);
  }

  // Clear feed cache
  clearCache(): void {
    Storage.feed.delete(StorageKeys.FEED.CACHED_POSTS);
    Storage.feed.delete(StorageKeys.FEED.CURSOR);
  }

  // Get real-time subscription config
  getRealtimeConfig(followingIds: string[]) {
    // For performance, limit real-time to reasonable number of follows
    if (followingIds.length > MAX_FOLLOWING_FOR_REALTIME) {
      console.warn(`Too many follows (${followingIds.length}) for real-time. Consider polling.`);
      return null;
    }

    return {
      channel: 'feed_posts',
      filter: `user_id=in.(${followingIds.join(',')})`,
    };
  }

  // Validate if a post should be in feed
  shouldShowPost(post: PostWithType): boolean {
    const now = new Date();
    const expiresAt = new Date(post.expires_at);

    // Check if post is expired or deleted
    if (post.deleted_at || expiresAt <= now) {
      return false;
    }

    // Check if post has too many reports (auto-hide)
    if (post.report_count && post.report_count >= 3) {
      return false;
    }

    return true;
  }
}

// Export singleton instance
export const feedService = new FeedService();
