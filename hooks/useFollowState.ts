import { useState, useEffect, useCallback } from 'react';
import { followService } from '@/services/social/followService';
import { toastService } from '@/services/toastService';
import { useAuthStore } from '@/stores/authStore';

interface UseFollowStateOptions {
  onFollowChange?: (isFollowing: boolean) => void;
}

interface UseFollowStateReturn {
  isFollowing: boolean;
  isFollower: boolean;
  isMutual: boolean;
  isPending: boolean;
  isLoading: boolean;
  toggleFollow: () => Promise<void>;
}

export function useFollowState(
  targetUserId: string,
  options?: UseFollowStateOptions
): UseFollowStateReturn {
  const currentUser = useAuthStore((state) => state.user);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollower, setIsFollower] = useState(false);
  const [isMutual, setIsMutual] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch initial follow state
  useEffect(() => {
    if (!currentUser?.id || !targetUserId) {
      setIsInitializing(false);
      return;
    }

    const fetchFollowState = async () => {
      try {
        const state = await followService.getFollowState(targetUserId, currentUser.id);
        setIsFollowing(state.isFollowing);
        setIsMutual(state.isMutual);
        setIsPending(state.isPending || false);

        // Also check if they follow us
        const reverseState = await followService.getFollowState(currentUser.id, targetUserId);
        setIsFollower(reverseState.isFollowing);
      } catch (error) {
        console.error('Error fetching follow state:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchFollowState();
  }, [currentUser?.id, targetUserId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!currentUser?.id || !targetUserId) return;

    const unsubscribe = followService.subscribeToUserFollows(currentUser.id, {
      onChange: async (change) => {
        if (change.userId === targetUserId) {
          // Re-fetch state when there's a change involving this user
          const state = await followService.getFollowState(targetUserId, currentUser.id);
          setIsFollowing(state.isFollowing);
          setIsMutual(state.isMutual);
          setIsPending(state.isPending || false);

          const reverseState = await followService.getFollowState(currentUser.id, targetUserId);
          setIsFollower(reverseState.isFollowing);
        }
      },
    });

    return unsubscribe;
  }, [currentUser?.id, targetUserId]);

  const toggleFollow = useCallback(async () => {
    if (!currentUser?.id || !targetUserId || isLoading) return;

    const newFollowState = !isFollowing;

    // Optimistic update
    setIsFollowing(newFollowState);
    setIsMutual(newFollowState && isFollower);
    options?.onFollowChange?.(newFollowState);
    setIsLoading(true);

    try {
      const result = await followService.toggleFollow(targetUserId, isFollowing);

      if (!result.success) {
        // Revert on error
        setIsFollowing(!newFollowState);
        setIsMutual(isFollowing && isFollower);
        options?.onFollowChange?.(!newFollowState);

        if (result.error) {
          toastService.show({
            message: result.error,
            type: 'error',
          });
        }
      }
    } catch {
      // Revert on error
      setIsFollowing(!newFollowState);
      setIsMutual(isFollowing && isFollower);
      options?.onFollowChange?.(!newFollowState);

      toastService.show({
        message: newFollowState ? "Couldn't follow user" : "Couldn't unfollow user",
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id, targetUserId, isFollowing, isFollower, isLoading, options]);

  return {
    isFollowing,
    isFollower,
    isMutual,
    isPending,
    isLoading: isLoading || isInitializing,
    toggleFollow,
  };
}
