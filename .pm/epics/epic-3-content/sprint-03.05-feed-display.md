# Sprint 03.05: Feed Display Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: 03 - Camera & Content Creation

**Sprint Goal**: Display all content types in the feed with proper UI components, enabling users to see their own posts and stories.

**User Story Contribution**: 
- Enables Story 1: Social Pick Sharing - users can see shared content
- Supports Story 3: Ephemeral Content - shows expiration countdowns

## Sprint Plan

### Objectives
1. Create PostCard component for all post types
2. Build StoryBar for horizontal story display
3. Implement basic feed with user's own content
4. Add video playback support
5. Show expiration countdowns

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `components/content/PostCard.tsx` | Display individual posts | NOT STARTED |
| `components/content/StoryBar.tsx` | Horizontal story selector | NOT STARTED |
| `components/content/StoryCircle.tsx` | Individual story avatar | NOT STARTED |
| `components/content/MediaDisplay.tsx` | Photo/video display component | NOT STARTED |
| `components/content/ExpirationTimer.tsx` | Countdown timer component | NOT STARTED |
| `hooks/useFeed.ts` | Feed data fetching hook | NOT STARTED |
| `hooks/useStories.ts` | Stories data fetching hook | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `app/(drawer)/(tabs)/index.tsx` | Replace empty feed with components | NOT STARTED |
| `components/ui/TabBar.tsx` | Ensure camera tab works with feed | NOT STARTED |

### Implementation Approach

**Phase 1: PostCard Component**
```typescript
interface PostCardProps {
  post: {
    id: string;
    user: {
      id: string;
      username: string;
      avatar_url?: string;
    };
    media_url: string;
    media_type: 'photo' | 'video';
    caption?: string;
    effect_id?: string;
    post_type: 'content' | 'pick' | 'outcome';
    created_at: string;
    expires_at: string;
    tail_count: number;
    fade_count: number;
    reaction_count: number;
    comment_count: number;
  };
}

// Layout:
// ┌─────────────────────────────┐
// │ 👤 @username • 2m ago       │ <- Header
// ├─────────────────────────────┤
// │                             │
// │      [Photo/Video]          │ <- Media (16:9)
// │                             │
// ├─────────────────────────────┤
// │ Caption text here...        │ <- Caption
// ├─────────────────────────────┤
// │ 👍 Tail  👎 Fade  💬 12  ❤️ 45│ <- Actions
// └─────────────────────────────┘
```

**Phase 2: StoryBar Component**
```typescript
interface Story {
  id: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  created_at: string;
  viewed?: boolean;
}

// Layout:
// ┌──┐ ┌──┐ ┌──┐ ┌──┐ →
// │➕│ │🔴│ │🔵│ │  │  
// └──┘ └──┘ └──┘ └──┘
// You  User1 User2 User3

// Features:
// - "Your story" first or add button
// - Gradient ring for unwatched
// - Gray ring for watched
// - Horizontal scroll
```

**Phase 3: Media Display**
```typescript
// Photo display:
// - Use Image component
// - 16:9 aspect ratio
// - Cover resize mode
// - Loading placeholder

// Video display:
// - Use expo-video (NOT expo-av)
// - Autoplay muted
// - Loop enabled
// - Play/pause on tap
// - Show duration badge
```

**Phase 4: Feed Implementation**
```typescript
// useFeed hook
const useFeed = () => {
  const { user } = useAuth();
  
  // For now, just fetch user's own posts
  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['feed', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('posts')
        .select(`
          *,
          user:users!user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .gte('expires_at', new Date().toISOString());
      
      return data || [];
    }
  });
  
  return { posts, isLoading, refetch };
};
```

**Phase 5: Expiration Timer**
```typescript
// Show remaining time:
// - "23h" for hours remaining
// - "45m" for minutes when < 1 hour
// - "2m" for minutes when < 5 minutes
// - Red color when < 1 hour
// - Auto-remove from feed when expired
```

**Phase 6: Feed Screen Layout**
```typescript
<View flex={1}>
  {/* Header */}
  <Header />
  
  {/* Stories Bar */}
  <StoryBar stories={stories} />
  
  {/* Feed */}
  <FlatList
    data={posts}
    renderItem={({ item }) => <PostCard post={item} />}
    keyExtractor={(item) => item.id}
    refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    }
    ListEmptyComponent={<EmptyFeed />}
    contentContainerStyle={{ paddingBottom: 100 }}
  />
</View>
```

**Key Technical Decisions**:
- **Own Content Only**: Epic 3 shows only user's posts (Epic 4 adds others)
- **No FlashList Yet**: Use FlatList for simplicity (upgrade in Epic 4)
- **Basic Interactions**: Buttons visible but show "Coming soon" toast
- **Video Autoplay**: Muted autoplay for better UX

### Dependencies & Risks
**Dependencies**:
- Posts/stories in database (Sprint 3.4)
- expo-video for video playback
- React Query for data fetching

**Identified Risks**:
- **Video Performance**: Multiple videos could lag
  - Mitigation: Pause off-screen videos
- **Expiration Timing**: Need accurate countdown
  - Mitigation: Refresh on focus, use intervals wisely

## Implementation Log

### Day-by-Day Progress
**[Date TBD]**:
- Started: 
- Completed: 
- Blockers: 
- Decisions: 

### Reality Checks & Plan Updates
[To be filled during implementation]

### Code Quality Checks

**Linting Results**:
- [ ] Initial run: 
- [ ] Final run: 0 errors, 0 warnings

**Type Checking Results**:
- [ ] Initial run: 
- [ ] Final run: 0 errors

**Build Results**:
- [ ] Development build passes
- [ ] Production build passes

## Key Code Additions

### PostCard Structure
```typescript
export function PostCard({ post }: PostCardProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar src={post.user.avatar_url} size={40} />
        <View style={styles.headerText}>
          <Text style={styles.username}>@{post.user.username}</Text>
          <Text style={styles.timestamp}>
            {formatTimeAgo(post.created_at)}
          </Text>
        </View>
        <ExpirationTimer expiresAt={post.expires_at} />
      </View>
      
      {/* Media */}
      <MediaDisplay
        url={post.media_url}
        type={post.media_type}
      />
      
      {/* Caption */}
      {post.caption && (
        <Text style={styles.caption}>{post.caption}</Text>
      )}
      
      {/* Actions */}
      <View style={styles.actions}>
        {post.post_type === 'pick' && (
          <>
            <Button icon="👍" label="Tail" count={post.tail_count} />
            <Button icon="👎" label="Fade" count={post.fade_count} />
          </>
        )}
        <Button icon="💬" count={post.comment_count} />
        <Button icon="❤️" count={post.reaction_count} />
      </View>
    </View>
  );
}
```

### Empty State
```typescript
function EmptyFeed() {
  const router = useRouter();
  
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>No posts yet</Text>
      <Text style={styles.emptyText}>
        Tap the camera to create your first post!
      </Text>
      <Button
        onPress={() => router.push('/(drawer)/camera')}
        title="Create Post"
      />
    </View>
  );
}
```

## Testing Performed

### Manual Testing
- [ ] Feed loads user's posts
- [ ] Stories bar shows correctly
- [ ] Photos display properly
- [ ] Videos play automatically
- [ ] Expiration timer counts down
- [ ] Pull to refresh works
- [ ] Empty state shows for new users

### Edge Cases Considered
- User with no posts
- Expired posts filtered out
- Very long captions
- Video loading states
- Network errors

## Documentation Updates

- [ ] Document PostCard props
- [ ] Add feed architecture notes
- [ ] Document video playback approach
- [ ] Update component hierarchy

## Handoff to Reviewer

### What Will Be Implemented
- Complete feed display with PostCard components
- Horizontal story bar (UI only for now)
- Photo and video playback
- Expiration countdown timers
- Pull to refresh functionality
- Empty state for new users

### Success Criteria
- Feed shows all user's non-expired posts
- Videos autoplay muted
- Stories bar scrolls horizontally
- Expiration timers update live
- Smooth scrolling performance

### Testing Instructions
1. Create a few posts with Sprint 3.4
2. Open feed tab
3. Verify posts display correctly
4. Check video playback
5. Watch expiration timer
6. Pull to refresh
7. Test with no posts (empty state)

**Sprint Status**: NOT STARTED

---

## Reviewer Section

**Reviewer**: [R persona]  
**Review Date**: [TBD]

### Review Checklist
- [ ] Feed performance acceptable
- [ ] Video playback smooth
- [ ] Components well structured
- [ ] Error states handled
- [ ] UI matches design intent

### Review Outcome

**Status**: [TBD]

---

*Sprint Created: 2025-01-20*  
*Sprint Started: [TBD]*  
*Sprint Completed: [TBD]* 