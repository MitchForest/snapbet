import { useState, useEffect, useCallback } from 'react';
import { PostWithType } from '@/types/content';
import { supabase } from '@/services/supabase';
import { useAuth } from './useAuth';

export function useFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (!user?.id) {
      setPosts([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('posts')
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
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) throw fetchError;

      setPosts((data as PostWithType[]) || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err as Error);
      setPosts([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  const refetch = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Set up real-time subscription for new posts
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('user-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch posts when changes occur
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, fetchPosts]);

  return {
    posts,
    isLoading,
    error,
    refreshing,
    refetch,
  };
}
