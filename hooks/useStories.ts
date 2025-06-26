import { useState, useEffect, useCallback } from 'react';
import { StoryWithType } from '@/types/content';
import { supabase } from '@/services/supabase';
import { useAuth } from './useAuth';
import { getFollowingIds } from '@/services/api/followUser';
import { eventEmitter, FeedEvents } from '@/utils/eventEmitter';

interface StorySummary {
  id: string;
  username: string;
  avatar?: string;
  hasUnwatched: boolean;
  isLive?: boolean;
  stories: StoryWithType[];
}

export function useStories() {
  const { user } = useAuth();
  const [storySummaries, setStorySummaries] = useState<StorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStories = useCallback(async () => {
    if (!user?.id) {
      setStorySummaries([]);
      setIsLoading(false);
      return;
    }

    try {
      // Get following IDs
      const followingIds = await getFollowingIds();

      // Include self
      const userIds = [...followingIds, user.id];

      // Fetch active stories from followed users
      const { data, error: fetchError } = await supabase
        .from('stories')
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
        .in('user_id', userIds)
        .is('deleted_at', null)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Group stories by user
      const storiesByUser = new Map<string, StoryWithType[]>();
      const userMap = new Map<string, { username: string; avatar_url: string | null }>();

      (data || []).forEach((story) => {
        const userId = story.user_id;
        if (!storiesByUser.has(userId)) {
          storiesByUser.set(userId, []);
          if (story.user) {
            userMap.set(userId, {
              username: story.user.username || 'unknown',
              avatar_url: story.user.avatar_url,
            });
          }
        }
        storiesByUser.get(userId)!.push(story as StoryWithType);
      });

      // Check viewed stories
      const viewedStoryIds = await getViewedStoryIds(user.id);

      // Create summaries with self first
      const summaries: StorySummary[] = [];

      // Add self first if has stories
      if (storiesByUser.has(user.id)) {
        const userStories = storiesByUser.get(user.id)!;
        const userData = userMap.get(user.id);
        summaries.push({
          id: user.id,
          username: 'You',
          avatar: userData?.avatar_url || undefined,
          hasUnwatched: userStories.some((s) => !viewedStoryIds.has(s.id)),
          stories: userStories,
        });
      }

      // Add other users
      storiesByUser.forEach((stories, userId) => {
        if (userId !== user.id) {
          const userData = userMap.get(userId);
          summaries.push({
            id: userId,
            username: userData?.username || 'unknown',
            avatar: userData?.avatar_url || undefined,
            hasUnwatched: stories.some((s) => !viewedStoryIds.has(s.id)),
            stories,
          });
        }
      });

      setStorySummaries(summaries);
      setError(null);
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError(err as Error);
      setStorySummaries([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Listen for story creation events
  useEffect(() => {
    const subscription = eventEmitter.addListener(FeedEvents.STORY_CREATED, () => {
      fetchStories();
    });

    return () => {
      subscription.remove();
    };
  }, [fetchStories]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  return {
    storySummaries,
    isLoading,
    error,
    refetch: fetchStories,
  };
}

// Helper function to get viewed story IDs
async function getViewedStoryIds(userId: string): Promise<Set<string>> {
  try {
    const { data } = await supabase.from('story_views').select('story_id').eq('viewer_id', userId);

    return new Set((data || []).map((view) => view.story_id));
  } catch (error) {
    console.error('Error fetching viewed stories:', error);
    return new Set();
  }
}
