import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase/client';
import { AppState, AppStateStatus } from 'react-native';

// Types
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Type for broadcast payload
export interface BroadcastPayload<T = unknown> {
  type: 'broadcast';
  event: string;
  payload: T;
}

// Type for presence state
export type PresenceState = Record<string, unknown[]>;

export interface ChannelConfig {
  postgres?: {
    event: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
    schema: string;
    table: string;
    filter?: string;
  };
  onPostgres?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  broadcast?: { event: string };
  onBroadcast?: (payload: BroadcastPayload) => void;
  presence?: boolean;
  onPresence?: (state: PresenceState) => void;
}

interface SubscriptionOptions {
  autoReconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

interface ChannelInfo {
  channel: RealtimeChannel;
  subscribers: Set<string>;
  options: SubscriptionOptions;
  reconnectAttempts: number;
  isSubscribed: boolean;
}

/**
 * Centralized manager for all real-time subscriptions
 * Implements reference counting and channel pooling
 */
class RealtimeManager {
  private channels: Map<string, ChannelInfo> = new Map();
  private isPaused = false;
  private appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();

  constructor() {
    this.setupAppStateListener();
  }

  private setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'background') {
        this.pauseNewSubscriptions();
      } else if (state === 'active') {
        this.resumeSubscriptions();
        this.resubscribeAll();
      }
    });
  }

  /**
   * Subscribe to a channel with automatic reference counting
   */
  subscribe(
    channelName: string,
    subscriberId: string,
    config: ChannelConfig,
    options: SubscriptionOptions = {}
  ): RealtimeChannel {
    // Don't create new subscriptions if paused
    if (this.isPaused && !this.channels.has(channelName)) {
      throw new Error('Real-time subscriptions are paused');
    }

    const defaultOptions: SubscriptionOptions = {
      autoReconnect: true,
      reconnectDelay: 1000,
      maxReconnectAttempts: 5,
      ...options,
    };

    let channelInfo = this.channels.get(channelName);

    if (!channelInfo) {
      // Create new channel with proper configuration
      const channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: true },
          presence: config.presence ? { key: subscriberId } : undefined,
        },
      });

      // Configure postgres changes
      if (config.postgres && config.onPostgres) {
        const postgresChannel = channel as RealtimeChannel & {
          on(
            event: 'postgres_changes',
            opts: typeof config.postgres,
            callback: typeof config.onPostgres
          ): RealtimeChannel;
        };
        postgresChannel.on('postgres_changes', config.postgres, config.onPostgres);
      }

      // Configure broadcast
      if (config.broadcast && config.onBroadcast) {
        channel.on('broadcast', config.broadcast, config.onBroadcast);
      }

      // Configure presence
      if (config.presence && config.onPresence) {
        channel
          .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            config.onPresence!(state);
          })
          .on('presence', { event: 'join' }, () => {
            const state = channel.presenceState();
            config.onPresence!(state);
          })
          .on('presence', { event: 'leave' }, () => {
            const state = channel.presenceState();
            config.onPresence!(state);
          });
      }

      channelInfo = {
        channel,
        subscribers: new Set(),
        options: defaultOptions,
        reconnectAttempts: 0,
        isSubscribed: false,
      };

      this.channels.set(channelName, channelInfo);
    }

    // Add subscriber
    channelInfo.subscribers.add(subscriberId);

    // Subscribe if first subscriber
    if (channelInfo.subscribers.size === 1 && !channelInfo.isSubscribed) {
      this.subscribeChannel(channelName, channelInfo);
    }

    return channelInfo.channel;
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channelName: string, subscriberId: string) {
    const channelInfo = this.channels.get(channelName);
    if (!channelInfo) return;

    channelInfo.subscribers.delete(subscriberId);

    // Cleanup if no more subscribers
    if (channelInfo.subscribers.size === 0) {
      channelInfo.channel.unsubscribe();
      this.channels.delete(channelName);
    }
  }

  /**
   * Get a channel if it exists
   */
  getChannel(channelName: string): RealtimeChannel | null {
    return this.channels.get(channelName)?.channel || null;
  }

  /**
   * Get health information about the real-time system
   */
  getHealth() {
    const activeChannels = Array.from(this.channels.keys());
    let totalSubscribers = 0;

    this.channels.forEach((info) => {
      totalSubscribers += info.subscribers.size;
    });

    return {
      activeChannels: activeChannels.length,
      totalSubscribers,
      connectionStatus: this.connectionStatus,
      isPaused: this.isPaused,
      channels: activeChannels,
    };
  }

  /**
   * Setup channel listeners based on config
   */
  private setupChannelListeners(channel: RealtimeChannel, config: ChannelConfig) {
    // For postgres changes, we need to use the pattern from useChats
    if (config.postgres && config.onPostgres) {
      const postgresChannel = channel as RealtimeChannel & {
        on(
          event: 'postgres_changes',
          opts: typeof config.postgres,
          callback: typeof config.onPostgres
        ): RealtimeChannel;
      };
      postgresChannel.on('postgres_changes', config.postgres, config.onPostgres);
    }

    // Configure broadcast
    if (config.broadcast && config.onBroadcast) {
      channel.on('broadcast', config.broadcast, config.onBroadcast);
    }

    // Configure presence
    if (config.presence && config.onPresence) {
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        config.onPresence!(state);
      });
      channel.on('presence', { event: 'join' }, () => {
        const state = channel.presenceState();
        config.onPresence!(state);
      });
      channel.on('presence', { event: 'leave' }, () => {
        const state = channel.presenceState();
        config.onPresence!(state);
      });
    }
  }

  /**
   * Subscribe a channel with error handling and reconnection
   */
  private async subscribeChannel(channelName: string, channelInfo: ChannelInfo) {
    try {
      this.updateConnectionStatus('connecting');

      channelInfo.channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[RealtimeManager] Channel ${channelName} subscribed`);
          channelInfo.isSubscribed = true;
          channelInfo.reconnectAttempts = 0;
          this.updateConnectionStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[RealtimeManager] Channel ${channelName} error`);
          channelInfo.isSubscribed = false;
          this.updateConnectionStatus('error');

          // Attempt reconnection if enabled
          if (
            channelInfo.options.autoReconnect &&
            channelInfo.reconnectAttempts < (channelInfo.options.maxReconnectAttempts || 5)
          ) {
            this.scheduleReconnect(channelName, channelInfo);
          }
        } else if (status === 'TIMED_OUT') {
          console.error(`[RealtimeManager] Channel ${channelName} timed out`);
          channelInfo.isSubscribed = false;
          this.updateConnectionStatus('disconnected');
        }
      });
    } catch (error) {
      console.error('[RealtimeManager] Subscribe error:', error);
      this.updateConnectionStatus('error');
    }
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(channelName: string, channelInfo: ChannelInfo) {
    const delay =
      (channelInfo.options.reconnectDelay || 1000) * Math.pow(2, channelInfo.reconnectAttempts);

    channelInfo.reconnectAttempts++;

    setTimeout(() => {
      if (this.channels.has(channelName)) {
        console.log(
          `[RealtimeManager] Reconnecting ${channelName}, attempt ${channelInfo.reconnectAttempts}`
        );
        this.subscribeChannel(channelName, channelInfo);
      }
    }, delay);
  }

  /**
   * Pause new subscriptions (for background state)
   */
  pauseNewSubscriptions() {
    console.log('[RealtimeManager] Pausing new subscriptions');
    this.isPaused = true;
  }

  /**
   * Resume subscriptions
   */
  resumeSubscriptions() {
    console.log('[RealtimeManager] Resuming subscriptions');
    this.isPaused = false;
  }

  /**
   * Resubscribe all existing channels
   */
  async resubscribeAll() {
    console.log('[RealtimeManager] Resubscribing all channels');

    for (const [channelName, channelInfo] of this.channels.entries()) {
      if (!channelInfo.isSubscribed) {
        await this.subscribeChannel(channelName, channelInfo);
      }
    }
  }

  /**
   * Update connection status and notify listeners
   */
  private updateConnectionStatus(status: ConnectionStatus) {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      this.statusListeners.forEach((listener) => listener(status));
    }
  }

  /**
   * Add a connection status listener
   */
  onConnectionStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    // Immediately call with current status
    listener(this.connectionStatus);

    // Return cleanup function
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  /**
   * Clean up all subscriptions
   */
  cleanup() {
    console.log('[RealtimeManager] Cleaning up all subscriptions');

    this.channels.forEach((channelInfo, _channelName) => {
      channelInfo.channel.unsubscribe();
    });

    this.channels.clear();
    this.statusListeners.clear();

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }
}

// Export singleton instance
export const realtimeManager = new RealtimeManager();
