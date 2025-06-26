import { supabase } from '@/services/supabase/client';
import { Storage } from '@/services/storage/storageService';

interface ReferralStats {
  totalReferrals: number;
  thisWeek: number;
  thisMonth: number;
}

interface ReferredUser {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

const REFERRAL_CODE_KEY = 'pendingReferralCode';

/**
 * Generates a referral code from username
 * Format: First 3 letters of username + 3 random alphanumeric characters
 */
function generateReferralCode(username: string): string {
  const prefix = username.substring(0, 3).toUpperCase().padEnd(3, 'X');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';

  for (let i = 0; i < 3; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${prefix}${suffix}`;
}

/**
 * Gets or creates a referral code for a user
 */
export async function getOrCreateReferralCode(userId: string): Promise<string | null> {
  try {
    // First check if user already has a code
    const { data: existing, error: fetchError } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('user_id', userId)
      .single();

    if (existing?.code) {
      return existing.code;
    }

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching referral code:', fetchError);
      return null;
    }

    // Get username for code generation
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    if (userError || !userData?.username) {
      console.error('Error fetching user:', userError);
      return null;
    }

    // Generate code with retry logic
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      const code = generateReferralCode(userData.username);

      // Try to insert the code
      const { error: insertError } = await supabase.from('referral_codes').insert({
        user_id: userId,
        code: code,
      });

      if (!insertError) {
        return code;
      }

      // If it's a unique constraint error, retry with a different code
      if (insertError.code === '23505') {
        // Unique violation
        attempts++;
        continue;
      }

      // For other errors, fail
      console.error('Error creating referral code:', insertError);
      return null;
    }

    console.error('Failed to generate unique referral code after', maxAttempts, 'attempts');
    return null;
  } catch (error) {
    console.error('Error in getOrCreateReferralCode:', error);
    return null;
  }
}

/**
 * Validates a referral code exists
 */
export async function validateReferralCode(
  code: string
): Promise<{ valid: boolean; referrerId?: string }> {
  try {
    const { data, error } = await supabase
      .from('referral_codes')
      .select('user_id')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !data) {
      return { valid: false };
    }

    return { valid: true, referrerId: data.user_id };
  } catch (error) {
    console.error('Error validating referral code:', error);
    return { valid: false };
  }
}

/**
 * Tracks a referral relationship
 */
export async function trackReferral(
  referralCode: string,
  referredUserId: string
): Promise<{ success: boolean }> {
  try {
    // Validate the code and get referrer
    const validation = await validateReferralCode(referralCode);
    if (!validation.valid || !validation.referrerId) {
      return { success: false };
    }

    // Check for self-referral (silently ignore)
    if (validation.referrerId === referredUserId) {
      return { success: true };
    }

    // Create referral record
    const { error: referralError } = await supabase.from('referrals').insert({
      referrer_id: validation.referrerId,
      referred_id: referredUserId,
      code: referralCode.toUpperCase(),
    });

    if (referralError) {
      // If it's a duplicate (user already referred), treat as success
      if (referralError.code === '23505') {
        return { success: true };
      }
      console.error('Error creating referral:', referralError);
      return { success: false };
    }

    // Increment uses count
    const { data: currentCode } = await supabase
      .from('referral_codes')
      .select('uses_count')
      .eq('code', referralCode.toUpperCase())
      .single();

    if (currentCode) {
      await supabase
        .from('referral_codes')
        .update({ uses_count: (currentCode.uses_count || 0) + 1 })
        .eq('code', referralCode.toUpperCase());
    }

    return { success: true };
  } catch (error) {
    console.error('Error tracking referral:', error);
    return { success: false };
  }
}

/**
 * Gets referral statistics for a user
 */
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total referrals
    const { count: total } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId);

    // Get this week's referrals
    const { count: thisWeek } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)
      .gte('created_at', weekAgo.toISOString());

    // Get this month's referrals
    const { count: thisMonth } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)
      .gte('created_at', monthAgo.toISOString());

    return {
      totalReferrals: total || 0,
      thisWeek: thisWeek || 0,
      thisMonth: thisMonth || 0,
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return {
      totalReferrals: 0,
      thisWeek: 0,
      thisMonth: 0,
    };
  }
}

/**
 * Gets list of users referred by a user
 */
export async function getReferredUsers(userId: string): Promise<ReferredUser[]> {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select(
        `
        referred_id,
        created_at,
        users!referrals_referred_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `
      )
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting referred users:', error);
      return [];
    }

    return data.map((item) => ({
      id: item.users.id,
      username: item.users.username || null,
      display_name: item.users.display_name,
      avatar_url: item.users.avatar_url,
      created_at: item.created_at as string,
    }));
  } catch (error) {
    console.error('Error in getReferredUsers:', error);
    return [];
  }
}

/**
 * Stores a pending referral code (before OAuth)
 */
export async function storePendingReferralCode(code: string): Promise<void> {
  try {
    Storage.general.set(REFERRAL_CODE_KEY, code.toUpperCase());
  } catch (error) {
    console.error('Error storing referral code:', error);
  }
}

/**
 * Retrieves and clears pending referral code (after OAuth)
 */
export async function getPendingReferralCode(): Promise<string | null> {
  try {
    const code = Storage.general.get<string>(REFERRAL_CODE_KEY);
    if (code) {
      Storage.general.delete(REFERRAL_CODE_KEY);
    }
    return code;
  } catch (error) {
    console.error('Error getting pending referral code:', error);
    return null;
  }
}

/**
 * Gets share content for a referral code
 */
export function getShareContent(code: string): { message: string; url: string } {
  return {
    message: `Join me on SnapBet! Use my invite code ${code} when you sign up. Let's bet together! 🎯`,
    url: `https://snapbet.app/invite/${code}`, // For future web landing page
  };
}

/**
 * Gets referral rewards information for a user
 */
export async function getReferralRewards(userId: string): Promise<{
  referralCount: number;
  weeklyBonus: number;
  nextResetDate: Date;
}> {
  try {
    // Get user's referral count
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('referral_count')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user referral count:', userError);
      return {
        referralCount: 0,
        weeklyBonus: 0,
        nextResetDate: getNextMondayMidnight(),
      };
    }

    const referralCount = userData.referral_count || 0;
    const weeklyBonus = referralCount * 10000; // $100 per referral in cents

    return {
      referralCount,
      weeklyBonus,
      nextResetDate: getNextMondayMidnight(),
    };
  } catch (error) {
    console.error('Error getting referral rewards:', error);
    return {
      referralCount: 0,
      weeklyBonus: 0,
      nextResetDate: getNextMondayMidnight(),
    };
  }
}

/**
 * Calculates the weekly bankroll including referral bonus
 */
export function calculateWeeklyBankroll(referralCount: number): number {
  const BASE_BANKROLL = 100000; // $1,000 in cents
  const REFERRAL_BONUS = 10000; // $100 in cents
  return BASE_BANKROLL + referralCount * REFERRAL_BONUS;
}

/**
 * Gets the next Monday at midnight for reset timing
 */
function getNextMondayMidnight(): Date {
  const now = new Date();
  const nextMonday = new Date(now);

  // Set to next Monday
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
  nextMonday.setDate(now.getDate() + daysUntilMonday);

  // Set to midnight
  nextMonday.setHours(0, 0, 0, 0);

  return nextMonday;
}
