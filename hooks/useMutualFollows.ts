import { useState, useEffect } from 'react';
import { followService } from '@/services/social/followService';
import { useAuthStore } from '@/stores/authStore';

interface UseMutualFollowsReturn {
  mutualFollows: Map<string, boolean>;
  isLoading: boolean;
  checkMutualFollow: (userId: string) => boolean;
}

export function useMutualFollows(userIds: string[]): UseMutualFollowsReturn {
  const currentUser = useAuthStore((state) => state.user);
  const [mutualFollows, setMutualFollows] = useState<Map<string, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id || userIds.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchMutualFollows = async () => {
      try {
        const results = await followService.checkMutualFollows(userIds);
        setMutualFollows(results);
      } catch (error) {
        console.error('Error fetching mutual follows:', error);
        // Set all to false on error
        const errorMap = new Map<string, boolean>();
        userIds.forEach((id) => errorMap.set(id, false));
        setMutualFollows(errorMap);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMutualFollows();
  }, [currentUser?.id, userIds.join(',')]); // Join userIds to create stable dependency

  const checkMutualFollow = (userId: string): boolean => {
    return mutualFollows.get(userId) || false;
  };

  return {
    mutualFollows,
    isLoading,
    checkMutualFollow,
  };
}
