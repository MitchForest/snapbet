import { supabase } from '@/services/supabase/client';

// Cache to store checked usernames
const usernameCache = new Map<string, boolean>();

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const normalized = username.toLowerCase();

  // Check cache first
  if (usernameCache.has(normalized)) {
    return usernameCache.get(normalized)!;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', normalized)
      .single();

    // PGRST116 means no rows returned (username is available)
    const isAvailable = !data && error?.code === 'PGRST116';

    // Cache the result
    usernameCache.set(normalized, isAvailable);

    return isAvailable;
  } catch (error) {
    console.error('Error checking username availability:', error);
    // On error, assume username is not available (safer)
    return false;
  }
}

// Clear cache when needed (e.g., after successful username save)
export function clearUsernameCache() {
  usernameCache.clear();
}
