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
   * Toggle a reaction on a post or story (add, update, or remove)
   */
  async toggleReaction(
    contentId: string,
    emoji: string,
    isStory = false
  ): Promise<ToggleReactionResult> {
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
      // Build query based on content type
      const query = supabase.from('reactions').select('*').eq('user_id', user.id);

      if (isStory) {
        query.eq('story_id', contentId).is('post_id', null);
      } else {
        query.eq('post_id', contentId).is('story_id', null);
      }

      // Check if user already has a reaction on this content
      const { data: existingReaction } = await query.single();

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
          if (!isStory) {
            await this.createReactionNotification(contentId, user.id, emoji);
          }

          return { reaction: updatedReaction, removed: false };
        }
      } else {
        // No existing reaction - create new one
        const insertData = {
          user_id: user.id,
          emoji,
          post_id: isStory ? null : contentId,
          story_id: isStory ? contentId : null,
        };

        const { data: newReaction, error } = await supabase
          .from('reactions')
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;

        // Create notification (only for posts)
        if (!isStory) {
          await this.createReactionNotification(contentId, user.id, emoji);
        }

        return { reaction: newReaction, removed: false };
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to toggle reaction');
    }
  }

  /**
   * Get aggregated reactions for a post or story
   */
  async getReactions(contentId: string, isStory = false): Promise<ReactionSummary[]> {
    try {
      const query = supabase.from('reactions').select('emoji');

      if (isStory) {
        query.eq('story_id', contentId);
      } else {
        query.eq('post_id', contentId);
      }

      const { data: reactions, error } = await query;

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
   * Get the current user's reaction for a post or story
   */
  async getUserReaction(
    contentId: string,
    userId: string,
    isStory = false
  ): Promise<string | null> {
    try {
      const query = supabase.from('reactions').select('emoji').eq('user_id', userId);

      if (isStory) {
        query.eq('story_id', contentId);
      } else {
        query.eq('post_id', contentId);
      }

      const { data: reaction, error } = await query.single();

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
    contentId: string,
    emoji: string,
    isStory = false,
    limit: number = 50,
    offset: number = 0
  ): Promise<GetReactionUsersResult> {
    try {
      // Get total count
      const query = supabase.from('reactions').select('*', { count: 'exact', head: true });

      if (isStory) {
        query.eq('story_id', contentId);
      } else {
        query.eq('post_id', contentId);
      }

      query.eq('emoji', emoji);

      const { count } = await query;

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
        .eq('post_id', contentId)
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
    contentId: string,
    reactorId: string,
    emoji: string
  ): Promise<void> {
    try {
      // Get post owner and reactor info
      const query = supabase.from('posts').select('user_id');

      if (contentId.startsWith('story_')) {
        query.eq('story_id', contentId);
      } else {
        query.eq('post_id', contentId);
      }

      const { data: post } = await query.single();

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
          postId: contentId,
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
