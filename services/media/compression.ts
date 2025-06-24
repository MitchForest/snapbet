import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export const compressionConfig = {
  photo: {
    compress: 0.85,
    maxWidth: 1920,
    maxHeight: 1080,
    format: ImageManipulator.SaveFormat.JPEG,
  },
  video: {
    maxSize: 50 * 1024 * 1024, // 50MB
  },
};

export async function compressPhoto(uri: string): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: compressionConfig.photo.maxWidth,
          },
        },
      ],
      {
        compress: compressionConfig.photo.compress,
        format: compressionConfig.photo.format,
      }
    );

    console.log('Photo compressed successfully');
    return result.uri;
  } catch (error) {
    console.error('Photo compression failed:', error);
    // Return original if compression fails
    return uri;
  }
}

export async function validateVideoSize(uri: string): Promise<{ valid: boolean; size?: number }> {
  try {
    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (!fileInfo.exists) {
      console.error('Video file does not exist');
      return { valid: false };
    }

    // Check size - fileInfo has size when exists is true
    const size = 'size' in fileInfo ? fileInfo.size : 0;
    const valid = size <= compressionConfig.video.maxSize;

    if (!valid) {
      console.log(`Video too large: ${(size / 1024 / 1024).toFixed(2)}MB`);
    }

    return { valid, size };
  } catch (error) {
    console.error('Error validating video size:', error);
    return { valid: false };
  }
}

export async function getMediaInfo(uri: string): Promise<{
  size: number;
  sizeInMB: string;
}> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (!fileInfo.exists) {
      return { size: 0, sizeInMB: '0' };
    }

    const size = 'size' in fileInfo ? fileInfo.size : 0;
    const sizeInMB = (size / 1024 / 1024).toFixed(2);

    return { size, sizeInMB };
  } catch (error) {
    console.error('Error getting media info:', error);
    return { size: 0, sizeInMB: '0' };
  }
}
