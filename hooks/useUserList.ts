import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/authStore';

interface User {
  id: string;
  username: string;
  avatar_url?: string;
  favorite_team?: string;
  display_name?: string;
}

interface UseUserListOptions {
  type: 'followers' | 'following';
}

interface UseUserListReturn {
  users: User[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useUserList({ type }: UseUserListOptions): UseUserListReturn {
  const user = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query;

      if (type === 'followers') {
        query = supabase
          .from('follows')
          .select(
            `
            follower:users!follower_id (
              id,
              username,
              avatar_url,
              favorite_team,
              display_name
            )
          `
          )
          .eq('following_id', user.id);
      } else {
        query = supabase
          .from('follows')
          .select(
            `
            following:users!following_id (
              id,
              username,
              avatar_url,
              favorite_team,
              display_name
            )
          `
          )
          .eq('follower_id', user.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Extract the user data from the nested structure
      type FollowRecord = {
        follower?: User;
        following?: User;
      };

      const userList =
        (data
          ?.map((item) => {
            const record = item as FollowRecord;
            return type === 'followers' ? record.follower : record.following;
          })
          .filter(Boolean) as User[]) || [];
      setUsers(userList);
    } catch (err) {
      console.error(`Error loading ${type}:`, err);
      setError(err instanceof Error ? err : new Error(`Failed to load ${type}`));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, user?.id]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  };
}
