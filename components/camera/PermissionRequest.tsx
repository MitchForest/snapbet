import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable, StyleSheet, Linking } from 'react-native';
import { Colors } from '@/theme';
import Constants from 'expo-constants';

interface PermissionRequestProps {
  type: 'camera' | 'mediaLibrary' | 'both';
  onRequestPermission: () => Promise<void>;
  onOpenSettings: () => void;
}

export function PermissionRequest({
  type,
  onRequestPermission,
  onOpenSettings,
}: PermissionRequestProps) {
  // Check if in Expo Go
  const isExpoGo = !Constants.appOwnership || Constants.appOwnership === 'expo';

  if (isExpoGo) {
    return (
      <View
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding="$4"
        backgroundColor={Colors.background}
      >
        <Text fontSize="$6" marginBottom="$2">
          📸
        </Text>
        <Text fontSize="$5" fontWeight="600" marginBottom="$2" textAlign="center">
          Camera Requires Development Build
        </Text>
        <Text fontSize="$3" color={Colors.text.secondary} textAlign="center" marginBottom="$4">
          Camera features don&apos;t work in Expo Go. Please run the app in a development build.
        </Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            Linking.openURL('https://docs.expo.dev/develop/development-builds/introduction/')
          }
        >
          <Text color="white" fontWeight="600">
            Learn More
          </Text>
        </Pressable>
      </View>
    );
  }

  const getPermissionText = () => {
    switch (type) {
      case 'camera':
        return {
          icon: '📷',
          title: 'Camera Permission Required',
          description:
            'Allow Snapbet to access your camera to take photos and videos for your posts and stories.',
        };
      case 'mediaLibrary':
        return {
          icon: '🖼️',
          title: 'Photo Library Permission Required',
          description:
            'Allow Snapbet to access your photos to share existing media in posts and stories.',
        };
      case 'both':
        return {
          icon: '📸',
          title: 'Camera & Photos Permission Required',
          description:
            'Allow Snapbet to access your camera and photos to create and share content.',
        };
    }
  };

  const { icon, title, description } = getPermissionText();

  return (
    <View
      flex={1}
      alignItems="center"
      justifyContent="center"
      padding="$6"
      backgroundColor={Colors.background}
    >
      <Text fontSize={72} marginBottom="$4">
        {icon}
      </Text>

      <Text fontSize="$5" fontWeight="600" marginBottom="$3" textAlign="center">
        {title}
      </Text>

      <Text
        fontSize="$3"
        color={Colors.text.secondary}
        textAlign="center"
        marginBottom="$6"
        paddingHorizontal="$4"
      >
        {description}
      </Text>

      <View gap="$3" width="100%" maxWidth={300}>
        <Pressable style={styles.primaryButton} onPress={onRequestPermission}>
          <Text color="white" fontWeight="600">
            Allow Access
          </Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={onOpenSettings}>
          <Text color={Colors.text.primary}>Open Settings</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
});
