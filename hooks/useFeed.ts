import { useState, useEffect, useCallback, useRef } from 'react';
import { PostWithType } from '@/types/content';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { feedService, FeedCursor } from '@/services/feed/feedService';
import { useFeedPagination } from './useFeedPagination';
import { getFollowingIds } from '@/services/api/followUser';
import * as Haptics from 'expo-haptics';
import { eventEmitter, FeedEvents } from '@/utils/eventEmitter';

export function useFeed() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const loadCountRef = useRef(0);

  console.log(`[${new Date().toISOString()}] useFeed - RENDER`, {
    userId: user?.id,
    isLoading,
    refreshing,
    loadCount: loadCountRef.current,
  });

  // Fetch function for pagination hook
  const fetchPosts = useCallback(
    async (cursor?: FeedCursor) => {
      console.log(`[${new Date().toISOString()}] useFeed - fetchPosts called`, {
        cursor,
        userId: user?.id,
      });
      if (!user?.id) {
        return { posts: [], nextCursor: null, hasMore: false };
      }
      return feedService.getFeedPosts(user.id, cursor);
    },
    [user?.id]
  );

  // Get cached posts for instant display
  const cachedPosts = user?.id ? feedService.getCachedFeed() : null;

  // Use pagination hook
  const {
    posts,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh: refreshPosts,
    setPosts,
  } = useFeedPagination({
    fetchFunction: fetchPosts,
    initialPosts: cachedPosts || [],
  });

  // Initial load
  useEffect(() => {
    loadCountRef.current++;
    console.log(`[${new Date().toISOString()}] useFeed - Initial load effect triggered`, {
      loadCount: loadCountRef.current,
      userId: user?.id,
      hasCachedPosts: !!cachedPosts,
      cachedPostsLength: cachedPosts?.length,
    });

    const loadInitialPosts = async () => {
      if (!user?.id) {
        console.log(`[${new Date().toISOString()}] useFeed - No user, skipping load`);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // If we don't have cached posts, fetch fresh
        if (!cachedPosts || cachedPosts.length === 0) {
          console.log(`[${new Date().toISOString()}] useFeed - No cached posts, fetching fresh`);
          await refreshPosts();
        } else {
          console.log(`[${new Date().toISOString()}] useFeed - Using cached posts`, {
            count: cachedPosts.length,
          });
        }
      } catch (err) {
        console.error(`[${new Date().toISOString()}] useFeed - Error loading initial posts:`, err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Intentionally exclude cachedPosts and refreshPosts to avoid loops

  // Refresh with haptic feedback
  const refetch = useCallback(async () => {
    console.log(`[${new Date().toISOString()}] useFeed - refetch called`);
    setRefreshing(true);

    // Haptic feedback for pull-to-refresh
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await refreshPosts();
      setError(null);
    } catch (err) {
      console.error('Error refreshing feed:', err);
      setError(err as Error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshPosts]);

  // Listen for follow status changes to refresh feed
  useEffect(() => {
    const subscription = eventEmitter.addListener(
      FeedEvents.FOLLOW_STATUS_CHANGED,
      ({ userId, isFollowing }) => {
        // Refresh the feed when someone is followed/unfollowed
        // This ensures the feed shows posts from newly followed users
        // or removes posts from unfollowed users
        console.log(`Follow status changed for user ${userId}: ${isFollowing}`);
        refetch();
      }
    );

    return () => {
      subscription.remove();
    };
  }, [refetch]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const setupRealtimeSubscription = async () => {
      try {
        // Get following IDs for subscription
        const followingIds = await getFollowingIds();

        // Include self
        const allUserIds = [...followingIds, user.id];

        // Get real-time config
        const realtimeConfig = feedService.getRealtimeConfig(allUserIds);

        if (!realtimeConfig) {
          console.log('Too many follows for real-time updates');
          return;
        }

        // Clean up existing subscription
        if (subscriptionRef.current) {
          supabase.removeChannel(subscriptionRef.current);
        }

        // Create new subscription
        const subscription = supabase
          .channel(realtimeConfig.channel)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'posts',
              filter: realtimeConfig.filter,
            },
            async (payload) => {
              // Fetch the complete post with user data
              const { data: newPost } = await supabase
                .from('posts')
                .select(
                  `
                  *,
                  user:users!user_id (
                    id,
                    username,
                    avatar_url,
                    display_name
                  )
                `
                )
                .eq('id', payload.new.id)
                .single();

              if (newPost && feedService.shouldShowPost(newPost as PostWithType)) {
                // Prepend new post to feed
                setPosts((currentPosts: PostWithType[]) => [
                  newPost as PostWithType,
                  ...currentPosts,
                ]);

                // Light haptic for new post
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }
          )
          .subscribe();

        subscriptionRef.current = subscription;
      } catch (error) {
        console.error('Error setting up real-time subscription:', error);
      }
    };

    setupRealtimeSubscription();

    // Cleanup
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [user?.id, setPosts]);

  return {
    posts,
    isLoading: isLoading && posts.length === 0, // Only show loading if no cached posts
    isLoadingMore,
    error,
    refreshing,
    refetch,
    loadMore,
    hasMore,
  };
}
