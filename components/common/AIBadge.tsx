import React from 'react';
import { View, Text } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme';

interface AIBadgeProps {
  variant?: 'small' | 'medium' | 'large';
  text?: string;
  opacity?: number;
}

export function AIBadge({ variant = 'small', text = 'AI', opacity = 1 }: AIBadgeProps) {
  const sizes = {
    small: { icon: 12, text: 10, padding: 4 },
    medium: { icon: 16, text: 12, padding: 8 },
    large: { icon: 20, text: 14, padding: 12 },
  };

  const size = sizes[variant];

  return (
    <View
      backgroundColor={Colors.info}
      borderRadius={8}
      paddingHorizontal={size.padding}
      paddingVertical={size.padding}
      alignItems="center"
      flexDirection="row"
      gap={4}
      opacity={opacity}
    >
      <Ionicons name="sparkles" size={size.icon} color={Colors.white} />
      {text && (
        <Text fontSize={size.text} color={Colors.white} fontWeight="600">
          {text}
        </Text>
      )}
    </View>
  );
}
