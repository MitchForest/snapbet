# Sprint 03.03: Stories System Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 3 - Social Feed & Content

**Sprint Goal**: Implement a complete ephemeral stories system with horizontal story bar, full-screen viewer, auto-advance functionality, view tracking, and 24-hour auto-expiration, fully integrated with the camera system from Sprint 03.00.

**User Story Contribution**: 
- Enables Story 1: Social Pick Sharing - Stories for ephemeral content sharing
- Enables Story 3: Ephemeral Content - 24-hour auto-expiring stories with cleanup
- Enables Story 5: Performance Tracking - Share wins/losses via stories

## Sprint Plan

### Objectives
1. Create stories bar component at top of feed with user avatars
2. Implement story creation flow integrated with camera
3. Build full-screen story viewer with progress bars
4. Add gesture controls for navigation (tap, swipe)
5. Implement view tracking and viewer list
6. Set up 24-hour expiration with database triggers
7. Add unread indicator rings around avatars

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `components/stories/StoriesBar.tsx` | Horizontal scrollable story list | NOT STARTED |
| `components/stories/StoryCircle.tsx` | Individual story avatar with ring | NOT STARTED |
| `components/stories/StoryViewer/StoryViewer.tsx` | Full-screen story viewer | NOT STARTED |
| `components/stories/StoryViewer/StoryProgress.tsx` | Progress bars at top | NOT STARTED |
| `components/stories/StoryViewer/StoryContent.tsx` | Media display component | NOT STARTED |
| `components/stories/StoryViewer/StoryHeader.tsx` | Username and timestamp | NOT STARTED |
| `components/stories/AddStoryButton.tsx` | Add story circle button | NOT STARTED |
| `hooks/useStories.ts` | Stories data fetching and state | NOT STARTED |
| `hooks/useStoryViewer.ts` | Story viewer logic and controls | NOT STARTED |
| `services/content/storyService.ts` | Story CRUD operations | NOT STARTED |
| `utils/stories/helpers.ts` | Story utility functions | NOT STARTED |
| `types/stories.ts` | TypeScript types for stories | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `app/(drawer)/(tabs)/index.tsx` | Add StoriesBar to feed | NOT STARTED |
| `components/camera/ShareOptions.tsx` | Add "Share to Story" option | NOT STARTED |
| `app/(drawer)/camera.tsx` | Handle story creation flow | NOT STARTED |
| `package.json` | Add gesture handler dependency | NOT STARTED |

### Implementation Approach

#### 1. Dependencies Installation
```bash
# Gesture handling for story viewer
bun add react-native-gesture-handler@~2.14.0
bun add react-native-reanimated@~3.6.0

# Required setup for gesture handler
```

#### 2. Stories Bar Layout
```
┌─────────────────────────────────┐
│ Stories Bar (88px height)       │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ →   │
│ │➕│ │🔴│ │🔵│ │  │ │  │      │
│ └──┘ └──┘ └──┘ └──┘ └──┘      │
│ You  Mike Sarah Dan  Amy        │
└─────────────────────────────────┘

Circle States:
- Add button: Dashed border if no story
- Your story: Solid if has story
- Unread: Gradient ring (primary color)
- Read: Gray ring
- Multiple stories: Segmented ring
```

#### 3. Story Viewer Layout
```
┌─────────────────────────────────┐
│ Progress Bars (3s each)         │
│ ━━━━━━━━━━━━━━━━━━━━━          │
│ @username • 2h ago              │
├─────────────────────────────────┤
│                                 │
│                                 │
│      [Full Screen Media]        │
│         (Photo/Video)           │
│                                 │
│                                 │
│                                 │
│ Caption text here...            │
│                                 │
├─────────────────────────────────┤
│ 👁 127 views                    │
│ ↑ Swipe up to view profile     │
└─────────────────────────────────┘

Gestures:
- Tap right side: Next story
- Tap left side: Previous story
- Swipe down: Close viewer
- Swipe up: View profile
```

#### 4. Database Schema Usage
```typescript
// Stories table (from Epic 1)
interface Story {
  id: string;
  user_id: string;
  story_type: 'manual' | 'auto' | 'milestone';
  media_url: string;
  media_type: 'photo' | 'video';
  caption?: string;
  view_count: number;
  expires_at: string; // 24 hours from creation
  created_at: string;
}

// Story views tracking
interface StoryView {
  id: string;
  story_id: string;
  viewer_id: string;
  viewed_at: string;
}
```

#### 5. Story Creation Flow
```typescript
1. Camera capture/select media
2. Add effects (optional)
3. Add caption (optional)
4. Toggle "Share to Story" ✓
5. Upload media
6. Create story record
7. Navigate back to feed
8. Story appears in bar
```

**Key Technical Decisions**:
- 3 seconds per story (Instagram-like)
- Auto-advance with no pause feature
- Simple view count (no detailed analytics)
- No story replies in MVP
- No story reactions (just views)
- Gesture-based navigation only
- 24-hour hard expiration

### Dependencies & Risks
**Dependencies**:
- Camera system from Sprint 03.00
- User auth from Epic 2
- Stories table from Epic 1
- Media upload working

**Identified Risks**:
- Gesture conflicts with other UI: Mitigation - Clear gesture zones
- Memory with many stories: Mitigation - Preload only adjacent stories
- View tracking performance: Mitigation - Batch updates

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
- [ ] Story transitions smooth
- [ ] No memory leaks
- [ ] Progress bars accurate

## Key Code Additions

### Stories Bar Component
```typescript
// components/stories/StoriesBar.tsx
import React, { useCallback } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { XStack, YStack, Text } from '@tamagui/core';
import { useRouter } from 'expo-router';
import { useStories } from '@/hooks/useStories';
import { StoryCircle } from './StoryCircle';
import { AddStoryButton } from './AddStoryButton';
import { Colors } from '@/theme';

export function StoriesBar() {
  const router = useRouter();
  const { stories, myStory, markAsViewed } = useStories();
  
  const handleStoryPress = useCallback((userId: string, storyIds: string[]) => {
    // Navigate to story viewer with story IDs
    router.push({
      pathname: '/story-viewer',
      params: { 
        userId,
        storyIds: storyIds.join(','),
      },
    });
  }, [router]);
  
  const handleAddStory = useCallback(() => {
    router.push('/(drawer)/camera');
  }, [router]);
  
  return (
    <XStack h={88} bg={Colors.surface} borderBottomWidth={1} borderColor={Colors.border}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <XStack ai="center" gap="$3">
          {/* Add Story / Your Story */}
          <YStack ai="center">
            {myStory ? (
              <TouchableOpacity onPress={() => handleStoryPress(myStory.user_id, [myStory.id])}>
                <StoryCircle
                  user={{
                    id: myStory.user_id,
                    username: 'You',
                    avatar_url: myStory.user.avatar_url,
                  }}
                  hasUnread={false}
                  isOwn={true}
                />
              </TouchableOpacity>
            ) : (
              <AddStoryButton onPress={handleAddStory} />
            )}
            <Text fontSize="$1" mt="$1">You</Text>
          </YStack>
          
          {/* Other Stories */}
          {stories.map(({ user, stories: userStories }) => (
            <YStack key={user.id} ai="center">
              <TouchableOpacity 
                onPress={() => handleStoryPress(
                  user.id, 
                  userStories.map(s => s.id)
                )}
              >
                <StoryCircle
                  user={user}
                  hasUnread={userStories.some(s => !s.viewed)}
                  multipleStories={userStories.length > 1}
                />
              </TouchableOpacity>
              <Text fontSize="$1" mt="$1" numberOfLines={1} maxWidth={64}>
                {user.username}
              </Text>
            </YStack>
          ))}
        </XStack>
      </ScrollView>
    </XStack>
  );
}
```

### Story Circle Component
```typescript
// components/stories/StoryCircle.tsx
import React from 'react';
import { View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/theme';

interface StoryCircleProps {
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  hasUnread: boolean;
  isOwn?: boolean;
  multipleStories?: boolean;
}

export function StoryCircle({ user, hasUnread, isOwn, multipleStories }: StoryCircleProps) {
  const ringColors = hasUnread 
    ? [Colors.primary, Colors.primaryHover]
    : ['#E0E0E0', '#E0E0E0'];
  
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Gradient Ring */}
      <LinearGradient
        colors={ringColors}
        style={{
          width: 68,
          height: 68,
          borderRadius: 34,
          padding: 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: Colors.surface,
            padding: 2,
          }}
        >
          <Image
            source={{ uri: user.avatar_url || `https://api.dicebear.com/7.x/avataaars/png?seed=${user.username}` }}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
            }}
          />
        </View>
      </LinearGradient>
      
      {/* Multiple stories indicator */}
      {multipleStories && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: Colors.primary,
            width: 20,
            height: 20,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: Colors.surface,
          }}
        >
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
            {multipleStories}
          </Text>
        </View>
      )}
    </View>
  );
}
```

### Story Viewer Component
```typescript
// components/stories/StoryViewer/StoryViewer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StoryProgress } from './StoryProgress';
import { StoryHeader } from './StoryHeader';
import { StoryContent } from './StoryContent';
import { useStoryViewer } from '@/hooks/useStoryViewer';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StoryViewerProps {
  isVisible: boolean;
  userId: string;
  storyIds: string[];
  onClose: () => void;
}

export function StoryViewer({ isVisible, userId, storyIds, onClose }: StoryViewerProps) {
  const insets = useSafeAreaInsets();
  const { 
    stories, 
    currentIndex, 
    goToNext, 
    goToPrevious,
    markAsViewed,
  } = useStoryViewer(storyIds);
  
  const translateY = useSharedValue(0);
  const progressValue = useSharedValue(0);
  const progressTimer = useRef<NodeJS.Timeout>();
  
  const currentStory = stories[currentIndex];
  
  // Auto-advance timer
  useEffect(() => {
    if (!currentStory) return;
    
    // Mark as viewed
    markAsViewed(currentStory.id);
    
    // Reset progress
    progressValue.value = 0;
    
    // Start progress animation
    progressValue.value = withTiming(1, { duration: 3000 });
    
    // Auto-advance after 3 seconds
    progressTimer.current = setTimeout(() => {
      if (currentIndex < stories.length - 1) {
        goToNext();
      } else {
        onClose();
      }
    }, 3000);
    
    return () => {
      if (progressTimer.current) {
        clearTimeout(progressTimer.current);
      }
    };
  }, [currentIndex, currentStory]);
  
  // Gesture handlers
  const handleTap = (event: any) => {
    const { x } = event.nativeEvent;
    if (x < SCREEN_WIDTH / 3) {
      // Left third - previous
      goToPrevious();
    } else if (x > (SCREEN_WIDTH * 2) / 3) {
      // Right third - next
      goToNext();
    }
  };
  
  const handleSwipeDown = () => {
    onClose();
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  
  if (!currentStory) return null;
  
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PanGestureHandler
          onGestureEvent={(event) => {
            translateY.value = Math.max(0, event.nativeEvent.translationY);
          }}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.END) {
              if (event.nativeEvent.translationY > 100) {
                runOnJS(handleSwipeDown)();
              } else {
                translateY.value = withTiming(0);
              }
            }
          }}
        >
          <Animated.View style={[{ flex: 1, backgroundColor: 'black' }, animatedStyle]}>
            <TouchableWithoutFeedback onPress={handleTap}>
              <View style={{ flex: 1 }}>
                {/* Progress Bars */}
                <View style={{ paddingTop: insets.top }}>
                  <StoryProgress
                    totalStories={stories.length}
                    currentIndex={currentIndex}
                    progress={progressValue}
                  />
                  
                  {/* Header */}
                  <StoryHeader
                    user={currentStory.user}
                    createdAt={currentStory.created_at}
                    onClose={onClose}
                  />
                </View>
                
                {/* Content */}
                <StoryContent
                  mediaUrl={currentStory.media_url}
                  mediaType={currentStory.media_type}
                  caption={currentStory.caption}
                />
                
                {/* Footer */}
                <View style={{ paddingBottom: insets.bottom + 20, paddingHorizontal: 16 }}>
                  <Text style={{ color: 'white', fontSize: 14 }}>
                    👁 {currentStory.view_count} views
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 8 }}>
                    ↑ Swipe up to view profile
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    </Modal>
  );
}
```

### Story Progress Component
```typescript
// components/stories/StoryViewer/StoryProgress.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

interface StoryProgressProps {
  totalStories: number;
  currentIndex: number;
  progress: Animated.SharedValue<number>;
}

export function StoryProgress({ totalStories, currentIndex, progress }: StoryProgressProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalStories }).map((_, index) => (
        <View key={index} style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground} />
          <AnimatedProgressBar
            isActive={index === currentIndex}
            isCompleted={index < currentIndex}
            progress={progress}
          />
        </View>
      ))}
    </View>
  );
}

function AnimatedProgressBar({ 
  isActive, 
  isCompleted, 
  progress 
}: { 
  isActive: boolean; 
  isCompleted: boolean; 
  progress: Animated.SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    if (isCompleted) {
      return { width: '100%' };
    }
    if (isActive) {
      return {
        width: `${interpolate(progress.value, [0, 1], [0, 100])}%`,
      };
    }
    return { width: '0%' };
  });
  
  return (
    <Animated.View style={[styles.progressBar, animatedStyle]} />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
    gap: 4,
  },
  progressBarContainer: {
    flex: 1,
    height: 2,
    position: 'relative',
  },
  progressBarBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 1,
  },
});
```

### Stories Hook
```typescript
// hooks/useStories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useStories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch stories from followed users
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
  
  // Fetch active stories
  const { data: stories } = useQuery({
    queryKey: ['stories', following],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          user:users!user_id (
            id,
            username,
            avatar_url
          ),
          views:story_views!story_id (
            viewer_id
          )
        `)
        .in('user_id', [...(following ?? []), user?.id])
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Group by user
      const grouped = data?.reduce((acc, story) => {
        const userId = story.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user: story.user,
            stories: [],
          };
        }
        acc[userId].stories.push({
          ...story,
          viewed: story.views.some((v: any) => v.viewer_id === user?.id),
        });
        return acc;
      }, {} as Record<string, any>);
      
      return Object.values(grouped ?? {});
    },
    enabled: !!following && following.length > 0,
  });
  
  // Get my story
  const myStory = stories?.find(s => s.user.id === user?.id)?.stories[0];
  
  // Real-time subscription
  useEffect(() => {
    if (!following || following.length === 0) return;
    
    const subscription = supabase
      .channel('story-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stories',
          filter: `user_id=in.(${[...following, user?.id].join(',')})`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['stories'] });
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [following, user?.id]);
  
  return {
    stories: stories?.filter(s => s.user.id !== user?.id) ?? [],
    myStory,
  };
}
```

### Story Service
```typescript
// services/content/storyService.ts
import { supabase } from '@/services/supabase';

interface CreateStoryParams {
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  caption?: string;
  effectId?: string;
}

export const storyService = {
  async createStory(params: CreateStoryParams) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const { data, error } = await supabase
      .from('stories')
      .insert({
        user_id: user.user.id,
        story_type: 'manual',
        media_url: params.mediaUrl,
        media_type: params.mediaType,
        caption: params.caption,
        view_count: 0,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async markAsViewed(storyId: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');
    
    // Insert view record
    await supabase
      .from('story_views')
      .insert({
        story_id: storyId,
        viewer_id: user.user.id,
      })
      .select(); // Ignore conflict if already viewed
    
    // Increment view count
    await supabase.rpc('increment_story_views', { story_id: storyId });
  },
  
  async getStoryViewers(storyId: string) {
    const { data, error } = await supabase
      .from('story_views')
      .select(`
        viewer:users!viewer_id (
          id,
          username,
          avatar_url
        ),
        viewed_at
      `)
      .eq('story_id', storyId)
      .order('viewed_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
};
```

### Add Story Button Component
```typescript
// components/stories/AddStoryButton.tsx
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Colors } from '@/theme';

interface AddStoryButtonProps {
  onPress: () => void;
}

export function AddStoryButton({ onPress }: AddStoryButtonProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          borderWidth: 2,
          borderColor: Colors.border,
          borderStyle: 'dashed',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.surfaceAlt,
        }}
      >
        <Text style={{ fontSize: 24 }}>➕</Text>
      </View>
    </TouchableOpacity>
  );
}
```

### Integration with Camera
```typescript
// Updates to components/camera/ShareOptions.tsx
import { storyService } from '@/services/content/storyService';

// Add to share options:
const [shareToStory, setShareToStory] = useState(true);

// In the share handler:
if (shareToStory) {
  await storyService.createStory({
    mediaUrl: uploadedUrl,
    mediaType: media.type,
    caption: caption,
    effectId: selectedEffectId,
  });
}
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| GET | /rest/v1/stories | Query params | Story array | PLANNED |
| POST | /rest/v1/stories | Story data | Created story | PLANNED |
| POST | /rest/v1/story_views | `{ story_id }` | View record | PLANNED |
| POST | /rest/v1/rpc/increment_story_views | `{ story_id }` | Updated count | PLANNED |
| REALTIME | stories channel | WebSocket | New stories | PLANNED |

### State Management
- Stories data managed by React Query
- View state tracked per story
- Progress state managed by Reanimated
- Real-time updates via subscriptions

## Testing Performed

### Manual Testing
- [ ] Stories bar displays correctly
- [ ] Add story button works
- [ ] Story circles show correct states
- [ ] Unread indicator displays
- [ ] Story viewer opens on tap
- [ ] Progress bars animate correctly
- [ ] Auto-advance after 3 seconds
- [ ] Tap navigation works (left/right)
- [ ] Swipe down closes viewer
- [ ] Swipe up shows profile hint
- [ ] View count increments
- [ ] Stories expire after 24 hours
- [ ] Real-time new stories appear
- [ ] Camera integration works

### Edge Cases Considered
- User with no stories: Show add button
- Single story vs multiple: Different indicators
- Last story auto-close: Return to feed
- Network failure: Graceful degradation
- Long captions: Truncate appropriately
- Video stories: Handle loading states

## Documentation Updates

- [ ] Document story viewer gestures
- [ ] Add expiration logic explanation
- [ ] Document view tracking approach
- [ ] Add performance considerations

## Handoff to Reviewer

### What Was Implemented
[To be completed at sprint end]

### Files Modified/Created
**Created**:
[To be listed at sprint end]

**Modified**:
[To be listed at sprint end]

### Key Decisions Made
1. 3-second auto-advance (no pause)
2. Simple view tracking only
3. No story replies in MVP
4. Gesture-based navigation
5. 24-hour hard expiration
6. Group stories by user

### Deviations from Original Plan
[To be tracked during implementation]

### Known Issues/Concerns
[To be identified during implementation]

### Suggested Review Focus
- Gesture handling conflicts
- Memory management with media
- Progress bar timing accuracy
- View tracking performance
- Expiration cleanup

**Sprint Status**: NOT STARTED

---

## Reviewer Section

**Reviewer**: [R persona]  
**Review Date**: [Date]

### Review Checklist
- [ ] Stories display correctly
- [ ] Viewer works smoothly
- [ ] Gestures feel natural
- [ ] Progress timing accurate
- [ ] No memory leaks
- [ ] Integrates with camera
- [ ] Expiration works

### Review Outcome

**Status**: PENDING

### Feedback
[Review feedback will go here]

---

## Sprint Metrics

**Duration**: Planned 2 days | Actual [TBD]  
**Scope Changes**: [TBD]  
**Review Cycles**: [TBD]  
**Files Touched**: ~14  
**Lines Added**: ~1100 (estimated)  
**Lines Removed**: ~0

## Learnings for Future Sprints

[To be added after sprint completion]

---

*Sprint Started: [TBD]*  
*Sprint Completed: [TBD]*  
*Final Status: NOT STARTED* 