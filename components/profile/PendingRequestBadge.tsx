import React from 'react';
import { View, Text } from '@tamagui/core';
import { Colors } from '@/theme';

interface PendingRequestBadgeProps {
  count: number;
}

export const PendingRequestBadge: React.FC<PendingRequestBadgeProps> = ({ count }) => {
  if (count === 0) {
    return null;
  }

  return (
    <View
      backgroundColor={Colors.error}
      borderRadius="$round"
      paddingHorizontal="$2"
      paddingVertical="$0.5"
      minWidth={20}
      alignItems="center"
    >
      <Text fontSize={12} color={Colors.white} fontWeight="600">
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};
