import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable } from 'react-native';
import { Notification, notificationService } from '@/services/notifications/notificationService';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}
export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
  const { title, body } = notificationService.getNotificationText(notification);
  const timeAgo = formatDistanceToNow(new Date(notification.created_at));

  const getIcon = () => {
    switch (notification.type) {
      case 'tail':
        return '👆';
      case 'fade':
        return '👎';
      case 'bet_won':
      case 'tail_won':
      case 'fade_won':
        return '✅';
      case 'bet_lost':
      case 'tail_lost':
      case 'fade_lost':
        return '❌';
      case 'follow':
        return '👤';
      case 'message':
        return '💬';
      case 'mention':
        return '@';
      case 'milestone':
        return '🏆';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  return (
    <Pressable onPress={onPress}>
      <View
        flexDirection="row"
        paddingVertical="$3"
        paddingHorizontal="$4"
        backgroundColor={notification.read ? '$background' : '$surfaceAlt'}
        borderBottomWidth={1}
        borderBottomColor="$divider"
      >
        <Text fontSize={24} marginRight="$3">
          {getIcon()}
        </Text>

        <View flex={1}>
          <Text fontSize={15} color="$textPrimary" fontWeight="600" marginBottom="$0.5">
            {title}
          </Text>
          <Text fontSize={14} color="$textSecondary" numberOfLines={2}>
            {body}
          </Text>
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
