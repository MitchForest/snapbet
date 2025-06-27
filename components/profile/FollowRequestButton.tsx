import React, { useState, useEffect } from 'react';
import { Pressable, ActivityIndicator } from 'react-native';
import { View, Text } from '@tamagui/core';
import { Colors } from '@/theme';
import { useFollowState } from '@/hooks/useFollowState';
import { followRequestService } from '@/services/social/followRequestService';
import { toastService } from '@/services/toastService';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase/client';

interface FollowRequestButtonProps {
  targetUserId: string;
  isOwnProfile?: boolean;
  isPrivate?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export const FollowRequestButton: React.FC<FollowRequestButtonProps> = ({
  targetUserId,
  isOwnProfile = false,
  isPrivate = false,
  onFollowChange,
}) => {
  const currentUser = useAuthStore((state) => state.user);
  const { isFollowing, isPending, toggleFollow } = useFollowState(targetUserId, { onFollowChange });
  const [isLoading, setIsLoading] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState<{
    id: string;
    requester_id: string | null;
  } | null>(null);

  // Check if there's an incoming request from this user
  useEffect(() => {
    const checkIncomingRequest = async () => {
      if (!currentUser?.id || isOwnProfile) return;

      const { data } = await supabase
        .from('follow_requests')
        .select('id, requester_id')
        .eq('requester_id', targetUserId)
        .eq('requested_id', currentUser.id)
        .eq('status', 'pending')
        .single();

      setIncomingRequest(data);
    };

    checkIncomingRequest();
  }, [currentUser?.id, targetUserId, isOwnProfile]);

  if (isOwnProfile) {
    return null;
  }

  const handlePress = async () => {
    setIsLoading(true);

    try {
      await toggleFollow();

      if (isPending && !isFollowing) {
        toastService.show({
          message: 'Follow request sent',
          type: 'success',
        });
      }
    } catch {
      toastService.show({
        message: 'An error occurred',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!incomingRequest) return;

    setIsLoading(true);
    try {
      const result = await followRequestService.handleFollowRequest(incomingRequest.id, 'accept');
      if (result.success) {
        toastService.show({
          message: 'Follow request accepted',
          type: 'success',
        });
        setIncomingRequest(null);
      } else {
        toastService.show({
          message: result.error || 'Failed to accept request',
          type: 'error',
        });
      }
    } catch {
      toastService.show({
        message: 'An error occurred',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!incomingRequest) return;

    setIsLoading(true);
    try {
      const result = await followRequestService.handleFollowRequest(incomingRequest.id, 'reject');
      if (result.success) {
        toastService.show({
          message: 'Follow request rejected',
          type: 'success',
        });
        setIncomingRequest(null);
      } else {
        toastService.show({
          message: result.error || 'Failed to reject request',
          type: 'error',
        });
      }
    } catch {
      toastService.show({
        message: 'An error occurred',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If there's an incoming request from this user, show accept/reject buttons
  if (incomingRequest) {
    return (
      <View flexDirection="row" gap="$2">
        <Pressable onPress={handleAcceptRequest} disabled={isLoading}>
          <View
            backgroundColor={Colors.primary}
            paddingHorizontal="$4"
            paddingVertical="$2"
            borderRadius={20}
            opacity={isLoading ? 0.6 : 1}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text fontSize={14} fontWeight="600" color={Colors.white}>
                Accept
              </Text>
            )}
          </View>
        </Pressable>
        <Pressable onPress={handleRejectRequest} disabled={isLoading}>
          <View
            backgroundColor={Colors.border.default}
            paddingHorizontal="$4"
            paddingVertical="$2"
            borderRadius={20}
            opacity={isLoading ? 0.6 : 1}
          >
            <Text fontSize={14} fontWeight="600" color="$textPrimary">
              Reject
            </Text>
          </View>
        </Pressable>
      </View>
    );
  }

  // Determine button state and text
  let buttonText = 'Follow';
  let buttonBg: string = Colors.primary;
  let textColor: string = Colors.white;

  if (isFollowing) {
    buttonText = 'Following';
    buttonBg = Colors.border.default;
    textColor = '$textPrimary';
  } else if (isPending) {
    buttonText = 'Requested';
    buttonBg = Colors.border.default;
    textColor = '$textSecondary';
  } else if (isPrivate) {
    buttonText = 'Request';
  }

  return (
    <Pressable onPress={handlePress} disabled={isLoading || isPending}>
      <View
        backgroundColor={buttonBg}
        paddingHorizontal="$5"
        paddingVertical="$2"
        borderRadius={20}
        opacity={isLoading || isPending ? 0.6 : 1}
        borderWidth={isFollowing ? 1 : 0}
        borderColor={isFollowing ? Colors.border.light : 'transparent'}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={isFollowing ? Colors.text.primary : Colors.white}
          />
        ) : (
          <Text fontSize={14} fontWeight="600" color={textColor}>
            {buttonText}
          </Text>
        )}
      </View>
    </Pressable>
  );
};
