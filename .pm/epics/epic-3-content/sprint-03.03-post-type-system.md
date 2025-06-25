# Sprint 03.03: Post Type System Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
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
| `components/creation/PostTypeSelector.tsx` | UI for selecting post type | NOT STARTED |
| `components/overlays/OverlayContainer.tsx` | Base container for future overlays | NOT STARTED |
| `components/overlays/PickOverlay.tsx` | Placeholder pick overlay | NOT STARTED |
| `components/overlays/OutcomeOverlay.tsx` | Placeholder outcome overlay | NOT STARTED |
| `types/content.ts` | Post type definitions | NOT STARTED |
| `utils/content/postTypeHelpers.ts` | Helper functions for post types | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `components/camera/MediaPreview.tsx` | Add post type context | NOT STARTED |
| `services/content/postService.ts` | Handle different post types | NOT STARTED |
| `app/(drawer)/camera.tsx` | Accept post type parameter | NOT STARTED |
| `components/content/PostCard.tsx` | Display based on post type | NOT STARTED |

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
- [ ] Content posts work as before
- [ ] Post type saved correctly in DB
- [ ] Expiration calculated properly
- [ ] PostCard shows type indicator
- [ ] Camera accepts type parameter

### Edge Cases Considered
- Missing post type (defaults to content)
- Invalid post type (validation)
- Existing posts without type
- Future bet integration points

## Documentation Updates

- [ ] Document post type system
- [ ] Add infrastructure notes
- [ ] Update type definitions
- [ ] Document future integration points

## Handoff to Reviewer

### What Will Be Implemented
- Post type infrastructure and definitions
- Type-based expiration logic
- Placeholder overlay components
- Entry point preparation
- PostCard type indicators

### Success Criteria
- Three post types defined and working
- Infrastructure ready for bet overlays
- No breaking changes to existing flow
- Clean separation of concerns
- Type-safe implementation

### Testing Instructions
1. Create a content post (default flow)
2. Verify post_type = 'content' in database
3. Check expiration is 24 hours
4. Verify PostCard shows correctly
5. Confirm no regressions

**Sprint Status**: NOT STARTED

---

## Reviewer Section

**Reviewer**: [R persona]  
**Review Date**: [TBD]

### Review Checklist
- [ ] Infrastructure is future-proof
- [ ] No over-engineering
- [ ] Type safety maintained
- [ ] Clean code structure
- [ ] Ready for Epic 5 integration

### Review Outcome

**Status**: [TBD]

---

*Sprint Created: 2025-01-20*  
*Sprint Started: [TBD]*  
*Sprint Completed: [TBD]* 