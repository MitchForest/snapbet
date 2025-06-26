import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { AppState, AppStateStatus } from 'react-native';

export function useSession() {
  const { refreshSession } = useAuthStore();

  useEffect(() => {
    // Don't check session on mount - AuthProvider already does this
    
    // Refresh session when app comes to foreground
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log(`[${new Date().toISOString()}] useSession - App became active, refreshing session`);
        refreshSession();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [refreshSession]);
}
