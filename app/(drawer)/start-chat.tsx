import React, { useState, useEffect, useCallback } from 'react';
import { View, Text } from '@tamagui/core';
import {
  TextInput,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Avatar } from '@/components/common/Avatar';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { chatService } from '@/services/messaging/chatService';
import { Colors } from '@/theme';

interface User {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export default function StartChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentUser = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { blockedUserIds } = useBlockedUsers();

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data } = await supabase
          .from('users')
          .select('id, username, display_name, avatar_url')
          .ilike('username', `%${searchQuery}%`)
          .not('id', 'eq', currentUser?.id)
          .not('id', 'in', `(${blockedUserIds.join(',')})`)
          .limit(20);

        if (data) {
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

  // Start chat with user
  const handleStartChat = useCallback(
    async (user: User) => {
      if (isCreating) return;

      setIsCreating(true);
      try {
        const chatId = await chatService.getOrCreateDMChat(currentUser?.id || '', user.id);
        if (chatId) {
          router.replace(`/chat/${chatId}`);
        }
      } catch (error) {
        console.error('Failed to start chat:', error);
      } finally {
        setIsCreating(false);
      }
    },
    [isCreating, currentUser?.id, router]
  );

  // Render user item
  const renderUser = useCallback(
    ({ item }: { item: User }) => {
      return (
        <Pressable
          onPress={() => handleStartChat(item)}
          style={({ pressed }) => [styles.userItem, pressed && styles.userItemPressed]}
          disabled={isCreating}
        >
          <Avatar
            src={item.avatar_url || undefined}
            fallback={item.username[0].toUpperCase()}
            size={48}
          />
          <View flex={1} marginLeft="$3">
            <Text fontSize="$4" fontWeight="600">
              {item.display_name || item.username}
            </Text>
            <Text fontSize="$3" color="$gray11">
              @{item.username}
            </Text>
          </View>
          <Text fontSize="$5" color="$gray11">
            →
          </Text>
        </Pressable>
      );
    },
    [isCreating, handleStartChat]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View flex={1} backgroundColor="$background">
        {/* Header */}
        <View
          paddingTop={insets.top}
          paddingHorizontal="$4"
          paddingBottom="$3"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
          backgroundColor="$background"
        >
          <Pressable onPress={() => router.back()}>
            <Text fontSize="$4" color="$primary">
              Cancel
            </Text>
          </Pressable>
          <Text fontSize="$5" fontWeight="600">
            New Message
          </Text>
          <View width={60} />
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
            To:
          </Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a user..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.gray[400]}
            autoFocus
          />
        </View>

        {/* Results */}
        {searchQuery.trim() ? (
          searchResults.length === 0 ? (
            <View flex={1} justifyContent="center" alignItems="center" padding="$4">
              <Text fontSize="$4" color="$gray11" textAlign="center">
                {isSearching ? 'Searching...' : 'No users found'}
              </Text>
            </View>
          ) : (
            <FlashList
              data={searchResults}
              renderItem={renderUser}
              keyExtractor={(item) => item.id}
              estimatedItemSize={72}
              showsVerticalScrollIndicator={false}
            />
          )
        ) : (
          <View flex={1} justifyContent="center" alignItems="center" padding="$4">
            <Text fontSize="$8" marginBottom="$3">
              💬
            </Text>
            <Text fontSize="$4" color="$gray11" textAlign="center">
              Search for a user to start a conversation
            </Text>
          </View>
        )}

        {isCreating && (
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userItemPressed: {
    backgroundColor: Colors.gray[100],
  },
});
