import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Avatar } from '@/components/common/Avatar';
import { MutualFollowBadge } from '@/components/common/MutualFollowBadge';
import { followService } from '@/services/social/followService';
import { toastService } from '@/services/toastService';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/theme';

interface UserListItemProps {
  user: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
  };
  showStats?: boolean;
  isMutual?: boolean;
  showRemoveFollower?: boolean;
  onPress?: () => void;
  onRemoved?: () => void;
}

export const UserListItem: React.FC<UserListItemProps> = ({
  user,
  isMutual = false,
  showRemoveFollower = false,
  onPress,
  onRemoved,
}) => {
  const currentUser = useAuthStore((state) => state.user);
  const isOwnProfile = currentUser?.id === user.id;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/profile/${user.username}`);
    }
  };

  const handleRemoveFollower = () => {
    Alert.alert(
      'Remove Follower',
      `@${user.username} will no longer be able to see your private content`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const result = await followService.removeFollower(user.id);
            if (result.success) {
              toastService.show({
                message: `Removed @${user.username} from followers`,
                type: 'success',
              });
              onRemoved?.();
            } else {
              toastService.show({
                message: result.error || "Couldn't remove follower",
                type: 'error',
              });
            }
          },
        },
      ]
    );
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
          <View flexDirection="row" alignItems="center" gap="$2">
            <Text fontSize={16} fontWeight="600" color="$textPrimary">
              @{user.username}
            </Text>
            {isMutual && !isOwnProfile && <MutualFollowBadge size="small" />}
          </View>
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

        {showRemoveFollower && !isOwnProfile ? (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              handleRemoveFollower();
            }}
            style={styles.removeButton}
          >
            <Text fontSize={14} color={Colors.loss} fontWeight="500">
              Remove
            </Text>
          </Pressable>
        ) : (
          <Text fontSize={16} color="$textSecondary">
            →
          </Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
