import { useState, useRef } from 'react';
import { Camera, CameraType, FlashMode } from 'expo-camera';
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
  facing: CameraType;
  flash: FlashMode;
  mode: 'photo' | 'video';
  isRecording: boolean;
  capturedMedia: CapturedMedia | null;

  // Actions
  toggleFacing: () => void;
  toggleFlash: () => void;
  setMode: (mode: 'photo' | 'video') => void;
  capturePhoto: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pickFromGallery: () => Promise<void>;
  setCapturedMedia: (media: CapturedMedia | null) => void;

  // Refs
  cameraRef: React.RefObject<Camera | null>;
}

export function useCamera(): UseCameraReturn {
  const [facing, setFacing] = useState<CameraType>(CameraType.back);
  const [flash, setFlash] = useState<FlashMode>(FlashMode.off);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia | null>(null);

  const cameraRef = useRef<Camera | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const toggleFacing = () => {
    setFacing((current) => (current === CameraType.back ? CameraType.front : CameraType.back));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleFlash = () => {
    setFlash((current) => {
      const modes: FlashMode[] = [FlashMode.off, FlashMode.on, FlashMode.auto];
      const currentIndex = modes.indexOf(current);
      const nextIndex = (currentIndex + 1) % modes.length;
      return modes[nextIndex];
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });

      if (photo) {
        setCapturedMedia({
          uri: photo.uri,
          type: 'photo',
          width: photo.width,
          height: photo.height,
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
        mediaTypes: ImagePicker.MediaTypeOptions.All,
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
    flash,
    mode,
    isRecording,
    capturedMedia,

    // Actions
    toggleFacing,
    toggleFlash,
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
