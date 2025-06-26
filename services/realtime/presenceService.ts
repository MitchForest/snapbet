import { RealtimeChannel } from '@supabase/supabase-js';
import { AppState, AppStateStatus } from 'react-native';
import { realtimeManager } from './realtimeManager';
import { useRealtimeStore } from '@/stores/realtimeStore';

export interface PresenceState {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
}

interface PresenceData {
  [key: string]: Array<{
    presence_ref: string;
    user_id?: string;
    status?: string;
    last_seen?: string;
  }>;
}

/**
 * Service for managing user presence (online/offline status)
 * Uses a global presence channel for all users
 */
class PresenceService {
  private presenceChannel: RealtimeChannel | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private currentUserId: string | null = null;
  private isPaused = false;
  private appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

  constructor() {
    this.setupAppStateListener();
  }

  private setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'background') {
        this.pause();
      } else if (state === 'active') {
        this.resume();
      }
    });
  }

  /**
   * Start tracking presence for a user
   */
  async trackPresence(userId: string) {
    if (this.currentUserId === userId) {
      console.log('[PresenceService] Already tracking presence for user');
      return;
    }

    this.currentUserId = userId;

    try {
      // Subscribe to global presence channel
      this.presenceChannel = realtimeManager.subscribe('presence:global', userId, {
        presence: true,
        onPresence: (state) => {
          // Type assertion to convert from PresenceState to PresenceData
          const presenceData = state as unknown as PresenceData;
          this.updatePresenceStore(presenceData);
        },
      });

      // Initial presence
      await this.updatePresence('online');

      // Start heartbeat
      this.startHeartbeat();
    } catch (error) {
      console.error('[PresenceService] Error tracking presence:', error);
    }
  }

  /**
   * Update user's presence status
   */
  private async updatePresence(status: PresenceState['status']) {
    if (!this.presenceChannel || !this.currentUserId || this.isPaused) return;

    try {
      await this.presenceChannel.track({
        user_id: this.currentUserId,
        status,
        last_seen: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[PresenceService] Error updating presence:', error);
    }
  }

  /**
   * Start heartbeat to maintain online status
   */
  private startHeartbeat() {
    // Clear existing interval
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (!this.isPaused) {
        this.updatePresence('online');
      }
    }, 30000);
  }

  /**
   * Update the presence store with current state
   */
  private updatePresenceStore(state: PresenceData) {
    const presenceMap = new Map<string, PresenceState>();

    // Process presence data
    Object.values(state).forEach((presences) => {
      presences.forEach((presence) => {
        if (presence.user_id) {
          presenceMap.set(presence.user_id, {
            userId: presence.user_id,
            status: (presence.status as PresenceState['status']) || 'offline',
            lastSeen: presence.last_seen || new Date().toISOString(),
          });
        }
      });
    });

    // Update store
    const store = useRealtimeStore.getState();
    store.setPresenceMap(presenceMap);
  }

  /**
   * Pause presence updates (for background state)
   */
  pause() {
    console.log('[PresenceService] Pausing presence updates');
    this.isPaused = true;

    // Update status to away
    if (this.currentUserId) {
      this.updatePresence('away');
    }
  }

  /**
   * Resume presence updates
   */
  resume() {
    console.log('[PresenceService] Resuming presence updates');
    this.isPaused = false;

    // Update status back to online
    if (this.currentUserId) {
      this.updatePresence('online');
    }
  }

  /**
   * Stop tracking presence
   */
  async stopTracking() {
    console.log('[PresenceService] Stopping presence tracking');

    // Update status to offline
    if (this.currentUserId) {
      await this.updatePresence('offline');
    }

    // Clear heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Untrack from channel
    if (this.presenceChannel) {
      try {
        await this.presenceChannel.untrack();
      } catch (error) {
        console.error('[PresenceService] Error untracking:', error);
      }
    }

    // Unsubscribe from channel
    if (this.currentUserId) {
      realtimeManager.unsubscribe('presence:global', this.currentUserId);
    }

    this.presenceChannel = null;
    this.currentUserId = null;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.stopTracking();

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }

  /**
   * Check if a user is online
   */
  isUserOnline(userId: string): boolean {
    const store = useRealtimeStore.getState();
    const presence = store.presenceMap.get(userId);
    return presence?.status === 'online';
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): string[] {
    const store = useRealtimeStore.getState();
    const onlineUsers: string[] = [];

    store.presenceMap.forEach((presence: PresenceState, userId: string) => {
      if (presence.status === 'online') {
        onlineUsers.push(userId);
      }
    });

    return onlineUsers;
  }
}

// Export singleton instance
export const presenceService = new PresenceService();
