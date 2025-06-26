# Sprint 05.02: Betting Service & State Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 5 - Complete Betting System with Tail/Fade

**Sprint Goal**: Create the core betting service layer and state management for bet placement, validation, and payout calculations.

**User Story Contribution**: 
- Enables Story 3 (Boring Bet Slip Problem) with fast bet placement logic
- Supports Story 1 (Credibility Problem) with accurate bet tracking

## 🚨 Required Development Practices

### Database Management
- **Use Supabase MCP** to inspect current database state
- **Keep types synchronized**: Run type generation after ANY schema changes
- **Migration files required**: Every database change needs a migration file
- **Test migrations**: Ensure migrations run cleanly on fresh database

### UI/UX Consistency
- **Use Tamagui components**: `View`, `Text`, `XStack`, `YStack`, `Stack`
- **Follow UI/UX rules**: See `.pm/process/ui-ux-consistency-rules.md`
- **Use Colors constant**: Import from `@/theme` - NEVER hardcode colors
- **Standard spacing**: Use Tamagui's `$1`, `$2`, `$3`, etc. tokens

### Code Quality
- **Zero tolerance**: No lint errors, no TypeScript errors
- **Type safety**: No `any` types without explicit justification
- **Run before handoff**: `bun run lint && bun run typecheck`

## Sprint Plan

### Objectives
1. Create BettingService singleton for all betting operations
2. Implement Zustand store for bet slip state management
3. Build bet validation logic with bankroll checks
4. Create payout calculation utilities for American odds
5. Implement React Query hooks for bet data fetching

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `services/betting/bettingService.ts` | Core betting operations | NOT STARTED |
| `services/betting/types.ts` | Betting-specific type definitions | NOT STARTED |
| `stores/betSlipStore.ts` | Zustand store for bet slip state | NOT STARTED |
| `hooks/useBetting.ts` | React Query hooks for betting | NOT STARTED |
| `utils/betting/oddsCalculator.ts` | Payout calculation utilities | NOT STARTED |
| `utils/betting/validation.ts` | Bet validation rules | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `types/database.ts` | Ensure bet types are complete | NOT STARTED |
| `services/supabase/index.ts` | Export betting service | NOT STARTED |

### Implementation Approach

1. **Service Architecture**:
   - Singleton pattern matching other services
   - All database operations through service
   - Service independence (no cross-service calls)
   - Proper error handling with typed errors

2. **State Management**:
   - Zustand for bet slip (current bet being placed)
   - React Query for bet history/active bets
   - MMKV for draft bet storage
   - Optimistic updates for UI responsiveness

3. **Validation Rules**:
   - Minimum bet: $5
   - Maximum bet: Available bankroll
   - Game must not have started
   - Valid odds required
   - User must be authenticated

**Key Technical Decisions**:
- Store all money values in cents (avoid floating point)
- American odds format throughout
- Atomic database operations for bet placement
- Service independence pattern from Epic 4

### Dependencies & Risks
**Dependencies**:
- Auth system for user context
- Bankroll service (to be created)
- Database schema already exists
- Supabase client configuration

**Identified Risks**:
- Concurrent bet placement edge cases
- Bankroll race conditions
- Odds format consistency
- Timezone handling for game starts

## Implementation Details

### BettingService Interface
```typescript
class BettingService {
  // Place a new bet
  async placeBet(input: BetInput): Promise<Bet>
  
  // Get user's active (pending) bets
  async getActiveBets(userId: string): Promise<Bet[]>
  
  // Get user's bet history
  async getBetHistory(userId: string, options?: BetHistoryOptions): Promise<Bet[]>
  
  // Get single bet details
  async getBet(betId: string): Promise<Bet | null>
  
  // Cancel bet (if allowed)
  async cancelBet(betId: string): Promise<void>
  
  // Internal validation
  private validateBet(input: BetInput, bankroll: number): void
  private calculatePotentialWin(stake: number, odds: number): number
}
```

### Bet Slip Store Structure
```typescript
interface BetSlipStore {
  // Current bet being configured
  game: Game | null
  betType: 'spread' | 'total' | 'moneyline'
  selection: BetSelection | null
  stake: number
  quickAmounts: [25, 50, 100]
  shareToFeed: boolean
  
  // Computed values
  odds: number
  potentialWin: number
  totalReturn: number
  
  // Actions
  setGame: (game: Game) => void
  setBetType: (type: BetType) => void
  setSelection: (selection: BetSelection) => void
  setStake: (amount: number) => void
  toggleShareToFeed: () => void
  reset: () => void
  
  // Validation
  isValid: boolean
  validationError: string | null
}
```

### Odds Calculation Utilities
```typescript
// American odds to decimal conversion
function americanToDecimal(odds: number): number {
  if (odds > 0) {
    return (odds / 100) + 1
  } else {
    return (100 / Math.abs(odds)) + 1
  }
}

// Calculate payout from stake and American odds
function calculatePayout(stake: number, odds: number): {
  toWin: number
  totalReturn: number
} {
  const decimal = americanToDecimal(odds)
  const toWin = Math.floor(stake * (decimal - 1))
  const totalReturn = stake + toWin
  return { toWin, totalReturn }
}

// Format money for display (cents to dollars)
function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}
```

### Validation Rules Implementation
```typescript
interface ValidationResult {
  isValid: boolean
  error?: string
}

function validateBet(
  input: BetInput,
  availableBankroll: number,
  game: Game
): ValidationResult {
  // Check minimum bet
  if (input.stake < 500) { // $5 in cents
    return { isValid: false, error: 'Minimum bet is $5' }
  }
  
  // Check bankroll
  if (input.stake > availableBankroll) {
    return { isValid: false, error: 'Insufficient funds' }
  }
  
  // Check game hasn't started
  if (new Date(game.commence_time) < new Date()) {
    return { isValid: false, error: 'Game has already started' }
  }
  
  // Validate odds exist for bet type
  if (!getOddsForSelection(game, input)) {
    return { isValid: false, error: 'Odds not available' }
  }
  
  return { isValid: true }
}
```

### Error Handling
```typescript
class BettingError extends Error {
  constructor(
    message: string,
    public code: 'INSUFFICIENT_FUNDS' | 'GAME_STARTED' | 'INVALID_ODDS' | 'MIN_BET' | 'UNKNOWN'
  ) {
    super(message)
  }
}
```

## Testing Checklist

### Unit Testing Targets
- [ ] Odds calculations are accurate
- [ ] Validation rules work correctly
- [ ] Store actions update state properly
- [ ] Service methods handle errors gracefully

### Integration Testing
- [ ] Bet placement creates database record
- [ ] Bankroll is properly debited
- [ ] Concurrent bets don't cause issues
- [ ] Game start time validation works

### Manual Testing
- [ ] Can configure all bet types
- [ ] Stake input validates properly
- [ ] Quick amounts work
- [ ] Potential win calculates correctly
- [ ] Share toggle persists
- [ ] Reset clears everything

## Documentation Updates

- [ ] Document betting service API
- [ ] Add validation rules to user guide
- [ ] Document odds calculation formulas
- [ ] Update type definitions

## Handoff Checklist

### Pre-Handoff Requirements
- [ ] All files created as planned
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] Unit tests passing
- [ ] Manual testing completed
- [ ] Error handling comprehensive

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
- [ ] Service follows singleton pattern
- [ ] State management is clean
- [ ] Validation is comprehensive
- [ ] Error handling is robust
- [ ] No service-to-service calls
- [ ] Types are properly defined

### Review Outcome

**Status**: [PENDING]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [Status]* 