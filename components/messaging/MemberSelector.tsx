import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text } from '@tamagui/core';
import { TextInput, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Avatar } from '@/components/common/Avatar';
import { getFollowingIds } from '@/services/api/followUser';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { Colors } from '@/theme';

interface User {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface MemberSelectorProps {
  selectedUsers: string[];
  onSelect: (users: string[]) => void;
  minMembers?: number;
  maxMembers?: number;
}

export const MemberSelector: React.FC<MemberSelectorProps> = ({
  selectedUsers,
  onSelect,
  minMembers = 1,
  maxMembers = 49,
}) => {
  const currentUser = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const { blockedUserIds } = useBlockedUsers();

  // Fetch following users on mount
  useEffect(() => {
    const fetchFollowing = async () => {
      if (!currentUser) return;

      try {
        const followingIds = await getFollowingIds();

        if (followingIds.length > 0) {
          let query = supabase
            .from('users')
            .select('id, username, display_name, avatar_url')
            .in('id', followingIds)
            .order('username');

          // Only add the not-in filter if there are blocked users
          if (blockedUserIds.length > 0) {
            query = query.not('id', 'in', `(${blockedUserIds.join(',')})`);
          }

          const { data } = await query;

          if (data) {
            // Filter out users with null usernames
            const validUsers = data.filter((user): user is User => user.username !== null);
            setFollowingUsers(validUsers);
          }
        }
      } catch (error) {
        console.error('Failed to fetch following users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowing();
  }, [currentUser, blockedUserIds]);

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        let query = supabase
          .from('users')
          .select('id, username, display_name, avatar_url')
          .ilike('username', `%${searchQuery}%`)
          .not('id', 'eq', currentUser?.id)
          .limit(20);

        // Only add the not-in filter if there are blocked users
        if (blockedUserIds.length > 0) {
          query = query.not('id', 'in', `(${blockedUserIds.join(',')})`);
        }

        const { data } = await query;

        if (data) {
          // Filter out users with null usernames
          const validUsers = data.filter((user): user is User => user.username !== null);
          setSearchResults(validUsers);
        }
      } catch (error) {
        console.error('Failed to search users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentUser, blockedUserIds]);

  // Toggle user selection
  const toggleUser = useCallback(
    (userId: string) => {
      console.log('Toggle user:', userId, 'Current selected:', selectedUsers);
      if (selectedUsers.includes(userId)) {
        onSelect(selectedUsers.filter((id) => id !== userId));
      } else if (selectedUsers.length < maxMembers) {
        onSelect([...selectedUsers, userId]);
      }
    },
    [selectedUsers, onSelect, maxMembers]
  );

  // Render user item
  const renderUser = useCallback(
    ({ item }: { item: User }) => {
      const isSelected = selectedUsers.includes(item.id);
      const isDisabled = !isSelected && selectedUsers.length >= maxMembers;

      return (
        <Pressable
          onPress={() => !isDisabled && toggleUser(item.id)}
          style={({ pressed }) => [
            styles.userItem,
            isDisabled && styles.disabledItem,
            pressed && styles.userItemPressed,
          ]}
        >
          <View flexDirection="row" alignItems="center" gap="$3">
            <View
              style={[
                styles.checkbox,
                isSelected && styles.checkboxSelected,
                isDisabled && styles.checkboxDisabled,
              ]}
            >
              {isSelected && (
                <Text style={styles.checkmark} allowFontScaling={false}>
                  ✓
                </Text>
              )}
            </View>
            <Avatar
              src={item.avatar_url || undefined}
              fallback={item.username[0].toUpperCase()}
              size={40}
            />
            <View flex={1}>
              <Text fontSize="$4" fontWeight="600">
                {item.display_name || item.username}
              </Text>
              <Text fontSize="$3" color="$gray11">
                @{item.username}
              </Text>
            </View>
          </View>
        </Pressable>
      );
    },
    [selectedUsers, maxMembers, toggleUser]
  );

  const displayUsers = useMemo(() => {
    if (searchQuery.trim()) {
      return searchResults;
    }
    return followingUsers;
  }, [searchQuery, searchResults, followingUsers]);

  if (isLoading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View flex={1}>
      {/* Search bar */}
      <View
        paddingHorizontal="$4"
        paddingVertical="$3"
        flexDirection="row"
        gap="$2"
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Text fontSize="$4" color="$gray11">
          🔍
        </Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.gray[400]}
        />
      </View>

      {/* Selection counter */}
      <View
        paddingHorizontal="$4"
        paddingVertical="$2"
        backgroundColor="$gray2"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Text fontSize="$3" color="$gray11">
          {selectedUsers.length} / {maxMembers} selected
          {selectedUsers.length < minMembers && ` (min ${minMembers})`}
        </Text>
      </View>

      {/* User list */}
      {displayUsers.length === 0 ? (
        <View flex={1} justifyContent="center" alignItems="center" padding="$4">
          <Text fontSize="$4" color="$gray11" textAlign="center">
            {searchQuery ? 'No users found' : 'Follow some users to add them to groups'}
          </Text>
        </View>
      ) : (
        <FlashList
          data={displayUsers}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          estimatedItemSize={72}
          showsVerticalScrollIndicator={false}
        />
      )}

      {isSearching && (
        <View
          position="absolute"
          top="50%"
          left="50%"
          style={{ transform: [{ translateX: -20 }, { translateY: -20 }] }}
        >
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  userItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userItemPressed: {
    backgroundColor: Colors.gray[100],
  },
  disabledItem: {
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxDisabled: {
    backgroundColor: Colors.gray[100],
    borderColor: Colors.gray[200],
  },
  checkmark: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
