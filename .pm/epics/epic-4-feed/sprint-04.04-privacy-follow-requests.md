# Sprint 04.04: Privacy & Follow Requests Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 4 - Feed & Social Engagement

**Sprint Goal**: Implement private account functionality with follow request system, connect privacy settings to backend, and ensure privacy is enforced throughout the app.

**User Story Contribution**: 
- Enables Story 2: The Permanent Record Problem - Users can control who sees their content
- Supports privacy and authentic sharing without fear

## Sprint Plan

### Objectives
1. Create database tables for follow requests
2. Add privacy columns to users table
3. Implement follow request flow for private accounts
4. Create follow requests management screen
5. Connect privacy settings UI to backend
6. Enforce privacy in all content queries
7. Add follow request notifications
8. Handle pending/approved/rejected states

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `app/(drawer)/follow-requests.tsx` | Screen to manage incoming follow requests | NOT STARTED |
| `hooks/useFollowRequests.ts` | Follow request state management | NOT STARTED |
| `services/social/followRequestService.ts` | Follow request API logic | NOT STARTED |
| `services/privacy/privacyService.ts` | Privacy settings management | NOT STARTED |
| `components/profile/FollowRequestButton.tsx` | Button states for follow requests | NOT STARTED |
| `components/profile/PendingRequestBadge.tsx` | Visual indicator for pending requests | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `app/(drawer)/settings/privacy.tsx` | Connect toggles to backend | NOT STARTED |
| `app/(drawer)/profile/[username].tsx` | Handle private profiles and requests | NOT STARTED |
| `hooks/useFeed.ts` | Filter based on privacy settings | NOT STARTED |
| `services/social/followService.ts` | Add request logic for private accounts | NOT STARTED |
| `components/ui/DrawerContent.tsx` | Add follow requests menu item with badge | NOT STARTED |

### Implementation Approach

1. **Database Schema**:
   ```sql
   -- Already defined in epic tracker
   CREATE TABLE follow_requests (
     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     requester_id uuid REFERENCES users(id),
     requested_id uuid REFERENCES users(id),
     created_at timestamp DEFAULT now(),
     status text DEFAULT 'pending',
     UNIQUE(requester_id, requested_id)
   );

   ALTER TABLE users ADD COLUMN
     is_private boolean DEFAULT false,
     show_bankroll boolean DEFAULT true,
     show_stats boolean DEFAULT true,
     show_picks boolean DEFAULT true;
   ```

2. **Follow Request Flow**:
   - Public accounts: Direct follow (existing behavior)
   - Private accounts: Create follow request
   - Show "Requested" state on button
   - Notify user of new request
   - Allow accept/reject from requests screen

3. **Privacy Enforcement**:
   - Posts: Only show if following or public
   - Profile: Limited view for non-followers of private accounts
   - Stats: Respect show_bankroll, show_stats settings
   - Stories: Only from followed users

4. **Request Management Screen**:
   - List pending requests with user info
   - Accept/Reject buttons with optimistic updates
   - Show requester's basic info and stats
   - Clear all option

**Key Technical Decisions**:
- Pending requests expire after 30 days (auto-reject)
- Rejected requests can be re-sent after 7 days
- Privacy changes don't affect existing followers
- Default all users to public for smooth migration

### Dependencies & Risks
**Dependencies**:
- Database migration for new tables/columns
- Notification system from Epic 2
- Follow system from Sprint 4.3

**Identified Risks**:
- Complex query modifications for privacy
- Performance impact of privacy checks
- Migration of existing users to new schema

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
// services/social/followRequestService.ts
export async function createFollowRequest(targetUserId: string) {
  // Purpose: Create a follow request for private account
  // Returns: { success: boolean, requestId?: string }
}

export async function handleFollowRequest(requestId: string, action: 'accept' | 'reject') {
  // Purpose: Accept or reject a follow request
  // Returns: { success: boolean }
}

// hooks/useFollowRequests.ts
export function useFollowRequests() {
  // Purpose: Manage incoming follow requests
  // Returns: { requests, acceptRequest, rejectRequest, pendingCount }
}

// services/privacy/privacyService.ts
export async function updatePrivacySettings(settings: PrivacySettings) {
  // Purpose: Update user privacy settings
  // Returns: { success: boolean }
}
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| POST | /follow-requests | `{ targetUserId: string }` | `{ requestId: string }` | PLANNED |
| PUT | /follow-requests/:id | `{ action: 'accept' \| 'reject' }` | `{ success: boolean }` | PLANNED |
| GET | /follow-requests/incoming | - | `{ requests: FollowRequest[] }` | PLANNED |
| PUT | /users/privacy | `{ settings: PrivacySettings }` | `{ success: boolean }` | PLANNED |

### State Management
- Privacy settings in user metadata
- Follow requests cached with real-time updates
- Request counts shown in drawer badge
- Privacy enforcement at query level

## Testing Performed

### Manual Testing
- [ ] Can toggle account to private
- [ ] Follow button shows "Request" for private accounts
- [ ] Requests appear in management screen
- [ ] Accept/reject works with notifications
- [ ] Privacy settings save and persist
- [ ] Feed respects privacy settings
- [ ] Profile shows limited info when private

### Edge Cases Considered
- User goes private after having followers: Keep existing
- Duplicate follow requests: Show existing status
- Request then block: Auto-reject request
- Privacy toggle spam: Debounce updates
- Large request lists: Pagination

## Documentation Updates

- [ ] Privacy model documented
- [ ] Follow request flow diagrammed
- [ ] Privacy query patterns documented
- [ ] Migration guide for existing users

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
- Privacy query performance
- Follow request state machine
- Edge cases in privacy enforcement

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