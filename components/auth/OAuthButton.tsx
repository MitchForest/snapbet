import React from 'react';
import { View, Text, styled } from '@tamagui/core';
import { Pressable, ActivityIndicator } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import type { OAuthProvider } from '@/services/auth/types';

interface OAuthButtonProps {
  provider: OAuthProvider;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const StyledView = styled(View, {
  height: 48,
  paddingHorizontal: '$5',
  borderRadius: '$3',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$3',
  borderWidth: 1,

  variants: {
    provider: {
      google: {
        backgroundColor: 'white',
        borderColor: '#4285F4',
      },
      twitter: {
        backgroundColor: 'black',
        borderColor: 'black',
      },
    },
  } as const,
});

const ButtonText = styled(Text, {
  fontSize: 16,
  fontWeight: '500',

  variants: {
    provider: {
      google: {
        color: 'black',
      },
      twitter: {
        color: 'white',
      },
    },
  } as const,
});

function GoogleIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20">
      <G fill="none" fillRule="evenodd">
        <Path
          d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z"
          fill="#4285F4"
        />
        <Path
          d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z"
          fill="#34A853"
        />
        <Path
          d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z"
          fill="#FBBC05"
        />
        <Path
          d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.192 5.737 7.396 3.977 10 3.977z"
          fill="#EA4335"
        />
      </G>
    </Svg>
  );
}

function TwitterIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20">
      <Path
        d="M2 2L8.5 11L2 18H3.5L9.5 11.5L14 18H18L11 8.5L17.5 2H16L10.5 8L6.5 2H2Z"
        fill="white"
        stroke="white"
        strokeWidth="0.5"
      />
    </Svg>
  );
}

export function OAuthButton({
  provider,
  onPress,
  loading = false,
  disabled = false,
}: OAuthButtonProps) {
  const handlePress = async () => {
    if (disabled || loading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getButtonText = () => {
    if (provider === 'google') return 'Sign in with Google';
    return 'Sign in with X';
  };

  return (
    <Pressable onPress={handlePress} disabled={disabled || loading}>
      <StyledView provider={provider} opacity={disabled || loading ? 0.6 : 1}>
        {loading ? (
          <ActivityIndicator size="small" color={provider === 'google' ? 'black' : 'white'} />
        ) : (
          <>
            <View width={20} height={20}>
              {provider === 'google' ? <GoogleIcon /> : <TwitterIcon />}
            </View>
            <ButtonText provider={provider}>{getButtonText()}</ButtonText>
          </>
        )}
      </StyledView>
    </Pressable>
  );
}
