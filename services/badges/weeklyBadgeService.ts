import { supabase } from '@/services/supabase/client';

interface WeeklyStats {
  user_id: string;
  week_start: string;
  total_bets: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_wagered: number;
  total_won: number;
  profit: number;
  current_streak: number;
  picks_posted: number;
  days_since_last_post: number;
  tail_profit_generated: number;
  fade_profit_generated: number;
}

export async function calculateWeeklyBadges(userId: string): Promise<string[]> {
  try {
    // Get user's weekly stats using the database function
    const { data: statsData, error: statsError } = await supabase.rpc('get_user_weekly_stats', {
      p_user_id: userId,
    });

    if (statsError || !statsData || (statsData as WeeklyStats[]).length === 0) {
      console.error('Error fetching weekly stats:', statsError);
      return [];
    }

    const stats = (statsData as WeeklyStats[])[0];
    const badges: string[] = [];

    // 1. Hot Streak - 3+ wins in a row
    if (stats.current_streak >= 3) {
      badges.push('hot_streak');
    }

    // 2. Profit Machine - $100+ profit for the week
    if (stats.profit >= 100) {
      badges.push('profit_machine');
    }

    // 3. Sharp Shooter - 70%+ win rate (min 5 bets)
    if (stats.total_bets >= 5 && stats.win_rate >= 0.7) {
      badges.push('sharp_shooter');
    }

    // 4. High Roller - $500+ wagered
    if (stats.total_wagered >= 500) {
      badges.push('high_roller');
    }

    // 5. Comeback Kid - Positive profit after being down
    // This would need additional tracking - for now check if profitable after losses
    if (stats.losses > 0 && stats.profit > 0) {
      badges.push('comeback_kid');
    }

    // 6. Perfect Sunday - Check if user went perfect on NFL Sunday
    const { data: perfectSunday } = await supabase.rpc('check_perfect_nfl_sunday', {
      p_user_id: userId,
      p_week_start: stats.week_start,
    });

    if (perfectSunday) {
      badges.push('perfect_sunday');
    }

    // 7. Social Butterfly - 5+ picks posted
    if (stats.picks_posted >= 5) {
      badges.push('social_butterfly');
    }

    // 8. Influencer - Generated profit for others
    if (stats.tail_profit_generated > 0 || stats.fade_profit_generated > 0) {
      badges.push('influencer');
    }

    return badges;
  } catch (error) {
    console.error('Error calculating weekly badges:', error);
    return [];
  }
}

export async function saveWeeklyBadges(userId: string, badges: string[]): Promise<void> {
  try {
    // Get current week start
    const { data: weekStartData, error: weekStartError } = await supabase.rpc(
      'get_week_start' as never
    );

    if (weekStartError || !weekStartData) {
      console.error('Error getting week start:', weekStartError);
      return;
    }

    const weekStart = weekStartData as string;

    // Get week end for expiration
    const { data: weekEndData, error: weekEndError } = await supabase.rpc('get_week_end' as never);

    if (weekEndError || !weekEndData) {
      console.error('Error getting week end:', weekEndError);
      return;
    }

    const weekEnd = weekEndData as string;

    // First, remove any existing badges for this week
    const { error: deleteError } = await supabase
      .from('user_badges')
      .update({ lost_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('week_start_date', weekStart)
      .is('lost_at', null);

    if (deleteError) {
      console.error('Error removing old badges:', deleteError);
    }

    // Insert new badges
    if (badges.length > 0) {
      const badgeInserts = badges.map((badgeId) => ({
        user_id: userId,
        badge_id: badgeId,
        week_start_date: weekStart,
        weekly_reset_at: weekEnd,
        earned_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase.from('user_badges').insert(badgeInserts);

      if (insertError) {
        console.error('Error inserting badges:', insertError);
      }
    }
  } catch (error) {
    console.error('Error saving weekly badges:', error);
  }
}

export async function getUserWeeklyBadges(userId: string): Promise<string[]> {
  try {
    // Get current week start
    const { data: weekStartData, error: weekStartError } = await supabase.rpc(
      'get_week_start' as never
    );

    if (weekStartError || !weekStartData) {
      console.error('Error getting week start:', weekStartError);
      return [];
    }

    // Get active badges for current week
    const { data: badges, error } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId)
      .eq('week_start_date', weekStartData as string)
      .is('lost_at', null);

    if (error) {
      console.error('Error fetching weekly badges:', error);
      return [];
    }

    return badges.map((b) => b.badge_id);
  } catch (error) {
    console.error('Error getting user weekly badges:', error);
    return [];
  }
}

export async function updateUserWeeklyBadges(userId: string): Promise<string[]> {
  try {
    const newBadges = await calculateWeeklyBadges(userId);
    await saveWeeklyBadges(userId, newBadges);
    return newBadges;
  } catch (error) {
    console.error('Error updating weekly badges:', error);
    return [];
  }
}

// Get badge count for effect gating
export async function getUserBadgeCount(userId: string): Promise<number> {
  try {
    const badges = await getUserWeeklyBadges(userId);
    return badges.length;
  } catch (error) {
    console.error('Error getting badge count:', error);
    return 0;
  }
}

export async function getWeeklyProfitLeader(): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('get_weekly_profit_leader');

    if (error) {
      console.error('Error getting weekly profit leader:', error);
      return null;
    }

    return data as string;
  } catch (error) {
    console.error('Error in getWeeklyProfitLeader:', error);
    return null;
  }
}
