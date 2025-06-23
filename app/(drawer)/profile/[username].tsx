import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  return (
    <View flex={1} backgroundColor="$background">
      <View
        backgroundColor="$surface"
        borderBottomWidth={1}
        borderBottomColor="$divider"
        paddingTop={insets.top}
        height={56 + insets.top}
      >
        <View
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$4"
          height={56}
        >
          <Pressable onPress={() => router.back()}>
            <Text fontSize={20}>←</Text>
          </Pressable>
          <Text fontSize={16} color="$textPrimary">
            @{username}
          </Text>
          <View width={20} />
        </View>
      </View>

      <View flex={1} justifyContent="center" alignItems="center">
        <Text fontSize={24} color="$textPrimary" fontWeight="600">
          Profile: @{username}
        </Text>
        <Text fontSize={16} color="$textSecondary" marginTop="$2">
          Profile details coming soon
        </Text>
      </View>
    </View>
  );
}
