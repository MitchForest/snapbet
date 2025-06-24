# Sprint 02.03: Team Selection & Follow Initialization Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: -  
**End Date**: -  
**Epic**: 02 - Authentication & User System

**Sprint Goal**: Build the favorite team selection screen and follow suggestions interface, ensuring users select a team (optional) and follow at least 3 accounts to populate their initial feed.

**User Story Contribution**: 
- Enables personalized content recommendations and initial social graph

## Sprint Plan

### Objectives
1. Create team selection screen with visual team cards
2. Build follow suggestions screen with mock users
3. Implement minimum follow requirement (3 users)
4. Initialize user's bankroll to $1,000
5. Complete onboarding flow navigation

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `app/(auth)/onboarding/team.tsx` | Team selection screen | NOT STARTED |
| `app/(auth)/onboarding/follow.tsx` | Follow suggestions screen | NOT STARTED |
| `components/auth/TeamCard.tsx` | Individual team selection card | NOT STARTED |
| `components/auth/TeamSelector.tsx` | Sport toggle and grid layout | NOT STARTED |
| `components/auth/FollowCard.tsx` | User suggestion card with stats | NOT STARTED |
| `data/teams.ts` | NFL and NBA team data | NOT STARTED |
| `services/api/followUser.ts` | Follow/unfollow API service | NOT STARTED |
| `utils/onboarding/suggestions.ts` | Algorithm for user suggestions | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `stores/slices/userSlice.ts` | Add favorite team update | NOT STARTED |
| `services/api/initializeBankroll.ts` | Create bankroll initialization | NOT STARTED |
| `app/(auth)/_layout.tsx` | Add onboarding flow navigation | NOT STARTED |

### Implementation Approach
1. **Team Selection Screen**:
   - "Pick your favorite team" heading
   - NFL/NBA toggle buttons
   - 4-column grid of team cards
   - Team cards show logo + team colors
   - Skip button (text link at bottom)
   - Continue button (always enabled)
   - Progress indicator (Step 2 of 3)

2. **Team Data Structure**:
   ```typescript
   interface Team {
     id: string; // 'LAL', 'KC', etc.
     name: string;
     city: string;
     sport: 'nfl' | 'nba';
     primaryColor: string;
     secondaryColor: string;
     logoUrl: string; // Or use SVG components
   }
   ```

3. **Follow Suggestions Screen**:
   - "Follow some bettors" heading
   - List of 10 mock user cards
   - Each card shows:
     - Avatar + username
     - Key stats (record, profit)
     - Personality indicator
     - Follow/Following button
   - Continue button (disabled until 3+ follows)
   - Progress indicator (Step 3 of 3)

4. **Suggestion Algorithm**:
   - 2-3 users who like same team (if team selected)
   - 2-3 high performers (good ROI)
   - 1-2 entertainment accounts (fade material)
   - Random selection from remaining
   - Ensure diversity of betting styles

5. **Onboarding Completion**:
   - Initialize bankroll to $1,000
   - Mark onboarding complete
   - Navigate to main app (feed)
   - Show success toast

**Key Technical Decisions**:
- Team selection is optional (can skip)
- Minimum 3 follows enforced in UI
- Use optimistic updates for follow actions
- Pre-load mock users for instant display
- Simple team logo approach (SVG or stored images)

### Dependencies & Risks
**Dependencies**:
- Username set (Sprint 02.02)
- Mock users created (Epic 1 Sprint 01.03)
- Follow table and RLS policies
- Bankroll initialization function

**Identified Risks**:
- Mock users not created yet: Have fallback data
- Team logos/assets: Use simple colored circles initially
- Follow API failures: Retry with exponential backoff

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
// TeamCard.tsx
interface TeamCardProps {
  team: Team;
  selected: boolean;
  onPress: (teamId: string) => void;
}

// FollowCard.tsx
interface FollowCardProps {
  user: MockUser;
  isFollowing: boolean;
  onToggle: (userId: string) => void;
}

// suggestions.ts
generateFollowSuggestions(favoriteTeam?: string): MockUser[]
// Purpose: Generate personalized follow suggestions
// Returns: Array of 10 suggested users

// initializeBankroll.ts
initializeUserBankroll(userId: string): Promise<Bankroll>
// Purpose: Create initial $1,000 bankroll
// Used by: Onboarding completion
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| PATCH | /rest/v1/users | `{favorite_team: string}` | User object | WORKING |
| POST | /rest/v1/follows | `{follower_id, following_id}` | Follow object | WORKING |
| DELETE | /rest/v1/follows | Query params | 204 | WORKING |
| POST | /rest/v1/rpc/initialize_bankroll | `{user_id}` | Bankroll object | WORKING |

### State Management
- Selected team (local state)
- Following set (local state)
- Follow count for button enable
- Loading states for API calls

## Testing Performed

### Manual Testing
- [ ] Team selection screen renders
- [ ] Sport toggle works correctly
- [ ] Team cards display properly
- [ ] Team selection highlights
- [ ] Skip button navigates forward
- [ ] Follow suggestions load
- [ ] Follow/unfollow toggles work
- [ ] Minimum 3 follows enforced
- [ ] Continue button enables at 3
- [ ] Bankroll initializes correctly
- [ ] Navigation to feed works

### Edge Cases Considered
- No team selected: Allow progression
- API failure on follow: Show error, allow retry
- Duplicate follow attempts: Prevent in UI
- Slow network: Show loading states
- Back navigation: Preserve selections

## Documentation Updates

- [ ] Team data structure documented
- [ ] Follow suggestion algorithm documented
- [ ] Onboarding flow completion documented
- [ ] Bankroll initialization documented

## Handoff to Reviewer

### What Was Implemented
[Clear summary of all work completed]

### Files Modified/Created
**Created**:
- `[file1.tsx]` - [Purpose]
- `[file2.tsx]` - [Purpose]

**Modified**:
- `[file3.ts]` - [What changed and why]

### Key Decisions Made
1. [Decision]: [Rationale and impact]

### Deviations from Original Plan
- [Any deviations with justification]

### Known Issues/Concerns
- [Any issues the reviewer should know about]

### Suggested Review Focus
- Team selection UX flow
- Follow minimum enforcement
- Suggestion algorithm quality
- Error handling completeness

**Sprint Status**: READY FOR REVIEW

---

## Reviewer Section

**Reviewer**: R persona  
**Review Date**: -

### Review Checklist
- [ ] Team selection is intuitive
- [ ] Follow suggestions are diverse
- [ ] Minimum follows properly enforced
- [ ] Bankroll initialization works
- [ ] Navigation flow is smooth
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