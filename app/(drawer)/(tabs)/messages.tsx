import React, { useCallback, useMemo } from 'react';
import { View, Text } from '@tamagui/core';
import { RefreshControl, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useChats } from '@/hooks/useChats';
import { useChatSearch } from '@/hooks/useChatSearch';
import { ChatListItem } from '@/components/messaging/ChatListItem';
import { ChatListSkeleton } from '@/components/messaging/ChatListSkeleton';
import { EmptyChats } from '@/components/messaging/EmptyChats';
import { ChatSearch } from '@/components/messaging/ChatSearch';
import { ChatWithDetails } from '@/types/messaging';
import { Colors } from '@/theme';

export default function MessagesScreen() {
  const router = useRouter();
  const {
    chats,
    isLoading,
    refreshing,
    refetch,
    archiveChat,
    muteChat,
    isUserOnline,
    getTypingUsers,
  } = useChats();

  const { searchQuery, setSearchQuery, searchResults, clearSearch, isSearching } =
    useChatSearch(chats);

  // Navigate to individual chat
  const handleChatPress = useCallback(
    (chatId: string) => {
      router.push(`/chat/${chatId}`);
    },
    [router]
  );

  // Navigate to archived chats
  const handleArchivedPress = useCallback(() => {
    router.push('/archived-chats');
  }, [router]);

  // Start new chat
  const handleStartChat = useCallback(() => {
    router.push('/search');
  }, [router]);

  // Render individual chat item
  const renderItem = useCallback(
    ({ item }: { item: ChatWithDetails }) => (
      <ChatListItem
        chat={item}
        onPress={() => handleChatPress(item.chat_id)}
        onArchive={() => archiveChat(item.chat_id)}
        onMute={() => muteChat(item.chat_id)}
        isOnline={item.other_member_id ? isUserOnline(item.other_member_id) : false}
        typingUsers={getTypingUsers(item.chat_id)}
      />
    ),
    [handleChatPress, archiveChat, muteChat, isUserOnline, getTypingUsers]
  );

  // Key extractor
  const keyExtractor = useCallback((item: ChatWithDetails) => item.chat_id, []);

  // List footer - archived chats link
  const ListFooter = useMemo(
    () => (
      <Pressable onPress={handleArchivedPress}>
        <View
          paddingVertical="$4"
          paddingHorizontal="$4"
          alignItems="center"
          borderTopWidth={1}
          borderTopColor="$border"
        >
          <Text fontSize="$3" color="$primary">
            View Archived Chats
          </Text>
        </View>
      </Pressable>
    ),
    [handleArchivedPress]
  );

  // Show loading skeleton
  if (isLoading) {
    return <ChatListSkeleton />;
  }

  // Show empty state
  if (!isSearching && chats.length === 0) {
    return <EmptyChats onStartChat={handleStartChat} />;
  }

  return (
    <View flex={1} backgroundColor="$background">
      <ChatSearch value={searchQuery} onChangeText={setSearchQuery} onClear={clearSearch} />

      <FlashList
        data={searchResults}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={80}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          isSearching ? (
            <View flex={1} justifyContent="center" alignItems="center" paddingVertical="$8">
              <Text fontSize="$4" color="$textSecondary">
                No chats found
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={!isSearching && chats.length > 0 ? ListFooter : null}
      />
    </View>
  );
}
