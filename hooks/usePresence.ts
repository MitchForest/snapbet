import { useEffect } from 'react';
import { presenceService } from '@/services/realtime/presenceService';
import { useRealtimeStore } from '@/stores/realtimeStore';
import { useAuth } from './useAuth';

/**
 * Hook for tracking user presence (online/offline status)
 */
export function usePresence() {
  const { user } = useAuth();
  const { presenceMap, isUserOnline, getOnlineUserCount } = useRealtimeStore();

  useEffect(() => {
    if (!user?.id) return;

    // Start tracking presence for the current user
    presenceService.trackPresence(user.id);

    // Cleanup on unmount or user change
    return () => {
      presenceService.stopTracking();
    };
  }, [user?.id]);

  return {
    presenceMap,
    isUserOnline,
    getOnlineUserCount,
    onlineUsers: presenceService.getOnlineUsers(),
  };
}
