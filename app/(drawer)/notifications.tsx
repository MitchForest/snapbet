import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  const router = useRouter();
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
        <View flexDirection="row" alignItems="center" paddingHorizontal="$4" height={56}>
          <Pressable onPress={() => router.back()}>
            <Text fontSize={20}>←</Text>
          </Pressable>
          <Text fontSize={18} fontWeight="600" color="$textPrimary" marginLeft="$4">
            Notifications
          </Text>
        </View>
      </View>

      <View flex={1} justifyContent="center" alignItems="center">
        <Text fontSize={24} color="$textPrimary" fontWeight="600">
          No notifications yet
        </Text>
        <Text fontSize={16} color="$textSecondary" marginTop="$2">
          Your notifications will appear here
        </Text>
      </View>
    </View>
  );
}
