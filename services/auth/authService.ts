import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
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
  private redirectUrl = makeRedirectUri({
    scheme: 'snapbet',
    path: 'auth/callback',
  });

  constructor() {
    // Set up refresh callback
    sessionManager.onRefreshNeeded = () => {
      this.refreshSession().catch(console.error);
    };

    // Listen for URL changes (OAuth redirects)
    Linking.addEventListener('url', this.handleRedirect);
  }

  async signInWithOAuth(provider: OAuthProvider): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: makeRedirectUri({
            scheme: 'snapbet',
            path: 'auth',
          }),
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        return this.handleAuthError(error);
      }

      if (data?.url) {
        // Open OAuth provider in browser
        const result = await WebBrowser.openAuthSessionAsync(data.url, this.redirectUrl);

        if (result.type === 'cancel') {
          const cancelError: CustomAuthError = {
            message: 'User cancelled the authentication',
            status: 0,
            customCode: 'USER_CANCELLED',
          };
          return { user: null, session: null, error: cancelError };
        }

        // The actual auth handling happens in handleRedirect
        // Return pending state
        return { user: null, session: null, error: null };
      }

      return { user: null, session: null, error: null };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  private handleRedirect = async (event: { url: string }) => {
    if (event.url.includes('auth/callback')) {
      const url = event.url;

      // Extract the fragment containing tokens
      const fragment = url.split('#')[1];
      if (!fragment) return;

      // Parse the fragment parameters
      const params = new URLSearchParams(fragment);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        // Set the session in Supabase
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (data.session) {
          await sessionManager.saveSession(data.session);
        }

        if (error) {
          console.error('Failed to set session:', error);
        }
      }
    }
  };

  async refreshSession(): Promise<RefreshTokenResponse | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Failed to refresh session:', error);
        return null;
      }

      if (data.session) {
        await sessionManager.saveSession(data.session);
        return {
          session: data.session,
          user: data.user!,
        };
      }

      return null;
    } catch (error) {
      console.error('Refresh session error:', error);
      return null;
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
