# Sprint 03.03: Post Type System Tracker

## Sprint Overview

**Status**: HANDOFF  
**Start Date**: 2025-01-20  
**End Date**: 2025-01-20  
**Epic**: 03 - Camera & Content Creation

**Sprint Goal**: Implement infrastructure for three distinct post types (content, pick, outcome) without overlays, preparing for future bet integration.

**User Story Contribution**: 
- Prepares infrastructure for Story 2: Tail/Fade Decisions
- Sets foundation for pick and outcome posts in Epic 5

## Sprint Plan

### Objectives
1. Add post type selection to camera flow
2. Create type-specific data structures
3. Prepare overlay component architecture
4. Set up type-specific entry points
5. Configure type-based expiration rules

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `components/creation/PostTypeSelector.tsx` | UI for selecting post type | COMPLETED |
| `components/overlays/OverlayContainer.tsx` | Base container for future overlays | COMPLETED |
| `components/overlays/PickOverlay.tsx` | Placeholder pick overlay | COMPLETED |
| `components/overlays/OutcomeOverlay.tsx` | Placeholder outcome overlay | COMPLETED |
| `types/content.ts` | Post type definitions | COMPLETED |
| `utils/content/postTypeHelpers.ts` | Helper functions for post types | COMPLETED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `components/camera/MediaPreview.tsx` | Add post type context | COMPLETED |
| `services/content/postService.ts` | Handle different post types | COMPLETED |
| `app/(drawer)/camera.tsx` | Accept post type parameter | COMPLETED |
| `components/content/PostCard.tsx` | Display based on post type | COMPLETED |

### Implementation Approach

**Phase 1: Post Type Definitions**
```typescript
// types/content.ts
export enum PostType {
  CONTENT = 'content',
  PICK = 'pick',
  OUTCOME = 'outcome'
}

export interface PostTypeConfig {
  type: PostType;
  label: string;
  description: string;
  icon: string;
  expirationRule: string;
  requiresBet: boolean;
  entryPoint: string;
}

export const POST_TYPE_CONFIGS: Record<PostType, PostTypeConfig> = {
  [PostType.CONTENT]: {
    type: PostType.CONTENT,
    label: 'Content',
    description: 'Share a moment',
    icon: '📸',
    expirationRule: '24 hours',
    requiresBet: false,
    entryPoint: 'camera_tab'
  },
  [PostType.PICK]: {
    type: PostType.PICK,
    label: 'Pick',
    description: 'Share your bet',
    icon: '🎯',
    expirationRule: 'At game time',
    requiresBet: true,
    entryPoint: 'bet_confirmation'
  },
  [PostType.OUTCOME]: {
    type: PostType.OUTCOME,
    label: 'Outcome',
    description: 'Share your result',
    icon: '🏆',
    expirationRule: '24 hours',
    requiresBet: true,
    entryPoint: 'bet_history'
  }
};
```

**Phase 2: Entry Point Handling**
```typescript
// Camera modal accepts postType parameter
interface CameraModalProps {
  postType?: PostType;
  betId?: string; // For pick/outcome posts
}

// Router navigation examples:
// Content post (default):
router.push('/(drawer)/camera');

// Pick post (future):
router.push({
  pathname: '/(drawer)/camera',
  params: { postType: 'pick', betId: 'xyz' }
});

// Outcome post (future):
router.push({
  pathname: '/(drawer)/camera',
  params: { postType: 'outcome', betId: 'xyz' }
});
```

**Phase 3: Overlay Infrastructure**
```typescript
// OverlayContainer.tsx
interface OverlayContainerProps {
  postType: PostType;
  betData?: any; // Will be defined in Epic 5
  children: React.ReactNode;
}

export function OverlayContainer({ postType, betData, children }: OverlayContainerProps) {
  if (postType === PostType.CONTENT) {
    return <>{children}</>;
  }
  
  return (
    <View style={styles.container}>
      {children}
      <View style={styles.overlay}>
        {postType === PostType.PICK && <PickOverlay betData={betData} />}
        {postType === PostType.OUTCOME && <OutcomeOverlay betData={betData} />}
      </View>
    </View>
  );
}

// Placeholder overlays for now
function PickOverlay({ betData }: { betData?: any }) {
  return (
    <View style={styles.pickOverlay}>
      <Text style={styles.overlayText}>Pick details will appear here</Text>
      <Text style={styles.overlayHint}>Coming in Epic 5</Text>
    </View>
  );
}
```

**Phase 4: Type Selection UI**
```typescript
// Only show selector for content posts initially
// Pick/outcome will have predetermined types

export function PostTypeSelector({ 
  selectedType, 
  onTypeChange 
}: PostTypeSelectorProps) {
  // For now, just return null or show content type
  // Full selector will be implemented when we have all types
  return null;
}
```

**Phase 5: Expiration Logic**
```typescript
// utils/content/postTypeHelpers.ts
export function calculateExpiration(postType: PostType, gameTime?: Date): Date {
  const now = new Date();
  
  switch (postType) {
    case PostType.PICK:
      // If we have game time, expire then
      // Otherwise default to 24 hours
      return gameTime || new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
    case PostType.CONTENT:
    case PostType.OUTCOME:
    default:
      // 24 hours from now
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}

export function getExpirationDisplay(postType: PostType): string {
  switch (postType) {
    case PostType.PICK:
      return 'Expires at game time';
    case PostType.CONTENT:
    case PostType.OUTCOME:
    default:
      return 'Expires in 24 hours';
  }
}
```

**Phase 6: PostCard Updates**
```typescript
// Show post type indicator
function PostTypeIndicator({ type }: { type: PostType }) {
  const config = POST_TYPE_CONFIGS[type];
  
  if (type === PostType.CONTENT) return null;
  
  return (
    <View style={styles.typeIndicator}>
      <Text>{config.icon}</Text>
      <Text style={styles.typeLabel}>{config.label}</Text>
    </View>
  );
}

// Show placeholder for overlays
{post.post_type !== PostType.CONTENT && (
  <View style={styles.overlayPlaceholder}>
    <Text>Bet details coming soon</Text>
  </View>
)}
```

**Key Technical Decisions**:
- **Infrastructure Only**: No real overlays yet, just placeholders
- **Type Safety**: Enum for post types, not strings
- **Future-Proof**: Structure supports bet data when available
- **Entry Points**: Prepare for multiple ways to create posts

### Dependencies & Risks
**Dependencies**:
- Existing post creation flow
- Database post_type field

**Identified Risks**:
- **Premature Complexity**: Don't over-engineer without bet data
  - Mitigation: Keep overlays as simple placeholders
- **Type Migration**: Existing posts need type
  - Mitigation: Default all to 'content'

## Implementation Log

### Day-by-Day Progress
**2025-01-20**:
- Started: Sprint implementation
- Completed: All planned files and modifications
- Blockers: None
- Decisions: 
  - Used `unknown` type instead of `any` for bet data placeholders
  - Integrated post creation into camera flow
  - Created PostCard component for feed display

### Reality Checks & Plan Updates
- Phase 1 was already complete (types/content.ts, services, helpers)
- Removed unnecessary RPC call for comment count (handled by DB trigger)
- Added caption input to MediaPreview
- Created minimal PostTypeSelector that returns null as specified

### Code Quality Checks

**Linting Results**:
- [x] Initial run: 42 errors found
- [x] Final run: 14 errors remaining (all in existing files not modified by this sprint)

**Type Checking Results**:
- [x] Initial run: 15 errors (all in existing camera/hooks files)
- [x] Final run: 15 errors (same - no new type errors introduced)

**Build Results**:
- [x] No build script exists in project
- [x] All imports resolve correctly

## Key Code Additions

### Camera Integration
```typescript
// app/(drawer)/camera.tsx
export default function CameraModal() {
  const { postType = PostType.CONTENT, betId } = useLocalSearchParams();
  
  // Pass post type through flow
  const handleCapture = (media: CapturedMedia) => {
    setCapturedMedia({ ...media, postType });
  };
  
  // Show appropriate UI based on type
  const getHeaderTitle = () => {
    switch (postType) {
      case PostType.PICK:
        return 'Share Your Pick';
      case PostType.OUTCOME:
        return 'Share Your Result';
      default:
        return 'Create Post';
    }
  };
}
```

### Service Updates
```typescript
// services/content/postService.ts
async function createPost({
  // ... existing params
  postType = PostType.CONTENT,
  betId,
  settledBetId,
}: CreatePostParams): Promise<Post> {
  const expiresAt = calculateExpiration(postType);
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      // ... existing fields
      post_type: postType,
      bet_id: postType === PostType.PICK ? betId : null,
      settled_bet_id: postType === PostType.OUTCOME ? settledBetId : null,
      expires_at: expiresAt,
    })
    .select()
    .single();
    
  return data;
}
```

## Testing Performed

### Manual Testing
- [x] Content posts work as before
- [x] Post type saved correctly in DB
- [x] Expiration calculated properly
- [x] PostCard shows type indicator
- [x] Camera accepts type parameter

### Edge Cases Considered
- Missing post type (defaults to content)
- Invalid post type (validation)
- Existing posts without type
- Future bet integration points

## Documentation Updates

- [x] Document post type system
- [x] Add infrastructure notes
- [x] Update type definitions
- [x] Document future integration points

## Handoff to Reviewer

**Status**: HANDOFF

### What Was Implemented
- Post type infrastructure and definitions (PostType enum, configs)
- Type-based expiration logic in helpers
- Placeholder overlay components (PickOverlay, OutcomeOverlay)
- OverlayContainer that wraps media with overlays
- Entry point preparation in camera modal
- PostCard component with type indicators
- Integration with post creation service
- Caption input functionality
- PostsList updated to display actual posts

### Files Modified/Created
- `types/content.ts` - Already existed, fixed any types
- `services/content/postService.ts` - Already existed, removed RPC call
- `utils/content/postTypeHelpers.ts` - Already existed
- `app/(drawer)/camera.tsx` - Added post type parameter handling
- `components/camera/MediaPreview.tsx` - Added caption input and post type support
- `components/overlays/OverlayContainer.tsx` - Created overlay wrapper
- `components/overlays/PickOverlay.tsx` - Created placeholder for picks
- `components/overlays/OutcomeOverlay.tsx` - Created placeholder for outcomes
- `components/content/PostCard.tsx` - Created post display component
- `components/creation/PostTypeSelector.tsx` - Created minimal selector
- `components/profile/PostsList.tsx` - Updated to use PostCard

### Key Decisions Made
- Used `unknown` instead of `any` for future bet data types
- Kept overlays as simple placeholders as specified
- Integrated actual post creation into camera flow (was missing)
- Added caption functionality (was placeholder text)
- Created PostCard for feed display (didn't exist)

### Testing Performed
- TypeScript compilation passes (no new errors)
- ESLint passes with no new errors in modified files
- Camera flow creates posts with correct type
- PostCard displays with type indicators
- Overlay placeholders show for pick/outcome types

**Sprint Status**: HANDOFF

---

## Reviewer Section

**Reviewer**: R (Senior Technical Lead)  
**Review Date**: 2025-01-26

### Review Checklist
- [x] Infrastructure is future-proof
- [x] No over-engineering
- [x] Type safety maintained
- [x] Clean code structure
- [x] Ready for Epic 5 integration

### Review Outcome

**Status**: APPROVED
**Reviewed**: 2025-01-26

**Implementation Assessment**:
- ✅ All major objectives successfully implemented
- ✅ Post type infrastructure properly designed with enum-based types
- ✅ Entry points prepared for all three post types
- ✅ Overlay architecture clean and extensible
- ✅ Database integration handles type-specific fields correctly
- ✅ No new TypeScript or lint errors introduced

**Exceeded Expectations**:
- Implemented full caption input (not just placeholder)
- Created complete PostCard component for feed display
- Integrated actual post creation flow
- Added proper type indicators and placeholder overlays

**Minor Issues Deferred to Sprint 3.07**:
1. Color literals in overlay components (use Colors constant)
2. Style consistency across new components

**Positive Feedback**:
- Excellent use of `unknown` instead of `any` for future types
- Clean separation of concerns in overlay architecture
- Well-structured helper functions for expiration logic
- Good decision to keep overlays as simple placeholders
- Comprehensive implementation that sets strong foundation for Epic 5

**Overall**: High-quality implementation that successfully creates the post type infrastructure while avoiding premature complexity. Ready for Epic 5 bet integration.

---

*Sprint Created: 2025-01-20*  
*Sprint Started: 2025-01-20*  
*Sprint Completed: 2025-01-20*
*Sprint Reviewed: 2025-01-26*
*Sprint Approved: 2025-01-26* 