import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { authService } from '@/services/auth/authService';
import { OAuthProvider, CustomAuthError } from '@/services/auth/types';
import { supabase } from '@/services/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: CustomAuthError | null;

  // Actions
  signIn: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  checkSession: () => Promise<void>;
  setSession: (session: Session | null) => void;
  clearError: () => void;
  updateUsername: (username: string) => Promise<{ error: Error | null }>;
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  signIn: async (provider: OAuthProvider) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.signInWithOAuth(provider);

      if (response.error) {
        set({
          error: response.error as CustomAuthError,
          isLoading: false,
        });
        return;
      }

      // OAuth flow initiated, loading state continues
      // The actual session will be set via setSession when redirect completes
    } catch {
      set({
        error: {
          message: 'Failed to initiate sign in',
          status: 0,
          customCode: 'UNKNOWN',
        },
        isLoading: false,
      });
    }
  },

  signOut: async () => {
    set({ isLoading: true });

    try {
      await authService.signOut();
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch {
      set({
        error: {
          message: 'Failed to sign out',
          status: 0,
          customCode: 'UNKNOWN',
        },
        isLoading: false,
      });
    }
  },

  refreshSession: async () => {
    try {
      const refreshResponse = await authService.refreshSession();

      if (refreshResponse) {
        set({
          session: refreshResponse.session,
          user: refreshResponse.user,
          isAuthenticated: true,
          error: null,
        });
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
      // Don't set error state for refresh failures
      // Let the session expire naturally
    }
  },

  checkSession: async () => {
    set({ isLoading: true });

    try {
      const session = await authService.getSession();
      const user = await authService.getUser();

      set({
        session,
        user,
        isAuthenticated: !!session && !!user,
        isLoading: false,
        error: null,
      });
    } catch {
      set({
        session: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null, // Don't show error for initial check
      });
    }
  },

  setSession: (session: Session | null) => {
    set({
      session,
      user: session?.user || null,
      isAuthenticated: !!session,
      isLoading: false,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  updateUsername: async (username: string) => {
    const userId = _get().user?.id;
    if (!userId) {
      return { error: new Error('No user logged in') };
    }

    const { error } = await supabase
      .from('users')
      .update({ username: username.toLowerCase() })
      .eq('id', userId);

    if (!error) {
      // Update local user object
      set((state) => ({
        user: state.user
          ? {
              ...state.user,
              user_metadata: {
                ...state.user.user_metadata,
                username: username.toLowerCase(),
              },
            }
          : null,
      }));
    }

    return { error };
  },
}));
