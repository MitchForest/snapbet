import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { AppState, AppStateStatus } from 'react-native';

export function useSession() {
  const { checkSession, refreshSession } = useAuthStore();

  useEffect(() => {
    // Check session on mount
    checkSession();

    // Refresh session when app comes to foreground
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        refreshSession();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [checkSession, refreshSession]);
}
