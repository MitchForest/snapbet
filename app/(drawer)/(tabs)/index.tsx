import React from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView } from 'react-native';
import { StoriesBar } from '@/components/ui/StoriesBar';

const mockStories = [
  { id: '1', username: 'Mike', hasUnwatched: true, isLive: true },
  { id: '2', username: 'Sarah', hasUnwatched: true },
  { id: '3', username: 'Dan', hasUnwatched: false },
  { id: '4', username: 'Amy', hasUnwatched: true },
  { id: '5', username: 'Jake', hasUnwatched: false },
];

export default function FeedScreen() {
  return (
    <View flex={1} backgroundColor="$background">
      <StoriesBar
        stories={mockStories}
        onStoryPress={(story) => console.log('Story pressed:', story)}
        onAddStoryPress={() => console.log('Add story pressed')}
      />

      <ScrollView>
        <View flex={1} justifyContent="center" alignItems="center" paddingVertical="$8">
          <Text fontSize={24} color="$textPrimary" fontWeight="600">
            Feed coming soon
          </Text>
          <Text fontSize={16} color="$textSecondary" marginTop="$2">
            Your friends&apos; bets will appear here
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
