import { supabase } from '@/services/supabase/client';
import { Database } from '@/types/database';
import { UserWithStats } from '@/services/search/searchService';

type SimilarUser = Database['public']['Functions']['find_similar_users']['Returns'][0];

interface BehavioralInsight {
  type: 'team' | 'sport' | 'style' | 'timing' | 'stake';
  value: string;
  confidence: number;
}

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

      if (rpcError || !similarUsers) {
        console.error('Error finding similar users:', rpcError);
        return [];
      }

      // Enrich suggestions with behavioral insights
      const suggestions = await Promise.all(
        similarUsers.map((user) => this.enrichSuggestion(user, userId))
      );

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
    const reasons = this.generateReasons(similarUser, insights);
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
      commonTeams: this.extractCommonTeams(similarUser.favorite_teams || []),
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

    // Team insights
    if (user.favorite_teams && user.favorite_teams.length > 0) {
      insights.push({
        type: 'team',
        value: user.favorite_teams[0],
        confidence: 0.9,
      });
    }

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
   * Generate human-readable reasons for the match
   */
  private generateReasons(user: SimilarUser, insights: BehavioralInsight[]): string[] {
    const reasons: string[] = [];

    // Team-based reasons
    const teamInsight = insights.find((i) => i.type === 'team');
    if (teamInsight) {
      reasons.push(`Both bet on ${teamInsight.value}`);
    }

    // Sport-based reasons
    const sportInsight = insights.find((i) => i.type === 'sport');
    if (sportInsight) {
      reasons.push(`Active in ${sportInsight.value} betting`);
    }

    // Style-based reasons
    const styleInsight = insights.find((i) => i.type === 'style');
    if (styleInsight && styleInsight.value === 'sharp') {
      reasons.push(`${Math.round(user.win_rate * 100)}% win rate`);
    }

    // Similarity score reason
    if (user.similarity > 0.8) {
      reasons.push('Very similar betting patterns');
    } else if (user.similarity > 0.6) {
      reasons.push('Similar betting style');
    }

    return reasons.slice(0, 3); // Max 3 reasons
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
}

export const friendDiscoveryService = FriendDiscoveryService.getInstance();
