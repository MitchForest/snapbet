import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View flex={1} backgroundColor="$background">
      <View
        paddingTop={insets.top}
        paddingHorizontal="$4"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        height={56 + insets.top}
      >
        <Pressable onPress={() => router.back()}>
          <Text fontSize={24}>✕</Text>
        </Pressable>
        <Text fontSize={16} color="$textPrimary">
          Effects
        </Text>
      </View>

      <View flex={1} justifyContent="center" alignItems="center">
        <Text fontSize={24} color="$textPrimary" fontWeight="600">
          Camera coming soon
        </Text>
        <Text fontSize={16} color="$textSecondary" marginTop="$2">
          Take photos and videos here
        </Text>
      </View>
    </View>
  );
}
