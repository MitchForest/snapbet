import { supabase } from '@/services/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  user_id: string;
  type:
    | 'tail'
    | 'fade'
    | 'bet_won'
    | 'bet_lost'
    | 'tail_won'
    | 'tail_lost'
    | 'fade_won'
    | 'fade_lost'
    | 'follow'
    | 'follow_request'
    | 'message'
    | 'mention'
    | 'milestone'
    | 'system';
  data: {
    actorId?: string;
    actorUsername?: string;
    actorAvatarUrl?: string;
    postId?: string;
    betId?: string;
    amount?: number;
    message?: string;
    gameInfo?: Record<string, unknown>;
    followerId?: string;
    followerUsername?: string;
    followerAvatarUrl?: string;
    requesterId?: string;
    requesterUsername?: string;
    requesterAvatarUrl?: string;
    requestId?: string;
    accepted?: boolean;
    chatId?: string;
    senderId?: string;
    senderUsername?: string;
    senderAvatarUrl?: string;
    preview?: string;
    badgeId?: string;
    badgeName?: string;
    achievement?: string;
    action?: string;
  };
  read: boolean;
  created_at: string;
  read_at: string | null;
}

class NotificationService {
  private channels: Map<string, RealtimeChannel> = new Map();

  async getNotifications(userId: string, limit = 20, offset = 0): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return (data as Notification[]) || [];
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }

    return count || 0;
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }

    return true;
  }

  subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void
  ): () => void {
    // Clean up any existing subscription for this user
    this.unsubscribeFromNotifications(userId);

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onNotification(payload.new as Notification);
        }
      )
      .subscribe();

    this.channels.set(userId, channel);

    // Return cleanup function
    return () => this.unsubscribeFromNotifications(userId);
  }

  private unsubscribeFromNotifications(userId: string): void {
    const channel = this.channels.get(userId);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(userId);
    }
  }

  // Helper method to get notification title and body for display
  getNotificationText(notification: Notification): { title: string; body: string } {
    const { type, data } = notification;

    switch (type) {
      case 'tail':
        return {
          title: 'New Tail',
          body: `@${data.actorUsername} tailed your pick for $${data.amount}`,
        };
      case 'fade':
        return {
          title: 'New Fade',
          body: `@${data.actorUsername} faded your pick for $${data.amount}`,
        };
      case 'bet_won':
        return {
          title: 'Bet Won! 🎉',
          body: `You won $${data.amount} on your bet!`,
        };
      case 'bet_lost':
        return {
          title: 'Bet Lost',
          body: `You lost $${data.amount} on your bet`,
        };
      case 'tail_won':
        return {
          title: 'Tail Won! 🎉',
          body: `Your tail on @${data.actorUsername} won $${data.amount}!`,
        };
      case 'tail_lost':
        return {
          title: 'Tail Lost',
          body: `Your tail on @${data.actorUsername} lost $${data.amount}`,
        };
      case 'fade_won':
        return {
          title: 'Fade Won! 🎉',
          body: `Your fade on @${data.actorUsername} won $${data.amount}!`,
        };
      case 'fade_lost':
        return {
          title: 'Fade Lost',
          body: `Your fade on @${data.actorUsername} lost $${data.amount}`,
        };
      case 'follow':
        return {
          title: data.accepted ? 'Follow Request Accepted' : 'New Follower',
          body: data.accepted
            ? `@${data.followerUsername} accepted your follow request`
            : `@${data.followerUsername} started following you`,
        };
      case 'follow_request':
        return {
          title: 'New Follow Request',
          body: `@${data.requesterUsername} requested to follow you`,
        };
      case 'message':
        return {
          title: 'New Message',
          body: `@${data.senderUsername}: ${data.preview}`,
        };
      case 'mention':
        return {
          title: 'You were mentioned',
          body: `@${data.actorUsername} mentioned you`,
        };
      case 'milestone':
        return {
          title: 'Achievement Unlocked! 🏆',
          body: `You earned the ${data.badgeName} badge!`,
        };
      case 'system':
        return {
          title: 'System Notification',
          body: data.message || 'System update',
        };
      default:
        return {
          title: 'Notification',
          body: 'You have a new notification',
        };
    }
  }

  // Cleanup all subscriptions
  cleanup(): void {
    this.channels.forEach((channel) => channel.unsubscribe());
    this.channels.clear();
  }
}

export const notificationService = new NotificationService();
