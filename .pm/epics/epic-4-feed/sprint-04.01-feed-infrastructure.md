# Sprint 04.01: Feed Infrastructure Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 4 - Feed & Social Engagement

**Sprint Goal**: Transform the current self-only feed into a high-performance social feed showing posts from followed users with real-time updates, pagination, and proper empty states.

**User Story Contribution**: 
- Enables Story 1: Social Pick Sharing - Users can see picks from people they follow
- Enables Story 4: The Isolation Problem - Connect through following and seeing others' content

## Sprint Plan

### Objectives
1. Migrate from FlatList to FlashList for superior performance
2. Update feed query to show posts from followed users (not just own posts)
3. Implement infinite scroll with pagination
4. Add real-time subscriptions for new posts from followed users
5. Create empty state for users with no follows
6. Add pull-to-refresh with haptic feedback
7. Handle offline/online states gracefully

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `hooks/useFeedPagination.ts` | Pagination logic for infinite scroll | NOT STARTED |
| `components/feed/EmptyFeed.tsx` | Enhanced empty state component | NOT STARTED |
| `components/feed/FeedSkeleton.tsx` | Loading skeleton for feed | NOT STARTED |
| `services/feed/feedService.ts` | Feed query logic and caching | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `app/(drawer)/(tabs)/index.tsx` | Replace FlatList with FlashList, update layout | NOT STARTED |
| `hooks/useFeed.ts` | Update to query followed users, add pagination | NOT STARTED |
| `package.json` | Add @shopify/flash-list dependency | NOT STARTED |
| `components/content/PostCard.tsx` | Optimize for FlashList rendering | NOT STARTED |

### Implementation Approach

1. **FlashList Migration**:
   - Install @shopify/flash-list
   - Replace FlatList with FlashList in feed screen
   - Configure estimatedItemSize based on PostCard height
   - Set proper drawDistance and recycling settings

2. **Feed Query Update**:
   - Get user's following list first
   - Query posts from followed users + self
   - Order by created_at descending
   - Filter out expired posts
   - Include user data with proper relationship hints

3. **Pagination Implementation**:
   - Use cursor-based pagination (last post ID)
   - Load 20 posts per page
   - Implement hasMore flag
   - Add loading more indicator

4. **Real-time Subscriptions**:
   - Subscribe to posts table for followed user IDs
   - Handle INSERT events for new posts
   - Prepend new posts to feed optimistically
   - Handle connection/disconnection gracefully

**Key Technical Decisions**:
- Use cursor-based pagination over offset for better performance
- 20 posts per page balances load time and user experience
- Optimistic updates for real-time posts to feel instant
- Cache first page in MMKV for instant load on app open

### Dependencies & Risks
**Dependencies**:
- @shopify/flash-list: ^1.6.0
- Existing PostCard component from Epic 3
- Following relationships from Epic 2

**Identified Risks**:
- FlashList has different props than FlatList - need careful migration
- Real-time subscriptions with many follows could impact performance
- Empty state needs to guide users to search/discover

## Implementation Log

### Day-by-Day Progress
**[Date]**:
- Started: [What was begun]
- Completed: [What was finished]
- Blockers: [Any issues]
- Decisions: [Any changes to plan]

### Reality Checks & Plan Updates

**Reality Check 1** - [Date]
- Issue: [What wasn't working]
- Options Considered:
  1. [Option 1] - Pros/Cons
  2. [Option 2] - Pros/Cons
- Decision: [What was chosen]
- Plan Update: [How sprint plan changed]
- Epic Impact: [Any epic updates needed]

### Code Quality Checks

**Linting Results**:
- [ ] Initial run: [X errors, Y warnings]
- [ ] Final run: [Should be 0 errors]

**Type Checking Results**:
- [ ] Initial run: [X errors]
- [ ] Final run: [Should be 0 errors]

**Build Results**:
- [ ] Development build passes
- [ ] Production build passes

## Key Code Additions

### New Functions/Components
```typescript
// hooks/useFeedPagination.ts
export function useFeedPagination() {
  // Purpose: Handle infinite scroll pagination
  // Returns: { posts, loadMore, hasMore, isLoadingMore }
}

// services/feed/feedService.ts  
export async function getFeedPosts(userId: string, cursor?: string) {
  // Purpose: Query posts from followed users with pagination
  // Returns: { posts: Post[], nextCursor: string | null }
}
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| GET | /feed | `{ cursor?: string, limit: number }` | `{ posts: Post[], nextCursor?: string }` | PLANNED |

### State Management
- Feed posts stored in component state (will move to global state if needed)
- Pagination cursor tracked in useFeedPagination hook
- Following list cached in React Query

## Testing Performed

### Manual Testing
- [ ] Feed loads posts from followed users
- [ ] Pull-to-refresh works with haptic feedback
- [ ] Infinite scroll triggers at bottom
- [ ] New posts appear in real-time
- [ ] Empty state shows for no follows
- [ ] Performance stays at 60 FPS while scrolling

### Edge Cases Considered
- User with no follows: Show discovery suggestions
- User follows then unfollows: Update feed accordingly
- Network goes offline while scrolling: Show cached content
- Very long posts: FlashList handles variable heights

## Documentation Updates

- [ ] Code comments added for FlashList configuration
- [ ] README updated with new dependency
- [ ] useFeed hook documentation updated
- [ ] Real-time subscription pattern documented

## Handoff to Reviewer

### What Was Implemented
[Clear summary of all work completed]

### Files Modified/Created
**Created**:
- `[file1.ts]` - [Purpose]

**Modified**:
- `[file3.ts]` - [What changed and why]

### Key Decisions Made
1. [Decision]: [Rationale and impact]

### Deviations from Original Plan
- [Deviation 1]: [Why it was necessary]

### Known Issues/Concerns
- [Any issues the reviewer should know about]

### Suggested Review Focus
- FlashList performance with media-heavy posts
- Real-time subscription efficiency
- Pagination edge cases

**Sprint Status**: NOT STARTED

---

## Reviewer Section

**Reviewer**: R persona  
**Review Date**: TBD

### Review Checklist
- [ ] Code matches sprint objectives
- [ ] All planned files created/modified
- [ ] Follows established patterns
- [ ] No unauthorized scope additions
- [ ] Code is clean and maintainable
- [ ] No obvious bugs or issues
- [ ] Integrates properly with existing code

### Review Outcome

**Status**: PENDING

### Feedback
[Review feedback will go here]

---

## Sprint Metrics

**Duration**: Planned 2.5 hours | Actual TBD  
**Scope Changes**: 0  
**Review Cycles**: 0  
**Files Touched**: TBD  
**Lines Added**: TBD  
**Lines Removed**: TBD

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: TBD*  
*Sprint Completed: TBD*  
*Final Status: NOT STARTED* 