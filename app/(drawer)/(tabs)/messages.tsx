import React from 'react';
import { View, Text } from '@tamagui/core';

export default function MessagesScreen() {
  return (
    <View flex={1} backgroundColor="$background" justifyContent="center" alignItems="center">
      <Text fontSize={24} color="$textPrimary" fontWeight="600">
        Messages coming soon
      </Text>
    </View>
  );
}
