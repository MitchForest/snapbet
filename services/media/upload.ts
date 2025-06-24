import { supabase } from '@/services/supabase';
import { Alert } from 'react-native';

interface UploadOptions {
  onProgress?: (progress: number) => void;
  maxRetries?: number;
}

export async function uploadWithRetry(
  uri: string,
  path: string,
  options: UploadOptions = {}
): Promise<string> {
  const { onProgress, maxRetries = 3 } = options;

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Upload attempt ${i + 1} for ${path}`);

      // Convert URI to blob for upload
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { error } = await supabase.storage.from('media').upload(path, blob, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);

      console.log('Upload successful:', urlData.publicUrl);

      // Call progress callback with 100%
      if (onProgress) {
        onProgress(100);
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error(`Upload attempt ${i + 1} failed:`, error);

      if (i === maxRetries - 1) {
        // Last attempt failed
        Alert.alert('Upload Failed', 'Please check your connection and try again.', [
          { text: 'OK' },
        ]);
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = 1000 * Math.pow(2, i);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Upload failed after all retries');
}

export function getMediaPath(type: 'post' | 'story', userId: string, fileName: string): string {
  return `${type}s/${userId}/${fileName}`;
}

export async function deleteMedia(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from('media').remove([path]);

    if (error) {
      console.error('Error deleting media:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting media:', error);
    return false;
  }
}
