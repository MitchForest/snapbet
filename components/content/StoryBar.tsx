import React from 'react';
import { View } from '@tamagui/core';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StoryCircle } from './StoryCircle';
import { StoryForUI } from '@/hooks/useStories';
import { Colors } from '@/theme';
import { toastService } from '@/services/toastService';

interface StoryBarProps {
  stories: StoryForUI[];
  onAddStory?: () => void;
}

export function StoryBar({ stories, onAddStory }: StoryBarProps) {
  const router = useRouter();

  const handleStoryPress = (story: StoryForUI) => {
    if (story.isOwn && !story.hasUnwatched) {
      // Navigate to camera for adding story
      if (onAddStory) {
        onAddStory();
      } else {
        router.push('/(drawer)/camera');
      }
    } else {
      // Show coming soon for viewing stories
      toastService.showComingSoon('Story viewing');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {stories.map((story) => (
          <StoryCircle
            key={story.id}
            username={story.user.username}
            avatarUrl={story.user.avatar_url}
            hasUnwatched={story.hasUnwatched}
            isOwn={story.isOwn}
            onPress={() => handleStoryPress(story)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
});
