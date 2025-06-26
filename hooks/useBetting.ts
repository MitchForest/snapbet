import { useState, useCallback, useEffect } from 'react';
import { bettingService } from '@/services/betting/bettingService';
import { BetInput, BetWithGame, BetHistoryOptions, BettingError } from '@/services/betting/types';
import { useAuthStore } from '@/stores/authStore';
import * as Haptics from 'expo-haptics';
import { toastService } from '@/services/toastService';

/**
 * Hook for placing bets
 */
export function usePlaceBet() {
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeBet = useCallback(async (input: BetInput) => {
    setIsPlacing(true);
    setError(null);

    try {
      // Haptic feedback for bet placement
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const bet = await bettingService.placeBet(input);

      // Success haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      return bet;
    } catch (err) {
      const errorMessage = err instanceof BettingError ? err.message : 'Failed to place bet';
      setError(errorMessage);

      // Error haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      toastService.show({
        message: errorMessage,
        type: 'error',
      });

      throw err;
    } finally {
      setIsPlacing(false);
    }
  }, []);

  return {
    placeBet,
    isPlacing,
    error,
  };
}

/**
 * Hook for fetching active bets
 */
export function useActiveBets() {
  const user = useAuthStore((state) => state.user);
  const [bets, setBets] = useState<BetWithGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchActiveBets = useCallback(async () => {
    if (!user) {
      setBets([]);
      setIsLoading(false);
      return;
    }

    try {
      const data = await bettingService.getActiveBets(user.id);
      setBets(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching active bets:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchActiveBets();
  }, [fetchActiveBets]);

  // Auto-refresh for live games
  useEffect(() => {
    if (!bets.length) return;

    // Check if any bets are for live games
    const hasLiveBets = bets.some((bet) => bet.game?.status === 'live');
    if (!hasLiveBets) return;

    // Set up interval for live updates
    const interval = setInterval(fetchActiveBets, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [bets, fetchActiveBets]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchActiveBets();
  }, [fetchActiveBets]);

  return {
    bets,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for fetching bet history
 */
export function useBetHistory(options: BetHistoryOptions = {}) {
  const user = useAuthStore((state) => state.user);
  const [bets, setBets] = useState<BetWithGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchBetHistory = useCallback(
    async (reset = false) => {
      if (!user) {
        setBets([]);
        setIsLoading(false);
        return;
      }

      try {
        const offset = reset ? 0 : bets.length;
        const data = await bettingService.getBetHistory(user.id, {
          ...options,
          offset,
        });

        if (reset) {
          setBets(data);
        } else {
          setBets((prev) => [...prev, ...data]);
        }

        // Check if there are more to load
        setHasMore(data.length === (options.limit || 20));
        setError(null);
      } catch (err) {
        console.error('Error fetching bet history:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [user, bets.length, options]
  );

  // Initial load
  useEffect(() => {
    fetchBetHistory(true);
  }, [user, options.status]); // Reset when status filter changes

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchBetHistory(false);
  }, [hasMore, isLoading, fetchBetHistory]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchBetHistory(true);
  }, [fetchBetHistory]);

  return {
    bets,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch,
  };
}

/**
 * Hook for canceling a bet
 */
export function useCancelBet() {
  const [isCanceling, setIsCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelBet = useCallback(async (betId: string) => {
    setIsCanceling(true);
    setError(null);

    try {
      await bettingService.cancelBet(betId);

      // Success haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      const errorMessage = err instanceof BettingError ? err.message : 'Failed to cancel bet';
      setError(errorMessage);

      // Error haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      toastService.show({
        message: errorMessage,
        type: 'error',
      });

      throw err;
    } finally {
      setIsCanceling(false);
    }
  }, []);

  return {
    cancelBet,
    isCanceling,
    error,
  };
}

/**
 * Hook for getting user's current bankroll
 * TODO: This will be replaced by useBankroll hook in Sprint 05.05
 */
export function useAvailableBankroll() {
  const user = useAuthStore((state) => state.user);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBalance(0);
      setIsLoading(false);
      return;
    }

    // Temporary implementation - will be replaced
    const fetchBankroll = async () => {
      try {
        const { data } = await supabase
          .from('bankrolls')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        setBalance(data?.balance || 0);
      } catch (error) {
        console.error('Error fetching bankroll:', error);
        setBalance(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBankroll();
  }, [user]);

  return { balance, isLoading };
}

// Import supabase for temporary bankroll fetch
import { supabase } from '@/services/supabase/client';

export function useBetting() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeBet = async (betInput: BetInput) => {
    setLoading(true);
    setError(null);

    try {
      const result = await bettingService.placeBet(betInput);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to place bet';
      setError(errorMessage);
      toastService.show({
        message: errorMessage,
        type: 'error',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getActiveBets = async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const bets = await bettingService.getActiveBets(userId);
      return bets;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch active bets';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBetHistory = async (userId: string, options?: BetHistoryOptions) => {
    setLoading(true);
    setError(null);

    try {
      const history = await bettingService.getBetHistory(userId, options);
      return history;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bet history';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    placeBet,
    getActiveBets,
    getBetHistory,
    loading,
    error,
  };
}
