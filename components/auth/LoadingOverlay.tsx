import React from 'react';
import { View, Text } from '@tamagui/core';
import { ActivityIndicator, Modal } from 'react-native';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message = 'Signing in...' }: LoadingOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View
        flex={1}
        backgroundColor="rgba(0, 0, 0, 0.5)"
        justifyContent="center"
        alignItems="center"
      >
        <View
          backgroundColor="$surface"
          borderRadius="$4"
          padding="$6"
          alignItems="center"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.25}
          shadowRadius={8}
        >
          <ActivityIndicator size="large" color="#059669" />
          <Text marginTop="$4" fontSize={16} color="$textPrimary" fontWeight="500">
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
}
