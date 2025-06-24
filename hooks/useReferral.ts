import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
  getOrCreateReferralCode,
  getReferralStats,
  getReferredUsers,
} from '@/services/referral/referralService';

interface ReferralData {
  code: string | null;
  stats: {
    totalReferrals: number;
    thisWeek: number;
    thisMonth: number;
  };
  referredUsers: Array<{
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    created_at: string;
  }>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useReferral(): ReferralData {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    thisWeek: 0,
    thisMonth: 0,
  });
  const [referredUsers, setReferredUsers] = useState<ReferralData['referredUsers']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [referralCode, referralStats, users] = await Promise.all([
          getOrCreateReferralCode(user.id),
          getReferralStats(user.id),
          getReferredUsers(user.id),
        ]);

        setCode(referralCode);
        setStats(referralStats);
        setReferredUsers(users);
      } catch (err) {
        console.error('Error fetching referral data:', err);
        setError('Failed to load referral data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferralData();
  }, [user?.id]);

  // Create a refresh function that can be called from components
  const refresh = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const [referralCode, referralStats, users] = await Promise.all([
        getOrCreateReferralCode(user.id),
        getReferralStats(user.id),
        getReferredUsers(user.id),
      ]);

      setCode(referralCode);
      setStats(referralStats);
      setReferredUsers(users);
    } catch (err) {
      console.error('Error fetching referral data:', err);
      setError('Failed to load referral data');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    code,
    stats,
    referredUsers,
    isLoading,
    error,
    refresh,
  };
}
