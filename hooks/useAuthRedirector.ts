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
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!navigationState?.key || isLoading || checkingUsername) return;

    const checkOnboarding = async () => {
      const inAuthGroup = segments[0] === '(auth)';
      const inDrawerGroup = segments[0] === '(drawer)';

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
          console.log('User needs onboarding - redirecting...');
          hasRedirected.current = true;
          router.replace('/(auth)/onboarding/username');
        } else if (hasUsername && !inDrawerGroup) {
          console.log(
            `User is authenticated and has username: ${data.username} - redirecting to app...`
          );
          hasRedirected.current = true;
          router.replace('/(drawer)/(tabs)');
        }
      } else if (!isAuthenticated && !inAuthGroup) {
        console.log('User is not authenticated - redirecting to login...');
        hasRedirected.current = true;
        router.replace('/(auth)/welcome');
      }
    };

    // Only check if we haven't already redirected
    if (!hasRedirected.current) {
      checkOnboarding();
    }
  }, [isAuthenticated, isLoading, user, navigationState?.key, router, checkingUsername, segments]);

  // Reset the redirect flag when auth state changes
  useEffect(() => {
    hasRedirected.current = false;
  }, [isAuthenticated]);
}
