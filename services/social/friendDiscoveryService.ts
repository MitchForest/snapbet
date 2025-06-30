import { supabase } from '@/services/supabase/client';
import { UserWithStats } from '@/services/search/searchService';
import {
  aiReasoningService,
  AIReasonContext,
  AISimilarUser,
} from '@/services/ai/aiReasoningService';

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
      // Initialize AI service
      aiReasoningService.initialize(supabase);

      // Get similar users with AI-generated reasons
      const context: AIReasonContext = {
        fromUserId: userId,
        toUserId: userId,
        contextType: 'discovery',
      };

      const similarUsers = await aiReasoningService.getSimilarUsersWithReasons(
        userId,
        limit,
        context
      );

      console.log('[friendDiscoveryService] AI service returned:', similarUsers.length, 'users');

      if (!similarUsers.length) {
        return [];
      }

      // Convert AISimilarUser to FriendSuggestion format
      const suggestions = similarUsers.map((aiUser) => this.convertToFriendSuggestion(aiUser));

      console.log('[friendDiscoveryService] Converted suggestions:', suggestions.length);

      return suggestions;
    } catch (error) {
      console.error('Error getting friend suggestions:', error);
      return [];
    }
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

  private convertToFriendSuggestion(aiUser: AISimilarUser): FriendSuggestion {
    const metrics = aiUser.user.metrics;

    // Generate insights from metrics
    const insights: BehavioralInsight[] = [];

    if (metrics.favoriteSport) {
      insights.push({
        type: 'sport',
        value: metrics.favoriteSport,
        confidence: 0.85,
      });
    }

    if (metrics.stakeStyle && metrics.stakeStyle !== 'varied') {
      insights.push({
        type: 'stake',
        value: metrics.stakeStyle,
        confidence: 0.8,
      });
    }

    if (metrics.winRate && metrics.winRate > 0.6) {
      insights.push({
        type: 'style',
        value: 'sharp',
        confidence: 0.8,
      });
    }

    // Categorize betting style
    let bettingStyle = 'Balanced Approach';
    if (metrics.winRate && metrics.winRate > 0.6) {
      bettingStyle = 'Sharp Bettor';
    } else if (metrics.stakeStyle === 'aggressive') {
      bettingStyle = 'High Roller';
    } else if (metrics.stakeStyle === 'conservative') {
      bettingStyle = 'Conservative Player';
    }

    // Calculate win/loss counts
    const totalBets = metrics.topTeams.length * 10; // Rough estimate
    const winCount = metrics.winRate ? Math.round(metrics.winRate * totalBets) : 0;
    const lossCount = totalBets - winCount;

    return {
      id: aiUser.user.id,
      username: aiUser.user.username,
      display_name: null, // Not provided by AI service
      avatar_url: null, // Not provided by AI service
      bio: null, // Not provided by AI service
      created_at: '',
      similarity: aiUser.similarity,
      reasons: aiUser.reasons,
      insights,
      commonSports: metrics.favoriteSport ? [metrics.favoriteSport] : [],
      commonTeams: metrics.topTeams.slice(0, 2),
      bettingStyle,
      win_count: winCount,
      loss_count: lossCount,
      win_rate: metrics.winRate || 0,
      total_bets: totalBets,
    };
  }
}

export const friendDiscoveryService = FriendDiscoveryService.getInstance();
