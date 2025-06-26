import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { ChatWithDetails } from '@/types/messaging';
import { useAuthStore } from '@/stores/authStore';

interface UseChatDetailsOptions {
  chatId: string;
}

export function useChatDetails({ chatId }: UseChatDetailsOptions) {
  const user = useAuthStore((state) => state.user);
  const [chat, setChat] = useState<ChatWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!chatId || !user) {
      setIsLoading(false);
      return;
    }

    const fetchChatDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get chat details using the RPC function
        const { data, error: rpcError } = await supabase.rpc('get_user_chats_with_counts', {
          p_user_id: user.id,
        });

        if (rpcError) throw rpcError;

        // Find the specific chat
        const chatData = data as ChatWithDetails[] | null;
        const chatDetails = chatData?.find((c: ChatWithDetails) => c.chat_id === chatId);

        if (!chatDetails) {
          throw new Error('Chat not found');
        }

        setChat(chatDetails);
      } catch (err) {
        console.error('Failed to fetch chat details:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatDetails();
  }, [chatId, user]);

  return {
    chat,
    isLoading,
    error,
    otherUser:
      chat?.chat_type === 'dm'
        ? {
            id: chat.other_member_id || '',
            username: chat.other_member_username || 'Unknown',
            avatar_url: chat.other_member_avatar_url || null,
          }
        : null,
  };
}
