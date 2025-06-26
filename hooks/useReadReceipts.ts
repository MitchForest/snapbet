import { useEffect, useRef, useCallback } from 'react';
import { messageService } from '@/services/messaging/messageService';
import { useAuthStore } from '@/stores/authStore';

interface UseReadReceiptsOptions {
  chatId: string;
  onMessagesRead?: (messageIds: string[]) => void;
}

export function useReadReceipts({ chatId: _chatId, onMessagesRead }: UseReadReceiptsOptions) {
  const user = useAuthStore((state) => state.user);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const messageElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const readMessagesRef = useRef<Set<string>>(new Set());
  const pendingReadsRef = useRef<Set<string>>(new Set());
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Observe message visibility
  const observeMessage = useCallback(
    (messageId: string, element: HTMLElement) => {
      if (!user || !observerRef.current) return;

      // Store element reference
      messageElementsRef.current.set(messageId, element);

      // Start observing
      observerRef.current.observe(element);
    },
    [user]
  );

  // Unobserve message
  const unobserveMessage = useCallback((messageId: string) => {
    const element = messageElementsRef.current.get(messageId);
    if (element && observerRef.current) {
      observerRef.current.unobserve(element);
      messageElementsRef.current.delete(messageId);
    }
  }, []);

  // Set up intersection observer
  useEffect(() => {
    if (!user) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            if (!messageId) return;

            // Check if already read or pending
            if (readMessagesRef.current.has(messageId) || pendingReadsRef.current.has(messageId)) {
              return;
            }

            // Check if it's from another user
            const senderId = entry.target.getAttribute('data-sender-id');
            if (senderId === user.id) return;

            // Add to pending reads
            pendingReadsRef.current.add(messageId);
            scheduleReadUpdate();
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.5, // Message is 50% visible
      }
    );

    return () => {
      // Store refs in variables to avoid stale closure warnings
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const messageElements = messageElementsRef.current;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const readMessages = readMessagesRef.current;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const pendingReads = pendingReadsRef.current;

      const observer = observerRef.current;
      if (observer) observer.disconnect();
      messageElements.clear();
      readMessages.clear();
      pendingReads.clear();
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }
    };
  }, [user, scheduleReadUpdate, processPendingReads]);

  return {
    observeMessage,
    unobserveMessage,
    markAsRead: (messageId: string) => {
      if (!readMessagesRef.current.has(messageId)) {
        pendingReadsRef.current.add(messageId);
        scheduleReadUpdate();
      }
    },
  };
}
