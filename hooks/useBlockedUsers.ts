import { useState, useEffect, useCallback } from 'react';
import { blockService, BlockedUser } from '@/services/moderation/blockService';
import { eventEmitter, ModerationEvents } from '@/utils/eventEmitter';
import { toastService } from '@/services/toastService';
import { useAuth } from './useAuth';

interface UseBlockedUsersResult {
  blockedUsers: BlockedUser[];
  blockedUserIds: string[];
  isLoading: boolean;
  error: string | null;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  isBlocked: (userId: string) => boolean;
  refresh: () => Promise<void>;
}

export function useBlockedUsers(): UseBlockedUsersResult {
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load blocked users
  const loadBlockedUsers = useCallback(async () => {
    if (!user) {
      setBlockedUsers([]);
      setBlockedUserIds([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await blockService.getBlockedUsers();
      setBlockedUsers(result.users);
      setBlockedUserIds(result.users.map((u) => u.blocked_id));
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading blocked users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load blocked users');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Block a user
  const blockUser = useCallback(
    async (userId: string) => {
      if (!user) {
        toastService.showError('Please sign in to block users');
        return;
      }

      // Optimistic update
      setBlockedUserIds((prev) => [...prev, userId]);

      const result = await blockService.blockUser(userId);

      if (result.success) {
        toastService.showSuccess('User blocked successfully');
        // Refresh to get full user data
        await loadBlockedUsers();
      } else {
        // Rollback on error
        setBlockedUserIds((prev) => prev.filter((id) => id !== userId));
        toastService.showError(result.error || 'Failed to block user');
      }
    },
    [user, loadBlockedUsers]
  );

  // Unblock a user
  const unblockUser = useCallback(
    async (userId: string) => {
      if (!user) {
        toastService.showError('Please sign in to unblock users');
        return;
      }

      // Optimistic update
      setBlockedUserIds((prev) => prev.filter((id) => id !== userId));
      setBlockedUsers((prev) => prev.filter((u) => u.blocked_id !== userId));

      const result = await blockService.unblockUser(userId);

      if (result.success) {
        toastService.showSuccess('User unblocked successfully');
      } else {
        // Rollback on error
        await loadBlockedUsers();
        toastService.showError(result.error || 'Failed to unblock user');
      }
    },
    [user, loadBlockedUsers]
  );

  // Check if a user is blocked
  const isBlocked = useCallback(
    (userId: string) => {
      return blockedUserIds.includes(userId);
    },
    [blockedUserIds]
  );

  // Refresh blocked users
  const refresh = useCallback(async () => {
    await loadBlockedUsers();
  }, [loadBlockedUsers]);

  // Listen for block/unblock events
  useEffect(() => {
    const blockSubscription = eventEmitter.addListener(
      ModerationEvents.USER_BLOCKED,
      ({ userId: blockedId }) => {
        // Update local state when someone is blocked
        setBlockedUserIds((prev) => [...new Set([...prev, blockedId])]);
        // Refresh to get full data
        loadBlockedUsers();
      }
    );

    const unblockSubscription = eventEmitter.addListener(
      ModerationEvents.USER_UNBLOCKED,
      ({ userId: unblockedId }) => {
        // Update local state when someone is unblocked
        setBlockedUserIds((prev) => prev.filter((id) => id !== unblockedId));
        setBlockedUsers((prev) => prev.filter((u) => u.blocked_id !== unblockedId));
      }
    );

    return () => {
      blockSubscription.remove();
      unblockSubscription.remove();
    };
  }, [loadBlockedUsers]);

  // Initial load
  useEffect(() => {
    loadBlockedUsers();
  }, [loadBlockedUsers]);

  return {
    blockedUsers,
    blockedUserIds,
    isLoading,
    error,
    blockUser,
    unblockUser,
    isBlocked,
    refresh,
  };
}
