import { useState, useEffect, useCallback } from 'react';
import {
  UserWithStats,
  TrendingPickUser,
  getHotBettors,
  getTrendingPickUsers,
  getFadeMaterial,
  getRisingStars,
} from '@/services/search/searchService';
import { useAuthStore } from '@/stores/authStore';
import { Storage, CacheUtils } from '@/services/storage/storageService';

const DISCOVERY_CACHE_MINUTES = 5;
const CACHE_TTL = DISCOVERY_CACHE_MINUTES * 60 * 1000;
const STAGGER_DELAY_MS = 100;

interface DiscoveryData {
  hotBettors: UserWithStats[];
  trendingPicks: TrendingPickUser[];
  fadeMaterial: UserWithStats[];
  risingStars: UserWithStats[];
}

interface LoadingState {
  hot: boolean;
  trending: boolean;
  fade: boolean;
  rising: boolean;
}

interface ErrorState {
  hot: string | null;
  trending: string | null;
  fade: string | null;
  rising: string | null;
}

export function useDiscovery() {
  const [data, setData] = useState<DiscoveryData>({
    hotBettors: [],
    trendingPicks: [],
    fadeMaterial: [],
    risingStars: [],
  });

  const [isLoading, setIsLoading] = useState<LoadingState>({
    hot: true,
    trending: true,
    fade: true,
    rising: true,
  });

  const [errors, setErrors] = useState<ErrorState>({
    hot: null,
    trending: null,
    fade: null,
    rising: null,
  });

  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
  const { user } = useAuthStore();

  const loadFollowingStatus = useCallback(
    async (userIds: string[]) => {
      if (!user?.id) return;

      try {
        const { supabase } = await import('@/services/supabase/client');
        const { data } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
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
    [user?.id]
  );

  const loadHotBettors = useCallback(async () => {
    const cacheKey = CacheUtils.getCacheKey('discovery', 'hot');
    const cached = Storage.general.get<{ data: UserWithStats[]; timestamp: number }>(cacheKey);

    console.log('[useDiscovery] loadHotBettors called');
    console.log('[useDiscovery] Cache key:', cacheKey);
    console.log('[useDiscovery] Cached data exists:', !!cached);

    if (cached && !CacheUtils.isExpired(cached.timestamp, CACHE_TTL)) {
      console.log('[useDiscovery] Using cached data with', cached.data.length, 'hot bettors');
      setData((prev) => ({ ...prev, hotBettors: cached.data }));
      setIsLoading((prev) => ({ ...prev, hot: false }));
      return;
    }

    console.log('[useDiscovery] Cache miss or expired, fetching fresh data');
    setIsLoading((prev) => ({ ...prev, hot: true }));
    setErrors((prev) => ({ ...prev, hot: null }));

    try {
      const hotBettors = await getHotBettors();
      console.log('[useDiscovery] Fetched', hotBettors.length, 'hot bettors from API');
      setData((prev) => ({ ...prev, hotBettors }));
      Storage.general.set(cacheKey, { data: hotBettors, timestamp: Date.now() });
    } catch (error) {
      console.error('[useDiscovery] Error loading hot bettors:', error);
      setErrors((prev) => ({
        ...prev,
        hot: error instanceof Error ? error.message : 'Failed to load hot bettors',
      }));
      setData((prev) => ({ ...prev, hotBettors: [] }));
    } finally {
      setIsLoading((prev) => ({ ...prev, hot: false }));
    }
  }, []);

  const loadTrendingPicks = useCallback(async () => {
    const cacheKey = CacheUtils.getCacheKey('discovery', 'trending');
    const cached = Storage.general.get<{ data: TrendingPickUser[]; timestamp: number }>(cacheKey);

    if (cached && !CacheUtils.isExpired(cached.timestamp, CACHE_TTL)) {
      setData((prev) => ({ ...prev, trendingPicks: cached.data }));
      setIsLoading((prev) => ({ ...prev, trending: false }));
      return;
    }

    setIsLoading((prev) => ({ ...prev, trending: true }));
    setErrors((prev) => ({ ...prev, trending: null }));

    try {
      const trendingPicks = await getTrendingPickUsers();
      setData((prev) => ({ ...prev, trendingPicks }));
      Storage.general.set(cacheKey, { data: trendingPicks, timestamp: Date.now() });
    } catch (error) {
      console.error('Error loading trending picks:', error);
      setErrors((prev) => ({
        ...prev,
        trending: error instanceof Error ? error.message : 'Failed to load trending picks',
      }));
      setData((prev) => ({ ...prev, trendingPicks: [] }));
    } finally {
      setIsLoading((prev) => ({ ...prev, trending: false }));
    }
  }, []);

  const loadFadeMaterial = useCallback(async () => {
    const cacheKey = CacheUtils.getCacheKey('discovery', 'fade');
    const cached = Storage.general.get<{ data: UserWithStats[]; timestamp: number }>(cacheKey);

    if (cached && !CacheUtils.isExpired(cached.timestamp, CACHE_TTL)) {
      setData((prev) => ({ ...prev, fadeMaterial: cached.data }));
      setIsLoading((prev) => ({ ...prev, fade: false }));
      return;
    }

    setIsLoading((prev) => ({ ...prev, fade: true }));
    setErrors((prev) => ({ ...prev, fade: null }));

    try {
      const fadeMaterial = await getFadeMaterial();
      setData((prev) => ({ ...prev, fadeMaterial }));
      Storage.general.set(cacheKey, { data: fadeMaterial, timestamp: Date.now() });
    } catch (error) {
      console.error('Error loading fade material:', error);
      setErrors((prev) => ({
        ...prev,
        fade: error instanceof Error ? error.message : 'Failed to load fade material',
      }));
      setData((prev) => ({ ...prev, fadeMaterial: [] }));
    } finally {
      setIsLoading((prev) => ({ ...prev, fade: false }));
    }
  }, []);

  const loadRisingStars = useCallback(async () => {
    const cacheKey = CacheUtils.getCacheKey('discovery', 'rising');
    const cached = Storage.general.get<{ data: UserWithStats[]; timestamp: number }>(cacheKey);

    if (cached && !CacheUtils.isExpired(cached.timestamp, CACHE_TTL)) {
      setData((prev) => ({ ...prev, risingStars: cached.data }));
      setIsLoading((prev) => ({ ...prev, rising: false }));
      return;
    }

    setIsLoading((prev) => ({ ...prev, rising: true }));
    setErrors((prev) => ({ ...prev, rising: null }));

    try {
      const risingStars = await getRisingStars();
      setData((prev) => ({ ...prev, risingStars }));
      Storage.general.set(cacheKey, { data: risingStars, timestamp: Date.now() });
    } catch (error) {
      console.error('Error loading rising stars:', error);
      setErrors((prev) => ({
        ...prev,
        rising: error instanceof Error ? error.message : 'Failed to load rising stars',
      }));
      setData((prev) => ({ ...prev, risingStars: [] }));
    } finally {
      setIsLoading((prev) => ({ ...prev, rising: false }));
    }
  }, []);

  // Load discovery sections
  const loadDiscoverySections = useCallback(async () => {
    // Load hot bettors immediately
    loadHotBettors();

    // Stagger loading of other sections
    const timer = setTimeout(() => {
      loadTrendingPicks();
      loadFadeMaterial();
      loadRisingStars();
    }, STAGGER_DELAY_MS);

    return () => clearTimeout(timer);
  }, [loadHotBettors, loadTrendingPicks, loadFadeMaterial, loadRisingStars]);

  // Initial load
  useEffect(() => {
    loadDiscoverySections();
  }, [loadDiscoverySections]);

  // Load following status when data changes
  useEffect(() => {
    if (user?.id) {
      const allUserIds = [
        ...data.hotBettors.map((u) => u.id),
        ...data.trendingPicks.map((u) => u.user_id),
        ...data.fadeMaterial.map((u) => u.id),
        ...data.risingStars.map((u) => u.id),
      ];

      if (allUserIds.length > 0) {
        loadFollowingStatus(allUserIds);
      }
    }
  }, [data, user?.id, loadFollowingStatus]);

  const updateFollowingStatus = useCallback((userId: string, isFollowing: boolean) => {
    setFollowingStatus((prev) => ({
      ...prev,
      [userId]: isFollowing,
    }));
  }, []);

  const refreshAll = useCallback(() => {
    loadHotBettors();
    loadTrendingPicks();
    loadFadeMaterial();
    loadRisingStars();
  }, [loadHotBettors, loadTrendingPicks, loadFadeMaterial, loadRisingStars]);

  const refreshHot = useCallback(async () => {
    // Clear cache to force fresh data
    const cacheKey = CacheUtils.getCacheKey('discovery', 'hot');
    Storage.general.delete(cacheKey);
    console.log('[useDiscovery] Cleared hot bettors cache, forcing refresh');

    // Now load fresh data
    await loadHotBettors();
  }, [loadHotBettors]);

  return {
    hotBettors: data.hotBettors,
    trendingPicks: data.trendingPicks,
    fadeMaterial: data.fadeMaterial,
    risingStars: data.risingStars,
    isLoading,
    errors,
    followingStatus,
    updateFollowingStatus,
    refreshHot,
    refreshTrending: loadTrendingPicks,
    refreshFade: loadFadeMaterial,
    refreshRising: loadRisingStars,
    refreshAll,
  };
}
