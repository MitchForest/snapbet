import React from 'react';
import { View, Text } from '@tamagui/core';

export default function GamesScreen() {
  return (
    <View flex={1} backgroundColor="$background" justifyContent="center" alignItems="center">
      <Text fontSize={24} color="$textPrimary" fontWeight="600">
        Games coming soon
      </Text>
    </View>
  );
}
