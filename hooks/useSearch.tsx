import { useState, useEffect, useCallback, useRef } from 'react';
import { searchUsers, UserWithStats, MIN_SEARCH_LENGTH } from '@/services/search/searchService';
import { RecentSearch, recentSearchesHelpers } from '@/components/search/RecentSearches';
import { useAuthStore } from '@/stores/authStore';

const SEARCH_DEBOUNCE_MS = 300;

export type SearchState = 'idle' | 'searching' | 'results' | 'empty';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserWithStats[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { session } = useAuthStore();

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(recentSearchesHelpers.load());
  }, []);

  const loadFollowingStatus = useCallback(
    async (userIds: string[]) => {
      if (!session?.user?.id) return;

      try {
        const { supabase } = await import('@/services/supabase/client');
        const { data } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', session.user.id)
          .in('following_id', userIds);

        const followingMap: Record<string, boolean> = {};
        userIds.forEach((id) => {
          followingMap[id] = data?.some((f) => f.following_id === id) || false;
        });

        setFollowingStatus(followingMap);
      } catch (error) {
        console.error('Error loading following status:', error);
      }
    },
    [session?.user?.id]
  );

  // Load following status for search results
  useEffect(() => {
    if (results.length > 0 && session?.user?.id) {
      loadFollowingStatus(results.map((u) => u.id));
    }
  }, [results, session?.user?.id, loadFollowingStatus]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < MIN_SEARCH_LENGTH) {
      setResults([]);
      setSearchState('idle');
      return;
    }

    setIsSearching(true);
    setSearchState('searching');

    try {
      const searchResults = await searchUsers(searchQuery);
      setResults(searchResults);
      setSearchState(searchResults.length > 0 ? 'results' : 'empty');
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setSearchState('empty');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);

      // Clear any existing timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Reset state for empty query
      if (newQuery.length === 0) {
        setResults([]);
        setSearchState('idle');
        return;
      }

      // Set up new debounced search
      debounceTimer.current = setTimeout(() => {
        performSearch(newQuery);
      }, SEARCH_DEBOUNCE_MS);
    },
    [performSearch]
  );

  const handleUserSelect = useCallback((user: UserWithStats) => {
    // Add to recent searches
    const updated = recentSearchesHelpers.add({
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
    });
    setRecentSearches(updated);
  }, []);

  const handleRecentSearchSelect = useCallback(
    (search: RecentSearch) => {
      setQuery(`@${search.username}`);
      performSearch(search.username);
    },
    [performSearch]
  );

  const clearRecentSearches = useCallback(() => {
    const updated = recentSearchesHelpers.clear();
    setRecentSearches(updated);
  }, []);

  const updateFollowingStatus = useCallback((userId: string, isFollowing: boolean) => {
    setFollowingStatus((prev) => ({
      ...prev,
      [userId]: isFollowing,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    query,
    setQuery: handleQueryChange,
    results,
    isSearching,
    searchState,
    recentSearches,
    followingStatus,
    onUserSelect: handleUserSelect,
    onRecentSearchSelect: handleRecentSearchSelect,
    clearRecentSearches,
    updateFollowingStatus,
  };
}
