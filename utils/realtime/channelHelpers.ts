/**
 * Utility functions for real-time channel management
 */

/**
 * Generate a consistent channel name for a chat
 */
export function getChatChannelName(chatId: string): string {
  return `chat:${chatId}`;
}

/**
 * Generate a consistent channel name for a user
 */
export function getUserChannelName(userId: string): string {
  return `user:${userId}`;
}

/**
 * Generate a consistent channel name for typing indicators
 */
export function getTypingChannelName(chatId: string): string {
  return `chat:${chatId}:typing`;
}

/**
 * Generate a consistent channel name for presence
 */
export function getPresenceChannelName(): string {
  return 'presence:global';
}

/**
 * Parse channel name to extract type and ID
 */
export function parseChannelName(channelName: string): {
  type: 'chat' | 'user' | 'presence' | 'typing' | 'unknown';
  id?: string;
} {
  const parts = channelName.split(':');

  if (parts[0] === 'chat' && parts.length === 2) {
    return { type: 'chat', id: parts[1] };
  }

  if (parts[0] === 'chat' && parts[2] === 'typing') {
    return { type: 'typing', id: parts[1] };
  }

  if (parts[0] === 'user' && parts.length === 2) {
    return { type: 'user', id: parts[1] };
  }

  if (channelName === 'presence:global') {
    return { type: 'presence' };
  }

  return { type: 'unknown' };
}

/**
 * Check if a channel name is valid
 */
export function isValidChannelName(channelName: string): boolean {
  const { type } = parseChannelName(channelName);
  return type !== 'unknown';
}

/**
 * Get channel priority for cleanup decisions
 * Lower number = higher priority to keep
 */
export function getChannelPriority(channelName: string): number {
  const { type } = parseChannelName(channelName);

  switch (type) {
    case 'presence':
      return 1; // Always keep presence
    case 'chat':
      return 2; // High priority for active chats
    case 'typing':
      return 3; // Medium priority
    case 'user':
      return 4; // Lower priority
    default:
      return 99; // Lowest priority
  }
}
