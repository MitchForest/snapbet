import React from 'react';
import { View, Text, Stack } from '@tamagui/core';
import { Colors } from '@/theme';

interface PayoutDisplayProps {
  stake: number; // in cents
  odds: number; // American odds
  potentialWin: number; // in cents
}

export function PayoutDisplay({ stake, odds, potentialWin }: PayoutDisplayProps) {
  const totalReturn = stake + potentialWin;

  return (
    <View backgroundColor={Colors.surfaceAlt} borderRadius={12} padding={16} marginBottom={16}>
      <Stack flexDirection="row" justifyContent="space-between" marginBottom={8}>
        <Text fontSize={14} color={Colors.text.secondary}>
          Odds
        </Text>
        <Text fontSize={14} fontWeight="600" color={Colors.text.primary}>
          {formatOdds(odds)}
        </Text>
      </Stack>

      <Stack flexDirection="row" justifyContent="space-between" marginBottom={8}>
        <Text fontSize={14} color={Colors.text.secondary}>
          To Win
        </Text>
        <Text fontSize={16} fontWeight="600" color={Colors.success}>
          ${formatMoney(potentialWin)}
        </Text>
      </Stack>

      <View height={1} backgroundColor={Colors.border.light} marginVertical={8} />

      <Stack flexDirection="row" justifyContent="space-between">
        <Text fontSize={14} color={Colors.text.secondary}>
          Total Return
        </Text>
        <Text fontSize={18} fontWeight="700" color={Colors.text.primary}>
          ${formatMoney(totalReturn)}
        </Text>
      </Stack>
    </View>
  );
}

// Helper functions
function formatOdds(odds: number): string {
  if (odds === 0) return '—';
  if (odds > 0) return `+${odds}`;
  return odds.toString();
}

function formatMoney(cents: number): string {
  return (cents / 100).toFixed(2);
}
