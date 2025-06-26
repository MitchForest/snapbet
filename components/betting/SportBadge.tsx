import React from 'react';
import { View, Text } from '@tamagui/core';
import { Colors } from '@/theme';

interface SportBadgeProps {
  sport: 'NBA' | 'NFL';
}

export function SportBadge({ sport }: SportBadgeProps) {
  const backgroundColor = sport === 'NBA' ? '#FB923C' : '#3B82F6'; // Orange for NBA, Blue for NFL

  return (
    <View
      backgroundColor={backgroundColor}
      paddingHorizontal={12}
      paddingVertical={4}
      borderRadius={12}
    >
      <Text color={Colors.white} fontSize={12} fontWeight="600">
        {sport}
      </Text>
    </View>
  );
}
