import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable, StyleSheet } from 'react-native';
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
        // Navigate to the feed to see the related post
        // TODO: When post detail page is implemented, navigate to `/post/${data.postId}`
        router.push('/(drawer)/(tabs)');
        break;

      case 'follow':
      case 'mention':
        // Navigate to the actor's profile
        if (data.actorUsername) {
          router.push(`/(drawer)/profile/${data.actorUsername}`);
        }
        break;

      case 'follow_request':
        // Navigate to follow requests page
        router.push('/(drawer)/follow-requests');
        break;

      case 'message':
        // Navigate to the chat
        if (data.chatId) {
          router.push(`/(drawer)/chat/${data.chatId}`);
        }
        break;

      case 'milestone':
        // Navigate to user's own profile to see badges
        router.push('/(drawer)/profile');
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

  // Enhanced clickable text rendering
  const renderClickableText = (text: string, isTitle = false) => {
    // Pattern to match various clickable elements
    const patterns = {
      username: /@(\w+)/g,
      pick: /(your pick|their pick)/gi,
      game: /(\w+\s+vs\.?\s+\w+)/gi,
      badge: /([\w\s]+badge)/gi,
      amount: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g,
    };

    // Combined pattern for splitting
    const combinedPattern = new RegExp(
      `(${Object.values(patterns)
        .map((p) => p.source)
        .join('|')})`,
      'gi'
    );

    const parts = text.split(combinedPattern);

    if (parts.length === 1) {
      return (
        <Text
          fontSize={isTitle ? 15 : 14}
          color={isTitle ? '$textPrimary' : '$textSecondary'}
          fontWeight={isTitle ? '600' : '400'}
          numberOfLines={isTitle ? 1 : 2}
        >
          {text}
        </Text>
      );
    }

    return (
      <Text
        fontSize={isTitle ? 15 : 14}
        color={isTitle ? '$textPrimary' : '$textSecondary'}
        fontWeight={isTitle ? '600' : '400'}
        numberOfLines={isTitle ? 1 : 2}
      >
        {parts.map((part, index) => {
          // Skip undefined or empty parts
          if (!part) return null;

          // Check if this part is a username
          const usernameMatch = part.match(/^@(\w+)$/);
          if (usernameMatch) {
            const username = usernameMatch[1];
            return (
              <Text
                key={index}
                color="$primary"
                fontWeight="600"
                textDecorationLine="underline"
                onPress={(e) => {
                  e.stopPropagation();
                  router.push(`/(drawer)/profile/${username}`);
                }}
              >
                {part}
              </Text>
            );
          }

          // Check if this part is "your pick" or "their pick"
          if (/^(your pick|their pick)$/i.test(part)) {
            const { data } = notification;
            if (data.postId) {
              return (
                <Text
                  key={index}
                  color="$primary"
                  fontWeight="500"
                  textDecorationLine="underline"
                  onPress={(e) => {
                    e.stopPropagation();
                    // Navigate to feed for now, TODO: implement post detail page
                    router.push('/(drawer)/(tabs)');
                  }}
                >
                  {part}
                </Text>
              );
            }
          }

          // Check if this part is a game (e.g., "Lakers vs Warriors")
          const gameMatch = part.match(/^(\w+\s+vs\.?\s+\w+)$/i);
          if (gameMatch && notification.data.gameInfo) {
            return (
              <Text
                key={index}
                color="$primary"
                fontWeight="500"
                textDecorationLine="underline"
                onPress={(e) => {
                  e.stopPropagation();
                  // Navigate to games tab
                  router.push('/(drawer)/(tabs)/games');
                }}
              >
                {part}
              </Text>
            );
          }

          // Check if this part is a badge
          const badgeMatch = part.match(/^([\w\s]+badge)$/i);
          if (badgeMatch && notification.type === 'milestone') {
            return (
              <Text
                key={index}
                color="$primary"
                fontWeight="500"
                textDecorationLine="underline"
                onPress={(e) => {
                  e.stopPropagation();
                  router.push('/(drawer)/profile');
                }}
              >
                {part}
              </Text>
            );
          }

          // Regular text
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  const avatarProps = getAvatarProps();

  return (
    <Pressable onPress={handlePress} style={styles.pressable}>
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
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/(drawer)/profile/${avatarProps.username}`);
            }}
          >
            <Avatar
              size={40}
              src={avatarProps.src}
              username={avatarProps.username}
              fallback={avatarProps.fallback}
              marginRight="$3"
            />
          </Pressable>
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
          {renderClickableText(title, true)}
          {renderClickableText(body)}
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

const styles = StyleSheet.create({
  pressable: {
    // Add hover effect on web
    cursor: 'pointer',
  },
});
