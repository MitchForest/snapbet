# Sprint 04.08: Referral Rewards Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 4 - Feed & Social Engagement

**Sprint Goal**: Implement the $100 weekly bankroll bonus per referral system, including reward calculation, bankroll updates, deep linking support, and referral statistics display.

**User Story Contribution**: 
- Supports viral growth through incentivized referrals
- Creates sustainable user acquisition mechanism

## Sprint Plan

### Objectives
1. Add referral_bonus column to bankrolls table
2. Implement $100 weekly bonus per referral
3. Update bankroll reset logic to include bonuses
4. Create referral statistics display
5. Add deep link support for referral codes
6. Show referral count and bonus in profile
7. Update invite screen with reward info
8. Track referral conversion metrics

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `services/referral/referralRewardService.ts` | Referral reward calculations | NOT STARTED |
| `components/referral/ReferralBonusDisplay.tsx` | Show bonus amount in bankroll | NOT STARTED |
| `components/referral/ReferralStatsCard.tsx` | Enhanced stats with rewards | NOT STARTED |
| `hooks/useReferralRewards.ts` | Referral rewards state | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `services/referral/referralService.ts` | Add reward tracking logic | NOT STARTED |
| `app/(drawer)/invite.tsx` | Show reward information prominently | NOT STARTED |
| `components/profile/ProfileHeader.tsx` | Display referral bonus if any | NOT STARTED |
| `services/badges/badgeResetService.ts` | Include referral bonus in weekly reset | NOT STARTED |
| `app/_layout.tsx` | Handle deep links for referral codes | NOT STARTED |

### Implementation Approach

1. **Database Update**:
   ```sql
   -- Already in epic tracker
   ALTER TABLE bankrolls ADD COLUMN
     referral_bonus integer DEFAULT 0; -- in cents
   ```

2. **Reward Calculation**:
   ```typescript
   // Weekly bankroll = base + (referrals * bonus)
   const calculateWeeklyBankroll = (referralCount: number) => {
     const BASE_BANKROLL = 100000; // $1,000 in cents
     const REFERRAL_BONUS = 10000;  // $100 in cents
     return BASE_BANKROLL + (referralCount * REFERRAL_BONUS);
   };
   ```

3. **Deep Link Handling**:
   - URL format: `snapbet://invite/[CODE]`
   - Web fallback: `https://snapbet.app/invite/[CODE]`
   - Store code during onboarding
   - Apply after first bet (future)

4. **Display Updates**:
   - Bankroll: "$1,100 ($100 referral bonus)"
   - Profile: "3 referrals • +$300/week"
   - Invite: "Earn $100 weekly for each friend"

**Key Technical Decisions**:
- Bonuses are permanent (not one-time)
- Apply to weekly reset, not immediate
- Track but don't reward until Epic 5 (betting)
- Show potential rewards to incentivize

### Dependencies & Risks
**Dependencies**:
- Existing referral tracking from Epic 2
- Bankroll system from Epic 2
- Deep linking setup for mobile

**Identified Risks**:
- Referral fraud potential (track for patterns)
- Bankroll inflation if too successful
- Deep link configuration complexity

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
// services/referral/referralRewardService.ts
export async function calculateReferralBonus(userId: string) {
  // Purpose: Calculate total referral bonus for user
  // Returns: { referralCount: number, bonusAmount: number }
}

export async function applyReferralBonus(userId: string) {
  // Purpose: Apply referral bonus to user's bankroll
  // Returns: { newBankroll: number, bonusApplied: number }
}

// hooks/useReferralRewards.ts
export function useReferralRewards() {
  // Purpose: Track referral rewards and stats
  // Returns: { referralCount, weeklyBonus, totalEarned, nextResetDate }
}
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| GET | /referrals/rewards | - | `{ referralCount, weeklyBonus, totalEarned }` | PLANNED |
| POST | /referrals/apply-bonus | - | `{ success: boolean, newBankroll: number }` | PLANNED |

### State Management
- Referral bonus in bankroll state
- Referral count cached
- Deep link code in AsyncStorage
- Reward stats in profile

## Testing Performed

### Manual Testing
- [ ] Referral bonus calculates correctly
- [ ] Weekly reset includes bonus
- [ ] Deep links work on iOS
- [ ] Deep links work on Android
- [ ] Invite screen shows rewards
- [ ] Profile shows bonus amount
- [ ] Stats update in real-time

### Edge Cases Considered
- User with 0 referrals: Show base bankroll
- User with many referrals: Cap display
- Invalid referral code: Show error
- Self-referral attempt: Prevent
- Referral after betting starts: Queue for next week

## Documentation Updates

- [ ] Referral reward system documented
- [ ] Deep link setup documented
- [ ] Bankroll calculation formula documented
- [ ] Anti-fraud measures documented

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
- Reward calculation accuracy
- Deep link handling
- Fraud prevention measures

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