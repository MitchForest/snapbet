import { supabase } from '@/services/supabase/client';
import { storageService } from '@/services/storage/storageService';
import { CompressedMedia } from '@/types/messaging';
import { generateFileName } from '@/utils/media/helpers';

interface UploadProgressCallback {
  (progress: number): void;
}

class MediaMessageService {
  /**
   * Upload message media with progress tracking
   */
  async uploadMessageMedia(
    media: CompressedMedia,
    chatId: string,
    messageId: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    try {
      const filename = generateFileName(media.type);
      const path = storageService.getMessageMediaPath(chatId, messageId, filename);

      // Convert URI to blob for upload
      const response = await fetch(media.uri);
      const blob = await response.blob();

      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });

        // Handle completion
        xhr.addEventListener('load', async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            // Get public URL
            const { data } = supabase.storage.from('media').getPublicUrl(path);
            resolve(data.publicUrl);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        // Get Supabase auth token
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) {
            reject(new Error('Not authenticated'));
            return;
          }

          // Configure request
          const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
          if (!supabaseUrl) {
            throw new Error('Supabase URL not configured');
          }
          const uploadUrl = `${supabaseUrl}/storage/v1/object/media/${path}`;
          xhr.open('POST', uploadUrl);
          xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
          xhr.setRequestHeader('Content-Type', blob.type || 'application/octet-stream');
          xhr.setRequestHeader('x-upsert', 'true');

          // Send the blob
          xhr.send(blob);
        });
      });
    } catch (error) {
      console.error('Media upload failed:', error);
      throw error;
    }
  }

  /**
   * Get a thumbnail URL for video messages
   */
  async generateVideoThumbnail(_videoUrl: string): Promise<string | undefined> {
    // For now, we don't generate thumbnails
    // This would require a video processing service
    return undefined;
  }

  /**
   * Check if media URL is still accessible
   */
  async isMediaAccessible(mediaUrl: string): Promise<boolean> {
    try {
      const response = await fetch(mediaUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get media metadata from URL
   */
  async getMediaMetadata(mediaUrl: string): Promise<{
    size?: number;
    contentType?: string;
  }> {
    try {
      const response = await fetch(mediaUrl, { method: 'HEAD' });
      if (!response.ok) {
        return {};
      }

      return {
        size: response.headers.get('content-length')
          ? parseInt(response.headers.get('content-length')!, 10)
          : undefined,
        contentType: response.headers.get('content-type') || undefined,
      };
    } catch {
      return {};
    }
  }
}

export const mediaMessageService = new MediaMessageService();
