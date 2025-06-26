import { create } from 'zustand';
import { ConnectionStatus } from '@/services/realtime/realtimeManager';
import { PresenceState } from '@/services/realtime/presenceService';

interface RealtimeState {
  // Connection status
  connectionStatus: ConnectionStatus;

  // Active channels for debugging
  activeChannels: string[];

  // Presence tracking
  presenceMap: Map<string, PresenceState>;

  // Offline queue
  queuedMessages: number;

  // Latency monitoring
  latency: number | null;

  // Actions
  setConnectionStatus: (status: ConnectionStatus) => void;
  setActiveChannels: (channels: string[]) => void;
  setPresenceMap: (map: Map<string, PresenceState>) => void;
  updatePresence: (userId: string, state: PresenceState) => void;
  removePresence: (userId: string) => void;
  setQueuedCount: (count: number) => void;
  setLatency: (latency: number | null) => void;

  // Helpers
  isUserOnline: (userId: string) => boolean;
  getOnlineUserCount: () => number;
}

export const useRealtimeStore = create<RealtimeState>((set, get) => ({
  // Initial state
  connectionStatus: 'disconnected',
  activeChannels: [],
  presenceMap: new Map(),
  queuedMessages: 0,
  latency: null,

  // Actions
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setActiveChannels: (channels) => set({ activeChannels: channels }),

  setPresenceMap: (map) => set({ presenceMap: map }),

  updatePresence: (userId, state) =>
    set((prev) => {
      const newMap = new Map(prev.presenceMap);
      newMap.set(userId, state);
      return { presenceMap: newMap };
    }),

  removePresence: (userId) =>
    set((prev) => {
      const newMap = new Map(prev.presenceMap);
      newMap.delete(userId);
      return { presenceMap: newMap };
    }),

  setQueuedCount: (count) => set({ queuedMessages: count }),

  setLatency: (latency) => set({ latency }),

  // Helpers
  isUserOnline: (userId) => {
    const presence = get().presenceMap.get(userId);
    return presence?.status === 'online';
  },

  getOnlineUserCount: () => {
    let count = 0;
    get().presenceMap.forEach((presence) => {
      if (presence.status === 'online') {
        count++;
      }
    });
    return count;
  },
}));
