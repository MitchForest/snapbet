# Epic 03: Social Feed & Content Tracker

## Epic Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**Target End Date**: TBD  
**Actual End Date**: TBD

**Epic Goal**: Build the core social experience with photo/video sharing, ephemeral stories, and the home feed where users discover and engage with betting content.

**User Stories Addressed**:
- Story 1: Social Pick Sharing - Full photo/video capture, effects, and sharing to feed/stories
- Story 3: Ephemeral Content - 24-hour expiration for posts and stories with auto-cleanup
- Story 5: Performance Tracking - Visual representation of picks in feed (partial)

**PRD Reference**: Social sharing, content creation, and feed engagement features

## Sprint Breakdown

| Sprint # | Sprint Name | Status | Start Date | End Date | Key Deliverable |
|----------|-------------|--------|------------|----------|-----------------|
| 03.00 | Camera & Media Infrastructure | NOT STARTED | - | - | Camera capture, media compression, storage |
| 03.01 | Effects & Filters System | NOT STARTED | - | - | Overlay effects, filters, achievement unlocks |
| 03.02 | Feed Implementation | NOT STARTED | - | - | Home feed with posts, infinite scroll |
| 03.03 | Stories System | NOT STARTED | - | - | Stories bar, viewer, auto-expiration |
| 03.04 | Engagement Features | NOT STARTED | - | - | Reactions, view tracking, share functionality |

**Statuses**: NOT STARTED | IN PROGRESS | IN REVIEW | APPROVED | BLOCKED

## Architecture & Design Decisions

### High-Level Architecture for This Epic
```
Camera Flow:
├── Capture (Camera/Gallery)
├── Effects Application
├── Preview & Edit
├── Upload & Compress
└── Share to Feed/Story

Feed Architecture:
├── FlashList (Performance)
├── React Query (Caching)
├── Optimistic Updates
└── Real-time Subscriptions

Content Pipeline:
├── Client Compression
├── Supabase Storage
├── CDN Distribution
└── Expiration via Epic 2 Edge Functions
```

### Key Design Decisions

1. **Camera Implementation**: Hybrid approach - Expo Camera for new content, Image Picker for existing
   - Alternatives considered: Camera-only, Image Picker-only
   - Rationale: Best UX - native camera for capture, gallery for existing content
   - Trade-offs: More complex implementation but better user experience

2. **Effects System**: Client-side Lottie animations only (no Canvas for MVP)
   - Alternatives considered: Canvas API overlays, server-side processing
   - Rationale: Simpler implementation, proven library, good performance
   - Trade-offs: Limited to pre-made animations, but sufficient for MVP

3. **Feed Architecture**: FlashList with React Query infinite scroll
   - Alternatives considered: FlatList, ScrollView with pagination
   - Rationale: Best performance for large lists, built-in optimizations
   - Trade-offs: Additional dependency but significant performance gains

4. **Content Expiration**: Use Epic 2's edge function infrastructure
   - Alternatives considered: Implement own cleanup, client-side filtering
   - Rationale: Reuse existing infrastructure, single source of truth
   - Trade-offs: Dependency on Epic 2 completion

5. **Media Storage**: Direct upload to Supabase Storage with basic compression
   - Alternatives considered: Server upload, chunked upload, no compression
   - Rationale: Simple implementation, reduces bandwidth, good enough for MVP
   - Trade-offs: No offline queue, basic retry only

6. **State Management**: AsyncStorage for persistence (not MMKV)
   - Alternatives considered: MMKV, in-memory only
   - Rationale: Already in use (Epic 2), no new dependencies, sufficient for MVP
   - Trade-offs: Slightly slower than MMKV but negligible for our use case

7. **UI Framework**: Tamagui for consistent cross-platform UI
   - Alternatives considered: NativeBase, custom styled-components
   - Rationale: Performance, theme system, animation support, TypeScript
   - Trade-offs: Learning curve but better long-term maintainability

### Dependencies
**External Dependencies**:
- expo-camera: ~14.0 - Camera capture
- expo-image-picker: ~14.7 - Gallery selection
- expo-image-manipulator: ~11.8 - Image compression
- expo-av: ~13.10 - Video playback
- lottie-react-native: ~6.5 - Animated effects
- @shopify/flash-list: ~1.6 - Performant lists
- react-native-reanimated: ~3.6 - Smooth animations
- @gorhom/bottom-sheet: ~4.5 - Share sheets
- @tamagui/core: ~1.79 - UI framework
- @tamagui/animations-react-native: ~1.79 - Animations
- @tamagui/toast: ~1.79 - Toast notifications

**Internal Dependencies**:
- Requires: Authentication (Epic 2), User profiles, Navigation structure, Cleanup edge functions
- Provides: Content creation for betting system (Epic 4), Media for messaging (Epic 5)

## UI/UX Specifications

### Screen Layouts

#### Feed Screen
```
┌─────────────────────────────────┐
│ Header (56px)                   │
│ ┌─────────────────────────────┐ │
│ │ 👤    SnapBet    🔔(3)     │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Stories Bar (88px)              │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ →   │
│ │➕│ │🔴│ │🔵│ │  │ │  │      │
│ └──┘ └──┘ └──┘ └──┘ └──┘      │
│ You  Mike Sarah Dan  Amy        │
├─────────────────────────────────┤
│ Feed Content (ScrollView)       │
│ ┌─────────────────────────────┐ │
│ │ PostCard                    │ │
│ │ ├─ Header                   │ │
│ │ ├─ Media (16:9)            │ │
│ │ ├─ Caption                  │ │
│ │ └─ Actions                  │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Component Structure:**
```typescript
// Using Tamagui components
<YStack f={1} bg="$background">
  <Header />
  <StoriesBar stories={stories} />
  <FlashList
    data={posts}
    renderItem={({ item }) => <PostCard post={item} />}
    estimatedItemSize={400}
    refreshControl={<RefreshControl />}
    onEndReached={loadMore}
    ListEmptyComponent={<EmptyFeed />}
  />
</YStack>
```

#### Camera Modal
```
┌─────────────────────────────────┐
│ Top Controls                    │
│ ✕              Flash    Flip    │
├─────────────────────────────────┤
│                                 │
│        Camera Preview           │
│                                 │
│    Active Effect Overlay        │
│                                 │
├─────────────────────────────────┤
│ Effects Carousel                │
│ [🔥] [💰] [😅] [🚀] [💪] →    │
├─────────────────────────────────┤
│ Bottom Controls                 │
│ Gallery    (●)    Video         │
└─────────────────────────────────┘
```

**After Capture:**
```
┌─────────────────────────────────┐
│ ← Back              Next →      │
├─────────────────────────────────┤
│      Media Preview              │
│   (with applied effect)         │
├─────────────────────────────────┤
│ Caption Input                   │
│ "Add a caption..."              │
├─────────────────────────────────┤
│ Attach Bet (Optional)           │
│ ┌─────────────────────────────┐ │
│ │ + Attach a bet              │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Share To:                       │
│ ☑️ Feed  ☑️ Story  ☐ Groups    │
└─────────────────────────────────┘
```

#### Story Viewer
```
┌─────────────────────────────────┐
│ Progress Bars                   │
│ ━━━━━━━━━━━━━━━━━━━━━          │
│ @username • 2h ago              │
├─────────────────────────────────┤
│                                 │
│                                 │
│      Full Screen Media          │
│                                 │
│                                 │
│                                 │
│ Caption Text                    │
│ "5-0 this week 🔥"             │
├─────────────────────────────────┤
│ ↑ Swipe up to view profile     │
└─────────────────────────────────┘
```

### Component Specifications

#### PostCard Component (Tamagui)
```typescript
// components/feed/PostCard/PostCard.tsx
import { YStack, XStack, Text, Image } from 'tamagui';
import { Avatar } from '@tamagui/avatar';

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <YStack
      bg="$surface"
      br="$4"
      m="$2"
      p="$3"
      shadowColor="$shadowColor"
      shadowRadius={4}
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
    >
      {/* Header */}
      <XStack ai="center" jc="space-between" mb="$3">
        <XStack ai="center" gap="$2">
          <Avatar size="$3" circular>
            <Avatar.Image src={post.user.avatar} />
            <Avatar.Fallback bc="$gray5" />
          </Avatar>
          <YStack>
            <Text fontSize="$4" fontWeight="600">
              @{post.user.username}
            </Text>
            <Text fontSize="$2" color="$gray10">
              {post.user.displayMetric} • {formatTime(post.createdAt)}
            </Text>
          </YStack>
        </XStack>
      </XStack>

      {/* Media */}
      <YStack br="$3" ov="hidden" mb="$3">
        <Image
          source={{ uri: post.mediaUrl }}
          aspectRatio={16/9}
          resizeMode="cover"
        />
        {post.bet && <BetOverlay bet={post.bet} />}
      </YStack>

      {/* Caption */}
      <Text fontSize="$3" mb="$3" numberOfLines={2}>
        {post.caption}
      </Text>

      {/* Actions */}
      <XStack ai="center" jc="space-between">
        <TailFadeButtons post={post} />
        <ReactionBar reactions={post.reactions} />
      </XStack>
    </YStack>
  );
};
```

#### StoriesBar Component (Tamagui)
```typescript
// components/feed/StoriesBar/StoriesBar.tsx
import { ScrollView, XStack, YStack, Text } from 'tamagui';
import { Circle } from '@tamagui/shapes';

export const StoriesBar = ({ stories }: StoriesBarProps) => {
  return (
    <XStack h={88} bg="$surface" borderBottomWidth={1} borderColor="$borderColor">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack ai="center" p="$2" gap="$3">
          {/* Add Story */}
          <YStack ai="center" onPress={handleAddStory}>
            <Circle size={64} bg="$gray3">
              <Text fontSize={24}>➕</Text>
            </Circle>
            <Text fontSize="$1" mt="$1">You</Text>
          </YStack>

          {/* Stories */}
          {stories.map(story => (
            <StoryCircle key={story.id} story={story} />
          ))}
        </XStack>
      </ScrollView>
    </XStack>
  );
};
```

### User Flows

#### Post Creation Flow
```
1. Feed Screen
   └─→ Tap Camera Tab
       └─→ Camera Modal Opens
           ├─→ Take Photo/Video OR Select from Gallery
           └─→ Preview Screen
               ├─→ Apply Effect (optional)
               ├─→ Add Caption
               ├─→ Attach Bet (optional)
               ├─→ Select Share Destinations
               └─→ Tap "Share"
                   ├─→ Upload Progress
                   ├─→ Success Toast
                   └─→ Return to Feed (see new post)
```

#### Story Viewing Flow
```
1. Feed Screen
   └─→ Tap Story Circle
       └─→ Story Viewer Opens
           ├─→ Auto-play 3 seconds
           ├─→ Progress bar animates
           ├─→ Auto-advance to next
           └─→ User Interactions:
               ├─→ Tap Right: Next story
               ├─→ Tap Left: Previous
               ├─→ Swipe Down: Close
               └─→ Swipe Up: View profile
```

#### Reaction Flow
```
1. See Post in Feed
   └─→ Tap Reaction Area
       └─→ Reaction Picker Shows
           ├─→ Select Emoji (🔥💯😬💰🎯🤝)
           └─→ Optimistic Update
               ├─→ Show reaction immediately
               ├─→ Increment count
               └─→ Sync with server
```

### Tamagui Theme Integration

```typescript
// theme/tokens.ts
export const tokens = {
  color: {
    // Backgrounds
    background: '#FAF9F5',
    surface: '#FFFFFF',
    surfaceAlt: '#F5F3EE',
    
    // Primary
    primary: '#059669',
    primaryHover: '#047857',
    
    // Actions
    tail: '#3B82F6',
    tailHover: '#2563EB',
    fade: '#FB923C',
    fadeHover: '#F97316',
    
    // Outcomes
    win: '#EAB308',
    loss: '#EF4444',
    push: '#6B7280',
  },
  space: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    true: 16, // default
  },
  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 32,
    4: 48,
    5: 64,
    true: 16,
  },
  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    true: 12,
  },
};
```

### Animation Specifications

```typescript
// Using Tamagui animations
import { createAnimations } from '@tamagui/animations-react-native';

export const animations = createAnimations({
  fast: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  slow: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
});

// Story progress animation
const StoryProgress = () => {
  const progress = useSharedValue(0);
  
  useEffect(() => {
    progress.value = withTiming(1, { duration: 3000 });
  }, []);
  
  return (
    <AnimatedView
      style={{
        width: progress.value.interpolate({
          inputRange: [0, 1],
          outputRange: ['0%', '100%'],
        }),
      }}
    />
  );
};
```

## Implementation Notes

### File Structure for Epic
```
app/
├── (drawer)/
│   ├── camera.tsx          # Camera modal screen
│   └── (tabs)/
│       └── index.tsx       # Feed screen with stories
components/
├── camera/
│   ├── CameraView.tsx      # Main camera component
│   ├── MediaPreview.tsx    # Preview after capture
│   ├── EffectsPicker.tsx   # Effects carousel
│   └── ShareOptions.tsx    # Share destinations
├── feed/
│   ├── PostCard.tsx        # Individual post display
│   ├── PostMedia.tsx       # Photo/video player
│   ├── PostActions.tsx     # Tail/fade/react buttons
│   ├── FeedList.tsx        # Optimized feed list
│   └── EmptyFeed.tsx       # Empty state
├── stories/
│   ├── StoriesBar.tsx      # Horizontal story list
│   ├── StoryCircle.tsx     # Individual story avatar
│   ├── StoryViewer.tsx     # Full screen viewer
│   └── StoryProgress.tsx   # Progress indicators
├── effects/
│   ├── EffectLibrary.ts    # Effect definitions
│   └── LottieEffect.tsx    # Animated overlays
└── ui/                     # Tamagui components
    ├── Button.tsx
    ├── Card.tsx
    ├── Sheet.tsx
    └── Toast.tsx

services/
├── media/
│   ├── compression.ts      # Image/video compression
│   └── upload.ts          # Storage upload with retry
└── content/
    ├── postService.ts     # Post CRUD operations
    └── storyService.ts    # Story management
```

### API Endpoints Added
| Method | Path | Purpose | Sprint |
|--------|------|---------|--------|
| POST | /storage/v1/object/posts/{path} | Upload post media | 03.00 |
| POST | /rest/v1/posts | Create post record | 03.02 |
| GET | /rest/v1/rpc/get_feed | Fetch personalized feed | 03.02 |
| POST | /storage/v1/object/stories/{path} | Upload story media | 03.03 |
| POST | /rest/v1/stories | Create story record | 03.03 |
| POST | /rest/v1/story_views | Track story views | 03.03 |
| POST | /rest/v1/reactions | Add post reaction | 03.04 |

### Data Model Changes
```sql
-- Already exist from Epic 1:
-- posts table with media_url, caption, expires_at
-- stories table with media_url, view_count
-- reactions table for emoji reactions
-- story_views for view tracking

-- New indexes needed:
CREATE INDEX idx_posts_feed_optimized ON posts(created_at DESC) 
  INCLUDE (user_id, media_url, caption, tail_count, fade_count)
  WHERE deleted_at IS NULL AND expires_at > NOW();

CREATE INDEX idx_stories_active ON stories(user_id, created_at DESC)
  WHERE deleted_at IS NULL AND expires_at > NOW();
```

### Key Functions/Components Created
- `CameraView` - Main camera interface with controls - Sprint 03.00
- `MediaCompressor` - Client-side compression utility - Sprint 03.00
- `uploadWithRetry` - Simple retry logic for uploads - Sprint 03.00
- `EffectLibrary` - Lottie effect definitions - Sprint 03.01
- `FeedList` - Optimized infinite scroll list - Sprint 03.02
- `PostCard` - Complete post display component - Sprint 03.02
- `StoriesBar` - Horizontal scrolling stories - Sprint 03.03
- `StoryViewer` - Full screen story player - Sprint 03.03
- `ReactionPicker` - Emoji reaction selector - Sprint 03.04

## Sprint Execution Log

### Sprint 03.00: Camera & Media Infrastructure
**Status**: NOT STARTED
**Goal**: Implement camera capture, media selection, compression, and upload pipeline

**Planned Implementation**:
- Expo Camera setup with permissions
- Image Picker integration for gallery
- Basic compression (85% quality, max 1920x1080)
- Video size validation (max 50MB)
- Direct upload to Supabase Storage
- Simple retry logic (3 attempts with exponential backoff)
- Basic error alerts for user feedback
- Progress indicator during upload
- Tamagui UI components for camera controls

**Key Technical Decisions**:
- No offline queue (show error if offline)
- No draft system (users must complete or lose)
- Simple file size limits instead of chunked upload
- Use Alert.alert for errors (native feel)

### Sprint 03.01: Effects & Filters System
**Status**: NOT STARTED
**Goal**: Build effects system with base effects and achievement-based unlocks

**Planned Implementation**:
- Effect library with 20+ base Lottie effects
- Simple effect categories (Emotions, Sports, Weather, Text, Celebrations)
- Effect preview in real-time
- Achievement-based unlock system (reuse Epic 2 badges)
- Horizontal ScrollView with Tamagui styling
- Effect picker bottom sheet

**Simplified Approach**:
- Lottie only (no Canvas overlays for MVP)
- Pre-made animations from LottieFiles
- No custom effect creation
- Effects render on top of media

### Sprint 03.02: Feed Implementation
**Status**: NOT STARTED
**Goal**: Create the main feed with posts, infinite scroll, and real-time updates

**Planned Implementation**:
- FlashList for performance
- React Query infinite scroll (20 items per page)
- Post cards with media player
- Bet attachment display
- Real-time post insertion
- Pull-to-refresh
- Simple empty state ("No posts yet. Follow more friends!")
- Basic error state ("Failed to load. Pull to refresh.")
- Tamagui components for consistent styling
- Header with drawer trigger and notifications

**Performance Focus**:
- Image lazy loading built into FlashList
- No complex memoization (FlashList handles it)
- Simple loading spinner (no skeletons)

### Sprint 03.03: Stories System
**Status**: NOT STARTED
**Goal**: Implement ephemeral stories with viewer and auto-expiration

**Planned Implementation**:
- Stories bar at top of feed
- Story creation flow (reuse camera)
- Full-screen story viewer
- Simple progress bars (3 seconds per story)
- Basic view tracking (count only)
- 24-hour expiration (set expires_at)
- Use Epic 2's cleanup edge function
- Gesture handling for navigation

**Simplified Features**:
- No story replies (future feature)
- No story reactions (just views)
- No persistent viewed state
- Auto-advance only (no pause)

### Sprint 03.04: Engagement Features
**Status**: NOT STARTED
**Goal**: Add reactions, sharing, and engagement tracking

**Planned Implementation**:
- Emoji reactions (6 types: 🔥💯😬💰🎯🤝)
- Simple tap to react (no long press)
- View count tracking (increment on mount)
- Basic share to story functionality
- Reaction count updates (optimistic)
- Tamagui Sheet for reaction picker
- Toast notifications for feedback

**Keeping it Simple**:
- No reaction animations (just appear)
- No detailed analytics
- Share just adds to your story
- No external sharing in MVP

## Testing & Quality

### Testing Approach
- Manual testing on both iOS and Android
- Focus on core user flows
- Test with poor network conditions
- Verify memory usage with videos
- Test Tamagui theme consistency

### Performance Targets
- Camera launch: < 2 seconds (realistic)
- Feed scroll: Smooth (FlashList handles)
- Image upload: < 5 seconds on good network
- Story transition: < 500ms
- UI animations: 60 FPS

### Known Issues
| Issue | Severity | Sprint | Status | Resolution |
|-------|----------|--------|--------|------------|
| TBD | - | - | - | - |

## Technical Specifications

### Camera Configuration
```typescript
const cameraConfig = {
  photo: {
    quality: 0.9,
    skipProcessing: false,
  },
  video: {
    maxDuration: 30,
    quality: Camera.Constants.VideoQuality['720p'],
  }
};
```

### Compression Settings
```typescript
const compressionConfig = {
  photo: {
    compress: 0.85,
    maxWidth: 1920,
    maxHeight: 1080,
    format: ImageManipulator.SaveFormat.JPEG,
  },
  video: {
    // No compression, just size validation
    maxSize: 50 * 1024 * 1024, // 50MB
  }
};
```

### Upload Retry Logic
```typescript
const uploadWithRetry = async (uri: string, path: string, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await supabase.storage
        .from('media')
        .upload(path, uri);
      
      if (result.error) throw result.error;
      return result.data;
    } catch (error) {
      if (i === maxRetries - 1) {
        Alert.alert('Upload Failed', 'Please check your connection and try again.');
        throw error;
      }
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};
```

### Effect System Architecture
```typescript
interface Effect {
  id: string;
  name: string;
  type: 'lottie';
  tier: 0 | 1 | 2 | 3;
  requirement?: BadgeType;
  lottieSource: any; // Lottie JSON
}

const BASE_EFFECTS: Effect[] = [
  // 20+ effects available to all users
  { id: 'locked-in', name: '💪 Locked In', type: 'lottie', tier: 0, lottieSource: require('./effects/locked-in.json') },
  { id: 'sweating', name: '😅 Sweating', type: 'lottie', tier: 0, lottieSource: require('./effects/sweating.json') },
  // ... more base effects
];
```

### Feed Query Strategy
```typescript
// Simple infinite scroll with React Query
const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ['posts', 'feed'],
    queryFn: ({ pageParam = 0 }) => 
      supabase.rpc('get_feed', { 
        p_user_id: userId,
        p_limit: 20,
        p_offset: pageParam 
      }),
    getNextPageParam: (lastPage, pages) => 
      lastPage.length === 20 ? pages.length * 20 : undefined,
  });
};
```

## Refactoring Completed

### Code Improvements
- TBD after implementation

### Performance Optimizations
- TBD after implementation

## Learnings & Gotchas

### What Worked Well
- TBD after implementation

### Challenges Faced
- TBD after implementation

### Gotchas for Future Development
- **Media Permissions**: Must handle both camera and photo library permissions separately
- **Memory Management**: Videos over 50MB will be rejected with user-friendly error
- **Effect Performance**: Lottie animations are performant enough for MVP
- **Story Progress**: Keep it simple - 3 seconds per story, no pause
- **Feed Performance**: FlashList handles most optimization out of the box
- **Tamagui Gotchas**: Use tokens for consistent theming, test on both platforms

## Epic Completion Checklist

- [ ] All planned sprints completed and approved
- [ ] Camera capture and media selection working
- [ ] Effects system with 20+ base effects implemented
- [ ] Feed with infinite scroll and real-time updates
- [ ] Stories with viewer and auto-expiration
- [ ] Reactions and engagement features complete
- [ ] Basic error handling for all user actions
- [ ] Upload retry logic working
- [ ] Tamagui theme consistent across app
- [ ] No critical bugs remaining
- [ ] Integration with Epic 2 (auth/profiles/cleanup) verified
- [ ] Epic summary added to project tracker

## Epic Summary for Project Tracker

**[To be completed at epic end]**

**Delivered Features**:
- Camera with photo/video capture and gallery selection
- 20+ base Lottie effects for all users
- Performant feed with FlashList and infinite scroll
- Stories system with viewer and 24-hour expiration
- Reactions and engagement tracking
- Real-time updates via WebSocket subscriptions
- Basic error handling and retry logic
- Consistent Tamagui UI across all screens

**Key Architectural Decisions**:
- Hybrid camera approach for best UX
- Lottie-only effects for simplicity
- FlashList over FlatList for feed performance
- Reuse Epic 2's cleanup infrastructure
- AsyncStorage over MMKV for consistency
- Tamagui for cross-platform UI consistency

**Critical Learnings**:
- TBD after implementation

**Technical Debt Created**:
- No offline support (conscious decision for MVP)
- No draft saving (users must complete or lose)
- Basic error handling (could be more sophisticated)
- No video compression (just size limits)

## Risk Assessment

### Technical Risks
1. **Memory Usage**: Video processing could cause crashes
   - Mitigation: Hard 50MB limit, clear error message
   
2. **Effect Performance**: Multiple effects might lag
   - Mitigation: Limit to one effect at a time, Lottie is optimized

3. **Storage Costs**: Media files could get expensive
   - Mitigation: Aggressive compression, Epic 2 cleanup functions

4. **Feed Performance**: Large feeds might slow down
   - Mitigation: FlashList handles windowing, 20 items per page

### User Experience Risks
1. **Upload Failures**: Poor network could frustrate users
   - Mitigation: Retry logic, clear error messages

2. **Effect Discovery**: Users might not find effects
   - Mitigation: Clear categories, all effects visible

3. **Story Visibility**: Stories might be missed
   - Mitigation: Prominent placement, unread indicators

---

*Epic Created: [Date]*  
*Last Updated: [Date]*  
*Epic Owner: Epic 3 - Social Feed & Content Team*  
*Technical Lead: Senior Architecture Review Complete* 