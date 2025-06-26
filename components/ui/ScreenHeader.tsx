import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/theme';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, onBack, rightAction }) => {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      backgroundColor={Colors.surface}
      borderBottomWidth={1}
      borderBottomColor={Colors.border.light}
      paddingTop={insets.top}
    >
      <View flexDirection="row" height={56} alignItems="center" paddingHorizontal={16}>
        <Pressable
          onPress={handleBack}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            width: 44,
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: -8,
          }}
        >
          <Text fontSize={24} color={Colors.text.primary}>
            ←
          </Text>
        </Pressable>

        <View flex={1} alignItems="center">
          <Text fontSize={18} fontWeight="600" color={Colors.text.primary} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {rightAction ? (
          <View width={44} alignItems="center">
            {rightAction}
          </View>
        ) : (
          <View width={44} />
        )}
      </View>
    </View>
  );
};
