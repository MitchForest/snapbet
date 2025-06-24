import { supabase } from '@/services/supabase/client';

interface BankrollStats {
  balance: number;
  total_wagered: number;
  total_won: number;
  win_count: number;
  loss_count: number;
  push_count: number;
  stats_metadata?: {
    perfect_days?: string[];
    team_bet_counts?: Record<string, number>;
    fade_profit_generated?: number;
    current_streak?: number;
    best_streak?: number;
    last_bet_date?: string;
  };
}

export async function calculateUserBadges(userId: string): Promise<string[]> {
  try {
    // Get user stats from bankroll table
    const { data: bankroll, error: bankrollError } = await supabase
      .from('bankrolls')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (bankrollError || !bankroll) {
      console.error('Error fetching bankroll:', bankrollError);
      return [];
    }

    const stats = bankroll as unknown as BankrollStats;
    const badges: string[] = [];

    // Calculate win rate
    const totalBets = stats.win_count + stats.loss_count;
    const winRate = totalBets > 0 ? stats.win_count / totalBets : 0;

    // Calculate ROI
    const roi =
      stats.total_wagered > 0
        ? ((stats.total_won - stats.total_wagered) / stats.total_wagered) * 100
        : 0;

    // Calculate profit
    const profit = (stats.total_won - stats.total_wagered) / 100; // Convert to dollars

    // Badge logic
    if (stats.stats_metadata?.current_streak && stats.stats_metadata.current_streak >= 3) {
      badges.push('hot_streak');
    }

    if (profit >= 500) {
      badges.push('profit_leader');
    }

    if (roi >= 20 && totalBets >= 20) {
      badges.push('high_roi');
    }

    if (winRate >= 0.6 && totalBets >= 20) {
      badges.push('sharp');
    }

    if (winRate <= 0.4 && totalBets >= 20) {
      badges.push('fade_material');
    }

    if (stats.stats_metadata?.perfect_days && stats.stats_metadata.perfect_days.length > 0) {
      badges.push('perfect_day');
    }

    // Team loyalist badge - 20+ bets on favorite team
    const { data: userData } = await supabase
      .from('users')
      .select('favorite_team')
      .eq('id', userId)
      .single();

    if (userData?.favorite_team && stats.stats_metadata?.team_bet_counts) {
      const favoriteTeamBets = stats.stats_metadata.team_bet_counts[userData.favorite_team] || 0;
      if (favoriteTeamBets >= 20) {
        badges.push('team_loyalist');
      }
    }

    // Get follower count for social badges
    const { count: followerCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (followerCount && followerCount >= 50) {
      badges.push('influencer');
    }

    return badges;
  } catch (error) {
    console.error('Error calculating badges:', error);
    return [];
  }
}

// For now, we'll store calculated badges in the user's stats_display preferences
// In a real implementation, these would be stored in the user_badges table
export async function saveUserBadges(userId: string, badges: string[]): Promise<void> {
  try {
    // For MVP, we'll just calculate badges on the fly
    // In production, this would update the user_badges table
    console.log('Calculated badges for user:', userId, badges);
  } catch (error) {
    console.error('Error saving badges:', error);
  }
}

export async function getUserBadges(userId: string): Promise<string[]> {
  try {
    // For now, calculate badges on the fly
    // In production, these would be stored in user_badges table
    return await calculateUserBadges(userId);
  } catch (error) {
    console.error('Error getting user badges:', error);
    return [];
  }
}

export async function updateUserBadges(userId: string): Promise<void> {
  try {
    const newBadges = await calculateUserBadges(userId);
    // In production, this would update the user_badges table
    console.log('Updated badges for user:', userId, newBadges);
  } catch (error) {
    console.error('Error updating user badges:', error);
  }
}
