import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/common/Avatar';

interface HeaderProps {
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onProfilePress,
  onNotificationPress,
  notificationCount = 0,
}) => {
  const insets = useSafeAreaInsets();

  return (
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
        {/* Profile Avatar */}
        <Pressable onPress={onProfilePress}>
          <Avatar size={32} />
        </Pressable>

        {/* SnapFade Logo */}
        <Text fontSize={24} fontWeight="600" color="$primary" fontFamily="$heading">
          SnapFade
        </Text>

        {/* Notification Bell */}
        <Pressable onPress={onNotificationPress}>
          <View position="relative">
            <Text fontSize={24}>🔔</Text>
            {notificationCount > 0 && (
              <View
                position="absolute"
                top={-4}
                right={-4}
                backgroundColor="$error"
                borderRadius="$round"
                width={16}
                height={16}
                justifyContent="center"
                alignItems="center"
              >
                <Text fontSize={10} color="$textInverse" fontWeight="600">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
};
