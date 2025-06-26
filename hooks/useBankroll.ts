import { useEffect, useMemo, useState, useCallback } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { bankrollService, Bankroll } from '@/services/betting/bankrollService';
import { useAuth } from '@/hooks/useAuth';
import { useActiveBets } from '@/hooks/useBetting';

/**
 * Hook for fetching and managing user's bankroll
 */
export function useBankroll() {
  const { user } = useAuth();
  const [data, setData] = useState<Bankroll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBankroll = useCallback(async () => {
    if (!user) {
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const bankroll = await bankrollService.getBankroll(user.id);
      setData(bankroll);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchBankroll();
  }, [fetchBankroll]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const handleBankrollUpdate = ({ userId }: { userId: string }) => {
      if (userId === user.id) {
        fetchBankroll();
      }
    };

    const handleBankrollReset = ({ userId }: { userId: string }) => {
      if (userId === user.id) {
        fetchBankroll();
      }
    };

    const updateSubscription = DeviceEventEmitter.addListener(
      'bankroll-updated',
      handleBankrollUpdate
    );

    const resetSubscription = DeviceEventEmitter.addListener('bankroll-reset', handleBankrollReset);

    return () => {
      updateSubscription.remove();
      resetSubscription.remove();
    };
  }, [user, fetchBankroll]);

  return { data, isLoading, error, refetch: fetchBankroll };
}

/**
 * Hook for calculating available balance
 */
export function useAvailableBalance() {
  const { data: bankroll } = useBankroll();
  const { bets: pendingBets } = useActiveBets();

  const available = useMemo(() => {
    if (!bankroll) return 0;
    const pending = pendingBets?.reduce((sum, bet) => sum + bet.stake, 0) || 0;
    return Math.max(0, bankroll.balance - pending);
  }, [bankroll, pendingBets]);

  return available;
}

/**
 * Hook for fetching bankroll statistics
 */
export function useBankrollStats() {
  const { user } = useAuth();
  const [data, setData] = useState<Awaited<
    ReturnType<typeof bankrollService.getBankrollStats>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const stats = await bankrollService.getBankrollStats(user.id);
      setData(stats);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, isLoading, error, refetch: fetchStats };
}

/**
 * Hook for performing weekly reset
 */
export function useWeeklyReset() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const performReset = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      await bankrollService.performWeeklyReset(user.id);
      // Trigger refetch of bankroll data
      DeviceEventEmitter.emit('bankroll-reset', { userId: user.id });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return { mutate: performReset, isLoading, error };
}

/**
 * Hook for fetching weekly history
 */
export function useWeeklyHistory() {
  const { user } = useAuth();
  const [data, setData] = useState<Awaited<
    ReturnType<typeof bankrollService.getWeeklyHistory>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const history = await bankrollService.getWeeklyHistory(user.id);
        setData(history);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  return { data, isLoading, error };
}

/**
 * Hook for fetching recent transactions
 */
export function useBankrollTransactions(limit = 10) {
  const { user } = useAuth();
  const [data, setData] = useState<Awaited<
    ReturnType<typeof bankrollService.getRecentTransactions>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const transactions = await bankrollService.getRecentTransactions(user.id, limit);
        setData(transactions);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user, limit]);

  return { data, isLoading, error };
}

/**
 * Hook for getting time until next reset
 */
export function useTimeUntilReset() {
  return bankrollService.getTimeUntilReset();
}
