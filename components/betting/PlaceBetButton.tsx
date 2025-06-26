import React from 'react';
import { View, Text } from '@tamagui/core';
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/theme';

interface PlaceBetButtonProps {
  onPress: () => void;
  isLoading: boolean;
  isDisabled: boolean;
  errorMessage: string | null;
}

export function PlaceBetButton({
  onPress,
  isLoading,
  isDisabled,
  errorMessage,
}: PlaceBetButtonProps) {
  return (
    <View marginTop="auto">
      {errorMessage && (
        <Text fontSize={14} color={Colors.error} textAlign="center" marginBottom={8}>
          {errorMessage}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.button, (isDisabled || isLoading) && styles.disabledButton]}
        onPress={onPress}
        disabled={isDisabled || isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text fontSize={18} fontWeight="700" color={Colors.white}>
            Place Bet
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  disabledButton: {
    backgroundColor: Colors.gray[400],
    opacity: 0.6,
  },
});
