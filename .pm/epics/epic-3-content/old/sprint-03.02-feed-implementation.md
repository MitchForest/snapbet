# Sprint 03.02: Feed Implementation Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 3 - Social Feed & Content

**Sprint Goal**: Create the main social feed with performant infinite scroll, post cards displaying media and bet attachments, real-time updates, comments system, and full integration with user profiles and stats from Epic 2.

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
8. **NEW: Implement comments system with real-time updates**
9. **NEW: Add post type support (content/pick/outcome)**
10. **NEW: Add post options menu with report/block**
11. **NEW: Filter blocked users from feed**

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `components/feed/FeedList.tsx` | Main feed list with FlashList | NOT STARTED |
| `components/feed/PostCard/PostCard.tsx` | Individual post display component | NOT STARTED |
| `components/feed/PostCard/PostHeader.tsx` | User info and stats header | NOT STARTED |
| `components/feed/PostCard/PostMedia.tsx` | Photo/video player component | NOT STARTED |
| `components/feed/PostCard/PostActions.tsx` | Tail/fade/reaction buttons | NOT STARTED |
| `components/feed/PostCard/BetOverlay.tsx` | Bet details overlay on media | NOT STARTED |
| `components/feed/PostCard/PostOptionsMenu.tsx` | Report/block menu | NOT STARTED |
| `components/feed/Comments/CommentsList.tsx` | Comments thread component | NOT STARTED |
| `components/feed/Comments/CommentItem.tsx` | Individual comment display | NOT STARTED |
| `components/feed/Comments/CommentInput.tsx` | Add comment input | NOT STARTED |
| `components/feed/EmptyFeed.tsx` | Empty state component | NOT STARTED |
| `components/feed/FeedError.tsx` | Error state component | NOT STARTED |
| `hooks/useFeed.ts` | Feed data fetching and state | NOT STARTED |
| `hooks/usePostActions.ts` | Post interaction logic | NOT STARTED |
| `hooks/useComments.ts` | Comments functionality | NOT STARTED |
| `services/content/postService.ts` | Post CRUD operations | NOT STARTED |
| `services/content/commentService.ts` | Comment operations | NOT STARTED |
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
bun add @gorhom/bottom-sheet@~4.5.1
bun add react-native-reanimated@~3.6.0
bun add react-native-gesture-handler@~2.14.0

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

#### 3. Database Schema Requirements
```sql
-- Ensure these tables exist from Epic 1
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  post_type TEXT DEFAULT 'content' CHECK (post_type IN ('content', 'pick', 'outcome')),
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  caption TEXT CHECK (char_length(caption) <= 500),
  bet_id UUID REFERENCES bets(id),
  tail_count INTEGER DEFAULT 0,
  fade_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP DEFAULT NOW(),
  hidden BOOLEAN DEFAULT FALSE,
  report_count INTEGER DEFAULT 0
);

CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  emoji TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  text TEXT NOT NULL CHECK (char_length(text) <= 280),
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_expires ON posts(expires_at);
CREATE INDEX idx_reactions_post ON reactions(post_id);
CREATE INDEX idx_comments_post ON comments(post_id);
```

#### 4. Optimized Database Query
```typescript
// Optimized feed query with proper joins
const { data: posts } = await supabase
  .from('posts')
  .select(`
    id,
    user_id,
    post_type,
    media_url,
    media_type,
    caption,
    bet_id,
    tail_count,
    fade_count,
    created_at,
    user:users!user_id (
      id,
      username,
      avatar_url
    ),
    reactions (
      emoji,
      user_id
    ),
    _comment_count:comments(count)
  `)
  .in('user_id', [...followingIds, user?.id])
  .eq('hidden', false)
  .gte('expires_at', new Date().toISOString())
  .order('created_at', { ascending: false })
  .range(pageParam, pageParam + 19);

// Note: Blocking filter moved to separate query for performance
// Stats display joined separately when needed
```

**Key Technical Decisions**:
- FlashList over FlatList (better performance)
- React Query for caching and pagination
- Chronological order only (no algorithm)
- 20 posts per page
- Real-time via WebSocket subscriptions
- No draft posts (direct publish only)
- **Comments limited to 280 characters**
- **Post types for future betting integration**
- **Blocked users filtered at query level**

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
import { View, YStack, Text } from '@tamagui/core';
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
          <Text color={Colors.textSecondary} textAlign="center" lineHeight={88}>
            Stories coming in Sprint 03.03
          </Text>
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
import React, { memo, useState } from 'react';
import { YStack, XStack, Text } from '@tamagui/core';
import { PostHeader } from './PostHeader';
import { PostMedia } from './PostMedia';
import { PostActions } from './PostActions';
import { CommentsList } from '../Comments/CommentsList';
import { Colors } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import type { Post } from '@/types/feed';

interface PostCardProps {
  post: Post;
}

export const PostCard = memo(({ post }: PostCardProps) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  
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
        postId={post.id}
        isOwnPost={post.user_id === user?.id}
      />
      
      <PostMedia 
        mediaUrl={post.media_url}
        mediaType={post.media_type}
        bet={post.bet}
        postType={post.post_type}
      />
      
      {post.caption && (
        <YStack px="$3" py="$2">
          <Text fontSize="$3" numberOfLines={2} color={Colors.text}>
            {post.caption}
          </Text>
        </YStack>
      )}
      
      <PostActions
        postId={post.id}
        postType={post.post_type}
        reactions={post.reactions}
        commentCount={post._comment_count?.[0]?.count || 0}
        tailCount={post.tail_count}
        fadeCount={post.fade_count}
        bet={post.bet}
        onCommentPress={() => setShowComments(!showComments)}
      />
      
      {showComments && (
        <CommentsList 
          postId={post.id}
          isVisible={showComments}
        />
      )}
    </YStack>
  );
});

PostCard.displayName = 'PostCard';
```

### Post Header Component with Options Menu
```typescript
// components/feed/PostCard/PostHeader.tsx
import React, { useState } from 'react';
import { XStack, YStack, Text } from '@tamagui/core';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/common/Avatar';
import { PostOptionsMenu } from './PostOptionsMenu';
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
  postId: string;
  isOwnPost: boolean;
}

export function PostHeader({ user, createdAt, postId, isOwnPost }: PostHeaderProps) {
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);
  
  const handleProfilePress = () => {
    router.push(`/profile/${user.username}`);
  };
  
  return (
    <XStack p="$3" ai="center" gap="$3">
      <TouchableOpacity onPress={handleProfilePress}>
        <XStack ai="center" gap="$3" f={1}>
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
        </XStack>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setShowOptions(true)}>
        <Text fontSize="$5" color={Colors.textSecondary}>⋯</Text>
      </TouchableOpacity>
      
      <PostOptionsMenu
        isVisible={showOptions}
        onClose={() => setShowOptions(false)}
        postId={postId}
        userId={user.id}
        username={user.username}
        isOwnPost={isOwnPost}
      />
    </XStack>
  );
}
```

### Post Options Menu Component (Using Tamagui Sheet)
```typescript
// components/feed/PostCard/PostOptionsMenu.tsx
import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import { Sheet, YStack, XStack, Text, Button } from '@tamagui/core';
import { useRouter } from 'expo-router';
import { useBlockUser } from '@/hooks/useBlockUser';
import { postService } from '@/services/content/postService';
import { Colors } from '@/theme';

interface PostOptionsMenuProps {
  isVisible: boolean;
  onClose: () => void;
  postId: string;
  userId: string;
  username: string;
  isOwnPost: boolean;
}

export function PostOptionsMenu({ 
  isVisible, 
  onClose, 
  postId, 
  userId,
  username,
  isOwnPost 
}: PostOptionsMenuProps) {
  const router = useRouter();
  const { blockUser } = useBlockUser();
  
  const handleBlock = useCallback(() => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block @${username}? You won't see their posts or stories.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Block', 
          style: 'destructive',
          onPress: async () => {
            await blockUser(userId);
            onClose();
          }
        }
      ]
    );
  }, [userId, username, blockUser, onClose]);
  
  const handleReport = useCallback(() => {
    onClose();
    router.push(`/report/${postId}`);
  }, [postId, onClose, router]);
  
  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await postService.deletePost(postId);
            onClose();
          }
        }
      ]
    );
  }, [postId, onClose]);
  
  return (
    <Sheet
      modal
      open={isVisible}
      onOpenChange={onClose}
      snapPoints={[isOwnPost ? 20 : 25]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame>
        <Sheet.Handle />
        <YStack p="$4" gap="$2">
          {isOwnPost ? (
            <Button
              size="$4"
              bg="transparent"
              onPress={handleDelete}
              icon={<Text fontSize="$5">🗑️</Text>}
            >
              <Text color={Colors.error} fontSize="$4">Delete Post</Text>
            </Button>
          ) : (
            <>
              <Button
                size="$4"
                bg="transparent"
                onPress={handleBlock}
                icon={<Text fontSize="$5">🚫</Text>}
              >
                <Text fontSize="$4" color={Colors.text}>Block @{username}</Text>
              </Button>
              
              <Button
                size="$4"
                bg="transparent"
                onPress={handleReport}
                icon={<Text fontSize="$5">🚨</Text>}
              >
                <Text fontSize="$4" color={Colors.text}>Report Post</Text>
              </Button>
            </>
          )}
          
          <Button
            size="$4"
            bg="transparent"
            onPress={onClose}
            mt="$2"
          >
            <Text color={Colors.textSecondary} fontSize="$4">Cancel</Text>
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
```

### Post Media Component with Post Type Support
```typescript
// components/feed/PostCard/PostMedia.tsx
import React, { useState } from 'react';
import { View, Image, Dimensions, ActivityIndicator } from 'react-native';
import Video from 'react-native-video';
import { BetOverlay } from './BetOverlay';
import { Colors } from '@/theme';
import { PostType } from '@/types/feed';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MEDIA_HEIGHT = (SCREEN_WIDTH - 16) * 9 / 16; // 16:9 aspect ratio

interface PostMediaProps {
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  bet?: any;
  postType: PostType;
}

export function PostMedia({ mediaUrl, mediaType, bet, postType }: PostMediaProps) {
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
      
      {/* Bet overlay only shows on pick posts (future) */}
      {postType === PostType.PICK && bet && <BetOverlay bet={bet} />}
      
      {/* Outcome overlay for outcome posts (future) */}
      {postType === PostType.OUTCOME && (
        <View style={{ position: 'absolute', top: 16, right: 16 }}>
          {/* Placeholder for outcome overlay */}
        </View>
      )}
    </View>
  );
}
```

### Post Actions Component with Comments
```typescript
// components/feed/PostCard/PostActions.tsx
import React from 'react';
import { YStack, XStack, Button, Text } from '@tamagui/core';
import { TouchableOpacity } from 'react-native';
import { usePostActions } from '@/hooks/usePostActions';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/theme';
import { PostType } from '@/types/feed';

interface PostActionsProps {
  postId: string;
  postType: PostType;
  reactions: Array<{ emoji: string; user_id: string }>;
  commentCount: number;
  tailCount: number;
  fadeCount: number;
  bet?: any;
  onCommentPress: () => void;
}

export function PostActions({ 
  postId,
  postType,
  reactions, 
  commentCount,
  tailCount, 
  fadeCount, 
  bet,
  onCommentPress
}: PostActionsProps) {
  const { user } = useAuth();
  const { tailBet, fadeBet, addReaction } = usePostActions(postId);
  
  const myReaction = reactions.find(r => r.user_id === user?.id);
  
  return (
    <YStack>
      <XStack p="$3" jc="space-between" ai="center">
        {/* Tail/Fade Buttons - Only on pick posts */}
        {postType === PostType.PICK && bet && (
          <XStack gap="$2">
            <Button
              size="$3"
              bg={Colors.tail}
              onPress={() => tailBet(bet)}
              pressStyle={{ opacity: 0.8 }}
            >
              <Text color="white" fontSize="$3" fontWeight="600">
                Tail {tailCount > 0 && `(${tailCount})`}
              </Text>
            </Button>
            
            <Button
              size="$3"
              bg={Colors.fade}
              onPress={() => fadeBet(bet)}
              pressStyle={{ opacity: 0.8 }}
            >
              <Text color="white" fontSize="$3" fontWeight="600">
                Fade {fadeCount > 0 && `(${fadeCount})`}
              </Text>
            </Button>
          </XStack>
        )}
        
        {/* Comments and Reactions */}
        <XStack gap="$3" ai="center" ml={postType !== PostType.PICK ? 'auto' : undefined}>
          <TouchableOpacity onPress={onCommentPress}>
            <XStack ai="center" gap="$1">
              <Text fontSize="$5">💬</Text>
              {commentCount > 0 && (
                <Text fontSize="$2" color={Colors.textSecondary}>
                  {commentCount}
                </Text>
              )}
            </XStack>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => addReaction('🔥')}>
            <XStack ai="center" gap="$1">
              <Text fontSize="$5">
                {myReaction ? myReaction.emoji : '🤍'}
              </Text>
              {reactions.length > 0 && (
                <Text fontSize="$2" color={Colors.textSecondary}>
                  {reactions.length}
                </Text>
              )}
            </XStack>
          </TouchableOpacity>
        </XStack>
      </XStack>
    </YStack>
  );
}
```

### Comments List Component
```typescript
// components/feed/Comments/CommentsList.tsx
import React from 'react';
import { YStack, XStack } from '@tamagui/core';
import { FlatList } from 'react-native';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { useComments } from '@/hooks/useComments';
import { Colors } from '@/theme';

interface CommentsListProps {
  postId: string;
  isVisible: boolean;
}

export function CommentsList({ postId, isVisible }: CommentsListProps) {
  const { comments, isLoading, addComment } = useComments(postId);
  
  if (!isVisible) return null;
  
  return (
    <YStack borderTopWidth={1} borderColor={Colors.border}>
      <FlatList
        data={comments}
        renderItem={({ item }) => <CommentItem comment={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={
          <Text textAlign="center" color={Colors.textSecondary} p="$3">
            No comments yet. Be the first!
          </Text>
        }
      />
      
      <CommentInput 
        onSubmit={(text) => addComment(text)}
        placeholder="Add a comment..."
      />
    </YStack>
  );
}
```

### Comment Item Component
```typescript
// components/feed/Comments/CommentItem.tsx
import React from 'react';
import { XStack, YStack, Text } from '@tamagui/core';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/common/Avatar';
import { formatTimeAgo } from '@/utils/time';
import { Colors } from '@/theme';

interface CommentItemProps {
  comment: {
    id: string;
    text: string;
    created_at: string;
    user: {
      id: string;
      username: string;
      avatar_url?: string;
    };
  };
}

export function CommentItem({ comment }: CommentItemProps) {
  const router = useRouter();
  
  return (
    <XStack p="$3" gap="$2">
      <TouchableOpacity 
        onPress={() => router.push(`/profile/${comment.user.username}`)}
      >
        <Avatar
          size="$3"
          source={{ uri: comment.user.avatar_url }}
          fallback={comment.user.username[0]}
        />
      </TouchableOpacity>
      
      <YStack f={1} gap="$1">
        <XStack ai="center" gap="$2">
          <TouchableOpacity 
            onPress={() => router.push(`/profile/${comment.user.username}`)}
          >
            <Text fontSize="$3" fontWeight="600">
              @{comment.user.username}
            </Text>
          </TouchableOpacity>
          <Text fontSize="$1" color={Colors.textSecondary}>
            {formatTimeAgo(comment.created_at)}
          </Text>
        </XStack>
        
        <Text fontSize="$3">
          {comment.text}
        </Text>
      </YStack>
    </XStack>
  );
}
```

### Comment Input Component
```typescript
// components/feed/Comments/CommentInput.tsx
import React, { useState } from 'react';
import { XStack, Input, Button } from '@tamagui/core';
import { Colors } from '@/theme';

interface CommentInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
}

export function CommentInput({ onSubmit, placeholder }: CommentInputProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!text.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    await onSubmit(text);
    setText('');
    setIsSubmitting(false);
  };
  
  return (
    <XStack p="$3" gap="$2" borderTopWidth={1} borderColor={Colors.border}>
      <Input
        f={1}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        maxLength={280}
        multiline
        disabled={isSubmitting}
      />
      
      <Button
        size="$3"
        bg={Colors.primary}
        onPress={handleSubmit}
        disabled={!text.trim() || isSubmitting}
        opacity={!text.trim() || isSubmitting ? 0.5 : 1}
      >
        <Text color="white">Post</Text>
      </Button>
    </XStack>
  );
}
```

### Feed Hook with Blocked Users
```typescript
// hooks/useFeed.ts
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useFeed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Get blocked users
  const { data: blockedUsers } = useQuery({
    queryKey: ['blocked-users', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_blocks')
        .select('blocked_id')
        .eq('blocker_id', user?.id);
      return data?.map(b => b.blocked_id) ?? [];
    },
    enabled: !!user?.id,
  });
  
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
    queryKey: ['feed', following, blockedUsers],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('posts')
        .select(`
          id,
          user_id,
          post_type,
          media_url,
          media_type,
          caption,
          bet_id,
          tail_count,
          fade_count,
          created_at,
          user:users!user_id (
            id,
            username,
            avatar_url
          ),
          reactions (
            emoji,
            user_id
          ),
          _comment_count:comments(count)
        `)
        .in('user_id', [...(following ?? []), user?.id])
        .eq('hidden', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + 19);
      
      // Filter out blocked users if any exist
      if (blockedUsers && blockedUsers.length > 0) {
        query = query.not('user_id', 'in', `(${blockedUsers.join(',')})`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data ?? [];
    },
    getNextPageParam: (lastPage, pages) => 
      lastPage.length === 20 ? pages.length * 20 : undefined,
    enabled: !!following && following.length > 0,
  });
  
  // Real-time subscription for posts and comments
  useEffect(() => {
    if (!following || following.length === 0) return;
    
    const channel = supabase.channel('feed-updates');
    
    // New posts
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
        filter: `user_id=in.(${[...following, user?.id].join(',')})`,
      },
      (payload) => {
        // Check if user is blocked
        if (blockedUsers?.includes(payload.new.user_id)) return;
        
        // Add new post to top of feed
        queryClient.setQueryData(['feed', following, blockedUsers], (old: any) => {
          if (!old) return old;
          const newPages = [...old.pages];
          newPages[0] = [payload.new, ...newPages[0]];
          return { ...old, pages: newPages };
        });
      }
    );
    
    // New comments
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
      },
      (payload) => {
        // Update comment count for the post
        queryClient.invalidateQueries({ 
          queryKey: ['comments', payload.new.post_id] 
        });
      }
    );
    
    channel.subscribe();
    
    return () => {
      channel.unsubscribe();
    };
  }, [following, user?.id, blockedUsers, queryClient]);
  
  return feedQuery;
}
```

### Post Actions Hook
```typescript
// hooks/usePostActions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';

export function usePostActions(postId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const addReactionMutation = useMutation({
    mutationFn: async (emoji: string) => {
      const { data, error } = await supabase
        .from('reactions')
        .upsert({
          post_id: postId,
          user_id: user?.id,
          emoji,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async (emoji) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      
      const previousData = queryClient.getQueryData(['feed']);
      
      queryClient.setQueryData(['feed'], (old: any) => {
        if (!old) return old;
        
        const newPages = old.pages.map((page: any[]) =>
          page.map((post) => {
            if (post.id === postId) {
              const existingReactionIndex = post.reactions.findIndex(
                (r: any) => r.user_id === user?.id
              );
              
              if (existingReactionIndex >= 0) {
                // Update existing reaction
                const newReactions = [...post.reactions];
                newReactions[existingReactionIndex] = { user_id: user?.id, emoji };
                return { ...post, reactions: newReactions };
              } else {
                // Add new reaction
                return {
                  ...post,
                  reactions: [...post.reactions, { user_id: user?.id, emoji }],
                };
              }
            }
            return post;
          })
        );
        
        return { ...old, pages: newPages };
      });
      
      return { previousData };
    },
    onError: (err, emoji, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['feed'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
  
  // Placeholder functions for tail/fade (Epic 4)
  const tailBet = async (bet: any) => {
    console.log('Tail functionality coming in Epic 4');
  };
  
  const fadeBet = async (bet: any) => {
    console.log('Fade functionality coming in Epic 4');
  };
  
  return {
    addReaction: addReactionMutation.mutate,
    tailBet,
    fadeBet,
  };
}
```

### Comments Hook
```typescript
// hooks/useComments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useComments(postId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          text,
          created_at,
          user:users!user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data ?? [];
    },
  });
  
  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user?.id,
          text,
        })
        .select(`
          id,
          text,
          created_at,
          user:users!user_id (
            id,
            username,
            avatar_url
          )
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newComment) => {
      // Update local cache
      queryClient.setQueryData(['comments', postId], (old: any[]) => {
        return [...(old ?? []), newComment];
      });
      
      // Update comment count in feed
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
  
  return {
    comments,
    isLoading,
    addComment: addCommentMutation.mutate,
  };
}
```

### Post Service
```typescript
// services/content/postService.ts
import { supabase } from '@/services/supabase';

export const postService = {
  async deletePost(postId: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
  },
  
  async reportPost(postId: string, reason: string, description?: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');
    
    // Insert report
    const { error } = await supabase
      .from('post_reports')
      .insert({
        post_id: postId,
        reporter_id: user.user.id,
        reason,
        description,
      });
    
    if (error && error.code !== '23505') { // Ignore duplicate report
      throw error;
    }
    
    // Increment report count
    await supabase.rpc('increment', {
      table_name: 'posts',
      column_name: 'report_count',
      row_id: postId,
    });
  },
};
```

### Comment Service
```typescript
// services/content/commentService.ts
import { supabase } from '@/services/supabase';

export const commentService = {
  async deleteComment(commentId: string) {
    // Soft delete
    const { error } = await supabase
      .from('comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', commentId);
    
    if (error) throw error;
  },
};
```

### Feed Types
```typescript
// types/feed.ts
export enum PostType {
  CONTENT = 'content',
  PICK = 'pick',
  OUTCOME = 'outcome',
}

export interface Post {
  id: string;
  user_id: string;
  post_type: PostType;
  media_url: string;
  media_type: 'photo' | 'video';
  caption?: string;
  bet_id?: string;
  tail_count: number;
  fade_count: number;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  bet?: any; // Detailed type in Epic 4
  reactions: Array<{
    emoji: string;
    user_id: string;
  }>;
  _comment_count?: Array<{ count: number }>;
}

export interface Comment {
  id: string;
  text: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}
```

### State Management
- Feed data managed by React Query with caching
- Infinite scroll state in useInfiniteQuery
- Real-time updates via Supabase subscriptions
- Optimistic updates for reactions
- Comment state managed per post
- Blocked users cached separately

### Error Handling
- Network errors show retry UI
- Failed reactions rollback optimistically
- Report duplicates handled gracefully
- Missing data shows appropriate placeholders
- Video load errors show fallback image

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