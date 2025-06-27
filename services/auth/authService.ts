import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { sessionManager } from './sessionManager';
import type {
  OAuthProvider,
  AuthResponse,
  CustomAuthError,
  AuthErrorCode,
  RefreshTokenResponse,
} from './types';

// Ensure web browser sessions complete properly
WebBrowser.maybeCompleteAuthSession();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with secure storage
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: sessionManager.getStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

class AuthService {
  constructor() {
    // Set up refresh callback
    sessionManager.onRefreshNeeded = () => {
      this.refreshSession().catch(console.error);
    };
  }

  async signInWithOAuth(provider: OAuthProvider): Promise<AuthResponse> {
    try {
      const redirectTo = makeRedirectUri({
        scheme: 'snapbet',
        path: 'auth/callback',
      });

      console.log('OAuth redirect URL:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error('OAuth initialization error:', error);
        return this.handleAuthError(error);
      }

      if (!data.url) {
        return {
          user: null,
          session: null,
          error: {
            message: 'Could not get OAuth URL',
            status: 500,
            customCode: 'UNKNOWN',
          },
        };
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
        showInRecents: true,
      });

      if (result.type === 'cancel' || result.type === 'dismiss') {
        return {
          user: null,
          session: null,
          error: {
            message: 'Sign in cancelled',
            status: 0,
            customCode: 'USER_CANCELLED',
          },
        };
      }

      if (result.type === 'success') {
        const { url } = result;
        // Supabase sends the session info in the URL fragment
        const params = new URLSearchParams(url.split('#')[1]);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (!accessToken || !refreshToken) {
          return {
            user: null,
            session: null,
            error: {
              message: 'Invalid session info in redirect URL',
              status: 400,
              customCode: 'PROVIDER_ERROR',
            },
          };
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          return this.handleAuthError(sessionError);
        }

        if (sessionData.session) {
          await sessionManager.saveSession(sessionData.session);
        }

        return {
          user: sessionData.user,
          session: sessionData.session,
          error: null,
        };
      }

      return { user: null, session: null, error: null };
    } catch (error) {
      console.error('OAuth error:', error);
      return this.handleAuthError(error);
    }
  }

  async refreshSession(): Promise<RefreshTokenResponse | null> {
    try {
      const session = await sessionManager.getSession();
      if (!session) {
        return null;
      }

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: session.refresh_token,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        await sessionManager.saveSession(data.session);
      }

      return { user: data.user!, session: data.session! };
    } catch (error) {
      console.error('Failed to refresh session:', error);
      await sessionManager.clearSession();
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      await sessionManager.clearSession();
    } catch (error) {
      console.error('Sign out error:', error);
      // Clear local session even if remote fails
      await sessionManager.clearSession();
    }
  }

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  async getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }

  private handleAuthError(error: unknown): AuthResponse {
    let authError: CustomAuthError;

    if (error && typeof error === 'object' && 'message' in error) {
      const message = error.message as string;
      const status = 'status' in error ? (error.status as number) : 0;

      // Determine error code based on message
      let customCode: AuthErrorCode = 'UNKNOWN';
      if (message.includes('network')) {
        customCode = 'NETWORK_ERROR';
      } else if (message.includes('provider')) {
        customCode = 'PROVIDER_ERROR';
      }

      authError = {
        message,
        status,
        customCode,
      };
    } else {
      authError = {
        message: 'An unknown error occurred',
        status: 0,
        customCode: 'UNKNOWN',
      };
    }

    return { user: null, session: null, error: authError };
  }
}

export const authService = new AuthService();
