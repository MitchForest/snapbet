import React, { useState } from 'react';
import { Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView } from '@/components/camera/CameraView';
import { MediaPreview, ShareOptions } from '@/components/camera/MediaPreview';
import { CapturedMedia } from '@/hooks/useCamera';
import { uploadWithRetry, getMediaPath } from '@/services/media/upload';
import { generateFileName } from '@/utils/media/helpers';
import { useAuth } from '@/hooks/useAuth';
import { Alert } from 'react-native';

export default function CameraModal() {
  const router = useRouter();
  const { user } = useAuth();
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleClose = () => {
    if (isUploading) {
      Alert.alert('Upload in Progress', 'Are you sure you want to cancel the upload?', [
        { text: 'Continue Upload', style: 'cancel' },
        {
          text: 'Cancel Upload',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]);
    } else {
      router.back();
    }
  };

  const handleCapture = (media: CapturedMedia) => {
    setCapturedMedia(media);
  };

  const handleNext = async (options: ShareOptions) => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to share content.');
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileName = generateFileName(capturedMedia?.type || 'photo');

      // Determine path based on share options
      const paths: string[] = [];
      if (options.shareToFeed) {
        paths.push(getMediaPath('post', user.id, fileName));
      }
      if (options.shareToStory) {
        paths.push(getMediaPath('story', user.id, fileName));
      }

      // Upload to each path
      const uploadPromises = paths.map((path) => uploadWithRetry(options.mediaUri, path));

      const uploadedUrls = await Promise.all(uploadPromises);

      // TODO: Create post/story records in database with uploadedUrls
      // For now, we're just uploading the media files
      console.log('Media uploaded to:', uploadedUrls);

      // Success! Navigate back to feed
      Alert.alert('Success!', 'Your content has been shared.', [
        { text: 'OK', onPress: () => router.replace('/(drawer)/(tabs)/') },
      ]);
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Upload Failed', 'Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle="fullScreen"
      visible={true}
      onRequestClose={handleClose}
    >
      {!capturedMedia ? (
        <CameraView onCapture={handleCapture} onClose={handleClose} />
      ) : (
        <MediaPreview
          media={capturedMedia}
          onBack={() => setCapturedMedia(null)}
          onNext={handleNext}
        />
      )}
    </Modal>
  );
}
