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
    | 'message'
    | 'mention'
    | 'milestone';
  data: {
    actorId?: string;
    actorUsername?: string;
    postId?: string;
    betId?: string;
    amount?: number;
    message?: string;
    gameInfo?: Record<string, any>;
    followerId?: string;
    followerUsername?: string;
    chatId?: string;
    senderId?: string;
    senderUsername?: string;
    preview?: string;
    badgeId?: string;
    badgeName?: string;
    achievement?: string;
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

  // Helper method to format notification text for display
  getNotificationText(notification: Notification): string {
    const { type, data } = notification;

    switch (type) {
      case 'tail':
        return `${data.actorUsername} tailed your pick for $${data.amount}`;
      case 'fade':
        return `${data.actorUsername} faded your pick for $${data.amount}`;
      case 'bet_won':
        return `You won $${data.amount} on your bet!`;
      case 'bet_lost':
        return `You lost $${data.amount} on your bet`;
      case 'tail_won':
        return `Your tail on ${data.actorUsername} won $${data.amount}!`;
      case 'tail_lost':
        return `Your tail on ${data.actorUsername} lost $${data.amount}`;
      case 'fade_won':
        return `Your fade on ${data.actorUsername} won $${data.amount}!`;
      case 'fade_lost':
        return `Your fade on ${data.actorUsername} lost $${data.amount}`;
      case 'follow':
        return `${data.followerUsername} started following you`;
      case 'message':
        return `${data.senderUsername}: ${data.preview}`;
      case 'mention':
        return `${data.actorUsername} mentioned you`;
      case 'milestone':
        return `You earned the ${data.badgeName} badge!`;
      default:
        return 'New notification';
    }
  }

  // Cleanup all subscriptions
  cleanup(): void {
    this.channels.forEach((channel) => channel.unsubscribe());
    this.channels.clear();
  }
}

export const notificationService = new NotificationService();
