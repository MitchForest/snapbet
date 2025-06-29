import { supabase } from '@/services/supabase/client';
import { UserWithStats } from '@/services/search/searchService';

// Override the type until database types are regenerated
type SimilarUser = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  similarity: number;
  win_rate: number;
  total_bets: number;
  common_sports: string[];
};

interface BehavioralInsight {
  type: 'team' | 'sport' | 'style' | 'timing' | 'stake';
  value: string;
  confidence: number;
}

interface ScoredReason {
  text: string;
  score: number;
  category: 'sport' | 'team' | 'style' | 'stake' | 'time' | 'performance' | 'bet_type';
  specificity: number;
}

type BetWithGame = {
  bet_type: 'spread' | 'total' | 'moneyline';
  stake: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bet_details: any; // Json type from database can be string | number | boolean | null | object | array
  created_at: string | null;
  game: {
    sport: string;
    home_team: string;
    away_team: string;
  } | null;
};

interface FriendSuggestion extends UserWithStats {
  similarity: number;
  reasons: string[];
  insights: BehavioralInsight[];
  commonSports: string[];
  commonTeams: string[];
  bettingStyle: string;
}

class FriendDiscoveryService {
  private static instance: FriendDiscoveryService;

  private constructor() {}

  static getInstance(): FriendDiscoveryService {
    if (!FriendDiscoveryService.instance) {
      FriendDiscoveryService.instance = new FriendDiscoveryService();
    }
    return FriendDiscoveryService.instance;
  }

  /**
   * Get friend suggestions based on behavioral similarity
   */
  async getSuggestions(userId: string, limit: number = 10): Promise<FriendSuggestion[]> {
    try {
      // Get current user's embedding
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('profile_embedding')
        .eq('id', userId)
        .single();

      if (userError || !currentUser?.profile_embedding) {
        console.log('No embedding found for user:', userId);
        return [];
      }

      // Call the RPC function to find similar users
      const { data: similarUsers, error: rpcError } = await supabase.rpc('find_similar_users', {
        query_embedding: currentUser.profile_embedding,
        p_user_id: userId,
        limit_count: limit,
      });

      console.log('[friendDiscoveryService] RPC returned:', {
        count: similarUsers?.length,
        error: rpcError,
        firstFew: similarUsers?.slice(0, 3).map((u) => ({
          id: u.id,
          username: u.username,
          similarity: u.similarity,
        })),
      });

      if (rpcError || !similarUsers) {
        console.error('Error finding similar users:', rpcError);
        return [];
      }

      // Enrich suggestions with behavioral insights
      const suggestions = await Promise.all(
        similarUsers.map((user) => this.enrichSuggestion(user, userId))
      );

      console.log('[friendDiscoveryService] Enriched suggestions:', suggestions.length);

      return suggestions;
    } catch (error) {
      console.error('Error getting friend suggestions:', error);
      return [];
    }
  }

  /**
   * Enrich a similar user with behavioral insights
   */
  private async enrichSuggestion(
    similarUser: SimilarUser,
    _currentUserId: string
  ): Promise<FriendSuggestion> {
    // Analyze behavioral patterns
    const insights = this.generateInsights(similarUser);
    const reasons = await this.generateReasons(similarUser, _currentUserId);
    const bettingStyle = this.categorizeBettingStyle(similarUser);

    return {
      id: similarUser.id,
      username: similarUser.username || '',
      display_name: similarUser.display_name,
      avatar_url: similarUser.avatar_url,
      bio: similarUser.bio,
      created_at: '',
      similarity: similarUser.similarity,
      reasons,
      insights,
      commonSports: similarUser.common_sports || [],
      commonTeams: [], // No longer storing favorite teams
      bettingStyle,
      // Add UserWithStats fields
      win_count: Math.round(similarUser.win_rate * similarUser.total_bets),
      loss_count:
        similarUser.total_bets - Math.round(similarUser.win_rate * similarUser.total_bets),
      win_rate: similarUser.win_rate,
      total_bets: similarUser.total_bets,
    };
  }

  /**
   * Generate behavioral insights from user data
   */
  private generateInsights(user: SimilarUser): BehavioralInsight[] {
    const insights: BehavioralInsight[] = [];

    // Team insights - removed as we no longer store favorite_teams

    // Sport insights
    if (user.common_sports && user.common_sports.length > 0) {
      insights.push({
        type: 'sport',
        value: user.common_sports[0],
        confidence: 0.85,
      });
    }

    // Style insights based on win rate
    if (user.win_rate > 0.6) {
      insights.push({
        type: 'style',
        value: 'sharp',
        confidence: 0.8,
      });
    } else if (user.win_rate < 0.4) {
      insights.push({
        type: 'style',
        value: 'recreational',
        confidence: 0.7,
      });
    }

    return insights;
  }

  /**
   * Generate human-readable reasons for the match with intelligent ordering
   */
  private async generateReasons(
    similarUser: SimilarUser,
    _currentUserId: string
  ): Promise<string[]> {
    const scoredReasons: ScoredReason[] = [];

    // 1. Common sports (lowest priority)
    if (similarUser.common_sports?.length > 0) {
      const sportNames = this.formatSportNames(similarUser.common_sports);
      if (similarUser.common_sports.length === 1) {
        scoredReasons.push({
          text: `Both bet on ${sportNames[0]}`,
          score: 50,
          category: 'sport',
          specificity: 0.3, // Sports are common
        });
      } else {
        scoredReasons.push({
          text: `Both bet ${sportNames.join(' & ')}`,
          score: 55, // Slightly higher for multiple sports
          category: 'sport',
          specificity: 0.4,
        });
      }
    }

    // 2. Fetch additional behavioral data for richer reasons
    const { data: betsData } = await supabase
      .from('bets')
      .select(
        `
        bet_type,
        stake,
        bet_details,
        created_at,
        game:games(sport, home_team, away_team)
      `
      )
      .eq('user_id', similarUser.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(50);

    if (betsData && betsData.length > 0) {
      // 3. Analyze bet types
      const betTypes = this.analyzeBetTypes(betsData);
      if (betTypes.dominant && betTypes.percentage > 60) {
        scoredReasons.push({
          text: `${betTypes.percentage}% ${betTypes.dominant} bets`,
          score: 60,
          category: 'bet_type',
          specificity: betTypes.percentage > 80 ? 0.7 : 0.5,
        });
      }

      // 4. Analyze teams (highest priority)
      const topTeams = this.extractTopTeams(betsData);
      if (topTeams.length > 0) {
        scoredReasons.push({
          text: `Bets on ${topTeams.slice(0, 2).join(' & ')}`,
          score: 100, // Highest score for specific teams
          category: 'team',
          specificity: 0.9, // Very specific
        });
      }

      // 5. Analyze stake patterns
      const avgStake = this.calculateAvgStake(betsData);
      const stakeStyle = this.categorizeStakeStyle(avgStake);
      if (stakeStyle !== 'Varied') {
        // More interesting stake styles get higher scores
        const stakeScores: Record<string, number> = {
          Micro: 75,
          Conservative: 70,
          Moderate: 65,
          Confident: 80,
          Aggressive: 90,
        };
        const stakeScore = stakeScores[stakeStyle] || 70;

        // Format stake in dollars for display
        const avgDollars = Math.round(avgStake / 100);
        scoredReasons.push({
          text: `${stakeStyle} bettor ($${avgDollars} avg)`,
          score: stakeScore,
          category: 'stake',
          specificity: avgDollars > 100 || avgDollars < 10 ? 0.8 : 0.6,
        });
      }

      // 6. Time patterns
      const timePattern = this.analyzeTimePatterns(betsData);
      if (timePattern.dominant) {
        const timeScore =
          timePattern.dominant === 'Late night' || timePattern.dominant === 'Morning' ? 85 : 75;
        scoredReasons.push({
          text: `${timePattern.dominant} bettor`,
          score: timeScore,
          category: 'time',
          specificity: 0.7,
        });
      }
    }

    // 7. Performance-based reasons
    if (similarUser.win_rate > 0.65) {
      scoredReasons.push({
        text: `Both crushing it at ${Math.round(similarUser.win_rate * 100)}%+`,
        score: 80,
        category: 'performance',
        specificity: similarUser.win_rate > 0.7 ? 0.85 : 0.65,
      });
    }

    // 8. Apply uniqueness boosting (simplified for now)
    scoredReasons.forEach((reason) => {
      // Boost scores for high specificity
      reason.score *= 1 + reason.specificity * 0.3;

      // Reduce common patterns (NBA is very common)
      if (reason.text.includes('NBA') && reason.category === 'sport') {
        reason.score *= 0.6;
      }
    });

    // Sort by score and return appropriate number
    const sortedReasons = scoredReasons.sort((a, b) => b.score - a.score).map((r) => r.text);

    // Fallback if no reasons generated
    if (sortedReasons.length === 0) {
      if (similarUser.similarity > 0.85) {
        return ['Nearly identical betting style'];
      } else if (similarUser.similarity > 0.75) {
        return ['Very similar patterns'];
      } else {
        return ['Compatible betting approach'];
      }
    }

    // Return top 3 reasons
    return sortedReasons.slice(0, 3);
  }

  /**
   * Extract common teams from the favorite teams array
   */
  private extractCommonTeams(favoriteTeams: string[]): string[] {
    // In a real implementation, this would compare with current user's teams
    // For now, just return the top teams
    return favoriteTeams.slice(0, 3);
  }

  /**
   * Categorize betting style based on patterns
   */
  private categorizeBettingStyle(user: SimilarUser): string {
    if (user.win_rate > 0.6) return 'Sharp Bettor';
    if (user.total_bets > 50) return 'High Volume';
    if (user.total_bets < 10) return 'Casual Bettor';
    return 'Balanced Approach';
  }

  /**
   * Refresh user suggestions by updating embeddings
   */
  async refreshSuggestions(userId: string): Promise<void> {
    try {
      // This would trigger the embedding pipeline to update
      // In production, this might be a job or Edge Function
      console.log('Refreshing suggestions for user:', userId);
    } catch (error) {
      console.error('Error refreshing suggestions:', error);
    }
  }

  // Helper methods for enhanced reason generation
  private formatSportNames(sports: string[]): string[] {
    const sportMap: Record<string, string> = {
      americanfootball_nfl: 'NFL',
      basketball_nba: 'NBA',
      baseball_mlb: 'MLB',
      icehockey_nhl: 'NHL',
      soccer_epl: 'Premier League',
      basketball_ncaab: 'NCAAB',
      americanfootball_ncaaf: 'NCAAF',
    };

    return sports.map((s) => sportMap[s] || s);
  }

  private analyzeBetTypes(bets: BetWithGame[]): { dominant: string | null; percentage: number } {
    const typeCounts = new Map<string, number>();

    bets.forEach((bet) => {
      const type = bet.bet_type;
      if (type) {
        typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
      }
    });

    const total = bets.length;
    let dominant: string | null = null;
    let maxCount = 0;

    typeCounts.forEach((count, type) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = type;
      }
    });

    return {
      dominant,
      percentage: total > 0 ? Math.round((maxCount / total) * 100) : 0,
    };
  }

  private extractTopTeams(bets: BetWithGame[]): string[] {
    const teamCounts = new Map<string, number>();

    bets.forEach((bet) => {
      const team = bet.bet_details?.team;
      if (team) {
        teamCounts.set(team, (teamCounts.get(team) || 0) + 1);
      }
    });

    return Array.from(teamCounts.entries())
      .filter(([_, count]) => count >= 3) // At least 3 bets on team
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([team]) => team);
  }

  private calculateAvgStake(bets: BetWithGame[]): number {
    if (bets.length === 0) return 0;

    const totalStake = bets.reduce((sum, bet) => sum + (bet.stake || 0), 0);
    return Math.round(totalStake / bets.length);
  }

  private categorizeStakeStyle(avgStake: number): string {
    // Convert cents to dollars for clearer thresholds
    const avgDollars = avgStake / 100;

    if (avgDollars < 10) return 'Micro';
    if (avgDollars < 25) return 'Conservative';
    if (avgDollars < 50) return 'Moderate';
    if (avgDollars < 100) return 'Confident';
    if (avgDollars >= 100) return 'Aggressive';
    return 'Varied';
  }

  private analyzeTimePatterns(bets: BetWithGame[]): { dominant: string | null } {
    const hourCounts = new Map<string, number>();

    bets.forEach((bet) => {
      if (bet.created_at) {
        const hour = new Date(bet.created_at).getHours();
        let timeSlot: string;

        if (hour >= 6 && hour < 12) timeSlot = 'Morning';
        else if (hour >= 12 && hour < 17) timeSlot = 'Afternoon';
        else if (hour >= 17 && hour < 21) timeSlot = 'Primetime';
        else if (hour >= 21 || hour < 2) timeSlot = 'Late night';
        else timeSlot = 'Night owl';

        hourCounts.set(timeSlot, (hourCounts.get(timeSlot) || 0) + 1);
      }
    });

    let dominant: string | null = null;
    let maxCount = 0;

    hourCounts.forEach((count, slot) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = slot;
      }
    });

    // Only return dominant if it's significant (>40% of bets)
    const threshold = bets.length * 0.4;
    return { dominant: maxCount > threshold ? dominant : null };
  }
}

export const friendDiscoveryService = FriendDiscoveryService.getInstance();
