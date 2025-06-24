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
  private redirectUrl: string;

  constructor() {
    // Use Expo's auth proxy for Expo Go
    this.redirectUrl = makeRedirectUri({
      scheme: 'snapbet',
    });

    console.log('Auth redirect URL:', this.redirectUrl);

    // Set up refresh callback
    sessionManager.onRefreshNeeded = () => {
      this.refreshSession().catch(console.error);
    };

    // Listen for URL changes (OAuth redirects)
    // This handles Supabase's non-standard URL format with # instead of ?
    Linking.addEventListener('url', async (event) => {
      console.log('=== LINKING EVENT RECEIVED ===');
      console.log('Raw URL:', event.url);
      
      // Only process URLs that look like OAuth callbacks
      if (!event.url.includes('access_token') && !event.url.includes('#')) {
        console.log('URL does not contain OAuth tokens, ignoring');
        return;
      }
      
      // Parse Supabase URL (converts # to ?)
      const parseSupabaseUrl = (url: string) => {
        let parsedUrl = url;
        if (url.includes('#')) {
          parsedUrl = url.replace('#', '?');
        }
        return parsedUrl;
      };
      
      const transformedUrl = parseSupabaseUrl(event.url);
      const parsedUrl = Linking.parse(transformedUrl);
      
      console.log('Parsed URL:', {
        scheme: parsedUrl.scheme,
        hostname: parsedUrl.hostname,
        path: parsedUrl.path,
        queryParams: parsedUrl.queryParams ? Object.keys(parsedUrl.queryParams) : []
      });
      
      // Check if we have tokens
      const accessToken = parsedUrl.queryParams?.access_token as string;
      const refreshToken = parsedUrl.queryParams?.refresh_token as string;
      
      if (accessToken && refreshToken) {
        console.log('✅ Found tokens in URL, setting session...');
        
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('❌ Error setting session:', error);
          } else {
            console.log('✅ Session set successfully!');
            if (data.session) {
              await sessionManager.saveSession(data.session);
              console.log('✅ Session saved to secure storage');
            }
          }
        } catch (err) {
          console.error('❌ Exception while setting session:', err);
        }
      } else {
        console.log('⚠️ No tokens found in URL');
        console.log('Available params:', parsedUrl.queryParams);
      }
    });
  }

  async signInWithOAuth(provider: OAuthProvider): Promise<AuthResponse> {
    try {
      // Get the redirect URL for Expo
      const redirectTo = makeRedirectUri({
        scheme: 'snapbet',
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

      if (data?.url) {
        console.log('Opening OAuth URL in browser...');
        console.log('OAuth URL:', data.url.substring(0, 100) + '...');
        
        // Open in browser without waiting - the Linking listener will handle the redirect
        await WebBrowser.openBrowserAsync(data.url);
        
        // After opening the browser, check if we got a session after a short delay
        // This handles cases where the Linking event doesn't fire properly
        return new Promise((resolve) => {
          setTimeout(async () => {
            console.log('Checking for session after OAuth flow...');
            const { data: sessionData } = await supabase.auth.getSession();
            
            if (sessionData.session) {
              console.log('✅ Found session after OAuth flow!');
              await sessionManager.saveSession(sessionData.session);
              
              resolve({
                user: sessionData.session.user,
                session: sessionData.session,
                error: null,
              });
            } else {
              console.log('No session found after OAuth flow');
              resolve({
                user: null,
                session: null,
                error: null,
              });
            }
          }, 2000); // Wait 2 seconds for the OAuth flow to complete
        });
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
