import React from 'react';
import { View, Text } from '@tamagui/core';
import { Colors } from '@/theme';

interface LogoProps {
  size?: number;
  variant?: 'full' | 'icon';
}

export function Logo({ size = 40, variant = 'full' }: LogoProps) {
  if (variant === 'icon') {
    // Icon variant - just "SB"
    return (
      <View
        width={size}
        height={size}
        backgroundColor={Colors.primary}
        borderRadius="$round"
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize={size * 0.4} fontWeight="800" color="white" letterSpacing={-1}>
          SB
        </Text>
      </View>
    );
  }

  // Full variant - "Snapbet" text
  return (
    <View justifyContent="center" alignItems="center">
      <Text
        fontSize={size}
        fontWeight="800"
        color={Colors.primary}
        letterSpacing={-2}
        textAlign="center"
      >
        Snapbet
      </Text>
    </View>
  );
}
