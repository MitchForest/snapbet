import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Image, StatusBar } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useStoryViewer } from '@/hooks/useStoryViewer';
import { useStoryReactions } from '@/hooks/useStoryReactions';
import { StoryProgressBar } from '@/components/story/StoryProgressBar';
import { StoryControls } from '@/components/story/StoryControls';
import { StoryViewerGestures } from '@/components/story/StoryViewerGestures';
import { Colors, OpacityColors } from '@/theme';
import { reactionService } from '@/services/engagement/reactionService';
import { toastService } from '@/services/toastService';

// Video player component for stories
function StoryVideoPlayer({
  uri,
  isPaused,
  onEnd,
}: {
  uri: string;
  isPaused: boolean;
  onEnd: () => void;
}) {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false;
    player.play();
  });

  useEffect(() => {
    if (isPaused) {
      player.pause();
    } else {
      player.play();
    }
  }, [isPaused, player]);

  useEffect(() => {
    const subscription = player.addListener('playingChange', (isPlaying) => {
      if (!isPlaying && player.currentTime >= player.duration - 0.1) {
        onEnd();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player, onEnd]);

  return <VideoView player={player} style={styles.media} contentFit="cover" />;
}

export default function StoryViewerScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const storyId = params.id;

  const {
    currentStory,
    currentUserStories,
    currentStoryIndex,
    progress,
    isPaused,
    goToNext,
    goToPrevious,
    pause,
    resume,
    dismiss,
    isLoading,
    error,
    viewCount,
    isOwner,
  } = useStoryViewer(storyId);

  // Story reactions hook
  const { userReaction, toggleReaction } = useStoryReactions(currentStory?.id || '');

  // Hide status bar
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setHidden(true);
      return () => StatusBar.setHidden(false);
    }, [])
  );

  // Handle story reactions
  const handleReaction = async (emoji: string) => {
    if (!currentStory) return;

    try {
      // Toggle reaction on story (not post)
      await reactionService.toggleReaction(currentStory.id, emoji, true);
      toggleReaction(emoji);
    } catch {
      toastService.showError('Failed to react to story');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  if (error || !currentStory) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error?.message === 'Story has expired'
              ? 'This story has expired'
              : 'Failed to load story'}
          </Text>
          <Text style={styles.errorAction} onPress={dismiss}>
            Tap to go back
          </Text>
        </View>
      </View>
    );
  }

  return (
    <StoryViewerGestures
      onTapLeft={goToPrevious}
      onTapRight={goToNext}
      onLongPressStart={pause}
      onLongPressEnd={resume}
      onSwipeDown={dismiss}
    >
      <View style={styles.container}>
        {/* Background Media */}
        {currentStory.media_type === 'video' ? (
          <StoryVideoPlayer uri={currentStory.media_url} isPaused={isPaused} onEnd={goToNext} />
        ) : (
          <Image source={{ uri: currentStory.media_url }} style={styles.media} resizeMode="cover" />
        )}

        {/* Dark overlay for better visibility */}
        <View style={styles.overlay} />

        {/* Progress bars */}
        <StoryProgressBar
          stories={currentUserStories}
          currentIndex={currentStoryIndex}
          progress={progress}
        />

        {/* Story controls */}
        <StoryControls
          story={currentStory}
          viewCount={viewCount}
          isOwner={isOwner}
          userReaction={userReaction}
          onClose={dismiss}
          onReaction={handleReaction}
        />
      </View>
    </StoryViewerGestures>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  media: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: OpacityColors.overlay.lighter,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorAction: {
    fontSize: 16,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});
