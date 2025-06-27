import { supabase } from '@/services/supabase/client';
import { blockService } from '@/services/moderation/blockService';
import { Message, GroupMember, MessageReportReason } from '@/types/messaging';
import { toastService } from '@/services/toastService';
import { Database } from '@/types/database-helpers';

// Type definitions from generated types
type MessagePrivacySettingsInsert =
  Database['public']['Tables']['message_privacy_settings']['Insert'];
type MessagePrivacySettingsUpdate =
  Database['public']['Tables']['message_privacy_settings']['Update'];

export type WhoCanMessage = 'everyone' | 'following' | 'nobody';

export interface PrivacySettings {
  user_id: string;
  who_can_message: WhoCanMessage;
  read_receipts_enabled: boolean;
  typing_indicators_enabled: boolean;
  online_status_visible: boolean;
  updated_at: string | null;
}

const DEFAULT_PRIVACY_SETTINGS: Omit<PrivacySettings, 'user_id'> = {
  who_can_message: 'everyone',
  read_receipts_enabled: true,
  typing_indicators_enabled: true,
  online_status_visible: true,
  updated_at: new Date().toISOString(),
};

class MessagingPrivacyService {
  /**
   * Get user's privacy settings
   */
  async getPrivacySettings(userId: string): Promise<PrivacySettings> {
    try {
      const { data, error } = await supabase
        .from('message_privacy_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, return defaults
          return { ...DEFAULT_PRIVACY_SETTINGS, user_id: userId };
        }
        throw error;
      }

      return {
        user_id: data.user_id,
        who_can_message: data.who_can_message as WhoCanMessage,
        read_receipts_enabled: data.read_receipts_enabled ?? true,
        typing_indicators_enabled: data.typing_indicators_enabled ?? true,
        online_status_visible: data.online_status_visible ?? true,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      return { ...DEFAULT_PRIVACY_SETTINGS, user_id: userId };
    }
  }

  /**
   * Update user's privacy settings
   */
  async updatePrivacySettings(
    userId: string,
    updates: Partial<MessagePrivacySettingsUpdate>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First check if settings exist
      const { data: existing } = await supabase
        .from('message_privacy_settings')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (!existing) {
        // Create new settings
        const insertData: MessagePrivacySettingsInsert = {
          user_id: userId,
          ...updates,
        };

        const { error: insertError } = await supabase
          .from('message_privacy_settings')
          .insert(insertData);

        if (insertError) throw insertError;
      } else {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('message_privacy_settings')
          .update(updates)
          .eq('user_id', userId);

        if (updateError) throw updateError;
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update settings',
      };
    }
  }

  /**
   * Check if a user can message another user
   */
  async canMessage(senderId: string, recipientId: string): Promise<boolean> {
    try {
      // Use the database function
      const { data, error } = await supabase.rpc('can_user_message', {
        sender_id: senderId,
        recipient_id: recipientId,
      });

      if (error) {
        console.error('Error checking message permission:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error in canMessage:', error);
      return false;
    }
  }

  /**
   * Filter messages to hide blocked users
   */
  async filterMessages(messages: Message[], _userId: string): Promise<Message[]> {
    try {
      const blockedUserIds = await blockService.getBlockedUserIds();

      return messages.map((message) => {
        if (blockedUserIds.includes(message.sender_id)) {
          return {
            ...message,
            content: '[Blocked User]',
            media_url: null,
            is_blocked: true,
          } as Message;
        }
        return message;
      });
    } catch (error) {
      console.error('Error filtering messages:', error);
      return messages;
    }
  }

  /**
   * Filter group members to hide blocked users
   */
  async filterGroupMembers(members: GroupMember[], userId: string): Promise<GroupMember[]> {
    try {
      const blockedUserIds = await blockService.getBlockedUserIds();

      // Don't filter out the current user even if somehow blocked
      return members.filter(
        (member) => member.user_id === userId || !blockedUserIds.includes(member.user_id)
      );
    } catch (error) {
      console.error('Error filtering group members:', error);
      return members;
    }
  }

  /**
   * Check if read receipts are enabled for a user
   */
  async areReadReceiptsEnabled(userId: string): Promise<boolean> {
    const settings = await this.getPrivacySettings(userId);
    return settings.read_receipts_enabled;
  }

  /**
   * Check if typing indicators are enabled for a user
   */
  async areTypingIndicatorsEnabled(userId: string): Promise<boolean> {
    const settings = await this.getPrivacySettings(userId);
    return settings.typing_indicators_enabled;
  }

  /**
   * Check if online status is visible for a user
   */
  async isOnlineStatusVisible(userId: string): Promise<boolean> {
    const settings = await this.getPrivacySettings(userId);
    return settings.online_status_visible;
  }

  /**
   * Report a message
   */
  async reportMessage(
    messageId: string,
    reporterId: string,
    reason: MessageReportReason,
    details?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('message_reports').insert({
        message_id: messageId,
        reporter_id: reporterId,
        reason,
        details,
      });

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: 'You have already reported this message' };
        }
        throw error;
      }

      // Check report count for auto-hide
      const { count } = await supabase
        .from('message_reports')
        .select('*', { count: 'exact', head: true })
        .eq('message_id', messageId);

      if (count && count >= 3) {
        // Message will be auto-hidden by the UI based on report_count
        toastService.showInfo('This message has been hidden pending review');
      }

      return { success: true };
    } catch (error) {
      console.error('Error reporting message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to report message',
      };
    }
  }
}

// Export singleton instance
export const messagingPrivacyService = new MessagingPrivacyService();
