import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { StoryWithType } from '@/types/content';
import { storyViewService } from '@/services/story/storyViewService';
import { useAuthStore } from '@/stores/authStore';
import { useStories } from './useStories';

interface UseStoryViewerResult {
  // Current story data
  currentStory: StoryWithType | null;
  currentUserStories: StoryWithType[];
  currentStoryIndex: number;
  currentUserIndex: number;

  // Progress
  progress: number;
  isPaused: boolean;

  // Navigation
  goToNext: () => void;
  goToPrevious: () => void;
  goToNextUser: () => void;
  goToPreviousUser: () => void;

  // Controls
  pause: () => void;
  resume: () => void;
  dismiss: () => void;

  // State
  isLoading: boolean;
  error: Error | null;
  viewCount: number;
  isOwner: boolean;
}

const STORY_DURATION_MS = 5000; // 5 seconds per story
const PROGRESS_INTERVAL_MS = 50; // Update progress every 50ms

export function useStoryViewer(initialStoryId: string): UseStoryViewerResult {
  const router = useRouter();
  const params = useLocalSearchParams<{ allStoryIds?: string; startIndex?: string }>();
  const { user } = useAuthStore();
  const { storySummaries } = useStories();

  // Parse navigation data
  const allStoryIds = useMemo(() => params.allStoryIds?.split(',') || [], [params.allStoryIds]);

  // State
  const [currentStoryId, setCurrentStoryId] = useState(initialStoryId);
  const [currentStory, setCurrentStory] = useState<StoryWithType | null>(null);
  const [currentUserStories, setCurrentUserStories] = useState<StoryWithType[]>([]);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [viewCount, setViewCount] = useState(0);

  // Refs
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<number>(Date.now());
  const elapsedBeforePause = useRef<number>(0);

  // Calculate indices
  const currentGlobalIndex = allStoryIds.indexOf(currentStoryId);
  const currentUserIndex = storySummaries.findIndex((summary) =>
    summary.stories.some((story) => story.id === currentStoryId)
  );
  const currentStoryIndex = currentUserStories.findIndex((story) => story.id === currentStoryId);

  const isOwner = currentStory?.user_id === user?.id;

  // Load story data
  const loadStory = useCallback(
    async (storyId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const story = await storyViewService.getStory(storyId);
        if (!story) {
          throw new Error('Story not found');
        }

        // Check if expired
        if (new Date(story.expires_at) < new Date()) {
          throw new Error('Story has expired');
        }

        setCurrentStory(story);
        setViewCount(story.view_count || 0);

        // Load all stories for this user
        if (story.user_id) {
          const userStories = await storyViewService.getStoriesForUser(story.user_id);
          setCurrentUserStories(userStories);
        }

        // Track view
        if (user?.id && story.user_id !== user.id) {
          storyViewService.trackStoryView(storyId, user.id);
        }
      } catch (err) {
        setError(err as Error);
        console.error('Failed to load story:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  // Progress timer
  const startProgressTimer = useCallback(() => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
    }

    startTime.current = Date.now() - elapsedBeforePause.current;

    progressTimer.current = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const newProgress = Math.min((elapsed / STORY_DURATION_MS) * 100, 100);

      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(progressTimer.current!);
        progressTimer.current = null;
        goToNext();
      }
    }, PROGRESS_INTERVAL_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // goToNext is intentionally excluded to avoid circular dependency

  // Navigation functions
  const goToNext = useCallback(() => {
    // First try next story from same user
    if (currentStoryIndex < currentUserStories.length - 1) {
      const nextStory = currentUserStories[currentStoryIndex + 1];
      setCurrentStoryId(nextStory.id);
      setProgress(0);
      elapsedBeforePause.current = 0;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Go to next user
      goToNextUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStoryIndex, currentUserStories]); // goToNextUser excluded to avoid circular dependency

  const goToPrevious = useCallback(() => {
    // If we're past 10% progress, restart current story
    if (progress > 10) {
      setProgress(0);
      elapsedBeforePause.current = 0;
      startProgressTimer();
      return;
    }

    // Try previous story from same user
    if (currentStoryIndex > 0) {
      const prevStory = currentUserStories[currentStoryIndex - 1];
      setCurrentStoryId(prevStory.id);
      setProgress(0);
      elapsedBeforePause.current = 0;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Go to previous user's last story
      goToPreviousUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStoryIndex, currentUserStories, progress, startProgressTimer]); // goToPreviousUser excluded to avoid circular dependency

  const goToNextUser = useCallback(() => {
    const nextGlobalIndex = currentGlobalIndex + 1;
    if (nextGlobalIndex < allStoryIds.length) {
      setCurrentStoryId(allStoryIds[nextGlobalIndex]);
      setProgress(0);
      elapsedBeforePause.current = 0;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // End of all stories
      dismiss();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGlobalIndex, allStoryIds]); // dismiss excluded to avoid circular dependency

  const goToPreviousUser = useCallback(() => {
    const prevGlobalIndex = currentGlobalIndex - 1;
    if (prevGlobalIndex >= 0) {
      // Find the user this story belongs to and go to their last story
      const prevStoryId = allStoryIds[prevGlobalIndex];
      const userSummary = storySummaries.find((summary) =>
        summary.stories.some((story) => story.id === prevStoryId)
      );

      if (userSummary) {
        const lastStory = userSummary.stories[userSummary.stories.length - 1];
        setCurrentStoryId(lastStory.id);
        setProgress(0);
        elapsedBeforePause.current = 0;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [currentGlobalIndex, allStoryIds, storySummaries]);

  // Control functions
  const pause = useCallback(() => {
    if (!isPaused && progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
      elapsedBeforePause.current = Date.now() - startTime.current;
      setIsPaused(true);
    }
  }, [isPaused]);

  const resume = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      startProgressTimer();
    }
  }, [isPaused, startProgressTimer]);

  const dismiss = useCallback(() => {
    // Cancel any pending view tracking
    storyViewService.cancelAllViewTracking();

    // Clear timer
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }

    // Navigate back
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(drawer)/(tabs)');
    }
  }, [router]);

  // Effects
  useEffect(() => {
    loadStory(currentStoryId);
  }, [currentStoryId, loadStory]);

  useEffect(() => {
    if (!isLoading && !error && !isPaused) {
      startProgressTimer();
    }

    return () => {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    };
  }, [isLoading, error, isPaused, startProgressTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      storyViewService.cancelAllViewTracking();
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    };
  }, []);

  return {
    currentStory,
    currentUserStories,
    currentStoryIndex,
    currentUserIndex,
    progress,
    isPaused,
    goToNext,
    goToPrevious,
    goToNextUser,
    goToPreviousUser,
    pause,
    resume,
    dismiss,
    isLoading,
    error,
    viewCount,
    isOwner,
  };
}
