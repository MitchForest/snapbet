# Sprint 02.04: User Settings & Profile Management Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: -  
**End Date**: -  
**Epic**: 02 - Authentication & User System

**Sprint Goal**: Build the user profile screen, settings management interface, and bankroll reset functionality, allowing users to view their stats and manage their account preferences.

**User Story Contribution**: 
- Enables user account management and preference customization
- Provides access to performance metrics and bankroll management

## Sprint Plan

### Objectives
1. Create user profile screen with stats display
2. Build settings screen with account preferences
3. Implement bankroll reset with confirmation
4. Add profile navigation from drawer/header
5. Enable favorite team change functionality

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `app/profile/[username].tsx` | Dynamic profile screen | NOT STARTED |
| `app/settings.tsx` | Settings management screen | NOT STARTED |
| `components/profile/ProfileHeader.tsx` | Avatar, username, stats header | NOT STARTED |
| `components/profile/StatsCard.tsx` | Win/loss, ROI, profit display | NOT STARTED |
| `components/profile/BankrollCard.tsx` | Current balance and reset option | NOT STARTED |
| `components/settings/SettingsSection.tsx` | Grouped settings UI | NOT STARTED |
| `components/settings/TeamPicker.tsx` | Change favorite team modal | NOT STARTED |
| `components/common/ConfirmDialog.tsx` | Reusable confirmation dialog | NOT STARTED |
| `services/api/resetBankroll.ts` | Bankroll reset API service | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `components/navigation/DrawerContent.tsx` | Add profile link and stats preview | NOT STARTED |
| `stores/slices/userSlice.ts` | Add settings update actions | NOT STARTED |
| `hooks/useUserStats.ts` | Create hook for user statistics | NOT STARTED |

### Implementation Approach
1. **Profile Screen Layout**:
   - Header with avatar + username + badges
   - Stats grid (W-L, Win%, ROI, Profit)
   - Current streak indicator
   - Bankroll section with balance
   - Tab selector (future: Picks/Performance)
   - Follow/Following counts

2. **Stats Display**:
   ```typescript
   interface UserStats {
     wins: number;
     losses: number;
     winRate: number; // percentage
     roi: number; // percentage
     profit: number; // dollars
     currentStreak: number;
     bankroll: number;
   }
   ```

3. **Settings Screen Sections**:
   - **Account Settings**:
     - Display name (future)
     - Bio (future)
     - Favorite team (changeable)
   - **Notification Settings**:
     - Tails/Fades toggle
     - Bet results toggle
     - Messages toggle
   - **Privacy Settings**:
     - Show bankroll publicly
     - Show win rate publicly
   - **Bankroll Management**:
     - Current balance display
     - Reset button with confirmation
   - **About**:
     - Version number
     - Terms of Service (future)
     - Sign out button

4. **Bankroll Reset Flow**:
   - Show current balance
   - Warning about history reset
   - Confirmation dialog
   - Reset to $1,000
   - Show success toast
   - Update local state

5. **Navigation Integration**:
   - Profile button in header → Own profile
   - Username in drawer → Own profile
   - Settings option in drawer
   - Other user profiles from feed

**Key Technical Decisions**:
- Use dynamic route for profiles ([username].tsx)
- Settings stored in user table JSONB
- Optimistic updates for settings changes
- Confirmation required for destructive actions
- Cache user stats with React Query

### Dependencies & Risks
**Dependencies**:
- User authentication complete
- Stats calculation functions
- User table with settings columns
- Reset bankroll RPC function

**Identified Risks**:
- Stats calculation performance: Use materialized view
- Settings sync issues: Implement retry logic
- Profile not found: Show 404 state

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
// ProfileHeader.tsx
interface ProfileHeaderProps {
  user: User;
  stats: UserStats;
  isOwnProfile: boolean;
  onFollow?: () => void;
}

// ConfirmDialog.tsx
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// resetBankroll.ts
resetUserBankroll(userId: string): Promise<ResetResult>
// Purpose: Reset bankroll to $1,000 and clear bet history
// Returns: New bankroll state and reset count

// useUserStats.ts
useUserStats(userId: string): UseQueryResult<UserStats>
// Purpose: Fetch and cache user statistics
// Used by: Profile screen
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| GET | /rest/v1/users?username=eq.{username} | - | User + stats | WORKING |
| PATCH | /rest/v1/users | Settings updates | User object | WORKING |
| POST | /rest/v1/rpc/reset_bankroll | `{user_id}` | Reset result | WORKING |
| GET | /rest/v1/user_stats | Query by user_id | Stats object | WORKING |

### State Management
- Current user profile (Zustand)
- User settings (Zustand + API)
- Viewed profile (React Query)
- Settings form state (local)

## Testing Performed

### Manual Testing
- [ ] Own profile displays correctly
- [ ] Stats calculate accurately
- [ ] Other user profiles load
- [ ] Settings screen renders all sections
- [ ] Toggle switches work
- [ ] Team change modal functions
- [ ] Bankroll reset shows confirmation
- [ ] Reset actually resets to $1,000
- [ ] Sign out works correctly
- [ ] Navigation from drawer works

### Edge Cases Considered
- Profile not found: Show 404 state
- Stats calculation errors: Show fallback values
- Network failure on settings: Show error, allow retry
- Concurrent settings updates: Last write wins
- Invalid username in URL: Redirect to 404

## Documentation Updates

- [ ] Profile screen navigation documented
- [ ] Settings structure documented
- [ ] Bankroll reset flow documented
- [ ] Stats calculation logic documented

## Handoff to Reviewer

### What Was Implemented
[Clear summary of all work completed]

### Files Modified/Created
**Created**:
- `[file1.tsx]` - [Purpose]
- `[file2.tsx]` - [Purpose]

**Modified**:
- `[file3.tsx]` - [What changed and why]

### Key Decisions Made
1. [Decision]: [Rationale and impact]

### Deviations from Original Plan
- [Any deviations with justification]

### Known Issues/Concerns
- [Any issues the reviewer should know about]

### Suggested Review Focus
- Profile data accuracy
- Settings persistence
- Bankroll reset safety
- Navigation flow correctness

**Sprint Status**: READY FOR REVIEW

---

## Reviewer Section

**Reviewer**: R persona  
**Review Date**: -

### Review Checklist
- [ ] Profile displays all required data
- [ ] Stats are calculated correctly
- [ ] Settings changes persist
- [ ] Bankroll reset works safely
- [ ] Navigation is intuitive
- [ ] Error states handled

### Review Outcome

**Status**: APPROVED | NEEDS REVISION

### Feedback
[Specific feedback if revision needed]

### Post-Review Updates
[Track changes made in response to review]

---

## Sprint Metrics

**Duration**: Planned 3 hours | Actual - hours  
**Scope Changes**: 0  
**Review Cycles**: -  
**Files Touched**: -  
**Lines Added**: ~-  
**Lines Removed**: ~-

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: -*  
*Sprint Completed: -*  
*Final Status: NOT STARTED* 