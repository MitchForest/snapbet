import { supabase } from '@/services/supabase/client';

/**
 * Reset all weekly badges and bankrolls - to be called every Monday at midnight
 * In production, this would be triggered by a cron job
 */
export async function resetWeeklyBadges(): Promise<void> {
  try {
    // Call the database function to reset weekly badges
    const { error: badgeError } = await supabase.rpc('reset_weekly_badges');

    if (badgeError) {
      console.error('Error resetting weekly badges:', badgeError);
      throw badgeError;
    }

    console.log('Weekly badges reset successfully');

    // Reset all user bankrolls with referral bonuses
    await resetAllBankrolls();

    // TODO: In production, trigger badge recalculation for active users
    // This could be done via a background job or queue system
  } catch (error) {
    console.error('Failed to reset weekly badges:', error);
    throw error;
  }
}

/**
 * Reset all user bankrolls with referral bonuses
 */
async function resetAllBankrolls(): Promise<void> {
  try {
    // Get all users
    const { data: users, error: usersError } = await supabase.from('users').select('id');

    if (usersError) {
      console.error('Error fetching users for bankroll reset:', usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log('No users to reset bankrolls for');
      return;
    }

    // Reset each user's bankroll (the function now includes referral bonus)
    const resetPromises = users.map((user) =>
      supabase.rpc('reset_bankroll', { p_user_id: user.id })
    );

    const results = await Promise.allSettled(resetPromises);

    // Log any failures
    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
      console.error(`Failed to reset ${failures.length} bankrolls`);
    }

    console.log(`Successfully reset ${users.length - failures.length} bankrolls with bonuses`);
  } catch (error) {
    console.error('Error resetting bankrolls:', error);
    throw error;
  }
}

/**
 * Check if badges need to be reset (for manual trigger)
 */
export async function checkAndResetBadgesIfNeeded(): Promise<boolean> {
  try {
    // Get current week start
    const { data: currentWeekStart } = await supabase.rpc('get_week_start');

    if (!currentWeekStart) {
      console.error('Could not get current week start');
      return false;
    }

    // Check if there are any badges from previous weeks still active
    const { data: oldBadges, error } = await supabase
      .from('user_badges')
      .select('badge_id')
      .lt('week_start_date', currentWeekStart)
      .is('lost_at', null)
      .limit(1);

    if (error) {
      console.error('Error checking for old badges:', error);
      return false;
    }

    // If old badges exist, reset them
    if (oldBadges && oldBadges.length > 0) {
      await resetWeeklyBadges();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking badge reset:', error);
    return false;
  }
}

/**
 * Get next reset time for display purposes
 */
export function getNextResetTime(): Date {
  const now = new Date();
  const nextMonday = new Date(now);

  // Set to next Monday
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
  nextMonday.setDate(now.getDate() + daysUntilMonday);

  // Set to midnight
  nextMonday.setHours(0, 0, 0, 0);

  return nextMonday;
}

/**
 * Format time until reset for display
 */
export function getTimeUntilReset(): string {
  const now = new Date();
  const nextReset = getNextResetTime();
  const msRemaining = nextReset.getTime() - now.getTime();

  const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else {
    return `${hours}h`;
  }
}

export async function scheduleWeeklyReset(): Promise<void> {
  // This would be called by a cron job or scheduled function
  // For now, it's a placeholder that can be called manually
  await resetWeeklyBadges();
}

// Function to check if it's Monday morning (for automatic reset)
export function shouldResetBadges(date: Date = new Date()): boolean {
  // Reset on Monday at 4 AM UTC
  return date.getUTCDay() === 1 && date.getUTCHours() === 4;
}

// Get the current week's start date (Monday)
export async function getCurrentWeekStart(): Promise<string> {
  const { data, error } = await supabase.rpc('get_week_start');

  if (error) {
    console.error('Error getting week start:', error);
    // Fallback to client-side calculation
    const now = new Date();
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - now.getUTCDay() + 1);
    monday.setUTCHours(0, 0, 0, 0);
    return monday.toISOString();
  }

  return data as string;
}

// Get the current week's end date (Sunday 23:59:59)
export async function getCurrentWeekEnd(): Promise<string> {
  const { data, error } = await supabase.rpc('get_week_end');

  if (error) {
    console.error('Error getting week end:', error);
    // Fallback to client-side calculation
    const now = new Date();
    const sunday = new Date(now);
    sunday.setUTCDate(now.getUTCDate() - now.getUTCDay() + 7);
    sunday.setUTCHours(23, 59, 59, 999);
    return sunday.toISOString();
  }

  return data as string;
}
