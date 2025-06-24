import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/auth/authService';
import { useSession } from '@/hooks/useSession';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setSession, checkSession } = useAuthStore();

  // Initialize session management
  useSession();

  // Check for existing session on mount
  useEffect(() => {
    console.log('AuthProvider mounted, checking initial session...');
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event);
      console.log('Session in auth state change:', !!session, session?.user?.email);

      // Use setTimeout to defer async operations and avoid deadlocks
      setTimeout(() => {
        setSession(session);
      }, 0);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession]);

  return <>{children}</>;
}
