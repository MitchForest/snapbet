import React from 'react';
import { View, Text } from '@tamagui/core';

interface BetsListProps {
  userId: string;
  canView?: boolean;
}

export const BetsList: React.FC<BetsListProps> = ({ userId: _userId, canView = true }) => {
  if (!canView) {
    return (
      <View flex={1} padding="$4" alignItems="center" justifyContent="center" minHeight={200}>
        <Text fontSize={16} color="$textSecondary" textAlign="center">
          This account&apos;s bets are private
        </Text>
      </View>
    );
  }

  return (
    <View flex={1} padding="$4" alignItems="center" justifyContent="center" minHeight={200}>
      <Text fontSize={18} color="$textSecondary" textAlign="center">
        No bets yet
      </Text>
      <Text fontSize={14} color="$textSecondary" textAlign="center" marginTop="$2">
        Betting history will appear here
      </Text>
    </View>
  );
};
