import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/common/Avatar';
import { Notification, notificationService } from '@/services/notifications/notificationService';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
  const router = useRouter();
  const { title, body } = notificationService.getNotificationText(notification);
  const timeAgo = formatDistanceToNow(new Date(notification.created_at));

  const handlePress = () => {
    // Mark as read
    onPress();

    // Navigate based on notification type
    const { type, data } = notification;

    switch (type) {
      case 'tail':
      case 'fade':
      case 'bet_won':
      case 'bet_lost':
      case 'tail_won':
      case 'tail_lost':
      case 'fade_won':
      case 'fade_lost':
        // Navigate to the related post if available
        if (data.postId) {
          router.push(`/post/${data.postId}`);
        }
        break;

      case 'follow':
      case 'mention':
        // Navigate to the actor's profile
        if (data.actorUsername) {
          router.push(`/profile/${data.actorUsername}`);
        }
        break;

      case 'follow_request':
        // Navigate to follow requests page
        router.push('/follow-requests');
        break;

      case 'message':
        // Navigate to the chat
        if (data.chatId) {
          router.push(`/chat/${data.chatId}`);
        }
        break;

      case 'milestone':
        // Navigate to user's own profile to see badges
        router.push('/profile');
        break;

      default:
        // No specific navigation for system notifications
        break;
    }
  };

  // Get avatar props based on notification type
  const getAvatarProps = () => {
    const { data } = notification;

    // For notifications with actor info
    if (data.actorUsername) {
      return {
        src: data.actorAvatarUrl || undefined,
        username: data.actorUsername,
        fallback: data.actorUsername[0]?.toUpperCase() || '?',
      };
    }

    // For follow notifications
    if (data.followerUsername) {
      return {
        src: data.followerAvatarUrl || undefined,
        username: data.followerUsername,
        fallback: data.followerUsername[0]?.toUpperCase() || '?',
      };
    }

    // For follow request notifications
    if (data.requesterUsername) {
      return {
        src: data.requesterAvatarUrl || undefined,
        username: data.requesterUsername,
        fallback: data.requesterUsername[0]?.toUpperCase() || '?',
      };
    }

    // For message notifications
    if (data.senderUsername) {
      return {
        src: data.senderAvatarUrl || undefined,
        username: data.senderUsername,
        fallback: data.senderUsername[0]?.toUpperCase() || '?',
      };
    }

    // For system notifications or milestones, show an emoji icon
    return null;
  };

  const getSystemIcon = () => {
    switch (notification.type) {
      case 'bet_won':
      case 'tail_won':
      case 'fade_won':
        return '✅';
      case 'bet_lost':
      case 'tail_lost':
      case 'fade_lost':
        return '❌';
      case 'milestone':
        return '🏆';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  // Make usernames clickable in the body text
  const renderBody = () => {
    const usernamePattern = /@(\w+)/g;
    const parts = body.split(usernamePattern);

    if (parts.length === 1) {
      return (
        <Text fontSize={14} color="$textSecondary" numberOfLines={2}>
          {body}
        </Text>
      );
    }

    return (
      <Text fontSize={14} color="$textSecondary" numberOfLines={2}>
        {parts.map((part, index) => {
          // Check if this part is a username (odd indices after split)
          if (index % 2 === 1) {
            return (
              <Text
                key={index}
                color="$primary"
                fontWeight="600"
                onPress={(e) => {
                  e.stopPropagation();
                  router.push(`/profile/${part}`);
                }}
              >
                @{part}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  const avatarProps = getAvatarProps();

  return (
    <Pressable onPress={handlePress}>
      <View
        flexDirection="row"
        paddingVertical="$3"
        paddingHorizontal="$4"
        backgroundColor={notification.read ? '$background' : '$surfaceAlt'}
        borderBottomWidth={1}
        borderBottomColor="$divider"
      >
        {/* Show avatar or system icon */}
        {avatarProps ? (
          <Avatar
            size={40}
            src={avatarProps.src}
            username={avatarProps.username}
            fallback={avatarProps.fallback}
            marginRight="$3"
          />
        ) : (
          <View
            width={40}
            height={40}
            borderRadius="$round"
            backgroundColor="$surfaceAlt"
            justifyContent="center"
            alignItems="center"
            marginRight="$3"
          >
            <Text fontSize={20}>{getSystemIcon()}</Text>
          </View>
        )}

        <View flex={1}>
          <Text fontSize={15} color="$textPrimary" fontWeight="600" marginBottom="$0.5">
            {title}
          </Text>
          {renderBody()}
          <Text fontSize={12} color="$textTertiary" marginTop="$1">
            {timeAgo}
          </Text>
        </View>

        {!notification.read && (
          <View
            width={8}
            height={8}
            borderRadius="$round"
            backgroundColor="$primary"
            alignSelf="center"
          />
        )}
      </View>
    </Pressable>
  );
};

// Simple date formatting utility
function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
}
