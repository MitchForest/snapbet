import React from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Avatar } from '@/components/common/Avatar';
import { useStories } from '@/hooks/useStories';
import { useRouter } from 'expo-router';
import { Colors } from '@/theme';

export const StoriesBar: React.FC = () => {
  const { storySummaries, isLoading } = useStories();
  const router = useRouter();

  const handleAddStoryPress = () => {
    router.push('/camera');
  };

  const getAllStoryIds = () => {
    const allStoryIds: string[] = [];
    storySummaries.forEach((summary) => {
      // Add stories in chronological order (oldest first) for each user
      summary.stories
        .sort(
          (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        )
        .forEach((story) => allStoryIds.push(story.id));
    });
    return allStoryIds;
  };

  const handleStoryPress = (userId: string) => {
    // Find the first story for this user
    const userSummary = storySummaries.find((s) => s.id === userId);
    if (!userSummary || userSummary.stories.length === 0) return;

    const firstStory = userSummary.stories[0];
    const allStoryIds = getAllStoryIds();
    const startIndex = allStoryIds.indexOf(firstStory.id);

    router.push({
      pathname: '/(drawer)/story/[id]',
      params: {
        id: firstStory.id,
        allStoryIds: allStoryIds.join(','),
        startIndex: startIndex.toString(),
      },
    });
  };

  if (isLoading) {
    return (
      <View
        backgroundColor="$surface"
        paddingVertical="$3"
        borderBottomWidth={1}
        borderBottomColor="$divider"
        height={110}
        justifyContent="center"
        alignItems="center"
      >
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View
      backgroundColor="$surface"
      paddingVertical="$3"
      borderBottomWidth={1}
      borderBottomColor="$divider"
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View flexDirection="row" paddingHorizontal="$4">
          {/* Your Story */}
          <Pressable onPress={handleAddStoryPress}>
            <View alignItems="center" marginRight="$3">
              <View position="relative">
                <Avatar size={64} />
                <View
                  position="absolute"
                  bottom={0}
                  right={0}
                  backgroundColor="$primary"
                  borderRadius="$round"
                  width={20}
                  height={20}
                  justifyContent="center"
                  alignItems="center"
                  borderWidth={2}
                  borderColor="$surface"
                >
                  <Text color="$textInverse" fontSize={14}>
                    +
                  </Text>
                </View>
              </View>
              <Text fontSize={12} color="$textPrimary" marginTop="$1">
                You
              </Text>
            </View>
          </Pressable>

          {/* Other Stories */}
          {storySummaries.map((story) => (
            <Pressable key={story.id} onPress={() => handleStoryPress(story.id)}>
              <View alignItems="center" marginRight="$3">
                <View
                  padding={story.hasUnwatched ? 2 : 0}
                  borderRadius="$round"
                  borderWidth={story.hasUnwatched ? 3 : 0}
                  borderColor={story.isLive ? '$error' : '$primary'}
                >
                  <Avatar
                    size={64}
                    src={story.avatar}
                    fallback={story.username[0]?.toUpperCase()}
                  />
                  {story.isLive && (
                    <View
                      position="absolute"
                      bottom={0}
                      right={0}
                      backgroundColor="$error"
                      paddingHorizontal="$2"
                      paddingVertical="$0.5"
                      borderRadius="$2"
                      borderWidth={2}
                      borderColor="$surface"
                    >
                      <Text color="$textInverse" fontSize={10} fontWeight="600">
                        LIVE
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  fontSize={12}
                  color={story.hasUnwatched ? '$textPrimary' : '$textSecondary'}
                  marginTop="$1"
                  numberOfLines={1}
                  width={64}
                  textAlign="center"
                >
                  {story.username}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
