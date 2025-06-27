import { useState, useEffect, useCallback, useRef } from 'react';
import { commentService } from '@/services/engagement/commentService';
import { subscriptionManager } from '@/services/realtime/subscriptionManager';
import { Comment } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { toastService } from '@/services/toastService';
import { supabase } from '@/services/supabase/client';

interface CommentWithUser extends Comment {
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

interface UseCommentsResult {
  comments: CommentWithUser[];
  isLoading: boolean;
  isAdding: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  addComment: (content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useComments(postId: string): UseCommentsResult {
  const { user } = useAuth();
  const { blockedUserIds } = useBlockedUsers();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const tempIdCounter = useRef(0);
  const isSubscribed = useRef(false);

  // Filter comments from blocked users
  const filteredComments = comments.filter((comment) => !blockedUserIds.includes(comment.user_id));

  // Load initial comments
  const loadComments = useCallback(
    async (reset = false) => {
      try {
        setIsLoading(true);
        setError(null);

        const currentOffset = reset ? 0 : offset;
        const result = await commentService.getComments(postId, 20, currentOffset);

        if (reset) {
          setComments(result.comments);
          setOffset(20);
        } else {
          setComments((prev) => [...prev, ...result.comments]);
          setOffset((prev) => prev + result.comments.length);
        }

        setHasMore(result.hasMore);
        setTotal(result.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load comments');
        toastService.showError('Failed to load comments');
      } finally {
        setIsLoading(false);
      }
    },
    [postId, offset]
  );

  // Add comment with optimistic update
  const addComment = useCallback(
    async (content: string) => {
      if (!user) {
        toastService.showError('Please sign in to comment');
        return;
      }

      // Get user profile data for optimistic update
      const { data: userProfile } = await supabase
        .from('users')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      const tempId = `temp_${Date.now()}_${tempIdCounter.current++}`;
      const optimisticComment: CommentWithUser = {
        id: tempId,
        post_id: postId,
        user_id: user.id,
        content,
        created_at: new Date().toISOString(),
        deleted_at: null,
        report_count: null,
        user: {
          id: user.id,
          username: userProfile?.username || 'Anonymous',
          avatar_url: userProfile?.avatar_url || null,
        },
      };

      try {
        setIsAdding(true);
        setError(null);

        // Optimistically add comment
        setComments((prev) => [optimisticComment, ...prev]);
        setTotal((prev) => prev + 1);

        const result = await commentService.addComment(postId, content);

        // Replace temp comment with real one
        setComments((prev) => prev.map((c) => (c.id === tempId ? result.comment : c)));

        toastService.showSuccess('Comment added');
      } catch (err) {
        // Rollback on error
        setComments((prev) => prev.filter((c) => c.id !== tempId));
        setTotal((prev) => prev - 1);

        const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
        setError(errorMessage);
        toastService.showError(errorMessage);
      } finally {
        setIsAdding(false);
      }
    },
    [postId, user]
  );

  // Delete comment with optimistic update
  const deleteComment = useCallback(
    async (commentId: string) => {
      // Store comment for rollback
      const commentToDelete = comments.find((c) => c.id === commentId);
      if (!commentToDelete) return;

      try {
        // Optimistically remove comment
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setTotal((prev) => prev - 1);

        await commentService.deleteComment(commentId);
        toastService.showSuccess('Comment deleted');
      } catch (err) {
        // Rollback on error
        if (commentToDelete) {
          setComments((prev) => {
            const newComments = [...prev];
            // Re-insert at original position
            const originalIndex = comments.findIndex((c) => c.id === commentId);
            newComments.splice(originalIndex, 0, commentToDelete);
            return newComments;
          });
          setTotal((prev) => prev + 1);
        }

        const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
        setError(errorMessage);
        toastService.showError(errorMessage);
      }
    },
    [comments]
  );

  // Load more comments
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await loadComments(false);
  }, [hasMore, isLoading, loadComments]);

  // Refresh comments
  const refresh = useCallback(async () => {
    setOffset(0);
    await loadComments(true);
  }, [loadComments]);

  // Set up real-time subscription
  useEffect(() => {
    if (isSubscribed.current) return;

    const cleanup = subscriptionManager.subscribeToPost(postId, {
      onComment: (payload) => {
        if (payload.eventType === 'INSERT') {
          // Don't add if it's our own optimistic comment
          const newComment = payload.new as unknown as Comment;
          setComments((prev) => {
            const exists = prev.some((c) => c.id === newComment.id);
            if (exists) return prev;

            // Fetch full comment with user data
            commentService.getComment(newComment.id).then((fullComment) => {
              if (fullComment) {
                setComments((prev) => [fullComment, ...prev]);
                setTotal((prev) => prev + 1);
              }
            });

            return prev;
          });
        } else if (payload.eventType === 'UPDATE') {
          const updatedComment = payload.new as unknown as Comment;
          if (updatedComment.deleted_at) {
            // Comment was soft deleted
            setComments((prev) => prev.filter((c) => c.id !== updatedComment.id));
            setTotal((prev) => prev - 1);
          }
        }
      },
    });

    isSubscribed.current = true;

    return () => {
      cleanup();
      isSubscribed.current = false;
    };
  }, [postId]);

  // Initial load
  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId, loadComments]);

  return {
    comments: filteredComments,
    isLoading,
    isAdding,
    error,
    hasMore,
    total: total - (comments.length - filteredComments.length),
    addComment,
    deleteComment,
    loadMore,
    refresh,
  };
}
