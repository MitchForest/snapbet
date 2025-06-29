import { supabase } from '@/services/supabase/client';
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

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
    | 'system'
    | 'similar_user_bet'
    | 'behavioral_consensus'
    | 'smart_alert';
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
    // AI notification fields
    aiReason?: string;
    similarUsers?: string[];
    consensusType?: string;
    matchingBets?: number;
  };
  read: boolean;
  created_at: string;
  read_at: string | null;
}

// Add interface for bet details
interface BetDetails {
  team?: string;
  line?: number;
  type?: string;
  odds?: number;
}

// Add interface for bet with relations
interface BetWithRelations {
  id: string;
  user_id: string;
  game_id: string;
  bet_type: string;
  bet_details: BetDetails | null;
  stake: number;
  created_at: string;
  archived: boolean;
  user: {
    username: string;
    display_name?: string;
  };
  game?: {
    home_team: string;
    away_team: string;
    sport: string;
  };
}

class NotificationService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private supabaseClient: SupabaseClient<Database> | null = null;

  initialize(client: SupabaseClient<Database>) {
    this.supabaseClient = client;
  }

  private getClient(): SupabaseClient<Database> {
    if (!this.supabaseClient) {
      // For singleton compatibility, fall back to imported client
      return supabase;
    }
    return this.supabaseClient;
  }

  async getNotifications(userId: string, limit = 20, offset = 0): Promise<Notification[]> {
    const { data, error } = await this.getClient()
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
    const { count, error } = await this.getClient()
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
    const { error } = await this.getClient()
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
    const { error } = await this.getClient()
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

    const channel = this.getClient()
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
          body: `@${data.actorUsername} tailed your pick for $${(data.amount || 0) / 100}`,
        };
      case 'fade':
        return {
          title: 'New Fade',
          body: `@${data.actorUsername} faded your pick for $${(data.amount || 0) / 100}`,
        };
      case 'bet_won':
        return {
          title: 'Bet Won! 🎉',
          body: `You won $${(data.amount || 0) / 100} on your bet!`,
        };
      case 'bet_lost':
        return {
          title: 'Bet Lost',
          body: `You lost $${(data.amount || 0) / 100} on your bet`,
        };
      case 'tail_won':
        return {
          title: 'Tail Won! 🎉',
          body: `Your tail on @${data.actorUsername} won $${(data.amount || 0) / 100}!`,
        };
      case 'tail_lost':
        return {
          title: 'Tail Lost',
          body: `Your tail on @${data.actorUsername} lost $${(data.amount || 0) / 100}`,
        };
      case 'fade_won':
        return {
          title: 'Fade Won! 🎉',
          body: `Your fade on @${data.actorUsername} won $${(data.amount || 0) / 100}!`,
        };
      case 'fade_lost':
        return {
          title: 'Fade Lost',
          body: `Your fade on @${data.actorUsername} lost $${(data.amount || 0) / 100}`,
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
      case 'similar_user_bet':
        return {
          title: '🎯 Similar Bettor Alert',
          body: data.message || 'A similar bettor placed a new bet',
        };
      case 'behavioral_consensus':
        return {
          title: '🤝 Consensus Alert',
          body: data.message || 'Multiple similar bettors made the same bet',
        };
      case 'smart_alert':
        return {
          title: '✨ Smart Alert',
          body: data.message || 'New betting opportunity detected',
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

  /**
   * Generate smart notifications based on behavioral patterns
   * Called by production job every 5 minutes
   */
  async generateSmartNotifications(userId: string): Promise<void> {
    try {
      // Get user's behavioral embedding
      const { data: user } = await this.getClient()
        .from('users')
        .select('profile_embedding')
        .eq('id', userId)
        .single();

      if (!user?.profile_embedding) return;

      // Find behaviorally similar users
      const { data: similarUsers } = await this.getClient().rpc('find_similar_users', {
        query_embedding: user.profile_embedding,
        p_user_id: userId,
        limit_count: 30,
      });

      if (!similarUsers?.length) return;

      // Check for notification-worthy activities
      await Promise.all([
        this.checkSimilarUserBets(userId, similarUsers),
        this.checkConsensusPatterns(userId, similarUsers),
      ]);
    } catch (error) {
      console.error('Error generating smart notifications:', error);
    }
  }

  /**
   * Notify about bets from behaviorally similar users
   */
  private async checkSimilarUserBets(
    userId: string,
    similarUsers: Array<{ id: string; username: string }>
  ): Promise<void> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    // Get recent bets from similar users
    const { data: recentBets } = await this.getClient()
      .from('bets')
      .select(
        `
        *,
        user:users!user_id(username, display_name),
        game:games!game_id(home_team, away_team, sport)
      `
      )
      .in(
        'user_id',
        similarUsers.map((u) => u.id)
      )
      .gte('created_at', thirtyMinutesAgo)
      .eq('archived', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!recentBets?.length) return;

    // Cast to proper type
    const typedBets = recentBets as unknown as BetWithRelations[];

    // Find interesting bets with reasons
    const interestingBets = this.findInterestingBetsWithReasons(typedBets);

    for (const pattern of interestingBets) {
      await this.createSmartNotification(userId, {
        type: 'similar_user_bet',
        title: '🎯 Similar Bettor Alert',
        message: pattern.message,
        data: {
          ...pattern.data,
          aiReason: pattern.behavioralReason,
        },
      });
    }
  }

  /**
   * Check for consensus patterns among similar users
   */
  private async checkConsensusPatterns(
    userId: string,
    similarUsers: Array<{ id: string; username: string }>
  ): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Get user's recent bets
    const { data: userBets } = await this.getClient()
      .from('bets')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo)
      .eq('archived', false);

    if (!userBets?.length) return;

    // For each bet, check if similar users made the same bet
    for (const userBet of userBets) {
      // Type guard for bet_details
      if (!userBet.bet_details || typeof userBet.bet_details !== 'object') continue;

      const betDetails = userBet.bet_details as BetDetails;
      if (!betDetails.team) continue;

      const { data: matchingBets } = await this.getClient()
        .from('bets')
        .select(
          `
          *,
          user:users!user_id(username, display_name)
        `
        )
        .in(
          'user_id',
          similarUsers.map((u) => u.id)
        )
        .eq('game_id', userBet.game_id)
        .eq('bet_type', userBet.bet_type)
        .eq('bet_details->team', betDetails.team)
        .gte('created_at', oneHourAgo);

      if (matchingBets && matchingBets.length >= 2) {
        const typedMatchingBets = matchingBets as Array<{
          user: { username: string };
          user_id: string;
        }>;
        const usernames = typedMatchingBets.map((b) => b.user.username);
        const team = betDetails.team;
        const message =
          matchingBets.length === 2
            ? `${usernames.join(' and ')} also bet ${team} ${userBet.bet_type}`
            : `${matchingBets.length} similar bettors including ${usernames[0]} bet ${team}`;

        await this.createSmartNotification(userId, {
          type: 'behavioral_consensus',
          title: '🤝 Consensus Alert',
          message,
          data: {
            betId: userBet.id,
            similarUsers: typedMatchingBets.map((b) => b.user_id),
            consensusType: 'behavioral',
            matchingBets: matchingBets.length,
          },
        });
      }
    }
  }

  /**
   * Find bets that would interest this user based on behavior
   */
  private findInterestingBetsWithReasons(
    bets: BetWithRelations[]
  ): Array<{ message: string; data: Record<string, unknown>; behavioralReason: string }> {
    const patterns: Array<{
      message: string;
      data: Record<string, unknown>;
      behavioralReason: string;
    }> = [];

    // Group by game and bet type
    const gameGroups = new Map<string, BetWithRelations[]>();
    bets.forEach((bet) => {
      const key = `${bet.game_id}-${bet.bet_type}`;
      if (!gameGroups.has(key)) gameGroups.set(key, []);
      gameGroups.get(key)!.push(bet);
    });

    // Find consensus patterns
    gameGroups.forEach((groupBets) => {
      if (groupBets.length >= 3) {
        const firstBet = groupBets[0];
        const usernames = groupBets.map((b) => b.user.username).slice(0, 3);
        const team = firstBet.bet_details?.team || 'selection';

        patterns.push({
          message: `${usernames.join(', ')} all bet ${team} ${firstBet.bet_type}`,
          data: {
            gameId: firstBet.game_id,
            betType: firstBet.bet_type,
            team: team,
            userCount: groupBets.length,
          },
          behavioralReason: 'Multiple similar bettors on same pick',
        });
      }
    });

    // Find high-value bets from similar users
    const highValueBets = bets.filter((b) => b.stake >= 15000); // $150+
    if (highValueBets.length > 0) {
      const bet = highValueBets[0];
      const team = bet.bet_details?.team || 'selection';
      patterns.push({
        message: `${bet.user.username} just placed $${bet.stake / 100} on ${team}`,
        data: {
          betId: bet.id,
          amount: bet.stake,
          userId: bet.user_id,
        },
        behavioralReason: 'High-confidence bet from similar bettor',
      });
    }

    return patterns.slice(0, 3); // Max 3 notifications
  }

  /**
   * Create a smart notification
   */
  private async createSmartNotification(
    userId: string,
    notification: {
      type: string;
      title: string;
      message: string;
      data: Record<string, unknown>;
    }
  ): Promise<void> {
    await this.getClient()
      .from('notifications')
      .insert({
        user_id: userId,
        type: notification.type,
        data: {
          ...notification.data,
          message: notification.message,
        },
        read: false,
        created_at: new Date().toISOString(),
      });

    // TODO: Send push notification if enabled
    // await this.sendPushNotification(userId, notification.title, notification.message);
  }
}

export const notificationService = new NotificationService();
