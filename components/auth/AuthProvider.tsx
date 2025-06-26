import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/auth/authService';
import { useAuthRedirector } from '@/hooks/useAuthRedirector';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setSession } = useAuthStore();

  useAuthRedirector();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession]);

  return <>{children}</>;
}
