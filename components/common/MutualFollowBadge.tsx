import React from 'react';
import { View, Text } from '@tamagui/core';
import { Colors } from '@/theme';

interface MutualFollowBadgeProps {
  size?: 'small' | 'medium';
}

export const MutualFollowBadge: React.FC<MutualFollowBadgeProps> = ({ size = 'small' }) => {
  const isSmall = size === 'small';

  return (
    <View
      flexDirection="row"
      backgroundColor={Colors.surface}
      paddingHorizontal={isSmall ? '$2' : '$2.5'}
      paddingVertical={isSmall ? '$1' : '$1.5'}
      borderRadius="$2"
      borderWidth={1}
      borderColor={Colors.border.light}
      gap={isSmall ? '$1' : '$1.5'}
      alignItems="center"
    >
      <Text fontSize={isSmall ? 11 : 12} color={Colors.gray[600]} fontWeight="500">
        ↔
      </Text>
      <Text fontSize={isSmall ? 11 : 12} color={Colors.gray[600]} fontWeight="500">
        Mutual
      </Text>
    </View>
  );
};
