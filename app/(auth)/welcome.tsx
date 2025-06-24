import React, { useState, useEffect } from 'react';
import { View, Text, Stack } from '@tamagui/core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '@/components/common/Logo';
import { OAuthButton } from '@/components/auth/OAuthButton';
import { LoadingOverlay } from '@/components/auth/LoadingOverlay';
import { useAuth } from '@/hooks/useAuth';
import { getAuthErrorMessage } from '@/utils/auth/errorMessages';
import type { OAuthProvider } from '@/services/auth/types';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, error, clearError, isLoading } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleOAuthSignIn = async (provider: OAuthProvider) => {
    clearError();
    setLoadingProvider(provider);

    try {
      await signIn(provider);
      // Navigation will be handled by the auth state change in _layout.tsx
    } catch (err) {
      console.error('OAuth sign in error:', err);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <>
      <View
        flex={1}
        backgroundColor="$background"
        paddingTop={insets.top}
        paddingBottom={insets.bottom}
        paddingHorizontal="$8"
      >
        <Stack flex={1} justifyContent="center" alignItems="center" gap="$6">
          {/* Logo */}
          <Logo size={80} />

          {/* Tagline */}
          <Text fontSize={20} fontWeight="600" color="$textPrimary" textAlign="center">
            Sports betting with friends
          </Text>

          {/* OAuth Buttons */}
          <Stack width="100%" gap="$3" marginTop="$4">
            <OAuthButton
              provider="google"
              onPress={() => handleOAuthSignIn('google')}
              loading={loadingProvider === 'google'}
              disabled={loadingProvider !== null}
            />
            <OAuthButton
              provider="twitter"
              onPress={() => handleOAuthSignIn('twitter')}
              loading={loadingProvider === 'twitter'}
              disabled={loadingProvider !== null}
            />
          </Stack>

          {/* Error Message */}
          {error && (
            <Text fontSize={14} color="$error" textAlign="center" marginTop="$2">
              {getAuthErrorMessage(error)}
            </Text>
          )}
        </Stack>

        {/* Legal Disclaimer */}
        <Text fontSize={12} color="$textTertiary" textAlign="center" marginBottom="$4">
          For entertainment only. Must be 21+
        </Text>
      </View>

      {/* Loading Overlay */}
      <LoadingOverlay visible={isLoading && loadingProvider !== null} />
    </>
  );
}
