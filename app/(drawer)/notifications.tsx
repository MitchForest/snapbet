import React from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView, RefreshControl, Pressable } from 'react-native';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';

export default function NotificationsScreen() {
  const { notifications, isLoading, markAsRead, markAllAsRead, refetch } = useNotifications();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  if (isLoading && notifications.length === 0) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Text fontSize={16} color="$textSecondary">
          Loading notifications...
        </Text>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor="$background">
      {notifications.length > 0 && (
        <View
          paddingHorizontal="$4"
          paddingVertical="$2"
          borderBottomWidth={1}
          borderBottomColor="$divider"
        >
          <Pressable onPress={handleMarkAllRead}>
            <Text fontSize={14} color="$primary" textAlign="right">
              Mark all as read
            </Text>
          </Pressable>
        </View>
      )}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
      >
        {notifications.length === 0 ? (
          <View flex={1} justifyContent="center" alignItems="center" paddingVertical="$8">
            <Text fontSize={18} color="$textSecondary" marginBottom="$2">
              No notifications yet
            </Text>
            <Text fontSize={14} color="$textSecondary" textAlign="center" paddingHorizontal="$4">
              You'll see notifications here when someone interacts with your picks
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onPress={() => markAsRead(notification.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
