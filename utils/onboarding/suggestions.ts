import { supabase } from '@/services/supabase/client';
import { calculateUserBadges } from '@/services/badges/badgeService';

// Define personality types locally instead of importing from mock
type PersonalityType =
  | 'fade-material'
  | 'sharp-bettor'
  | 'degen'
  | 'contrarian'
  | 'homer'
  | 'live-bettor'
  | 'parlay-degen';

interface StatsMetadata {
  perfect_days?: string[];
  team_bet_counts?: Record<string, number>;
  fade_profit_generated?: number;
  current_streak?: number;
  best_streak?: number;
  last_bet_date?: string;
  daily_records?: Record<string, { wins: number; losses: number; date: string }>;
}

export interface SuggestedUser {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  favorite_team?: string | null;
  is_mock?: boolean;
  mock_personality_id?: PersonalityType | null;
  // Stats from bankroll
  win_count?: number;
  loss_count?: number;
  total_wagered?: number;
  total_won?: number;
  balance?: number;
  stats_metadata?: StatsMetadata;
}

interface UserWithBankroll {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  favorite_team: string | null;
  is_mock: boolean | null;
  mock_personality_id: PersonalityType | null;
  bankrolls: Array<{
    balance: number;
    total_wagered: number;
    total_won: number;
    win_count: number;
    loss_count: number;
    stats_metadata: StatsMetadata;
  }> | null;
}

interface MockUser {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
  favorite_team: string | null;
  badges: string[];
  bankroll: {
    balance: number;
    total_wagered: number;
    total_won: number;
    win_count: number;
    loss_count: number;
    stats_metadata?: StatsMetadata;
  };
  primary_stat: string;
}

export async function generateFollowSuggestions(
  favoriteTeam?: string | null,
  limit: number = 10
): Promise<SuggestedUser[]> {
  try {
    // Get all mock users with their bankroll stats
    const { data: mockUsers, error } = await supabase
      .from('users')
      .select(
        `
        *,
        bankrolls (
          balance,
          total_wagered,
          total_won,
          win_count,
          loss_count,
          stats_metadata
        )
      `
      )
      .eq('is_mock', true)
      .limit(30); // Get more than we need for filtering

    if (error || !mockUsers) {
      console.error('Error fetching mock users:', error);
      return [];
    }

    // Transform the data to flatten bankroll stats
    const users: SuggestedUser[] = (mockUsers as unknown as UserWithBankroll[]).map((user) => ({
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      bio: user.bio,
      avatar_url: user.avatar_url,
      favorite_team: user.favorite_team,
      is_mock: user.is_mock || false,
      mock_personality_id: user.mock_personality_id,
      win_count: user.bankrolls?.[0]?.win_count,
      loss_count: user.bankrolls?.[0]?.loss_count,
      total_wagered: user.bankrolls?.[0]?.total_wagered,
      total_won: user.bankrolls?.[0]?.total_won,
      balance: user.bankrolls?.[0]?.balance,
      stats_metadata: user.bankrolls?.[0]?.stats_metadata,
    }));

    const suggestions: SuggestedUser[] = [];

    // 1. If user has a favorite team, suggest 2-3 users with same team
    if (favoriteTeam) {
      const teamFans = users.filter((u) => u.favorite_team === favoriteTeam);
      suggestions.push(...teamFans.slice(0, 3));
    }

    // 2. Add 2-3 sharp bettors (high win rate)
    const sharps = users
      .filter((u) => {
        if (!u.win_count || !u.loss_count) return false;
        const totalBets = u.win_count + u.loss_count;
        const winRate = totalBets > 0 ? u.win_count / totalBets : 0;
        return winRate > 0.58 && totalBets > 20;
      })
      .sort((a, b) => {
        const aWinRate = a.win_count! / (a.win_count! + a.loss_count!);
        const bWinRate = b.win_count! / (b.win_count! + b.loss_count!);
        return bWinRate - aWinRate;
      });

    // Add sharps not already in suggestions
    const sharpsToAdd = sharps.filter((s) => !suggestions.some((u) => u.id === s.id));
    suggestions.push(...sharpsToAdd.slice(0, 3));

    // 3. Add 1-2 entertainment value (fade material)
    const fadeMaterial = users.filter(
      (u) => u.mock_personality_id === 'fade-material' && !suggestions.some((s) => s.id === u.id)
    );
    suggestions.push(...fadeMaterial.slice(0, 2));

    // 4. Add profitable users (positive ROI)
    const profitable = users
      .filter((u) => {
        if (!u.total_wagered || !u.total_won) return false;
        const roi = ((u.total_won - u.total_wagered) / u.total_wagered) * 100;
        return roi > 10 && !suggestions.some((s) => s.id === u.id);
      })
      .sort((a, b) => {
        const aRoi = ((a.total_won! - a.total_wagered!) / a.total_wagered!) * 100;
        const bRoi = ((b.total_won! - b.total_wagered!) / b.total_wagered!) * 100;
        return bRoi - aRoi;
      });

    suggestions.push(...profitable.slice(0, 2));

    // 5. Fill remaining slots with diverse personalities
    const remaining = users.filter((u) => !suggestions.some((s) => s.id === u.id));
    const diverse = remaining.sort(() => Math.random() - 0.5);

    const slotsLeft = limit - suggestions.length;
    if (slotsLeft > 0) {
      suggestions.push(...diverse.slice(0, slotsLeft));
    }

    // Return exactly the limit requested
    return suggestions.slice(0, limit);
  } catch (error) {
    console.error('Error generating follow suggestions:', error);
    return [];
  }
}

// Helper to get a user's primary stat for display
export function getDefaultPrimaryStat(user: {
  win_count?: number;
  loss_count?: number;
  total_wagered?: number;
  total_won?: number;
}): {
  type: 'winRate' | 'profit' | 'roi' | 'record' | 'streak';
  value: string;
  label: string;
} {
  const totalBets = (user.win_count || 0) + (user.loss_count || 0);
  const winRate = totalBets > 0 ? (user.win_count || 0) / totalBets : 0;
  const profit = ((user.total_won || 0) - (user.total_wagered || 0)) / 100; // Convert to dollars
  const roi =
    user.total_wagered && user.total_wagered > 0
      ? (((user.total_won || 0) - user.total_wagered) / user.total_wagered) * 100
      : 0;

  // Priority order for stat selection
  if (roi > 20 && totalBets > 20) {
    return {
      type: 'roi',
      value: `${roi > 0 ? '+' : ''}${roi.toFixed(1)}%`,
      label: 'ROI',
    };
  }

  if (profit > 500) {
    return {
      type: 'profit',
      value: `${profit > 0 ? '+' : ''}$${Math.abs(profit).toFixed(0)}`,
      label: 'Profit',
    };
  }

  if (winRate > 0.6 && totalBets > 20) {
    return {
      type: 'winRate',
      value: `${(winRate * 100).toFixed(0)}%`,
      label: 'Win Rate',
    };
  }

  // Default to record
  return {
    type: 'record',
    value: `${user.win_count || 0}-${user.loss_count || 0}`,
    label: 'Record',
  };
}

// Helper to get a user's primary stat string for display
export function getDefaultPrimaryStatString(bankroll: {
  win_count: number;
  loss_count: number;
  total_wagered: number;
  total_won: number;
}): string {
  const totalBets = bankroll.win_count + bankroll.loss_count;
  const winRate = totalBets > 0 ? bankroll.win_count / totalBets : 0;
  const roi =
    bankroll.total_wagered > 0
      ? ((bankroll.total_won - bankroll.total_wagered) / bankroll.total_wagered) * 100
      : 0;
  const profit = (bankroll.total_won - bankroll.total_wagered) / 100;

  // Priority: ROI > Profit > Win Rate > Record
  if (roi >= 10 && totalBets >= 10) {
    return `${roi > 0 ? '+' : ''}${roi.toFixed(1)}% ROI`;
  } else if (profit >= 100) {
    return `+$${profit.toFixed(0)}`;
  } else if (winRate >= 0.55 && totalBets >= 10) {
    return `${(winRate * 100).toFixed(0)}% Win Rate`;
  } else {
    return `${bankroll.win_count}-${bankroll.loss_count}`;
  }
}

export async function getFollowSuggestions(
  userId: string,
  favoriteTeam?: string | null
): Promise<MockUser[]> {
  try {
    // Get all mock users (excluding current user)
    const { data: users, error } = await supabase
      .from('users')
      .select(
        `
        id,
        username,
        avatar_url,
        bio,
        bankrolls (
          balance,
          total_wagered,
          total_won,
          win_count,
          loss_count,
          stats_metadata
        )
      `
      )
      .neq('id', userId)
      .not('username', 'is', null)
      .limit(20);

    if (error || !users) {
      console.error('Error fetching users:', error);
      return [];
    }

    // Transform and calculate badges for each user
    const mockUsers: MockUser[] = await Promise.all(
      users.map(async (user) => {
        // Handle bankrolls which could be an array or single object from Supabase
        const bankrollsData = user.bankrolls as Array<{
          balance: number;
          total_wagered: number;
          total_won: number;
          win_count: number;
          loss_count: number;
          stats_metadata: unknown;
        }> | null;
        const bankrollData = bankrollsData?.[0];
        const bankroll = bankrollData || {
          balance: 100000,
          total_wagered: 0,
          total_won: 0,
          win_count: 0,
          loss_count: 0,
          stats_metadata: null,
        };

        const badges = await calculateUserBadges(user.id);
        const primary_stat = getDefaultPrimaryStatString(bankroll);

        return {
          id: user.id,
          username: user.username || '',
          avatar_url: user.avatar_url || '',
          bio: user.bio || '',
          favorite_team: null,
          badges,
          bankroll: {
            balance: bankroll.balance,
            total_wagered: bankroll.total_wagered,
            total_won: bankroll.total_won,
            win_count: bankroll.win_count,
            loss_count: bankroll.loss_count,
            stats_metadata: bankroll.stats_metadata as StatsMetadata | undefined,
          },
          primary_stat,
        };
      })
    );

    // Sort users by priority
    const suggestions: MockUser[] = [];

    // 1. Users with same favorite team (if provided)
    if (favoriteTeam) {
      const teamFans = mockUsers.filter((u) => u.favorite_team === favoriteTeam);
      suggestions.push(...teamFans.slice(0, 3));
    }

    // 2. Sharp bettors (high win rate)
    const sharps = mockUsers
      .filter((u) => !suggestions.includes(u))
      .filter((u) => {
        const totalBets = u.bankroll.win_count + u.bankroll.loss_count;
        const winRate = totalBets > 0 ? u.bankroll.win_count / totalBets : 0;
        return winRate >= 0.6 && totalBets >= 20;
      })
      .sort((a, b) => {
        const aWinRate = a.bankroll.win_count / (a.bankroll.win_count + a.bankroll.loss_count);
        const bWinRate = b.bankroll.win_count / (b.bankroll.win_count + b.bankroll.loss_count);
        return bWinRate - aWinRate;
      });
    suggestions.push(...sharps.slice(0, 3));

    // 3. Entertainment value (fade material)
    const fadeMaterial = mockUsers
      .filter((u) => !suggestions.includes(u))
      .filter((u) => u.badges.includes('fade_material'))
      .slice(0, 2);
    suggestions.push(...fadeMaterial);

    // 4. Profitable users
    const profitable = mockUsers
      .filter((u) => !suggestions.includes(u))
      .filter((u) => {
        const profit = u.bankroll.total_won - u.bankroll.total_wagered;
        return profit > 50000; // $500+
      })
      .sort((a, b) => {
        const aProfit = a.bankroll.total_won - a.bankroll.total_wagered;
        const bProfit = b.bankroll.total_won - b.bankroll.total_wagered;
        return bProfit - aProfit;
      });
    suggestions.push(...profitable.slice(0, 2));

    // 5. Fill remaining with random users
    const remaining = mockUsers.filter((u) => !suggestions.includes(u));
    const needed = 10 - suggestions.length;
    if (needed > 0 && remaining.length > 0) {
      // Shuffle and take needed amount
      const shuffled = [...remaining].sort(() => Math.random() - 0.5);
      suggestions.push(...shuffled.slice(0, needed));
    }

    return suggestions.slice(0, 10);
  } catch (error) {
    console.error('Error getting follow suggestions:', error);
    return [];
  }
}
