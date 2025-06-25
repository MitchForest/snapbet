import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Alert, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { useCamera, CapturedMedia } from '@/hooks/useCamera';
import { CameraControls } from './CameraControls';
import { PermissionRequest } from './PermissionRequest';
import { Stack } from '@tamagui/core';
import ViewShot from 'react-native-view-shot';
import { EmojiEffectsManager } from '../effects/EmojiEffectsManager';
import { EffectSelector } from '../effects/EffectSelector';
import { EffectPreviewManager } from '../effects/utils/effectPreview';
import { useAuth } from '@/hooks/useAuth';
import { getEffectById } from '../effects/constants/allEffects';
import { useMediaPermissions } from '@/hooks/useMediaPermissions';

interface CameraViewProps {
  onCapture: (media: CapturedMedia) => void;
  onClose: () => void;
}

export function CameraView({ onCapture, onClose }: CameraViewProps) {
  const {
    cameraRef,
    facing,
    flash,
    mode,
    isRecording,
    capturePhoto,
    startRecording,
    stopRecording,
    toggleFlash,
    capturedMedia,
    setMode,
    pickFromGallery,
  } = useCamera();

  const { permissions, hasAllPermissions, requestAllPermissions, openSettings } =
    useMediaPermissions();
  const viewShotRef = useRef<ViewShot>(null);
  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const { user } = useAuth();
  const userBadges = user?.user_metadata?.badges || [];

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

  const handleRequestPermissions = async () => {
    await requestAllPermissions();
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
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          type={facing}
          flashMode={flash}
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
          <MaterialIcons name="close" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFlash} style={styles.headerButton}>
          <MaterialIcons
            name={flash === 'off' ? 'flash-off' : flash === 'on' ? 'flash-on' : 'flash-auto'}
            size={28}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* Camera Controls */}
      <CameraControls
        mode={mode}
        isRecording={isRecording}
        onCapture={handleCapture}
        onGallery={pickFromGallery}
        onModeChange={setMode}
      />

      {/* Effect Selector */}
      <EffectSelector
        onSelectEffect={setSelectedEffectId}
        currentEffectId={selectedEffectId}
        userBadges={userBadges}
      />

      {/* Capturing Indicator */}
      {isCapturing && (
        <View style={styles.capturingOverlay}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '600',
  },
  capturingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
});
