import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase/client';

export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/welcome');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}

export function useRequireOnboarding() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!isLoading && isAuthenticated && user) {
        // Check if user has username in the database
        const { data: profile } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .single();

        if (!profile?.username) {
          console.log('User needs onboarding - no username');
          router.replace('/(auth)/onboarding/username');
        }
      }
    };

    checkOnboarding();
  }, [user, isAuthenticated, isLoading, router]);

  return { needsOnboarding: !user?.user_metadata?.username };
}
