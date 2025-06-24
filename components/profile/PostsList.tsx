import React from 'react';
import { View, Text } from '@tamagui/core';

interface PostsListProps {
  userId: string;
}

export const PostsList: React.FC<PostsListProps> = () => {
  // TODO: In a future sprint, this will fetch and display actual posts
  // For now, just show a placeholder

  return (
    <View flex={1} padding="$4" alignItems="center" justifyContent="center" minHeight={200}>
      <Text fontSize={18} color="$textSecondary" textAlign="center">
        No posts yet
      </Text>
      <Text fontSize={14} color="$textSecondary" textAlign="center" marginTop="$2">
        Posts will appear here once the feed feature is implemented
      </Text>
    </View>
  );
};
