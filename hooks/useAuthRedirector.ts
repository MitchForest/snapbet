import { useEffect, useState, useRef } from 'react';
import { useRouter, useRootNavigationState, useSegments } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase/client';

export function useAuthRedirector() {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [checkingUsername, setCheckingUsername] = useState(false);
  const lastAuthState = useRef(isAuthenticated);

  useEffect(() => {
    if (!navigationState?.key || isLoading || checkingUsername) return;

    const checkOnboarding = async () => {
      const inAuthGroup = segments[0] === '(auth)';
      const inDrawerGroup = segments[0] === '(drawer)';

      // Log for debugging - commented out to reduce console noise
      // console.log('[AuthRedirector]', {
      //   isAuthenticated,
      //   hasUser: !!user,
      //   inAuthGroup,
      //   inDrawerGroup,
      //   segments,
      // });

      if (isAuthenticated && user) {
        setCheckingUsername(true);

        // Check if user has a username in the users table
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .single();

        setCheckingUsername(false);

        const hasUsername = !error && !!data?.username;

        if (!hasUsername && !inAuthGroup) {
          // console.log('[AuthRedirector] User needs onboarding - redirecting...');
          router.replace('/(auth)/onboarding/username');
        } else if (hasUsername && !inDrawerGroup && !inAuthGroup) {
          // console.log(
          //   `[AuthRedirector] User is authenticated and has username: ${data.username} - redirecting to app...`
          // );
          router.replace('/(drawer)/(tabs)');
        }
      } else if (!isAuthenticated && !inAuthGroup) {
        // console.log('[AuthRedirector] User is not authenticated - redirecting to login...');
        router.replace('/(auth)/welcome');
      }
    };

    // Check if auth state changed
    if (lastAuthState.current !== isAuthenticated) {
      lastAuthState.current = isAuthenticated;
      checkOnboarding();
    } else {
      // Also check on initial mount and segment changes
      checkOnboarding();
    }
  }, [isAuthenticated, isLoading, user, navigationState?.key, router, checkingUsername, segments]);
}
