import { supabase } from '@/services/supabase';
import { MessageContent, Message } from '@/types/messaging';
import { uploadWithRetry } from '@/services/media/upload';
import { compressPhoto } from '@/services/media/compression';
import { withActiveContent } from '@/utils/database/archiveFilter';

class MessageService {
  /**
   * Generate a unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Upload message media to storage
   */
  private async uploadMessageMedia(
    uri: string,
    chatId: string,
    messageId: string
  ): Promise<string> {
    const isVideo = uri.includes('.mp4') || uri.includes('.mov');
    const extension = isVideo ? 'mp4' : 'jpg';
    const path = `messages/${chatId}/${messageId}.${extension}`;

    return await uploadWithRetry(uri, path);
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(
    chatId: string,
    senderId: string,
    content: MessageContent,
    expirationHours: number
  ): Promise<Message> {
    try {
      let mediaUrl: string | null = null;

      // Handle media upload
      if (content.mediaUrl && content.mediaUrl.startsWith('file://')) {
        const messageId = this.generateMessageId();
        const isVideo = content.mediaUrl.includes('.mp4') || content.mediaUrl.includes('.mov');

        if (!isVideo) {
          // Compress image
          const compressed = await compressPhoto(content.mediaUrl);
          mediaUrl = await this.uploadMessageMedia(compressed, chatId, messageId);
        } else {
          // Upload video as-is
          mediaUrl = await this.uploadMessageMedia(content.mediaUrl, chatId, messageId);
        }
      }

      // Handle bet/pick sharing
      if (content.betId) {
        // Will be marked as pick type when updating
      }

      // Calculate expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expirationHours);

      // Insert message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: senderId,
          content: content.text || '',
          expires_at: expiresAt.toISOString(),
        })
        .select(
          `
          *,
          sender:users!messages_sender_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `
        )
        .single();

      if (error) throw error;

      // If we have media or bet, update the message with additional fields
      if (mediaUrl || content.betId) {
        // Type for update data
        interface MessageUpdateData {
          media_url?: string;
          bet_id?: string;
          message_type: 'text' | 'media' | 'pick';
        }

        const updateData: MessageUpdateData = {
          message_type: mediaUrl ? 'media' : content.betId ? 'pick' : 'text',
        };
        if (mediaUrl) updateData.media_url = mediaUrl;
        if (content.betId) updateData.bet_id = content.betId;

        const { data: updatedData, error: updateError } = await supabase
          .from('messages')
          .update(updateData)
          .eq('id', data.id)
          .select(
            `
            *,
            sender:users!messages_sender_id_fkey(
              id,
              username,
              display_name,
              avatar_url
            ),
            bet:bets(
              *,
              game:games(*)
            )
          `
          )
          .single();

        if (updateError) throw updateError;

        // Update last_message_at in chat
        await supabase
          .from('chats')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', chatId);

        return updatedData as unknown as Message;
      }

      // Update last_message_at in chat
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatId);

      return data as unknown as Message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Get messages for a chat with pagination
   */
  async getChatMessages(chatId: string, offset = 0, limit = 50): Promise<Message[]> {
    const { data, error } = await withActiveContent(
      supabase.from('messages').select(
        `
          *,
          sender:users!messages_sender_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          ),
          bet:bets(
            *,
            game:games(*)
          ),
          reads:message_reads(
            user_id,
            read_at
          )
        `
      )
    )
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Filter out expired messages
    const now = new Date();
    const activeMessages = (data || []).filter((msg) => {
      if (!msg.expires_at) return true;
      return new Date(msg.expires_at) > now;
    });

    return activeMessages as unknown as Message[];
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(messageIds: string[], userId: string): Promise<void> {
    if (messageIds.length === 0) return;

    const reads = messageIds.map((messageId) => ({
      message_id: messageId,
      user_id: userId,
      read_at: new Date().toISOString(),
    }));

    await supabase.from('message_reads').upsert(reads, { onConflict: 'message_id,user_id' });
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(messageId: string): Promise<void> {
    await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId);
  }

  /**
   * Get unread message count for a chat
   */
  async getUnreadCount(chatId: string, userId: string): Promise<number> {
    const { count, error } = await withActiveContent(
      supabase.from('messages').select('id', { count: 'exact', head: true })
    )
      .eq('chat_id', chatId)
      .neq('sender_id', userId)
      .not(
        'id',
        'in',
        `(
        SELECT message_id 
        FROM message_reads 
        WHERE user_id = '${userId}'
      )`
      );

    if (error) throw error;

    return count || 0;
  }
}

export const messageService = new MessageService();
