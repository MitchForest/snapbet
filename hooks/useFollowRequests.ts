import { useState, useEffect, useCallback } from 'react';
import { followRequestService, FollowRequest } from '@/services/social/followRequestService';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase/client';
import { toastService } from '@/services/toastService';

export function useFollowRequests() {
  const user = useAuthStore((state) => state.user);
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState<string | null>(null);

  // Fetch initial requests
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchRequests = async () => {
      try {
        const [requestsList, count] = await Promise.all([
          followRequestService.getIncomingRequests(user.id),
          followRequestService.getRequestCount(user.id),
        ]);

        setRequests(requestsList);
        setPendingCount(count);
      } catch (error) {
        console.error('Error fetching follow requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [user?.id]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('follow_requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follow_requests',
          filter: `requested_id=eq.${user.id}`,
        },
        async (_payload) => {
          // Refetch requests when there's a change
          const [requestsList, count] = await Promise.all([
            followRequestService.getIncomingRequests(user.id),
            followRequestService.getRequestCount(user.id),
          ]);

          setRequests(requestsList);
          setPendingCount(count);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const acceptRequest = useCallback(
    async (requestId: string) => {
      if (!user?.id || isActioning) return;

      setIsActioning(requestId);

      try {
        const result = await followRequestService.handleFollowRequest(requestId, 'accept');

        if (result.success) {
          // Remove from local state
          setRequests((prev) => prev.filter((r) => r.id !== requestId));
          setPendingCount((prev) => Math.max(0, prev - 1));
          toastService.show({
            message: 'Follow request accepted',
            type: 'success',
          });
        } else {
          toastService.show({
            message: result.error || 'Failed to accept request',
            type: 'error',
          });
        }
      } catch (error) {
        console.error('Error accepting request:', error);
        toastService.show({
          message: 'An error occurred',
          type: 'error',
        });
      } finally {
        setIsActioning(null);
      }
    },
    [user?.id, isActioning]
  );

  const rejectRequest = useCallback(
    async (requestId: string) => {
      if (!user?.id || isActioning) return;

      setIsActioning(requestId);

      try {
        const result = await followRequestService.handleFollowRequest(requestId, 'reject');

        if (result.success) {
          // Remove from local state
          setRequests((prev) => prev.filter((r) => r.id !== requestId));
          setPendingCount((prev) => Math.max(0, prev - 1));
          toastService.show({
            message: 'Follow request rejected',
            type: 'success',
          });
        } else {
          toastService.show({
            message: result.error || 'Failed to reject request',
            type: 'error',
          });
        }
      } catch (error) {
        console.error('Error rejecting request:', error);
        toastService.show({
          message: 'An error occurred',
          type: 'error',
        });
      } finally {
        setIsActioning(null);
      }
    },
    [user?.id, isActioning]
  );

  const rejectAllRequests = useCallback(async () => {
    if (!user?.id || isActioning) return;

    setIsActioning('all');

    try {
      const result = await followRequestService.rejectAllRequests(user.id);

      if (result.success) {
        setRequests([]);
        setPendingCount(0);
        toastService.show({
          message: 'All follow requests rejected',
          type: 'success',
        });
      } else {
        toastService.show({
          message: result.error || 'Failed to reject all requests',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error rejecting all requests:', error);
      toastService.show({
        message: 'An error occurred',
        type: 'error',
      });
    } finally {
      setIsActioning(null);
    }
  }, [user?.id, isActioning]);

  return {
    requests,
    pendingCount,
    isLoading,
    isActioning,
    acceptRequest,
    rejectRequest,
    rejectAllRequests,
  };
}
