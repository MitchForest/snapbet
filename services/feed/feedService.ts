import { supabase } from '@/services/supabase/client';
import { PostWithType } from '@/types/content';
import { getFollowingIds } from '@/services/api/followUser';
import { Storage, StorageKeys, CacheUtils } from '@/services/storage/storageService';
import { withActiveContent } from '@/utils/database/archiveFilter';

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

interface ScoredReason {
  text: string;
  score: number;
  category: 'sport' | 'team' | 'style' | 'stake' | 'time' | 'performance' | 'bet_type';
  specificity: number;
}

interface UserMetrics {
  topTeams: string[];
  avgStake: number;
  activeHours: number[];
  winRate: number | null;
  dominantBetType: string | null;
}

// Constants
const POSTS_PER_PAGE = 20;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_FOLLOWING_FOR_REALTIME = 100;

export class FeedService {
  private readonly FOLLOWING_RATIO = 0.7;
  private readonly DISCOVERY_RATIO = 0.3;

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
      const query = withActiveContent(
        supabase.from('posts').select(
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
    const query = supabase
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
        bets!inner(
          id,
          bet_type,
          bet_details,
          amount,
          potential_payout,
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
      .single();

    // Apply archive filter directly
    const { data, error } = await query.eq('archived', false).is('deleted_at', null);

    if (error) {
      console.error('Error fetching post:', error);
      return null;
    }

    return data as PostWithType;
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
      // Calculate splits
      const followingCount = Math.floor(limit * this.FOLLOWING_RATIO);
      const discoveryCount = limit - followingCount;

      // Get both types of content in parallel
      const [followingResponse, discoveredPosts] = await Promise.all([
        this.getFeedPosts(userId), // Get following posts using existing method
        this.getDiscoveredPosts(userId, discoveryCount * 2),
      ]);

      // Mix the feeds using insertion pattern
      const mixedFeed = this.mixFeeds(
        followingResponse.posts,
        discoveredPosts,
        followingCount,
        discoveryCount
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
      // Get user's behavioral embedding
      const { data: userProfile } = await supabase
        .from('users')
        .select('profile_embedding')
        .eq('id', userId)
        .single();

      if (!userProfile?.profile_embedding) {
        return [];
      }

      // Find behaviorally similar users first
      const { data: similarUsers } = await supabase.rpc('find_similar_users', {
        query_embedding: userProfile.profile_embedding,
        p_user_id: userId,
        limit_count: 20,
      });

      if (!similarUsers?.length) return [];

      // Get recent posts from similar users (not followed)
      const { data: followedUsers } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      const followedIds = followedUsers?.map((f: { following_id: string }) => f.following_id) || [];
      const similarNotFollowed = similarUsers
        .filter((u: { id: string }) => !followedIds.includes(u.id))
        .map((u: { id: string }) => u.id);

      if (!similarNotFollowed.length) return [];

      // Get posts from behaviorally similar users
      const postsQuery = supabase
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
            created_at
          ),
          bets!inner(
            id,
            bet_type,
            bet_details,
            amount,
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
        .order('created_at', { ascending: false })
        .limit(limit * 2); // Get extra for filtering

      // Apply archive filter directly
      const { data: posts } = await postsQuery.eq('archived', false).is('deleted_at', null);

      if (!posts?.length) return [];

      // Score and rank posts based on behavioral relevance
      const scoredPosts = await this.scorePostsForUser(userId, posts as PostWithType[]);

      // Add discovery metadata with behavioral reasons
      return scoredPosts.slice(0, limit).map((scoredPost) => ({
        ...scoredPost.post,
        is_discovered: true,
        discovery_reason: scoredPost.reason,
        relevance_score: scoredPost.score,
      }));
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
    const { data: userBehavior } = await supabase
      .from('users')
      .select(
        `
        bets(bet_type, bet_details, stake, created_at, game:games(sport)),
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
    const userMetrics = this.calculateUserMetrics({
      bets: userBehavior.bets?.map((bet: any) => ({
        bet_type: bet.bet_type,
        bet_details: bet.bet_details,
        stake: bet.stake,
        created_at: bet.created_at,
        status: bet.status || 'pending',
      })),
    });

    // Score each post with specific reasons
    const scoredPosts = await Promise.all(
      posts.map(async (post) => {
        const reasons: ScoredReason[] = [];
        let baseScore = 0.5;

        // Team-based reasons (Score: 100)
        if (
          post.bet?.bet_details &&
          typeof post.bet.bet_details === 'object' &&
          'team' in post.bet.bet_details
        ) {
          const team = post.bet.bet_details.team as string;
          if (userMetrics.topTeams.includes(team)) {
            reasons.push({
              text: `${post.user?.username || 'User'} also bets ${team}`,
              score: 100,
              category: 'team',
              specificity: 0.8,
            });
            baseScore += 0.3;
          }
        }

        // Get post author's metrics for comparison
        const { data: authorBets } = await supabase
          .from('bets')
          .select('stake')
          .eq('user_id', post.user_id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .limit(20);

        if (authorBets) {
          const authorAvgStake = this.calculateAvgStake(authorBets);
          const authorStyle = this.categorizeStakeStyle(authorAvgStake);
          const userStyle = this.categorizeStakeStyle(userMetrics.avgStake);

          // Style-based reasons (Score: 90)
          if (authorStyle === userStyle && authorStyle !== 'varied') {
            reasons.push({
              text: `${authorStyle} bettor like you`,
              score: 90,
              category: 'style',
              specificity: 0.7,
            });
            baseScore += 0.2;
          }
        }

        // Time-based reasons (Score: 85)
        const postHour = new Date(post.created_at).getHours();
        if (userMetrics.activeHours.includes(postHour)) {
          const timePattern = this.getTimePattern(postHour);
          reasons.push({
            text: `${timePattern} bettor`,
            score: 85,
            category: 'time',
            specificity: 0.6,
          });
          baseScore += 0.1;
        }

        // Performance reasons (Score: 80)
        // Note: win_rate would need to be added to the user select query
        // For now, skip this reason since win_rate isn't in the user type

        // Bet type reasons (Score: 60)
        if (post.bet?.bet_type && userMetrics.dominantBetType === post.bet.bet_type) {
          reasons.push({
            text: `Loves ${post.bet.bet_type} bets`,
            score: 60,
            category: 'bet_type',
            specificity: 0.5,
          });
          baseScore += 0.1;
        }

        // Apply scoring adjustments
        reasons.forEach((reason) => {
          // Boost high-specificity reasons
          reason.score *= 1 + reason.specificity * 0.3;

          // Penalize overly common patterns
          if (reason.text.includes('NBA') && reason.category === 'sport') {
            reason.score *= 0.6;
          }
        });

        // Sort by score and get top reason
        const topReason = reasons.sort((a, b) => b.score - a.score)[0];

        return {
          post,
          score: baseScore,
          reason: topReason?.text || 'Suggested for you',
        };
      })
    );

    // Sort by score descending
    return scoredPosts.sort((a, b) => b.score - a.score);
  }

  private calculateUserMetrics(userBehavior: {
    bets?: Array<{
      bet_type: string;
      bet_details: { team?: string } | null;
      stake: number;
      created_at: string;
      status: string;
    }> | null;
  }): UserMetrics {
    const bets = userBehavior.bets || [];

    // Extract top teams
    const teamCounts = new Map<string, number>();
    bets.forEach((bet) => {
      const team =
        bet.bet_details && typeof bet.bet_details === 'object' && 'team' in bet.bet_details
          ? (bet.bet_details.team as string)
          : null;
      if (team) {
        teamCounts.set(team, (teamCounts.get(team) || 0) + 1);
      }
    });
    const topTeams = Array.from(teamCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([team]) => team);

    // Calculate average stake
    const avgStake =
      bets.length > 0 ? bets.reduce((sum, bet) => sum + (bet.stake || 0), 0) / bets.length : 0;

    // Get active hours
    const activeHours = this.getUserActiveHours(bets);

    // Calculate win rate (would need to check bet status)
    const wonBets = bets.filter((bet) => bet.status === 'won').length;
    const settledBets = bets.filter((bet) => ['won', 'lost'].includes(bet.status)).length;
    const winRate = settledBets > 0 ? (wonBets / settledBets) * 100 : null;

    // Get dominant bet type
    const betTypeCounts = new Map<string, number>();
    bets.forEach((bet) => {
      if (bet.bet_type) {
        betTypeCounts.set(bet.bet_type, (betTypeCounts.get(bet.bet_type) || 0) + 1);
      }
    });
    const dominantBetType =
      betTypeCounts.size > 0
        ? Array.from(betTypeCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
        : null;

    return {
      topTeams,
      avgStake,
      activeHours,
      winRate,
      dominantBetType,
    };
  }

  private calculateAvgStake(bets: Array<{ stake: number }>): number {
    if (bets.length === 0) return 0;
    return bets.reduce((sum, bet) => sum + (bet.stake || 0), 0) / bets.length;
  }

  private getUserActiveHours(
    bets: Array<{
      created_at: string;
    }>
  ): number[] {
    const hourCounts = new Map<number, number>();
    bets.forEach((bet) => {
      const hour = new Date(bet.created_at).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    // Get top 6 active hours
    return Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([hour]) => hour);
  }

  private getTimePattern(hour: number): string {
    if (hour >= 22 || hour < 4) return 'Late night';
    if (hour >= 4 && hour < 9) return 'Early morning';
    if (hour >= 9 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 22) return 'Primetime';
    return 'Active';
  }

  private categorizeStakeStyle(avgStakeCents: number): string {
    if (avgStakeCents < 1000) return 'Micro'; // $0-10
    if (avgStakeCents < 2500) return 'Conservative'; // $10-25
    if (avgStakeCents < 5000) return 'Moderate'; // $25-50
    if (avgStakeCents < 10000) return 'Confident'; // $50-100
    return 'Aggressive'; // $100+
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
