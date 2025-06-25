# Sprint 04.05: Engagement Backend Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 4 - Feed & Social Engagement

**Sprint Goal**: Connect the existing engagement UI components (comments, reactions, tail/fade buttons) to the backend with real-time updates and proper data persistence.

**User Story Contribution**: 
- Enables Story 1: Social Pick Sharing - Full engagement on shared content
- Enables Story 4: The Isolation Problem - Connect through comments and reactions

## Sprint Plan

### Objectives
1. Connect comment system UI to database
2. Implement reaction system with 6 emoji types
3. Add real-time updates for comments and reactions
4. Create tail/fade UI for pick posts (backend in Epic 5)
5. Update engagement counts in real-time
6. Add engagement notifications
7. Implement comment moderation (delete own comments)
8. Add "who reacted" modal functionality

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `services/engagement/commentService.ts` | Comment CRUD operations | NOT STARTED |
| `services/engagement/reactionService.ts` | Reaction management | NOT STARTED |
| `hooks/useComments.ts` | Comment state with real-time updates | NOT STARTED |
| `hooks/useReactions.ts` | Reaction state management | NOT STARTED |
| `components/engagement/WhoReactedModal.tsx` | Show users who reacted | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `components/engagement/sheets/CommentSheet.tsx` | Connect to backend | NOT STARTED |
| `components/engagement/ReactionPicker.tsx` | Wire up reaction creation | NOT STARTED |
| `components/engagement/display/EngagementCounts.tsx` | Real-time count updates | NOT STARTED |
| `components/content/PostCard.tsx` | Update engagement integration | NOT STARTED |
| `hooks/useEngagement.ts` | Replace mock data with real queries | NOT STARTED |

### Implementation Approach

1. **Comments System**:
   ```typescript
   // Comment structure
   interface Comment {
     id: string;
     post_id: string;
     user_id: string;
     content: string; // max 280 chars
     created_at: string;
     user: {
       username: string;
       avatar_url?: string;
     };
   }
   ```

2. **Reactions System**:
   - 6 allowed emojis: 🔥💰😂😭💯🎯
   - One reaction per user per post
   - Can change reaction (replaces previous)
   - Aggregate counts by emoji type

3. **Real-time Updates**:
   - Subscribe to comments table for post
   - Subscribe to reactions table for post
   - Update counts optimistically
   - Show new comments as they arrive

4. **Tail/Fade UI** (Backend in Epic 5):
   - Show buttons only on pick posts
   - Display current tail/fade counts
   - Show "Coming Soon" toast on tap
   - Prepare UI for Epic 5 integration

**Key Technical Decisions**:
- Comments limited to 280 characters (Twitter-like)
- Reactions use database constraints for one-per-user
- Real-time subscriptions scoped to visible posts only
- Optimistic updates with rollback on error

### Dependencies & Risks
**Dependencies**:
- Comments and reactions tables exist
- Notification service from Epic 2
- PostCard component from Epic 3

**Identified Risks**:
- Real-time subscriptions for many posts could impact performance
- Comment spam potential (rate limiting needed)
- Ensuring counts stay accurate with concurrent updates

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
// services/engagement/commentService.ts
export async function addComment(postId: string, content: string) {
  // Purpose: Add a comment to a post
  // Returns: { comment: Comment }
}

export async function deleteComment(commentId: string) {
  // Purpose: Delete own comment
  // Returns: { success: boolean }
}

// services/engagement/reactionService.ts
export async function toggleReaction(postId: string, emoji: string) {
  // Purpose: Add/update/remove reaction
  // Returns: { reaction?: Reaction }
}

// hooks/useComments.ts
export function useComments(postId: string) {
  // Purpose: Manage comments with real-time updates
  // Returns: { comments, addComment, deleteComment, isLoading }
}
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| POST | /posts/:id/comments | `{ content: string }` | `{ comment: Comment }` | PLANNED |
| DELETE | /comments/:id | - | `{ success: boolean }` | PLANNED |
| POST | /posts/:id/reactions | `{ emoji: string }` | `{ reaction?: Reaction }` | PLANNED |
| GET | /posts/:id/reactions/users | `{ emoji: string }` | `{ users: User[] }` | PLANNED |

### State Management
- Comments cached per post with real-time sync
- Reactions aggregated with user's reaction highlighted
- Engagement counts updated optimistically
- Subscription cleanup on unmount

## Testing Performed

### Manual Testing
- [ ] Can add comments to posts
- [ ] Comments appear in real-time for all viewers
- [ ] Can delete own comments
- [ ] Reactions toggle correctly
- [ ] Only one reaction per user enforced
- [ ] Reaction counts update instantly
- [ ] "Who reacted" shows correct users
- [ ] Tail/fade buttons show on pick posts only

### Edge Cases Considered
- Rapid reaction changes: Debounce API calls
- Long comments: Enforce 280 char limit
- Deleted post: Handle gracefully
- Network issues: Queue actions for retry
- Many comments: Implement pagination

## Documentation Updates

- [ ] Comment system architecture documented
- [ ] Reaction constraints documented
- [ ] Real-time subscription patterns documented
- [ ] Engagement notification types documented

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
- Real-time performance with many posts
- Optimistic update rollback logic
- Comment moderation edge cases

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

**Duration**: Planned 1.5 hours | Actual TBD  
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