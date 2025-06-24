import React, { useEffect, useState } from 'react';
import { View, Text } from '@tamagui/core';
import { StyleSheet, Pressable } from 'react-native';
import { Camera, FlashMode } from 'expo-camera';
import { useMediaPermissions } from '@/hooks/useMediaPermissions';
import { useCamera, CapturedMedia } from '@/hooks/useCamera';
import { useEffects } from '@/hooks/useEffects';
import { CameraControls } from './CameraControls';
import { PermissionRequest } from './PermissionRequest';
import { EffectPicker } from '@/components/effects/EffectPicker';
import { EffectPreview } from '@/components/effects/EffectPreview';
import { Colors } from '@/theme';
import { useAuth } from '@/hooks/useAuth';

interface CameraViewProps {
  onCapture: (media: CapturedMedia) => void;
  onClose: () => void;
}

export function CameraView({ onCapture, onClose }: CameraViewProps) {
  const { user } = useAuth();
  const [showEffectPicker, setShowEffectPicker] = useState(false);
  const [userBadges] = useState<string[]>([]);

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

  const { selectedEffect, setSelectedEffectId } = useEffects(userBadges);

  // Request permissions on mount
  useEffect(() => {
    if (!hasAllPermissions && permissions.camera === null) {
      requestAllPermissions();
    }
  }, [hasAllPermissions, permissions.camera, requestAllPermissions]);

  // Handle capture based on mode
  const handleCapture = () => {
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
        {selectedEffect && <EffectPreview effect={selectedEffect} isActive={!isRecording} />}

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
            <Pressable onPress={() => setShowEffectPicker(true)} style={styles.topButton}>
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
      </Camera>

      {/* Bottom Controls */}
      <CameraControls
        mode={mode}
        isRecording={isRecording}
        onCapture={handleCapture}
        onGallery={pickFromGallery}
        onModeChange={setMode}
      />

      {/* Effect Picker Modal */}
      {user && (
        <EffectPicker
          isVisible={showEffectPicker}
          onClose={() => setShowEffectPicker(false)}
          onSelectEffect={setSelectedEffectId}
          currentEffectId={selectedEffect?.id}
          userId={user.id}
        />
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
