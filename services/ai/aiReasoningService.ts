import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { AIReasonScorer, BetWithDetails, UserMetrics } from '@/utils/ai/reasonScoring';

export interface AIUserProfile {
  id: string;
  username: string;
  profile_embedding: string | null;
  metrics: UserMetrics;
  lastUpdated: string;
}

export interface AISimilarUser {
  user: AIUserProfile;
  similarity: number;
  reasons: string[];
  primaryReason: string;
}

export interface AIReasonContext {
  fromUserId: string;
  toUserId: string;
  contextType: 'discovery' | 'notification' | 'feed';
  additionalData?: Record<string, unknown>;
}

class AIReasoningService {
  private static instance: AIReasoningService;
  private supabase: SupabaseClient<Database> | null = null;
  private metricsCache = new Map<string, { metrics: UserMetrics; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): AIReasoningService {
    if (!AIReasoningService.instance) {
      AIReasoningService.instance = new AIReasoningService();
    }
    return AIReasoningService.instance;
  }

  initialize(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  /**
   * Get similar users with consistent reasoning across all features
   */
  async getSimilarUsersWithReasons(
    userId: string,
    limit: number = 20,
    context: AIReasonContext
  ): Promise<AISimilarUser[]> {
    if (!this.supabase) throw new Error('Service not initialized');

    // Get user's embedding
    const { data: user } = await this.supabase
      .from('users')
      .select('profile_embedding')
      .eq('id', userId)
      .single();

    if (!user?.profile_embedding) return [];

    // Find similar users
    const { data: similarUsers } = await this.supabase.rpc('find_similar_users', {
      query_embedding: user.profile_embedding,
      p_user_id: userId,
      limit_count: limit,
    });

    if (!similarUsers) return [];

    // Get current user's metrics for comparison
    const currentUserMetrics = await this.getUserMetrics(userId);

    // Process each similar user
    const results = await Promise.all(
      similarUsers.map(async (similarUser) => {
        const targetMetrics = await this.getUserMetrics(similarUser.id);
        const reasons = await this.generateReasons(
          currentUserMetrics,
          targetMetrics,
          similarUser.username,
          context
        );

        return {
          user: {
            id: similarUser.id,
            username: similarUser.username,
            profile_embedding: null, // Don't send embeddings to client
            metrics: targetMetrics,
            lastUpdated: new Date().toISOString(),
          },
          similarity: similarUser.similarity,
          reasons: reasons.slice(0, 3),
          primaryReason: reasons[0] || 'Similar betting style',
        };
      })
    );

    return results;
  }

  /**
   * Get or compute user metrics with caching
   */
  async getUserMetrics(userId: string): Promise<UserMetrics> {
    // Check cache first
    const cached = this.metricsCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.metrics;
    }

    if (!this.supabase) throw new Error('Service not initialized');

    // Try to get pre-computed metrics
    const { data: storedMetrics } = await this.supabase
      .from('user_behavioral_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (
      storedMetrics &&
      storedMetrics.last_updated &&
      this.isMetricsRecent(storedMetrics.last_updated)
    ) {
      const metrics: UserMetrics = {
        topTeams: (storedMetrics.top_teams as string[]) || [],
        avgStake: storedMetrics.avg_stake || 0,
        activeHours: storedMetrics.active_hours || [],
        favoriteSport: storedMetrics.favorite_sport || undefined,
        dominantBetType: storedMetrics.dominant_bet_type || undefined,
        stakeStyle: storedMetrics.stake_style || undefined,
        winRate: storedMetrics.win_rate,
      };

      this.metricsCache.set(userId, { metrics, timestamp: Date.now() });
      return metrics;
    }

    // Fallback: compute metrics on the fly
    const { data: bets } = await this.supabase
      .from('bets')
      .select('bet_type, bet_details, stake, created_at, status, game:games(sport)')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    const metrics = AIReasonScorer.calculateUserMetrics({
      bets: (bets || []).map((bet) => ({
        bet_type: bet.bet_type,
        bet_details: bet.bet_details as { team?: string } | null,
        stake: bet.stake,
        created_at: bet.created_at || new Date().toISOString(),
        status: bet.status,
        game: bet.game,
      })),
    });

    // Cache the computed metrics
    this.metricsCache.set(userId, { metrics, timestamp: Date.now() });

    // Store for future use (async, don't wait)
    this.storeMetrics(userId, metrics);

    return metrics;
  }

  /**
   * Generate contextual reasons based on user comparison
   */
  private async generateReasons(
    currentUserMetrics: UserMetrics,
    targetUserMetrics: UserMetrics,
    targetUsername: string,
    context: AIReasonContext
  ): Promise<string[]> {
    const reasons: string[] = [];

    // For notifications and feed, focus on what matches the current user
    if (context.contextType === 'notification' || context.contextType === 'feed') {
      // Team matches
      const commonTeams = currentUserMetrics.topTeams.filter((team) =>
        targetUserMetrics.topTeams.includes(team)
      );
      if (commonTeams.length > 0) {
        reasons.push(`Both bet ${commonTeams[0]}`);
      }

      // Stake style match
      if (
        currentUserMetrics.stakeStyle === targetUserMetrics.stakeStyle &&
        currentUserMetrics.stakeStyle !== 'varied' &&
        currentUserMetrics.stakeStyle
      ) {
        const stakeStyle =
          currentUserMetrics.stakeStyle.charAt(0).toUpperCase() +
          currentUserMetrics.stakeStyle.slice(1);
        reasons.push(`${stakeStyle} bettor like you`);
      }

      // Sport match
      if (
        currentUserMetrics.favoriteSport === targetUserMetrics.favoriteSport &&
        currentUserMetrics.favoriteSport
      ) {
        const sport = AIReasonScorer.formatSportName(currentUserMetrics.favoriteSport);
        reasons.push(`${sport} specialist`);
      }

      // Time pattern match
      const commonHours = currentUserMetrics.activeHours.filter((hour) =>
        targetUserMetrics.activeHours.includes(hour)
      );
      if (commonHours.length >= 3) {
        const timePattern = AIReasonScorer.getTimePattern(commonHours[0]);
        const capitalizedPattern = timePattern.charAt(0).toUpperCase() + timePattern.slice(1);
        reasons.push(`${capitalizedPattern} bettor`);
      }
    }
    // For discovery (Find Your Tribe), focus on target user's characteristics
    else if (context.contextType === 'discovery') {
      // Specific teams they bet
      if (targetUserMetrics.topTeams.length > 0) {
        const teams = targetUserMetrics.topTeams.slice(0, 2).join(' & ');
        reasons.push(`Bets ${teams}`);
      }

      // Their stake style
      if (targetUserMetrics.stakeStyle && targetUserMetrics.avgStake > 0) {
        const avgDollars = Math.round(targetUserMetrics.avgStake / 100);
        const stakeStyle =
          targetUserMetrics.stakeStyle.charAt(0).toUpperCase() +
          targetUserMetrics.stakeStyle.slice(1);
        reasons.push(`${stakeStyle} bettor ($${avgDollars} avg)`);
      }

      // Their dominant bet type
      if (targetUserMetrics.dominantBetType) {
        const betTypeMap: Record<string, string> = {
          spread: 'Spread specialist',
          total: 'Totals expert',
          moneyline: 'Moneyline player',
        };
        reasons.push(
          betTypeMap[targetUserMetrics.dominantBetType] ||
            `Prefers ${targetUserMetrics.dominantBetType}`
        );
      }

      // Performance
      if (targetUserMetrics.winRate && targetUserMetrics.winRate > 0.6) {
        reasons.push(`Crushing at ${Math.round(targetUserMetrics.winRate * 100)}%`);
      }
    }

    // Fallback reasons if none generated
    if (reasons.length === 0) {
      reasons.push('Similar betting style');
      if (targetUserMetrics.favoriteSport) {
        const sport = AIReasonScorer.formatSportName(targetUserMetrics.favoriteSport);
        reasons.push(`${sport} bettor`);
      }
    }

    return reasons;
  }

  /**
   * Score a single bet/post against user metrics
   */
  async scoreBetForUser(
    userId: string,
    bet: BetWithDetails,
    authorUsername: string
  ): Promise<{ score: number; reason: string }> {
    const userMetrics = await this.getUserMetrics(userId);
    const reasons = AIReasonScorer.scoreReasons(bet, userMetrics, authorUsername);

    if (reasons.length > 0) {
      return {
        score: reasons[0].score / 100, // Normalize to 0-1
        reason: AIReasonScorer.getTopReason(reasons),
      };
    }

    // Generate fallback reason from bet data
    let fallbackReason = 'Suggested for you';
    if (bet.bet_details?.team && bet.game && userMetrics.favoriteSport === bet.game.sport) {
      const sport = AIReasonScorer.formatSportName(bet.game.sport);
      fallbackReason = `${sport} pick`;
    } else if (bet.bet_type === userMetrics.dominantBetType) {
      const betType = bet.bet_type.charAt(0).toUpperCase() + bet.bet_type.slice(1);
      fallbackReason = `${betType} bet like yours`;
    } else if (AIReasonScorer.categorizeStakeStyle(bet.stake) === userMetrics.stakeStyle) {
      fallbackReason = `${userMetrics.stakeStyle} stake`;
    }

    return {
      score: 0.5,
      reason: fallbackReason,
    };
  }

  private isMetricsRecent(lastUpdated: string): boolean {
    const hoursSinceUpdate = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60);
    return hoursSinceUpdate < 24; // Consider fresh if less than 24 hours old
  }

  private async storeMetrics(userId: string, metrics: UserMetrics): Promise<void> {
    if (!this.supabase) return;

    try {
      await this.supabase.from('user_behavioral_metrics').upsert({
        user_id: userId,
        top_teams: metrics.topTeams,
        avg_stake: metrics.avgStake,
        active_hours: metrics.activeHours,
        favorite_sport: metrics.favoriteSport || null,
        dominant_bet_type: metrics.dominantBetType || null,
        stake_style: metrics.stakeStyle || null,
        win_rate: metrics.winRate,
        last_updated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to store user metrics:', error);
    }
  }
}

export const aiReasoningService = AIReasoningService.getInstance();
