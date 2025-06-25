import { supabase } from '@/services/supabase/client';
import { startOfWeek } from 'date-fns';

// Constants
export const MIN_SEARCH_LENGTH = 2;
export const MAX_SEARCH_RESULTS = 50;
export const MIN_BETS_FOR_HOT = 5;
export const MIN_BETS_FOR_FADE = 10;
export const MIN_WIN_RATE_FOR_RISING = 0.5;
export const RISING_STAR_DAYS = 7;

// Types
export interface UserWithStats {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  favorite_team: string | null;
  created_at: string;
  // Stats
  win_count?: number;
  loss_count?: number;
  win_rate?: number;
  total_bets?: number;
  is_following?: boolean;
}

export interface TrendingPickUser {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  total_tails: number;
  pick_count: number;
}

// User Search
export async function searchUsers(query: string): Promise<UserWithStats[]> {
  if (query.length < MIN_SEARCH_LENGTH) {
    return [];
  }

  try {
    const searchPattern = `%${query}%`;

    const { data, error } = await supabase
      .from('users')
      .select(
        `
        id,
        username,
        display_name,
        avatar_url,
        bio,
        favorite_team,
        created_at,
        bankrolls!inner (
          win_count,
          loss_count
        )
      `
      )
      .or(`username.ilike.${searchPattern},display_name.ilike.${searchPattern}`)
      .is('deleted_at', null)
      .limit(MAX_SEARCH_RESULTS);

    if (error) throw error;

    // Calculate win rates and format
    const usersWithStats = (data || []).map((user) => ({
      id: user.id,
      username: user.username || '',
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      bio: user.bio,
      favorite_team: user.favorite_team,
      created_at: user.created_at || '',
      win_count: user.bankrolls?.win_count || 0,
      loss_count: user.bankrolls?.loss_count || 0,
      total_bets: (user.bankrolls?.win_count || 0) + (user.bankrolls?.loss_count || 0),
      win_rate:
        user.bankrolls && user.bankrolls.win_count + user.bankrolls.loss_count > 0
          ? user.bankrolls.win_count / (user.bankrolls.win_count + user.bankrolls.loss_count)
          : 0,
    }));

    return usersWithStats;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

// Discovery Algorithms
export async function getHotBettors(limit: number = 10): Promise<UserWithStats[]> {
  try {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

    // Get users with bets settled this week
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        id,
        username,
        display_name,
        avatar_url,
        bio,
        favorite_team,
        created_at,
        bets!inner (
          status,
          settled_at
        ),
        bankrolls!inner (
          win_count,
          loss_count
        )
      `
      )
      .gte('bets.settled_at', weekStart.toISOString())
      .in('bets.status', ['won', 'lost'])
      .is('deleted_at', null);

    if (error) {
      console.error('Database error fetching hot bettors:', error);
      throw new Error('Failed to fetch hot bettors');
    }

    // Group by user and calculate this week's stats
    const userStatsMap = new Map<
      string,
      {
        id: string;
        username: string;
        display_name: string | null;
        avatar_url: string | null;
        bio: string | null;
        favorite_team: string | null;
        created_at: string;
        weeklyWins: number;
        weeklyLosses: number;
        weeklyBets: number;
      }
    >();

    (data || []).forEach((row) => {
      const userId = row.id;
      if (!userStatsMap.has(userId)) {
        userStatsMap.set(userId, {
          id: row.id,
          username: row.username || '',
          display_name: row.display_name,
          avatar_url: row.avatar_url,
          bio: row.bio,
          favorite_team: row.favorite_team,
          created_at: row.created_at || '',
          weeklyWins: 0,
          weeklyLosses: 0,
          weeklyBets: 0,
        });
      }

      const user = userStatsMap.get(userId);
      if (user) {
        user.weeklyBets++;
        if (row.bets[0].status === 'won') {
          user.weeklyWins++;
        } else {
          user.weeklyLosses++;
        }
      }
    });

    // Filter and sort
    const hotBettors = Array.from(userStatsMap.values())
      .filter((user) => user.weeklyBets >= MIN_BETS_FOR_HOT)
      .map((user) => ({
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        favorite_team: user.favorite_team,
        created_at: user.created_at,
        win_count: user.weeklyWins,
        loss_count: user.weeklyLosses,
        total_bets: user.weeklyBets,
        win_rate: user.weeklyWins / user.weeklyBets,
      }))
      .sort((a, b) => b.win_rate - a.win_rate)
      .slice(0, limit);

    return hotBettors;
  } catch (error) {
    console.error('Error fetching hot bettors:', error);
    throw error instanceof Error ? error : new Error('Unknown error fetching hot bettors');
  }
}

export async function getTrendingPickUsers(limit: number = 10): Promise<TrendingPickUser[]> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Get posts with high tail counts from last 24 hours
    const { data, error } = await supabase
      .from('posts')
      .select(
        `
        user_id,
        tail_count,
        user:users!user_id (
          username,
          display_name,
          avatar_url
        )
      `
      )
      .eq('post_type', 'pick')
      .gte('created_at', yesterday.toISOString())
      .gt('tail_count', 0)
      .is('deleted_at', null);

    if (error) throw error;

    // Group by user and sum tail counts
    const userTailsMap = new Map<string, TrendingPickUser>();

    (data || []).forEach((post) => {
      const userId = post.user_id;
      if (!userTailsMap.has(userId)) {
        userTailsMap.set(userId, {
          user_id: userId,
          username: post.user.username || '',
          display_name: post.user.display_name,
          avatar_url: post.user.avatar_url,
          total_tails: 0,
          pick_count: 0,
        });
      }

      const user = userTailsMap.get(userId)!;
      user.total_tails += post.tail_count || 0;
      user.pick_count++;
    });

    // Sort by total tails
    const trendingUsers = Array.from(userTailsMap.values())
      .sort((a, b) => b.total_tails - a.total_tails)
      .slice(0, limit);

    return trendingUsers;
  } catch (error) {
    console.error('Error fetching trending picks:', error);
    throw error instanceof Error ? error : new Error('Unknown error fetching trending picks');
  }
}

export async function getFadeMaterial(limit: number = 10): Promise<UserWithStats[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        id,
        username,
        display_name,
        avatar_url,
        bio,
        favorite_team,
        created_at,
        bankrolls!inner (
          win_count,
          loss_count
        )
      `
      )
      .is('deleted_at', null);

    if (error) throw error;

    // Calculate stats and filter
    const fadeMaterial = (data || [])
      .map((user) => {
        const totalBets = (user.bankrolls?.win_count || 0) + (user.bankrolls?.loss_count || 0);
        const winRate = totalBets > 0 ? (user.bankrolls?.win_count || 0) / totalBets : 0;

        return {
          id: user.id,
          username: user.username || '',
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          bio: user.bio,
          favorite_team: user.favorite_team,
          created_at: user.created_at || '',
          win_count: user.bankrolls?.win_count || 0,
          loss_count: user.bankrolls?.loss_count || 0,
          total_bets: totalBets,
          win_rate: winRate,
        };
      })
      .filter(
        (user: UserWithStats) =>
          user.total_bets !== undefined &&
          user.total_bets >= MIN_BETS_FOR_FADE &&
          user.win_rate !== undefined &&
          user.win_rate < 0.4
      )
      .sort((a, b) => a.win_rate - b.win_rate) // Worst first
      .slice(0, limit);

    return fadeMaterial;
  } catch (error) {
    console.error('Error fetching fade material:', error);
    throw error instanceof Error ? error : new Error('Unknown error fetching fade material');
  }
}

export async function getRisingStars(limit: number = 10): Promise<UserWithStats[]> {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - RISING_STAR_DAYS);

    const { data, error } = await supabase
      .from('users')
      .select(
        `
        id,
        username,
        display_name,
        avatar_url,
        bio,
        favorite_team,
        created_at,
        bankrolls!inner (
          win_count,
          loss_count
        )
      `
      )
      .gte('created_at', weekAgo.toISOString())
      .is('deleted_at', null);

    if (error) throw error;

    // Filter for good performers
    const risingStars = (data || [])
      .map((user) => {
        const totalBets = (user.bankrolls?.win_count || 0) + (user.bankrolls?.loss_count || 0);
        const winRate = totalBets > 0 ? (user.bankrolls?.win_count || 0) / totalBets : 0;

        return {
          id: user.id,
          username: user.username || '',
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          bio: user.bio,
          favorite_team: user.favorite_team,
          created_at: user.created_at || '',
          win_count: user.bankrolls?.win_count || 0,
          loss_count: user.bankrolls?.loss_count || 0,
          total_bets: totalBets,
          win_rate: winRate,
        };
      })
      .filter(
        (user: UserWithStats) =>
          user.total_bets !== undefined &&
          user.total_bets >= 3 &&
          user.win_rate !== undefined &&
          user.win_rate >= MIN_WIN_RATE_FOR_RISING
      )
      .sort((a, b) => b.win_rate - a.win_rate)
      .slice(0, limit);

    return risingStars;
  } catch (error) {
    console.error('Error fetching rising stars:', error);
    throw error instanceof Error ? error : new Error('Unknown error fetching rising stars');
  }
}

// Discovery algorithms map for easy extension
export const discoveryAlgorithms = {
  hot: getHotBettors,
  trending: getTrendingPickUsers,
  fade: getFadeMaterial,
  rising: getRisingStars,

  // Future: Easy to add
  // similar: getSimilarBettors,
  // recommended: getRecommended,
};
