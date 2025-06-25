import { useState, useRef } from 'react';
import { CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

export interface CapturedMedia {
  uri: string;
  type: 'photo' | 'video';
  width?: number;
  height?: number;
  duration?: number;
  effectId?: string | null;
}

interface UseCameraReturn {
  // State
  facing: 'front' | 'back';
  enableTorch: boolean;
  mode: 'photo' | 'video';
  isRecording: boolean;
  capturedMedia: CapturedMedia | null;

  // Actions
  toggleFacing: () => void;
  toggleTorch: () => void;
  setMode: (mode: 'photo' | 'video') => void;
  capturePhoto: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pickFromGallery: () => Promise<void>;
  setCapturedMedia: (media: CapturedMedia | null) => void;

  // Refs
  cameraRef: React.RefObject<CameraView | null>;
}

export function useCamera(): UseCameraReturn {
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [enableTorch, setEnableTorch] = useState(false);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia | null>(null);

  const cameraRef = useRef<CameraView | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleTorch = () => {
    setEnableTorch((current) => !current);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

  // ... (rest of the file is the same until capturePhoto)

  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 1, // Capture at high quality, we will compress next
        skipProcessing: true, // Avoids native compression
      });

      if (photo) {
        // More robust compression to handle HDR photos
        const manipulatedImage = await manipulateAsync(
          photo.uri,
          [{ resize: { width: 1200 } }], // Resize to a reasonable width
          {
            compress: 0.9,
            format: SaveFormat.JPEG, // Explicitly save as JPEG
          }
        );

        setCapturedMedia({
          uri: manipulatedImage.uri,
          type: 'photo',
          width: manipulatedImage.width,
          height: manipulatedImage.height,
        });
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsRecording(true);

      // Set up auto-stop timer first
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 30000);

      const video = await cameraRef.current.recordAsync({
        maxDuration: 30, // 30 seconds max
      });

      if (video) {
        setCapturedMedia({
          uri: video.uri,
          type: 'video',
          duration: 30, // We know it's max 30 seconds
        });
      }
    } catch (error) {
      console.error('Error recording video:', error);
      setIsRecording(false);
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
    }
  };

  const stopRecording = () => {
    if (!cameraRef.current || !isRecording) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    cameraRef.current.stopRecording();
    setIsRecording(false);

    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.All,
        allowsEditing: false,
        quality: 0.9,
        videoMaxDuration: 30,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setCapturedMedia({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'photo',
          width: asset.width,
          height: asset.height,
          duration: asset.duration || undefined,
        });
      }
    } catch (error) {
      console.error('Error picking from gallery:', error);
    }
  };

  return {
    // State
    facing,
    enableTorch,
    mode,
    isRecording,
    capturedMedia,

    // Actions
    toggleFacing,
    toggleTorch,
    setMode,
    capturePhoto,
    startRecording,
    stopRecording,
    pickFromGallery,
    setCapturedMedia,

    // Refs
    cameraRef,
  };
}
