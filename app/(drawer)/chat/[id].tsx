import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text } from '@tamagui/core';
import {
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ChatBubble } from '@/components/messaging/ChatBubble';
import { MessageInput } from '@/components/messaging/MessageInput';
import { TypingIndicator } from '@/components/messaging/TypingIndicator';
import { useMessages } from '@/hooks/useMessages';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useReadReceipts } from '@/hooks/useReadReceipts';
import { useChatDetails } from '@/hooks/useChatDetails';
import { Message } from '@/types/messaging';
import { useAuthStore } from '@/stores/authStore';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const listRef = useRef<FlatList>(null);
  const chatId = id || '';

  // Hooks
  const { chat, otherUser, isLoading: chatLoading } = useChatDetails({ chatId });
  const { messages, sendMessage, resendMessage, loadMore, hasMore, isLoading, isLoadingMore } =
    useMessages({ chatId });
  const { typingUsers, setTyping } = useTypingIndicator({ chatId });
  const { observeMessage } = useReadReceipts({
    chatId,
    onMessagesRead: () => {
      // Could update UI to show read status
    },
  });

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Render message item
  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isOwn = item.sender_id === user?.id;
      const showAvatar =
        !isOwn && (index === 0 || messages[index - 1]?.sender_id !== item.sender_id);

      return (
        <View
          key={item.id}
          data-message-id={item.id}
          data-sender-id={item.sender_id}
          ref={(el) => {
            if (el && !isOwn) {
              observeMessage(item.id, el as unknown as HTMLElement);
            }
          }}
        >
          <ChatBubble
            message={item}
            isOwn={isOwn}
            showAvatar={showAvatar}
            onResend={() => resendMessage(item.id)}
            onLongPress={() => {
              // Future: Show action menu
            }}
          />
        </View>
      );
    },
    [user?.id, messages, observeMessage, resendMessage]
  );

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && messages[0].sender_id === user?.id) {
      setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [messages, user?.id]);

  if (chatLoading) {
    return (
      <View flex={1} backgroundColor={Colors.background}>
        <ScreenHeader title="Loading..." />
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (!chat || !otherUser) {
    return (
      <View flex={1} backgroundColor={Colors.background}>
        <ScreenHeader title="Chat" onBack={handleBack} />
        <View flex={1} justifyContent="center" alignItems="center">
          <Text fontSize="$5" color={Colors.text.secondary}>
            Chat not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={insets.top}
    >
      <View flex={1} backgroundColor={Colors.background}>
        <ScreenHeader
          title={otherUser.username}
          onBack={handleBack}
          rightAction={
            <Pressable
              onPress={() => {
                // Future: Navigate to chat settings
              }}
            >
              <Text fontSize="$6">⋯</Text>
            </Pressable>
          }
        />

        {/* Typing indicator below header if active */}
        {typingUsers.length > 0 && (
          <View paddingHorizontal="$4" paddingVertical="$1" backgroundColor={Colors.surface}>
            <Text fontSize="$3" color={Colors.text.tertiary} fontStyle="italic">
              typing...
            </Text>
          </View>
        )}

        {/* Messages list */}
        <View flex={1}>
          <FlatList
            ref={listRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            inverted
            contentContainerStyle={styles.messagesContent}
            onEndReached={() => {
              if (hasMore && !isLoadingMore) {
                loadMore();
              }
            }}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              isLoading ? (
                <View paddingVertical="$8" alignItems="center">
                  <ActivityIndicator size="small" color={Colors.gray[400]} />
                </View>
              ) : (
                <View paddingVertical="$8" alignItems="center">
                  <Text fontSize="$4" color={Colors.text.tertiary}>
                    No messages yet
                  </Text>
                  <Text fontSize="$3" color={Colors.text.tertiary} marginTop="$2">
                    Say hello! 👋
                  </Text>
                </View>
              )
            }
            ListFooterComponent={
              isLoadingMore ? (
                <View paddingVertical="$4" alignItems="center">
                  <ActivityIndicator size="small" color={Colors.gray[400]} />
                </View>
              ) : null
            }
          />

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <View paddingTop="$4" paddingBottom="$2" paddingHorizontal="$4">
              <TypingIndicator users={typingUsers} />
            </View>
          )}
        </View>

        {/* Message input */}
        <MessageInput onSendMessage={sendMessage} onTyping={setTyping} chatExpiration={24} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContent: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
});
