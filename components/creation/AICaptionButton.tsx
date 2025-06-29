import React from 'react';
import { Pressable, ActivityIndicator } from 'react-native';
import { View, Text } from 'tamagui';
import { AIBadge } from '@/components/common/AIBadge';
import { Colors } from '@/theme';

interface AICaptionButtonProps {
  onPress: () => void;
  isLoading: boolean;
  disabled?: boolean;
  remaining?: number | null;
}

export function AICaptionButton({ 
  onPress, 
  isLoading, 
  disabled = false,
  remaining 
}: AICaptionButtonProps) {
  return (
    <Pressable 
      onPress={onPress} 
      disabled={disabled || isLoading}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <View 
        backgroundColor={Colors.primary}
        paddingHorizontal="$3"
        paddingVertical="$2"
        borderRadius="$2"
        flexDirection="row"
        alignItems="center"
        gap="$2"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <AIBadge variant="small" text="Generate" />
        )}
        {remaining !== null && remaining < 5 && (
          <Text fontSize="$1" color={Colors.white} opacity={0.8}>
            {remaining} left
          </Text>
        )}
      </View>
    </Pressable>
  );
}