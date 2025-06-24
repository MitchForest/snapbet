import React from 'react';
import { View, Text } from '@tamagui/core';

interface BetsListProps {
  userId: string;
}

export const BetsList: React.FC<BetsListProps> = () => {
  // TODO: In a future sprint, this will fetch and display posts with bets
  // For now, just show a placeholder

  return (
    <View flex={1} padding="$4" alignItems="center" justifyContent="center" minHeight={200}>
      <Text fontSize={18} color="$textSecondary" textAlign="center">
        No bets yet
      </Text>
      <Text fontSize={14} color="$textSecondary" textAlign="center" marginTop="$2">
        Betting picks will appear here once placed
      </Text>
    </View>
  );
};
