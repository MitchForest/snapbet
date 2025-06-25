# Sprint 04.07: Content Moderation Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 4 - Feed & Social Engagement

**Sprint Goal**: Implement reporting and blocking functionality to ensure user safety, including auto-hide logic after multiple reports and basic admin moderation tools.

**User Story Contribution**: 
- Ensures safe environment for all user stories
- Protects users from harmful content and harassment

## Sprint Plan

### Objectives
1. Create database tables for blocks and reports
2. Implement user blocking with content filtering
3. Build content reporting system with categories
4. Add auto-hide after 3 reports
5. Create blocked users management screen
6. Build basic admin moderation panel
7. Add report confirmation feedback
8. Ensure blocks affect all user interactions

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `app/settings/blocked.tsx` | Blocked users management screen | NOT STARTED |
| `services/social/blockService.ts` | User blocking logic | NOT STARTED |
| `services/moderation/reportService.ts` | Content reporting logic | NOT STARTED |
| `components/moderation/ReportModal.tsx` | Report content interface | NOT STARTED |
| `components/moderation/BlockConfirmation.tsx` | Block user confirmation | NOT STARTED |
| `hooks/useBlockedUsers.ts` | Blocked users state management | NOT STARTED |
| `app/admin/moderation.tsx` | Basic admin moderation panel | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `hooks/useFeed.ts` | Filter out blocked users' content | NOT STARTED |
| `components/content/PostCard.tsx` | Add report option to menu | NOT STARTED |
| `app/(drawer)/profile/[username].tsx` | Add block/unblock option | NOT STARTED |
| `components/engagement/sheets/CommentSheet.tsx` | Filter blocked users' comments | NOT STARTED |
| `app/(drawer)/settings/index.tsx` | Add blocked users menu item | NOT STARTED |

### Implementation Approach

1. **Database Schema** (from epic tracker):
   ```sql
   CREATE TABLE blocked_users (
     blocker_id uuid REFERENCES users(id),
     blocked_id uuid REFERENCES users(id),
     created_at timestamp DEFAULT now(),
     PRIMARY KEY(blocker_id, blocked_id)
   );

   CREATE TABLE reports (
     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     reporter_id uuid REFERENCES users(id),
     content_type text CHECK (content_type IN ('post', 'user', 'comment')),
     content_id uuid,
     reason text,
     created_at timestamp DEFAULT now()
   );
   ```

2. **Blocking System**:
   - Block from profile or post options
   - Immediately hide all content
   - Prevent all interactions both ways
   - Show in blocked users list
   - Allow unblocking

3. **Reporting System**:
   - Report categories: Spam, Inappropriate, Harassment, Other
   - One report per user per content
   - Auto-hide after 3 unique reports
   - Admin notification for review

4. **Content Filtering**:
   - Filter blocked users from:
     - Feed posts
     - Comments
     - Stories
     - Search results
     - Follow suggestions

**Key Technical Decisions**:
- Blocks are bidirectional (neither can see the other)
- Reports are anonymous to reported user
- Auto-hide is reversible by admin
- Blocked users can't be messaged (Epic 7)

### Dependencies & Risks
**Dependencies**:
- Database tables for blocks and reports
- Admin role system (basic for MVP)
- Content filtering in all queries

**Identified Risks**:
- Performance impact of filtering blocked users
- False reporting abuse
- Need for proper admin tools post-MVP

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
// services/social/blockService.ts
export async function blockUser(targetUserId: string) {
  // Purpose: Block a user
  // Returns: { success: boolean }
}

export async function unblockUser(targetUserId: string) {
  // Purpose: Unblock a user
  // Returns: { success: boolean }
}

// services/moderation/reportService.ts
export async function reportContent(
  contentType: 'post' | 'user' | 'comment',
  contentId: string,
  reason: string
) {
  // Purpose: Report content for moderation
  // Returns: { success: boolean, reportId: string }
}

// hooks/useBlockedUsers.ts
export function useBlockedUsers() {
  // Purpose: Manage blocked users list
  // Returns: { blockedUsers, blockUser, unblockUser, isBlocked }
}
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| POST | /blocks | `{ targetUserId: string }` | `{ success: boolean }` | PLANNED |
| DELETE | /blocks/:userId | - | `{ success: boolean }` | PLANNED |
| GET | /blocks | - | `{ blockedUsers: User[] }` | PLANNED |
| POST | /reports | `{ contentType, contentId, reason }` | `{ reportId: string }` | PLANNED |
| GET | /admin/reports | - | `{ reports: Report[] }` | PLANNED |

### State Management
- Blocked users cached globally
- Filter applied at query level
- Report counts tracked per content
- Auto-hide state in posts table

## Testing Performed

### Manual Testing
- [ ] Can block user from profile
- [ ] Can block user from post menu
- [ ] Blocked users' content hidden everywhere
- [ ] Can view and manage blocked list
- [ ] Can unblock users
- [ ] Reports submit successfully
- [ ] Auto-hide works after 3 reports
- [ ] Admin can see all reports

### Edge Cases Considered
- Block then unblock rapidly: Handle state correctly
- Report own content: Prevent self-reporting
- Already blocked user: Show appropriate state
- Multiple reports from same user: Count as one
- Blocking affects existing follows: Auto-unfollow

## Documentation Updates

- [ ] Blocking behavior documented
- [ ] Report categories documented
- [ ] Auto-hide threshold documented
- [ ] Admin moderation flow documented

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
- Blocking query performance
- Report spam prevention
- Admin panel security

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