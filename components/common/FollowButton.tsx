import React, { useState } from 'react';
import { Text } from '@tamagui/core';
import { Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
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

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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

      // Success haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Revert on error
      setIsFollowing(!newFollowState);
      onFollowChange?.(!newFollowState);

      // Error haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

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

  const getSizeStyle = () => {
    switch (size) {
      case 'large':
        return styles.buttonLarge;
      case 'medium':
        return styles.buttonMedium;
      case 'small':
      default:
        return styles.buttonSmall;
    }
  };

  const buttonStyle = [
    styles.button,
    getSizeStyle(),
    isFollowing ? styles.buttonFollowing : styles.buttonNotFollowing,
    isLoading && styles.buttonLoading,
  ];

  return (
    <Pressable onPress={handlePress} disabled={isLoading} style={buttonStyle}>
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

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSmall: {
    height: 28,
    paddingHorizontal: 12,
  },
  buttonMedium: {
    height: 36,
    paddingHorizontal: 16,
  },
  buttonLarge: {
    height: 44,
    paddingHorizontal: 20,
  },
  buttonFollowing: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  buttonNotFollowing: {
    backgroundColor: Colors.primary,
    borderWidth: 0,
  },
  buttonLoading: {
    opacity: 0.8,
  },
});
