# Sprint 03.06: Engagement UI Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: 03 - Camera & Content Creation

**Sprint Goal**: Implement interaction UI components (comments, reactions, tail/fade) with "coming soon" functionality for MVP.

**User Story Contribution**: 
- Prepares UI for Story 2: Tail/Fade Decisions
- Sets foundation for social engagement in Story 4: Group Coordination

## Sprint Plan

### Objectives
1. Build comment UI components (display only)
2. Create reaction picker and display
3. Design tail/fade buttons for pick posts
4. Add interaction animations
5. Create engagement count displays

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `components/engagement/CommentSheet.tsx` | Comment display/composer UI | NOT STARTED |
| `components/engagement/CommentItem.tsx` | Individual comment display | NOT STARTED |
| `components/engagement/ReactionPicker.tsx` | 6 reaction selector | NOT STARTED |
| `components/engagement/ReactionDisplay.tsx` | Show reactions on posts | NOT STARTED |
| `components/engagement/TailFadeButtons.tsx` | Tail/Fade UI for picks | NOT STARTED |
| `components/engagement/EngagementCounts.tsx` | Count displays | NOT STARTED |
| `hooks/useEngagement.ts` | Mock engagement data hook | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `components/content/PostCard.tsx` | Add engagement components | NOT STARTED |
| `types/database.ts` | Add engagement type definitions | NOT STARTED |

### Implementation Approach

**Phase 1: Comment UI**
```typescript
// CommentSheet.tsx - Bottom sheet for comments
interface CommentSheetProps {
  postId: string;
  isVisible: boolean;
  onClose: () => void;
}

// Features:
// - Slide up from bottom
// - Comment list (empty for now)
// - Comment composer at bottom
// - 280 character limit
// - "Comments coming soon" message

// CommentItem.tsx
interface CommentItemProps {
  comment: {
    id: string;
    user: {
      username: string;
      avatar_url?: string;
    };
    content: string;
    created_at: string;
  };
}

// Layout:
// [Avatar] @username • 2m ago
// Comment text goes here...
// Reply (disabled)
```

**Phase 2: Reaction System**
```typescript
// ReactionPicker.tsx
const REACTIONS = ['🔥', '💰', '😂', '😭', '💯', '🎯'];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  currentReaction?: string;
}

// Features:
// - Horizontal row of 6 reactions
// - Tap to select (shows toast "Coming soon")
// - Highlight if already reacted
// - Smooth scale animation on tap

// ReactionDisplay.tsx
interface ReactionDisplayProps {
  reactions: Array<{
    emoji: string;
    count: number;
  }>;
  userReaction?: string;
}

// Show top 3 reactions with counts
// Tap to see all reactions (modal)
```

**Phase 3: Tail/Fade Buttons**
```typescript
// TailFadeButtons.tsx
interface TailFadeButtonsProps {
  postId: string;
  tailCount: number;
  fadeCount: number;
  userAction?: 'tail' | 'fade' | null;
}

// Design:
// [👍 Tail (23)] [👎 Fade (12)]
// - Blue for tail, orange for fade
// - Filled if user has tailed/faded
// - Prominent size (not small buttons)
// - Show "Coming soon" toast on tap

// Only show on pick posts
// Disabled state for expired picks
```

**Phase 4: Engagement Counts**
```typescript
// EngagementCounts.tsx
interface EngagementCountsProps {
  commentCount: number;
  reactionCount: number;
  tailCount?: number;
  fadeCount?: number;
}

// Layout for content posts:
// 💬 12  ❤️ 45

// Layout for pick posts:
// 👍 23  👎 12  💬 5  ❤️ 18

// Tap comment count → open comment sheet
// Tap reaction count → show reaction list
```

**Phase 5: Animation Library**
```typescript
// Use React Native Reanimated for:
// - Button press animations (scale)
// - Sheet slide animations
// - Reaction selection bounce
// - Count increment animations

// Example button press:
const animatedScale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: animatedScale.value }]
}));

const handlePress = () => {
  animatedScale.value = withSequence(
    withTiming(0.95, { duration: 100 }),
    withTiming(1, { duration: 100 })
  );
  
  // Show toast
  Toast.show({
    type: 'info',
    text1: 'Coming Soon',
    text2: 'This feature will be available soon!'
  });
};
```

**Phase 6: Integration with PostCard**
```typescript
// Updated PostCard with engagement
export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  
  return (
    <>
      <View style={styles.container}>
        {/* Existing header and media */}
        
        {/* Reactions bar */}
        <ReactionDisplay 
          reactions={post.reactions || []}
          userReaction={null}
        />
        
        {/* Action buttons */}
        <View style={styles.actions}>
          {post.post_type === 'pick' && (
            <TailFadeButtons
              postId={post.id}
              tailCount={post.tail_count}
              fadeCount={post.fade_count}
            />
          )}
          
          <EngagementCounts
            commentCount={post.comment_count}
            reactionCount={post.reaction_count}
            tailCount={post.tail_count}
            fadeCount={post.fade_count}
          />
        </View>
      </View>
      
      {/* Comment sheet */}
      <CommentSheet
        postId={post.id}
        isVisible={showComments}
        onClose={() => setShowComments(false)}
      />
    </>
  );
}
```

**Key Technical Decisions**:
- **UI Only**: All interactions show "Coming soon" toast
- **Animations**: Use Reanimated 2 for smooth 60fps
- **Mock Data**: Use hooks to provide fake engagement data
- **Accessibility**: All buttons have proper labels

### Dependencies & Risks
**Dependencies**:
- React Native Reanimated 2
- Bottom sheet library (or custom)
- Toast notifications

**Identified Risks**:
- **Performance**: Many animated components
  - Mitigation: Use React.memo, optimize re-renders
- **User Confusion**: Features don't work yet
  - Mitigation: Clear "Coming soon" messaging

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

### Mock Engagement Hook
```typescript
// hooks/useEngagement.ts
export function useEngagement(postId: string) {
  // Generate consistent mock data based on postId
  const seed = postId.charCodeAt(0);
  
  return {
    comments: [],
    reactions: [
      { emoji: '🔥', count: seed % 20 },
      { emoji: '💰', count: seed % 15 },
      { emoji: '😂', count: seed % 10 }
    ].filter(r => r.count > 0),
    tailCount: seed % 30,
    fadeCount: seed % 20,
    userReaction: null,
    userAction: null
  };
}
```

### Toast Implementation
```typescript
// Standard toast for all "coming soon" features
export function showComingSoonToast(feature: string) {
  Toast.show({
    type: 'info',
    text1: 'Coming Soon! 🚀',
    text2: `${feature} will be available in the next update`,
    position: 'bottom',
    visibilityTime: 2000
  });
}
```

## Testing Performed

### Manual Testing
- [ ] Comment sheet opens/closes smoothly
- [ ] Reaction picker shows all 6 options
- [ ] Tail/fade buttons only on pick posts
- [ ] All interactions show toast
- [ ] Animations run at 60fps
- [ ] Counts display correctly

### Edge Cases Considered
- Posts with zero engagement
- Very high engagement counts (999+)
- Rapid tapping (debounce)
- Sheet dismiss gestures
- Accessibility with screen readers

## Documentation Updates

- [ ] Document engagement UI components
- [ ] Add animation patterns guide
- [ ] Document "coming soon" approach
- [ ] Update component hierarchy

## Handoff to Reviewer

### What Will Be Implemented
- Complete engagement UI components
- Comment sheet with composer
- 6-reaction picker system
- Tail/fade buttons for picks
- Smooth animations throughout
- "Coming soon" toasts for all actions

### Success Criteria
- All UI components render correctly
- Animations smooth at 60fps
- Clear feedback for unavailable features
- No impact on feed performance
- Clean, reusable components

### Testing Instructions
1. Create posts with Sprint 3.4
2. View in feed from Sprint 3.5
3. Tap comment button → sheet opens
4. Try to add comment → "coming soon" toast
5. Tap reactions → picker appears
6. Select reaction → "coming soon" toast
7. For pick posts, verify tail/fade buttons
8. Check all animations are smooth

**Sprint Status**: NOT STARTED

---

## Reviewer Section

**Reviewer**: [R persona]  
**Review Date**: [TBD]

### Review Checklist
- [ ] UI components well structured
- [ ] Animations performant
- [ ] "Coming soon" UX clear
- [ ] Code is reusable
- [ ] Ready for future functionality

### Review Outcome

**Status**: [TBD]

---

*Sprint Created: 2025-01-20*  
*Sprint Started: [TBD]*  
*Sprint Completed: [TBD]* 