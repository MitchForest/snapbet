import { MMKV } from 'react-native-mmkv';

// This declaration is used to inform TypeScript about the existence of a global property
// that is injected by React Native's JSI environment. This prevents type errors.
declare const global: { nativeCallSyncHook: unknown };

// --- Lazy-loaded and debugger-safe MMKV instances ---

let feedStorageInstance: MMKV | null = null;
let settingsStorageInstance: MMKV | null = null;
let generalStorageInstance: MMKV | null = null;

// In-memory fallback for remote debugging environments where JSI is not available.
const createInMemoryStorage = (): MMKV => {
  const memoryStore = new Map<string, string | number | boolean>();
  console.warn(
    'MMKV is not available in the remote debugger. Using in-memory storage. Data will not be persisted.'
  );
  return {
    clearAll: () => memoryStore.clear(),
    delete: (key: string) => memoryStore.delete(key),
    set: (key: string, value: string | number | boolean) => {
      memoryStore.set(key, value);
    },
    getString: (key: string) => memoryStore.get(key) as string | undefined,
    getNumber: (key: string) => memoryStore.get(key) as number | undefined,
    getBoolean: (key: string) => memoryStore.get(key) as boolean | undefined,
    getAllKeys: () => Array.from(memoryStore.keys()),
    contains: (key: string) => memoryStore.has(key),
    recrypt: () => {
      console.warn('MMKV.recrypt is not available in in-memory storage.');
    },
  } as unknown as MMKV;
};

const getStorageInstance = (id: string): MMKV => {
  // Check if running in a remote debugger (where JSI is not available)
  if (__DEV__ && typeof global.nativeCallSyncHook === 'undefined') {
    return createInMemoryStorage();
  }
  try {
    return new MMKV({
      id: `snapbet-${id}`,
      // TODO: Replace with a secure keychain/keystore solution for production
      encryptionKey: 'snapbet-super-secret-key',
    });
  } catch (e) {
    console.error(`Failed to create MMKV instance for ID: ${id}`, e);
    // Fallback to in-memory storage on any initialization error
    return createInMemoryStorage();
  }
};

// Lazy getters that initialize storage on first use
const getFeedStorage = (): MMKV => {
  if (!feedStorageInstance) {
    feedStorageInstance = getStorageInstance('feed-storage');
  }
  return feedStorageInstance;
};

const getSettingsStorage = (): MMKV => {
  if (!settingsStorageInstance) {
    settingsStorageInstance = getStorageInstance('settings-storage');
  }
  return settingsStorageInstance;
};

const getGeneralStorage = (): MMKV => {
  if (!generalStorageInstance) {
    generalStorageInstance = getStorageInstance('general-storage');
  }
  return generalStorageInstance;
};

// --- Storage Keys (restored for compatibility) ---
export const StorageKeys = {
  FEED: {
    CACHED_POSTS: 'feed_cached_posts',
    CURSOR: 'feed_cursor',
  },
  PRIVACY: {
    SETTINGS_CACHE: 'privacy_settings_cache',
  },
  SOCIAL: {
    FOLLOW_STATES: 'follow_states',
  },
  SEARCH: {
    RECENT_SEARCHES: 'recent_searches',
  },
};

// --- Cache Utils (restored for compatibility) ---
export const CacheUtils = {
  isExpired: (timestamp: number, ttl: number): boolean => {
    return Date.now() - timestamp > ttl;
  },
  getCacheKey: (prefix: string, key: string): string => {
    return `${prefix}:${key}`;
  },
};

// --- Generic Storage Wrapper (restored for compatibility) ---
// This wrapper mimics the old API, handling JSON parsing automatically.
const createStorageWrapper = (storageInstance: MMKV) => ({
  get: <T>(key: string): T | null => {
    const value = storageInstance.getString(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        console.error(`[Storage] Failed to parse JSON for key "${key}"`, e);
        return null;
      }
    }
    return null;
  },
  set: (key: string, value: unknown): void => {
    try {
      const stringValue = JSON.stringify(value);
      storageInstance.set(key, stringValue);
    } catch (e) {
      console.error(`[Storage] Failed to stringify value for key "${key}"`, e);
    }
  },
  delete: (key: string): void => {
    storageInstance.delete(key);
  },
  clearAll: (): void => {
    storageInstance.clearAll();
  },
});

// --- Exported Storage API (restored for compatibility) ---
// This provides the `Storage.general`, `Storage.feed`, etc. properties
// that the rest of the application code expects.
export const Storage = {
  get general() {
    return createStorageWrapper(getGeneralStorage());
  },
  get feed() {
    return createStorageWrapper(getFeedStorage());
  },
  get settings() {
    return createStorageWrapper(getSettingsStorage());
  },
};
