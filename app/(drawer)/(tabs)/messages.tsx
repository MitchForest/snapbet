import React, { useCallback, useMemo, useState } from 'react';
import { View, Text } from '@tamagui/core';
import { RefreshControl, Pressable, StyleSheet, Modal } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useChats } from '@/hooks/useChats';
import { useChatSearch } from '@/hooks/useChatSearch';
import { ChatListItem } from '@/components/messaging/ChatListItem';
import { ChatListSkeleton } from '@/components/messaging/ChatListSkeleton';
import { EmptyChats } from '@/components/messaging/EmptyChats';
import { ChatSearch } from '@/components/messaging/ChatSearch';
import { ConnectionStatus } from '@/components/messaging/ConnectionStatus';
import { ChatWithDetails } from '@/types/messaging';
import { Colors } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

const MENU_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.5)';

export default function MessagesScreen() {
  const router = useRouter();
  const [showNewChatMenu, setShowNewChatMenu] = useState(false);
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

  // Create new group
  const handleCreateGroup = useCallback(() => {
    router.push('/create-group');
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
      <ConnectionStatus />
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

      {/* Floating Action Button */}
      <Pressable onPress={() => setShowNewChatMenu(true)} style={styles.fab}>
        <Ionicons name="add" size={28} color="white" />
      </Pressable>

      {/* New Chat Menu */}
      <Modal
        visible={showNewChatMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewChatMenu(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setShowNewChatMenu(false)}>
          <View style={styles.menuContainer}>
            <Pressable
              style={styles.menuOption}
              onPress={() => {
                setShowNewChatMenu(false);
                handleStartChat();
              }}
            >
              <View style={styles.menuIcon}>
                <Text fontSize={20}>💬</Text>
              </View>
              <Text style={styles.menuText}>New Chat</Text>
            </Pressable>

            <Pressable
              style={styles.menuOption}
              onPress={() => {
                setShowNewChatMenu(false);
                handleCreateGroup();
              }}
            >
              <View style={styles.menuIcon}>
                <Text fontSize={20}>👥</Text>
              </View>
              <Text style={styles.menuText}>New Group</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: MENU_OVERLAY_COLOR,
    justifyContent: 'flex-end',
    paddingBottom: 100,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 150,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
});
