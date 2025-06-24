import { useState, useEffect } from 'react';
import * as Camera from 'expo-camera';
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
  const [permissions, setPermissions] = useState<MediaPermissions>({
    camera: null,
    mediaLibrary: null,
  });

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const [cameraStatus, mediaLibraryStatus] = await Promise.all([
      Camera.getCameraPermissionsAsync(),
      MediaLibrary.getPermissionsAsync(),
    ]);

    setPermissions({
      camera: cameraStatus.granted,
      mediaLibrary: mediaLibraryStatus.granted,
    });
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status: existingStatus } = await Camera.getCameraPermissionsAsync();

    if (existingStatus === 'granted') {
      return true;
    }

    if (existingStatus === 'denied') {
      showPermissionDeniedAlert('Camera');
      return false;
    }

    const { granted } = await Camera.requestCameraPermissionsAsync();
    setPermissions((prev) => ({ ...prev, camera: granted }));
    return granted;
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
    setPermissions((prev) => ({ ...prev, mediaLibrary: granted }));
    return granted;
  };

  const requestAllPermissions = async (): Promise<boolean> => {
    const [camera, mediaLibrary] = await Promise.all([
      requestCameraPermission(),
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

  const hasAllPermissions = permissions.camera === true && permissions.mediaLibrary === true;

  return {
    permissions,
    hasAllPermissions,
    requestCameraPermission,
    requestMediaLibraryPermission,
    requestAllPermissions,
    openSettings,
  };
}
