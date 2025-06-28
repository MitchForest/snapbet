import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase/client';
import { chatService } from '@/services/messaging/chatService';
import { ChatWithDetails } from '@/types/messaging';
import { useAuth } from '@/hooks/useAuth';
import { presenceService } from '@/services/realtime/presenceService';
import * as Haptics from 'expo-haptics';

interface TypingEventPayload {
  chatId: string;
  userId: string;
  isTyping: boolean;
}

export function useChats() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const chatIdsRef = useRef<string[]>([]);

  // Load chats
  const loadChats = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const [chatList, unreadCount] = await Promise.all([
        chatService.getUserChats(user.id),
        chatService.getTotalUnreadCount(user.id),
      ]);

      setChats(chatList);
      setTotalUnreadCount(unreadCount);

      // Update chat IDs ref
      chatIdsRef.current = chatList.map((chat) => chat.chat_id);
    } catch (err) {
      console.error('Failed to load chats:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Refresh chats
  const refetch = useCallback(async () => {
    setRefreshing(true);

    // Haptic feedback for pull-to-refresh
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await loadChats();
    } finally {
      setRefreshing(false);
    }
  }, [loadChats]);

  // Handle new message in real-time
  const handleNewMessage = useCallback(
    async (payload: RealtimePostgresChangesPayload<{ sender_id: string }>) => {
      if (!payload.new || !('sender_id' in payload.new)) return;

      const { sender_id } = payload.new;

      // Don't update if it's our own message
      if (sender_id === user?.id) return;

      // Reload chats to get updated last message and unread count
      await loadChats();

      // Haptic feedback for new message
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [user?.id, loadChats]
  );

  // Handle typing events
  const handleTypingEvent = useCallback((payload: { payload: TypingEventPayload }) => {
    const { chatId, userId, isTyping } = payload.payload;

    setTypingUsers((prev) => {
      const newMap = new Map(prev);
      const chatTypers = newMap.get(chatId) || new Set();

      if (isTyping) {
        chatTypers.add(userId);
      } else {
        chatTypers.delete(userId);
      }

      if (chatTypers.size === 0) {
        newMap.delete(chatId);
      } else {
        newMap.set(chatId, chatTypers);
      }

      return newMap;
    });
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    // Create a cleanup function
    const cleanup = async () => {
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };

    // Setup function
    const setupSubscriptions = async () => {
      // Clean up existing subscriptions first
      await cleanup();

      // Small delay to ensure cleanup completes
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create the channel
      const channel = supabase.channel(`user-chats:${user.id}`);

      // Subscribe to new chats (when user is added to a chat)
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_members',
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          console.log('New chat detected, reloading chats...');
          await loadChats();
        }
      );

      // Subscribe to typing events
      channel.on('broadcast', { event: 'typing' }, handleTypingEvent);

      // Subscribe to the channel
      await channel.subscribe();

      channelRef.current = channel;
    };

    // Run setup
    setupSubscriptions();

    // Cleanup
    return () => {
      cleanup();
    };
  }, [user?.id, handleTypingEvent, loadChats]);

  // Set up message subscription separately when chat IDs change
  useEffect(() => {
    if (!user?.id || chatIdsRef.current.length === 0) return;

    const setupMessageSubscription = async () => {
      const channel = supabase.channel(`user-messages:${user.id}`);

      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=in.(${chatIdsRef.current.join(',')})`,
        },
        handleNewMessage
      );

      await channel.subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanupPromise = setupMessageSubscription();

    return () => {
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, [user?.id, handleNewMessage, chats.length]); // Only re-subscribe when number of chats changes

  // Archive a chat
  const archiveChat = useCallback(
    async (chatId: string) => {
      if (!user?.id) return;

      const result = await chatService.toggleArchive(chatId, user.id, true);
      if (result.success) {
        await loadChats();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    },
    [user?.id, loadChats]
  );

  // Mute a chat
  const muteChat = useCallback(
    async (chatId: string) => {
      if (!user?.id) return;

      const result = await chatService.toggleMute(chatId, user.id, true);
      if (result.success) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [user?.id]
  );

  // Check if a user is online
  const isUserOnline = useCallback((userId: string) => {
    return presenceService.isUserOnline(userId);
  }, []);

  // Get typing users for a chat
  const getTypingUsers = useCallback(
    (chatId: string) => {
      return Array.from(typingUsers.get(chatId) || []);
    },
    [typingUsers]
  );

  return {
    chats,
    isLoading,
    error,
    refetch,
    refreshing,
    totalUnreadCount,
    archiveChat,
    muteChat,
    isUserOnline,
    getTypingUsers,
  };
}
