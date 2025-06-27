import React from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView, RefreshControl, Pressable, StyleSheet } from 'react-native';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/theme';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

function NotificationsContent() {
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
      <View style={styles.container}>
        <ScreenHeader title="Notifications" />
        <View flex={1} justifyContent="center" alignItems="center">
          <Text fontSize={16} color="$textSecondary">
            Loading notifications...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Notifications" />

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

      <View style={styles.contentContainer}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
          }
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {notifications.length === 0 ? (
            <View flex={1} justifyContent="center" alignItems="center" paddingVertical="$8">
              <Text fontSize={18} color="$textSecondary" marginBottom="$2">
                No notifications yet
              </Text>
              <Text fontSize={14} color="$textSecondary" textAlign="center" paddingHorizontal="$4">
                You&apos;ll see notifications here when someone interacts with your picks
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
    </View>
  );
}

export default function NotificationsScreen() {
  return (
    <ErrorBoundary level="tab">
      <NotificationsContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
