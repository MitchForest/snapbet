import { supabase } from '@/services/supabase/client';
import { Reaction } from '@/types/database';

const ALLOWED_REACTIONS = ['🔥', '💰', '😂', '😭', '💯', '🎯'] as const;
export type AllowedReaction = (typeof ALLOWED_REACTIONS)[number];

export interface ReactionSummary {
  emoji: string;
  count: number;
}

export interface ToggleReactionResult {
  reaction?: Reaction;
  removed: boolean;
}

export interface GetReactionUsersResult {
  users: Array<{
    id: string;
    username: string | null;
    avatar_url: string | null;
  }>;
  total: number;
  hasMore: boolean;
}

class ReactionService {
  /**
   * Toggle a reaction on a post (add, update, or remove)
   */
  async toggleReaction(postId: string, emoji: string): Promise<ToggleReactionResult> {
    // Validate emoji
    if (!ALLOWED_REACTIONS.includes(emoji as AllowedReaction)) {
      throw new Error('Invalid reaction emoji');
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to react');
    }

    try {
      // Check if user already has a reaction on this post
      const { data: existingReaction } = await supabase
        .from('reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingReaction) {
        if (existingReaction.emoji === emoji) {
          // Same emoji - remove the reaction
          const { error } = await supabase.from('reactions').delete().eq('id', existingReaction.id);

          if (error) throw error;

          return { removed: true };
        } else {
          // Different emoji - update the reaction
          const { data: updatedReaction, error } = await supabase
            .from('reactions')
            .update({ emoji })
            .eq('id', existingReaction.id)
            .select()
            .single();

          if (error) throw error;

          // Create notification for new reaction type
          await this.createReactionNotification(postId, user.id, emoji);

          return { reaction: updatedReaction, removed: false };
        }
      } else {
        // No existing reaction - create new one
        const { data: newReaction, error } = await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            emoji,
          })
          .select()
          .single();

        if (error) throw error;

        // Create notification
        await this.createReactionNotification(postId, user.id, emoji);

        return { reaction: newReaction, removed: false };
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to toggle reaction');
    }
  }

  /**
   * Get aggregated reactions for a post
   */
  async getReactions(postId: string): Promise<ReactionSummary[]> {
    try {
      const { data: reactions, error } = await supabase
        .from('reactions')
        .select('emoji')
        .eq('post_id', postId);

      if (error) throw error;

      // Aggregate reactions by emoji
      const aggregated =
        reactions?.reduce(
          (acc, reaction) => {
            acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ) || {};

      // Convert to array and sort by count
      return Object.entries(aggregated)
        .map(([emoji, count]) => ({ emoji, count: count as number }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch reactions');
    }
  }

  /**
   * Get the current user's reaction for a post
   */
  async getUserReaction(postId: string, userId: string): Promise<string | null> {
    try {
      const { data: reaction, error } = await supabase
        .from('reactions')
        .select('emoji')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return reaction?.emoji || null;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch user reaction');
    }
  }

  /**
   * Get users who reacted with a specific emoji
   */
  async getReactionUsers(
    postId: string,
    emoji: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<GetReactionUsersResult> {
    try {
      // Get total count
      const { count } = await supabase
        .from('reactions')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('emoji', emoji);

      // Get users with pagination
      const { data: reactions, error } = await supabase
        .from('reactions')
        .select(
          `
          user:users!user_id (
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('post_id', postId)
        .eq('emoji', emoji)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const users = reactions?.map((r) => r.user).filter(Boolean) || [];

      return {
        users,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch reaction users');
    }
  }

  /**
   * Create a notification for a reaction (helper method)
   */
  private async createReactionNotification(
    postId: string,
    reactorId: string,
    emoji: string
  ): Promise<void> {
    try {
      // Get post owner and reactor info
      const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (!post || post.user_id === reactorId) return; // Don't notify self

      const { data: reactor } = await supabase
        .from('users')
        .select('username')
        .eq('id', reactorId)
        .single();

      if (!reactor) return;

      await supabase.from('notifications').insert({
        user_id: post.user_id,
        type: 'reaction',
        data: {
          actorId: reactorId,
          actorUsername: reactor.username,
          postId: postId,
          emoji: emoji,
        },
        read: false,
      });
    } catch (error) {
      // Don't fail the reaction if notification fails
      console.error('Failed to create reaction notification:', error);
    }
  }
}

export const reactionService = new ReactionService();
