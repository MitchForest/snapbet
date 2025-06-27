import React, { useEffect, useState } from 'react';
import { View, Text } from '@tamagui/core';
import { Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors } from '@/theme';

interface MediaDisplayProps {
  url: string;
  type: 'photo' | 'video' | 'gif';
  isVisible?: boolean;
  onPress?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const aspectRatio = 16 / 9;
const mediaHeight = screenWidth / aspectRatio;

export function MediaDisplay({ url, type, isVisible = true, onPress }: MediaDisplayProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Initialize video player - always call the hook
  const player = useVideoPlayer(type === 'video' ? url : null, (player) => {
    if (player && type === 'video') {
      player.loop = true;
      player.muted = true; // Muted for autoplay
      if (isVisible) {
        player.play();
      }
    }
  });

  // Control video playback based on visibility
  useEffect(() => {
    if (player && type === 'video') {
      if (isVisible) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [isVisible, player, type]);

  if (type === 'photo' || type === 'gif') {
    return (
      <View style={styles.container}>
        {imageLoading && !imageError && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}

        {imageError ? (
          <View style={styles.errorContainer}>
            <Text fontSize="$6">🖼️</Text>
            <Text color="$textSecondary" fontSize="$3" marginTop="$2">
              Failed to load {type === 'gif' ? 'GIF' : 'image'}
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: url }}
            style={styles.media}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        )}
      </View>
    );
  }

  if (type === 'video' && player) {
    return (
      <View style={styles.container}>
        <VideoView
          player={player}
          style={styles.media}
          nativeControls={false}
          contentFit="cover"
          onTouchEnd={onPress}
        />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: mediaHeight,
    backgroundColor: Colors.black,
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
});
