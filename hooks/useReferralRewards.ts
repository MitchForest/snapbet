import { useAuthStore } from '@/stores/authStore';
import { useState, useEffect, useCallback } from 'react';
import { getReferralRewards, calculateWeeklyBankroll } from '@/services/referral/referralService';

interface ReferralRewardsData {
  referralCount: number;
  weeklyBonus: number;
  weeklyBankroll: number;
  formattedBonus: string;
  formattedBankroll: string;
  nextResetDate: Date | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useReferralRewards(): ReferralRewardsData {
  const { user } = useAuthStore();
  const [referralCount, setReferralCount] = useState(0);
  const [weeklyBonus, setWeeklyBonus] = useState(0);
  const [nextResetDate, setNextResetDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRewards = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const rewards = await getReferralRewards(user.id);

      setReferralCount(rewards.referralCount);
      setWeeklyBonus(rewards.weeklyBonus);
      setNextResetDate(rewards.nextResetDate);
    } catch (err) {
      console.error('Error fetching referral rewards:', err);
      setError('Failed to load referral rewards');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchRewards();
  }, [user?.id, fetchRewards]);

  // Calculate weekly bankroll
  const weeklyBankroll = calculateWeeklyBankroll(referralCount);

  // Format currency values
  const formatCurrency = (cents: number): string => {
    return `$${(cents / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  return {
    referralCount,
    weeklyBonus,
    weeklyBankroll,
    formattedBonus: formatCurrency(weeklyBonus),
    formattedBankroll: formatCurrency(weeklyBankroll),
    nextResetDate,
    isLoading,
    error,
    refresh: fetchRewards,
  };
}
