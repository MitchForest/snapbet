import { SupabaseClient } from '@supabase/supabase-js';
import { ragService } from './ragService';
import { EmbeddingMetadata } from './types';
import { Database, Json } from '@/types/database';

type Post = Database['public']['Tables']['posts']['Row'];
type Bet = Database['public']['Tables']['bets']['Row'];
type Game = Database['public']['Tables']['games']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type Reaction = Database['public']['Tables']['reactions']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'];

interface PostWithContent extends Partial<Post> {
  content?: string | null;
}

interface BetWithGame extends Bet {
  game?: Partial<Game>;
}

interface UserWithRelations extends User {
  bets?: BetWithGame[];
  posts?: Post[];
  reactions?: Reaction[];
  comments?: Comment[];
}

interface BettingPatterns {
  sports: string[];
  topTeams: string[];
  betTypes: string[];
  dominantBetType: string;
  betTypePercentage: number;
  avgStake: number;
  winRate: number;
  recentBets: string[];
}

interface SocialPatterns {
  followingCount: number;
  followersCount: number;
  topConnections: string[];
  similarBettorCount: number;
  engagementRate: number;
}

interface EngagementPatterns {
  captionStyle: string;
  tailingRate: number;
  totalEngagements: number;
}

interface TemporalPatterns {
  activeTimeSlots: string;
  peakHours: number[];
}

export class EmbeddingPipeline {
  private static instance: EmbeddingPipeline;
  private supabaseAdmin: SupabaseClient<Database> | null = null;

  private constructor() {}

  static getInstance(): EmbeddingPipeline {
    if (!EmbeddingPipeline.instance) {
      EmbeddingPipeline.instance = new EmbeddingPipeline();
    }
    return EmbeddingPipeline.instance;
  }

  // Initialize with a supabase client
  initialize(supabaseClient: SupabaseClient<Database>) {
    this.supabaseAdmin = supabaseClient;
  }

  private getClient(): SupabaseClient<Database> {
    if (!this.supabaseAdmin) {
      throw new Error(
        'EmbeddingPipeline not initialized. Call initialize() with a Supabase client first.'
      );
    }
    return this.supabaseAdmin;
  }

  async embedPost(postId: string, post: PostWithContent): Promise<void> {
    try {
      // Skip if no content to embed
      if (!post.caption && !post.content) {
        console.log(`Post ${postId} has no content to embed`);
        return;
      }

      // Generate embedding from post content
      const text = post.caption || post.content || '';
      const result = await ragService.generateEmbedding(text);

      // Convert embedding array to string format for pgvector
      const embeddingString = `[${result.embedding.join(',')}]`;

      // Store embedding in database
      const { error } = await this.getClient()
        .from('posts')
        .update({ embedding: embeddingString })
        .eq('id', postId);

      if (error) {
        console.error('Failed to store post embedding:', error);
        return;
      }

      // Track metadata for cost tracking
      await this.trackEmbedding('post', postId, result.tokenCount, result.modelVersion);

      console.log(`Successfully embedded post ${postId}`);
    } catch (error) {
      console.error(`Failed to embed post ${postId}:`, error);
      // Don't throw - this is non-critical background operation
    }
  }

  async embedBet(betId: string, bet: Partial<BetWithGame>): Promise<void> {
    try {
      // Generate text representation of the bet
      const text = this.formatBetForEmbedding(bet);

      if (!text) {
        console.log(`Bet ${betId} has no content to embed`);
        return;
      }

      const result = await ragService.generateEmbedding(text);

      // Convert embedding array to string format for pgvector
      const embeddingString = `[${result.embedding.join(',')}]`;

      // Store embedding in database
      const { error } = await this.getClient()
        .from('bets')
        .update({ embedding: embeddingString })
        .eq('id', betId);

      if (error) {
        console.error('Failed to store bet embedding:', error);
        return;
      }

      // Track metadata
      await this.trackEmbedding('bet', betId, result.tokenCount, result.modelVersion);

      console.log(`Successfully embedded bet ${betId}`);
    } catch (error) {
      console.error(`Failed to embed bet ${betId}:`, error);
    }
  }

  async updateUserProfile(userId: string): Promise<void> {
    try {
      const supabaseAdmin = this.getClient();

      // Get user data to check last update
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('username, last_embedding_update')
        .eq('id', userId)
        .single();

      if (!userData) {
        console.log(`User ${userId} not found`);
        return;
      }

      // Check if user needs early update (20+ new bets since last update)
      if (userData.last_embedding_update) {
        const { data: recentBets } = await supabaseAdmin
          .from('bets')
          .select('id')
          .eq('user_id', userId)
          .gte('created_at', userData.last_embedding_update)
          .limit(21);

        const needsEarlyUpdate = recentBets && recentBets.length > 20;
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const lastUpdate = new Date(userData.last_embedding_update);

        if (!needsEarlyUpdate && lastUpdate > sevenDaysAgo) {
          console.log(`User ${userData.username} embedding is up to date`);
          return; // Skip update
        }
      }

      // Gather ALL behavioral data
      const { data: fullUserData } = await supabaseAdmin
        .from('users')
        .select(
          `
          *,
          bets(*, game:games(*)),
          posts(*),
          reactions(*),
          comments(*)
        `
        )
        .eq('id', userId)
        .single();

      if (!fullUserData || (!fullUserData.bets?.length && !fullUserData.posts?.length)) {
        console.log(`No behavioral data found for user ${userId}`);
        return;
      }

      // Extract behavioral patterns - NO stored preferences
      const bettingPatterns = this.analyzeBettingBehavior(fullUserData.bets || []);
      const socialPatterns = await this.analyzeSocialBehavior(fullUserData, userId);
      const engagementPatterns = this.analyzeEngagement(fullUserData);
      const temporalPatterns = this.analyzeTemporalActivity(fullUserData);
      const bettingStyle = this.categorizeBettingStyle(bettingPatterns);

      // Create rich behavioral text representation (per reviewer guidance)
      const behavioralProfile = `
        ${userData.username} betting behavior:
        - Frequently bets on: ${bettingPatterns.topTeams.join(', ')}
        - Prefers ${bettingPatterns.dominantBetType} bets (${bettingPatterns.betTypePercentage}%)
        - Active during ${temporalPatterns.activeTimeSlots}
        - Average stake: $${bettingPatterns.avgStake}
        - Betting style: ${bettingStyle}
        - Social connections: follows ${socialPatterns.similarBettorCount} similar bettors
        
        DETAILED PATTERNS:
        Total bets: ${fullUserData.bets.length}
        Sports: ${bettingPatterns.sports.join(', ')}
        Win rate: ${bettingPatterns.winRate}%
        Recent activity: ${bettingPatterns.recentBets.join('; ')}
        Engagement rate: ${socialPatterns.engagementRate}%
        Content style: ${engagementPatterns.captionStyle}
      `;

      // Generate embedding
      const result = await ragService.generateEmbedding(behavioralProfile);

      // Convert embedding array to string format for pgvector
      const embeddingString = `[${result.embedding.join(',')}]`;

      // Update ONLY embedding fields - NO team preferences
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          profile_embedding: embeddingString,
          last_embedding_update: new Date().toISOString(),
          // NO favorite_team or favorite_teams updates!
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update user profile embedding:', updateError);
        return;
      }

      // Track metadata for cost tracking
      await this.trackEmbedding('user', userId, result.tokenCount, result.modelVersion);

      console.log(`Successfully updated profile embedding for user ${userData.username}`);

      // Store computed metrics for reuse
      await this.storeUserMetrics(userId, behavioralProfile);
    } catch (error) {
      console.error(`Failed to update user profile ${userId}:`, error);
    }
  }

  async batchUpdateUserProfiles(userIds: string[]): Promise<void> {
    console.log(`Batch updating ${userIds.length} user profiles`);

    // Process in parallel but with a limit to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      await Promise.all(batch.map((userId) => this.updateUserProfile(userId)));
    }

    console.log('Batch user profile update complete');
  }

  private formatBetForEmbedding(bet: Partial<BetWithGame>): string {
    const parts: string[] = [];

    // Add bet type
    if (bet.bet_type) {
      parts.push(`${bet.bet_type} bet`);
    }

    // Add bet details
    if (bet.bet_details) {
      const details = bet.bet_details as Record<string, unknown>;
      if (details.team) parts.push(`on ${details.team}`);
      if (details.line) parts.push(`${details.line}`);
      if (details.odds) parts.push(`at ${details.odds} odds`);
    }

    // Add game context if available
    if (bet.game) {
      parts.push(`${bet.game.sport}`);
      parts.push(`${bet.game.home_team} vs ${bet.game.away_team}`);
    }

    // Add amount if significant
    if (bet.stake && bet.stake > 0) {
      parts.push(`$${bet.stake} wager`);
    }

    return parts.join(' ');
  }

  private analyzeBettingBehavior(bets: BetWithGame[]): BettingPatterns {
    const sports = new Set<string>();
    const teams = new Map<string, number>();
    const betTypes = new Map<string, number>();
    let totalAmount = 0;
    let wins = 0;

    bets.forEach((bet) => {
      // Extract sport from game
      if (bet.game?.sport) sports.add(bet.game.sport);

      // Count team frequency
      const details = bet.bet_details as { team?: string };
      if (details.team) teams.set(details.team, (teams.get(details.team) || 0) + 1);

      // Count bet types
      betTypes.set(bet.bet_type, (betTypes.get(bet.bet_type) || 0) + 1);

      // Track amounts and wins
      totalAmount += bet.stake || 0;
      if (bet.status === 'won') wins++;
    });

    // Get top teams (most frequently bet on)
    const topTeams = Array.from(teams.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([team]) => team);

    // Get dominant bet type
    const betTypeArray = Array.from(betTypes.entries()).sort((a, b) => b[1] - a[1]);
    const dominantBetType = betTypeArray[0]?.[0] || 'spread';
    const dominantCount = betTypeArray[0]?.[1] || 0;
    const betTypePercentage = bets.length > 0 ? Math.round((dominantCount / bets.length) * 100) : 0;

    return {
      sports: Array.from(sports),
      topTeams,
      betTypes: Array.from(betTypes.keys()),
      dominantBetType,
      betTypePercentage,
      avgStake: bets.length > 0 ? Math.round(totalAmount / bets.length) : 0,
      winRate: bets.length > 0 ? Math.round((wins / bets.length) * 100) : 0,
      recentBets: bets.slice(0, 5).map((b) => {
        const details = b.bet_details as { team?: string };
        return `${details.team || 'Unknown'} ${b.bet_type} $${b.stake || 0}`;
      }),
    };
  }

  private async analyzeSocialBehavior(
    userData: UserWithRelations,
    userId: string
  ): Promise<SocialPatterns> {
    const supabaseAdmin = this.getClient();

    // Fetch follows separately
    const { data: following } = await supabaseAdmin
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    const { data: followers } = await supabaseAdmin
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId);

    // Find most interacted with users
    const interactions = new Map<string, number>();
    userData.reactions?.forEach((_r) => {
      // reactions don't have post relation loaded, skip for now
      // In production, would need to join with posts table
    });

    const topConnections = Array.from(interactions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([userId]) => userId);

    // Count how many followed users are similar bettors (simplified for now)
    const similarBettorCount = following?.length || 0; // In future, could analyze their betting patterns

    return {
      followingCount: following?.length || 0,
      followersCount: followers?.length || 0,
      topConnections,
      similarBettorCount,
      engagementRate: this.calculateEngagementRate(userData),
    };
  }

  private analyzeEngagement(userData: UserWithRelations): EngagementPatterns {
    const posts = userData.posts || [];
    const reactions = userData.reactions || [];
    const comments = userData.comments || [];

    // Analyze caption style
    const captions = posts.map((p) => p.caption).filter(Boolean) as string[];
    let captionStyle = 'minimal';
    if (captions.length > 0) {
      const avgLength = captions.reduce((sum, c) => sum + c.length, 0) / captions.length;
      if (avgLength > 100) captionStyle = 'detailed';
      else if (avgLength > 50) captionStyle = 'moderate';
    }

    // Calculate tailing rate (simplified)
    const tailingRate =
      posts.filter((p) => p.post_type === 'pick').length / Math.max(posts.length, 1);

    return {
      captionStyle,
      tailingRate: Math.round(tailingRate * 100),
      totalEngagements: reactions.length + comments.length,
    };
  }

  private analyzeTemporalActivity(userData: UserWithRelations): TemporalPatterns {
    const allActivity = [...(userData.bets || []), ...(userData.posts || [])];

    const hourCounts = new Map<number, number>();

    allActivity.forEach((item) => {
      if (item.created_at) {
        const date = new Date(item.created_at);
        const hour = date.getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      }
    });

    // Find peak hours
    const peakHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => hour);

    // Determine time slots
    const activeTimeSlots = peakHours.map((hour) => {
      if (hour >= 22 || hour <= 2) return 'late night';
      if (hour >= 18 && hour <= 21) return 'primetime';
      if (hour >= 12 && hour <= 17) return 'afternoon';
      if (hour >= 6 && hour <= 11) return 'morning';
      return 'overnight';
    });

    return {
      activeTimeSlots: [...new Set(activeTimeSlots)].join(', '),
      peakHours,
    };
  }

  private categorizeBettingStyle(patterns: BettingPatterns): string {
    if (patterns.avgStake > 100) return 'aggressive';
    if (patterns.avgStake < 25) return 'conservative';
    if (patterns.betTypes.includes('parlay')) return 'risk-taker';
    if (patterns.winRate > 60) return 'sharp';
    return 'balanced';
  }

  private calculateEngagementRate(userData: UserWithRelations): number {
    const posts = userData.posts?.length || 0;
    const reactions = userData.reactions?.length || 0;
    const comments = userData.comments?.length || 0;

    if (posts === 0) return 0;
    return Math.round(((reactions + comments) / posts) * 100);
  }

  private async trackEmbedding(
    entityType: string,
    entityId: string,
    tokenCount: number,
    modelVersion: string
  ): Promise<void> {
    try {
      const metadata: Omit<EmbeddingMetadata, 'id'> = {
        entity_type: entityType as 'post' | 'bet' | 'user',
        entity_id: entityId,
        model_version: modelVersion,
        generated_at: new Date().toISOString(),
        token_count: tokenCount,
      };

      const { error } = await this.getClient().from('embedding_metadata').upsert(metadata, {
        onConflict: 'entity_type,entity_id',
        ignoreDuplicates: false,
      });

      if (error) {
        console.error('Failed to track embedding metadata:', error);
      }
    } catch (error) {
      console.error('Error tracking embedding:', error);
    }
  }

  private async storeUserMetrics(userId: string, behavioralProfile: string): Promise<void> {
    try {
      const supabaseAdmin = this.getClient();

      // Parse metrics from behavioral profile
      const metrics = this.parseBehavioralProfile(behavioralProfile);

      // Store in user_behavioral_metrics table
      const { error } = await supabaseAdmin.from('user_behavioral_metrics').upsert({
        user_id: userId,
        top_teams: metrics.topTeams,
        avg_stake: metrics.avgStake,
        active_hours: metrics.activeHours,
        favorite_sport: metrics.favoriteSport,
        dominant_bet_type: metrics.dominantBetType,
        stake_style: metrics.stakeStyle,
        win_rate: metrics.winRate,
        total_bets: metrics.totalBets,
        betting_patterns: metrics.bettingPatterns,
        last_updated: new Date().toISOString(),
      });

      if (error) {
        console.error('Failed to store user metrics:', error);
      } else {
        console.log(`Stored behavioral metrics for user ${userId}`);
      }
    } catch (error) {
      console.error('Error storing user metrics:', error);
    }
  }

  private parseBehavioralProfile(profile: string): {
    topTeams: string[];
    avgStake: number;
    activeHours: number[];
    favoriteSport: string | null;
    dominantBetType: string | null;
    stakeStyle: string | null;
    winRate: number | null;
    totalBets: number;
    bettingPatterns: Json;
  } {
    // Parse the behavioral profile text to extract metrics
    const metrics = {
      topTeams: [] as string[],
      avgStake: 0,
      activeHours: [] as number[],
      favoriteSport: null as string | null,
      dominantBetType: null as string | null,
      stakeStyle: null as string | null,
      winRate: null as number | null,
      totalBets: 0,
      bettingPatterns: {} as Json,
    };

    // Extract teams
    const teamsMatch = profile.match(/Frequently bets on: ([^\n]+)/);
    if (teamsMatch) {
      metrics.topTeams = teamsMatch[1].split(', ').filter((t) => t.trim());
    }

    // Extract average stake
    const stakeMatch = profile.match(/Average stake: \$(\d+)/);
    if (stakeMatch) {
      metrics.avgStake = parseInt(stakeMatch[1]) * 100; // Convert to cents
    }

    // Extract dominant bet type
    const betTypeMatch = profile.match(/Prefers (\w+) bets/);
    if (betTypeMatch) {
      metrics.dominantBetType = betTypeMatch[1];
    }

    // Extract betting style
    const styleMatch = profile.match(/Betting style: ([^\n]+)/);
    if (styleMatch) {
      metrics.stakeStyle = styleMatch[1].trim();
    }

    // Extract win rate
    const winRateMatch = profile.match(/Win rate: (\d+)%/);
    if (winRateMatch) {
      metrics.winRate = parseInt(winRateMatch[1]) / 100;
    }

    // Extract total bets
    const totalBetsMatch = profile.match(/Total bets: (\d+)/);
    if (totalBetsMatch) {
      metrics.totalBets = parseInt(totalBetsMatch[1]);
    }

    // Extract sports
    const sportsMatch = profile.match(/Sports: ([^\n]+)/);
    if (sportsMatch) {
      const sports = sportsMatch[1].split(', ').filter((s) => s.trim());
      metrics.favoriteSport = sports[0] || null;
    }

    // Extract active hours (simplified - would need temporal patterns)
    const timeMatch = profile.match(/Active during ([^\n]+)/);
    if (timeMatch) {
      const timeSlots = timeMatch[1];
      // Map time slots to hours (simplified)
      if (timeSlots.includes('primetime')) {
        metrics.activeHours = [18, 19, 20, 21];
      } else if (timeSlots.includes('late night')) {
        metrics.activeHours = [22, 23, 0, 1, 2];
      } else if (timeSlots.includes('afternoon')) {
        metrics.activeHours = [12, 13, 14, 15, 16, 17];
      } else {
        metrics.activeHours = [9, 10, 11];
      }
    }

    return metrics;
  }
}

export const embeddingPipeline = EmbeddingPipeline.getInstance();
