import { supabase } from '@/services/supabase/client';
import { Comment } from '@/types/database-helpers';
import { rateLimiter } from '@/utils/rateLimiter';

const MAX_COMMENT_LENGTH = 280;

interface CommentWithUser extends Comment {
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface AddCommentResult {
  comment: CommentWithUser;
}

export interface GetCommentsResult {
  comments: CommentWithUser[];
  hasMore: boolean;
  total: number;
}

class CommentService {
  /**
   * Add a comment to a post
   */
  async addComment(postId: string, content: string): Promise<AddCommentResult> {
    // Validate content length
    if (!content.trim()) {
      throw new Error('Comment cannot be empty');
    }

    if (content.length > MAX_COMMENT_LENGTH) {
      throw new Error(`Comment must be ${MAX_COMMENT_LENGTH} characters or less`);
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to comment');
    }

    // Check rate limit
    if (!rateLimiter.canPerformAction(user.id, 'comment', 5, 60000)) {
      throw new Error('Please wait before commenting again');
    }

    try {
      // Insert comment
      const { data: comment, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
        })
        .select(
          `
          *,
          user:users!user_id (
            id,
            username,
            avatar_url
          )
        `
        )
        .single();

      if (error) throw error;

      // Get post owner for notification
      const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      // Create notification if commenting on someone else's post
      if (post && post.user_id !== user.id) {
        try {
          await supabase.from('notifications').insert({
            user_id: post.user_id,
            type: 'comment',
            data: {
              actorId: user.id,
              actorUsername: comment.user.username,
              postId: postId,
              preview: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
            },
            read: false,
          });
        } catch (notifError) {
          // Don't fail the comment if notification fails
          console.error('Failed to create notification:', notifError);
        }
      }

      return { comment: comment as CommentWithUser };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to add comment');
    }
  }

  /**
   * Delete a comment (only by owner)
   */
  async deleteComment(commentId: string): Promise<{ success: boolean }> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to delete comments');
    }

    try {
      // Soft delete by setting deleted_at
      const { error } = await supabase
        .from('comments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', commentId)
        .eq('user_id', user.id); // Ensure user owns the comment

      if (error) throw error;

      return { success: true };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete comment');
    }
  }

  /**
   * Get comments for a post with pagination
   */
  async getComments(
    postId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<GetCommentsResult> {
    try {
      // Get total count
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
        .is('deleted_at', null);

      // Get paginated comments
      const { data: comments, error } = await supabase
        .from('comments')
        .select(
          `
          *,
          user:users!user_id (
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('post_id', postId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        comments: (comments || []) as CommentWithUser[],
        hasMore: (count || 0) > offset + limit,
        total: count || 0,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch comments');
    }
  }

  /**
   * Get a single comment by ID
   */
  async getComment(commentId: string): Promise<CommentWithUser | null> {
    try {
      const { data: comment, error } = await supabase
        .from('comments')
        .select(
          `
          *,
          user:users!user_id (
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('id', commentId)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return comment as CommentWithUser;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch comment');
    }
  }
}

export const commentService = new CommentService();
