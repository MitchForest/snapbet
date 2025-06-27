import { useEffect, useRef, useCallback } from 'react';
import { messageService } from '@/services/messaging/messageService';
import { useAuthStore } from '@/stores/authStore';

interface UseReadReceiptsOptions {
  chatId: string;
  onMessagesRead?: (messageIds: string[]) => void;
}

export function useReadReceipts({ chatId: _chatId, onMessagesRead }: UseReadReceiptsOptions) {
  const user = useAuthStore((state) => state.user);
  const readMessagesRef = useRef<Set<string>>(new Set());
  const pendingReadsRef = useRef<Set<string>>(new Set());
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibleMessagesRef = useRef<Set<string>>(new Set());

  // Batch read receipts to reduce DB writes
  const processPendingReads = useCallback(async () => {
    if (!user || pendingReadsRef.current.size === 0) return;

    const messageIds = Array.from(pendingReadsRef.current);
    pendingReadsRef.current.clear();

    try {
      await messageService.markMessagesAsRead(messageIds, user.id);

      // Add to read set
      messageIds.forEach((id) => readMessagesRef.current.add(id));

      // Notify parent component
      onMessagesRead?.(messageIds);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      // Re-add to pending on failure
      messageIds.forEach((id) => pendingReadsRef.current.add(id));
    }
  }, [user, onMessagesRead]);

  // Schedule batch processing
  const scheduleReadUpdate = useCallback(() => {
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
    }

    // Process after 2 seconds of no new reads
    batchTimerRef.current = setTimeout(() => {
      processPendingReads();
    }, 2000);
  }, [processPendingReads]);

  // Handle visible messages change
  const handleVisibleMessagesChange = useCallback(
    (visibleMessageIds: string[], allMessages: Array<{ id: string; sender_id: string }>) => {
      if (!user) return;

      visibleMessageIds.forEach((messageId) => {
        // Skip if already processed
        if (readMessagesRef.current.has(messageId) || pendingReadsRef.current.has(messageId)) {
          return;
        }

        // Find the message to check sender
        const message = allMessages.find((m) => m.id === messageId);
        if (!message || message.sender_id === user.id) return;

        // Add to pending reads
        pendingReadsRef.current.add(messageId);
      });

      if (pendingReadsRef.current.size > 0) {
        scheduleReadUpdate();
      }

      // Update visible messages set
      visibleMessagesRef.current.clear();
      visibleMessageIds.forEach((id) => visibleMessagesRef.current.add(id));
    },
    [user, scheduleReadUpdate]
  );

  // For React Native, we'll use a simpler approach
  // The parent component will call this when messages become visible
  const observeMessage = useCallback(
    (messageId: string, element: unknown) => {
      // In React Native, we don't need to observe DOM elements
      // This is kept for API compatibility but does nothing
    },
    []
  );

  // Unobserve message
  const unobserveMessage = useCallback((messageId: string) => {
    // In React Native, we don't need to unobserve DOM elements
    // This is kept for API compatibility but does nothing
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }
      // Process any pending reads before unmounting
      processPendingReads();
    };
  }, [processPendingReads]);

  return {
    observeMessage,
    unobserveMessage,
    handleVisibleMessagesChange,
    markAsRead: (messageId: string) => {
      if (!readMessagesRef.current.has(messageId)) {
        pendingReadsRef.current.add(messageId);
        scheduleReadUpdate();
      }
    },
  };
}
