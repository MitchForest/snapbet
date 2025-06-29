import { supabase } from '@/services/supabase/client';
import { PostWithType, PostType } from '@/types/content';
import { MediaType, Bet, Game } from '@/types/database-helpers';
import { getFollowingIds } from '@/services/api/followUser';
import { Storage, StorageKeys, CacheUtils } from '@/services/storage/storageService';
import { withActiveContent } from '@/utils/database/archiveFilter';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Json } from '@/types/database';
import { AIReasonScorer, BetWithDetails } from '@/utils/ai/reasonScoring';

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

interface FeedPost extends PostWithType {
  is_discovered?: boolean;
  discovery_reason?: string;
  relevance_score?: number;
}

// Custom type for getPostById query result
interface PostQueryResult {
  id: string;
  user_id: string;
  post_type: string;
  media_url: string;
  media_type: string;
  thumbnail_url: string | null;
  caption: string | null;
  effect_id: string | null;
  bet_id: string | null;
  settled_bet_id: string | null;
  comment_count: number | null;
  tail_count: number | null;
  fade_count: number | null;
  reaction_count: number | null;
  report_count: number | null;
  created_at: string | null;
  expires_at: string;
  deleted_at: string | null;
  archived: boolean | null;
  user: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  reactions: Array<{
    id: string;
    user_id: string;
    reaction_type: string;
  }> | null;
  comments: Array<{
    id: string;
    user_id: string;
    content: string;
    created_at: string | null;
    user: {
      id: string;
      username: string;
      display_name: string | null;
      avatar_url: string | null;
    } | null;
  }> | null;
  bet: {
    id: string;
    bet_type: string;
    bet_details: Json;
    stake: number;
    potential_win: number;
    status: string;
    game: {
      id: string;
      home_team: string;
      away_team: string;
      sport: string;
      start_time: string;
    } | null;
  } | null;
}

// Constants
const POSTS_PER_PAGE = 20;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_FOLLOWING_FOR_REALTIME = 100;

export class FeedService {
  private readonly FOLLOWING_RATIO = 0.7;
  private readonly DISCOVERY_RATIO = 0.3;
  private supabaseClient: SupabaseClient<Database> | null = null;

  initialize(client: SupabaseClient<Database>) {
    this.supabaseClient = client;
  }

  private getClient(): SupabaseClient<Database> {
    if (!this.supabaseClient) {
      // For singleton compatibility, fall back to imported client
      return supabase;
    }
    return this.supabaseClient;
  }

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
      const { data: blockedUsers } = await this.getClient().rpc('get_blocked_user_ids', {
        p_user_id: userId,
      });

      const blockedIds = (blockedUsers || []).map((row) => row.blocked_id);

      // Build query with privacy filter and blocked users filter
      const query = withActiveContent(
        this.getClient()
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
      )
        .in('user_id', userIds)
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

  async getPostById(postId: string): Promise<PostWithType | null> {
    const { data, error } = await this.getClient()
      .from('posts')
      .select(
        `
        *,
        user:users!user_id(
          id,
          username,
          display_name,
          avatar_url
        ),
        reactions(
          id,
          user_id,
          reaction_type
        ),
        comments(
          id,
          user_id,
          content,
          created_at,
          user:users!user_id(
            id,
            username,
            display_name,
            avatar_url
          )
        ),
        bet:bets!bet_id(
          id,
          bet_type,
          bet_details,
          stake,
          potential_win,
          status,
          game:games!game_id(
            id,
            home_team,
            away_team,
            sport,
            start_time
          )
        )
      `
      )
      .eq('id', postId)
      .eq('archived', false)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      return null;
    }

    // Convert PostQueryResult to PostWithType
    const queryResult = data as unknown as PostQueryResult;

    // Map the query result to PostWithType format
    const postWithType: PostWithType = {
      id: queryResult.id,
      user_id: queryResult.user_id,
      post_type: queryResult.post_type as PostType, // Will be validated by PostType enum
      media_url: queryResult.media_url,
      media_type: queryResult.media_type as MediaType,
      thumbnail_url: queryResult.thumbnail_url,
      caption: queryResult.caption,
      effect_id: queryResult.effect_id,
      bet_id: queryResult.bet_id,
      settled_bet_id: queryResult.settled_bet_id,
      comment_count: queryResult.comment_count || 0,
      tail_count: queryResult.tail_count || 0,
      fade_count: queryResult.fade_count || 0,
      reaction_count: queryResult.reaction_count || 0,
      report_count: queryResult.report_count || undefined,
      created_at: queryResult.created_at || new Date().toISOString(),
      expires_at: queryResult.expires_at,
      deleted_at: queryResult.deleted_at,
      user: queryResult.user || undefined,
      bet: queryResult.bet
        ? ({
            ...queryResult.bet,
            // Add required fields that might be missing
            actual_win: null,
            archived: false,
            created_at: null,
            deleted_at: null,
            expires_at: null,
            game_id: queryResult.bet.game?.id || '',
            is_fade: false,
            is_tail: false,
            odds: 0,
            original_pick_id: null,
            settled_at: null,
            user_id: queryResult.user_id,
            game: queryResult.bet.game || undefined,
          } as Bet & { game?: Game })
        : undefined,
    };

    return postWithType;
  }

  /**
   * Get hybrid feed with 70% following, 30% discovered content
   */
  async getHybridFeed(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<FeedResponse> {
    try {
      console.log('[feedService] getHybridFeed called for user:', userId);

      // Calculate splits
      const followingCount = Math.floor(limit * this.FOLLOWING_RATIO);
      const discoveryCount = limit - followingCount;

      console.log(
        '[feedService] Target counts - following:',
        followingCount,
        'discovery:',
        discoveryCount
      );

      // Get both types of content in parallel
      const [followingResponse, discoveredPosts] = await Promise.all([
        this.getFeedPosts(userId), // Get following posts using existing method
        this.getDiscoveredPosts(userId, discoveryCount * 2),
      ]);

      console.log(
        '[feedService] Got posts - following:',
        followingResponse.posts.length,
        'discovered:',
        discoveredPosts.length
      );

      // Mix the feeds using insertion pattern
      const mixedFeed = this.mixFeeds(
        followingResponse.posts,
        discoveredPosts,
        followingCount,
        discoveryCount
      );

      console.log('[feedService] Mixed feed length:', mixedFeed.length);
      console.log(
        '[feedService] AI posts in feed:',
        mixedFeed.filter((p) => p.is_discovered).length
      );

      return {
        posts: mixedFeed.slice(offset, offset + limit),
        nextCursor: followingResponse.nextCursor,
        hasMore: followingResponse.hasMore || discoveredPosts.length > discoveryCount,
      };
    } catch (error) {
      console.error('Error getting hybrid feed:', error);
      // Fallback to following-only feed
      return this.getFeedPosts(userId);
    }
  }

  /**
   * Get AI-recommended posts based on user's behavioral patterns
   */
  private async getDiscoveredPosts(userId: string, limit: number): Promise<FeedPost[]> {
    try {
      console.log('[feedService] getDiscoveredPosts called, limit:', limit);

      // Get user's behavioral embedding
      const { data: userProfile } = await this.getClient()
        .from('users')
        .select('profile_embedding')
        .eq('id', userId)
        .single();

      if (!userProfile?.profile_embedding) {
        console.log('[feedService] No embedding for user');
        return [];
      }

      // Find behaviorally similar users first
      const { data: similarUsers } = await this.getClient().rpc('find_similar_users', {
        query_embedding: userProfile.profile_embedding,
        p_user_id: userId,
        limit_count: 20,
      });

      console.log('[feedService] Similar users found:', similarUsers?.length);

      if (!similarUsers?.length) return [];

      // Get recent posts from similar users (not followed)
      const { data: followedUsers } = await this.getClient()
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      const followedIds = followedUsers?.map((f: { following_id: string }) => f.following_id) || [];
      const similarNotFollowed = similarUsers
        .filter((u: { id: string }) => !followedIds.includes(u.id))
        .map((u: { id: string }) => u.id);

      console.log('[feedService] Followed users:', followedIds.length);
      console.log('[feedService] Similar not followed:', similarNotFollowed.length);

      if (!similarNotFollowed.length) {
        console.log('[feedService] No unfollowed similar users found');
        return [];
      }

      // Get posts from behaviorally similar users
      const { data: posts } = await this.getClient()
        .from('posts')
        .select(
          `
          *,
          user:users!user_id(
            id,
            username,
            display_name,
            avatar_url
          ),
          bet:bets!bet_id(
            id,
            bet_type,
            bet_details,
            stake,
            potential_win,
            status,
            game:games!game_id(
              id,
              sport,
              home_team,
              away_team
            )
          )
        `
        )
        .in('user_id', similarNotFollowed)
        .eq('archived', false)
        .is('deleted_at', null)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(limit * 2);

      console.log('[feedService] Posts from similar users:', posts?.length);

      if (!posts?.length) return [];

      // Score and rank posts based on behavioral relevance
      const scoredPosts = await this.scorePostsForUser(userId, posts as unknown as PostWithType[]);

      console.log('[feedService] Scored posts:', scoredPosts.length);

      // Add discovery metadata with behavioral reasons
      const discoveredPosts = scoredPosts.slice(0, limit).map((scoredPost) => ({
        ...scoredPost.post,
        is_discovered: true,
        discovery_reason: scoredPost.reason,
        relevance_score: scoredPost.score,
      }));

      console.log('[feedService] Returning discovered posts:', discoveredPosts.length);

      return discoveredPosts;
    } catch (error) {
      console.error('Error getting discovered posts:', error);
      return [];
    }
  }

  /**
   * Score posts based on behavioral relevance to user
   */
  private async scorePostsForUser(
    userId: string,
    posts: PostWithType[]
  ): Promise<Array<{ post: PostWithType; score: number; reason: string }>> {
    // Get user's behavioral data for comparison
    const { data: userBehavior } = await this.getClient()
      .from('users')
      .select(
        `
        bets(bet_type, bet_details, stake, created_at, status, game:games(sport)),
        reactions(post_id, reaction_type),
        posts(caption)
      `
      )
      .eq('id', userId)
      .single();

    if (!userBehavior)
      return posts.map((p) => ({
        post: p,
        score: 0.5,
        reason: 'Suggested for you',
      }));

    // Calculate user's behavioral metrics
    const userMetrics = AIReasonScorer.calculateUserMetrics({
      bets: userBehavior.bets?.map((bet) => ({
        bet_type: bet.bet_type,
        bet_details: bet.bet_details as { team?: string } | null,
        stake: bet.stake,
        created_at: bet.created_at || '',
        status: bet.status || 'pending',
        game: bet.game,
      })),
    });

    // Score each post with specific reasons
    const scoredPosts = await Promise.all(
      posts.map(async (post) => {
        let baseScore = 0.5;
        let reason = 'Suggested for you';

        // If no bet, return default
        if (!post.bet) {
          return {
            post,
            score: baseScore,
            reason,
          };
        }

        const betWithDetails: BetWithDetails = {
          ...post.bet,
          created_at: post.bet.created_at || new Date().toISOString(),
          bet_details: post.bet.bet_details as { team?: string } | null,
          game: post.bet.game,
          user: { username: post.user?.username || 'User' },
        };

        // Get reasons using shared scorer
        const reasons = AIReasonScorer.scoreReasons(
          betWithDetails,
          userMetrics,
          post.user?.username || 'User'
        );

        // If we have reasons, use them
        if (reasons.length > 0) {
          reason = AIReasonScorer.getTopReason(reasons);

          // Add score boost based on top reason category
          const topCategory = reasons[0].category;
          if (topCategory === 'team') baseScore += 0.3;
          else if (topCategory === 'style') baseScore += 0.2;
          else if (topCategory === 'time') baseScore += 0.1;
          else if (topCategory === 'sport') baseScore += 0.1;
          else if (topCategory === 'bet_type') baseScore += 0.1;
        } else {
          // Generate varied fallback reasons when no specific matches
          const betStyle = AIReasonScorer.categorizeStakeStyle(post.bet.stake);
          const betHour = post.created_at ? new Date(post.created_at).getHours() : null;
          const timePattern = betHour !== null ? AIReasonScorer.getTimePattern(betHour) : null;
          
          // Create a pool of possible reasons
          const fallbackReasons: string[] = [];
          
          if (betStyle !== 'varied') {
            fallbackReasons.push(`${betStyle} bettor like you`);
          }
          
          if (post.bet.game?.sport) {
            fallbackReasons.push(`${post.bet.game.sport} specialist`);
          }
          
          if (post.bet.bet_type) {
            const betTypeMap: Record<string, string> = {
              'spread': 'Spread betting fan',
              'total': 'Totals expert',
              'moneyline': 'Moneyline player'
            };
            fallbackReasons.push(betTypeMap[post.bet.bet_type] || `Likes ${post.bet.bet_type} bets`);
          }
          
          if (timePattern) {
            fallbackReasons.push(`${timePattern} bettor`);
          }
          
          // Add some variety based on post characteristics
          if (post.bet.stake > 10000) {
            fallbackReasons.push('High stakes player');
          }
          
          if (post.tail_count && post.tail_count > 5) {
            fallbackReasons.push('Popular picks');
          }
          
          // Pick a random reason from available ones
          if (fallbackReasons.length > 0) {
            reason = fallbackReasons[Math.floor(Math.random() * fallbackReasons.length)];
          }
        }

        return {
          post,
          score: baseScore,
          reason,
        };
      })
    );

    // Sort by score descending
    return scoredPosts.sort((a, b) => b.score - a.score);
  }

  /**
   * Mix following and discovered content
   */
  private mixFeeds(
    followingPosts: PostWithType[],
    discoveredPosts: FeedPost[],
    followingTarget: number,
    discoveryTarget: number
  ): FeedPost[] {
    const mixed: FeedPost[] = [];
    let followingIndex = 0;
    let discoveryIndex = 0;

    // Use pattern: 3 following, 1 discovered, repeat
    while (
      mixed.length < followingTarget + discoveryTarget &&
      (followingIndex < followingPosts.length || discoveryIndex < discoveredPosts.length)
    ) {
      // Add 3 following posts
      for (let i = 0; i < 3 && followingIndex < followingPosts.length; i++) {
        mixed.push(followingPosts[followingIndex++]);
      }

      // Add 1 discovered post
      if (discoveryIndex < discoveredPosts.length) {
        mixed.push(discoveredPosts[discoveryIndex++]);
      }
    }

    return mixed;
  }
}

// Export singleton instance
export const feedService = new FeedService();
