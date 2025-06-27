import { Database } from './supabase';
import { Game } from './database';

// Base database types
type DbMessage = Database['public']['Tables']['messages']['Row'];
type DbChatMember = Database['public']['Tables']['chat_members']['Row'];
type DbUser = Database['public']['Tables']['users']['Row'];
type DbBet = Database['public']['Tables']['bets']['Row'];

// Message types
export type MessageType = 'text' | 'media' | 'pick' | 'system';

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

// Group-specific types
export interface GroupCreationData {
  name: string;
  avatarUrl?: string;
  memberIds: string[];
  expirationHours: number;
}

export interface GroupMember extends ChatMemberWithUser {
  isCreator: boolean;
}

export interface MentionSuggestion {
  userId: string;
  username: string;
  avatarUrl?: string;
}

export interface SystemMessageMetadata {
  action: 'group_created' | 'member_added' | 'member_removed' | 'member_role_changed';
  actor_id?: string;
  actor_username?: string;
  target_id?: string;
  target_username?: string;
  old_role?: string;
  new_role?: string;
}

// Extended message with system message support
export interface SystemMessage extends Omit<Message, 'metadata'> {
  metadata: SystemMessageMetadata;
}

// Group info for display
export interface GroupInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  memberCount: number;
  createdBy: string;
  createdAt: string;
  expirationHours: number;
  userRole: 'admin' | 'member';
}

// Message reaction types
export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: Pick<DbUser, 'id' | 'username' | 'avatar_url'>;
}

export interface MessageWithReactions extends Message {
  reactions?: MessageReaction[];
  userReaction?: string | null;
}

// Media message types
export interface MediaMessageMetadata {
  width?: number;
  height?: number;
  duration?: number; // for videos
  size: number;
  thumbnailUrl?: string;
}

// Pick share types
export interface PickShareMetadata {
  bet_id: string;
  tail_count: number;
  fade_count: number;
  user_action?: 'tail' | 'fade';
}

export interface MessagePickAction {
  id: string;
  message_id: string;
  user_id: string;
  action_type: 'tail' | 'fade';
  resulting_bet_id?: string;
  created_at: string;
}

// Media upload types
export interface MediaUploadProgress {
  progress: number;
  isUploading: boolean;
  error?: string;
}

export interface CompressedMedia {
  uri: string;
  type: 'photo' | 'video';
  size: number;
  width?: number;
  height?: number;
  duration?: number;
}

// Message action menu
export interface MessageAction {
  label: string;
  icon: string;
  action: () => void;
  destructive?: boolean;
}

// Privacy and safety types
export type MessageReportReason = 'spam' | 'harassment' | 'inappropriate' | 'hate' | 'other';

export interface MessagePrivacySettings {
  user_id: string;
  who_can_message: 'everyone' | 'following' | 'nobody';
  read_receipts_enabled: boolean;
  typing_indicators_enabled: boolean;
  online_status_visible: boolean;
  updated_at: string;
}

export interface MessageReport {
  id: string;
  message_id: string;
  reporter_id: string;
  reason: MessageReportReason;
  details?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  action_taken?: 'dismissed' | 'content_removed' | 'user_warned' | 'user_banned';
}

export interface GlobalNotificationSettings {
  push_enabled: boolean;
  messages_enabled: boolean;
  social_enabled: boolean;
  betting_enabled: boolean;
}
