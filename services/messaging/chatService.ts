import { supabase } from '@/services/supabase/client';
import { ChatWithDetails, ChatActionResponse } from '@/types/messaging';
import { toastService } from '@/services/toastService';

interface ChatRPCResponse {
  chat_id: string;
  chat_type: string;
  name: string | null;
  avatar_url: string | null;
  created_by: string | null;
  created_at: string;
  last_message_at: string | null;
  settings: Record<string, unknown>;
  is_archived: boolean;
  unread_count: number;
  last_message_id: string | null;
  last_message_content: string | null;
  last_message_sender_id: string | null;
  last_message_sender_username: string | null;
  last_message_created_at: string | null;
  other_member_id: string | null;
  other_member_username: string | null;
  other_member_avatar_url: string | null;
  member_count: number;
}

class ChatService {
  /**
   * Get user's chats with details using the RPC function
   */
  async getUserChats(userId: string): Promise<ChatWithDetails[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_chats_with_counts', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error fetching chats:', error);
        throw error;
      }

      // Filter out archived chats by default and cast chat_type
      return ((data || []) as ChatRPCResponse[])
        .filter((chat) => !chat.is_archived)
        .map((chat) => ({
          ...chat,
          chat_type: chat.chat_type as 'dm' | 'group',
        }));
    } catch (error) {
      console.error('Failed to get user chats:', error);
      toastService.showError('Failed to load chats');
      return [];
    }
  }

  /**
   * Get archived chats for a user
   */
  async getArchivedChats(userId: string): Promise<ChatWithDetails[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_chats_with_counts', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error fetching archived chats:', error);
        throw error;
      }

      // Return only archived chats with type casting
      return ((data || []) as ChatRPCResponse[])
        .filter((chat) => chat.is_archived)
        .map((chat) => ({
          ...chat,
          chat_type: chat.chat_type as 'dm' | 'group',
        }));
    } catch (error) {
      console.error('Failed to get archived chats:', error);
      toastService.showError('Failed to load archived chats');
      return [];
    }
  }

  /**
   * Archive or unarchive a chat
   */
  async toggleArchive(
    chatId: string,
    userId: string,
    archive: boolean
  ): Promise<ChatActionResponse> {
    try {
      const { error } = await supabase
        .from('chat_members')
        .update({ is_archived: archive })
        .eq('chat_id', chatId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error toggling archive:', error);
        throw error;
      }

      toastService.showSuccess(archive ? 'Chat archived' : 'Chat unarchived');
      return { success: true };
    } catch (error) {
      console.error('Failed to toggle archive:', error);
      toastService.showError('Failed to update chat');
      return { success: false, error: 'Failed to update chat' };
    }
  }

  /**
   * Mute or unmute a chat
   * Note: Since muted_until doesn't exist in the schema yet, we'll store it in settings
   */
  async toggleMute(chatId: string, userId: string, mute: boolean): Promise<ChatActionResponse> {
    try {
      // For now, we'll just show a toast since muted_until doesn't exist yet
      // This will be implemented properly when the column is added
      toastService.showInfo(
        mute ? 'Mute functionality coming soon' : 'Unmute functionality coming soon'
      );
      return { success: true };
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      toastService.showError('Failed to update chat');
      return { success: false, error: 'Failed to update chat' };
    }
  }

  /**
   * Mark a chat as read
   */
  async markChatAsRead(chatId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('chat_id', chatId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error marking chat as read:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to mark chat as read:', error);
    }
  }

  /**
   * Get total unread count for tab badge
   */
  async getTotalUnreadCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_user_chats_with_counts', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error fetching unread count:', error);
        return 0;
      }

      // Sum up unread counts from non-archived chats
      return ((data || []) as ChatRPCResponse[])
        .filter((chat) => !chat.is_archived)
        .reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Create or get a DM chat with another user
   */
  async getOrCreateDMChat(userId: string, otherUserId: string): Promise<string | null> {
    try {
      // Use the database function to handle chat creation with proper permissions
      // The function uses auth.uid() internally, so we only pass the other user's ID
      // @ts-expect-error - create_dm_chat is a custom function not in generated types
      const { data, error } = await supabase.rpc('create_dm_chat', {
        other_user_id: otherUserId,
      });

      if (error) {
        console.error('Error creating DM chat:', error);
        throw error;
      }

      return data as string;
    } catch (error) {
      console.error('Failed to get or create DM:', error);
      toastService.showError('Failed to start conversation');
      return null;
    }
  }
}

export const chatService = new ChatService();
