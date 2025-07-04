import { useState, useEffect, useCallback } from 'react';
import { friendDiscoveryService } from '@/services/social/friendDiscoveryService';
import { useAuthStore } from '@/stores/authStore';
import { UserWithStats } from '@/services/search/searchService';

interface UseFriendDiscoveryReturn {
  suggestions: UserWithStats[];
  isLoading: boolean;
  error: string | null;
  followingStatus: Record<string, boolean>;
  updateFollowingStatus: (userId: string, isFollowing: boolean) => void;
  refresh: () => Promise<void>;
}

export function useFriendDiscovery(): UseFriendDiscoveryReturn {
  const { user } = useAuthStore();
  const [suggestions, setSuggestions] = useState<UserWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

  const loadSuggestions = useCallback(async () => {
    if (!user?.id) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get more suggestions than needed to account for filtering
      const friendSuggestions = await friendDiscoveryService.getSuggestions(user.id, 20);

      console.log('[useFriendDiscovery] Got suggestions:', friendSuggestions.length);
      console.log(
        '[useFriendDiscovery] First few suggestions:',
        friendSuggestions.slice(0, 3).map((s) => ({
          id: s.id,
          username: s.username,
        }))
      );

      // Get current following relationships
      const { supabase } = await import('@/services/supabase/client');

      // Get ALL users that the current user is following
      const { data: allFollowingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = new Set(allFollowingData?.map((f) => f.following_id) || []);

      console.log('[useFriendDiscovery] Total users I follow:', followingIds.size);
      console.log('[useFriendDiscovery] Checking which suggestions I already follow...');

      // Check overlap
      const suggestedUserIds = friendSuggestions.map((s) => s.id);
      const alreadyFollowing = suggestedUserIds.filter((id) => followingIds.has(id));
      console.log(
        '[useFriendDiscovery] Already following from suggestions:',
        alreadyFollowing.length
      );

      // Filter out users that are already being followed
      const unfollowedSuggestions = friendSuggestions
        .filter((suggestion) => !followingIds.has(suggestion.id))
        .slice(0, 10); // Take first 10 unfollowed users

      console.log('[useFriendDiscovery] Unfollowed suggestions:', unfollowedSuggestions.length);
      console.log(
        '[useFriendDiscovery] Unfollowed users:',
        unfollowedSuggestions.map((s) => s.username)
      );

      setSuggestions(unfollowedSuggestions);
    } catch (err) {
      console.error('Error loading friend suggestions:', err);
      setError('Failed to load suggestions');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const loadFollowingStatus = useCallback(
    async (userIds: string[]) => {
      if (!user?.id || userIds.length === 0) return;

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

  // Load following status when suggestions change
  useEffect(() => {
    if (suggestions.length > 0) {
      loadFollowingStatus(suggestions.map((s) => s.id));
    }
  }, [suggestions, loadFollowingStatus]);

  const updateFollowingStatus = useCallback((userId: string, isFollowing: boolean) => {
    setFollowingStatus((prev) => ({
      ...prev,
      [userId]: isFollowing,
    }));

    // If the user is now being followed, remove them from suggestions
    if (isFollowing) {
      setSuggestions((prev) => prev.filter((user) => user.id !== userId));
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadSuggestions();
  }, [loadSuggestions]);

  return {
    suggestions,
    isLoading,
    error,
    followingStatus,
    updateFollowingStatus,
    refresh,
  };
}
