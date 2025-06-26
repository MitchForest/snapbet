import React, { useState } from 'react';
import { View, Text } from '@tamagui/core';
import { Image, Pressable, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors } from '@/theme';
import { MediaUploadProgress } from './MediaUploadProgress';

interface MediaMessageDisplayProps {
  url: string;
  type: 'photo' | 'video';
  isOwn: boolean;
  uploadProgress?: number;
  isUploading?: boolean;
  onPress?: () => void;
  isExpired?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const maxMediaWidth = screenWidth * 0.65; // 65% of screen width
const maxMediaHeight = 300;

export function MediaMessageDisplay({
  url,
  type,
  isOwn,
  uploadProgress = 0,
  isUploading = false,
  onPress,
  isExpired = false,
}: MediaMessageDisplayProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Initialize video player
  const player = useVideoPlayer(type === 'video' && !isExpired ? url : null, (player) => {
    if (player && type === 'video') {
      player.loop = false;
      player.muted = false;
    }
  });

  // Handle expired media
  if (isExpired) {
    return (
      <View style={[styles.container, styles.expiredContainer]}>
        <Text fontSize="$6">🚫</Text>
        <Text color="$gray11" fontSize="$3" marginTop="$2">
          Media expired
        </Text>
      </View>
    );
  }

  if (type === 'photo') {
    return (
      <Pressable onPress={onPress} disabled={isUploading}>
        <View style={styles.container}>
          {imageLoading && !imageError && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={isOwn ? Colors.white : Colors.primary} />
            </View>
          )}

          {imageError ? (
            <View style={styles.errorContainer}>
              <Text fontSize="$6">🖼️</Text>
              <Text color="$gray11" fontSize="$3" marginTop="$2">
                Failed to load image
              </Text>
            </View>
          ) : (
            <Image
              source={{ uri: url }}
              style={[styles.media, { maxWidth: maxMediaWidth, maxHeight: maxMediaHeight }]}
              resizeMode="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          )}

          {/* Upload Progress Overlay */}
          {isUploading && <MediaUploadProgress progress={uploadProgress} />}
        </View>
      </Pressable>
    );
  }

  // Video display
  const videoContainerStyle = [styles.container, styles.videoContainer];

  return (
    <Pressable onPress={onPress} disabled={isUploading}>
      <View style={videoContainerStyle}>
        <VideoView style={styles.video} player={player} allowsFullscreen allowsPictureInPicture />

        {/* Play button overlay */}
        {!isUploading && (
          <View style={styles.playButtonOverlay} pointerEvents="none">
            <View style={styles.playButton}>
              <Text fontSize="$6" color="white">
                ▶️
              </Text>
            </View>
          </View>
        )}

        {/* Upload Progress Overlay */}
        {isUploading && <MediaUploadProgress progress={uploadProgress} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.gray[100],
    minWidth: 150,
    minHeight: 100,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
  },
  errorContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
  },
  expiredContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray[200],
  },
  media: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.black + '70', // Use Colors constant
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: maxMediaWidth,
    height: 200,
  },
});
