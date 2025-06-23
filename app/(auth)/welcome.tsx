import { View, Text } from '@tamagui/core';

export default function WelcomeScreen() {
  return (
    <View flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
      <Text fontSize={28} fontWeight="bold" color="$primary" marginBottom="$2">
        Welcome to SnapFade
      </Text>
      <Text fontSize={16} color="$textSecondary">
        Auth flow coming soon
      </Text>
    </View>
  );
}
