import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useMutualFollows } from '@/hooks/useMutualFollows';

interface User {
  id: string;
  username: string;
  avatar_url?: string;
  display_name?: string;
  bio?: string;
}

interface UseUserListOptions {
  type: 'followers' | 'following';
  searchQuery?: string;
}

interface UseUserListReturn {
  users: User[];
  filteredUsers: User[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutualFollows: Map<string, boolean>;
  totalCount: number;
}

const INITIAL_LOAD = 50;

export function useUserList({ type, searchQuery = '' }: UseUserListOptions): UseUserListReturn {
  const user = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Get mutual follow status for all users
  const userIds = useMemo(() => users.map((u) => u.id), [users]);
  const { mutualFollows } = useMutualFollows(userIds);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter((user) => {
      return (
        user.username.toLowerCase().includes(query) ||
        user.display_name?.toLowerCase().includes(query)
      );
    });
  }, [users, searchQuery]);

  const fetchUsers = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First get total count
      const countQuery =
        type === 'followers'
          ? supabase
              .from('follows')
              .select('*', { count: 'exact', head: true })
              .eq('following_id', user.id)
          : supabase
              .from('follows')
              .select('*', { count: 'exact', head: true })
              .eq('follower_id', user.id);

      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Then fetch users with limit
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
              display_name,
              bio
            )
          `
          )
          .eq('following_id', user.id)
          .order('created_at', { ascending: false })
          .limit(INITIAL_LOAD);
      } else {
        query = supabase
          .from('follows')
          .select(
            `
            following:users!following_id (
              id,
              username,
              avatar_url,
              display_name,
              bio
            )
          `
          )
          .eq('follower_id', user.id)
          .order('created_at', { ascending: false })
          .limit(INITIAL_LOAD);
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
    filteredUsers,
    loading,
    error,
    refetch: fetchUsers,
    mutualFollows,
    totalCount,
  };
}
