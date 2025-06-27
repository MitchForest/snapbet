import React, { useState, useMemo, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, OpacityColors } from '@/theme';
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
import ViewShot from 'react-native-view-shot';
import { EffectSelector } from '@/components/effects/EffectSelector';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

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
  suggestedCaption?: string;
}

export function MediaPreview({
  media,
  onBack,
  onNext,
  postType = PostType.CONTENT,
  headerTitle = 'Create Post',
  suggestedCaption = '',
}: MediaPreviewProps) {
  const insets = useSafeAreaInsets();
  const [shareToFeed, setShareToFeed] = useState(true);
  const [shareToStory, setShareToStory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [caption, setCaption] = useState(suggestedCaption);
  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(media.effectId || null);
  const [effectsPanelOpen, setEffectsPanelOpen] = useState(false);
  const effectsPanelAnimation = useRef(new Animated.Value(0)).current;
  const viewShotRef = useRef<ViewShot>(null);

  // Get the selected effect if any
  const selectedEffect = useMemo(() => {
    return selectedEffectId ? getEffectById(selectedEffectId) : null;
  }, [selectedEffectId]);

  // Initialize video player - always call the hook, conditionally pass the source
  const player = useVideoPlayer(media.type === 'video' ? media.uri : null, (player) => {
    if (player && media.type === 'video') {
      player.loop = true;
      player.play();
    }
  });

  // Animate effects panel
  React.useEffect(() => {
    Animated.timing(effectsPanelAnimation, {
      toValue: effectsPanelOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [effectsPanelOpen, effectsPanelAnimation]);

  const toggleEffectsPanel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEffectsPanelOpen(!effectsPanelOpen);
  };

  const handleNext = async () => {
    // Validate at least one share option is selected
    if (!shareToFeed && !shareToStory) {
      Alert.alert('Share Options', 'Please select at least one place to share your content.');
      return;
    }

    setIsProcessing(true);

    try {
      let finalUri = media.uri;

      // If effects are applied and it's a photo/gif, capture the ViewShot
      if (
        selectedEffectId &&
        (media.type === 'photo' || media.type === 'gif') &&
        viewShotRef.current?.capture
      ) {
        try {
          finalUri = await viewShotRef.current.capture();
        } catch (error) {
          console.error('Failed to capture with effects, using original:', error);
        }
      }

      // Process media based on type
      if (media.type === 'photo' || media.type === 'gif') {
        // Compress photo/gif
        finalUri = await compressPhoto(finalUri);
      } else if (media.type === 'video') {
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
        <ViewShot
          ref={viewShotRef}
          style={StyleSheet.absoluteFillObject}
          options={{ format: 'jpg', quality: 0.9 }}
        >
          <OverlayContainer postType={postType}>
            {media.type === 'photo' || media.type === 'gif' ? (
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
            {selectedEffect && (media.type === 'photo' || media.type === 'gif') && (
              <EmojiEffectsManager
                effect={selectedEffect}
                isActive={true}
                performanceTier="medium"
              />
            )}
          </OverlayContainer>
        </ViewShot>

        {/* Effects Button - only for photos and gifs */}
        {(media.type === 'photo' || media.type === 'gif') && (
          <Pressable
            onPress={toggleEffectsPanel}
            style={[styles.effectsButton, effectsPanelOpen && styles.effectsButtonActive]}
          >
            <MaterialIcons name="auto-awesome" size={24} color={Colors.white} />
          </Pressable>
        )}
      </View>

      {/* Effect Selector Panel */}
      {effectsPanelOpen && (
        <Pressable style={styles.effectsOverlay} onPress={() => setEffectsPanelOpen(false)} />
      )}

      <Animated.View
        style={[
          styles.effectSelectorContainer,
          {
            transform: [
              {
                translateY: effectsPanelAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [400, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.effectsHandle}>
          <View style={styles.effectsHandleBar} />
        </View>
        <EffectSelector onSelectEffect={setSelectedEffectId} currentEffectId={selectedEffectId} />
      </Animated.View>

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
  effectsButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.camera.controlsBackground,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  effectsButtonActive: {
    backgroundColor: Colors.primary,
  },
  effectsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: OpacityColors.overlay.light,
    zIndex: 3,
  },
  effectSelectorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 4,
  },
  effectsHandle: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OpacityColors.overlay.dark,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  effectsHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: OpacityColors.overlay.lighter,
    borderRadius: 2,
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
