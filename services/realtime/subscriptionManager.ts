import { supabase } from '@/services/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Use Record type for database row to avoid type conflicts
type DatabaseRow = Record<string, unknown>;

interface SubscriptionHandlers {
  onComment?: (payload: RealtimePostgresChangesPayload<DatabaseRow>) => void;
  onReaction?: (payload: RealtimePostgresChangesPayload<DatabaseRow>) => void;
  onPickAction?: (payload: RealtimePostgresChangesPayload<DatabaseRow>) => void;
}

/**
 * Centralized manager for real-time subscriptions
 * Prevents duplicate subscriptions and manages cleanup
 */
class SubscriptionManager {
  private subscriptions = new Map<string, RealtimeChannel>();
  private refCounts = new Map<string, number>();

  /**
   * Subscribe to real-time updates for a specific post
   */
  subscribeToPost(postId: string, handlers: SubscriptionHandlers): () => void {
    const key = `post_${postId}`;

    // Increment reference count
    const currentCount = this.refCounts.get(key) || 0;
    this.refCounts.set(key, currentCount + 1);

    // If subscription already exists, reuse it
    if (this.subscriptions.has(key)) {
      // Return cleanup function
      return () => this.unsubscribeFromPost(postId);
    }

    // Create new subscription
    const channel = supabase
      .channel(key)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          handlers.onComment?.(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          handlers.onReaction?.(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pick_actions',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          handlers.onPickAction?.(payload);
        }
      )
      .subscribe();

    this.subscriptions.set(key, channel);

    // Return cleanup function
    return () => this.unsubscribeFromPost(postId);
  }

  /**
   * Subscribe to real-time updates for user notifications
   */
  subscribeToUserNotifications(
    userId: string,
    onNotification: (payload: RealtimePostgresChangesPayload<DatabaseRow>) => void
  ): () => void {
    const key = `notifications_${userId}`;

    // Increment reference count
    const currentCount = this.refCounts.get(key) || 0;
    this.refCounts.set(key, currentCount + 1);

    if (this.subscriptions.has(key)) {
      return () => this.unsubscribeFromUserNotifications(userId);
    }

    const channel = supabase
      .channel(key)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        onNotification
      )
      .subscribe();

    this.subscriptions.set(key, channel);

    return () => this.unsubscribeFromUserNotifications(userId);
  }

  /**
   * Unsubscribe from post updates
   */
  private unsubscribeFromPost(postId: string): void {
    const key = `post_${postId}`;

    // Decrement reference count
    const currentCount = this.refCounts.get(key) || 0;
    if (currentCount <= 1) {
      // Last reference, actually unsubscribe
      const channel = this.subscriptions.get(key);
      if (channel) {
        channel.unsubscribe();
        this.subscriptions.delete(key);
      }
      this.refCounts.delete(key);
    } else {
      this.refCounts.set(key, currentCount - 1);
    }
  }

  /**
   * Unsubscribe from user notifications
   */
  private unsubscribeFromUserNotifications(userId: string): void {
    const key = `notifications_${userId}`;

    const currentCount = this.refCounts.get(key) || 0;
    if (currentCount <= 1) {
      const channel = this.subscriptions.get(key);
      if (channel) {
        channel.unsubscribe();
        this.subscriptions.delete(key);
      }
      this.refCounts.delete(key);
    } else {
      this.refCounts.set(key, currentCount - 1);
    }
  }

  /**
   * Get subscription status for debugging
   */
  getSubscriptionStatus(): {
    activeSubscriptions: string[];
    totalChannels: number;
  } {
    return {
      activeSubscriptions: Array.from(this.subscriptions.keys()),
      totalChannels: this.subscriptions.size,
    };
  }

  /**
   * Clean up all subscriptions (call on app unmount)
   */
  cleanup(): void {
    this.subscriptions.forEach((channel) => {
      channel.unsubscribe();
    });
    this.subscriptions.clear();
    this.refCounts.clear();
  }
}

export const subscriptionManager = new SubscriptionManager();
