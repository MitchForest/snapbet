import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
  Animated,
  Pressable,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCamera, CapturedMedia } from '@/hooks/useCamera';
import { CameraControls } from './CameraControls';
import { PermissionRequest } from './PermissionRequest';
import { Stack } from '@tamagui/core';
import ViewShot from 'react-native-view-shot';
import { EmojiEffectsManager } from '../effects/EmojiEffectsManager';
import { EffectSelector } from '../effects/EffectSelector';
import { EffectPreviewManager } from '../effects/utils/effectPreview';
import { getEffectById } from '../effects/constants/allEffects';
import { useMediaPermissions } from '@/hooks/useMediaPermissions';
import { OpacityColors } from '@/theme';
import { EmojiEffect } from '@/types/effects';
import { PendingShareBet } from '@/types/content';

interface CameraScreenProps {
  onCapture: (media: CapturedMedia) => void;
  onClose: () => void;
  pendingBet?: PendingShareBet | null;
  suggestedEffects?: string[];
}

export function CameraScreen({ onCapture, onClose }: CameraScreenProps) {
  const {
    cameraRef,
    facing,
    enableTorch,
    mode,
    isRecording,
    capturePhoto,
    startRecording,
    stopRecording,
    toggleTorch,
    capturedMedia,
    setMode,
    pickFromGallery,
  } = useCamera();

  const { permissions, hasAllPermissions, requestAllPermissions, openSettings } =
    useMediaPermissions();
  const viewShotRef = useRef<ViewShot>(null);
  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [effectsPanelOpen, setEffectsPanelOpen] = useState(false);
  const effectsPanelAnimation = useRef(new Animated.Value(0)).current;

  // Get the selected effect
  const selectedEffect = selectedEffectId ? getEffectById(selectedEffectId) : null;

  // Check if in preview mode
  const isPreviewMode = selectedEffectId
    ? EffectPreviewManager.getInstance().isPreviewActive(selectedEffectId)
    : false;

  // Handle captured media
  React.useEffect(() => {
    if (capturedMedia) {
      onCapture({ ...capturedMedia, effectId: selectedEffectId });
    }
  }, [capturedMedia, selectedEffectId, onCapture]);

  // Animate effects panel
  React.useEffect(() => {
    Animated.timing(effectsPanelAnimation, {
      toValue: effectsPanelOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [effectsPanelOpen, effectsPanelAnimation]);

  const handleCapture = async () => {
    if (isCapturing || isPreviewMode) return;

    setIsCapturing(true);
    try {
      if (mode === 'video') {
        if (isRecording) {
          stopRecording();
        } else {
          await startRecording();
        }
      } else {
        // For photos with effects, capture the ViewShot
        if (selectedEffectId && viewShotRef.current?.capture) {
          try {
            const uri = await viewShotRef.current.capture();
            onCapture({ uri, type: 'photo', effectId: selectedEffectId });
          } catch {
            // Fallback to regular capture if ViewShot fails
            await capturePhoto();
          }
        } else {
          // No effect, use regular camera capture
          await capturePhoto();
        }
      }
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Error', 'Failed to capture media');
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePreviewLocked = useCallback(async (effect: EmojiEffect) => {
    const previewManager = EffectPreviewManager.getInstance();
    const canPreview = await previewManager.canPreview(effect.id);

    if (!canPreview) {
      Alert.alert('Preview Limit', 'You can preview this effect once every 24 hours');
      return;
    }

    const started = await previewManager.startPreview(effect, () => {
      // Reset selection when preview ends
      setSelectedEffectId(null);
    });

    if (started) {
      setSelectedEffectId(effect.id);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const handleRequestPermissions = async () => {
    await requestAllPermissions();
  };

  const toggleEffectsPanel = () => {
    setEffectsPanelOpen(!effectsPanelOpen);
  };

  if (permissions.camera === null) {
    return (
      <PermissionRequest
        type="both"
        onRequestPermission={handleRequestPermissions}
        onOpenSettings={openSettings}
      />
    );
  }

  if (!hasAllPermissions) {
    return (
      <Stack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Text style={styles.permissionText}>
          Camera permission is required to use this feature.
        </Text>
        <TouchableOpacity onPress={handleRequestPermissions} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </Stack>
    );
  }

  return (
    <View style={styles.container}>
      <ViewShot
        ref={viewShotRef}
        style={StyleSheet.absoluteFillObject}
        options={{ format: 'jpg', quality: 0.9 }}
      >
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing={facing}
          enableTorch={enableTorch}
        />

        {/* Effect Overlay */}
        {selectedEffect && (
          <EmojiEffectsManager effect={selectedEffect} isActive={true} performanceTier="medium" />
        )}

        {/* Preview Mode Indicator */}
        {isPreviewMode && (
          <View style={styles.previewIndicator}>
            <Text style={styles.previewText}>Preview Mode - Unlock to use</Text>
          </View>
        )}
      </ViewShot>

      {/* Header Controls */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
          <MaterialIcons name="close" size={28} color={OpacityColors.white.full} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Camera</Text>
        </View>
        <TouchableOpacity onPress={toggleTorch} style={styles.headerButton}>
          <MaterialIcons
            name={enableTorch ? 'flash-on' : 'flash-off'}
            size={28}
            color={OpacityColors.white.full}
          />
        </TouchableOpacity>
      </View>

      {/* Effect Selector - bottom sheet */}
      {effectsPanelOpen && (
        <>
          <Pressable style={styles.effectsOverlay} onPress={() => setEffectsPanelOpen(false)} />

          <Animated.View
            style={[
              styles.effectSelectorContainer,
              {
                transform: [
                  {
                    translateY: effectsPanelAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [350, 0], // Slide up from bottom
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.effectsHandle}>
              <View style={styles.effectsHandleBar} />
            </View>
            <EffectSelector
              onSelectEffect={setSelectedEffectId}
              currentEffectId={selectedEffectId}
              onPreviewLocked={handlePreviewLocked}
            />
          </Animated.View>
        </>
      )}

      {/* Camera Controls */}
      <CameraControls
        mode={mode}
        isRecording={isRecording}
        onCapture={handleCapture}
        onGallery={pickFromGallery}
        onModeChange={setMode}
        onEffectsToggle={toggleEffectsPanel}
        effectsOpen={effectsPanelOpen}
      />

      {/* Capturing Indicator */}
      {isCapturing && (
        <View style={styles.capturingOverlay}>
          <ActivityIndicator size="large" color={OpacityColors.white.full} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OpacityColors.black,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: OpacityColors.overlay.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: OpacityColors.white.full,
    fontSize: 18,
    fontWeight: '600',
  },
  effectsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: OpacityColors.overlay.light,
    zIndex: 4,
  },
  effectSelectorContainer: {
    position: 'absolute',
    bottom: 0, // Start from bottom
    left: 0,
    right: 0,
    zIndex: 5,
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
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: OpacityColors.primary.default,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: OpacityColors.white.full,
    fontSize: 16,
    fontWeight: '600',
  },
  previewIndicator: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  previewText: {
    backgroundColor: OpacityColors.overlay.medium,
    color: OpacityColors.white.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '600',
  },
  capturingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: OpacityColors.overlay.lighter,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
});
