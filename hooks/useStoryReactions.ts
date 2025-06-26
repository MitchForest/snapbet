import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { reactionService, ReactionSummary } from '@/services/engagement/reactionService';
import { useAuth } from '@/hooks/useAuth';
import { toastService } from '@/services/toastService';

// Simple debounce implementation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };

  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
  };

  return debounced as T & { cancel: () => void };
}

interface UseStoryReactionsResult {
  reactions: ReactionSummary[];
  userReaction: string | null;
  totalReactions: number;
  isLoading: boolean;
  toggleReaction: (emoji: string) => void;
  refreshReactions: () => Promise<void>;
}

export function useStoryReactions(storyId: string): UseStoryReactionsResult {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<ReactionSummary[]>([]);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track pending reaction changes for rollback
  const previousUserReaction = useRef<string | null>(null);

  // Calculate total reactions
  const totalReactions = useMemo(() => reactions.reduce((sum, r) => sum + r.count, 0), [reactions]);

  // Load reactions and user's reaction
  const loadReactions = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load aggregated reactions
      const reactionSummary = await reactionService.getReactions(storyId, true);
      setReactions(reactionSummary);

      // Load user's reaction if logged in
      if (user) {
        const userEmoji = await reactionService.getUserReaction(storyId, user.id, true);
        setUserReaction(userEmoji);
        previousUserReaction.current = userEmoji;
      }
    } catch (err) {
      console.error('Failed to load story reactions:', err);
      toastService.showError('Failed to load reactions');
    } finally {
      setIsLoading(false);
    }
  }, [storyId, user]);

  // Optimistic reaction update
  const updateReactionsOptimistically = useCallback(
    (emoji: string, isAdding: boolean, previousEmoji: string | null) => {
      setReactions((prev) => {
        const newReactions = [...prev];

        // Handle previous emoji removal
        if (previousEmoji) {
          const prevIndex = newReactions.findIndex((r) => r.emoji === previousEmoji);
          if (prevIndex >= 0) {
            newReactions[prevIndex] = {
              ...newReactions[prevIndex],
              count: Math.max(0, newReactions[prevIndex].count - 1),
            };
            // Remove if count is 0
            if (newReactions[prevIndex].count === 0) {
              newReactions.splice(prevIndex, 1);
            }
          }
        }

        // Handle new emoji
        if (isAdding) {
          const emojiIndex = newReactions.findIndex((r) => r.emoji === emoji);
          if (emojiIndex >= 0) {
            newReactions[emojiIndex] = {
              ...newReactions[emojiIndex],
              count: newReactions[emojiIndex].count + 1,
            };
          } else {
            newReactions.push({ emoji, count: 1 });
          }
        }

        // Sort by count
        return newReactions.sort((a, b) => b.count - a.count);
      });
    },
    []
  );

  // Debounced toggle reaction
  const toggleReactionDebounced = useMemo(
    () =>
      debounce(async (emoji: string) => {
        if (!user) {
          toastService.showError('Please sign in to react');
          return;
        }

        try {
          const result = await reactionService.toggleReaction(storyId, emoji, true);

          if (result.removed) {
            toastService.showSuccess('Reaction removed');
          }
        } catch (err) {
          // Rollback on error
          const currentReaction = userReaction;
          setUserReaction(previousUserReaction.current);

          // Rollback reaction counts
          if (currentReaction && currentReaction !== previousUserReaction.current) {
            // Was adding/changing
            updateReactionsOptimistically(
              previousUserReaction.current || '',
              !!previousUserReaction.current,
              currentReaction
            );
          } else if (!currentReaction && previousUserReaction.current) {
            // Was removing
            updateReactionsOptimistically(previousUserReaction.current, true, null);
          }

          const errorMessage = err instanceof Error ? err.message : 'Failed to update reaction';
          toastService.showError(errorMessage);
        }
      }, 300),
    [storyId, user, userReaction, updateReactionsOptimistically]
  );

  // Toggle reaction handler
  const toggleReaction = useCallback(
    (emoji: string) => {
      if (!user) {
        toastService.showError('Please sign in to react');
        return;
      }

      // Store current state for potential rollback
      previousUserReaction.current = userReaction;

      // Optimistic update
      const isRemoving = userReaction === emoji;
      const newReaction = isRemoving ? null : emoji;

      setUserReaction(newReaction);
      updateReactionsOptimistically(emoji, !isRemoving, userReaction);

      // Debounced API call
      toggleReactionDebounced(emoji);
    },
    [user, userReaction, updateReactionsOptimistically, toggleReactionDebounced]
  );

  // Refresh reactions
  const refreshReactions = useCallback(async () => {
    await loadReactions();
  }, [loadReactions]);

  // Initial load
  useEffect(() => {
    if (storyId) {
      loadReactions();
    }
  }, [storyId, loadReactions]);

  // Cleanup
  useEffect(() => {
    return () => {
      toggleReactionDebounced.cancel();
    };
  }, [toggleReactionDebounced]);

  return {
    reactions,
    userReaction,
    totalReactions,
    isLoading,
    toggleReaction,
    refreshReactions,
  };
}
