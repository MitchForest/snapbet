import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from './useAuth';

export function useRequireAuth(redirectTo: string = '/welcome') {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}
