# Sprint 04.03: Following System Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 4 - Feed & Social Engagement

**Sprint Goal**: Enhance the existing following system with optimistic updates, mutual follow indicators, real-time count updates, and improved follow/follower list functionality.

**User Story Contribution**: 
- Enables Story 4: The Isolation Problem - Better connection indicators and social proof
- Supports Story 1: Social Pick Sharing - Know who follows you back

## Sprint Plan

### Objectives
1. Add optimistic updates to all follow/unfollow actions
2. Implement mutual follow detection and indicators
3. Update follower/following counts in real-time everywhere
4. Add search functionality within follow lists
5. Enable removing followers from your own follower list
6. Add follow state caching for performance
7. Create follow/unfollow service with proper error handling

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `services/social/followService.ts` | Centralized follow/unfollow logic | NOT STARTED |
| `hooks/useFollowState.ts` | Follow state management with optimistic updates | NOT STARTED |
| `hooks/useMutualFollows.ts` | Detect and track mutual follows | NOT STARTED |
| `components/common/MutualFollowBadge.tsx` | Visual indicator for mutual follows | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `app/(drawer)/followers.tsx` | Add search, remove follower functionality | NOT STARTED |
| `app/(drawer)/following.tsx` | Add search functionality | NOT STARTED |
| `components/common/UserListItem.tsx` | Add mutual follow indicator | NOT STARTED |
| `components/profile/ProfileHeader.tsx` | Real-time count updates | NOT STARTED |
| `hooks/useUserList.ts` | Add search capability | NOT STARTED |

### Implementation Approach

1. **Optimistic Updates**:
   - Update UI immediately on follow/unfollow
   - Show loading state on button
   - Rollback on error with toast message
   - Update counts optimistically

2. **Mutual Follow Detection**:
   ```typescript
   // Check if users follow each other
   const checkMutualFollow = async (userId1: string, userId2: string) => {
     const [follows, followsBack] = await Promise.all([
       checkFollowStatus(userId1, userId2),
       checkFollowStatus(userId2, userId1)
     ]);
     return follows && followsBack;
   };
   ```

3. **Real-time Count Updates**:
   - Subscribe to follows table changes
   - Update counts when follows/unfollows occur
   - Cache counts with 1-minute TTL

4. **Follow List Enhancements**:
   - Add search bar to filter lists
   - "Remove Follower" option on your followers
   - Show mutual follow badges
   - Maintain scroll position during updates

**Key Technical Decisions**:
- Optimistic updates over loading states for better UX
- Cache follow relationships to reduce queries
- Use Supabase real-time for instant updates
- Debounce search in follow lists by 200ms

### Dependencies & Risks
**Dependencies**:
- Existing follows table and relationships
- UserListItem component from Epic 2
- Real-time subscriptions setup

**Identified Risks**:
- Race conditions with rapid follow/unfollow
- Performance with large follow lists
- Ensuring counts stay in sync

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
// services/social/followService.ts
export async function toggleFollow(targetUserId: string, currentlyFollowing: boolean) {
  // Purpose: Handle follow/unfollow with optimistic updates
  // Returns: { success: boolean, error?: string }
}

// hooks/useFollowState.ts
export function useFollowState(userId: string) {
  // Purpose: Track follow state with caching
  // Returns: { isFollowing, isFollower, isMutual, toggleFollow }
}

// hooks/useMutualFollows.ts
export function useMutualFollows(userIds: string[]) {
  // Purpose: Check mutual follow status for multiple users
  // Returns: Map<userId, boolean>
}
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| POST | /follows | `{ targetUserId: string }` | `{ success: boolean }` | EXISTING |
| DELETE | /follows/:id | - | `{ success: boolean }` | EXISTING |
| GET | /follows/mutual | `{ userIds: string[] }` | `{ mutual: Record<string, boolean> }` | PLANNED |

### State Management
- Follow states cached in memory with TTL
- Optimistic updates applied immediately
- Real-time subscriptions update cache
- Follower/following counts in ProfileHeader state

## Testing Performed

### Manual Testing
- [ ] Follow/unfollow updates instantly
- [ ] Counts update everywhere simultaneously
- [ ] Mutual follow badges appear correctly
- [ ] Search in follow lists works
- [ ] Can remove followers
- [ ] Error handling shows appropriate messages
- [ ] Offline mode shows cached states

### Edge Cases Considered
- Rapid follow/unfollow: Debounce or queue actions
- Following private account: Show pending state
- Network failure: Rollback optimistic update
- Large follow lists: Pagination and virtual scrolling
- Self-follow attempt: Prevent and show error

## Documentation Updates

- [ ] Follow service API documented
- [ ] Optimistic update pattern documented
- [ ] Real-time subscription setup documented
- [ ] Cache invalidation strategy documented

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
- Optimistic update rollback logic
- Real-time subscription efficiency
- Race condition handling

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

**Duration**: Planned 1 hour | Actual TBD  
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