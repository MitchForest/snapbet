import { DeviceEventEmitter } from 'react-native';

/**
 * Event names for feed-related events
 */
export const FeedEvents = {
  FOLLOW_STATUS_CHANGED: 'FOLLOW_STATUS_CHANGED',
  POST_CREATED: 'POST_CREATED',
  POST_DELETED: 'POST_DELETED',
  POST_UPDATED: 'POST_UPDATED',
  STORY_CREATED: 'STORY_CREATED',
  STORY_EXPIRED: 'STORY_EXPIRED',
  FEED_SCROLL: 'FEED_SCROLL',
} as const;

/**
 * Event names for engagement-related events
 */
export const EngagementEvents = {
  COMMENT_ADDED: 'COMMENT_ADDED',
  COMMENT_DELETED: 'COMMENT_DELETED',
  REACTION_CHANGED: 'REACTION_CHANGED',
  TAIL_FADE_CHANGED: 'TAIL_FADE_CHANGED',
} as const;

/**
 * Event names for user-related events
 */
export const UserEvents = {
  PROFILE_UPDATED: 'PROFILE_UPDATED',
  PRIVACY_SETTINGS_CHANGED: 'PRIVACY_SETTINGS_CHANGED',
  FOLLOW_REQUEST_SENT: 'FOLLOW_REQUEST_SENT',
  FOLLOW_REQUEST_ACCEPTED: 'FOLLOW_REQUEST_ACCEPTED',
  FOLLOW_REQUEST_REJECTED: 'FOLLOW_REQUEST_REJECTED',
} as const;

/**
 * Event names for moderation-related events
 */
export const ModerationEvents = {
  USER_BLOCKED: 'user:blocked',
  USER_UNBLOCKED: 'user:unblocked',
  CONTENT_REPORTED: 'content:reported',
  CONTENT_HIDDEN: 'content:hidden',
} as const;

// Type for all event names
export type EventName =
  | (typeof FeedEvents)[keyof typeof FeedEvents]
  | (typeof EngagementEvents)[keyof typeof EngagementEvents]
  | (typeof UserEvents)[keyof typeof UserEvents]
  | (typeof ModerationEvents)[keyof typeof ModerationEvents];

// Event data types
export interface EventData {
  [FeedEvents.FOLLOW_STATUS_CHANGED]: { userId: string; isFollowing: boolean };
  [FeedEvents.POST_CREATED]: { postId: string };
  [FeedEvents.POST_DELETED]: { postId: string };
  [FeedEvents.POST_UPDATED]: { postId: string };
  [FeedEvents.STORY_CREATED]: { storyId: string };
  [FeedEvents.STORY_EXPIRED]: { storyId: string };
  [FeedEvents.FEED_SCROLL]: { contentOffset: { y: number } };
  [EngagementEvents.COMMENT_ADDED]: { postId: string; commentId: string };
  [EngagementEvents.COMMENT_DELETED]: { postId: string; commentId: string };
  [EngagementEvents.REACTION_CHANGED]: { postId: string; emoji?: string };
  [EngagementEvents.TAIL_FADE_CHANGED]: { postId: string; action: 'tail' | 'fade' | null };
  [UserEvents.PROFILE_UPDATED]: { userId: string };
  [UserEvents.PRIVACY_SETTINGS_CHANGED]: { userId: string; isPrivate: boolean };
  [UserEvents.FOLLOW_REQUEST_SENT]: { fromUserId: string; toUserId: string };
  [UserEvents.FOLLOW_REQUEST_ACCEPTED]: { fromUserId: string; toUserId: string };
  [UserEvents.FOLLOW_REQUEST_REJECTED]: { fromUserId: string; toUserId: string };
  [ModerationEvents.USER_BLOCKED]: { userId: string; blockedBy: string };
  [ModerationEvents.USER_UNBLOCKED]: { userId: string; unblockedBy: string };
  [ModerationEvents.CONTENT_REPORTED]: {
    contentType: string;
    contentId: string;
    reporterId: string;
  };
  [ModerationEvents.CONTENT_HIDDEN]: { contentType: string; contentId: string };
}

/**
 * Type-safe event emitter for React Native
 * Uses DeviceEventEmitter under the hood for cross-component communication
 */
export const eventEmitter = {
  /**
   * Emit an event with optional data
   */
  emit<T extends EventName>(event: T, data?: EventData[T]): void {
    DeviceEventEmitter.emit(event, data);
  },

  /**
   * Add a listener for an event
   * Returns a subscription that must be removed when component unmounts
   */
  addListener<T extends EventName>(event: T, callback: (data: EventData[T]) => void) {
    return DeviceEventEmitter.addListener(event, callback);
  },

  /**
   * Remove all listeners for a specific event
   * Use sparingly - prefer removing individual subscriptions
   */
  removeAllListeners(event: EventName): void {
    DeviceEventEmitter.removeAllListeners(event);
  },
};

/**
 * Example usage in components:
 *
 * // In a component that needs to react to follow status changes:
 * useEffect(() => {
 *   const subscription = eventEmitter.addListener(
 *     FeedEvents.FOLLOW_STATUS_CHANGED,
 *     ({ userId, isFollowing }) => {
 *       // Refresh feed or update UI
 *       console.log(`User ${userId} follow status: ${isFollowing}`);
 *     }
 *   );
 *
 *   return () => {
 *     subscription.remove();
 *   };
 * }, []);
 *
 * // When following/unfollowing a user:
 * await followUser(userId);
 * eventEmitter.emit(FeedEvents.FOLLOW_STATUS_CHANGED, { userId, isFollowing: true });
 */
