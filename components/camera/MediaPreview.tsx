import React, { useState, useMemo } from 'react';
import { View, Text } from '@tamagui/core';
import {
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { CapturedMedia } from '@/hooks/useCamera';
import { compressPhoto, validateVideoSize } from '@/services/media/compression';
import { formatFileSize } from '@/utils/media/helpers';
import { getEffectById } from '@/components/effects/constants/allEffects';
import { EmojiEffectsManager } from '@/components/effects/EmojiEffectsManager';
import { PostType } from '@/types/content';
import { OverlayContainer } from '@/components/overlays/OverlayContainer';
import { CaptionInput } from '@/components/creation/CaptionInput';
import { ShareDestination } from '@/components/creation/ShareDestination';
import { ExpirationInfo } from '@/components/creation/ExpirationInfo';

export interface ShareOptions {
  shareToFeed: boolean;
  shareToStory: boolean;
  mediaUri: string;
  caption?: string;
}

interface MediaPreviewProps {
  media: CapturedMedia;
  onBack: () => void;
  onNext: (options: ShareOptions) => void;
  postType?: PostType;
  headerTitle?: string;
}

export function MediaPreview({
  media,
  onBack,
  onNext,
  postType = PostType.CONTENT,
  headerTitle = 'Create Post',
}: MediaPreviewProps) {
  const insets = useSafeAreaInsets();
  const [shareToFeed, setShareToFeed] = useState(true);
  const [shareToStory, setShareToStory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [caption, setCaption] = useState('');

  // Get the selected effect if any
  const selectedEffect = useMemo(() => {
    return media.effectId ? getEffectById(media.effectId) : null;
  }, [media.effectId]);

  // Initialize video player - always call the hook, conditionally pass the source
  const player = useVideoPlayer(media.type === 'video' ? media.uri : null, (player) => {
    if (player && media.type === 'video') {
      player.loop = true;
      player.play();
    }
  });

  const handleNext = async () => {
    // Validate at least one share option is selected
    if (!shareToFeed && !shareToStory) {
      Alert.alert('Share Options', 'Please select at least one place to share your content.');
      return;
    }

    setIsProcessing(true);

    try {
      let finalUri = media.uri;

      // Process media based on type
      if (media.type === 'photo') {
        // Compress photo
        finalUri = await compressPhoto(media.uri);
      } else {
        // Validate video size
        const { valid, size } = await validateVideoSize(media.uri);
        if (!valid) {
          Alert.alert(
            'Video Too Large',
            `Your video is ${formatFileSize(size || 0)}. Maximum size is 50MB.`,
            [{ text: 'OK' }]
          );
          setIsProcessing(false);
          return;
        }
      }

      // Call onNext with share options
      onNext({
        shareToFeed,
        shareToStory,
        mediaUri: finalUri,
        caption: caption.trim(),
      });
    } catch (error) {
      console.error('Error processing media:', error);
      Alert.alert('Error', 'Failed to process media. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={onBack} style={styles.headerButton}>
          <Text color="white" fontSize="$4" fontWeight="600">
            ← Back
          </Text>
        </Pressable>

        <Text color="white" fontSize="$5" fontWeight="600">
          {headerTitle}
        </Text>

        <Pressable
          onPress={handleNext}
          disabled={isProcessing}
          style={[styles.headerButton, isProcessing && styles.headerButtonDisabled]}
        >
          <Text
            color={isProcessing ? Colors.gray[400] : Colors.primary}
            fontSize="$4"
            fontWeight="600"
          >
            Next →
          </Text>
        </Pressable>
      </View>

      {/* Media Display */}
      <View flex={1} backgroundColor="black" position="relative">
        <OverlayContainer postType={postType}>
          {media.type === 'photo' ? (
            <Image source={{ uri: media.uri }} style={styles.media} resizeMode="contain" />
          ) : media.type === 'video' && player ? (
            <VideoView
              player={player}
              style={styles.media}
              nativeControls={true}
              contentFit="contain"
            />
          ) : null}

          {/* Effect Overlay */}
          {selectedEffect && (
            <EmojiEffectsManager effect={selectedEffect} isActive={true} performanceTier="medium" />
          )}
        </OverlayContainer>
      </View>

      {/* Bottom Options */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Effect Info */}
          {selectedEffect && (
            <View style={styles.effectInfoContainer}>
              <Text color={Colors.text.primary} fontSize="$3">
                {selectedEffect.preview} {selectedEffect.name} effect applied
              </Text>
            </View>
          )}

          {/* Caption Input */}
          <View style={styles.captionContainer}>
            <CaptionInput value={caption} onChange={setCaption} maxLength={280} />
          </View>

          {/* Post Type Info for Pick/Outcome */}
          {postType !== PostType.CONTENT && (
            <View style={styles.postTypeInfo}>
              <Text color={Colors.text.secondary} fontSize="$2">
                This {postType} post will include bet details
              </Text>
            </View>
          )}

          {/* Share Options */}
          <ShareDestination
            toFeed={shareToFeed}
            toStory={shareToStory}
            onFeedChange={setShareToFeed}
            onStoryChange={setShareToStory}
          />

          {/* Expiration Info */}
          <ExpirationInfo postType={postType} />
        </ScrollView>
      </View>

      {/* Processing Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={Colors.white} />
          <Text color="white" fontSize="$3" marginTop="$3">
            Processing...
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.camera.controlsBackground,
    zIndex: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  media: {
    flex: 1,
  },
  bottomContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '40%',
  },
  effectInfoContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    marginBottom: 12,
  },
  captionContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    marginBottom: 20,
  },
  postTypeInfo: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.camera.controlsBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
