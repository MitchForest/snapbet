import { useState, useCallback, useRef } from 'react';
import { PostWithType } from '@/types/content';
import { FeedCursor, FeedResponse } from '@/services/feed/feedService';

interface UseFeedPaginationParams {
  fetchFunction: (cursor?: FeedCursor) => Promise<FeedResponse>;
  initialPosts?: PostWithType[];
}

interface UseFeedPaginationReturn {
  posts: PostWithType[];
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setPosts: React.Dispatch<React.SetStateAction<PostWithType[]>>;
}

export function useFeedPagination({
  fetchFunction,
  initialPosts = [],
}: UseFeedPaginationParams): UseFeedPaginationReturn {
  const [posts, setPosts] = useState<PostWithType[]>(initialPosts);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<FeedCursor | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const response = await fetchFunction(cursorRef.current || undefined);

      if (response.posts.length > 0) {
        setPosts((prev) => [...prev, ...response.posts]);
        cursorRef.current = response.nextCursor;
        setHasMore(response.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
      // Don't set hasMore to false on error - allow retry
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchFunction, isLoadingMore, hasMore]);

  const refresh = useCallback(async () => {
    // Reset state
    cursorRef.current = null;
    setHasMore(true);

    try {
      const response = await fetchFunction();
      setPosts(response.posts);
      cursorRef.current = response.nextCursor;
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Error refreshing feed:', error);
      setPosts([]);
    }
  }, [fetchFunction]);

  return {
    posts,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
    setPosts,
  };
}
