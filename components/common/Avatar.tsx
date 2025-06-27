import React from 'react';
import { View, Text, ViewProps } from '@tamagui/core';
import { Image } from 'react-native';
import { Colors } from '@/theme';
import { storageService } from '@/services/storage/storageService';

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
  let imageUrl: string | null = null;
  const isUrl = src && (src.startsWith('http://') || src.startsWith('https://'));

  if (isUrl) {
    imageUrl = src;
  } else if (src) {
    imageUrl = storageService.getPublicUrl(src);
  }

  // Basic check to see if the fallback is an emoji
  const isEmoji = fallback && fallback.length <= 2 && /\p{Emoji}/u.test(fallback);

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
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      ) : isEmoji ? (
        <Text style={{ fontSize: size * 0.5 }}>{fallback}</Text>
      ) : (
        <Text style={{ fontSize: size * 0.5, color: Colors.text.secondary }}>
          {fallback?.[0]?.toUpperCase() || '👤'}
        </Text>
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
