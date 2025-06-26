import React from 'react';
import { Text, Stack } from '@tamagui/core';
import { Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { BaseSheet } from '@/components/engagement/sheets/BaseSheet';
import * as Haptics from 'expo-haptics';
import { MediaInput } from '@/utils/media/messageCompression';

interface MediaPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onMediaSelected: (media: MediaInput) => void;
}

export function MediaPicker({ isVisible, onClose, onMediaSelected }: MediaPickerProps) {
  const handleCameraPress = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to take photos!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.85,
      videoMaxDuration: 30, // 30 seconds max
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const mediaType = asset.type === 'video' ? 'video' : 'photo';

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onMediaSelected({
        uri: asset.uri,
        type: mediaType,
      });
      onClose();
    }
  };

  const handleGalleryPress = async () => {
    // Request gallery permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to select photos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.85,
      videoMaxDuration: 60, // 1 minute max from gallery
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const mediaType = asset.type === 'video' ? 'video' : 'photo';

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onMediaSelected({
        uri: asset.uri,
        type: mediaType,
      });
      onClose();
    }
  };

  return (
    <BaseSheet isVisible={isVisible} onClose={onClose} height={200}>
      <Stack padding="$4" gap="$3">
        <Text fontSize="$5" fontWeight="600" textAlign="center">
          Send Photo or Video
        </Text>

        <Stack flexDirection="row" gap="$4" justifyContent="center">
          <Pressable onPress={handleCameraPress}>
            <Stack
              alignItems="center"
              gap="$2"
              padding="$3"
              borderRadius="$3"
              backgroundColor="$surface2"
              width={100}
            >
              <Text fontSize="$8">📷</Text>
              <Text fontSize="$3" color="$gray11">
                Camera
              </Text>
            </Stack>
          </Pressable>

          <Pressable onPress={handleGalleryPress}>
            <Stack
              alignItems="center"
              gap="$2"
              padding="$3"
              borderRadius="$3"
              backgroundColor="$surface2"
              width={100}
            >
              <Text fontSize="$8">🖼️</Text>
              <Text fontSize="$3" color="$gray11">
                Gallery
              </Text>
            </Stack>
          </Pressable>
        </Stack>

        <Text fontSize="$2" color="$gray11" textAlign="center" marginTop="$2">
          Photos will be compressed. Videos must be under 50MB.
        </Text>
      </Stack>
    </BaseSheet>
  );
}
