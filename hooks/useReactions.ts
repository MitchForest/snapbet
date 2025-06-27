import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { reactionService, ReactionSummary } from '@/services/engagement/reactionService';
import { subscriptionManager } from '@/services/realtime/subscriptionManager';
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

interface UseReactionsResult {
  reactions: ReactionSummary[];
  userReactions: string[];
  totalReactions: number;
  isLoading: boolean;
  toggleReaction: (emoji: string) => void;
  refreshReactions: () => Promise<void>;
}

export function useReactions(postId: string): UseReactionsResult {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<ReactionSummary[]>([]);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Track pending reaction changes for rollback
  const previousUserReactions = useRef<string[]>([]);
  const isSubscribed = useRef(false);

  // Calculate total reactions
  const totalReactions = useMemo(() => reactions.reduce((sum, r) => sum + r.count, 0), [reactions]);

  // Load reactions and user's reactions
  const loadReactions = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load aggregated reactions
      const reactionSummary = await reactionService.getReactions(postId);
      setReactions(reactionSummary);

      // Load user's reactions if logged in
      if (user) {
        const userEmojis = await reactionService.getUserReactions(postId, user.id);
        setUserReactions(userEmojis);
        previousUserReactions.current = userEmojis;
      }
    } catch (err) {
      console.error('Failed to load reactions:', err);
      toastService.showError('Failed to load reactions');
    } finally {
      setIsLoading(false);
    }
  }, [postId, user]);

  // Optimistic reaction update
  const updateReactionsOptimistically = useCallback((emoji: string, isAdding: boolean) => {
    setReactions((prev) => {
      const newReactions = [...prev];
      const emojiIndex = newReactions.findIndex((r) => r.emoji === emoji);

      if (isAdding) {
        // Adding reaction
        if (emojiIndex >= 0) {
          newReactions[emojiIndex] = {
            ...newReactions[emojiIndex],
            count: newReactions[emojiIndex].count + 1,
          };
        } else {
          newReactions.push({ emoji, count: 1 });
        }
      } else {
        // Removing reaction
        if (emojiIndex >= 0) {
          newReactions[emojiIndex] = {
            ...newReactions[emojiIndex],
            count: Math.max(0, newReactions[emojiIndex].count - 1),
          };
          // Remove if count is 0
          if (newReactions[emojiIndex].count === 0) {
            newReactions.splice(emojiIndex, 1);
          }
        }
      }

      // Sort by count
      return newReactions.sort((a, b) => b.count - a.count);
    });
  }, []);

  // Debounced toggle reaction
  const toggleReactionDebounced = useMemo(
    () =>
      debounce(async (emoji: string) => {
        if (!user) {
          toastService.showError('Please sign in to react');
          return;
        }

        try {
          const result = await reactionService.toggleReaction(postId, emoji);

          if (result.removed) {
            toastService.showSuccess('Reaction removed');
          }
        } catch (err) {
          // Rollback on error
          setUserReactions(previousUserReactions.current);

          // Rollback reaction counts
          const wasAdding = !previousUserReactions.current.includes(emoji);
          updateReactionsOptimistically(emoji, !wasAdding);

          const errorMessage = err instanceof Error ? err.message : 'Failed to update reaction';
          toastService.showError(errorMessage);
        }
      }, 300),
    [postId, user, updateReactionsOptimistically]
  );

  // Toggle reaction handler
  const toggleReaction = useCallback(
    (emoji: string) => {
      if (!user) {
        toastService.showError('Please sign in to react');
        return;
      }

      // Store current state for potential rollback
      previousUserReactions.current = [...userReactions];

      // Optimistic update
      const hasReaction = userReactions.includes(emoji);
      const newReactions = hasReaction
        ? userReactions.filter((r) => r !== emoji)
        : [...userReactions, emoji];

      setUserReactions(newReactions);
      updateReactionsOptimistically(emoji, !hasReaction);

      // Debounced API call
      toggleReactionDebounced(emoji);
    },
    [user, userReactions, updateReactionsOptimistically, toggleReactionDebounced]
  );

  // Refresh reactions
  const refreshReactions = useCallback(async () => {
    await loadReactions();
  }, [loadReactions]);

  // Set up real-time subscription
  useEffect(() => {
    if (isSubscribed.current) return;

    const cleanup = subscriptionManager.subscribeToPost(postId, {
      onReaction: (_payload) => {
        // Reload reactions to get accurate counts
        // This is simpler than trying to sync individual changes
        loadReactions();
      },
    });

    isSubscribed.current = true;

    return () => {
      cleanup();
      isSubscribed.current = false;
      toggleReactionDebounced.cancel(); // Cancel pending debounced calls
    };
  }, [postId, loadReactions, toggleReactionDebounced]);

  // Initial load
  useEffect(() => {
    loadReactions();
  }, [loadReactions]);

  return {
    reactions,
    userReactions,
    totalReactions,
    isLoading,
    toggleReaction,
    refreshReactions,
  };
}
