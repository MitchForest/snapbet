# Sprint 03.03: Stories System Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 3 - Social Feed & Content

**Sprint Goal**: Implement a complete ephemeral stories system with horizontal story bar, full-screen viewer, auto-advance functionality, view tracking, tail/fade for pick stories, and 24-hour auto-expiration, fully integrated with the camera system from Sprint 03.00.

**User Story Contribution**: 
- Enables Story 1: Social Pick Sharing - Stories for ephemeral content sharing
- Enables Story 2: Tail/Fade Decisions - Tail/fade directly from pick stories
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
8. Add story type support (content/pick/outcome)
9. Enable tail/fade buttons on pick stories
10. Filter stories based on privacy settings

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `components/stories/StoriesBar.tsx` | Horizontal scrollable story list | NOT STARTED |
| `components/stories/StoryCircle.tsx` | Individual story avatar with ring | NOT STARTED |
| `components/stories/StoryViewer/StoryViewer.tsx` | Full-screen story viewer | NOT STARTED |
| `components/stories/StoryViewer/StoryProgress.tsx` | Progress bars at top | NOT STARTED |
| `components/stories/StoryViewer/StoryContent.tsx` | Media display component | NOT STARTED |
| `components/stories/StoryViewer/StoryHeader.tsx` | Username and timestamp | NOT STARTED |
| `components/stories/StoryViewer/StoryActions.tsx` | Tail/fade buttons for pick stories | NOT STARTED |
| `components/stories/AddStoryButton.tsx` | Add story circle button | NOT STARTED |
| `hooks/useStories.ts` | Stories data fetching and state | NOT STARTED |
| `hooks/useStoryViewer.ts` | Story viewer logic and controls | NOT STARTED |
| `services/content/storyService.ts` | Story CRUD operations | NOT STARTED |
| `utils/stories/helpers.ts` | Story utility functions | NOT STARTED |
| `types/stories.ts` | TypeScript types for stories | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `app/(drawer)/(tabs)/index.tsx` | Replace stories placeholder with StoriesBar | NOT STARTED |
| `components/camera/ShareOptions.tsx` | Add "Share to Story" toggle option | NOT STARTED |
| `app/(drawer)/camera.tsx` | Handle story creation flow | NOT STARTED |
| `app/_layout.tsx` | Add story viewer route | NOT STARTED |

### Implementation Approach

#### 1. Dependencies Installation
```bash
# Gesture handling for story viewer - already installed in Sprint 03.02
# bun add react-native-gesture-handler@~2.14.0
# bun add react-native-reanimated@~3.6.0

# Linear gradient for story rings
bun add expo-linear-gradient@~12.5.0

# Required setup for gesture handler in App.tsx
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

#### 4. Database Schema Requirements
```sql
-- Stories table (from Epic 1)
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  story_type TEXT DEFAULT 'manual' CHECK (story_type IN ('manual', 'auto', 'milestone')),
  story_content_type TEXT DEFAULT 'content' CHECK (story_content_type IN ('content', 'pick', 'outcome')),
  source_bet_id UUID REFERENCES bets(id),
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  caption TEXT CHECK (char_length(caption) <= 200),
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Story views tracking
CREATE TABLE story_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES users(id),
  viewed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

-- Indexes for performance
CREATE INDEX idx_stories_user_expires ON stories(user_id, expires_at DESC);
CREATE INDEX idx_story_views_story ON story_views(story_id);
CREATE INDEX idx_story_views_viewer ON story_views(viewer_id);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_story_views(story_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE stories 
  SET view_count = view_count + 1 
  WHERE id = story_id;
END;
$$ LANGUAGE plpgsql;
```

#### 5. Story Creation Flow
```typescript
1. Camera capture/select media
2. Add effects (optional)
3. Add caption (optional)
4. Toggle "Share to Story" ✓
5. Upload media
6. Create story record with type
7. Navigate back to feed
8. Story appears in bar

For pick/outcome stories (Epic 4):
- story_content_type set appropriately
- source_bet_id linked
- Overlay data included
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
import { useAuth } from '@/hooks/useAuth';

export function StoriesBar() {
  const router = useRouter();
  const { user } = useAuth();
  const { stories, myStory } = useStories();
  
  const handleStoryPress = useCallback((userId: string, storyIds: string[]) => {
    // Navigate to story viewer with story IDs
    router.push({
      pathname: '/(drawer)/story-viewer',
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
        contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }}
      >
        <XStack ai="center" gap="$3">
          {/* Add Story / Your Story */}
          <YStack ai="center" gap="$1">
            {myStory ? (
              <TouchableOpacity onPress={() => handleStoryPress(user?.id || '', [myStory.id])}>
                <StoryCircle
                  user={{
                    id: user?.id || '',
                    username: 'You',
                    avatar_url: user?.user_metadata?.avatar_url,
                  }}
                  hasUnread={false}
                  isOwn={true}
                />
              </TouchableOpacity>
            ) : (
              <AddStoryButton onPress={handleAddStory} />
            )}
            <Text fontSize="$1" color={Colors.text}>You</Text>
          </YStack>
          
          {/* Other Stories */}
          {stories.map(({ user: storyUser, stories: userStories }) => (
            <YStack key={storyUser.id} ai="center" gap="$1">
              <TouchableOpacity 
                onPress={() => handleStoryPress(
                  storyUser.id, 
                  userStories.map(s => s.id)
                )}
              >
                <StoryCircle
                  user={storyUser}
                  hasUnread={userStories.some(s => !s.viewed)}
                  multipleStories={userStories.length > 1 ? userStories.length : undefined}
                />
              </TouchableOpacity>
              <Text 
                fontSize="$1" 
                color={Colors.text}
                numberOfLines={1} 
                maxWidth={64}
                ellipsizeMode="tail"
              >
                {storyUser.username}
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
import { Text } from '@tamagui/core';
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
      {multipleStories && typeof multipleStories === 'number' && (
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
          <Text color="white" fontSize="$1" fontWeight="700">
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
import { Text } from '@tamagui/core';
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
import { StoryActions } from './StoryActions';
import { useStoryViewer } from '@/hooks/useStoryViewer';
import { Colors } from '@/theme';

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
  }, [currentIndex, currentStory, goToNext, onClose, markAsViewed, progressValue, stories.length]);
  
  // Gesture handlers
  const handleTap = (event: any) => {
    const { x } = event.nativeEvent;
    if (x < SCREEN_WIDTH / 3) {
      // Left third - previous
      if (currentIndex > 0) {
        goToPrevious();
      }
    } else if (x > (SCREEN_WIDTH * 2) / 3) {
      // Right third - next
      if (currentIndex < stories.length - 1) {
        goToNext();
      } else {
        onClose();
      }
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
                  storyType={currentStory.story_content_type}
                  bet={currentStory.bet}
                />
                
                {/* Actions */}
                {currentStory.story_content_type === 'pick' && currentStory.bet && (
                  <StoryActions
                    story={currentStory}
                    bet={currentStory.bet}
                  />
                )}
                
                {/* Footer */}
                <View style={{ 
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  paddingBottom: insets.bottom + 20, 
                  paddingHorizontal: 16,
                  backgroundColor: 'transparent',
                }}>
                  <Text color="white" fontSize="$3">
                    👁 {currentStory.view_count} views
                  </Text>
                  <Text color="rgba(255,255,255,0.6)" fontSize="$2" mt="$2">
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

### Story Header Component
```typescript
// components/stories/StoryViewer/StoryHeader.tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { XStack, Text } from '@tamagui/core';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/common/Avatar';
import { formatTimeAgo } from '@/utils/stories/helpers';

interface StoryHeaderProps {
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  createdAt: string;
  onClose: () => void;
}

export function StoryHeader({ user, createdAt, onClose }: StoryHeaderProps) {
  const router = useRouter();
  
  const handleProfilePress = () => {
    onClose();
    router.push(`/(drawer)/profile/${user.username}`);
  };
  
  return (
    <XStack p="$3" ai="center" jc="space-between">
      <TouchableOpacity onPress={handleProfilePress}>
        <XStack ai="center" gap="$2">
          <Avatar
            size="$3"
            source={{ uri: user.avatar_url }}
            fallback={user.username[0]}
          />
          <View>
            <Text color="white" fontSize="$3" fontWeight="600">
              @{user.username}
            </Text>
            <Text color="rgba(255,255,255,0.7)" fontSize="$2">
              {formatTimeAgo(createdAt)}
            </Text>
          </View>
        </XStack>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onClose}>
        <Text color="white" fontSize="$6">×</Text>
      </TouchableOpacity>
    </XStack>
  );
}
```

### Story Content Component with Type Support
```typescript
// components/stories/StoryViewer/StoryContent.tsx
import React from 'react';
import { View, Image, Dimensions } from 'react-native';
import { Text } from '@tamagui/core';
import Video from 'react-native-video';
import { Colors } from '@/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StoryContentProps {
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  caption?: string;
  storyType?: 'content' | 'pick' | 'outcome';
  bet?: any;
}

export function StoryContent({ 
  mediaUrl, 
  mediaType, 
  caption,
  storyType = 'content',
  bet 
}: StoryContentProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      {mediaType === 'photo' ? (
        <Image
          source={{ uri: mediaUrl }}
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.7 }}
          resizeMode="contain"
        />
      ) : (
        <Video
          source={{ uri: mediaUrl }}
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.7 }}
          resizeMode="contain"
          repeat={false}
          paused={false}
          muted={true}
        />
      )}
      
      {/* Bet overlay for pick stories (future) */}
      {storyType === 'pick' && bet && (
        <View style={{
          position: 'absolute',
          bottom: 120,
          left: 16,
          right: 16,
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: 16,
          borderRadius: 12,
        }}>
          {/* Bet details will be rendered here in Epic 4 */}
          <Text color="white" fontSize="$3">Pick details placeholder</Text>
        </View>
      )}
      
      {/* Outcome overlay for outcome stories (future) */}
      {storyType === 'outcome' && (
        <View style={{
          position: 'absolute',
          top: 100,
          alignSelf: 'center',
        }}>
          {/* Outcome badge will be rendered here in Epic 4 */}
          <Text color="white" fontSize="$4">Outcome placeholder</Text>
        </View>
      )}
      
      {caption && (
        <View style={{
          position: 'absolute',
          bottom: 40,
          left: 16,
          right: 16,
        }}>
          <Text 
            color="white" 
            fontSize="$4" 
            textAlign="center"
            style={{
              textShadowColor: 'rgba(0,0,0,0.75)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {caption}
          </Text>
        </View>
      )}
    </View>
  );
}
```

### Story Viewer Hook
```typescript
// hooks/useStoryViewer.ts
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { storyService } from '@/services/content/storyService';

export function useStoryViewer(storyIds: string[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Fetch full story details
  const { data: stories = [] } = useQuery({
    queryKey: ['story-details', storyIds],
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
          bet:bets!source_bet_id (
            *,
            game:games!game_id (*)
          )
        `)
        .in('id', storyIds)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data ?? [];
    },
    enabled: storyIds.length > 0,
  });
  
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, stories.length - 1));
  }, [stories.length]);
  
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);
  
  const markAsViewed = useCallback(async (storyId: string) => {
    await storyService.markAsViewed(storyId);
  }, []);
  
  return {
    stories,
    currentIndex,
    goToNext,
    goToPrevious,
    markAsViewed,
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
        story_content_type: 'content',
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
    
    // Insert view record (ignore if already viewed)
    const { error: viewError } = await supabase
      .from('story_views')
      .insert({
        story_id: storyId,
        viewer_id: user.user.id,
      })
      .select();
    
    // Only increment if this is a new view
    if (!viewError || viewError.code !== '23505') {
      await supabase.rpc('increment_story_views', { story_id: storyId });
    }
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

### Story Types
```typescript
// types/stories.ts
export interface Story {
  id: string;
  user_id: string;
  story_type: 'manual' | 'auto' | 'milestone';
  story_content_type?: 'content' | 'pick' | 'outcome';
  source_bet_id?: string;
  media_url: string;
  media_type: 'photo' | 'video';
  caption?: string;
  view_count: number;
  expires_at: string;
  created_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  bet?: any; // Detailed type in Epic 4
  views?: Array<{ viewer_id: string }>;
  viewed?: boolean;
}

export interface StoryView {
  id: string;
  story_id: string;
  viewer_id: string;
  viewed_at: string;
}

export interface GroupedStories {
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  stories: Story[];
}
```

### Integration with Camera
```typescript
// Updates to components/camera/ShareOptions.tsx
import { useState } from 'react';
import { XStack, YStack, Switch, Text } from '@tamagui/core';
import { storyService } from '@/services/content/storyService';
import { Colors } from '@/theme';

interface ShareOptionsProps {
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  caption: string;
  effectId?: string;
  onSuccess: () => void;
}

export function ShareOptions({ 
  mediaUrl, 
  mediaType, 
  caption, 
  effectId,
  onSuccess 
}: ShareOptionsProps) {
  const [shareToStory, setShareToStory] = useState(true);
  const [shareToFeed, setShareToFeed] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      if (shareToStory) {
        await storyService.createStory({
          mediaUrl,
          mediaType,
          caption,
          effectId,
        });
      }
      
      if (shareToFeed) {
        // Feed post creation in Epic 4
      }
      
      onSuccess();
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  };
  
  return (
    <YStack gap="$3">
      <XStack jc="space-between" ai="center">
        <Text fontSize="$4" color={Colors.text}>Share to Story (24h)</Text>
        <Switch
          checked={shareToStory}
          onCheckedChange={setShareToStory}
        />
      </XStack>
      
      <XStack jc="space-between" ai="center">
        <Text fontSize="$4" color={Colors.text}>Share to Feed</Text>
        <Switch
          checked={shareToFeed}
          onCheckedChange={setShareToFeed}
        />
      </XStack>
    </YStack>
  );
}
```

### Story Viewer Route
```typescript
// app/(drawer)/story-viewer.tsx
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StoryViewer } from '@/components/stories/StoryViewer/StoryViewer';

export default function StoryViewerScreen() {
  const router = useRouter();
  const { userId, storyIds } = useLocalSearchParams<{
    userId: string;
    storyIds: string;
  }>();
  
  const storyIdArray = storyIds?.split(',') ?? [];
  
  return (
    <StoryViewer
      isVisible={true}
      userId={userId ?? ''}
      storyIds={storyIdArray}
      onClose={() => router.back()}
    />
  );
}
```

### State Management
- Stories data managed by React Query with caching
- View state tracked per story in database
- Progress state managed by Reanimated on UI thread
- Real-time updates via Supabase subscriptions
- Current story index managed locally in viewer

### Error Handling
- Failed media loads show placeholder
- Network errors handled gracefully
- Expired stories filtered automatically
- Missing user data shows fallback avatar
- View tracking failures don't block UI

### Performance Optimizations
- Only preload adjacent stories (current ± 1)
- Lazy load story details when viewer opens
- Batch view count updates
- Cancel animations on unmount
- Reuse story viewer component

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
- [ ] Privacy filtering works
- [ ] Blocked users filtered

### Edge Cases Considered
- User with no stories: Show add button
- Single story vs multiple: Different indicators
- Last story auto-close: Return to feed
- Network failure: Graceful degradation
- Long captions: Truncate appropriately
- Video stories: Handle loading states
- Expired stories: Filter from results
- Private profiles: Show only if following
- Blocked users: Never show stories

### Technical Notes

#### Gesture Handling
- Using React Native Gesture Handler for smooth performance
- Tap zones: Left 1/3 (previous), Right 1/3 (next), Middle (no action)
- Swipe down threshold: 100px to close
- Swipe up: Currently just shows hint text

#### Progress Bar Animation
- Each story: 3 seconds duration
- Using Reanimated for 60fps animations
- Progress runs on UI thread for smoothness
- Auto-advance triggers before animation completes

#### Memory Management
- Only current story's media loaded in memory
- Adjacent stories preloaded for smooth transitions
- Previous stories unloaded after navigation
- Video components properly cleaned up

#### Privacy & Security
- Stories filtered by follow status
- Private profiles respected
- Blocked users completely filtered
- View tracking respects privacy

#### Database Considerations
- 24-hour expiration handled by query filter
- View count incremented via RPC for atomicity
- Unique constraint prevents duplicate views
- Indexes on user_id and expires_at for performance

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

### Implementation Notes for Executor

#### 1. Route Configuration
The story viewer route needs to be added to the drawer layout:
- Create `app/(drawer)/story-viewer.tsx`
- Route will be modal-style (full screen overlay)
- No header needed (custom close button in viewer)

#### 2. Dependencies Already Available
From Sprint 03.02:
- `react-native-gesture-handler@~2.14.0`
- `react-native-reanimated@~3.6.0`
- `@tanstack/react-query@^5.17.0`

Still need to install:
- `expo-linear-gradient@~12.5.0` for story rings

#### 3. Avatar Component
The `Avatar` component referenced in StoryHeader should use the existing pattern from other components or create a simple one:
```typescript
// components/common/Avatar.tsx
import React from 'react';
import { Image } from 'react-native';
import { View, Text } from '@tamagui/core';

interface AvatarProps {
  size: string;
  source: { uri?: string };
  fallback: string;
}

export function Avatar({ size, source, fallback }: AvatarProps) {
  const sizeMap = {
    '$3': 40,
    '$4': 48,
    '$5': 56,
  };
  
  const pixels = sizeMap[size] || 40;
  
  return (
    <View
      width={pixels}
      height={pixels}
      borderRadius={pixels / 2}
      overflow="hidden"
      bg="$gray5"
      ai="center"
      jc="center"
    >
      {source.uri ? (
        <Image
          source={source}
          style={{ width: pixels, height: pixels }}
        />
      ) : (
        <Text fontSize="$4" color="$gray11">{fallback}</Text>
      )}
    </View>
  );
}
```

#### 4. Video Component
For video in stories, use `expo-av` Video component (already in project):
```typescript
import { Video } from 'expo-av';

// In StoryContent component:
<Video
  source={{ uri: mediaUrl }}
  style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.7 }}
  shouldPlay
  isLooping={false}
  isMuted
  resizeMode={Video.RESIZE_MODE_CONTAIN}
/>
```

#### 5. Integration Points

**Feed Integration** (modify `app/(drawer)/(tabs)/index.tsx`):
- Replace the placeholder stories section with `<StoriesBar />`
- Import from `@/components/stories/StoriesBar`

**Camera Integration** (modify `app/(drawer)/camera.tsx`):
- Add share options after capture/selection
- Call `storyService.createStory()` when sharing to story
- Navigate back to feed after successful share

#### 6. Database Migration
Ensure these tables exist (from Epic 1 migrations):
- `stories` table with all required columns
- `story_views` table for tracking
- `increment_story_views` RPC function

#### 7. Error States to Handle
- No stories: Show just the add button
- Failed to load: Show error message
- Expired stories: Filter automatically
- Network errors: Show retry option

#### 8. Performance Considerations
- Limit story queries to last 24 hours
- Batch view updates every 5 views
- Preload only ±1 adjacent story
- Cancel timers on unmount

#### 9. Complete Implementation Checklist

**Core Components**:
- [ ] StoriesBar with horizontal scroll
- [ ] StoryCircle with gradient rings
- [ ] AddStoryButton with dashed border
- [ ] StoryViewer modal container
- [ ] StoryProgress with animated bars
- [ ] StoryHeader with user info
- [ ] StoryContent with media display
- [ ] StoryActions placeholder for Epic 4

**Hooks & Services**:
- [ ] useStories hook with privacy filtering
- [ ] useStoryViewer hook for viewer logic
- [ ] storyService for CRUD operations
- [ ] Story utility functions

**Integration**:
- [ ] Replace feed placeholder with StoriesBar
- [ ] Add story viewer route
- [ ] Camera share to story option
- [ ] Real-time story updates

**Edge Cases**:
- [ ] Handle no following users
- [ ] Handle all stories viewed
- [ ] Handle network failures
- [ ] Handle expired stories
- [ ] Handle blocked users
- [ ] Handle private profiles

#### 10. Key Implementation Details

**Story Expiration**:
- Stories expire exactly 24 hours after creation
- Use database query filter: `gte('expires_at', new Date().toISOString())`
- No need for cleanup job - just filter on query

**View Tracking**:
- Insert into `story_views` table on view
- Use unique constraint to prevent duplicates
- Increment counter via RPC for atomicity

**Privacy Rules**:
1. Show stories from users you follow
2. Always show your own stories
3. Filter out blocked users
4. Respect private profile settings

**Real-time Updates**:
- Subscribe to `stories` table inserts
- Filter by followed user IDs
- Invalidate React Query cache on new story

**Gesture Zones**:
```
┌─────────────┬─────────────┬─────────────┐
│   Previous  │   No Action │     Next    │
│    (1/3)    │    (1/3)    │    (1/3)    │
└─────────────┴─────────────┴─────────────┘
```

**Progress Animation**:
- 3000ms duration per story
- Runs on UI thread via Reanimated
- Reset on story change
- Pause not implemented in MVP

#### 11. Common Pitfalls to Avoid

1. **Don't forget to filter expired stories** - Always include the expires_at check
2. **Don't load all stories at once** - Use pagination if needed
3. **Don't forget to cleanup timers** - Clear timeouts on unmount
4. **Don't show stories from blocked users** - Filter in the query
5. **Don't auto-play videos with sound** - Always mute story videos

#### 12. Testing Approach

**Unit Tests** (if time permits):
- Test story grouping logic
- Test time formatting
- Test privacy filtering

**Manual Testing**:
1. Create a story from camera
2. View your own story
3. View others' stories
4. Test all gestures
5. Wait for auto-advance
6. Check view counts
7. Test with no stories
8. Test with many stories

**Performance Testing**:
- Monitor memory with many stories
- Check animation smoothness
- Verify no memory leaks

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