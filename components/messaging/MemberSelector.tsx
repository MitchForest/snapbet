import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text } from '@tamagui/core';
import { TextInput, ActivityIndicator, Pressable, StyleSheet, Text as RNText } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Avatar } from '@/components/common/Avatar';
import { getFollowingIds } from '@/services/api/followUser';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { Colors } from '@/theme';

const styles = StyleSheet.create({
  userItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userItemPressed: {
    backgroundColor: Colors.gray[100],
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
  checkmark: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

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

interface UserItemProps {
  user: User;
  isSelected: boolean;
  onToggle: (userId: string) => void;
}

const UserItem: React.FC<UserItemProps> = ({ user, isSelected, onToggle }) => {
  console.log(`Rendering UserItem for ${user.username}, selected: ${isSelected}`);

  return (
    <Pressable
      onPress={() => {
        console.log('UserItem pressed:', user.id);
        onToggle(user.id);
      }}
      style={({ pressed }) => [styles.userItem, pressed && styles.userItemPressed]}
    >
      <View flexDirection="row" alignItems="center" gap="$3">
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <RNText style={styles.checkmark} allowFontScaling={false}>
              ✓
            </RNText>
          )}
        </View>
        <Avatar
          src={user.avatar_url || undefined}
          fallback={user.username[0].toUpperCase()}
          size={40}
        />
        <View flex={1}>
          <Text fontSize="$4" fontWeight="600">
            {user.display_name || user.username}
          </Text>
          <Text fontSize="$3" color="$gray11">
            @{user.username}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export const MemberSelector: React.FC<MemberSelectorProps> = ({
  selectedUsers,
  onSelect,
  minMembers = 1,
  maxMembers = 49,
}) => {
  const componentId = useRef(Math.random().toString(36).substr(2, 9));
  const selectedUsersRef = useRef(selectedUsers);
  const [renderCount, setRenderCount] = useState(0);
  const currentUser = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const { blockedUserIds } = useBlockedUsers();

  // Debug logging
  useEffect(() => {
    const id = componentId.current;
    console.log(`[${id}] MemberSelector - MOUNTED`);
    return () => {
      console.log(`[${id}] MemberSelector - UNMOUNTED`);
    };
  }, []);

  useEffect(() => {
    console.log(`[${componentId.current}] MemberSelector - selectedUsers updated:`, selectedUsers);
  }, [selectedUsers]);

  // Keep ref in sync
  useEffect(() => {
    selectedUsersRef.current = selectedUsers;
  }, [selectedUsers]);

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
      console.log('=== TOGGLE USER DEBUG ===');
      console.log('userId:', userId);
      console.log('selectedUsers from ref:', selectedUsersRef.current);
      console.log('includes check:', selectedUsersRef.current.includes(userId));

      if (selectedUsersRef.current.includes(userId)) {
        const newSelection = selectedUsersRef.current.filter((id) => id !== userId);
        console.log('Removing user, new selection:', newSelection);
        onSelect(newSelection);
      } else if (selectedUsersRef.current.length < maxMembers) {
        const newSelection = [...selectedUsersRef.current, userId];
        console.log('Adding user, new selection:', newSelection);
        onSelect(newSelection);
      } else {
        console.log('Max members reached');
      }
    },
    [onSelect, maxMembers]
  );

  // Render user item
  const renderUser = useCallback(
    ({ item }: { item: User }) => {
      console.log('=== RENDERING USER ===');
      console.log('item:', item);
      console.log('selectedUsers in renderUser:', selectedUsers);

      const isSelected = selectedUsers.includes(item.id);
      const isDisabled = selectedUsers.length >= maxMembers && !isSelected;

      console.log('isSelected:', isSelected);
      console.log('isDisabled:', isDisabled);

      return <UserItem user={item} isSelected={isSelected} onToggle={toggleUser} />;
    },
    [selectedUsers, maxMembers, toggleUser]
  );

  const displayUsers = useMemo(() => {
    if (searchQuery.trim()) {
      return searchResults;
    }
    return followingUsers;
  }, [searchQuery, searchResults, followingUsers]);

  // Force re-render when selectedUsers changes
  useEffect(() => {
    console.log(`[${componentId.current}] Force re-render due to selectedUsers change`);
    setRenderCount((prev) => prev + 1);
  }, [selectedUsers]);

  if (isLoading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View flex={1}>
      {/* Show current selection */}
      <View padding="$2" backgroundColor="$yellow2">
        <Text fontSize="$2">Selected IDs: {JSON.stringify(selectedUsers)}</Text>
        <Text fontSize="$2">Render count: {renderCount}</Text>
      </View>

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
