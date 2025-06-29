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
  isFollowing: isFollowingProp = false,
  size = 'small',
  onFollowChange,
}: FollowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (isLoading) return;

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newFollowState = !isFollowingProp;

    // Optimistic update
    onFollowChange?.(newFollowState);
    setIsLoading(true);

    try {
      let result;
      if (newFollowState) {
        result = await followUser(userId);
      } else {
        result = await unfollowUser(userId);
      }

      // Check if the operation was successful
      if (!result.success) {
        throw new Error(result.error || 'Operation failed');
      }

      // Success haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Revert on error
      onFollowChange?.(!newFollowState);

      // Error haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : newFollowState
            ? "Couldn't follow user"
            : "Couldn't unfollow user";

      toastService.show({
        message: errorMessage,
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
    isFollowingProp ? styles.buttonFollowing : styles.buttonNotFollowing,
    isLoading && styles.buttonLoading,
  ];

  return (
    <Pressable onPress={handlePress} disabled={isLoading} style={buttonStyle}>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={isFollowingProp ? Colors.text.primary : Colors.background}
        />
      ) : (
        <Text
          fontSize={buttonSize.fontSize}
          fontWeight="600"
          color={isFollowingProp ? '$textPrimary' : '$textInverse'}
        >
          {isFollowingProp ? 'Following' : 'Follow'}
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
