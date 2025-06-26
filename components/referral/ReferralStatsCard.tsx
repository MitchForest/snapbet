import React from 'react';
import { View, Text, Stack } from '@tamagui/core';
import { useReferralRewards } from '@/hooks/useReferralRewards';

export function ReferralStatsCard() {
  const { referralCount, formattedBonus } = useReferralRewards();

  return (
    <View backgroundColor="$emerald" padding="$4" borderRadius="$3" marginBottom="$4">
      <Stack gap="$2">
        <Text fontSize={14} fontWeight="500" color="white" opacity={0.9}>
          💰 Referral Rewards
        </Text>

        <View flexDirection="row" alignItems="baseline" gap="$2">
          <Text fontSize={32} fontWeight="700" color="white">
            +{formattedBonus}
          </Text>
          <Text fontSize={16} fontWeight="500" color="white" opacity={0.9}>
            per week
          </Text>
        </View>

        <Text fontSize={14} color="white" opacity={0.9}>
          From {referralCount} successful referral{referralCount !== 1 ? 's' : ''}
        </Text>

        <View backgroundColor="white" opacity={0.2} height={1} marginVertical="$2" />

        <Text fontSize={12} color="white" opacity={0.8}>
          Earn $100 weekly for each friend who joins!
        </Text>
      </Stack>
    </View>
  );
}
