import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraScreen } from '@/components/camera/CameraView';
import { MediaPreview, ShareOptions } from '@/components/camera/MediaPreview';
import { CapturedMedia } from '@/hooks/useCamera';
import { uploadWithRetry, getMediaPath } from '@/services/media/upload';
import { generateFileName } from '@/utils/media/helpers';
import { useAuthStore } from '@/stores/authStore';
import { Alert } from 'react-native';
import { PostType } from '@/types/content';
import { createPost } from '@/services/content/postService';
import { createStory } from '@/services/content/storyService';

export default function CameraModal() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { postType = PostType.CONTENT, betId } = useLocalSearchParams<{
    postType?: PostType;
    betId?: string;
  }>();
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

  const getHeaderTitle = () => {
    switch (postType) {
      case PostType.PICK:
        return 'Share Your Pick';
      case PostType.OUTCOME:
        return 'Share Your Result';
      default:
        return 'Create Post';
    }
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

      // Upload media once for both post and story
      const postPath = getMediaPath('post', user.id, fileName);
      const uploadedUrl = await uploadWithRetry(options.mediaUri, postPath);

      // Create promises for parallel execution
      const promises = [];

      // Create post if sharing to feed
      if (options.shareToFeed) {
        promises.push(
          createPost({
            media_url: uploadedUrl,
            media_type: capturedMedia?.type || 'photo',
            caption: options.caption,
            effect_id: capturedMedia?.effectId || undefined,
            post_type: postType,
            bet_id: postType === PostType.PICK ? betId : undefined,
            settled_bet_id: postType === PostType.OUTCOME ? betId : undefined,
          })
        );
      }

      // Create story if sharing to story
      if (options.shareToStory) {
        promises.push(
          createStory({
            media_url: uploadedUrl,
            media_type: capturedMedia?.type || 'photo',
            caption: options.caption,
            effect_id: capturedMedia?.effectId || undefined,
            story_content_type: postType,
            bet_id: postType === PostType.PICK ? betId : undefined,
          })
        );
      }

      // Execute all promises in parallel
      await Promise.all(promises);

      // Success! Navigate back to feed with delay
      Alert.alert('Success!', 'Your content has been shared.');

      // Navigate after delay to prevent timing issues
      setTimeout(() => {
        router.replace('/(drawer)/(tabs)/');
      }, 100);
    } catch (error) {
      console.error('Share failed:', error);

      // Provide specific error messages
      let errorMessage = 'Failed to share. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('upload')) {
          errorMessage = 'Failed to upload media. Please try again.';
        } else if (error.message.includes('post')) {
          errorMessage = 'Failed to create post. Please try again.';
        } else if (error.message.includes('story')) {
          errorMessage = 'Failed to create story. Please try again.';
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {!capturedMedia ? (
        <CameraScreen onCapture={handleCapture} onClose={handleClose} />
      ) : (
        <MediaPreview
          media={capturedMedia}
          onBack={() => setCapturedMedia(null)}
          onNext={handleNext}
          postType={postType}
          headerTitle={getHeaderTitle()}
        />
      )}
    </>
  );
}
