import React from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView, Pressable } from 'react-native';
import { Avatar } from '@/components/common/Avatar';

interface Story {
  id: string;
  username: string;
  avatar?: string;
  hasUnwatched: boolean;
  isLive?: boolean;
}

interface StoriesBarProps {
  stories?: Story[];
  onStoryPress?: (story: Story) => void;
  onAddStoryPress?: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories = [],
  onStoryPress,
  onAddStoryPress,
}) => {
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
          <Pressable onPress={onAddStoryPress}>
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
          {stories.map((story) => (
            <Pressable key={story.id} onPress={() => onStoryPress?.(story)}>
              <View alignItems="center" marginRight="$3">
                <View
                  padding={story.hasUnwatched ? 2 : 0}
                  borderRadius="$round"
                  borderWidth={story.hasUnwatched ? 3 : 0}
                  borderColor={story.isLive ? '$error' : '$primary'}
                >
                  <Avatar size={64} src={story.avatar} />
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
