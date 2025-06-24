import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { Avatar } from '@/components/common/Avatar';

interface UserListItemProps {
  user: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
  };
  showStats?: boolean;
  onPress?: () => void;
}

export const UserListItem: React.FC<UserListItemProps> = ({ user, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/profile/${user.username}`);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <View
        flexDirection="row"
        alignItems="center"
        paddingVertical="$3"
        paddingHorizontal="$4"
        backgroundColor="$surface"
        borderBottomWidth={1}
        borderBottomColor="$divider"
      >
        <Avatar size={48} src={user.avatar_url} />

        <View flex={1} marginLeft="$3">
          <Text fontSize={16} fontWeight="600" color="$textPrimary">
            @{user.username}
          </Text>
          {user.display_name && (
            <Text fontSize={14} color="$textSecondary">
              {user.display_name}
            </Text>
          )}
          {user.bio && (
            <Text fontSize={12} color="$textSecondary" numberOfLines={1} marginTop="$0.5">
              {user.bio}
            </Text>
          )}
        </View>

        <Text fontSize={16} color="$textSecondary">
          →
        </Text>
      </View>
    </Pressable>
  );
};
