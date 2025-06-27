import { MMKV } from 'react-native-mmkv';

// This declaration is used to inform TypeScript about the existence of a global property
// that is injected by React Native's JSI environment. This prevents type errors.
declare const global: { nativeCallSyncHook: unknown };

// --- Lazy-loaded MMKV instances ---

let feedStorageInstance: MMKV | null = null;
let settingsStorageInstance: MMKV | null = null;
let generalStorageInstance: MMKV | null = null;
let gamesStorageInstance: MMKV | null = null;
let authStorageInstance: MMKV | null = null;
let appStorageInstance: MMKV | null = null;

const getStorageInstance = (id: string): MMKV => {
  // Check if running in a remote debugger (where JSI is not available)
  if (__DEV__ && typeof global.nativeCallSyncHook === 'undefined') {
    throw new Error(
      'MMKV cannot be used with Chrome Debugger or other remote debugging tools.\n\n' +
        'Please use one of these alternatives:\n' +
        '1. Flipper for debugging\n' +
        '2. React Native Debugger\n' +
        '3. Console logs\n' +
        '4. On-device debugging\n\n' +
        'Remote debugging disables synchronous native module access which MMKV requires.'
    );
  }

  return new MMKV({
    id: `snapbet-${id}`,
    // TODO: Replace with a secure keychain/keystore solution for production
    encryptionKey: 'snapbet-super-secret-key',
  });
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

// --- Storage Service (Public API) ---
const storageService = {
  // Auth storage methods
  getAccessToken: () => getAuthStorage().getString('access_token'),
  setAccessToken: (token: string) => getAuthStorage().set('access_token', token),
  clearAccessToken: () => getAuthStorage().delete('access_token'),

  getRefreshToken: () => getAuthStorage().getString('refresh_token'),
  setRefreshToken: (token: string) => getAuthStorage().set('refresh_token', token),
  clearRefreshToken: () => getAuthStorage().delete('refresh_token'),

  // User storage methods
  getUser: () => {
    const userString = getAuthStorage().getString('user');
    return userString ? JSON.parse(userString) : null;
  },
  setUser: (user: unknown) => getAuthStorage().set('user', JSON.stringify(user)),
  clearUser: () => getAuthStorage().delete('user'),

  // Clear all auth data
  clearAuth: () => {
    const authStorage = getAuthStorage();
    authStorage.delete('access_token');
    authStorage.delete('refresh_token');
    authStorage.delete('user');
  },

  // App storage methods
  getOnboardingComplete: () => getAppStorage().getBoolean('onboarding_complete') ?? false,
  setOnboardingComplete: (complete: boolean) =>
    getAppStorage().set('onboarding_complete', complete),

  getLastViewedNotification: () => getAppStorage().getString('last_viewed_notification'),
  setLastViewedNotification: (id: string) => getAppStorage().set('last_viewed_notification', id),

  // Media storage paths
  getPostMediaPath: (userId: string, filename: string) => `posts/${userId}/${filename}`,
  getStoryMediaPath: (userId: string, filename: string) => `stories/${userId}/${filename}`,
  getMessageMediaPath: (chatId: string, messageId: string, filename: string) =>
    `messages/${chatId}/${messageId}/${filename}`,
  getGroupAvatarPath: (groupId: string, filename: string) => `groups/${groupId}/${filename}`,
  getUserAvatarPath: (userId: string, filename: string) => `avatars/${userId}/${filename}`,

  // Generic storage wrapper (for backward compatibility)
  get storage() {
    return createStorageWrapper(getAppStorage());
  },
};

export { storageService };
