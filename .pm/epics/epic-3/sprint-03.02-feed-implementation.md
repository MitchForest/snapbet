# Sprint 03.02: Feed Implementation Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 3 - Social Feed & Content

**Sprint Goal**: Create the main social feed with performant infinite scroll, post cards displaying media and bet attachments, real-time updates, and full integration with user profiles and stats from Epic 2.

**User Story Contribution**: 
- Enables Story 1: Social Pick Sharing - Main feed for discovering and sharing picks
- Enables Story 2: Tail/Fade Decisions - Post cards with tail/fade buttons
- Enables Story 5: Performance Tracking - User stats displayed on posts

## Sprint Plan

### Objectives
1. Implement main feed screen with FlashList for performance
2. Create PostCard component with media player and bet overlays
3. Add infinite scroll with React Query
4. Implement pull-to-refresh functionality
5. Create empty state and error handling
6. Integrate real-time post updates via Supabase subscriptions
7. Add post creation flow integration

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `components/feed/FeedList.tsx` | Main feed list with FlashList | NOT STARTED |
| `components/feed/PostCard/PostCard.tsx` | Individual post display component | NOT STARTED |
| `components/feed/PostCard/PostHeader.tsx` | User info and stats header | NOT STARTED |
| `components/feed/PostCard/PostMedia.tsx` | Photo/video player component | NOT STARTED |
| `components/feed/PostCard/PostActions.tsx` | Tail/fade/reaction buttons | NOT STARTED |
| `components/feed/PostCard/BetOverlay.tsx` | Bet details overlay on media | NOT STARTED |
| `components/feed/EmptyFeed.tsx` | Empty state component | NOT STARTED |
| `components/feed/FeedError.tsx` | Error state component | NOT STARTED |
| `hooks/useFeed.ts` | Feed data fetching and state | NOT STARTED |
| `hooks/usePostActions.ts` | Post interaction logic | NOT STARTED |
| `services/content/postService.ts` | Post CRUD operations | NOT STARTED |
| `utils/feed/helpers.ts` | Feed utility functions | NOT STARTED |
| `types/feed.ts` | TypeScript types for feed | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `app/(drawer)/(tabs)/index.tsx` | Replace with feed implementation | NOT STARTED |
| `package.json` | Add FlashList and React Query | NOT STARTED |
| `components/ui/Header.tsx` | Add feed header with drawer/notifications | NOT STARTED |
| `services/supabase/index.ts` | Add real-time subscription setup | NOT STARTED |

### Implementation Approach

#### 1. Dependencies Installation
```bash
# Performance and data fetching
bun add @shopify/flash-list@~1.6.3
bun add @tanstack/react-query@~5.17.0
bun add react-native-video@~5.2.1

# Development build required for video
```

#### 2. Feed Screen Layout
```
┌─────────────────────────────────┐
│ Header (56px)                   │
│ ┌─────────────────────────────┐ │
│ │ 👤    SnapBet    🔔(3)     │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Stories Bar (88px)              │ ← Sprint 03.03
│ [Placeholder for now]           │
├─────────────────────────────────┤
│ Feed Content (FlashList)        │
│ ┌─────────────────────────────┐ │
│ │ PostCard                    │ │
│ │ ├─ Header: @user • stats   │ │
│ │ ├─ Media: Photo/Video      │ │
│ │ ├─ Caption: "Text..."      │ │
│ │ └─ Actions: Tail/Fade/React│ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ PostCard                    │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### 3. Database Query Pattern
```typescript
// Feed query with proper relationship hints
const { data: posts } = await supabase
  .from('posts')
  .select(`
    *,
    user:users!user_id (
      id,
      username,
      avatar_url,
      stats_display:user_stats_display!user_id (
        primary_stat,
        selected_badge
      ),
      badges:user_badges!user_id (
        badge_id
      )
    ),
    bet:bets!bet_id (
      *,
      game:games!game_id (*)
    ),
    reactions (
      emoji,
      user_id
    ),
    tail_count,
    fade_count
  `)
  .in('user_id', [...followingIds, currentUserId])
  .gte('expires_at', new Date().toISOString())
  .order('created_at', { ascending: false })
  .limit(20);
```

#### 4. Performance Optimizations
- FlashList for windowed rendering
- Image lazy loading with fade-in
- Video preloading for visible items only
- Optimistic updates for interactions
- Debounced scroll events

**Key Technical Decisions**:
- FlashList over FlatList (better performance)
- React Query for caching and pagination
- Chronological order only (no algorithm)
- 20 posts per page
- Real-time via WebSocket subscriptions
- No draft posts (direct publish only)

### Dependencies & Risks
**Dependencies**:
- User authentication from Epic 2
- Following relationships established
- Posts table with proper schema
- Media uploaded from Sprint 03.00

**Identified Risks**:
- Large media files causing lag: Mitigation - Lazy loading, thumbnail previews
- Real-time updates overwhelming: Mitigation - Debounce, batch updates
- Memory leaks with subscriptions: Mitigation - Proper cleanup

## Implementation Log

### Day-by-Day Progress
**[Date]**:
- Started: [What was begun]
- Completed: [What was finished]
- Blockers: [Any issues]
- Decisions: [Any changes to plan]

### Reality Checks & Plan Updates
[To be filled during implementation]

### Code Quality Checks

**Linting Results**:
- [ ] Initial run: [X errors, Y warnings]
- [ ] Final run: 0 errors, 0 warnings

**Type Checking Results**:
- [ ] Initial run: [X errors]
- [ ] Final run: 0 errors

**Performance Testing**:
- [ ] Smooth 60 FPS scrolling
- [ ] Memory usage stable
- [ ] No unnecessary re-renders

## Key Code Additions

### Main Feed Screen
```typescript
// app/(drawer)/(tabs)/index.tsx
import { View, YStack } from '@tamagui/core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/ui/Header';
import { FeedList } from '@/components/feed/FeedList';
import { Colors } from '@/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <QueryClientProvider client={queryClient}>
      <YStack f={1} bg={Colors.background}>
        <Header />
        {/* Stories placeholder - 88px height */}
        <View h={88} bg={Colors.surface} borderBottomWidth={1} borderColor={Colors.border}>
          <Text>Stories coming in Sprint 03.03</Text>
        </View>
        <FeedList />
      </YStack>
    </QueryClientProvider>
  );
}
```

### Feed List Component
```typescript
// components/feed/FeedList.tsx
import React, { useCallback } from 'react';
import { RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { View } from '@tamagui/core';
import { useFeed } from '@/hooks/useFeed';
import { PostCard } from './PostCard/PostCard';
import { EmptyFeed } from './EmptyFeed';
import { FeedError } from './FeedError';
import { Colors } from '@/theme';

export function FeedList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useFeed();

  const posts = data?.pages.flatMap(page => page) ?? [];

  const renderItem = useCallback(({ item }) => (
    <PostCard post={item} />
  ), []);

  const keyExtractor = useCallback((item) => item.id, []);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <FeedError onRetry={refetch} />;
  }

  return (
    <FlashList
      data={posts}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={450}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={Colors.primary}
        />
      }
      ListEmptyComponent={<EmptyFeed />}
      ItemSeparatorComponent={() => <View h={8} />}
      contentContainerStyle={{ paddingVertical: 8 }}
    />
  );
}
```

### Post Card Component
```typescript
// components/feed/PostCard/PostCard.tsx
import React, { memo } from 'react';
import { YStack, XStack } from '@tamagui/core';
import { PostHeader } from './PostHeader';
import { PostMedia } from './PostMedia';
import { PostActions } from './PostActions';
import { Colors } from '@/theme';
import type { Post } from '@/types/feed';

interface PostCardProps {
  post: Post;
}

export const PostCard = memo(({ post }: PostCardProps) => {
  return (
    <YStack
      bg={Colors.surface}
      mx="$2"
      borderRadius="$4"
      shadowColor="$shadowColor"
      shadowRadius={4}
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      overflow="hidden"
    >
      <PostHeader 
        user={post.user}
        createdAt={post.created_at}
      />
      
      <PostMedia 
        mediaUrl={post.media_url}
        mediaType={post.media_type}
        bet={post.bet}
      />
      
      {post.caption && (
        <YStack px="$3" py="$2">
          <Text fontSize="$3" numberOfLines={2}>
            {post.caption}
          </Text>
        </YStack>
      )}
      
      <PostActions
        postId={post.id}
        reactions={post.reactions}
        tailCount={post.tail_count}
        fadeCount={post.fade_count}
        bet={post.bet}
      />
    </YStack>
  );
});

PostCard.displayName = 'PostCard';
```

### Post Header Component
```typescript
// components/feed/PostCard/PostHeader.tsx
import React from 'react';
import { XStack, YStack, Text } from '@tamagui/core';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/common/Avatar';
import { formatUserStat } from '@/utils/stats';
import { formatTimeAgo } from '@/utils/time';
import { Colors } from '@/theme';

interface PostHeaderProps {
  user: {
    id: string;
    username: string;
    avatar_url?: string;
    stats_display?: {
      primary_stat: string;
      selected_badge?: string;
    };
  };
  createdAt: string;
}

export function PostHeader({ user, createdAt }: PostHeaderProps) {
  const router = useRouter();
  
  const handleProfilePress = () => {
    router.push(`/profile/${user.username}`);
  };
  
  return (
    <TouchableOpacity onPress={handleProfilePress}>
      <XStack p="$3" ai="center" gap="$3">
        <Avatar 
          size="$4"
          source={{ uri: user.avatar_url }}
          fallback={user.username[0]}
        />
        
        <YStack f={1}>
          <Text fontSize="$4" fontWeight="600">
            @{user.username}
          </Text>
          <XStack ai="center" gap="$2">
            {user.stats_display && (
              <>
                <Text fontSize="$2" color={Colors.textSecondary}>
                  {formatUserStat(user.stats_display)}
                </Text>
                <Text fontSize="$2" color={Colors.textSecondary}>•</Text>
              </>
            )}
            <Text fontSize="$2" color={Colors.textSecondary}>
              {formatTimeAgo(createdAt)}
            </Text>
          </XStack>
        </YStack>
        
        <TouchableOpacity>
          <Text fontSize="$5" color={Colors.textSecondary}>⋯</Text>
        </TouchableOpacity>
      </XStack>
    </TouchableOpacity>
  );
}
```

### Post Media Component
```typescript
// components/feed/PostCard/PostMedia.tsx
import React, { useState } from 'react';
import { View, Image, Dimensions, ActivityIndicator } from 'react-native';
import Video from 'react-native-video';
import { BetOverlay } from './BetOverlay';
import { Colors } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MEDIA_HEIGHT = (SCREEN_WIDTH - 16) * 9 / 16; // 16:9 aspect ratio

interface PostMediaProps {
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  bet?: any;
}

export function PostMedia({ mediaUrl, mediaType, bet }: PostMediaProps) {
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(true);
  
  return (
    <View style={{ width: SCREEN_WIDTH - 16, height: MEDIA_HEIGHT }}>
      {mediaType === 'photo' ? (
        <>
          <Image
            source={{ uri: mediaUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onLoadEnd={() => setLoading(false)}
          />
          {loading && (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: Colors.surfaceAlt,
            }}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          )}
        </>
      ) : (
        <Video
          source={{ uri: mediaUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          paused={paused}
          repeat={true}
          onLoad={() => setLoading(false)}
          // Add video controls
        />
      )}
      
      {bet && <BetOverlay bet={bet} />}
    </View>
  );
}
```

### Bet Overlay Component
```typescript
// components/feed/PostCard/BetOverlay.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatOdds, formatMoney } from '@/utils/betting';
import { Colors } from '@/theme';

interface BetOverlayProps {
  bet: {
    bet_type: 'spread' | 'total' | 'moneyline';
    selection: string;
    odds: number;
    amount: number;
    game: {
      home_team: string;
      away_team: string;
    };
  };
}

export function BetOverlay({ bet }: BetOverlayProps) {
  const getBetDisplay = () => {
    switch (bet.bet_type) {
      case 'spread':
        return `${bet.selection} ${formatOdds(bet.odds)}`;
      case 'total':
        return `${bet.selection} ${formatOdds(bet.odds)}`;
      case 'moneyline':
        return `${bet.selection} ML ${formatOdds(bet.odds)}`;
    }
  };
  
  return (
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.7)']}
      style={styles.overlay}
    >
      <View style={styles.content}>
        <Text style={styles.teams}>
          {bet.game.away_team} @ {bet.game.home_team}
        </Text>
        <Text style={styles.betInfo}>
          {getBetDisplay()} • {formatMoney(bet.amount)}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
  },
  content: {
    padding: 12,
  },
  teams: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
  },
  betInfo: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
});
```

### Post Actions Component
```typescript
// components/feed/PostCard/PostActions.tsx
import React from 'react';
import { XStack, Button, Text } from '@tamagui/core';
import { TouchableOpacity } from 'react-native';
import { usePostActions } from '@/hooks/usePostActions';
import { Colors } from '@/theme';

interface PostActionsProps {
  postId: string;
  reactions: Array<{ emoji: string; user_id: string }>;
  tailCount: number;
  fadeCount: number;
  bet?: any;
}

export function PostActions({ 
  postId, 
  reactions, 
  tailCount, 
  fadeCount, 
  bet 
}: PostActionsProps) {
  const { tailBet, fadeBet, addReaction } = usePostActions(postId);
  
  const myReaction = reactions.find(r => r.user_id === currentUserId);
  
  return (
    <XStack p="$3" jc="space-between" ai="center">
      {/* Tail/Fade Buttons */}
      {bet && (
        <XStack gap="$2">
          <Button
            size="$3"
            bg={Colors.tail}
            onPress={() => tailBet(bet)}
            pressStyle={{ opacity: 0.8 }}
          >
            <Text color="white" fontSize="$3">
              Tail {tailCount > 0 && `(${tailCount})`}
            </Text>
          </Button>
          
          <Button
            size="$3"
            bg={Colors.fade}
            onPress={() => fadeBet(bet)}
            pressStyle={{ opacity: 0.8 }}
          >
            <Text color="white" fontSize="$3">
              Fade {fadeCount > 0 && `(${fadeCount})`}
            </Text>
          </Button>
        </XStack>
      )}
      
      {/* Reactions */}
      <XStack gap="$2" ai="center">
        {reactions.length > 0 && (
          <Text fontSize="$2" color={Colors.textSecondary}>
            {reactions.length}
          </Text>
        )}
        <TouchableOpacity onPress={() => addReaction('🔥')}>
          <Text fontSize="$5">
            {myReaction ? myReaction.emoji : '🤍'}
          </Text>
        </TouchableOpacity>
      </XStack>
    </XStack>
  );
}
```

### Feed Hook
```typescript
// hooks/useFeed.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useFeed() {
  const { user } = useAuth();
  
  // Get following list
  const { data: following } = useQuery({
    queryKey: ['following', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user?.id);
      return data?.map(f => f.following_id) ?? [];
    },
    enabled: !!user?.id,
  });
  
  // Infinite scroll query
  const feedQuery = useInfiniteQuery({
    queryKey: ['feed', following],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users!user_id (
            id,
            username,
            avatar_url,
            stats_display:user_stats_display!user_id (
              primary_stat,
              selected_badge
            )
          ),
          bet:bets!bet_id (
            *,
            game:games!game_id (*)
          ),
          reactions (emoji, user_id),
          tail_count,
          fade_count
        `)
        .in('user_id', [...(following ?? []), user?.id])
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + 19);
      
      if (error) throw error;
      return data ?? [];
    },
    getNextPageParam: (lastPage, pages) => 
      lastPage.length === 20 ? pages.length * 20 : undefined,
    enabled: !!following && following.length > 0,
  });
  
  // Real-time subscription
  useEffect(() => {
    if (!following || following.length === 0) return;
    
    const subscription = supabase
      .channel('feed-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `user_id=in.(${[...following, user?.id].join(',')})`,
        },
        (payload) => {
          // Add new post to top of feed
          queryClient.setQueryData(['feed', following], (old: any) => {
            if (!old) return old;
            const newPages = [...old.pages];
            newPages[0] = [payload.new, ...newPages[0]];
            return { ...old, pages: newPages };
          });
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [following, user?.id]);
  
  return feedQuery;
}
```

### Empty Feed Component
```typescript
// components/feed/EmptyFeed.tsx
import React from 'react';
import { YStack, Text, Button } from '@tamagui/core';
import { useRouter } from 'expo-router';
import { Colors } from '@/theme';

export function EmptyFeed() {
  const router = useRouter();
  
  return (
    <YStack f={1} ai="center" jc="center" p="$6">
      <Text fontSize="$6" mb="$2">📭</Text>
      <Text fontSize="$5" fontWeight="600" mb="$2">
        No posts yet
      </Text>
      <Text fontSize="$3" color={Colors.textSecondary} textAlign="center" mb="$4">
        Follow more friends to see their picks and posts here
      </Text>
      <Button
        size="$4"
        bg={Colors.primary}
        onPress={() => router.push('/search')}
      >
        <Text color="white">Find Friends</Text>
      </Button>
    </YStack>
  );
}
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| GET | /rest/v1/posts | Query params | Post array | PLANNED |
| GET | /rest/v1/follows | Query params | Following list | PLANNED |
| POST | /rest/v1/reactions | `{ post_id, emoji }` | Reaction record | PLANNED |
| REALTIME | posts channel | WebSocket | New posts | PLANNED |

### State Management
- Feed data managed by React Query
- Infinite scroll state in useInfiniteQuery
- Real-time updates via Supabase subscriptions
- Optimistic updates for reactions

## Testing Performed

### Manual Testing
- [ ] Feed loads with posts from followed users
- [ ] Infinite scroll triggers at bottom
- [ ] Pull-to-refresh works
- [ ] Empty state shows when no follows
- [ ] Error state shows on failure
- [ ] Post cards display all information
- [ ] Media loads properly (photos)
- [ ] Videos play/pause correctly
- [ ] Bet overlay shows correct info
- [ ] Tail/Fade buttons work
- [ ] Reaction button works
- [ ] Profile navigation works
- [ ] Real-time posts appear
- [ ] Memory usage stable on scroll

### Edge Cases Considered
- User with no follows: Show empty state with CTA
- Network failure: Show error with retry
- Slow media loading: Show placeholder
- Expired posts: Filter out automatically
- Missing bet data: Hide tail/fade buttons
- Long captions: Truncate with ellipsis

## Documentation Updates

- [ ] Document feed query structure
- [ ] Add FlashList performance tips
- [ ] Document real-time subscription setup
- [ ] Add React Query patterns

## Handoff to Reviewer

### What Was Implemented
[To be completed at sprint end]

### Files Modified/Created
**Created**:
[To be listed at sprint end]

**Modified**:
[To be listed at sprint end]

### Key Decisions Made
1. FlashList for superior scrolling performance
2. React Query for caching and infinite scroll
3. Chronological order only (no algorithm)
4. Real-time updates via WebSocket
5. 20 posts per page for pagination
6. Optimistic updates for better UX

### Deviations from Original Plan
[To be tracked during implementation]

### Known Issues/Concerns
[To be identified during implementation]

### Suggested Review Focus
- Performance with many posts
- Memory management
- Real-time subscription cleanup
- Error handling completeness
- UI consistency with Epic 2

**Sprint Status**: NOT STARTED

---

## Reviewer Section

**Reviewer**: [R persona]  
**Review Date**: [Date]

### Review Checklist
- [ ] Feed performance acceptable
- [ ] Infinite scroll works smoothly
- [ ] Real-time updates work
- [ ] All UI elements follow patterns
- [ ] Error states handled
- [ ] No memory leaks
- [ ] Integrates with Epic 2 properly

### Review Outcome

**Status**: PENDING

### Feedback
[Review feedback will go here]

---

## Sprint Metrics

**Duration**: Planned 3 days | Actual [TBD]  
**Scope Changes**: [TBD]  
**Review Cycles**: [TBD]  
**Files Touched**: ~15  
**Lines Added**: ~1200 (estimated)  
**Lines Removed**: ~50

## Learnings for Future Sprints

[To be added after sprint completion]

---

*Sprint Started: [TBD]*  
*Sprint Completed: [TBD]*  
*Final Status: NOT STARTED* 