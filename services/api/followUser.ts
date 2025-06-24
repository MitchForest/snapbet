import { supabase } from '@/services/supabase/client';

export async function followUser(
  followingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase.from('follows').insert({
      follower_id: user.id,
      following_id: followingId,
    });

    if (error) {
      if (error.code === '23505') {
        // Unique violation
        return { success: false, error: 'Already following this user' };
      }
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error following user:', error);
    return { success: false, error: 'Failed to follow user' };
  }
}

export async function unfollowUser(
  followingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return { success: false, error: 'Failed to unfollow user' };
  }
}

export async function isFollowing(followingId: string): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // Not found is ok
      console.error('Error checking follow status:', error);
    }

    return !!data;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}

export async function getFollowingIds(): Promise<string[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    if (error) {
      console.error('Error fetching following:', error);
      return [];
    }

    return data?.map((f) => f.following_id) || [];
  } catch (error) {
    console.error('Error fetching following:', error);
    return [];
  }
}
