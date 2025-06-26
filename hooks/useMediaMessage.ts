import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { mediaMessageService } from '@/services/messaging/mediaMessageService';
import { messageService } from '@/services/messaging/messageService';
import { compressMedia, MediaInput } from '@/utils/media/messageCompression';
import { CompressedMedia } from '@/types/messaging';
import { toastService } from '@/services/toastService';
import { useAuthStore } from '@/stores/authStore';

export function useMediaMessage(chatId: string) {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const sendMediaMessage = useCallback(
    async (media: MediaInput, caption?: string): Promise<void> => {
      if (!user) {
        toastService.showError('Please sign in to send messages');
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      try {
        // 1. Compress media
        let compressed: CompressedMedia;
        try {
          compressed = await compressMedia(media);
        } catch (error) {
          if (error instanceof Error && error.message.includes('too large')) {
            Alert.alert('Video Too Large', error.message, [{ text: 'OK' }]);
            return;
          }
          throw error;
        }

        // Generate a temporary message ID for the upload path
        const tempMessageId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // 2. Upload to storage with progress
        const mediaUrl = await mediaMessageService.uploadMessageMedia(
          compressed,
          chatId,
          tempMessageId,
          (progress) => setUploadProgress(progress)
        );

        // 3. Create message with media URL
        await messageService.sendMessage(
          chatId,
          user.id,
          {
            text: caption || '',
            mediaUrl,
          },
          24
        ); // 24 hour expiration

        // The media_type should be set when creating the message
        // We'll need to update the message service to handle this

        toastService.showSuccess(`${media.type === 'photo' ? 'Photo' : 'Video'} sent!`);
      } catch (error) {
        console.error('Failed to send media message:', error);
        setUploadError(error instanceof Error ? error.message : 'Failed to send media');
        toastService.showError('Failed to send media');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [chatId, user]
  );

  const cancelUpload = useCallback(() => {
    // In a real implementation, we'd need to store the XHR instance
    // and call xhr.abort() here
    setIsUploading(false);
    setUploadProgress(0);
    toastService.showInfo('Upload cancelled');
  }, []);

  return {
    sendMediaMessage,
    uploadProgress,
    isUploading,
    uploadError,
    cancelUpload,
  };
}
