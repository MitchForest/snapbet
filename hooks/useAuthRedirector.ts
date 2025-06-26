import { useEffect } from 'react';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export function useAuthRedirector() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (!navigationState?.key || isLoading) return;

    const checkOnboarding = async () => {
      if (isAuthenticated && user) {
        // Assuming a user object has a 'username' property after onboarding
        const needsOnboarding = !user.user_metadata?.username;

        if (needsOnboarding) {
          console.log('User needs onboarding - redirecting...');
          router.replace('/(auth)/onboarding/username');
        } else {
          console.log('User is authenticated and onboarded - redirecting to app...');
          router.replace('/(drawer)');
        }
      } else {
        console.log('User is not authenticated - redirecting to login...');
        router.replace('/(auth)/welcome');
      }
    };

    checkOnboarding();
  }, [isAuthenticated, isLoading, user, navigationState?.key, router]);
}
