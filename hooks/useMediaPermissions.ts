import { useState, useEffect } from 'react';
import { useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Linking, Platform } from 'react-native';

interface MediaPermissions {
  camera: boolean | null;
  mediaLibrary: boolean | null;
}

interface UseMediaPermissionsReturn {
  permissions: MediaPermissions;
  hasAllPermissions: boolean;
  requestCameraPermission: () => Promise<boolean>;
  requestMediaLibraryPermission: () => Promise<boolean>;
  requestAllPermissions: () => Promise<boolean>;
  openSettings: () => void;
}

export function useMediaPermissions(): UseMediaPermissionsReturn {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState<boolean | null>(null);

  // Check media library permissions on mount
  useEffect(() => {
    checkMediaLibraryPermission();
  }, []);

  const checkMediaLibraryPermission = async () => {
    const { granted } = await MediaLibrary.getPermissionsAsync();
    setMediaLibraryPermission(granted);
  };

  const requestCamera = async (): Promise<boolean> => {
    const result = await requestCameraPermission();
    if (!result.granted && result.status === 'denied') {
      showPermissionDeniedAlert('Camera');
    }
    return result.granted;
  };

  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    const { status: existingStatus } = await MediaLibrary.getPermissionsAsync();

    if (existingStatus === 'granted') {
      return true;
    }

    if (existingStatus === 'denied') {
      showPermissionDeniedAlert('Photo Library');
      return false;
    }

    const { granted } = await MediaLibrary.requestPermissionsAsync();
    setMediaLibraryPermission(granted);
    return granted;
  };

  const requestAllPermissions = async (): Promise<boolean> => {
    const [camera, mediaLibrary] = await Promise.all([
      requestCamera(),
      requestMediaLibraryPermission(),
    ]);

    return camera && mediaLibrary;
  };

  const showPermissionDeniedAlert = (permissionType: string) => {
    Alert.alert(
      `${permissionType} Permission Required`,
      `Please enable ${permissionType} access in your device settings to use this feature.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: openSettings },
      ]
    );
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const permissions: MediaPermissions = {
    camera: cameraPermission?.granted ?? null,
    mediaLibrary: mediaLibraryPermission,
  };

  const hasAllPermissions = permissions.camera === true && permissions.mediaLibrary === true;

  return {
    permissions,
    hasAllPermissions,
    requestCameraPermission: requestCamera,
    requestMediaLibraryPermission,
    requestAllPermissions,
    openSettings,
  };
}
