import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/theme';
import * as Haptics from 'expo-haptics';

interface CameraControlsProps {
  mode: 'photo' | 'video';
  isRecording: boolean;
  onCapture: () => void;
  onGallery: () => void;
  onModeChange: (mode: 'photo' | 'video') => void;
}

export function CameraControls({
  mode,
  isRecording,
  onCapture,
  onGallery,
  onModeChange,
}: CameraControlsProps) {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handleCapturePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate button press
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onCapture();
  };

  return (
    <View
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      backgroundColor={Colors.camera.controlsBackground}
      paddingBottom="$8"
      paddingTop="$4"
    >
      {/* Mode Toggle */}
      <View flexDirection="row" justifyContent="center" marginBottom="$4">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onModeChange('photo');
          }}
          style={[styles.modeButton, mode === 'photo' && styles.modeButtonActive]}
        >
          <Text
            color={mode === 'photo' ? Colors.white : Colors.gray[400]}
            fontSize="$3"
            fontWeight={mode === 'photo' ? '600' : '400'}
          >
            PHOTO
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onModeChange('video');
          }}
          style={[styles.modeButton, mode === 'video' && styles.modeButtonActive]}
        >
          <Text
            color={mode === 'video' ? Colors.white : Colors.gray[400]}
            fontSize="$3"
            fontWeight={mode === 'video' ? '600' : '400'}
          >
            VIDEO
          </Text>
        </Pressable>
      </View>

      {/* Controls Row */}
      <View
        flexDirection="row"
        alignItems="center"
        justifyContent="space-around"
        paddingHorizontal="$6"
      >
        {/* Gallery Button */}
        <Pressable onPress={onGallery} style={styles.sideButton}>
          <Text fontSize={28}>🖼️</Text>
        </Pressable>

        {/* Capture Button */}
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <Pressable
            onPress={handleCapturePress}
            style={[styles.captureButton, isRecording && styles.captureButtonRecording]}
          >
            <View
              style={[
                styles.captureButtonInner,
                mode === 'video' && !isRecording && styles.captureButtonInnerVideo,
                isRecording && styles.captureButtonInnerRecording,
              ]}
            />
          </Pressable>
        </Animated.View>

        {/* Placeholder for symmetry */}
        <View style={styles.sideButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 20,
  },
  modeButtonActive: {
    backgroundColor: Colors.camera.modeButtonActive,
  },
  sideButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.camera.captureButton,
    borderWidth: 4,
    borderColor: Colors.camera.captureButtonBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonRecording: {
    borderColor: Colors.camera.recordingRed,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.camera.captureButton,
  },
  captureButtonInnerVideo: {
    backgroundColor: Colors.camera.recordingRed,
  },
  captureButtonInnerRecording: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.camera.recordingRed,
  },
});
