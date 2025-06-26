import { MMKV } from 'react-native-mmkv';

// This declaration is used to inform TypeScript about the existence of a global property
// that is injected by React Native's JSI environment. This prevents type errors.
declare const global: { nativeCallSyncHook: unknown };

// --- Lazy-loaded and debugger-safe MMKV instances ---

let feedStorageInstance: MMKV | null = null;
let settingsStorageInstance: MMKV | null = null;
let generalStorageInstance: MMKV | null = null;
let gamesStorageInstance: MMKV | null = null;
let authStorageInstance: MMKV | null = null;
let appStorageInstance: MMKV | null = null;

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

const getGamesStorage = (): MMKV => {
  if (!gamesStorageInstance) {
    gamesStorageInstance = getStorageInstance('games-storage');
  }
  return gamesStorageInstance;
};

const getAuthStorage = (): MMKV => {
  if (!authStorageInstance) {
    authStorageInstance = getStorageInstance('auth-storage');
  }
  return authStorageInstance;
};

const getAppStorage = (): MMKV => {
  if (!appStorageInstance) {
    appStorageInstance = getStorageInstance('app-storage');
  }
  return appStorageInstance;
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
  GAMES: {
    CACHED_GAMES: 'games_cached',
    LAST_FETCH: 'games_last_fetch',
  },
  BETTING: {
    SELECTED_GAME: 'selected_game',
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
  get games() {
    return createStorageWrapper(getGamesStorage());
  },
  get betting() {
    return createStorageWrapper(getGeneralStorage()); // Use general storage for betting
  },
};

// Create storage instances
const authStorage = getAuthStorage();
const appStorage = getAppStorage();

// --- Storage Service (Public API) ---
const storageService = {
  // Auth storage methods
  getAccessToken: () => authStorage.getString('access_token'),
  setAccessToken: (token: string) => authStorage.set('access_token', token),
  clearAccessToken: () => authStorage.delete('access_token'),

  getRefreshToken: () => authStorage.getString('refresh_token'),
  setRefreshToken: (token: string) => authStorage.set('refresh_token', token),
  clearRefreshToken: () => authStorage.delete('refresh_token'),

  // User storage methods
  getUser: () => {
    const userString = authStorage.getString('user');
    return userString ? JSON.parse(userString) : null;
  },
  setUser: (user: unknown) => authStorage.set('user', JSON.stringify(user)),
  clearUser: () => authStorage.delete('user'),

  // Clear all auth data
  clearAuth: () => {
    authStorage.delete('access_token');
    authStorage.delete('refresh_token');
    authStorage.delete('user');
  },

  // App storage methods
  getOnboardingComplete: () => appStorage.getBoolean('onboarding_complete') ?? false,
  setOnboardingComplete: (complete: boolean) => appStorage.set('onboarding_complete', complete),

  getLastViewedNotification: () => appStorage.getString('last_viewed_notification'),
  setLastViewedNotification: (id: string) => appStorage.set('last_viewed_notification', id),

  // Media storage paths
  getPostMediaPath: (userId: string, filename: string) => `posts/${userId}/${filename}`,
  getStoryMediaPath: (userId: string, filename: string) => `stories/${userId}/${filename}`,
  getMessageMediaPath: (chatId: string, messageId: string, filename: string) =>
    `messages/${chatId}/${messageId}/${filename}`,
  getGroupAvatarPath: (groupId: string, filename: string) => `groups/${groupId}/${filename}`,
  getUserAvatarPath: (userId: string, filename: string) => `avatars/${userId}/${filename}`,

  // Generic storage wrapper (for backward compatibility)
  storage: createStorageWrapper(appStorage),
};

export { storageService };
