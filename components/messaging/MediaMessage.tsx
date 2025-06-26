import React, { useState } from 'react';
import { View, Text } from '@tamagui/core';
import { Image, Pressable, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { VideoView, useVideoPlayer, VideoPlayer } from 'expo-video';
import { Colors } from '@/theme';
import * as Haptics from 'expo-haptics';

interface MediaMessageProps {
  url: string;
  isOwn: boolean;
  onPress?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const MAX_WIDTH = screenWidth * 0.65; // 65% of screen width
const MAX_HEIGHT = 300;

export function MediaMessage({ url, isOwn, onPress }: MediaMessageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dimensions, setDimensions] = useState({ width: MAX_WIDTH, height: 200 });
  const isVideo = url.includes('.mp4') || url.includes('.mov') || url.includes('video');

  const player = useVideoPlayer(isVideo ? url : null, (videoPlayer: VideoPlayer | null) => {
    if (videoPlayer) {
      videoPlayer.loop = false;
      videoPlayer.volume = 1;
    }
  });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isVideo && player) {
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    }
    onPress?.();
  };

  const handleImageLoad = (event: {
    nativeEvent: { source: { width: number; height: number } };
  }) => {
    const { width, height } = event.nativeEvent.source;
    const aspectRatio = width / height;

    let finalWidth = MAX_WIDTH;
    let finalHeight = MAX_WIDTH / aspectRatio;

    if (finalHeight > MAX_HEIGHT) {
      finalHeight = MAX_HEIGHT;
      finalWidth = MAX_HEIGHT * aspectRatio;
    }

    setDimensions({ width: finalWidth, height: finalHeight });
    setLoading(false);
  };

  if (error) {
    return (
      <View style={[styles.errorContainer, dimensions]}>
        <Text fontSize="$3" color={Colors.text.tertiary}>
          Failed to load media
        </Text>
      </View>
    );
  }

  return (
    <Pressable onPress={handlePress} disabled={loading}>
      <View style={styles.container}>
        {isVideo ? (
          <>
            <VideoView
              player={player}
              style={[styles.media, dimensions]}
              contentFit="cover"
              nativeControls={false}
            />
            {loading && (
              <View style={[styles.loadingContainer, dimensions]}>
                <ActivityIndicator size="large" color={isOwn ? Colors.white : Colors.gray[400]} />
              </View>
            )}
          </>
        ) : (
          <Image
            source={{ uri: url }}
            style={[styles.media, dimensions, loading && styles.hidden]}
            resizeMode="cover"
            onLoad={handleImageLoad}
            onError={() => setError(true)}
          />
        )}

        {isVideo && !loading && (
          <View style={styles.playButton}>
            <Text fontSize={24}>▶️</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  media: {
    borderRadius: 12,
  },
  hidden: {
    opacity: 0,
  },
  loadingContainer: {
    position: 'absolute',
    backgroundColor: Colors.gray[200],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  errorContainer: {
    backgroundColor: Colors.gray[200],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.black + '99', // 60% opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
});
