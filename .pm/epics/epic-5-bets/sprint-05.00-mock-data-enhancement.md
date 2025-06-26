# Sprint 05.00: Mock Data Enhancement Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 5 - Complete Betting System with Tail/Fade

**Sprint Goal**: Enhance existing mock users with realistic betting data, create comprehensive game schedules, and establish social betting relationships to demonstrate the full betting experience.

**User Story Contribution**: 
- Enables demonstration of Story 1 (Credibility Problem) with realistic bet history
- Sets up data for Story 4 (Isolation Problem) with tail/fade relationships

## 🚨 Required Development Practices

### Database Management
- **Use Supabase MCP** to inspect current database state
- **Keep types synchronized**: Run type generation after ANY schema changes
- **Migration files required**: Every database change needs a migration file
- **Test migrations**: Ensure migrations run cleanly on fresh database

### Code Quality
- **Zero tolerance**: No lint errors, no TypeScript errors
- **Type safety**: No `any` types without explicit justification
- **Run before handoff**: `bun run lint && bun run typecheck`

## Sprint Plan

### Objectives
1. Add 30 days of historical betting data for all mock users
2. Generate realistic NFL and NBA game schedules with proper odds
3. Create pick posts and tail/fade relationships between mock users
4. Update user stats and badges based on betting performance
5. Seed group chat messages about betting

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `scripts/data/mock-betting-history.ts` | Generate historical bets for users | NOT STARTED |
| `scripts/enhance-mock-betting.ts` | Main script to run all enhancements | NOT STARTED |
| `supabase/migrations/016_betting_indexes.sql` | Add performance indexes | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `scripts/data/mock-games.ts` | Add NFL games, enhance odds generation | NOT STARTED |
| `scripts/data/mock-users.ts` | Ensure betting personalities are used | NOT STARTED |
| `scripts/seed-mock-data.ts` | Integrate new betting data generation | NOT STARTED |
| `types/database.ts` | Add any missing betting types | NOT STARTED |

### Implementation Approach

1. **Betting History Generation**:
   - Create bets for past 30 days based on personality types
   - Sharp Bettors: 58% win rate, focus on value plays
   - Square Bettors: 48% win rate, popular teams/overs
   - Fade Material: 38% win rate, consistently bad picks
   - Homer: 45% win rate, worse on their favorite team
   - Parlay Degen: 12% win rate, multiple leg bets

2. **Game Schedule Enhancement**:
   - NFL: Sunday 1pm/4pm, Monday/Thursday nights
   - NBA: Daily games with realistic scheduling
   - Proper odds based on spreads (-110 standard juice)
   - Some completed games for history

3. **Social Activity**:
   - Pick posts for recent bets (last 7 days)
   - Tail/fade relationships (popular users get more tails)
   - Comments on pick posts ("Let's ride!", "Fading this")
   - Group chat messages about games/bets

4. **Stats & Badges Update**:
   - Calculate actual win/loss records
   - Update bankroll history
   - Award appropriate weekly badges
   - Set up referral relationships

**Key Technical Decisions**:
- Use deterministic randomness (seeded) for reproducible data
- Ensure temporal consistency (bets match game times)
- Maintain realistic betting patterns per personality

### Dependencies & Risks
**Dependencies**:
- Existing mock users with personalities
- Games table structure
- Bets and pick_actions tables

**Identified Risks**:
- Data volume might slow down dev environment
- Need to ensure consistency across related tables

## Implementation Log

### Day-by-Day Progress
**[Date]**:
- Started: [What was begun]
- Completed: [What was finished]
- Blockers: [Any issues]
- Decisions: [Any changes to plan]

### Reality Checks & Plan Updates
[To be filled during implementation]

### Code Quality Checks

**Linting Results**:
- [ ] Initial run: [X errors, Y warnings]
- [ ] Final run: 0 errors, 0 warnings

**Type Checking Results**:
- [ ] Initial run: [X errors]
- [ ] Final run: 0 errors

## Key Code Additions

### New Functions/Components
```typescript
// generateBettingHistory(user, personality, days)
// Purpose: Creates realistic bet history based on personality
// Returns: Array of bet records

// generatePickPosts(bets, user)
// Purpose: Creates pick posts for recent bets
// Returns: Array of post records

// createTailFadeRelationships(posts)
// Purpose: Establishes social betting connections
// Returns: Array of pick_action records
```

### Data Structures
```typescript
interface BettingPersonalityConfig {
  winRate: number;
  favoriteTypes: BetType[];
  stakePattern: 'conservative' | 'aggressive' | 'variable';
  teamPreferences?: string[];
  avoidancePatterns?: string[];
}
```

## Testing Performed

### Manual Testing
- [ ] Mock users have 50+ bets each
- [ ] Win rates match personality types
- [ ] Games have realistic odds/schedules
- [ ] Pick posts appear in feed
- [ ] Tail/fade relationships work
- [ ] Stats calculate correctly
- [ ] Badges award properly

### Data Validation
- [ ] No orphaned bets (all reference valid games)
- [ ] Bet times match game times
- [ ] Bankroll history is consistent
- [ ] No duplicate tail/fade actions

## Documentation Updates

- [ ] Update README with new mock data details
- [ ] Document personality betting patterns
- [ ] Add examples of generated data

## Handoff to Reviewer

### What Was Implemented
[To be completed at handoff]

### Files Modified/Created
[To be completed at handoff]

### Key Decisions Made
[To be completed at handoff]

### Known Issues/Concerns
[To be completed at handoff]

**Sprint Status**: NOT STARTED

---

## Reviewer Section

**Reviewer**: [R persona]  
**Review Date**: [Date]

### Review Checklist
- [ ] Mock data is realistic and varied
- [ ] Betting patterns match personalities
- [ ] No data inconsistencies
- [ ] Performance is acceptable
- [ ] Code follows patterns

### Review Outcome

**Status**: [APPROVED | NEEDS REVISION]

### Feedback
[Specific feedback if revision needed]

---

## Sprint Metrics

**Duration**: Planned 1.5 hours | Actual [Y] hours  
**Files Touched**: [Count]  
**Mock Records Created**: ~2000 bets, ~100 games, ~200 pick posts

---

*Sprint Started: TBD*  
*Sprint Completed: TBD*  
*Final Status: NOT STARTED* 