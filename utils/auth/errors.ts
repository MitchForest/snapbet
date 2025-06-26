import { AuthErrorCode } from '@/services/auth/types';

export const authErrorMessages: Record<AuthErrorCode, string> = {
  USER_CANCELLED: 'Sign in was cancelled.',
  NETWORK_ERROR: 'Please check your internet connection and try again.',
  PROVIDER_ERROR: 'There was an issue with the authentication provider.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
  NO_SESSION: 'Your session has expired. Please sign in again.',
};
