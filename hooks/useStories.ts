import { useState, useEffect, useCallback } from 'react';
import { getActiveStories } from '@/services/content/storyService';
import { useAuth } from './useAuth';

export interface StoryForUI {
  id: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string | null;
  };
  created_at: string;
  hasUnwatched: boolean;
  isOwn: boolean;
}

export function useStories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<StoryForUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStories = useCallback(async () => {
    try {
      const activeStories = await getActiveStories();

      // Transform stories for UI consumption
      const transformedStories: StoryForUI[] = activeStories.map((story) => ({
        id: story.id,
        user: {
          id: story.user_id,
          username: story.user?.username || 'Unknown',
          avatar_url: story.user?.avatar_url,
        },
        created_at: story.created_at || new Date().toISOString(),
        hasUnwatched: true, // For now, all stories are unwatched (Epic 4 will add view tracking)
        isOwn: story.user_id === user?.id,
      }));

      // Sort to put user's own story first
      transformedStories.sort((a, b) => {
        if (a.isOwn) return -1;
        if (b.isOwn) return 1;
        return 0;
      });

      setStories(transformedStories);
      setError(null);
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError(err as Error);
      setStories([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  return {
    stories,
    isLoading,
    error,
    refetch: fetchStories,
  };
}
