import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, Text } from '@tamagui/core';
import {
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  ViewToken,
  Alert,
  AlertButton,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ChatBubble } from '@/components/messaging/ChatBubble';
import { MessageInput } from '@/components/messaging/MessageInput';
import { MentionInput } from '@/components/messaging/MentionInput';
import { TypingIndicator } from '@/components/messaging/TypingIndicator';
import { useMessages } from '@/hooks/useMessages';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useReadReceipts } from '@/hooks/useReadReceipts';
import { useChatDetails } from '@/hooks/useChatDetails';
import { useGroupMembers } from '@/hooks/useGroupMembers';
import { Message, GroupMember } from '@/types/messaging';
import { useAuthStore } from '@/stores/authStore';
import { groupService } from '@/services/messaging/groupService';
import { blockService } from '@/services/moderation/blockService';

// Mention-enabled message input wrapper
const MentionMessageInput: React.FC<{
  chatId: string;
  onSendMessage: (content: { text?: string; mediaUrl?: string }) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  chatExpiration: number;
  members: GroupMember[];
}> = ({ chatId: _chatId, onSendMessage, onTyping, chatExpiration, members }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    // Extract mentions from the message
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(message)) !== null) {
      mentions.push(match[1]);
    }

    // For now, just send the text with mentions embedded
    // The backend will need to be updated to extract and store mentions
    await onSendMessage({
      text: message.trim(),
    });

    setMessage('');
  };

  const handleMediaSelect = async (uri: string) => {
    await onSendMessage({
      mediaUrl: uri,
      text: message.trim() || undefined,
    });
    setMessage('');
  };

  const handleTypingChange = (text: string) => {
    setMessage(text);

    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      onTyping(true);
    } else if (isTyping && text.length === 0) {
      setIsTyping(false);
      onTyping(false);
    }
  };

  return (
    <MentionInput
      value={message}
      onChangeText={handleTypingChange}
      onSubmit={handleSend}
      onMediaSelect={handleMediaSelect}
      members={members}
      placeholder="Type a message..."
      chatExpiration={chatExpiration}
    />
  );
};

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
  const { handleVisibleMessagesChange } = useReadReceipts({
    chatId,
    onMessagesRead: () => {
      // Could update UI to show read status
    },
  });
  const { members } = useGroupMembers(chatId);

  // Check if this is a group chat
  const isGroupChat = chat?.chat_type === 'group';

  // Check if current user is admin
  const isAdmin = members.find((m) => m.user_id === user?.id)?.role === 'admin';

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Handle header action
  const handleHeaderAction = useCallback(() => {
    if (isGroupChat) {
      const options: AlertButton[] = [];

      if (isAdmin) {
        options.push({
          text: 'Edit Group Name',
          onPress: () => {
            Alert.prompt(
              'Edit Group Name',
              'Enter new group name:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Save',
                  onPress: async (newName) => {
                    if (newName?.trim()) {
                      await groupService.updateGroupDetails(chatId, { name: newName });
                    }
                  },
                },
              ],
              'plain-text',
              chat?.name || ''
            );
          },
        });
      }

      options.push({
        text: 'Leave Group',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Leave',
              style: 'destructive',
              onPress: async () => {
                const success = await groupService.removeGroupMember(chatId, user?.id || '');
                if (success) {
                  router.back();
                }
              },
            },
          ]);
        },
      });

      if (isAdmin) {
        options.push({
          text: 'Delete Group',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Group',
              'Are you sure you want to delete this group? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    const success = await groupService.deleteGroup(chatId);
                    if (success) {
                      router.back();
                    }
                  },
                },
              ]
            );
          },
        });
      }

      options.push({ text: 'Cancel', style: 'cancel' });

      Alert.alert('Group Options', undefined, options);
    } else {
      Alert.alert('Chat Options', undefined, [
        {
          text: 'Block User',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Block User', 'Are you sure you want to block this user?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Block',
                style: 'destructive',
                onPress: async () => {
                  if (otherUser?.id) {
                    const success = await blockService.blockUser(otherUser.id);
                    if (success) {
                      router.back();
                    }
                  }
                },
              },
            ]);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }, [isGroupChat, isAdmin, chat, chatId, user?.id, otherUser?.id, router]);

  // Handle visible items change for read receipts
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const visibleMessageIds = viewableItems
        .filter((item) => item.isViewable && item.item)
        .map((item) => item.item.id);

      if (visibleMessageIds.length > 0) {
        handleVisibleMessagesChange(visibleMessageIds, messages);
      }
    },
    [handleVisibleMessagesChange, messages]
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 500,
  }).current;

  // Render message item
  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isOwn = item.sender_id === user?.id;
      const showAvatar =
        !isOwn && (index === 0 || messages[index - 1]?.sender_id !== item.sender_id);

      const messageStyle = [
        styles.messageContainer,
        isOwn ? styles.messageContainerOwn : styles.messageContainerOther,
      ];

      return (
        <View
          key={item.id}
          data-message-id={item.id}
          data-sender-id={item.sender_id}
          style={messageStyle}
        >
          <ChatBubble
            message={item}
            isOwn={isOwn}
            showAvatar={showAvatar}
            showSenderName={isGroupChat}
            chatType={isGroupChat ? 'group' : 'dm'}
            onResend={() => resendMessage(item.id)}
            onLongPress={() => {
              // Future: Show action menu
            }}
          />
        </View>
      );
    },
    [user?.id, messages, resendMessage, isGroupChat]
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

  if (!chat || (!isGroupChat && !otherUser)) {
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

  const chatTitle = isGroupChat ? chat.name || 'Group Chat' : otherUser?.username || 'Chat';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={insets.top}
    >
      <View flex={1} backgroundColor={Colors.background}>
        <ScreenHeader
          title={chatTitle}
          onBack={handleBack}
          rightAction={
            <Pressable onPress={handleHeaderAction}>
              <Text fontSize="$6">⋯</Text>
            </Pressable>
          }
        />

        {/* Group member count below header */}
        {isGroupChat && members.length > 0 && (
          <View paddingHorizontal="$4" paddingVertical="$1" backgroundColor={Colors.surface}>
            <Text fontSize="$3" color={Colors.text.tertiary}>
              {members.length} members
            </Text>
          </View>
        )}

        {/* Typing indicator below header if active */}
        {typingUsers.length > 0 && (
          <View paddingHorizontal="$4" paddingVertical="$1" backgroundColor={Colors.surface}>
            <Text fontSize="$3" color={Colors.text.tertiary} fontStyle="italic">
              {isGroupChat && typingUsers[0]?.username
                ? `${typingUsers[0].username} is typing...`
                : 'typing...'}
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
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
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
                    {isGroupChat ? 'Start the conversation! 💬' : 'Say hello! 👋'}
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

        {/* Message input - use MentionInput for groups */}
        {isGroupChat ? (
          <MentionMessageInput
            chatId={chatId}
            onSendMessage={sendMessage}
            onTyping={setTyping}
            chatExpiration={(chat.settings?.expiration_hours as number) || 24}
            members={members}
          />
        ) : (
          <MessageInput
            onSendMessage={sendMessage}
            onTyping={setTyping}
            chatExpiration={(chat.settings?.expiration_hours as number) || 24}
          />
        )}
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
    paddingHorizontal: 12,
  },
  messageContainer: {
    marginBottom: 8,
  },
  messageContainerOwn: {
    alignItems: 'flex-end',
  },
  messageContainerOther: {
    alignItems: 'flex-start',
  },
});
