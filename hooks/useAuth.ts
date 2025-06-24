import { useAuthStore } from '@/stores/authStore';
import type { User, Session } from '@supabase/supabase-js';
import type { OAuthProvider, CustomAuthError } from '@/services/auth/types';

export interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: CustomAuthError | null;
  signIn: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const { user, session, isLoading, isAuthenticated, error, signIn, signOut, clearError } =
    useAuthStore();

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    error,
    signIn,
    signOut,
    clearError,
  };
}
