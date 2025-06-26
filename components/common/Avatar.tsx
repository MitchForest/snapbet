import React from 'react';
import { View, Text, ViewProps } from '@tamagui/core';
import { Image } from 'react-native';
import { Colors } from '@/theme';

interface AvatarProps extends ViewProps {
  src?: string;
  fallback?: string;
  size?: number;
  showPresence?: boolean;
  isOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  fallback = '👤',
  size = 32,
  showPresence = false,
  isOnline = false,
  ...props
}) => {
  return (
    <View
      width={size}
      height={size}
      borderRadius="$round"
      backgroundColor="$surfaceAlt"
      justifyContent="center"
      alignItems="center"
      overflow="hidden"
      {...props}
    >
      {src ? (
        <Image source={{ uri: src }} style={{ width: size, height: size }} resizeMode="cover" />
      ) : (
        <Text fontSize={size * 0.5}>{fallback}</Text>
      )}

      {showPresence && isOnline && (
        <View
          position="absolute"
          bottom={0}
          right={0}
          width={size * 0.25}
          height={size * 0.25}
          backgroundColor={Colors.success}
          borderRadius="$round"
          borderWidth={2}
          borderColor={Colors.background}
        />
      )}
    </View>
  );
};
