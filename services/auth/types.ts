import type { User, Session, AuthError } from '@supabase/supabase-js';

export type OAuthProvider = 'google' | 'twitter';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | CustomAuthError | null;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | CustomAuthError | null;
}

export interface SessionData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

export type AuthErrorCode = 'USER_CANCELLED' | 'NETWORK_ERROR' | 'PROVIDER_ERROR' | 'UNKNOWN';

export interface CustomAuthError {
  message: string;
  status: number;
  customCode: AuthErrorCode;
}

export interface RefreshTokenResponse {
  session: Session;
  user: User;
}
