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
  console.log('FeedScreen rendering...');
  return (
    <View flex={1} backgroundColor="#FAF9F5">
      <View flex={1} justifyContent="center" alignItems="center" padding={20}>
        <Text fontSize={24} color="#1F2937" fontWeight="600">
          Feed Screen - Demo Mode
        </Text>
        <Text fontSize={16} color="#6B7280" marginTop={8}>
          App is working! Navigation successful.
        </Text>
      </View>
    </View>
  );
}
