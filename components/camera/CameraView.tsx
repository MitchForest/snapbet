import React, { useEffect, useState } from 'react';
import { View, Text } from '@tamagui/core';
import { StyleSheet, Pressable, Alert } from 'react-native';
import { Camera, FlashMode } from 'expo-camera';
import { useMediaPermissions } from '@/hooks/useMediaPermissions';
import { useCamera, CapturedMedia } from '@/hooks/useCamera';
import { useEffects } from '@/hooks/useEffects';
import { CameraControls } from './CameraControls';
import { PermissionRequest } from './PermissionRequest';
import { EffectSelector } from '@/components/effects/EffectSelector';
import { EmojiEffectsManager } from '@/components/effects/EmojiEffectsManager';
import { EffectPreviewManager } from '@/components/effects/utils/effectPreview';
import { Colors } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { EmojiEffect } from '@/types/effects';

interface CameraViewProps {
  onCapture: (media: CapturedMedia) => void;
  onClose: () => void;
}

export function CameraView({ onCapture, onClose }: CameraViewProps) {
  const { user } = useAuth();
  const [showEffectSelector, setShowEffectSelector] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const userBadges = user?.user_metadata?.badges || [];

  const { permissions, hasAllPermissions, requestAllPermissions, openSettings } =
    useMediaPermissions();
  const {
    facing,
    flash,
    mode,
    isRecording,
    capturedMedia,
    cameraRef,
    toggleFacing,
    toggleFlash,
    setMode,
    capturePhoto,
    startRecording,
    stopRecording,
    pickFromGallery,
  } = useCamera();

  const { selectedEffect, setSelectedEffectId, isEffectUnlocked } = useEffects(userBadges);

  // Request permissions on mount
  useEffect(() => {
    if (!hasAllPermissions && permissions.camera === null) {
      requestAllPermissions();
    }
  }, [hasAllPermissions, permissions.camera, requestAllPermissions]);

  // Handle capture based on mode
  const handleCapture = () => {
    // Don't allow capture if effect is in preview mode
    if (isPreviewMode) {
      Alert.alert('Effect Preview', 'Unlock this effect to capture with it');
      return;
    }

    if (mode === 'photo') {
      capturePhoto();
    } else {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  // Handle preview for locked effects
  const handlePreviewLocked = async (effect: EmojiEffect) => {
    const previewManager = EffectPreviewManager.getInstance();
    const canPreview = await previewManager.canPreview(effect.id);

    if (!canPreview) {
      Alert.alert(
        'Preview Unavailable',
        'You can preview this effect once per day. Try again tomorrow!'
      );
      return;
    }

    // Start preview
    const started = await previewManager.startPreview(effect, () => {
      // Preview ended callback
      setSelectedEffectId(null);
      setIsPreviewMode(false);
    });

    if (started) {
      setSelectedEffectId(effect.id);
      setIsPreviewMode(true);
    }
  };

  // Listen for captured media and pass along with effect
  useEffect(() => {
    if (capturedMedia) {
      // Pass the captured media with the selected effect ID
      const mediaWithEffect = {
        ...capturedMedia,
        effectId: selectedEffect?.id || null,
      };
      onCapture(mediaWithEffect as CapturedMedia);
    }
  }, [capturedMedia, onCapture, selectedEffect]);

  // Check if current effect is unlocked
  useEffect(() => {
    if (selectedEffect && !isEffectUnlocked(selectedEffect)) {
      setIsPreviewMode(true);
    } else {
      setIsPreviewMode(false);
    }
  }, [selectedEffect, isEffectUnlocked]);

  // Show permission request if needed
  if (!hasAllPermissions) {
    return (
      <PermissionRequest
        type="both"
        onRequestPermission={async () => {
          await requestAllPermissions();
        }}
        onOpenSettings={openSettings}
      />
    );
  }

  // Get flash icon
  const getFlashIcon = () => {
    switch (flash) {
      case FlashMode.on:
        return '⚡';
      case FlashMode.off:
        return '⚡';
      case FlashMode.auto:
        return 'A⚡';
      default:
        return '⚡';
    }
  };

  return (
    <View flex={1} backgroundColor="black">
      <Camera ref={cameraRef} style={StyleSheet.absoluteFillObject} type={facing} flashMode={flash}>
        {/* Effect Overlay */}
        {selectedEffect && (
          <EmojiEffectsManager
            effect={selectedEffect}
            isActive={!isRecording}
            performanceTier="medium"
          />
        )}

        {/* Top Controls */}
        <View
          position="absolute"
          top={0}
          left={0}
          right={0}
          paddingTop="$12"
          paddingHorizontal="$4"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          backgroundColor="rgba(0,0,0,0.3)"
          paddingBottom="$3"
        >
          {/* Close Button */}
          <Pressable onPress={onClose} style={styles.topButton}>
            <Text color="white" fontSize={24}>
              ✕
            </Text>
          </Pressable>

          {/* Right Controls */}
          <View flexDirection="row" gap="$3">
            {/* Effect Button */}
            <Pressable
              onPress={() => setShowEffectSelector(!showEffectSelector)}
              style={styles.topButton}
            >
              <Text color="white" fontSize={20}>
                {selectedEffect ? selectedEffect.preview : '✨'}
              </Text>
            </Pressable>

            {/* Flash Button */}
            <Pressable onPress={toggleFlash} style={styles.topButton}>
              <Text
                color={flash === FlashMode.off ? Colors.gray[400] : Colors.camera.flashActive}
                fontSize={20}
              >
                {getFlashIcon()}
              </Text>
            </Pressable>

            {/* Flip Camera Button */}
            <Pressable onPress={toggleFacing} style={styles.topButton}>
              <Text color="white" fontSize={20}>
                🔄
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Recording Indicator */}
        {isRecording && (
          <View
            position="absolute"
            top="$20"
            alignSelf="center"
            backgroundColor={Colors.camera.recordingRed}
            paddingHorizontal="$3"
            paddingVertical="$1"
            borderRadius="$2"
          >
            <Text color="white" fontSize="$2" fontWeight="600">
              ● REC
            </Text>
          </View>
        )}

        {/* Preview Mode Indicator */}
        {isPreviewMode && (
          <View
            position="absolute"
            bottom={180}
            alignSelf="center"
            backgroundColor="rgba(0,0,0,0.8)"
            paddingHorizontal="$4"
            paddingVertical="$2"
            borderRadius="$3"
          >
            <Text color="white" fontSize="$3" fontWeight="500">
              Preview Mode - Unlock to use
            </Text>
          </View>
        )}
      </Camera>

      {/* Bottom Controls */}
      <CameraControls
        mode={mode}
        isRecording={isRecording}
        onCapture={handleCapture}
        onGallery={pickFromGallery}
        onModeChange={setMode}
      />

      {/* Effect Selector - Inline at bottom */}
      {showEffectSelector && (
        <View position="absolute" bottom={100} left={0} right={0}>
          <EffectSelector
            onSelectEffect={setSelectedEffectId}
            currentEffectId={selectedEffect?.id || null}
            userBadges={userBadges}
            onPreviewLocked={handlePreviewLocked}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
