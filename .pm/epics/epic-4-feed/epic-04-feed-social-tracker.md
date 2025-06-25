# Epic 4: Feed & Social Engagement Tracker

## Epic Overview

**Status**: IN PROGRESS  
**Start Date**: 2024-12-19  
**Target End Date**: TBD  
**Actual End Date**: TBD

**Epic Goal**: Build the complete social layer of SnapBet including the feed, user profiles, following system with private account support, search/discovery, and all social interactions that make betting a shared experience.

**User Stories Addressed**:
- Story 1: The Shared Experience Problem - Feed and social features for pick sharing
- Story 4: The Isolation Problem - Connect with others through following, engagement, and discovery
- Story 5: The Missing My People Problem - Discovery features to find like-minded bettors

**PRD Reference**: Core social features including feed, profiles, following, discovery, and engagement

## Sprint Breakdown

| Sprint # | Sprint Name | Status | Start Date | End Date | Key Deliverable |
|----------|-------------|--------|------------|----------|-----------------|
| 04.01 | Feed Infrastructure | APPROVED | 2024-12-19 | 2024-12-19 | Following-only feed with FlashList |
| 04.02 | Search & Discovery | APPROVED | TBD | TBD | User search and discovery sections |
| 04.03 | Following System | APPROVED | 2024-12-19 | 2024-12-19 | Optimistic follow/unfollow |
| 04.04 | Privacy & Follow Requests | APPROVED WITH COMMENDATION | 2024-12-20 | 2024-12-20 | Private accounts with requests |
| 04.05 | Engagement Backend | NEEDS_MAJOR_REVISION | 2025-01-10 | 2025-01-10 | Comments, reactions, tail/fade |
| 04.06 | Story Viewer | NOT STARTED | - | - | Full-screen story experience |
| 04.07 | Content Moderation | NOT STARTED | - | - | Reporting and blocking |
| 04.08 | Referral Rewards | NOT STARTED | - | - | $100 weekly bonus implementation |
| 04.09 | Performance & Polish | NOT STARTED | - | - | 60 FPS optimization |

**Total Duration**: ~12 hours (9 sprints)

**Note**: Performance Analytics (originally Sprint 04.10) moved to Epic 5 where it belongs after betting system is implemented.

**Statuses**: NOT STARTED | IN PROGRESS | IN REVIEW | APPROVED | BLOCKED

## Architecture & Design Decisions

### High-Level Architecture for This Epic
The social layer builds on Epic 3's content creation with a performant feed, discovery features, and engagement mechanics. All components are designed for 60 FPS performance and real-time updates.

### Key Design Decisions
1. **FlashList over FlatList**: Better performance for social feeds
   - Alternatives considered: FlatList, ScrollView, VirtualizedList
   - Rationale: FlashList provides better memory management and smoother scrolling
   - Trade-offs: Slightly more complex API but worth it for performance

2. **Following-only feed (no algorithm)**: Simpler initial implementation
   - Alternatives considered: Algorithmic feed from day one
   - Rationale: Get core social features working first
   - Trade-offs: May feel empty for new users, but discovery tab compensates

3. **Private accounts with follow requests**: Required for assignment
   - Alternatives considered: Public-only accounts initially
   - Rationale: Privacy is a core requirement from the assignment
   - Trade-offs: More complex UX but necessary for user trust

4. **$100 permanent weekly bonus per referral**: Strong growth incentive
   - Alternatives considered: One-time bonus, smaller amount
   - Rationale: Permanent bonus creates ongoing value for referrers
   - Trade-offs: Higher cost but drives sustained growth

5. **Tail/fade UI only (no betting)**: Separation of concerns
   - Alternatives considered: Full betting in this epic
   - Rationale: Keep social features separate from betting logic
   - Trade-offs: Some features incomplete until Epic 5

6. **Unified MMKV Storage Service** (NEW - from Sprint 04.01)
   - Alternatives considered: Continue with AsyncStorage
   - Rationale: 30x performance improvement, consistent API
   - Trade-offs: Migration effort paid off immediately

### Dependencies
**External Dependencies**:
- @shopify/flash-list: ^1.8.3 - High-performance list rendering ✅
- react-native-mmkv: For caching and storage ✅

**Internal Dependencies**:
- Requires: Epic 3 content creation, Epic 2 auth/profiles
- Provides: Social foundation for Epic 5 betting integration

## Implementation Notes

### File Structure for Epic
```
app/
├── (drawer)/
│   ├── (tabs)/
│   │   ├── index.tsx        # Main feed (UPDATED)
│   │   └── search.tsx       # Search/Discovery (create)
│   ├── followers.tsx        # Followers list (exists)
│   ├── following.tsx        # Following list (exists)
│   └── story/
│       └── [id].tsx         # Story viewer (create)
components/
├── feed/                    # NEW
│   ├── EmptyFeed.tsx       # CREATED
│   └── FeedSkeleton.tsx    # CREATED
├── search/                  # Create this sprint
├── engagement/              # Create in 04.05
└── moderation/             # Create in 04.07
services/
├── feed/                    # NEW
│   └── feedService.ts      # CREATED
├── storage/                 # NEW
│   └── storageService.ts   # CREATED
└── search/                  # Create in 04.02
hooks/
├── useFeed.ts              # UPDATED
├── useFeedPagination.ts    # CREATED
└── useStories.ts           # UPDATED
```

### API Endpoints Added
| Method | Path | Purpose | Sprint |
|--------|------|---------|--------|
| Supabase RPC | get_feed | Get paginated feed posts | 04.01 ✅ |
| Supabase Subscribe | posts | Real-time feed updates | 04.01 ✅ |

### Data Model Changes
```sql
-- No schema changes in Sprint 04.01
-- Future: follow_requests, blocked_users, reports tables
```

### Key Functions/Components Created
- `FeedScreen` - Main feed with FlashList - Sprint 04.01 ✅
- `EmptyFeed` - Engaging empty state - Sprint 04.01 ✅
- `FeedSkeleton` - Loading states - Sprint 04.01 ✅
- `useFeedPagination` - Reusable pagination hook - Sprint 04.01 ✅
- `feedService` - Feed query logic - Sprint 04.01 ✅
- `storageService` - Unified MMKV storage - Sprint 04.01 ✅
- `SearchScreen` - User search with discovery sections - Sprint 04.02
- `FollowButton` - Optimistic follow/unfollow - Sprint 04.03
- `FollowRequestSheet` - Private account requests - Sprint 04.04
- `CommentSheet` - Bottom sheet for comments - Sprint 04.05
- `ReactionPicker` - 6-reaction selector - Sprint 04.05
- `StoryViewer` - Full-screen story viewer - Sprint 04.06
- `ReportModal` - Content reporting flow - Sprint 04.07
- `ReferralCard` - Referral sharing component - Sprint 04.08
- `PerformanceTab` - Analytics dashboard - Sprint 04.09

## Sprint Execution Log

### Sprint 04.01: Feed Infrastructure
**Status**: APPROVED ✅
**Duration**: 2 hours (under 2.5 hour estimate)
**Grade**: A+ (Exceeds Expectations)

**Summary**: Transformed self-only feed into high-performance social feed with real-time updates, pagination, and caching. Exceeded scope by adding unified storage service and connecting stories to real data.

**Key Achievements**:
- FlashList migration with 60 FPS performance
- Composite cursor pagination (timestamp + id)
- MMKV storage service (30x faster than AsyncStorage)
- Real-time subscriptions with 100-follow limit
- Stories integration (bonus feature)

**Architectural Impact**:
- Established storage service pattern for entire app
- Proven real-time subscription approach
- Set high bar for code quality

**Issues Encountered**: None - smooth implementation

### Sprint 04.02: Search & Discovery
**Status**: APPROVED
**Summary**: [Pending implementation]

[Continue for each completed sprint]

## Testing & Quality

### Testing Approach
- Manual testing on iOS simulator primary
- Performance monitoring (60 FPS target)
- Edge case validation
- Real device testing when possible

### Known Issues
| Issue | Severity | Sprint | Status | Resolution |
|-------|----------|--------|--------|------------|
| React hook dependency warning | LOW | 04.01 | ACCEPTED | Intentional to prevent re-renders |

## Mid-Epic Refactoring (Between Sprint 04.04 and 04.05)

### Critical Issues Discovered

**1. Circular Dependencies in Services**
- **Problem**: followService ↔ privacyService ↔ followRequestService created require cycles
- **Root Cause**: Services calling each other directly for data
- **Solution**: Dependency Injection Pattern
  ```typescript
  // BAD: Circular dependency
  class FollowService {
    async toggleFollow(targetId: string) {
      const isPrivate = await privacyService.isUserPrivate(targetId); // Creates cycle
    }
  }
  
  // GOOD: Accept required data as parameters
  class FollowService {
    async toggleFollow(targetId: string, isPrivate: boolean) {
      // No direct service dependency
    }
  }
  ```
- **Lesson**: Services should accept data as parameters, not fetch from other services

**2. Modal Navigation Architecture**
- **Problem**: Camera screen used `<Modal>` component causing navigation crashes
- **Root Cause**: Fighting between manual Modal and Expo Router navigation
- **Solution**: Use router's modal presentation
  ```typescript
  // BAD: Manual modal
  export default function CameraScreen() {
    return <Modal visible={true}>...</Modal>;
  }
  
  // GOOD: Router-managed modal
  // In _layout.tsx:
  <Stack.Screen 
    name="camera" 
    options={{ presentation: 'fullScreenModal' }}
  />
  ```
- **Lesson**: Let the router manage all navigation, including modals

**3. Image Processing for Modern Devices**
- **Problem**: HDR images from iPhone cameras causing compression failures
- **Solution**: Use expo-image-manipulator with explicit JPEG conversion
- **Lesson**: Always handle modern media formats explicitly

**4. Animation Registry Pattern**
- **Problem**: Missing animation definitions causing runtime warnings
- **Solution**: Central animation registry with all animations defined
- **Lesson**: Register all custom animations in a central location

### Architectural Patterns Established

1. **Service Layer Independence**: Services should be pure functions/classes that don't depend on other services
2. **Data Flow Direction**: UI → Hooks → Services (never Services → Services)
3. **Navigation Consistency**: All navigation through Expo Router, no manual modals
4. **Media Handling**: Always process modern formats to standard formats
5. **Animation Management**: Central registry for all custom animations

### Impact on Future Sprints

These patterns must be followed in all remaining sprints:
- Sprint 04.05 (Engagement): Services must not call each other
- Sprint 04.06 (Story Viewer): Use router modal presentation
- Sprint 04.07+ : Apply all patterns consistently

## Refactoring Completed

### Code Improvements
- Created unified MMKV storage service (Sprint 04.01)
- Removed unused StoryBar component (Sprint 04.01)

### Performance Optimizations
- FlashList provides significant scroll performance improvement
- MMKV caching reduces initial load time by ~300ms

## Learnings & Gotchas

### What Worked Well
- FlashList migration was straightforward with similar API
- MMKV integration provides immediate performance benefits
- Composite cursor elegantly handles edge cases

### Challenges Faced
- None in Sprint 04.01 - smooth execution

### Gotchas for Future Development
- **Real-time subscriptions**: Monitor performance with high follow counts
- **FlashList**: Requires estimatedItemSize for optimal performance
- **MMKV**: Different API than AsyncStorage, but worth the migration
- **Service Dependencies**: NEVER have services call other services - pass data as parameters
- **Modal Navigation**: Always use Expo Router's presentation options, never manual `<Modal>`
- **Image Processing**: Modern devices produce HDR images that need explicit conversion
- **Circular Dependencies**: Will cause "Require cycle" warnings and potential runtime failures
- **Animation Definitions**: All custom animations must be registered in the central registry

## Epic Completion Checklist

- [x] Sprint 04.01 completed and approved
- [ ] Sprint 04.02-04.09 pending
- [ ] User stories for this epic fully addressed
- [ ] Code refactored and cleaned up
- [ ] Documentation updated
- [ ] No critical bugs remaining
- [ ] Performance acceptable (60 FPS scrolling)
- [ ] Integration with other epics tested
- [ ] Epic summary added to project tracker
- [ ] All Epic 8 features incorporated

## Epic Summary for Project Tracker

**[To be completed at epic end]**

**Delivered Features**:
- High-performance social feed with FlashList (Sprint 04.01) ✅
- [Pending other sprints]

**Key Architectural Decisions**:
- Unified MMKV storage service for 30x performance gain
- Composite cursor pagination for stable infinite scroll
- [More to come]

**Critical Learnings**:
- FlashList migration is low-risk, high-reward
- Storage architecture decisions should be made early
- [More to come]

**Technical Debt Created**:
- None so far - actually reduced debt with storage service

---

*Epic Started: 2024-12-19*  
*Epic Completed: TBD*  
*Total Duration: TBD* 