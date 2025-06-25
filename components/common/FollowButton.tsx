import React, { useState } from 'react';
import { Text } from '@tamagui/core';
import { Pressable, ActivityIndicator } from 'react-native';
import { Colors } from '@/theme';
import { followUser, unfollowUser } from '@/services/api/followUser';
import { toastService } from '@/services/toastService';

interface FollowButtonProps {
  userId: string;
  isFollowing?: boolean;
  size?: 'small' | 'medium' | 'large';
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  userId,
  isFollowing: initialIsFollowing = false,
  size = 'small',
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (isLoading) return;

    const newFollowState = !isFollowing;

    // Optimistic update
    setIsFollowing(newFollowState);
    onFollowChange?.(newFollowState);
    setIsLoading(true);

    try {
      if (newFollowState) {
        await followUser(userId);
      } else {
        await unfollowUser(userId);
      }
    } catch {
      // Revert on error
      setIsFollowing(!newFollowState);
      onFollowChange?.(!newFollowState);

      toastService.show({
        message: newFollowState ? "Couldn't follow user" : "Couldn't unfollow user",
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'large':
        return { height: 44, paddingHorizontal: 20, fontSize: 16 };
      case 'medium':
        return { height: 36, paddingHorizontal: 16, fontSize: 14 };
      case 'small':
      default:
        return { height: 28, paddingHorizontal: 12, fontSize: 12 };
    }
  };

  const buttonSize = getButtonSize();

  return (
    <Pressable
      onPress={handlePress}
      disabled={isLoading}
      style={{
        backgroundColor: isFollowing ? Colors.surface : Colors.primary,
        borderWidth: isFollowing ? 1 : 0,
        borderColor: Colors.border.default,
        height: buttonSize.height,
        paddingHorizontal: buttonSize.paddingHorizontal,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isLoading ? 0.8 : 1,
      }}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={isFollowing ? Colors.text.primary : Colors.background}
        />
      ) : (
        <Text
          fontSize={buttonSize.fontSize}
          fontWeight="600"
          color={isFollowing ? '$textPrimary' : '$textInverse'}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      )}
    </Pressable>
  );
}
