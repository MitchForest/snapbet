# Sprint 03.00: Profile & Badge Catchup Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: 03 - Camera & Content Creation

**Sprint Goal**: Implement the 8 weekly badges system with automatic calculations and weekly resets to enable effect tier gating.

**User Story Contribution**: 
- Enables badge-gated effects for Story 1: Social Pick Sharing
- Creates dynamic weekly achievements for Story 5: Performance Tracking

## Sprint Plan

### Objectives
1. Replace existing badge system with 8 weekly badges
2. Implement weekly reset logic (every Monday)
3. Connect badge count to effect gating system
4. Update profile to display weekly badges

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `data/weeklyBadges.ts` | Define 8 weekly badge configurations | NOT STARTED |
| `services/badges/weeklyBadgeService.ts` | Weekly badge calculation logic | NOT STARTED |
| `services/badges/badgeResetService.ts` | Monday reset automation | NOT STARTED |
| `components/badges/WeeklyBadgeGrid.tsx` | Display component for profile | NOT STARTED |
| `supabase/migrations/009_weekly_badges.sql` | DB migration for new badge system | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `data/badges.ts` | Remove old badges, add weekly badge definitions | NOT STARTED |
| `services/badges/badgeService.ts` | Replace with weekly calculation logic | NOT STARTED |
| `components/profile/ProfileHeader.tsx` | Update to show weekly badges | NOT STARTED |
| `components/common/BadgeDisplay.tsx` | Support weekly badge display | NOT STARTED |
| `stores/authStore.ts` | Add badge count to global state | NOT STARTED |
| `hooks/useEffects.ts` | Connect to global badge count | NOT STARTED |
| `components/effects/EffectSelector.tsx` | Use badge count for gating | NOT STARTED |

### Implementation Approach

**Phase 1: Database Migration**
1. Add `weekly_reset_at` to user_badges table
2. Add `week_start_date` to track weekly periods
3. Create indexes for efficient weekly queries
4. Add RLS policies for badge access

**Phase 2: Badge Definitions**
```typescript
// The 8 Weekly Badges
export const WEEKLY_BADGES = {
  HOT_RIGHT_NOW: {
    id: 'hot_right_now',
    emoji: '🔥',
    name: 'Hot Right Now',
    description: 'Won last 3+ picks this week',
    calculation: 'current_week_streak >= 3'
  },
  WEEKS_PROFIT_KING: {
    id: 'weeks_profit_king',
    emoji: '💰',
    name: "Week's Profit King",
    description: 'Up the most this week',
    calculation: 'highest_weekly_profit'
  },
  RIDING_THE_WAVE: {
    id: 'riding_the_wave',
    emoji: '🌊',
    name: 'Riding the Wave',
    description: 'Others profiting from your picks this week',
    calculation: 'tail_profit_generated > 0'
  },
  THIS_WEEKS_SHARP: {
    id: 'this_weeks_sharp',
    emoji: '🎯',
    name: "This Week's Sharp",
    description: '70%+ win rate (min 5 bets)',
    calculation: 'weekly_win_rate >= 0.7 AND weekly_bet_count >= 5'
  },
  FADE_GOD: {
    id: 'fade_god',
    emoji: '🎪',
    name: 'Fade God',
    description: 'People made money fading you this week',
    calculation: 'fade_profit_generated > 0'
  },
  MOST_ACTIVE: {
    id: 'most_active',
    emoji: '⚡',
    name: 'Most Active',
    description: 'Posted 10+ picks this week',
    calculation: 'weekly_pick_count >= 10'
  },
  GHOST: {
    id: 'ghost',
    emoji: '👻',
    name: 'Ghost',
    description: "Haven't posted in 3+ days",
    calculation: 'days_since_last_post >= 3'
  },
  SUNDAY_SWEEP: {
    id: 'sunday_sweep',
    emoji: '🏆',
    name: 'Sunday Sweep',
    description: 'Perfect NFL Sunday',
    calculation: 'perfect_nfl_sunday'
  }
};
```

**Phase 3: Calculation Service**
- Query bets from current week (Monday to Sunday)
- Calculate each badge condition
- Handle special cases (Profit King needs comparison)
- Store results in user_badges with expiration

**Phase 4: Reset Service**
- Run every Monday at midnight
- Mark all badges as `lost_at = NOW()`
- Trigger recalculation for all active users
- Send notifications about new week

**Phase 5: UI Integration**
- Update ProfileHeader to show weekly badges
- Add animations for newly earned badges
- Show "expires in X days" on badges
- Connect badge count to Zustand store

**Key Technical Decisions**:
- **Weekly Definition**: Monday 00:00 to Sunday 23:59 (user's timezone)
- **Calculation Timing**: On-demand when profile viewed + hourly batch
- **Reset Mechanism**: Soft delete with lost_at timestamp
- **Performance**: Cache badge count in Zustand for effect gating

### Dependencies & Risks
**Dependencies**:
- Existing user_badges table structure
- Betting history for calculations
- Tail/fade data (may need to mock for now)

**Identified Risks**:
- **Performance**: Weekly calculations for all users could be slow
  - Mitigation: Index key fields, paginate batch updates
- **Timezone Handling**: Users in different timezones
  - Mitigation: Store calculations in UTC, display in local time
- **Data Availability**: Tail/fade profit not tracked yet
  - Mitigation: Implement basic version, enhance in Epic 5

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

### Badge Calculation Function
```typescript
async function calculateWeeklyBadges(userId: string): Promise<string[]> {
  const weekStart = getWeekStart(); // Monday 00:00
  const badges: string[] = [];
  
  // Get user's weekly stats
  const stats = await getWeeklyStats(userId, weekStart);
  
  // Check each badge condition
  if (stats.currentStreak >= 3) badges.push('hot_right_now');
  if (stats.winRate >= 0.7 && stats.betCount >= 5) badges.push('this_weeks_sharp');
  // ... etc
  
  return badges;
}
```

### Global Badge Count State
```typescript
// In authStore
interface AuthState {
  // ... existing fields
  weeklyBadgeCount: number;
  setWeeklyBadgeCount: (count: number) => void;
}
```

## Testing Performed

### Manual Testing
- [ ] Profile shows weekly badges correctly
- [ ] Badge calculations are accurate
- [ ] Weekly reset works on Monday
- [ ] Effect gating respects badge count
- [ ] Animations play on badge earn

### Edge Cases Considered
- User with no bets this week
- User joins mid-week
- Multiple users tied for "Profit King"
- Time zone edge cases

## Documentation Updates

- [ ] Update badge documentation with weekly system
- [ ] Document calculation logic
- [ ] Add weekly reset explanation
- [ ] Update effect gating docs

## Handoff to Reviewer

### What Will Be Implemented
- Complete replacement of badge system with 8 weekly badges
- Automatic weekly reset every Monday
- Badge count globally available for effect gating
- Profile display of current week's badges
- Database migration for weekly tracking

### Success Criteria
- All 8 badges calculate correctly
- Weekly reset happens automatically
- Badge count gates effects properly
- Profile shows badges with animations
- No performance degradation

### Testing Instructions
1. Run migration to update badge tables
2. Trigger badge calculation for test user
3. Verify badges appear in profile
4. Check effect gating with 0, 1, and 3+ badges
5. Test Monday reset logic

**Sprint Status**: NOT STARTED

---

## Reviewer Section

**Reviewer**: [R persona]  
**Review Date**: [TBD]

### Review Checklist
- [ ] Weekly badge logic is correct
- [ ] Database migration is safe
- [ ] Performance is acceptable
- [ ] UI updates are smooth
- [ ] Effect gating works properly

### Review Outcome

**Status**: [TBD]

---

*Sprint Created: 2025-01-20*  
*Sprint Started: [TBD]*  
*Sprint Completed: [TBD]* 