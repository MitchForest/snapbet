# Sprint 05.08: Cleanup & Epic Completion Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 5 - Complete Betting System with Tail/Fade

**Sprint Goal**: Complete all remaining betting features, fix ALL lint/TypeScript errors across the entire codebase, and ensure the betting system is fully integrated and production-ready.

**User Story Contribution**: 
- Completes Story 1 (Credibility Problem) with bet history and stats
- Finalizes all betting integration points

## 🚨 Critical Requirements

This is the FINAL sprint of Epic 5. By the end of this sprint:
- **ZERO ESLint errors or warnings** (entire codebase)
- **ZERO TypeScript errors** (entire codebase)
- **ALL betting features fully functional**
- **ALL integration points connected**
- **NO TODOs or incomplete features**

## Sprint Plan

### Part 0: Database & Type Synchronization (1 hour) 🚨 CRITICAL

#### Objectives
1. Ensure all migrations are applied to database
2. Regenerate TypeScript types from database
3. Fix any type mismatches
4. Verify all tables and functions exist

#### Tasks
- [ ] Run all pending migrations
- [ ] Generate fresh types with `bun run generate-types`
- [ ] Update any code that breaks from new types
- [ ] Verify RPC functions are typed correctly
- [ ] Check all JSONB fields are properly typed

#### Commands to Run
```bash
# Apply all migrations
bun run db:migrate

# Generate fresh types
bun run generate-types

# Verify database state
bun run db:status

# Check for missing RPC functions
psql $DATABASE_URL -c "\df place_bet_with_bankroll_check"
psql $DATABASE_URL -c "\df settle_game_bets"
psql $DATABASE_URL -c "\df reset_bankroll"
```

#### Expected Tables/Functions
- Tables: users, posts, bets, games, bankrolls, pick_actions, etc.
- RPC Functions: place_bet_with_bankroll_check, settle_game_bets, reset_bankroll, etc.
- New columns: weekly_deposit, stats_metadata, etc.

#### Known Database Issues
- [ ] Duplicate 015 migration files (015_add_referral_bonus.sql and 015_add_moderation_tables.sql)
- [ ] Need to rename one to 015a or merge them
- [ ] Verify all betting-related migrations are applied
- [ ] Check for any missing indexes on foreign keys

### Part 1: Bet History & Stats Implementation (2 hours)

#### Objectives
1. Create bet management screen with tabs
2. Show active bets with live scores
3. Display settled bet history
4. Calculate and show performance stats
5. Add Share Result buttons to settled bets

#### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `app/(drawer)/bets.tsx` | Bet management screen | NOT STARTED |
| `components/betting/BetCard.tsx` | Individual bet display | NOT STARTED |
| `components/betting/BetsList.tsx` | List of bets component | NOT STARTED |
| `components/betting/BetStats.tsx` | Performance stats display | NOT STARTED |
| `hooks/useBetHistory.ts` | Bet history data hook | NOT STARTED |

#### Implementation Details
```typescript
// Bet History Screen Structure
interface BetManagementScreen {
  tabs: ['Active', 'History'];
  activeBets: {
    showLiveScores: true;
    showPotentialPayout: true;
    refreshInterval: 30000; // 30 seconds
  };
  history: {
    limit: 20; // Last 20 bets
    showOutcome: true;
    showShareButton: true;
  };
  stats: {
    weekly: {
      record: 'W-L';
      roi: 'percentage';
      profitLoss: 'dollars';
    };
    allTime: {
      totalBets: number;
      record: 'W-L';
      roi: 'percentage';
    };
  };
}
```

### Part 2: Fix ALL TypeScript Errors (1.5 hours)

#### Current TypeScript Errors to Fix
1. **Camera Props** (`app/(drawer)/camera/index.tsx`)
   - Add `pendingBet` and `suggestedEffects` to CameraScreenProps
   - Add `suggestedCaption` to MediaPreviewProps

2. **Bottom Sheet Import** (`components/betting/TailFadeSheet.tsx`)
   - Install `@gorhom/bottom-sheet` package
   - Or refactor to use BaseSheet pattern

3. **Overlay Props** (`components/overlays/OverlayContainer.tsx`)
   - Update PickOverlay and OutcomeOverlay interfaces
   - Add betData prop types

4. **Stats Metadata** (`services/betting/bankrollService.ts`)
   - Fix Json type casting issue
   - Update type definitions

5. **Any New Type Errors from Database Sync**
   - Fix any errors that arise from regenerated types
   - Update interfaces to match database schema
   - Ensure all RPC calls are properly typed

### Part 3: Fix ALL ESLint Warnings (2 hours)

#### Categories of Warnings to Fix
1. **Inline Styles** (22 warnings)
   - Convert all inline styles to StyleSheet objects
   - Use Tamagui props where applicable

2. **Color Literals** (15 warnings)
   - Import Colors from theme
   - Use opacity constants from theme

3. **React Hooks Dependencies** (8 warnings)
   - Add missing dependencies
   - Use useCallback where appropriate

#### Systematic Approach
```typescript
// Before (inline style)
<View style={{ flex: 1, padding: 20 }}>

// After (StyleSheet)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  }
});
<View style={styles.container}>

// Or with Tamagui
<YStack f={1} p="$5">
```

### Part 4: Complete Missing Integrations (1 hour)

#### Integration Checklist
1. **Database Integration**
   - [ ] Verify all migrations are applied
   - [ ] Ensure RPC functions work correctly
   - [ ] Test database triggers and functions
   - [ ] Verify indexes for performance

2. **Bankroll Management**
   - [ ] Fix issues from Sprint 05.05 NEEDS_REVISION
   - [ ] Ensure weekly reset works
   - [ ] Test referral bonuses
   - [ ] Verify stats_metadata updates

3. **Navigation Integration**
   - [ ] Add bets screen to drawer navigation
   - [ ] Ensure all betting flows are accessible

4. **Post Integration**
   - [ ] Verify pick posts show tail/fade buttons
   - [ ] Test outcome post creation
   - [ ] Ensure bet data loads in feed

### Part 5: Final Testing & Polish (30 minutes)

#### Comprehensive Testing
1. **End-to-End Flows**
   - [ ] Place bet → Share pick → Others tail/fade
   - [ ] Settle bet → Share outcome
   - [ ] View bet history and stats
   - [ ] Weekly bankroll reset

2. **Edge Cases**
   - [ ] Minimum bet ($5)
   - [ ] Maximum bet (entire bankroll)
   - [ ] Concurrent bets
   - [ ] Game expiration

3. **Performance**
   - [ ] 60 FPS on games list
   - [ ] Smooth sheet animations
   - [ ] Fast navigation

## Implementation Priority

### Phase 0: Database Sync (FIRST - BLOCKING)
Ensure database and types are in sync:
1. Apply all pending migrations
2. Regenerate TypeScript types
3. Fix any breaking changes from new types
4. Verify all database objects exist

### Phase 1: TypeScript Fixes
Fix all TypeScript errors to unblock development:
1. Install @gorhom/bottom-sheet or refactor
2. Update camera component interfaces
3. Fix overlay props
4. Resolve Json type issues
5. Fix any new errors from type regeneration

### Phase 2: Bet History Implementation
Complete the final betting feature:
1. Create bet management screen
2. Implement active/history tabs
3. Add performance stats
4. Integrate Share Result buttons

### Phase 3: ESLint Cleanup
Systematic cleanup of all warnings:
1. Fix inline styles file by file
2. Replace color literals with theme imports
3. Add missing hook dependencies
4. Run `bun run lint --fix` after each file

### Phase 4: Integration & Testing
Ensure everything works together:
1. Test all betting flows
2. Verify integrations
3. Fix any remaining issues
4. Final quality check

## Quality Standards

### Pre-Handoff Checklist
- [ ] Database fully migrated and in sync
- [ ] Types regenerated and up to date
- [ ] `bun run lint` - 0 errors, 0 warnings
- [ ] `bun run typecheck` - 0 errors
- [ ] All betting features implemented
- [ ] All integrations working
- [ ] Manual testing complete
- [ ] No console errors/warnings
- [ ] No TODO comments

### Definition of Done
The betting system is complete when:
1. Users can browse games and place bets
2. Tail/fade mechanics work on all pick posts
3. Bankroll management with weekly resets functions
4. Settlement updates scores and outcomes
5. Pick/outcome sharing works seamlessly
6. Bet history shows with accurate stats
7. ZERO errors or warnings in the codebase

## Files to Modify for Cleanup

### High Priority Files (Most Warnings)
1. `components/profile/ProfileHeader.tsx` - 3 warnings
2. `components/story/StoryControls.tsx` - 3 warnings
3. `components/effects/EffectSelector.tsx` - 4 warnings
4. `hooks/useStoryViewer.ts` - 7 warnings

### TypeScript Error Files
1. `app/(drawer)/camera/index.tsx`
2. `components/betting/TailFadeSheet.tsx`
3. `components/overlays/OverlayContainer.tsx`
4. `services/betting/bankrollService.ts`

## Testing Checklist

### Manual Testing
- [ ] Place all bet types (spread, total, ML)
- [ ] Tail and fade picks work
- [ ] Bankroll updates correctly
- [ ] Weekly reset triggers Monday
- [ ] Settlement calculates properly
- [ ] Pick posts expire at game time
- [ ] Outcome posts show results
- [ ] Bet history displays correctly
- [ ] Stats calculate accurately

### Integration Testing
- [ ] Feed shows pick posts with buttons
- [ ] Camera creates pick/outcome posts
- [ ] Profile shows betting badges
- [ ] Navigation includes bet screen

## Documentation Updates

- [ ] Update README with betting features
- [ ] Document all betting flows
- [ ] Add troubleshooting guide
- [ ] Update API documentation

## Handoff Checklist

### What Was Implemented
[To be completed during implementation]

### Files Modified/Created
[To be completed during implementation]

### Key Decisions Made
[To be completed during implementation]

### Known Issues/Concerns
[To be completed during implementation]

**Sprint Status**: NOT STARTED

---

## Reviewer Section

**Reviewer**: [R persona]  
**Review Date**: [Date]

### Review Checklist
- [ ] Zero lint errors/warnings
- [ ] Zero TypeScript errors
- [ ] All betting features work
- [ ] Integrations complete
- [ ] Performance acceptable
- [ ] Code quality excellent

### Review Outcome

**Status**: [PENDING]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [Status]* 