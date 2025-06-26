import React from 'react';
import { View, Text } from '@tamagui/core';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/theme';

interface MediaUploadProgressProps {
  progress: number;
  onCancel?: () => void;
}

export function MediaUploadProgress({ progress, onCancel }: MediaUploadProgressProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          <ActivityIndicator size="large" color={Colors.white} />

          {/* Progress Text */}
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        </View>

        <Text style={styles.uploadingText}>Uploading...</Text>

        {onCancel && (
          <Text style={styles.cancelText} onPress={onCancel}>
            Cancel
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.black + '50', // 50% opacity
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    gap: 12,
  },
  progressContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTextContainer: {
    position: 'absolute',
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  uploadingText: {
    fontSize: 14,
    color: Colors.white,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 14,
    color: Colors.white,
    textDecorationLine: 'underline',
    marginTop: 8,
  },
});
