import { MMKV } from 'react-native-mmkv';

// Create separate MMKV instances for different domains
const feedStorage = new MMKV({
  id: 'snapbet-feed',
  encryptionKey: undefined, // Add encryption in production
});

const settingsStorage = new MMKV({
  id: 'snapbet-settings',
  encryptionKey: undefined,
});

const generalStorage = new MMKV({
  id: 'snapbet-general',
  encryptionKey: undefined,
});

// Type-safe storage keys
export const StorageKeys = {
  FEED: {
    CACHED_POSTS: 'feed_cached_posts',
    LAST_REFRESH: 'feed_last_refresh',
    CURSOR: 'feed_cursor',
  },
  SETTINGS: {
    USER_PREFERENCES: 'user_preferences',
    CAMERA_SETTINGS: 'camera_settings',
    NOTIFICATION_SETTINGS: 'notification_settings',
  },
  GENERAL: {
    VIEWED_STORIES: 'viewed_stories',
    DRAFT_POST: 'draft_post',
    SEARCH_HISTORY: 'search_history',
  },
} as const;

// Type-safe storage interface
interface StorageInterface {
  set: <T>(key: string, value: T) => void;
  get: <T>(key: string) => T | null;
  delete: (key: string) => void;
  clearAll: () => void;
  contains: (key: string) => boolean;
}

// Storage wrapper with JSON serialization
class MMKVStorage implements StorageInterface {
  constructor(private storage: MMKV) {}

  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      this.storage.set(key, serialized);
    } catch (error) {
      console.error(`Failed to store ${key}:`, error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const value = this.storage.getString(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error);
      return null;
    }
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  clearAll(): void {
    this.storage.clearAll();
  }

  contains(key: string): boolean {
    return this.storage.contains(key);
  }
}

// Export storage instances
export const Storage = {
  feed: new MMKVStorage(feedStorage),
  settings: new MMKVStorage(settingsStorage),
  general: new MMKVStorage(generalStorage),
};

// Cache utilities
export const CacheUtils = {
  isExpired: (timestamp: number, ttlMs: number): boolean => {
    return Date.now() - timestamp > ttlMs;
  },

  getCacheKey: (prefix: string, ...parts: string[]): string => {
    return [prefix, ...parts].join(':');
  },
};

// Migration utility for AsyncStorage -> MMKV
export async function migrateFromAsyncStorage(
  asyncStorageKey: string,
  mmkvKey: string,
  storage: StorageInterface
): Promise<void> {
  try {
    // Dynamic import to avoid require
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    const value = await AsyncStorage.getItem(asyncStorageKey);
    if (value) {
      storage.set(mmkvKey, JSON.parse(value));
      await AsyncStorage.removeItem(asyncStorageKey);
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
}
