import React from 'react';
import { View, Text } from '@tamagui/core';
import { ActivityIndicator } from 'react-native';
import { useReferralRewards } from '@/hooks/useReferralRewards';
import { Colors } from '@/theme';

interface ReferralBonusDisplayProps {
  variant?: 'simple' | 'detailed';
}

export function ReferralBonusDisplay({ variant = 'simple' }: ReferralBonusDisplayProps) {
  const { referralCount, formattedBankroll, formattedBonus, isLoading } = useReferralRewards();

  if (isLoading) {
    return <ActivityIndicator size="small" color={Colors.primary} />;
  }

  if (variant === 'simple') {
    return (
      <Text fontSize={20} fontWeight="700" color="$textPrimary">
        {formattedBankroll}
      </Text>
    );
  }

  // Detailed variant for invite screen
  return (
    <View gap="$2">
      <Text fontSize={24} fontWeight="700" color="$textPrimary">
        Your weekly bankroll: {formattedBankroll}
      </Text>
      {referralCount > 0 && (
        <Text fontSize={16} color="$emerald">
          {formattedBonus} from {referralCount} referral{referralCount !== 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );
}
