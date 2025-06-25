import React, { useState, useEffect } from 'react';
import { View, Text } from '@tamagui/core';
import { FlatList, ActivityIndicator, TextInput } from 'react-native';
import { UserListItem } from '@/components/common/UserListItem';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useUserList } from '@/hooks/useUserList';
import { Colors } from '@/theme';

const SEARCH_TRIGGER = 20;

export default function FollowingScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const {
    filteredUsers: following,
    loading: isLoading,
    mutualFollows,
    totalCount,
  } = useUserList({ type: 'following', searchQuery: debouncedQuery });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const showSearch = totalCount > SEARCH_TRIGGER;

  if (isLoading && !searchQuery) {
    return (
      <View flex={1} backgroundColor={Colors.background}>
        <ScreenHeader title="Following" />
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor={Colors.background}>
      <ScreenHeader title="Following" />

      {showSearch && (
        <View paddingHorizontal="$4" paddingVertical="$3" backgroundColor="$surface">
          <View
            backgroundColor="$background"
            borderRadius="$2"
            paddingHorizontal="$3"
            paddingVertical="$2"
          >
            <TextInput
              placeholder="Search following..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                fontSize: 14,
                color: Colors.text.primary,
                padding: 0,
              }}
              placeholderTextColor={Colors.gray[500]}
            />
          </View>
        </View>
      )}

      <FlatList
        data={following}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserListItem
            user={item}
            isMutual={mutualFollows.get(item.id) || false}
            showRemoveFollower={false}
          />
        )}
        ListEmptyComponent={
          <View flex={1} justifyContent="center" alignItems="center" paddingVertical="$8">
            <Text fontSize={16} color="$textSecondary">
              {searchQuery ? 'No users found' : "You're not following anyone yet"}
            </Text>
          </View>
        }
        // eslint-disable-next-line react-native/no-inline-styles
        contentContainerStyle={following.length === 0 ? { flex: 1 } : undefined}
      />
    </View>
  );
}
