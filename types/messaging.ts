import { Database } from './supabase';
import { Game } from './database';

// Base database types
type DbMessage = Database['public']['Tables']['messages']['Row'];
type DbChatMember = Database['public']['Tables']['chat_members']['Row'];
type DbUser = Database['public']['Tables']['users']['Row'];
type DbBet = Database['public']['Tables']['bets']['Row'];

// Message types
export type MessageType = 'text' | 'media' | 'pick';

// Message content for sending
export interface MessageContent {
  text?: string;
  mediaUrl?: string;
  betId?: string;
}

// Message status for UI
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

// Chat types from RPC function
export interface ChatWithDetails {
  chat_id: string;
  chat_type: 'dm' | 'group';
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

// Extended message with all details
export interface Message extends DbMessage {
  sender: Pick<DbUser, 'id' | 'username' | 'avatar_url'>;
  bet?: DbBet & { game: Game };
  status?: MessageStatus;
  isOptimistic?: boolean;
}

// Message with sender info
export interface MessageWithSender extends DbMessage {
  sender: Pick<DbUser, 'id' | 'username' | 'avatar_url'>;
}

// Chat member with user info
export interface ChatMemberWithUser extends DbChatMember {
  user: Pick<DbUser, 'id' | 'username' | 'avatar_url' | 'display_name'>;
}

// Typing indicator state
export interface TypingUser {
  userId: string;
  username: string;
  lastTypingAt: Date;
}

// Typing event for real-time
export interface TypingEvent {
  chatId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

// Archive/mute actions
export interface ChatAction {
  chatId: string;
  action: 'archive' | 'unarchive' | 'mute' | 'unmute';
}

// Search result
export interface ChatSearchResult extends ChatWithDetails {
  matchType: 'name' | 'message' | 'username';
  matchedText?: string;
}

// Presence state
export interface UserPresence {
  userId: string;
  status: 'online' | 'offline';
  lastSeen?: Date;
}

// Real-time event types
export interface ChatListUpdateEvent {
  type: 'new_message' | 'chat_updated' | 'member_added' | 'member_removed';
  chatId: string;
  data?: unknown;
}

// Service response types
export interface ChatsResponse {
  chats: ChatWithDetails[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface ChatActionResponse {
  success: boolean;
  chat?: ChatWithDetails;
  error?: string;
}

// Read receipt info
export interface ReadReceipt {
  messageId: string;
  userId: string;
  readAt: string;
}

// Message sending response
export interface SendMessageResponse {
  message: Message;
  tempId?: string;
}
