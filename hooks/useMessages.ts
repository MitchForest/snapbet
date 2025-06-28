import { useState, useEffect, useCallback, useRef, useId } from 'react';
import { supabase } from '@/services/supabase';
import { messageService } from '@/services/messaging/messageService';
import { Message, MessageContent } from '@/types/messaging';
import { useAuthStore } from '@/stores/authStore';
import { realtimeManager } from '@/services/realtime/realtimeManager';
import { offlineQueue } from '@/services/realtime/offlineQueue';
import { getChatChannelName } from '@/utils/realtime/channelHelpers';
import type { Json } from '@/types/database';

// Extended message type with optimistic flag
interface OptimisticMessage extends Omit<Message, 'bet_id' | 'media_url' | 'message_type'> {
  isOptimistic?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  bet_id: string | null;
  media_url: string | null;
  message_type: string | null;
  metadata: Json;
  report_count: number | null;
  is_blocked: boolean | null;
  archived: boolean;
}

interface UseMessagesOptions {
  chatId: string;
  pageSize?: number;
}

export function useMessages({ chatId, pageSize = 50 }: UseMessagesOptions) {
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const subscriberId = useId();
  const optimisticMessagesRef = useRef<Set<string>>(new Set());

  // Fetch initial messages
  const fetchMessages = useCallback(
    async (offset = 0) => {
      try {
        const fetchedMessages = await messageService.getChatMessages(chatId, offset, pageSize);

        if (offset === 0) {
          setMessages(fetchedMessages);
        } else {
          setMessages((prev) => [...prev, ...fetchedMessages]);
        }

        setHasMore(fetchedMessages.length === pageSize);
        return fetchedMessages;
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        return [];
      }
    },
    [chatId, pageSize]
  );

  // Load more messages
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    await fetchMessages(messages.length);
    setIsLoadingMore(false);
  }, [hasMore, isLoadingMore, messages.length, fetchMessages]);

  // Send a message
  const sendMessage = useCallback(
    async (content: MessageContent) => {
      if (!user) return;

      // Get user profile from database
      const { data: userProfile } = await supabase
        .from('users')
        .select('username, display_name, avatar_url')
        .eq('id', user.id)
        .single();

      // Create optimistic message
      const tempId = `temp_${Date.now()}`;
      const optimisticMessage: OptimisticMessage = {
        id: tempId,
        chat_id: chatId,
        sender_id: user.id,
        content: content.text || '',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        deleted_at: null,
        sender: {
          id: user.id,
          username: userProfile?.username || null,
          avatar_url: userProfile?.avatar_url || null,
        },
        status: 'sending',
        isOptimistic: true,
        // Extended properties
        media_url: content.mediaUrl || null,
        media_type: content.mediaUrl ? 'photo' : null, // Assuming photos for now, can be enhanced later
        bet_id: content.betId || null,
        message_type: content.mediaUrl ? 'media' : content.betId ? 'pick' : 'text',
        metadata: null,
        report_count: null,
        is_blocked: null,
        archived: false,
      };

      // Add to optimistic set
      optimisticMessagesRef.current.add(tempId);

      // Add to messages immediately
      setMessages((prev) => [optimisticMessage, ...prev]);

      try {
        // For now, use a default expiration of 24 hours
        // This can be made configurable in a future sprint
        const expirationHours = 24;

        // Send the actual message
        const sentMessage = await messageService.sendMessage(
          chatId,
          user.id,
          content,
          expirationHours
        );

        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? ({ ...sentMessage, status: 'sent' } as OptimisticMessage) : msg
          )
        );

        // Remove from optimistic set
        optimisticMessagesRef.current.delete(tempId);
      } catch (error) {
        console.error('Failed to send message:', error);

        // Check if we should queue the message
        const isNetworkError =
          error instanceof Error &&
          (error.message.includes('Network') || error.message.includes('Failed to fetch'));

        if (isNetworkError) {
          // Add to offline queue
          await offlineQueue.addToQueue(
            chatId,
            user.id,
            content,
            24, // expirationHours
            'high' // priority for user's own messages
          );

          // Update UI to show queued status
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId ? ({ ...msg, status: 'sent' } as OptimisticMessage) : msg
            )
          );

          // Remove from optimistic set since it's queued
          optimisticMessagesRef.current.delete(tempId);
        } else {
          // Mark as failed for non-network errors
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId ? ({ ...msg, status: 'failed' } as OptimisticMessage) : msg
            )
          );
        }
      }
    },
    [user, chatId]
  );

  // Resend a failed message
  const resendMessage = useCallback(
    async (messageId: string) => {
      const failedMessage = messages.find((msg) => msg.id === messageId);
      const optMessage = failedMessage as OptimisticMessage;
      if (!failedMessage || !optMessage.isOptimistic) return;

      // Remove the failed message
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      optimisticMessagesRef.current.delete(messageId);

      // Send again
      const content: MessageContent = {
        text: failedMessage.content || undefined,
        mediaUrl: optMessage.media_url || undefined,
        betId: optMessage.bet_id || undefined,
      };

      await sendMessage(content);
    },
    [messages, sendMessage]
  );

  // Set up real-time subscription
  useEffect(() => {
    if (!chatId || !user) return;

    const channelName = getChatChannelName(chatId);

    // Subscribe to new messages using centralized manager
    realtimeManager.subscribe(channelName, subscriberId, {
      postgres: {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      onPostgres: async (payload) => {
        const newMessage = payload.new as {
          id: string;
          sender_id: string;
          chat_id: string;
          content: string;
          created_at: string;
          expires_at: string;
          deleted_at: string | null;
          media_url: string | null;
          bet_id: string | null;
          message_type: string | null;
        };

        // Skip if it's from us and already optimistic
        if (newMessage.sender_id === user.id) {
          // Check if we have an optimistic version
          const hasOptimistic = Array.from(optimisticMessagesRef.current).some((tempId) =>
            messages.some((msg) => msg.id === tempId)
          );
          if (hasOptimistic) return;
        }

        // Fetch full message with relations
        const { data } = await supabase
          .from('messages')
          .select(
            `
              *,
              sender:users!messages_sender_id_fkey(
                id,
                username,
                avatar_url
              ),
              bet:bets(
                *,
                game:games(*)
              )
            `
          )
          .eq('id', newMessage.id)
          .single();

        if (data) {
          // Type assertion needed because of extended properties
          const messageWithExtended = data as unknown as Message;
          setMessages((prev) => [messageWithExtended, ...prev]);
        }
      },
    });

    return () => {
      realtimeManager.unsubscribe(channelName, subscriberId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, user, subscriberId]);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    fetchMessages(0).finally(() => setIsLoading(false));
  }, [fetchMessages]);

  return {
    messages,
    isLoading,
    hasMore,
    isLoadingMore,
    sendMessage,
    resendMessage,
    loadMore,
  };
}
