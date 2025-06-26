import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
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
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Broadcast typing status
  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!channelRef.current || !user) return;

      channelRef.current.send({
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
    [user]
  );

  // Debounced version for text input
  const debouncedSetTyping = useMemo(() => debounce(setTyping, 500), [setTyping]);

  // Set up real-time subscription
  useEffect(() => {
    if (!chatId || !user) return;

    channelRef.current = supabase
      .channel(`chat:${chatId}:typing`)
      .on('broadcast', { event: 'typing' }, (payload) => {
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

          typingTimersRef.current.set(userId, timer as unknown as NodeJS.Timeout);
        } else {
          // Clear timer if user stopped typing
          const timer = typingTimersRef.current.get(userId);
          if (timer) {
            clearTimeout(timer);
            typingTimersRef.current.delete(userId);
          }
        }
      })
      .subscribe();

    return () => {
      // Store ref in variable to avoid stale closure warning
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const timers = typingTimersRef.current;

      channelRef.current?.unsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Clear all typing timers
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, [chatId, user]);

  return {
    typingUsers,
    setTyping: debouncedSetTyping,
    setTypingImmediate: setTyping,
  };
}
