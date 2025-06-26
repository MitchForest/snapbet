import React from 'react';
import { Stack, Text } from '@tamagui/core';
import { Pressable, ActivityIndicator } from 'react-native';
import { Colors } from '@/theme';
import { useBankroll } from '@/hooks/useBankroll';
import { useActiveBets } from '@/hooks/useBetting';

interface BankrollBadgeProps {
  onPress?: () => void;
}

export function BankrollBadge({ onPress }: BankrollBadgeProps) {
  const { data: bankroll, isLoading: bankrollLoading } = useBankroll();
  const { bets: pendingBets, isLoading: betsLoading } = useActiveBets();

  const isLoading = bankrollLoading || betsLoading;

  // Calculate available balance
  const pendingTotal = pendingBets?.reduce((sum, bet) => sum + bet.stake, 0) || 0;
  const available = (bankroll?.balance || 0) - pendingTotal;

  // Determine color based on weekly P&L
  const weeklyPL = bankroll ? bankroll.balance - bankroll.weekly_deposit : 0;
  const color = getBankrollColor(weeklyPL);

  if (isLoading) {
    return (
      <Stack
        backgroundColor="$gray3"
        paddingHorizontal="$3"
        paddingVertical="$2"
        borderRadius="$4"
        alignItems="center"
        width={80}
        height={32}
        justifyContent="center"
        flexDirection="row"
      >
        <ActivityIndicator size="small" color={Colors.text.secondary} />
      </Stack>
    );
  }

  return (
    <Pressable onPress={onPress}>
      <Stack
        backgroundColor="$gray3"
        paddingHorizontal="$3"
        paddingVertical="$2"
        borderRadius="$4"
        alignItems="center"
        gap="$1"
        flexDirection="row"
      >
        <Text fontSize="$1" color="$gray11">
          $
        </Text>
        <Text fontSize="$3" fontWeight="bold" color={color}>
          {formatCentsToDisplay(available)}
        </Text>
      </Stack>
    </Pressable>
  );
}

// Helper functions
function formatCentsToDisplay(cents: number): string {
  return (cents / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getBankrollColor(weeklyPL: number): string {
  if (weeklyPL > 0) return Colors.success;
  if (weeklyPL < 0) return Colors.error;
  return Colors.text.secondary;
}
