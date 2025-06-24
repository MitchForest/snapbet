# SnapBet Technical Architecture Document

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Data Flow Architecture](#data-flow-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Architecture](#backend-architecture)
8. [Database Architecture](#database-architecture)
9. [Real-time Architecture](#real-time-architecture)
10. [Media Storage Architecture](#media-storage-architecture)
11. [Authentication Architecture](#authentication-architecture)
12. [API Architecture](#api-architecture)
13. [State Management Architecture](#state-management-architecture)
14. [Performance Architecture](#performance-architecture)
15. [Security Architecture](#security-architecture)
16. [Deployment Architecture](#deployment-architecture)
17. [Monitoring & Observability](#monitoring--observability)
18. [Scalability Considerations](#scalability-considerations)

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│  │  iOS App (Expo) │  │Android App(Expo)│  │  Admin Scripts  ││
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘│
└───────────┼────────────────────┼────────────────────┼─────────┘
            │                    │                    │
            └────────────────────┴────────────────────┘
                                │
                                │ HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Supabase Cloud                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐│
│  │   Auth       │  │  Realtime    │  │   Edge Functions      ││
│  │  (OAuth)     │  │ (WebSocket)  │  │  - place-bet          ││
│  └──────────────┘  └──────────────┘  │  - tail-pick          ││
│                                       │  - settle-bets        ││
│  ┌──────────────┐  ┌──────────────┐  │  - cleanup-expired    ││
│  │  PostgreSQL  │  │   Storage    │  └───────────────────────┘│
│  │  + Vectors   │  │   (Media)    │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐│
│  │ Google OAuth │  │Twitter OAuth │  │   OpenAI (Phase 2)    ││
│  └──────────────┘  └──────────────┘  └───────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Core Components

1. **Mobile Apps**: React Native/Expo apps for iOS and Android
2. **Backend**: Supabase providing auth, database, realtime, and storage
3. **Edge Functions**: Serverless functions for business logic
4. **External Services**: OAuth providers and AI services (Phase 2)

## Architecture Principles

### Design Principles

1. **Mobile-First**: Every decision optimized for mobile performance
2. **Real-time First**: Built for instant updates and live data
3. **Offline Resilient**: Core features work with poor connectivity
4. **Privacy by Design**: Ephemeral content, minimal data retention
5. **Developer Experience**: Simple setup, clear patterns
6. **Cost Efficient**: Leverage free tiers, optimize for scale

### Technical Principles

1. **Single Source of Truth**: Database is authoritative
2. **Optimistic Updates**: UI updates before server confirmation
3. **Event-Driven**: Real-time subscriptions for live updates
4. **Stateless Functions**: All business logic in pure functions
5. **Type Safety**: TypeScript everywhere
6. **Progressive Enhancement**: Core features work, enhanced features graceful

## Technology Stack

### Frontend Stack
```yaml
Framework: React Native 0.73
Platform: Expo SDK 50
Navigation: Expo Router (file-based)
UI Library: Tamagui 1.79
State Management:
  - Global: Zustand 4.5
  - Server: TanStack Query 5.0
  - Persistent: MMKV 2.0
Animations: React Native Reanimated 3.6
Gestures: React Native Gesture Handler 2.14
Lists: FlashList 1.6
Bottom Sheets: @gorhom/bottom-sheet 4.5
Camera: Expo Camera 14.0
Image: Expo Image 1.10
```

### Backend Stack
```yaml
Platform: Supabase
Database: PostgreSQL 15
Auth: Supabase Auth (OAuth)
Realtime: Supabase Realtime
Storage: Supabase Storage
Functions: Supabase Edge Functions (Deno)
Vector DB: pgvector extension
Caching: PostgreSQL + in-memory
```

### Development Stack
```yaml
Language: TypeScript 5.3
Package Manager: pnpm 8.0
Monorepo: pnpm workspaces
Build: Expo EAS Build
Updates: Expo Updates (OTA)
Testing: Jest + React Native Testing Library
Linting: ESLint + Prettier
CI/CD: GitHub Actions
```

## System Architecture

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (Expo)                       │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer                                         │
│  ├── Screens (Expo Router)                                 │
│  ├── Components (Tamagui)                                  │
│  └── Animations (Reanimated)                               │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                       │
│  ├── Hooks (Custom React Hooks)                           │
│  ├── Services (API Calls)                                 │
│  └── Utils (Calculations, Formatters)                     │
├─────────────────────────────────────────────────────────────┤
│  State Management Layer                                     │
│  ├── Zustand (App State)                                  │
│  ├── React Query (Server State)                           │
│  └── MMKV (Persistent State)                              │
├─────────────────────────────────────────────────────────────┤
│  Data Access Layer                                         │
│  ├── Supabase Client                                      │
│  ├── API Services                                         │
│  └── Cache Management                                     │
└─────────────────────────────────────────────────────────────┘
```

### Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Services                        │
├─────────────────────────────────────────────────────────────┤
│  API Gateway                                                │
│  ├── REST API (PostgREST)                                 │
│  ├── GraphQL (pg_graphql)                                 │
│  └── Realtime (WebSocket)                                 │
├─────────────────────────────────────────────────────────────┤
│  Business Logic                                             │
│  ├── Edge Functions                                        │
│  ├── Database Functions                                    │
│  └── Triggers                                              │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ├── PostgreSQL Tables                                     │
│  ├── Row Level Security                                    │
│  └── Materialized Views                                    │
├─────────────────────────────────────────────────────────────┤
│  Storage Layer                                              │
│  ├── Media Buckets                                         │
│  ├── CDN Distribution                                      │
│  └── Access Policies                                       │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

### Content Creation Flow

```
User → Camera → Capture Media → Apply Effects → Add Caption
   ↓                                              ↓
Upload to Storage ← Compress ← Create Post ← Attach Bet?
   ↓
Store in DB → Notify Subscribers → Update Feed
   ↓
Set Expiration Timer → Schedule Cleanup
```

### Betting Flow

```
Browse Games → Select Game → Choose Bet Type → Enter Amount
      ↓             ↓              ↓               ↓
Mock Data API  Bottom Sheet   Validate Odds   Check Bankroll
                    ↓              ↓               ↓
              Display Odds    Current Line    Sufficient?
                    ↓              ↓               ↓
              Place Bet ← Confirm Amount ← Show Payout
                    ↓
              Edge Function
                    ↓
         ┌─────────┴─────────┐
         ↓                   ↓
    Deduct Bankroll    Create Bet Record
         ↓                   ↓
    Update State       Store in DB
         ↓                   ↓
    Optimistic UI     Broadcast Update
```

### Tail/Fade Flow

```
See Pick → Tap Tail/Fade → Fetch Original Bet
    ↓           ↓               ↓
Feed/Chat   Show Count    Load Details
    ↓           ↓               ↓
         Confirmation Sheet     ↓
              ↓            Calculate Opposite (Fade)
         Confirm Action         ↓
              ↓                 ↓
         Edge Function ← Same/Opposite Bet
              ↓
    ┌────────┴────────┐
    ↓                 ↓
Create Linked Bet  Update Counts
    ↓                 ↓
Notify OP        Update UI
```

### Real-time Update Flow

```
Database Change → Postgres Trigger → Realtime Broadcast
                                           ↓
                                    WebSocket Channel
                                           ↓
                               ┌───────────┴───────────┐
                               ↓                       ↓
                        Subscribed Clients      Other Channels
                               ↓
                        Update Local State
                               ↓
                         Re-render UI
```

## Frontend Architecture

### Screen Architecture

```
app/
├── (auth)/
│   ├── _layout.tsx        # Auth stack layout
│   ├── welcome.tsx        # OAuth selection
│   └── onboarding/
│       ├── username.tsx
│       ├── team.tsx
│       └── follow.tsx
├── (tabs)/
│   ├── _layout.tsx        # Tab navigator + header
│   ├── feed.tsx          # Home feed + stories
│   ├── games.tsx         # Browse games
│   ├── camera.tsx        # Modal camera
│   ├── messages.tsx      # Chat list
│   └── search.tsx        # Explore/discover
├── profile/
│   └── [username].tsx    # Dynamic profile
├── chat/
│   └── [id].tsx         # Chat conversation
├── bet/
│   └── [id].tsx         # Bet details
└── _layout.tsx          # Root layout
```

### Component Architecture

```
components/
├── core/               # Base components
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Card.tsx
├── feed/              # Feed-specific
│   ├── PostCard.tsx
│   ├── StoryBar.tsx
│   └── TailFadeButtons.tsx
├── betting/           # Betting UI
│   ├── GameCard.tsx
│   ├── BetSheet.tsx
│   └── OddsDisplay.tsx
├── camera/            # Camera UI
│   ├── CameraView.tsx
│   ├── Effects.tsx
│   └── MediaPreview.tsx
├── chat/              # Messaging
│   ├── ChatBubble.tsx
│   ├── MessageInput.tsx
│   └── PickShare.tsx
└── profile/           # Profile UI
    ├── StatsCard.tsx
    ├── BadgeList.tsx
    └── PerformanceTab.tsx
```

### State Architecture

```typescript
// App State (Zustand)
interface AppState {
  // User
  user: User | null;
  bankroll: number;
  
  // UI
  activeSheet: 'bet' | 'profile' | null;
  cameraMode: 'photo' | 'video';
  
  // Actions
  placeBet: (bet: BetInput) => Promise<void>;
  resetBankroll: () => void;
  updateProfile: (data: Partial<User>) => void;
}

// Server State (React Query)
// Posts
useQuery(['posts', 'feed'], fetchFeed);
useMutation(createPost);

// Bets
useQuery(['bets', 'active'], fetchActiveBets);
useMutation(placeBet, {
  onMutate: optimisticUpdate,
  onError: rollback,
});

// Real-time Subscriptions
useRealtimeSubscription('posts', handleNewPost);
useRealtimeSubscription('messages', handleNewMessage);
```

## Backend Architecture

### Database Schema Design

```sql
-- Core Tables
users
  ├── id (uuid, PK)
  ├── username (text, unique)
  ├── oauth_provider (text)
  └── indexes: username, created_at

bankrolls
  ├── user_id (uuid, FK, PK)
  ├── balance (integer)
  └── indexes: user_id

bets
  ├── id (uuid, PK)
  ├── user_id (uuid, FK)
  ├── game_id (text)
  ├── bet_type (text)
  ├── bet_details (jsonb)
  ├── status (text)
  └── indexes: user_id, game_id, status

posts
  ├── id (uuid, PK)
  ├── user_id (uuid, FK)
  ├── media_url (text)
  ├── bet_id (uuid, FK, nullable)
  ├── expires_at (timestamp)
  └── indexes: user_id, expires_at, created_at

pick_actions
  ├── id (uuid, PK)
  ├── post_id (uuid, FK)
  ├── user_id (uuid, FK)
  ├── action_type (text)
  ├── resulting_bet_id (uuid, FK)
  └── indexes: post_id, user_id (unique)

-- Relationships
users → bankrolls (1:1)
users → bets (1:N)
users → posts (1:N)
posts → pick_actions (1:N)
bets → pick_actions (1:1)
```

### Edge Functions Architecture

```typescript
// place-bet function
export async function handler(req: Request) {
  const { user_id, game_id, bet_type, bet_details, stake } = await req.json();
  
  // Begin transaction
  const { data: bankroll } = await supabase
    .from('bankrolls')
    .select('balance')
    .eq('user_id', user_id)
    .single();
    
  if (bankroll.balance < stake) {
    throw new Error('Insufficient funds');
  }
  
  // Deduct from bankroll
  await supabase
    .from('bankrolls')
    .update({ balance: bankroll.balance - stake })
    .eq('user_id', user_id);
    
  // Create bet
  const { data: bet } = await supabase
    .from('bets')
    .insert({
      user_id,
      game_id,
      bet_type,
      bet_details,
      stake,
      potential_win: calculatePayout(stake, bet_details.odds),
      status: 'pending'
    })
    .select()
    .single();
    
  return new Response(JSON.stringify(bet), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### Database Triggers

```sql
-- Auto-update tail/fade counts
CREATE OR REPLACE FUNCTION update_pick_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET 
    tail_count = (
      SELECT COUNT(*) 
      FROM pick_actions 
      WHERE post_id = NEW.post_id 
      AND action_type = 'tail'
    ),
    fade_count = (
      SELECT COUNT(*) 
      FROM pick_actions 
      WHERE post_id = NEW.post_id 
      AND action_type = 'fade'
    )
  WHERE id = NEW.post_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_counts_on_action
AFTER INSERT OR DELETE ON pick_actions
FOR EACH ROW
EXECUTE FUNCTION update_pick_counts();
```

## Database Architecture

### Data Model Design

```
┌─────────────────┐     ┌─────────────────┐
│     users       │     │    bankrolls    │
├─────────────────┤     ├─────────────────┤
│ id              │────<│ user_id (PK,FK) │
│ username        │     │ balance         │
│ email           │     │ total_wagered   │
│ avatar_url      │     │ total_won       │
│ created_at      │     └─────────────────┘
└────────┬────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌─────────────────┐     ┌─────────────────┐
│      bets       │     │     posts       │
├─────────────────┤     ├─────────────────┤
│ id              │<────│ bet_id (FK)     │
│ user_id (FK)    │     │ user_id (FK)    │
│ game_id         │     │ media_url       │
│ bet_type        │     │ caption         │
│ stake           │     │ expires_at      │
│ status          │     └────────┬────────┘
└─────────────────┘              │
                                 ▼
                        ┌─────────────────┐
                        │  pick_actions   │
                        ├─────────────────┤
                        │ post_id (FK)    │
                        │ user_id (FK)    │
                        │ action_type     │
                        │ resulting_bet_id│
                        └─────────────────┘
```

### Indexing Strategy

```sql
-- Performance indexes
CREATE INDEX idx_posts_feed ON posts(created_at DESC) 
  WHERE expires_at > NOW();

CREATE INDEX idx_bets_user_active ON bets(user_id, status) 
  WHERE status = 'pending';

CREATE INDEX idx_messages_chat ON messages(chat_id, created_at DESC);

-- Real-time indexes
CREATE INDEX idx_posts_realtime ON posts(created_at) 
  INCLUDE (user_id);

-- Search indexes
CREATE INDEX idx_users_username ON users(username varchar_pattern_ops);
```

### Row Level Security

```sql
-- Users can only update their own data
CREATE POLICY "Users update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Posts visible to followers only
CREATE POLICY "Posts visible to followers" ON posts
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM follows 
      WHERE follower_id = auth.uid() 
      AND following_id = posts.user_id
    )
  );

-- Bets private to owner
CREATE POLICY "Bets private" ON bets
  FOR ALL USING (user_id = auth.uid());
```

## Real-time Architecture

### Channel Structure

```
Channels:
├── feed:{user_id}        # Personal feed updates
├── chat:{chat_id}        # Chat messages
├── notifications:{user_id} # User notifications
├── game:{game_id}        # Live game updates (future)
└── global:stats          # App-wide stats (future)
```

### Subscription Management

```typescript
// Feed subscription
const feedChannel = supabase
  .channel(`feed:${userId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'posts',
      filter: `user_id=in.(${followingIds.join(',')})`
    },
    (payload) => {
      // Add to feed
      queryClient.setQueryData(['posts', 'feed'], (old) => {
        return [payload.new, ...old];
      });
    }
  )
  .subscribe();

// Cleanup on unmount
return () => {
  supabase.removeChannel(feedChannel);
};
```

### Real-time Events

```typescript
// Event types
type RealtimeEvent = 
  | { type: 'post.created'; data: Post }
  | { type: 'message.sent'; data: Message }
  | { type: 'bet.placed'; data: Bet }
  | { type: 'pick.tailed'; data: PickAction }
  | { type: 'user.followed'; data: Follow };

// Event handler
function handleRealtimeEvent(event: RealtimeEvent) {
  switch (event.type) {
    case 'post.created':
      // Update feed
      break;
    case 'message.sent':
      // Update chat
      break;
    case 'pick.tailed':
      // Update counts
      break;
  }
}
```

## Media Storage Architecture

### Storage Structure

```
Buckets:
├── avatars/
│   └── {user_id}.jpg
├── posts/
│   ├── {year}/{month}/{day}/
│   │   └── {post_id}.jpg
├── messages/
│   └── {chat_id}/{message_id}.jpg
└── stories/
    └── {user_id}/{story_id}.jpg
```

### Upload Pipeline

```typescript
// Client upload
async function uploadMedia(file: File, type: 'post' | 'message') {
  // 1. Compress
  const compressed = await compressImage(file, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85
  });
  
  // 2. Generate path
  const path = `${type}s/${Date.now()}_${uuid()}.jpg`;
  
  // 3. Upload
  const { data, error } = await supabase.storage
    .from('media')
    .upload(path, compressed, {
      cacheControl: '3600',
      upsert: false
    });
    
  // 4. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(path);
    
  return publicUrl;
}
```

### CDN Configuration

```yaml
Storage Settings:
  - Global CDN enabled
  - Cache headers: 1 hour
  - Transform API enabled
  - Max file size: 50MB
  
Security:
  - Signed URLs for private content
  - Public read for posts/avatars
  - Authenticated read for messages
```

## Authentication Architecture

### OAuth Flow

```
User → App → Supabase Auth → OAuth Provider
              ↓                    ↓
         Redirect URI ← Authorization Code
              ↓
         Exchange Code
              ↓
         Access Token
              ↓
    Create/Update User Record
              ↓
         Session Token
              ↓
      Return to App → Onboarding/Feed
```

### Session Management

```typescript
// Auth state management
const AuthContext = createContext<{
  user: User | null;
  session: Session | null;
  signIn: (provider: 'google' | 'twitter') => Promise<void>;
  signOut: () => Promise<void>;
}>(null);

// Session refresh
useEffect(() => {
  // Check session on app launch
  supabase.auth.getSession();
  
  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN') {
        // Fetch user profile
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        // Clear local data
        clearStorage();
      }
    }
  );
  
  return () => subscription.unsubscribe();
}, []);
```

### Token Storage

```typescript
// Secure token storage
import * as SecureStore from 'expo-secure-store';

async function saveSession(session: Session) {
  await SecureStore.setItemAsync('auth_session', JSON.stringify(session));
}

async function getSession(): Promise<Session | null> {
  const stored = await SecureStore.getItemAsync('auth_session');
  return stored ? JSON.parse(stored) : null;
}
```

## API Architecture

### RESTful Endpoints

```
Base URL: https://[project-id].supabase.co

Authentication:
  POST   /auth/v1/signin     # OAuth signin
  POST   /auth/v1/signout    # Sign out
  GET    /auth/v1/user       # Current user

Users:
  GET    /rest/v1/users?username=eq.{username}
  PATCH  /rest/v1/users?id=eq.{id}
  
Posts:
  GET    /rest/v1/posts?order=created_at.desc&limit=20
  POST   /rest/v1/posts
  DELETE /rest/v1/posts?id=eq.{id}
  
Bets:
  GET    /rest/v1/bets?user_id=eq.{id}&status=eq.pending
  POST   /rest/v1/bets
  
Messages:
  GET    /rest/v1/messages?chat_id=eq.{id}&order=created_at
  POST   /rest/v1/messages
```

### API Client Architecture

```typescript
// Base API client
class SupabaseAPI {
  private client: SupabaseClient;
  
  constructor() {
    this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  
  // Generic query builder
  async query<T>(
    table: string,
    options?: QueryOptions
  ): Promise<T[]> {
    let query = this.client.from(table).select(options?.select || '*');
    
    if (options?.filters) {
      options.filters.forEach(filter => {
        query = query[filter.operator](filter.column, filter.value);
      });
    }
    
    if (options?.order) {
      query = query.order(options.order.column, {
        ascending: options.order.ascending
      });
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}
```

### Error Handling

```typescript
// Centralized error handling
class APIError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

// Error interceptor
async function apiCall<T>(
  fn: () => Promise<{ data: T; error: any }>
): Promise<T> {
  try {
    const { data, error } = await fn();
    if (error) {
      throw new APIError(
        error.code,
        error.status || 500,
        error.message
      );
    }
    return data;
  } catch (error) {
    // Log to monitoring
    console.error('API Error:', error);
    
    // User-friendly messages
    if (error.code === 'PGRST116') {
      throw new Error('Not found');
    }
    
    throw error;
  }
}
```

## State Management Architecture

### Zustand Store Structure

```typescript
// Root store
interface RootStore {
  // Slices
  user: UserSlice;
  betting: BettingSlice;
  ui: UISlice;
  
  // Actions
  hydrate: () => Promise<void>;
  reset: () => void;
}

// User slice
interface UserSlice {
  // State
  profile: User | null;
  bankroll: number;
  stats: UserStats | null;
  
  // Actions
  setProfile: (user: User) => void;
  updateBankroll: (amount: number) => void;
  resetBankroll: () => void;
}

// Betting slice
interface BettingSlice {
  // State
  activeBets: Bet[];
  recentPicks: Pick[];
  
  // Actions
  placeBet: (bet: BetInput) => Promise<Bet>;
  tailPick: (pickId: string) => Promise<void>;
  fadePick: (pickId: string) => Promise<void>;
}

// UI slice
interface UISlice {
  // State
  activeSheet: SheetType | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  openSheet: (type: SheetType) => void;
  closeSheet: () => void;
  setError: (error: string | null) => void;
}
```

### React Query Configuration

```typescript
// Query client config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        // Global error handling
        store.getState().ui.setError(error.message);
      },
    },
  },
});

// Query key factory
const queryKeys = {
  all: ['snapbet'] as const,
  posts: () => [...queryKeys.all, 'posts'] as const,
  feed: () => [...queryKeys.posts(), 'feed'] as const,
  post: (id: string) => [...queryKeys.posts(), id] as const,
  bets: () => [...queryKeys.all, 'bets'] as const,
  activeBets: () => [...queryKeys.bets(), 'active'] as const,
  messages: (chatId: string) => [...queryKeys.all, 'messages', chatId] as const,
};
```

### Optimistic Updates

```typescript
// Optimistic bet placement
const placeBetMutation = useMutation({
  mutationFn: placeBet,
  onMutate: async (newBet) => {
    // Cancel queries
    await queryClient.cancelQueries({ queryKey: queryKeys.activeBets() });
    
    // Snapshot previous value
    const previousBets = queryClient.getQueryData(queryKeys.activeBets());
    
    // Optimistically update
    queryClient.setQueryData(queryKeys.activeBets(), (old) => {
      return [...old, { ...newBet, status: 'pending', id: 'temp-' + Date.now() }];
    });
    
    // Update bankroll optimistically
    store.getState().user.updateBankroll(-newBet.stake);
    
    return { previousBets };
  },
  onError: (err, newBet, context) => {
    // Rollback
    queryClient.setQueryData(queryKeys.activeBets(), context.previousBets);
    store.getState().user.updateBankroll(newBet.stake);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.activeBets() });
  },
});
```

## Performance Architecture

### Optimization Strategies

```typescript
// Image optimization
const imageConfig = {
  post: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
    format: 'jpeg',
  },
  thumbnail: {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.7,
    format: 'jpeg',
  },
  avatar: {
    maxWidth: 200,
    maxHeight: 200,
    quality: 0.8,
    format: 'jpeg',
  },
};

// List optimization with FlashList
<FlashList
  data={posts}
  renderItem={renderPost}
  estimatedItemSize={300}
  keyExtractor={(item) => item.id}
  drawDistance={500}
  removeClippedSubviews
  maxToRenderPerBatch={10}
  windowSize={10}
/>

// Memoization
const PostCard = memo(({ post, onTail, onFade }) => {
  // Expensive calculations
  const stats = useMemo(() => calculateStats(post), [post.id]);
  
  // Callbacks
  const handleTail = useCallback(() => onTail(post.id), [post.id]);
  const handleFade = useCallback(() => onFade(post.id), [post.id]);
  
  return <Card>...</Card>;
}, (prevProps, nextProps) => {
  return prevProps.post.id === nextProps.post.id &&
         prevProps.post.tail_count === nextProps.post.tail_count &&
         prevProps.post.fade_count === nextProps.post.fade_count;
});
```

### Caching Strategy

```typescript
// Multi-level cache
class CacheManager {
  private memoryCache = new Map<string, CacheEntry>();
  private persistentCache = new MMKVStorage();
  
  async get<T>(key: string): Promise<T | null> {
    // L1: Memory cache
    const memory = this.memoryCache.get(key);
    if (memory && !this.isExpired(memory)) {
      return memory.data;
    }
    
    // L2: Persistent cache
    const persistent = await this.persistentCache.getItem(key);
    if (persistent && !this.isExpired(persistent)) {
      // Promote to memory
      this.memoryCache.set(key, persistent);
      return persistent.data;
    }
    
    return null;
  }
  
  async set<T>(key: string, data: T, ttl: number = 300000) {
    const entry = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    
    // Set in both caches
    this.memoryCache.set(key, entry);
    await this.persistentCache.setItem(key, entry);
  }
}
```

### Bundle Optimization

```yaml
# Metro config for optimization
module.exports = {
  transformer: {
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
      compress: {
        drop_console: true,
      },
    },
  },
  resolver: {
    assetExts: ['db', 'mp3', 'ttf', 'obj', 'txt', 'jpg', 'png', 'mp4'],
  },
};
```

## Security Architecture

### API Security

```typescript
// Row Level Security policies
-- Users can only see their own bankroll
CREATE POLICY "Own bankroll only" ON bankrolls
  FOR ALL USING (user_id = auth.uid());

-- Posts visible to followers + self
CREATE POLICY "Follower posts" ON posts
  FOR SELECT USING (
    user_id = auth.uid() OR
    user_id IN (
      SELECT following_id FROM follows 
      WHERE follower_id = auth.uid()
    )
  );

-- Can only tail/fade if following
CREATE POLICY "Must follow to tail" ON pick_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM follows 
      WHERE follower_id = auth.uid() 
      AND following_id = (
        SELECT user_id FROM posts 
        WHERE id = post_id
      )
    )
  );
```

### Client Security

```typescript
// Input validation
const validateBet = (bet: BetInput): ValidationResult => {
  const errors: string[] = [];
  
  if (bet.stake < 5 || bet.stake > 10000) {
    errors.push('Stake must be between $5 and $10,000');
  }
  
  if (!['spread', 'total', 'moneyline'].includes(bet.type)) {
    errors.push('Invalid bet type');
  }
  
  if (!bet.game_id || !bet.game_id.match(/^[a-zA-Z0-9_-]+$/)) {
    errors.push('Invalid game ID');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// Sanitization
const sanitizeInput = (text: string): string => {
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 280); // Enforce length limit
};
```

### Data Privacy

```typescript
// Ephemeral content cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_content()
RETURNS void AS $$
BEGIN
  -- Soft delete expired posts
  UPDATE posts 
  SET deleted_at = NOW() 
  WHERE expires_at < NOW() 
  AND deleted_at IS NULL;
  
  -- Hard delete old soft-deleted content
  DELETE FROM posts 
  WHERE deleted_at < NOW() - INTERVAL '7 days';
  
  -- Remove orphaned media
  DELETE FROM storage.objects
  WHERE created_at < NOW() - INTERVAL '7 days'
  AND name LIKE 'posts/%'
  AND name NOT IN (
    SELECT media_url FROM posts
  );
END;
$$ LANGUAGE plpgsql;

-- Run every hour
SELECT cron.schedule(
  'cleanup-expired',
  '0 * * * *',
  'SELECT cleanup_expired_content();'
);
```

## Deployment Architecture

### Infrastructure

```yaml
Production Environment:
  Mobile App:
    - Built with EAS Build
    - Distributed via TestFlight/Google Play
    - OTA updates via Expo Updates
    
  Backend:
    - Supabase Cloud (Pro tier for production)
    - Multi-region deployment
    - Automatic backups
    
  Monitoring:
    - Sentry for error tracking
    - Supabase Dashboard for metrics
    - Custom analytics (privacy-focused)
```

### CI/CD Pipeline

```yaml
# GitHub Actions workflow
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: expo/expo-github-action@v8
      - run: eas build --platform all --non-interactive
      
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: eas submit --platform all
      - run: pnpm supabase db push
      - run: pnpm supabase functions deploy
```

### Environment Configuration

```typescript
// Environment variables
const ENV = {
  development: {
    SUPABASE_URL: 'http://localhost:54321',
    SUPABASE_ANON_KEY: 'development-key',
    SENTRY_ENABLED: false,
  },
  staging: {
    SUPABASE_URL: 'https://staging.supabase.co',
    SUPABASE_ANON_KEY: 'staging-key',
    SENTRY_ENABLED: true,
  },
  production: {
    SUPABASE_URL: 'https://production.supabase.co',
    SUPABASE_ANON_KEY: 'production-key',
    SENTRY_ENABLED: true,
  },
};

// Runtime config
const config = ENV[process.env.NODE_ENV || 'development'];
```

## Monitoring & Observability

### Error Tracking

```typescript
// Sentry integration
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.ReactNativeTracing({
      routingInstrumentation,
      tracingOrigins: ['localhost', /^\//],
    }),
  ],
  beforeSend(event) {
    // Remove sensitive data
    if (event.user) {
      delete event.user.email;
    }
    return event;
  },
});
```

### Performance Monitoring

```typescript
// Custom performance tracking
class PerformanceMonitor {
  private marks = new Map<string, number>();
  
  mark(name: string) {
    this.marks.set(name, performance.now());
  }
  
  measure(name: string, startMark: string, endMark?: string) {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();
    
    if (start) {
      const duration = end - start;
      
      // Log to analytics
      analytics.track('performance_metric', {
        metric: name,
        duration,
        timestamp: Date.now(),
      });
      
      // Alert if slow
      if (duration > 3000) {
        Sentry.captureMessage(`Slow operation: ${name} took ${duration}ms`);
      }
    }
  }
}
```

### Analytics

```typescript
// Privacy-focused analytics
class Analytics {
  track(event: string, properties?: Record<string, any>) {
    // Remove PII
    const sanitized = this.sanitizeProperties(properties);
    
    // Send to service
    if (__DEV__) {
      console.log('Analytics:', event, sanitized);
    } else {
      // PostHog or similar
      posthog.capture(event, sanitized);
    }
  }
  
  private sanitizeProperties(props?: Record<string, any>) {
    if (!props) return {};
    
    const sanitized = { ...props };
    
    // Remove sensitive fields
    delete sanitized.email;
    delete sanitized.bankroll;
    delete sanitized.ip_address;
    
    return sanitized;
  }
}
```

## Scalability Considerations

### Database Scaling

```sql
-- Partitioning for large tables
CREATE TABLE posts_2024_06 PARTITION OF posts
  FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');

-- Indexes for common queries
CREATE INDEX CONCURRENTLY idx_posts_user_created 
  ON posts(user_id, created_at DESC);

-- Materialized views for expensive queries
CREATE MATERIALIZED VIEW user_stats_daily AS
SELECT 
  user_id,
  DATE(created_at) as date,
  COUNT(*) as bets_placed,
  SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as wins,
  SUM(CASE WHEN status = 'won' THEN potential_win - stake
      WHEN status = 'lost' THEN -stake
      ELSE 0 END) as profit
FROM bets
GROUP BY user_id, DATE(created_at);

-- Refresh periodically
CREATE OR REPLACE FUNCTION refresh_user_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats_daily;
END;
$$ LANGUAGE plpgsql;
```

### API Rate Limiting

```typescript
// Edge function rate limiting
const rateLimiter = new Map<string, number[]>();

export async function handler(req: Request) {
  const userId = req.headers.get('x-user-id');
  const now = Date.now();
  
  // Get user's request timestamps
  const timestamps = rateLimiter.get(userId) || [];
  
  // Remove old timestamps (outside 1 minute window)
  const recentTimestamps = timestamps.filter(t => now - t < 60000);
  
  // Check rate limit (100 requests per minute)
  if (recentTimestamps.length >= 100) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  // Add current timestamp
  recentTimestamps.push(now);
  rateLimiter.set(userId, recentTimestamps);
  
  // Continue with request
  return handleRequest(req);
}
```

### Caching Strategy

```yaml
Cache Layers:
  1. Client Memory (Zustand):
     - User profile
     - Active bets
     - UI state
     
  2. Client Persistent (MMKV):
     - Auth tokens
     - User preferences
     - Cached feeds
     
  3. CDN (Supabase Storage):
     - Media files
     - Static assets
     
  4. Database (PostgreSQL):
     - Query result cache
     - Prepared statements
     
  5. Edge Function (In-memory):
     - Rate limit counters
     - Temporary calculations
```

---

This comprehensive technical architecture document provides the complete blueprint for building SnapBet, covering all aspects from system design to deployment and scaling strategies.