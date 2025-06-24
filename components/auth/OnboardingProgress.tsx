import React from 'react';
import { View } from '@tamagui/core';

interface OnboardingProgressProps {
  currentStep: 1 | 2 | 3;
}

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  return (
    <View flexDirection="row" gap="$2" justifyContent="center" marginVertical="$4">
      <View
        width={8}
        height={8}
        borderRadius={4}
        backgroundColor={currentStep >= 1 ? '$primary' : '$border'}
      />
      <View
        width={8}
        height={8}
        borderRadius={4}
        backgroundColor={currentStep >= 2 ? '$primary' : '$border'}
      />
      <View
        width={8}
        height={8}
        borderRadius={4}
        backgroundColor={currentStep >= 3 ? '$primary' : '$border'}
      />
    </View>
  );
}
