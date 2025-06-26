import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { CompressedMedia } from '@/types/messaging';

export interface CompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  maxVideoDuration: number;
  maxVideoSize: number;
}

export interface MediaInput {
  uri: string;
  type: 'photo' | 'video';
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  maxVideoDuration: 30,
  maxVideoSize: 50 * 1024 * 1024, // 50MB
};

export async function compressMedia(
  media: MediaInput,
  options: Partial<CompressionOptions> = {}
): Promise<CompressedMedia> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (media.type === 'photo') {
    return compressPhoto(media.uri, opts);
  } else {
    return validateVideo(media.uri, opts);
  }
}

async function compressPhoto(uri: string, options: CompressionOptions): Promise<CompressedMedia> {
  try {
    // Get original image info
    const originalInfo = await FileSystem.getInfoAsync(uri);
    if (!originalInfo.exists) {
      throw new Error('Photo file does not exist');
    }

    // Compress and resize
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: options.maxWidth,
          },
        },
      ],
      {
        compress: options.quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Get compressed file info
    const compressedInfo = await FileSystem.getInfoAsync(manipulated.uri);
    const size = 'size' in compressedInfo ? compressedInfo.size : 0;

    return {
      uri: manipulated.uri,
      type: 'photo',
      size,
      width: options.maxWidth,
      height: Math.round(options.maxWidth * 0.5625), // 16:9 aspect ratio
    };
  } catch (error) {
    console.error('Photo compression failed:', error);
    // Return original on failure
    const info = await getFileInfo(uri);
    return {
      uri,
      type: 'photo',
      size: info.size,
    };
  }
}

async function validateVideo(uri: string, options: CompressionOptions): Promise<CompressedMedia> {
  try {
    // Get video file info
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error('Video file does not exist');
    }

    const size = 'size' in fileInfo ? fileInfo.size : 0;

    // Check size limit
    if (size > options.maxVideoSize) {
      throw new Error(
        `Video is too large (${formatFileSize(size)}). Maximum size is ${formatFileSize(
          options.maxVideoSize
        )}.`
      );
    }

    // For now, we don't compress videos, just validate size
    // Video compression would require a native module
    return {
      uri,
      type: 'video',
      size,
      // Duration would require video metadata extraction
      duration: undefined,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('too large')) {
      throw error; // Re-throw size errors
    }
    console.error('Video validation failed:', error);
    throw new Error('Failed to process video');
  }
}

async function getFileInfo(uri: string): Promise<{ size: number; exists: boolean }> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return {
      exists: info.exists,
      size: info.exists && 'size' in info ? info.size : 0,
    };
  } catch {
    return { exists: false, size: 0 };
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function getMediaDimensions(_uri: string): Promise<{ width: number; height: number }> {
  try {
    // This would require Image.getSize() or similar
    // For now, return default 16:9 dimensions
    return { width: 1920, height: 1080 };
  } catch {
    return { width: 1920, height: 1080 };
  }
}
