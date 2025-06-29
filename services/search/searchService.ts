import { supabase } from '@/services/supabase/client';
import { startOfWeek } from 'date-fns';
import { withActiveContent } from '@/utils/database/archiveFilter';

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
    console.log('[getHotBettors] Week start:', weekStart.toISOString());

    // First, get all settled bets from this week with user info
    const { data: betsData, error: betsError } = await withActiveContent(
      supabase.from('bets').select(
        `
          id,
          user_id,
          status,
          settled_at,
          users!inner (
            id,
            username,
            display_name,
            avatar_url,
            bio,
            
            created_at
          )
        `
      )
    )
      .gte('settled_at', weekStart.toISOString())
      .in('status', ['won', 'lost'])
      .not('settled_at', 'is', null);

    if (betsError) {
      console.error('[getHotBettors] Error fetching bets:', betsError);
      throw new Error('Failed to fetch hot bettors');
    }

    console.log('[getHotBettors] Found', betsData?.length || 0, 'settled bets this week');

    // Working variable for bets data
    let workingBetsData = betsData;

    // If no bets this week, fall back to last 7 days
    let fallbackMode = false;
    if (!workingBetsData || workingBetsData.length === 0) {
      console.log('[getHotBettors] No bets this week, falling back to last 7 days');
      fallbackMode = true;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: fallbackData, error: fallbackError } = await withActiveContent(
        supabase.from('bets').select(
          `
            id,
            user_id,
            status,
            settled_at,
            users!inner (
              id,
              username,
              display_name,
              avatar_url,
              bio,
              
              created_at
            )
          `
        )
      )
        .gte('settled_at', sevenDaysAgo.toISOString())
        .in('status', ['won', 'lost'])
        .not('settled_at', 'is', null);

      if (fallbackError) {
        console.error('[getHotBettors] Error fetching fallback bets:', fallbackError);
        return [];
      }

      if (!fallbackData || fallbackData.length === 0) {
        console.log('[getHotBettors] No bets in last 7 days either');
        return [];
      }

      // Use fallback data
      workingBetsData = fallbackData;
    }

    // Group by user and calculate stats
    const userStatsMap = new Map<
      string,
      {
        user: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;

          created_at: string | null;
        };
        wins: number;
        losses: number;
        totalBets: number;
      }
    >();

    workingBetsData.forEach((bet) => {
      const userId = bet.user_id;

      if (!userStatsMap.has(userId)) {
        userStatsMap.set(userId, {
          user: {
            id: bet.users.id,
            username: bet.users.username,
            display_name: bet.users.display_name,
            avatar_url: bet.users.avatar_url,
            bio: bet.users.bio,
            created_at: bet.users.created_at || '',
          },
          wins: 0,
          losses: 0,
          totalBets: 0,
        });
      }

      const stats = userStatsMap.get(userId)!;
      stats.totalBets++;
      if (bet.status === 'won') {
        stats.wins++;
      } else {
        stats.losses++;
      }
    });

    console.log('[getHotBettors] Found', userStatsMap.size, 'unique users with bets');

    // Convert to array and filter by minimum bets
    const minBets = fallbackMode ? 3 : MIN_BETS_FOR_HOT; // Lower threshold for fallback
    const hotBettors = Array.from(userStatsMap.values())
      .filter((stats) => stats.totalBets >= minBets)
      .map((stats) => ({
        id: stats.user.id,
        username: stats.user.username || '',
        display_name: stats.user.display_name,
        avatar_url: stats.user.avatar_url,
        bio: stats.user.bio,
        created_at: stats.user.created_at || '',
        win_count: stats.wins,
        loss_count: stats.losses,
        total_bets: stats.totalBets,
        win_rate: stats.totalBets > 0 ? stats.wins / stats.totalBets : 0,
      }))
      .filter((user) => user.win_rate >= 0.6) // At least 60% win rate
      .sort((a, b) => {
        // Sort by win rate, then by total bets
        if (Math.abs(b.win_rate - a.win_rate) > 0.01) {
          return b.win_rate - a.win_rate;
        }
        return b.total_bets - a.total_bets;
      })
      .slice(0, limit);

    console.log('[getHotBettors] Returning', hotBettors.length, 'hot bettors');
    console.log(
      '[getHotBettors] Hot bettors data:',
      JSON.stringify(hotBettors.slice(0, 2), null, 2)
    ); // Log first 2 for debugging
    return hotBettors;
  } catch (error) {
    console.error('[getHotBettors] Error:', error);
    throw error instanceof Error ? error : new Error('Unknown error fetching hot bettors');
  }
}

export async function getTrendingPickUsers(limit: number = 10): Promise<TrendingPickUser[]> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Get posts with high tail counts from last 24 hours
    const { data, error } = await withActiveContent(
      supabase.from('posts').select(
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
    )
      .eq('post_type', 'pick')
      .gte('created_at', yesterday.toISOString())
      .gt('tail_count', 0);

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
