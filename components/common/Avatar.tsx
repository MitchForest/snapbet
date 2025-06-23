import React from 'react';
import { View, Text, ViewProps } from '@tamagui/core';
import { Image } from 'react-native';

interface AvatarProps extends ViewProps {
  src?: string;
  fallback?: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ src, fallback = '👤', size = 32, ...props }) => {
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
    </View>
  );
};
