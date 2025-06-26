import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraScreen } from '@/components/camera/CameraView';
import { MediaPreview, ShareOptions } from '@/components/camera/MediaPreview';
import { CapturedMedia } from '@/hooks/useCamera';
import { uploadWithRetry, getMediaPath } from '@/services/media/upload';
import { generateFileName } from '@/utils/media/helpers';
import { useAuthStore } from '@/stores/authStore';
import { Alert } from 'react-native';
import { PostType, PendingShareBet } from '@/types/content';
import { createPost } from '@/services/content/postService';
import { createStory } from '@/services/content/storyService';
import { useBetSharing } from '@/hooks/useBetSharing';

export default function CameraModal() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    mode,
    postType = PostType.CONTENT,
    betId,
  } = useLocalSearchParams<{
    mode?: 'pick' | 'outcome';
    postType?: PostType;
    betId?: string;
  }>();
  const { retrieveAndClearBet } = useBetSharing();
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingBet, setPendingBet] = useState<PendingShareBet | null>(null);

  // Retrieve bet data when mode is pick or outcome
  useEffect(() => {
    if (mode === 'pick' || mode === 'outcome') {
      const betData = retrieveAndClearBet();
      if (betData) {
        setPendingBet(betData);
      }
    }
  }, [mode, retrieveAndClearBet]);

  // Determine post type based on mode
  const effectivePostType =
    mode === 'pick' ? PostType.PICK : mode === 'outcome' ? PostType.OUTCOME : postType;

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
    switch (effectivePostType) {
      case PostType.PICK:
        return 'Share Your Pick';
      case PostType.OUTCOME:
        return 'Share Your Result';
      default:
        return 'Create Post';
    }
  };

  // Get suggested caption based on bet data
  const getSuggestedCaption = (): string => {
    if (!pendingBet) return '';

    if (pendingBet.type === 'pick') {
      const confidence = pendingBet.stake > 5000 ? '🔒' : '🎯';

      switch (pendingBet.betType) {
        case 'spread': {
          const line = pendingBet.betDetails.line || 0;
          return `${pendingBet.betDetails.team} ${line > 0 ? '+' : ''}${line} ${confidence}`;
        }
        case 'total':
          return `${pendingBet.betDetails.total_type?.toUpperCase()} ${pendingBet.betDetails.line} ${confidence}`;
        case 'moneyline':
          return `${pendingBet.betDetails.team} ML ${confidence}`;
        default:
          return '';
      }
    } else {
      // Outcome captions
      if (pendingBet.status === 'won') {
        return `Easy money 💰 +$${(pendingBet.actualWin || 0) / 100}`;
      } else if (pendingBet.status === 'push') {
        return 'Live to bet another day 🤝';
      } else {
        return 'On to the next one 💪';
      }
    }
  };

  // Get suggested effects based on outcome
  const getSuggestedEffects = (): string[] => {
    if (mode === 'outcome' && pendingBet) {
      if (pendingBet.status === 'won') {
        return ['money_rain', 'fire', 'celebration'];
      } else if (pendingBet.status === 'lost') {
        return ['crying', 'broken_heart', 'skull'];
      }
    }
    return [];
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
        const postData = {
          media_url: uploadedUrl,
          media_type: capturedMedia?.type || 'photo',
          caption: options.caption,
          effect_id: capturedMedia?.effectId || undefined,
          post_type: effectivePostType,
          bet_id: effectivePostType === PostType.PICK ? pendingBet?.betId || betId : undefined,
          settled_bet_id:
            effectivePostType === PostType.OUTCOME ? pendingBet?.betId || betId : undefined,
          expires_at:
            effectivePostType === PostType.PICK && pendingBet?.expiresAt
              ? new Date(pendingBet.expiresAt)
              : undefined,
          metadata: pendingBet
            ? {
                bet_id: pendingBet.betId,
                game_id: pendingBet.gameId,
                bet_type: pendingBet.betType,
                bet_details: pendingBet.betDetails,
                stake: pendingBet.stake,
                odds: pendingBet.odds,
                status: pendingBet.status,
                actual_win: pendingBet.actualWin,
              }
            : undefined,
        };

        promises.push(createPost(postData));
      }

      // Create story if sharing to story
      if (options.shareToStory) {
        promises.push(
          createStory({
            media_url: uploadedUrl,
            media_type: capturedMedia?.type || 'photo',
            caption: options.caption,
            effect_id: capturedMedia?.effectId || undefined,
            story_content_type: effectivePostType,
            bet_id: effectivePostType === PostType.PICK ? pendingBet?.betId || betId : undefined,
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
        <CameraScreen
          onCapture={handleCapture}
          onClose={handleClose}
          pendingBet={pendingBet}
          suggestedEffects={getSuggestedEffects()}
        />
      ) : (
        <MediaPreview
          media={capturedMedia}
          onBack={() => setCapturedMedia(null)}
          onNext={handleNext}
          postType={effectivePostType}
          headerTitle={getHeaderTitle()}
          suggestedCaption={getSuggestedCaption()}
        />
      )}
    </>
  );
}
