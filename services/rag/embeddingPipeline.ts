import { createClient } from '@supabase/supabase-js';
import { ragService } from './ragService';
import { EmbeddingMetadata } from './types';
import { Database } from '@/types/database';

// Create admin client for background operations
const supabaseAdmin = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

type Post = Database['public']['Tables']['posts']['Row'];
type Bet = Database['public']['Tables']['bets']['Row'];
type Game = Database['public']['Tables']['games']['Row'];

interface PostWithContent extends Partial<Post> {
  content?: string | null;
}

interface BetWithGame extends Bet {
  game?: Partial<Game>;
}

export class EmbeddingPipeline {
  private static instance: EmbeddingPipeline;

  private constructor() {}

  static getInstance(): EmbeddingPipeline {
    if (!EmbeddingPipeline.instance) {
      EmbeddingPipeline.instance = new EmbeddingPipeline();
    }
    return EmbeddingPipeline.instance;
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
      const { error } = await supabaseAdmin
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
      const { error } = await supabaseAdmin
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
      // Get user's recent betting history
      const { data: bets, error: betsError } = await supabaseAdmin
        .from('bets')
        .select(
          `
          *,
          game:games(
            sport,
            home_team,
            away_team
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (betsError || !bets || bets.length === 0) {
        console.log(`No bets found for user ${userId}`);
        return;
      }

      // Get user's posts for additional context
      const { data: posts } = await supabaseAdmin
        .from('posts')
        .select('caption')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      // Generate profile text
      const profileText = this.formatUserProfileForEmbedding(
        userId,
        bets as BetWithGame[],
        posts || []
      );
      const result = await ragService.generateEmbedding(profileText);

      // Convert embedding array to string format for pgvector
      const embeddingString = `[${result.embedding.join(',')}]`;

      // Extract favorite teams from betting history
      const favoriteTeams = this.extractFavoriteTeams(bets as BetWithGame[]);

      // Update user record
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          profile_embedding: embeddingString,
          last_embedding_update: new Date().toISOString(),
          favorite_teams: favoriteTeams,
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update user profile embedding:', updateError);
        return;
      }

      console.log(`Successfully updated profile embedding for user ${userId}`);
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

  private formatUserProfileForEmbedding(
    _userId: string,
    bets: BetWithGame[],
    posts: Array<{ caption: string | null }>
  ): string {
    const parts: string[] = [];

    // Analyze betting patterns
    const sports = new Set<string>();
    const teams = new Map<string, number>();
    const betTypes = new Map<string, number>();
    let wins = 0;

    bets.forEach((bet) => {
      // Track sports
      if (bet.game?.sport) {
        sports.add(bet.game.sport);
      }

      // Track teams
      if (bet.bet_details) {
        const details = bet.bet_details as Record<string, unknown>;
        if (details.team && typeof details.team === 'string') {
          teams.set(details.team, (teams.get(details.team) || 0) + 1);
        }
      }

      // Track bet types
      if (bet.bet_type) {
        betTypes.set(bet.bet_type, (betTypes.get(bet.bet_type) || 0) + 1);
      }

      // Track results
      if (bet.status === 'won') wins++;
    });

    // Build profile description
    parts.push(`User betting profile:`);
    parts.push(`Active in ${Array.from(sports).join(', ')} betting`);

    // Most bet on teams
    const topTeams = Array.from(teams.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([team]) => team);
    if (topTeams.length > 0) {
      parts.push(`Frequently bets on ${topTeams.join(', ')}`);
    }

    // Betting style
    const topBetType = Array.from(betTypes.entries()).sort((a, b) => b[1] - a[1])[0];
    if (topBetType) {
      parts.push(`Prefers ${topBetType[0]} bets`);
    }

    // Win rate
    if (bets.length > 0) {
      const winRate = ((wins / bets.length) * 100).toFixed(1);
      parts.push(`${winRate}% win rate over ${bets.length} bets`);
    }

    // Add some post content for personality
    const recentCaptions = posts
      .filter((p) => p.caption)
      .slice(0, 5)
      .map((p) => p.caption);
    if (recentCaptions.length > 0) {
      parts.push(`Recent posts: ${recentCaptions.join(' | ')}`);
    }

    return parts.join('. ');
  }

  private extractFavoriteTeams(bets: BetWithGame[]): string[] {
    const teamCounts = new Map<string, number>();

    bets.forEach((bet) => {
      if (bet.bet_details) {
        const details = bet.bet_details as Record<string, unknown>;
        if (details.team && typeof details.team === 'string') {
          teamCounts.set(details.team, (teamCounts.get(details.team) || 0) + 1);
        }
      }
    });

    // Return top 5 most bet on teams
    return Array.from(teamCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([team]) => team);
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

      const { error } = await supabaseAdmin.from('embedding_metadata').insert(metadata);

      if (error) {
        console.error('Failed to track embedding metadata:', error);
      }
    } catch (error) {
      console.error('Error tracking embedding:', error);
    }
  }
}

export const embeddingPipeline = EmbeddingPipeline.getInstance();
