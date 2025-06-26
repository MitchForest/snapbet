import { useState, useEffect, useCallback, useRef, useMemo, useId } from 'react';
import { realtimeManager } from '@/services/realtime/realtimeManager';
import { getTypingChannelName } from '@/utils/realtime/channelHelpers';
import { useAuth } from './useAuth';
import { TypingUser } from '@/types/messaging';

// Simple debounce implementation
function debounce<T extends (...args: never[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

interface UseTypingIndicatorOptions {
  chatId: string;
}

export function useTypingIndicator({ chatId }: UseTypingIndicatorOptions) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const subscriberId = useId();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Broadcast typing status
  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!user) return;

      const channel = realtimeManager.getChannel(getTypingChannelName(chatId));
      if (!channel) return;

      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: user.id,
          isTyping,
          username: user.user_metadata?.username || 'User',
        },
      });

      // Auto-stop typing after 3 seconds
      if (isTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setTyping(false);
        }, 3000);
      }
    },
    [user, chatId]
  );

  // Debounced version for text input
  const debouncedSetTyping = useMemo(() => debounce(setTyping, 500), [setTyping]);

  // Set up real-time subscription
  useEffect(() => {
    if (!chatId || !user) return;

    const channelName = getTypingChannelName(chatId);

    // Subscribe to typing events using centralized manager
    realtimeManager.subscribe(channelName, subscriberId, {
      broadcast: { event: 'typing' },
      onBroadcast: (payload: {
        payload: { userId: string; isTyping: boolean; username: string };
      }) => {
        const { userId, isTyping, username } = payload.payload;

        // Ignore our own typing events
        if (userId === user.id) return;

        setTypingUsers((prev) => {
          if (isTyping) {
            // Add or update typing user
            const existing = prev.find((u) => u.userId === userId);
            if (!existing) {
              return [
                ...prev,
                {
                  userId,
                  username,
                  lastTypingAt: new Date(),
                },
              ];
            }
            // Update last typing time
            return prev.map((u) => (u.userId === userId ? { ...u, lastTypingAt: new Date() } : u));
          } else {
            // Remove user from typing list
            return prev.filter((u) => u.userId !== userId);
          }
        });

        // Set a timer to remove user after 5 seconds of no activity
        if (isTyping) {
          // Clear the timeout for this user if it exists
          const existingTimer = typingTimersRef.current.get(userId);
          if (existingTimer) {
            clearTimeout(existingTimer);
          }

          // Set a new timeout to remove the user after 3 seconds
          const timer = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
            typingTimersRef.current.delete(userId);
          }, 3000);

          typingTimersRef.current.set(userId, timer);
        } else {
          // Clear timer if user stopped typing
          const timer = typingTimersRef.current.get(userId);
          if (timer) {
            clearTimeout(timer);
            typingTimersRef.current.delete(userId);
          }
        }
      },
    });

    return () => {
      // Store ref in variable to avoid stale closure warning
      const timers = typingTimersRef.current;

      realtimeManager.unsubscribe(channelName, subscriberId);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Clear all typing timers
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, [chatId, user, subscriberId]);

  return {
    typingUsers,
    setTyping: debouncedSetTyping,
    setTypingImmediate: setTyping,
  };
}
