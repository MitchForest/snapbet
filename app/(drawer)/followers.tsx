import React, { useState, useCallback, useEffect } from 'react';
import { View, Text } from '@tamagui/core';
import { FlatList, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import { UserListItem } from '@/components/common/UserListItem';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useUserList } from '@/hooks/useUserList';
import { Colors } from '@/theme';

const SEARCH_TRIGGER = 20;

export default function FollowersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const {
    filteredUsers: followers,
    loading: isLoading,
    mutualFollows,
    totalCount,
    refetch,
  } = useUserList({ type: 'followers', searchQuery: debouncedQuery });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRemoveFollower = useCallback(() => {
    // Refetch the list after removing a follower
    refetch();
  }, [refetch]);

  const showSearch = totalCount > SEARCH_TRIGGER;

  if (isLoading && !searchQuery) {
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

      {showSearch && (
        <View paddingHorizontal="$4" paddingVertical="$3" backgroundColor="$surface">
          <View
            backgroundColor="$background"
            borderRadius="$2"
            paddingHorizontal="$3"
            paddingVertical="$2"
          >
            <TextInput
              placeholder="Search followers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor={Colors.gray[500]}
            />
          </View>
        </View>
      )}

      <FlatList
        data={followers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserListItem
            user={item}
            isMutual={mutualFollows.get(item.id) || false}
            showRemoveFollower={true}
            onRemoved={handleRemoveFollower}
          />
        )}
        ListEmptyComponent={
          <View flex={1} justifyContent="center" alignItems="center" paddingVertical="$8">
            <Text fontSize={16} color="$textSecondary">
              {searchQuery ? 'No followers found' : 'No followers yet'}
            </Text>
          </View>
        }
        contentContainerStyle={followers.length === 0 ? styles.emptyContainer : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    fontSize: 14,
    color: Colors.text.primary,
    padding: 0,
  },
  emptyContainer: {
    flex: 1,
  },
});
