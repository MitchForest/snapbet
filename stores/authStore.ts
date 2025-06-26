import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { authService } from '@/services/auth/authService';
import { OAuthProvider, CustomAuthError } from '@/services/auth/types';
import { supabase } from '@/services/supabase/client';
import { getPendingReferralCode, trackReferral } from '@/services/referral/referralService';
import { getUserBadgeCount } from '@/services/badges/badgeService';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboarding: boolean;
  error: CustomAuthError | null;
  weeklyBadgeCount: number;

  // Actions
  signIn: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  checkSession: () => Promise<void>;
  setSession: (session: Session | null) => void;
  clearError: () => void;
  updateUsername: (username: string) => Promise<{ error: Error | null }>;
  updateFavoriteTeam: (teamId: string | null) => Promise<void>;
  updateNotificationSettings: (
    settings: Record<string, boolean>
  ) => Promise<{ error: Error | null }>;
  updatePrivacySettings: (settings: Record<string, boolean>) => Promise<{ error: Error | null }>;
  updateProfile: (updates: {
    display_name?: string;
    bio?: string;
  }) => Promise<{ error: Error | null }>;
  resetBankroll: () => Promise<{ error: Error | null }>;
  setWeeklyBadgeCount: (count: number) => void;
  refreshBadgeCount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  isOnboarding: false,
  error: null,
  weeklyBadgeCount: 0,

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

      // If we got a session back, set it
      if (response.session && response.user) {
        console.log('Sign in successful, setting session');
        set({
          session: response.session,
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Load badge count after sign in
        const badgeCount = await getUserBadgeCount(response.user.id);
        set({ weeklyBadgeCount: badgeCount });

        // Process pending referral code if this is a new user
        setTimeout(async () => {
          try {
            const pendingCode = await getPendingReferralCode();
            if (pendingCode) {
              await trackReferral(pendingCode, response.user!.id);
            }
          } catch (error) {
            console.error('Error processing referral:', error);
          }
        }, 0);
      } else {
        // OAuth flow initiated but not completed yet
        set({ isLoading: false });
      }
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
        weeklyBadgeCount: 0,
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

        // Refresh badge count
        if (refreshResponse.user) {
          const badgeCount = await getUserBadgeCount(refreshResponse.user.id);
          set({ weeklyBadgeCount: badgeCount });
        }
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
      // Don't set error state for refresh failures
      // Let the session expire naturally
    }
  },

  checkSession: async () => {
    console.log(`[${new Date().toISOString()}] authStore.checkSession - called`);
    set({ isLoading: true });

    try {
      const session = await authService.getSession();
      const user = await authService.getUser();

      console.log(`[${new Date().toISOString()}] authStore.checkSession - results:`, {
        hasSession: !!session,
        hasUser: !!user,
        userId: user?.id,
      });

      set({
        session,
        user,
        isAuthenticated: !!session && !!user,
        isLoading: false,
        error: null,
      });

      // Load badge count if user exists
      if (user) {
        const badgeCount = await getUserBadgeCount(user.id);
        set({ weeklyBadgeCount: badgeCount });
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] authStore.checkSession - error:`, error);
      set({
        session: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null, // Don't show error for initial check
        weeklyBadgeCount: 0,
      });
    }
  },

  setSession: (session: Session | null) => {
    console.log(`[${new Date().toISOString()}] authStore.setSession - called with:`, {
      hasSession: !!session,
      userId: session?.user?.id,
    });
    
    set({
      session,
      user: session?.user || null,
      isAuthenticated: !!session,
      isLoading: false,
      error: null,
    });

    // Load badge count when session is set
    if (session?.user) {
      getUserBadgeCount(session.user.id).then((count) => {
        set({ weeklyBadgeCount: count });
      });

      // Process pending referral code if this is a new user
      // Use setTimeout to avoid blocking the auth flow
      setTimeout(async () => {
        try {
          const pendingCode = await getPendingReferralCode();
          if (pendingCode) {
            await trackReferral(pendingCode, session.user.id);
          }
        } catch (error) {
          console.error('Error processing referral:', error);
          // Don't fail the auth flow for referral errors
        }
      }, 0);
    }
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

  updateFavoriteTeam: async (teamId: string | null) => {
    const currentUser = _get().user;
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ favorite_team: teamId })
        .eq('id', currentUser.id);

      if (error) {
        console.error('Error updating favorite team:', error);
        throw error;
      }

      // Update local state
      set({
        user: {
          ...currentUser,
          user_metadata: {
            ...currentUser.user_metadata,
            favorite_team: teamId,
          },
        },
      });
    } catch (error) {
      console.error('Failed to update favorite team:', error);
      throw error;
    }
  },

  updateNotificationSettings: async (settings: Record<string, boolean>) => {
    const userId = _get().user?.id;
    if (!userId) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('users')
      .update({ notification_settings: settings })
      .eq('id', userId);

    return { error };
  },

  updatePrivacySettings: async (settings: Record<string, boolean>) => {
    const userId = _get().user?.id;
    if (!userId) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('users')
      .update({ privacy_settings: settings })
      .eq('id', userId);

    return { error };
  },

  updateProfile: async (updates: { display_name?: string; bio?: string }) => {
    const userId = _get().user?.id;
    if (!userId) return { error: new Error('No user logged in') };

    const { error } = await supabase.from('users').update(updates).eq('id', userId);

    if (!error) {
      // Update local user object
      set((state) => ({
        user: state.user
          ? {
              ...state.user,
              user_metadata: {
                ...state.user.user_metadata,
                ...updates,
              },
            }
          : null,
      }));
    }

    return { error };
  },

  resetBankroll: async () => {
    const userId = _get().user?.id;
    if (!userId) return { error: new Error('No user logged in') };

    const { error } = await supabase.rpc('reset_bankroll', { p_user_id: userId });

    return { error };
  },

  setWeeklyBadgeCount: (count: number) => {
    set({ weeklyBadgeCount: count });
  },

  refreshBadgeCount: async () => {
    const userId = _get().user?.id;
    if (!userId) return;

    try {
      const count = await getUserBadgeCount(userId);
      set({ weeklyBadgeCount: count });
    } catch (error) {
      console.error('Error refreshing badge count:', error);
    }
  },
}));
