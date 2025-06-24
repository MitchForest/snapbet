import type { CustomAuthError, AuthErrorCode } from '@/services/auth/types';

const errorMessages: Record<AuthErrorCode, string> = {
  USER_CANCELLED: "Sign in cancelled. Try again when you're ready!",
  NETWORK_ERROR: 'Network connection issue. Please check your connection and try again.',
  PROVIDER_ERROR: 'Authentication provider error. Please try again or use a different provider.',
  UNKNOWN: 'Something went wrong. Please try again.',
};

export function getAuthErrorMessage(error: CustomAuthError | null): string {
  if (!error) return '';

  return errorMessages[error.customCode] || errorMessages.UNKNOWN;
}
