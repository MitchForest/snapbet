import { supabase } from '@/services/supabase/client';
import { Reaction } from '@/types/database-helpers';
import { AVAILABLE_REACTIONS, ReactionEmoji } from '@/utils/constants/reactions';

export type AllowedReaction = ReactionEmoji;

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
   * Toggle a reaction on a post or story (add or remove)
   */
  async toggleReaction(
    contentId: string,
    emoji: string,
    isStory = false
  ): Promise<ToggleReactionResult> {
    // Validate emoji
    if (!AVAILABLE_REACTIONS.includes(emoji as AllowedReaction)) {
      throw new Error('Invalid reaction emoji');
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to react');
    }

    try {
      // Build query to check if user has THIS SPECIFIC emoji reaction
      const query = supabase
        .from('reactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('emoji', emoji); // Check for specific emoji

      if (isStory) {
        query.eq('story_id', contentId).is('post_id', null);
      } else {
        query.eq('post_id', contentId).is('story_id', null);
      }

      // Check if user already has this specific reaction
      const { data: existingReaction } = await query.single();

      if (existingReaction) {
        // User has this reaction - remove it
        const { error } = await supabase.from('reactions').delete().eq('id', existingReaction.id);

        if (error) throw error;

        return { removed: true };
      } else {
        // User doesn't have this reaction - add it
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
      // For reactions, we need to check if the parent content is archived
      let query;

      if (isStory) {
        query = supabase
          .from('reactions')
          .select('emoji, story:stories!inner(archived, deleted_at)')
          .eq('story_id', contentId)
          .eq('story.archived', false)
          .is('story.deleted_at', null);
      } else {
        query = supabase
          .from('reactions')
          .select('emoji, post:posts!inner(archived, deleted_at)')
          .eq('post_id', contentId)
          .eq('post.archived', false)
          .is('post.deleted_at', null);
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
   * Get the current user's reactions for a post or story
   */
  async getUserReactions(contentId: string, userId: string, isStory = false): Promise<string[]> {
    try {
      const query = supabase.from('reactions').select('emoji').eq('user_id', userId);

      if (isStory) {
        query.eq('story_id', contentId);
      } else {
        query.eq('post_id', contentId);
      }

      const { data: reactions, error } = await query;

      if (error) throw error;

      return reactions?.map((r) => r.emoji) || [];
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch user reactions');
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
      const countQuery = supabase.from('reactions').select('*', { count: 'exact', head: true });

      if (isStory) {
        countQuery.eq('story_id', contentId);
      } else {
        countQuery.eq('post_id', contentId);
      }

      countQuery.eq('emoji', emoji);

      const { count } = await countQuery;

      // Get users with pagination
      const dataQuery = supabase.from('reactions').select(
        `
          user:users!user_id (
            id,
            username,
            avatar_url
          )
        `
      );

      if (isStory) {
        dataQuery.eq('story_id', contentId);
      } else {
        dataQuery.eq('post_id', contentId);
      }

      const { data: reactions, error } = await dataQuery
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
