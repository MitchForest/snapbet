import React, { useState, useEffect } from 'react';
import { View, Text, Stack } from '@tamagui/core';
import { TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '@/components/common/Logo';
import { OAuthButton } from '@/components/auth/OAuthButton';
import { LoadingOverlay } from '@/components/auth/LoadingOverlay';
import { useAuth } from '@/hooks/useAuth';
import { getAuthErrorMessage } from '@/utils/auth/errorMessages';
import {
  validateReferralCode,
  storePendingReferralCode,
} from '@/services/referral/referralService';
import type { OAuthProvider } from '@/services/auth/types';
import { Colors } from '@/theme';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, error, clearError, isLoading } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralError, setReferralError] = useState<string | null>(null);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleOAuthSignIn = async (provider: OAuthProvider) => {
    clearError();
    setLoadingProvider(provider);

    // Validate and store referral code if entered
    if (referralCode.trim()) {
      const validation = await validateReferralCode(referralCode.trim());
      if (validation.valid) {
        await storePendingReferralCode(referralCode.trim());
      }
    }

    try {
      await signIn(provider);
      // Navigation will be handled by the auth state change in _layout.tsx
    } catch (err) {
      console.error('OAuth sign in error:', err);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleReferralCodeChange = async (code: string) => {
    setReferralCode(code.toUpperCase());
    setReferralError(null);

    // Validate on complete code (6 characters)
    if (code.length === 6) {
      const validation = await validateReferralCode(code);
      if (!validation.valid) {
        setReferralError('Code not found - you can still sign up!');
      }
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
          <Logo size={48} variant="full" />

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

          {/* Referral Code Section */}
          <View width="100%" alignItems="center">
            {!showReferralInput ? (
              <TouchableOpacity onPress={() => setShowReferralInput(true)}>
                <Text fontSize={14} color="$emerald" textAlign="center">
                  Have an invite code?
                </Text>
              </TouchableOpacity>
            ) : (
              <View width="100%" alignItems="center" gap="$2">
                <TextInput
                  style={styles.referralInput}
                  placeholder="Enter invite code"
                  placeholderTextColor="#9CA3AF"
                  value={referralCode}
                  onChangeText={handleReferralCodeChange}
                  autoCapitalize="characters"
                  maxLength={6}
                  autoCorrect={false}
                />
                {referralError && (
                  <Text fontSize={12} color="$textSecondary" textAlign="center">
                    {referralError}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Error Message */}
          {error && (
            <Text fontSize={14} color="$error" textAlign="center" marginTop="$2">
              {getAuthErrorMessage(error)}
            </Text>
          )}
        </Stack>

        {/* Legal Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>For entertainment only. Must be 21+</Text>
        </View>
      </View>

      {/* Loading Overlay */}
      <LoadingOverlay visible={isLoading && loadingProvider !== null} />
    </>
  );
}

const styles = StyleSheet.create({
  disclaimerContainer: {
    backgroundColor: Colors.border.light,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 40,
  },
  disclaimerText: {
    fontSize: 12,
    textAlign: 'center' as const,
    color: Colors.gray[900],
  },
  referralInput: {
    width: '100%',
    height: 48,
    backgroundColor: Colors.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center' as const,
    letterSpacing: 2,
    color: Colors.gray[900],
  },
});
