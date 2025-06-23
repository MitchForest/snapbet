# SnapFade State Management Architecture

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [State Categories](#state-categories)
3. [Zustand Store Architecture](#zustand-store-architecture)
4. [React Query Architecture](#react-query-architecture)
5. [Real-time State Management](#real-time-state-management)
6. [Persistent State with MMKV](#persistent-state-with-mmkv)
7. [State Flow Patterns](#state-flow-patterns)
8. [Optimistic Updates](#optimistic-updates)
9. [Error Handling](#error-handling)
10. [Performance Optimization](#performance-optimization)
11. [Testing Strategy](#testing-strategy)
12. [Best Practices](#best-practices)

## Architecture Overview

### State Management Stack
```
┌─────────────────────────────────────────────────────────┐
│                    Component Layer                       │
│              (React Components + Hooks)                  │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│    Zustand   │   │ React Query  │   │     MMKV     │
│ (Client State)│   │(Server State)│   │ (Persistent) │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        └───────────────────┴───────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Supabase Backend                       │
│            (Database + Realtime + Storage)               │
└─────────────────────────────────────────────────────────┘
```

### Core Principles

1. **Separation of Concerns**
   - Client state (UI) → Zustand
   - Server state (API) → React Query
   - Persistent state → MMKV
   - Real-time state → Supabase Realtime + React Query

2. **Single Source of Truth**
   - Server is authoritative for data
   - Client state for UI only
   - No duplicate state storage

3. **Optimistic Updates**
   - Immediate UI feedback
   - Rollback on failure
   - Sync with server

4. **Type Safety**
   - Full TypeScript coverage
   - Generated types from Supabase
   - Runtime validation with Zod

## State Categories

### 1. Authentication State
**Owner**: Zustand + Supabase Auth
- Current user session
- Auth loading states
- OAuth tokens

### 2. User Interface State
**Owner**: Zustand
- Active modals/sheets
- Navigation state
- Form inputs
- Camera settings
- Loading indicators

### 3. User Data State
**Owner**: React Query + Zustand
- User profile
- Bankroll
- Settings/preferences
- Following list

### 4. Feed & Content State
**Owner**: React Query
- Posts feed
- Stories
- Comments/reactions
- Cached media

### 5. Betting State
**Owner**: React Query + Zustand
- Active bets
- Game odds
- Bet history
- Tail/fade tracking

### 6. Messaging State
**Owner**: React Query + Realtime
- Chat list
- Message history
- Typing indicators
- Unread counts

### 7. Notification State
**Owner**: React Query + Zustand
- Notification list
- Unread count
- Push token

### 8. Discovery State
**Owner**: React Query
- Search results
- Trending data
- Recommendations

## Zustand Store Architecture

### Root Store Structure
```typescript
// stores/useStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Slice imports
import { createAuthSlice, AuthSlice } from './slices/authSlice';
import { createUISlice, UISlice } from './slices/uiSlice';
import { createUserSlice, UserSlice } from './slices/userSlice';
import { createBettingSlice, BettingSlice } from './slices/bettingSlice';
import { createNotificationSlice, NotificationSlice } from './slices/notificationSlice';

export type RootStore = AuthSlice & UISlice & UserSlice & BettingSlice & NotificationSlice;

export const useStore = create<RootStore>()(
  devtools(
    immer((...a) => ({
      ...createAuthSlice(...a),
      ...createUISlice(...a),
      ...createUserSlice(...a),
      ...createBettingSlice(...a),
      ...createNotificationSlice(...a),
    })),
    { name: 'SnapFade' }
  )
);
```

### Auth Slice
```typescript
// stores/slices/authSlice.ts
export interface AuthSlice {
  // State
  session: Session | null;
  isLoading: boolean;
  isOnboarding: boolean;
  
  // Actions
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (provider: 'google' | 'twitter') => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const createAuthSlice: StateCreator<RootStore, [], [], AuthSlice> = (set, get) => ({
  session: null,
  isLoading: true,
  isOnboarding: false,
  
  setSession: (session) => {
    set((state) => {
      state.session = session;
    });
  },
  
  setLoading: (loading) => {
    set((state) => {
      state.isLoading = loading;
    });
  },
  
  signIn: async (provider) => {
    // OAuth flow implementation
  },
  
  signOut: async () => {
    // Sign out implementation
  },
  
  checkSession: async () => {
    // Session check implementation
  },
});
```

### UI Slice
```typescript
// stores/slices/uiSlice.ts
export interface UISlice {
  // Bottom Sheets
  activeSheet: 'bet' | 'profile' | 'share' | null;
  sheetData: any;
  
  // Camera
  cameraMode: 'photo' | 'video';
  activeFilter: string | null;
  
  // Navigation
  activeTab: string;
  
  // Loading States
  isCreatingPost: boolean;
  isPlacingBet: boolean;
  
  // Actions
  openSheet: (sheet: string, data?: any) => void;
  closeSheet: () => void;
  setCameraMode: (mode: 'photo' | 'video') => void;
  setActiveFilter: (filter: string | null) => void;
  setLoadingState: (key: string, loading: boolean) => void;
}
```

### User Slice
```typescript
// stores/slices/userSlice.ts
export interface UserSlice {
  // Profile
  profile: UserProfile | null;
  
  // Bankroll
  bankroll: {
    balance: number;
    pendingBets: number;
    totalWagered: number;
    totalWon: number;
  };
  
  // Settings
  settings: {
    notifications: NotificationSettings;
    privacy: PrivacySettings;
    display: DisplaySettings;
  };
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  updateBankroll: (amount: number) => void;
  resetBankroll: () => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => void;
}
```

### Betting Slice
```typescript
// stores/slices/bettingSlice.ts
export interface BettingSlice {
  // Active Bet Creation
  currentBet: {
    gameId: string | null;
    betType: 'spread' | 'total' | 'moneyline' | null;
    selection: any;
    stake: number;
    odds: number;
  };
  
  // Quick Amounts
  quickAmounts: number[];
  defaultStake: number;
  
  // Actions
  setBetDetails: (details: Partial<CurrentBet>) => void;
  clearCurrentBet: () => void;
  setDefaultStake: (amount: number) => void;
  placeBet: (shareToFeed: boolean) => Promise<void>;
}
```

## React Query Architecture

### Query Client Configuration
```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes
      staleTime: 1000 * 60 * 5,
      
      // Cache time: 10 minutes
      cacheTime: 1000 * 60 * 10,
      
      // Retry logic
      retry: (failureCount, error: any) => {
        if (error.status === 404) return false;
        if (failureCount < 3) return true;
        return false;
      },
      
      // Refetch on mount if stale
      refetchOnMount: 'always',
      
      // Don't refetch on window focus
      refetchOnWindowFocus: false,
      
      // Background refetch interval: 30 seconds
      refetchInterval: 30000,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      
      // Global error handler
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});
```

### Query Key Factory
```typescript
// lib/queryKeys.ts
export const queryKeys = {
  all: ['snapfade'] as const,
  
  // Auth
  auth: () => [...queryKeys.all, 'auth'] as const,
  session: () => [...queryKeys.auth(), 'session'] as const,
  
  // Users
  users: () => [...queryKeys.all, 'users'] as const,
  user: (id: string) => [...queryKeys.users(), id] as const,
  userProfile: (username: string) => [...queryKeys.users(), 'profile', username] as const,
  userStats: (id: string) => [...queryKeys.users(), id, 'stats'] as const,
  
  // Feed
  feed: () => [...queryKeys.all, 'feed'] as const,
  feedPage: (page: number) => [...queryKeys.feed(), { page }] as const,
  post: (id: string) => [...queryKeys.all, 'posts', id] as const,
  
  // Stories
  stories: () => [...queryKeys.all, 'stories'] as const,
  userStories: (userId: string) => [...queryKeys.stories(), userId] as const,
  
  // Bets
  bets: () => [...queryKeys.all, 'bets'] as const,
  activeBets: () => [...queryKeys.bets(), 'active'] as const,
  betHistory: (filters?: BetFilters) => [...queryKeys.bets(), 'history', filters] as const,
  
  // Games
  games: () => [...queryKeys.all, 'games'] as const,
  gamesBySport: (sport: string) => [...queryKeys.games(), sport] as const,
  game: (id: string) => [...queryKeys.games(), id] as const,
  
  // Messages
  chats: () => [...queryKeys.all, 'chats'] as const,
  chat: (id: string) => [...queryKeys.chats(), id] as const,
  messages: (chatId: string) => [...queryKeys.all, 'messages', chatId] as const,
  
  // Notifications
  notifications: () => [...queryKeys.all, 'notifications'] as const,
  unreadCount: () => [...queryKeys.notifications(), 'unread'] as const,
  
  // Search
  search: (query: string) => [...queryKeys.all, 'search', query] as const,
  trending: () => [...queryKeys.all, 'trending'] as const,
  recommendations: () => [...queryKeys.all, 'recommendations'] as const,
};
```

### Custom Hooks

#### Feed Hook
```typescript
// hooks/useFeed.ts
export const useFeed = () => {
  const { data, error, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: queryKeys.feed(),
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .rpc('get_feed', {
          p_user_id: userId,
          p_limit: 20,
          p_offset: pageParam
        });
      
      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined;
      return allPages.length * 20;
    },
  });
  
  const posts = useMemo(
    () => data?.pages.flatMap(page => page) ?? [],
    [data]
  );
  
  return {
    posts,
    isLoading,
    error,
    hasMore: hasNextPage,
    loadMore: fetchNextPage,
  };
};
```

#### Betting Hooks
```typescript
// hooks/usePlaceBet.ts
export const usePlaceBet = () => {
  const queryClient = useQueryClient();
  const { updateBankroll } = useStore();
  
  return useMutation({
    mutationFn: async (bet: BetInput) => {
      const { data, error } = await supabase.functions.invoke('place-bet', {
        body: bet
      });
      
      if (error) throw error;
      return data;
    },
    
    // Optimistic update
    onMutate: async (bet) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: queryKeys.activeBets() });
      
      // Snapshot previous value
      const previousBets = queryClient.getQueryData(queryKeys.activeBets());
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.activeBets(), (old: any) => {
        return [...(old || []), { ...bet, status: 'pending', id: `temp-${Date.now()}` }];
      });
      
      // Update local bankroll
      updateBankroll(-bet.stake);
      
      return { previousBets };
    },
    
    // Rollback on error
    onError: (err, bet, context) => {
      queryClient.setQueryData(queryKeys.activeBets(), context?.previousBets);
      updateBankroll(bet.stake);
      
      // Show error toast
      showToast({ type: 'error', message: 'Failed to place bet' });
    },
    
    // Sync on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeBets() });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed() });
    },
  });
};
```

## Real-time State Management

### Subscription Manager
```typescript
// lib/realtimeManager.ts
export class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private queryClient: QueryClient;
  
  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }
  
  // Subscribe to feed updates
  subscribeFeed(userId: string, followingIds: string[]) {
    const channel = supabase
      .channel('feed-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `user_id=in.(${[userId, ...followingIds].join(',')})`
        },
        (payload) => {
          // Add new post to feed
          this.queryClient.setQueryData(queryKeys.feed(), (old: any) => {
            const pages = old?.pages || [];
            if (pages.length === 0) return old;
            
            // Add to first page
            const newPages = [...pages];
            newPages[0] = [payload.new, ...newPages[0]];
            
            return { ...old, pages: newPages };
          });
        }
      )
      .subscribe();
    
    this.channels.set('feed', channel);
  }
  
  // Subscribe to chat messages
  subscribeChat(chatId: string) {
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          // Add new message
          this.queryClient.setQueryData(
            queryKeys.messages(chatId),
            (old: any) => [...(old || []), payload.new]
          );
          
          // Play notification sound
          playMessageSound();
        }
      )
      .subscribe();
    
    this.channels.set(`chat-${chatId}`, channel);
  }
  
  // Unsubscribe from channel
  unsubscribe(key: string) {
    const channel = this.channels.get(key);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(key);
    }
  }
  
  // Cleanup all subscriptions
  cleanup() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}
```

### Real-time Hooks
```typescript
// hooks/useRealtimeSubscription.ts
export const useRealtimeSubscription = (
  key: string,
  subscribe: (manager: RealtimeManager) => void,
  dependencies: any[] = []
) => {
  const queryClient = useQueryClient();
  const managerRef = useRef<RealtimeManager>();
  
  useEffect(() => {
    managerRef.current = new RealtimeManager(queryClient);
    subscribe(managerRef.current);
    
    return () => {
      managerRef.current?.cleanup();
    };
  }, dependencies);
};

// Usage in component
const ChatScreen = ({ chatId }) => {
  useRealtimeSubscription(
    `chat-${chatId}`,
    (manager) => manager.subscribeChat(chatId),
    [chatId]
  );
  
  const { data: messages } = useQuery({
    queryKey: queryKeys.messages(chatId),
    queryFn: () => fetchMessages(chatId),
  });
  
  return <MessageList messages={messages} />;
};
```

## Persistent State with MMKV

### MMKV Setup
```typescript
// lib/storage.ts
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'snapfade-storage',
  encryptionKey: 'snapfade-encryption-key',
});

// Storage utilities
export const StorageKeys = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  DRAFT_POST: 'draft_post',
  CAMERA_SETTINGS: 'camera_settings',
  VIEWED_STORIES: 'viewed_stories',
  NOTIFICATION_TOKEN: 'notification_token',
} as const;

// Type-safe storage functions
export const secureStorage = {
  setItem: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },
  
  getItem: <T>(key: string): T | null => {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  },
  
  removeItem: (key: string): void => {
    storage.delete(key);
  },
  
  clear: (): void => {
    storage.clearAll();
  },
};
```

### Persist Middleware for Zustand
```typescript
// stores/middleware/persist.ts
import { StateStorage } from 'zustand/middleware';
import { secureStorage } from '@/lib/storage';

const mmkvStorage: StateStorage = {
  getItem: (name) => {
    const value = secureStorage.getItem(name);
    return value ? JSON.stringify(value) : null;
  },
  setItem: (name, value) => {
    secureStorage.setItem(name, JSON.parse(value));
  },
  removeItem: (name) => {
    secureStorage.removeItem(name);
  },
};

// Usage in store
export const usePersistedStore = create<PersistedState>()(
  persist(
    (set) => ({
      // State
      defaultStake: 50,
      cameraSettings: defaultCameraSettings,
      viewedStories: [],
      
      // Actions
      setDefaultStake: (stake) => set({ defaultStake: stake }),
      markStoryViewed: (storyId) => set((state) => ({
        viewedStories: [...state.viewedStories, storyId]
      })),
    }),
    {
      name: 'snapfade-persisted',
      storage: mmkvStorage,
      partialize: (state) => ({
        defaultStake: state.defaultStake,
        cameraSettings: state.cameraSettings,
      }),
    }
  )
);
```

## State Flow Patterns

### Post Creation Flow
```
1. Camera Screen → Capture Media
   - Store in UI state temporarily
   
2. Preview Screen → Add Caption & Effects
   - Update UI state with edits
   
3. Share Options → Select Destinations
   - Store selections in UI state
   
4. Create Post → Upload & Save
   - Upload media to storage
   - Create post via mutation
   - Clear UI state on success
   - Update feed via real-time
```

### Bet Placement Flow
```
1. Games Screen → Select Game
   - Query games data
   - Store selection in betting slice
   
2. Bet Sheet → Configure Bet
   - Update current bet in store
   - Calculate potential payout
   
3. Confirm → Place Bet
   - Optimistic bankroll update
   - Create bet via mutation
   - Clear betting state
   
4. Share Option → Create Post
   - Link bet to post
   - Share to feed
```

### Tail/Fade Flow
```
1. Feed/Chat → See Pick
   - Post data from query
   
2. Tap Tail/Fade → Confirmation
   - Store action in UI state
   - Fetch current odds
   
3. Confirm → Execute
   - Create linked bet
   - Update counts optimistically
   - Invalidate queries
```

## Optimistic Updates

### Pattern for Optimistic UI
```typescript
// hooks/useOptimisticMutation.ts
export const useOptimisticMutation = <TData, TVariables, TContext>({
  mutationFn,
  optimisticUpdate,
  rollback,
  queryKey,
}: OptimisticMutationOptions<TData, TVariables, TContext>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    
    onMutate: async (variables) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot current state
      const previousData = queryClient.getQueryData(queryKey);
      
      // Optimistic update
      if (optimisticUpdate) {
        queryClient.setQueryData(queryKey, (old: any) => 
          optimisticUpdate(old, variables)
        );
      }
      
      return { previousData };
    },
    
    onError: (error, variables, context) => {
      // Rollback
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      
      if (rollback) {
        rollback(error, variables);
      }
    },
    
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
```

### Examples

#### Like/Unlike Optimistic Update
```typescript
const useLikePost = (postId: string) => {
  return useOptimisticMutation({
    mutationFn: () => toggleLike(postId),
    queryKey: queryKeys.post(postId),
    
    optimisticUpdate: (old: Post, { liked }: { liked: boolean }) => ({
      ...old,
      liked,
      likeCount: old.likeCount + (liked ? 1 : -1),
    }),
    
    rollback: (error) => {
      showToast({ type: 'error', message: 'Failed to update' });
    },
  });
};
```

#### Tail Count Update
```typescript
const useTailPick = (postId: string) => {
  return useOptimisticMutation({
    mutationFn: (data) => tailPick(data),
    queryKey: queryKeys.post(postId),
    
    optimisticUpdate: (old: Post) => ({
      ...old,
      tailCount: old.tailCount + 1,
      userAction: 'tail',
    }),
  });
};
```

## Error Handling

### Global Error Boundary
```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to crash reporting
    crashlytics().recordError(error);
    
    // Log to console in dev
    if (__DEV__) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorScreen error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

### Query Error Handling
```typescript
// hooks/useErrorHandler.ts
export const useErrorHandler = () => {
  const showToast = useToast();
  
  return useCallback((error: any) => {
    // Network errors
    if (!error.response) {
      showToast({
        type: 'error',
        message: 'Network error. Please check your connection.',
      });
      return;
    }
    
    // Server errors
    const status = error.response?.status;
    switch (status) {
      case 401:
        // Handle unauthorized
        useStore.getState().signOut();
        break;
        
      case 429:
        showToast({
          type: 'error',
          message: 'Too many requests. Please slow down.',
        });
        break;
        
      case 500:
        showToast({
          type: 'error',
          message: 'Server error. Please try again.',
        });
        break;
        
      default:
        showToast({
          type: 'error',
          message: error.message || 'Something went wrong',
        });
    }
  }, [showToast]);
};
```

### Mutation Error Recovery
```typescript
// Global mutation error handler
queryClient.setMutationDefaults(['createPost'], {
  mutationFn: createPost,
  retry: (failureCount, error) => {
    // Retry network errors up to 3 times
    if (error.code === 'NETWORK_ERROR' && failureCount < 3) {
      return true;
    }
    return false;
  },
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

## Performance Optimization

### Query Optimization
```typescript
// Prefetching
export const usePrefetchGames = () => {
  const queryClient = useQueryClient();
  
  return useCallback((sport: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.gamesBySport(sport),
      queryFn: () => fetchGames(sport),
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  }, [queryClient]);
};

// Suspense integration
export const useSuspenseQuery = (options: UseQueryOptions) => {
  return useQuery({
    ...options,
    suspense: true,
    useErrorBoundary: true,
  });
};
```

### Selector Optimization
```typescript
// Prevent unnecessary re-renders
export const useUser = () => {
  const user = useStore(
    useCallback((state) => state.user, []),
    shallow
  );
  return user;
};

export const useBankrollBalance = () => {
  const balance = useStore(
    (state) => state.bankroll.balance
  );
  return balance;
};

// Computed values with memoization
export const useUserStats = () => {
  const { wins, losses } = useStore(
    (state) => ({
      wins: state.stats.wins,
      losses: state.stats.losses,
    }),
    shallow
  );
  
  const winRate = useMemo(() => {
    const total = wins + losses;
    return total > 0 ? (wins / total) * 100 : 0;
  }, [wins, losses]);
  
  return { wins, losses, winRate };
};
```

### Batch Updates
```typescript
// Batch multiple state updates
const placeBetWithPost = async (bet: BetInput, post: PostInput) => {
  // Start batch
  queryClient.cancelQueries();
  
  try {
    // Execute mutations
    const [betResult, postResult] = await Promise.all([
      placeBetMutation.mutateAsync(bet),
      createPostMutation.mutateAsync(post),
    ]);
    
    // Batch invalidations
    queryClient.invalidateQueries({
      predicate: (query) => 
        query.queryKey[0] === 'snapfade' &&
        ['bets', 'feed', 'posts'].includes(query.queryKey[1] as string)
    });
    
    return { betResult, postResult };
  } catch (error) {
    // Handle error
    throw error;
  }
};
```

## Testing Strategy

### Store Testing
```typescript
// stores/__tests__/userStore.test.ts
describe('User Store', () => {
  beforeEach(() => {
    useStore.setState(initialState);
  });
  
  it('should update bankroll correctly', () => {
    const { updateBankroll } = useStore.getState();
    
    updateBankroll(-50);
    
    expect(useStore.getState().bankroll.balance).toBe(950);
  });
  
  it('should handle bankroll reset', async () => {
    const { resetBankroll } = useStore.getState();
    
    await resetBankroll();
    
    expect(useStore.getState().bankroll.balance).toBe(1000);
  });
});
```

### Hook Testing
```typescript
// hooks/__tests__/useFeed.test.ts
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useFeed', () => {
  it('should fetch feed data', async () => {
    const { result } = renderHook(() => useFeed(), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.posts).toHaveLength(20);
  });
});
```

## Best Practices

### 1. State Colocation
Keep state as close to where it's used as possible:
- Component state for UI-only state
- Zustand for cross-component client state
- React Query for server state

### 2. Avoid State Duplication
Don't store server data in Zustand - use React Query as the single source of truth.

### 3. Use Optimistic Updates Sparingly
Only for actions where immediate feedback is critical:
- Likes/reactions
- Follow/unfollow
- Simple counters

### 4. Normalize Complex State
For complex nested data, consider normalizing:
```typescript
// Instead of nested structure
posts: [{
  id: '1',
  user: { id: 'u1', name: 'Mike' },
  comments: [{ id: 'c1', text: 'Nice!' }]
}]

// Use normalized structure
entities: {
  posts: { '1': { id: '1', userId: 'u1', commentIds: ['c1'] } },
  users: { 'u1': { id: 'u1', name: 'Mike' } },
  comments: { 'c1': { id: 'c1', text: 'Nice!' } }
}
```

### 5. Handle Loading States Gracefully
```typescript
// Use suspense boundaries
<Suspense fallback={<FeedSkeleton />}>
  <Feed />
</Suspense>

// Or handle in component
if (isLoading) return <FeedSkeleton />;
if (error) return <ErrorState />;
if (!data) return <EmptyState />;
```

### 6. Clean Up Subscriptions
Always clean up real-time subscriptions and listeners:
```typescript
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, [dependencies]);
```

### 7. Type Everything
Use TypeScript for all state:
```typescript
// Generate types from Supabase
import { Database } from '@/types/supabase';

type Post = Database['public']['Tables']['posts']['Row'];
type InsertPost = Database['public']['Tables']['posts']['Insert'];
type UpdatePost = Database['public']['Tables']['posts']['Update'];
```

---

This comprehensive State Management Architecture provides a solid foundation for building SnapFade with predictable, performant, and maintainable state management.