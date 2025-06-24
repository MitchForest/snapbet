import React from 'react';
import { View, Text } from '@tamagui/core';
import { FlatList, ActivityIndicator } from 'react-native';
import { UserListItem } from '@/components/common/UserListItem';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useUserList } from '@/hooks/useUserList';
import { Colors } from '@/theme';

export default function FollowersScreen() {
  const { users: followers, loading: isLoading } = useUserList({ type: 'followers' });

  if (isLoading) {
    return (
      <View flex={1} backgroundColor={Colors.background}>
        <ScreenHeader title="Followers" />
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor={Colors.background}>
      <ScreenHeader title="Followers" />

      <FlatList
        data={followers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UserListItem user={item} onPress={() => {}} />}
        ListEmptyComponent={
          <View flex={1} justifyContent="center" alignItems="center" paddingVertical="$8">
            <Text fontSize={16} color="$textSecondary">
              No followers yet
            </Text>
          </View>
        }
        // eslint-disable-next-line react-native/no-inline-styles
        contentContainerStyle={followers.length === 0 ? { flex: 1 } : undefined}
      />
    </View>
  );
}
