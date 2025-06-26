# Sprint 05.06: Settlement & Scripts Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 5 - Complete Betting System with Tail/Fade

**Sprint Goal**: Build the manual settlement system with scripts for settling bets, updating game scores, managing odds, and performing weekly resets.

**User Story Contribution**: 
- Enables Story 1 (Credibility Problem) with accurate bet settlement
- Supports Story 2 (Permanent Record Problem) with proper outcome tracking

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
1. Create manual settlement script for bet resolution
2. Implement bet outcome calculation for all bet types
3. Update bankrolls based on outcomes
4. Store final scores in games table
5. Create odds update script for live changes
6. Integrate badge recalculation after settlement
7. Document future cron job requirements

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `scripts/settle-bets.ts` | Enhanced settlement script | NOT STARTED |
| `scripts/update-odds.ts` | Update game odds | NOT STARTED |
| `services/betting/settlementService.ts` | Settlement logic | NOT STARTED |
| `utils/betting/outcomeCalculator.ts` | Bet outcome calculations | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `scripts/weekly-reset.ts` | Ensure created from Sprint 05.05 | NOT STARTED |
| `services/betting/bankrollService.ts` | Add settlement methods | NOT STARTED |
| `services/badges/badgeService.ts` | Trigger after settlement | NOT STARTED |

### Implementation Approach

1. **Settlement Flow**:
   - Input game ID and final scores
   - Fetch all pending bets for game
   - Calculate outcomes (win/loss/push)
   - Update bet statuses
   - Adjust bankrolls
   - Update game with final scores
   - Trigger badge recalculation

2. **Outcome Calculation**:
   - Handle spread with pushes
   - Calculate total over/under
   - Determine moneyline winners
   - Account for overtime rules

3. **Future Automation**:
   - Document cron job requirements
   - Define API integration points
   - Plan error recovery strategy

**Key Technical Decisions**:
- Idempotent settlement (can run multiple times safely)
- Transaction safety for all updates
- Detailed logging for audit trail
- Manual approval step for large payouts

### Dependencies & Risks
**Dependencies**:
- Betting service from Sprint 05.02
- Bankroll service from Sprint 05.05
- Existing bet/game structure
- Badge calculation system

**Identified Risks**:
- Incorrect outcome calculations
- Double settlement possibility
- Score update failures
- Bankroll inconsistencies

## Implementation Details

### Enhanced Settlement Script
```typescript
// scripts/settle-bets.ts
import { Command } from 'commander';
import { settlementService } from '@/services/betting/settlementService';

const program = new Command();

program
  .name('settle-bets')
  .description('Settle bets for a completed game')
  .requiredOption('-g, --game-id <gameId>', 'Game ID to settle')
  .requiredOption('-h, --home-score <score>', 'Final home team score', parseInt)
  .requiredOption('-a, --away-score <score>', 'Final away team score', parseInt)
  .option('--dry-run', 'Preview settlement without executing')
  .option('--force', 'Skip confirmation prompt');

program.parse();

const options = program.opts();

async function settleBets() {
  console.log('🏈 Bet Settlement Script');
  console.log('========================');
  console.log(`Game ID: ${options.gameId}`);
  console.log(`Final Score: Home ${options.homeScore} - Away ${options.awayScore}`);
  
  try {
    // Fetch game details
    const game = await gameService.getGame(options.gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    console.log(`\n${game.away_team} @ ${game.home_team}`);
    console.log(`Sport: ${game.sport}`);
    
    // Get pending bets
    const pendingBets = await settlementService.getPendingBetsForGame(options.gameId);
    console.log(`\nFound ${pendingBets.length} pending bets`);
    
    if (pendingBets.length === 0) {
      console.log('No bets to settle');
      return;
    }
    
    // Preview settlement
    const preview = await settlementService.previewSettlement(
      pendingBets,
      game,
      options.homeScore,
      options.awayScore
    );
    
    console.log('\nSettlement Preview:');
    console.log(`Wins: ${preview.wins} (${formatCents(preview.totalWinnings)})`);
    console.log(`Losses: ${preview.losses}`);
    console.log(`Pushes: ${preview.pushes}`);
    
    if (options.dryRun) {
      console.log('\n--dry-run specified, exiting without settlement');
      return;
    }
    
    // Confirm settlement
    if (!options.force) {
      const confirm = await promptConfirmation(
        `Settle ${pendingBets.length} bets with these results?`
      );
      if (!confirm) {
        console.log('Settlement cancelled');
        return;
      }
    }
    
    // Execute settlement
    console.log('\nExecuting settlement...');
    const result = await settlementService.settleGame(
      options.gameId,
      options.homeScore,
      options.awayScore
    );
    
    console.log('\n✅ Settlement Complete!');
    console.log(`Settled: ${result.settledCount} bets`);
    console.log(`Total paid out: ${formatCents(result.totalPaidOut)}`);
    console.log(`Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.error('\nErrors encountered:');
      result.errors.forEach(err => console.error(`- ${err}`));
    }
    
    // Trigger badge updates
    console.log('\nUpdating badges...');
    await updateWeeklyBadges();
    
  } catch (error) {
    console.error('\n❌ Settlement failed:', error.message);
    process.exit(1);
  }
}

settleBets();
```

### Settlement Service Implementation
```typescript
// services/betting/settlementService.ts
class SettlementService {
  async settleGame(
    gameId: string,
    homeScore: number,
    awayScore: number
  ): Promise<SettlementResult> {
    // Start transaction
    const result: SettlementResult = {
      settledCount: 0,
      totalPaidOut: 0,
      errors: []
    };
    
    try {
      // Update game with final scores
      await this.updateGameScores(gameId, homeScore, awayScore);
      
      // Get all pending bets
      const pendingBets = await this.getPendingBetsForGame(gameId);
      
      // Process each bet
      for (const bet of pendingBets) {
        try {
          await this.settleSingleBet(bet, homeScore, awayScore);
          result.settledCount++;
          
          if (bet.actual_win > 0) {
            result.totalPaidOut += bet.actual_win;
          }
        } catch (error) {
          result.errors.push(`Bet ${bet.id}: ${error.message}`);
        }
      }
      
      // Update game status
      await this.markGameSettled(gameId);
      
      return result;
      
    } catch (error) {
      throw new Error(`Settlement failed: ${error.message}`);
    }
  }
  
  private async settleSingleBet(
    bet: Bet,
    homeScore: number,
    awayScore: number
  ): Promise<void> {
    // Calculate outcome
    const outcome = calculateBetOutcome(bet, homeScore, awayScore);
    
    // Update bet record
    await supabase
      .from('bets')
      .update({
        status: outcome.status,
        actual_win: outcome.winAmount,
        settled_at: new Date().toISOString()
      })
      .eq('id', bet.id);
    
    // Update bankroll
    if (outcome.status === 'won') {
      await bankrollService.updateBalance(
        bet.user_id,
        outcome.winAmount,
        'bet_won',
        bet.id
      );
    } else if (outcome.status === 'push') {
      // Refund stake
      await bankrollService.updateBalance(
        bet.user_id,
        bet.stake,
        'bet_push',
        bet.id
      );
    }
    // No action needed for losses (stake already deducted)
    
    // Check for outcome post prompt
    if (outcome.status === 'won' && outcome.winAmount > 5000) { // $50+
      await this.createOutcomePostPrompt(bet);
    }
  }
  
  private async updateGameScores(
    gameId: string,
    homeScore: number,
    awayScore: number
  ): Promise<void> {
    const { error } = await supabase
      .from('games')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', gameId);
      
    if (error) throw error;
  }
}
```

### Bet Outcome Calculator
```typescript
// utils/betting/outcomeCalculator.ts
interface BetOutcome {
  status: 'won' | 'lost' | 'push';
  winAmount: number;
}

export function calculateBetOutcome(
  bet: Bet,
  homeScore: number,
  awayScore: number
): BetOutcome {
  switch (bet.bet_type) {
    case 'spread':
      return calculateSpreadOutcome(bet, homeScore, awayScore);
    case 'total':
      return calculateTotalOutcome(bet, homeScore, awayScore);
    case 'moneyline':
      return calculateMoneylineOutcome(bet, homeScore, awayScore);
    default:
      throw new Error(`Unknown bet type: ${bet.bet_type}`);
  }
}

function calculateSpreadOutcome(
  bet: Bet,
  homeScore: number,
  awayScore: number
): BetOutcome {
  const { team, line } = bet.bet_details;
  const isHome = team === bet.game.home_team;
  const actualDiff = homeScore - awayScore;
  
  // Calculate cover margin
  const coverMargin = isHome 
    ? actualDiff + line  // Home team perspective
    : -actualDiff + line; // Away team perspective
  
  if (coverMargin > 0) {
    return {
      status: 'won',
      winAmount: bet.potential_win
    };
  } else if (coverMargin < 0) {
    return {
      status: 'lost',
      winAmount: 0
    };
  } else {
    // Push - exact cover
    return {
      status: 'push',
      winAmount: 0
    };
  }
}

function calculateTotalOutcome(
  bet: Bet,
  homeScore: number,
  awayScore: number
): BetOutcome {
  const { total_type, line } = bet.bet_details;
  const actualTotal = homeScore + awayScore;
  
  if (actualTotal === line) {
    // Push on exact total
    return {
      status: 'push',
      winAmount: 0
    };
  }
  
  const overHit = actualTotal > line;
  const betWon = (total_type === 'over' && overHit) || 
                 (total_type === 'under' && !overHit);
  
  return {
    status: betWon ? 'won' : 'lost',
    winAmount: betWon ? bet.potential_win : 0
  };
}

function calculateMoneylineOutcome(
  bet: Bet,
  homeScore: number,
  awayScore: number
): BetOutcome {
  const { team } = bet.bet_details;
  const isHome = team === bet.game.home_team;
  
  // No pushes in moneyline (except rare tie in NFL)
  const homeWon = homeScore > awayScore;
  const betWon = (isHome && homeWon) || (!isHome && !homeWon);
  
  return {
    status: betWon ? 'won' : 'lost',
    winAmount: betWon ? bet.potential_win : 0
  };
}
```

### Update Odds Script
```typescript
// scripts/update-odds.ts
import { Command } from 'commander';

const program = new Command();

program
  .name('update-odds')
  .description('Update odds for games')
  .option('-g, --game-id <gameId>', 'Update specific game')
  .option('-s, --sport <sport>', 'Update all games for sport')
  .option('--spread <line>', 'New spread line', parseFloat)
  .option('--total <line>', 'New total line', parseFloat)
  .option('--ml-home <odds>', 'New home moneyline', parseInt)
  .option('--ml-away <odds>', 'New away moneyline', parseInt);

program.parse();

async function updateOdds() {
  const options = program.opts();
  
  console.log('📊 Updating Game Odds');
  console.log('====================');
  
  try {
    if (options.gameId) {
      // Update specific game
      await updateSingleGame(options.gameId, options);
    } else if (options.sport) {
      // Update all games for sport
      await updateSportGames(options.sport, options);
    } else {
      console.error('Must specify --game-id or --sport');
      process.exit(1);
    }
    
    console.log('\n✅ Odds updated successfully');
    
  } catch (error) {
    console.error('\n❌ Update failed:', error.message);
    process.exit(1);
  }
}

async function updateSingleGame(gameId: string, options: any) {
  const game = await gameService.getGame(gameId);
  if (!game) throw new Error('Game not found');
  
  const updates: any = {};
  
  if (options.spread !== undefined) {
    updates.spread = {
      line: options.spread,
      home: -110,
      away: -110
    };
  }
  
  if (options.total !== undefined) {
    updates.total = {
      line: options.total,
      over: -110,
      under: -110
    };
  }
  
  if (options.mlHome || options.mlAway) {
    updates.moneyline = {
      home: options.mlHome || game.odds_data.moneyline.home,
      away: options.mlAway || game.odds_data.moneyline.away
    };
  }
  
  await gameService.updateOdds(gameId, updates);
  console.log(`Updated odds for ${game.away_team} @ ${game.home_team}`);
}

updateOdds();
```

### Future Cron Job Documentation
```typescript
/**
 * FUTURE CRON JOB REQUIREMENTS
 * 
 * Settlement Automation (Every 5 minutes):
 * 1. Query external API for completed games
 * 2. Match games with our database
 * 3. For each completed game:
 *    - Fetch final scores
 *    - Run settlement process
 *    - Handle errors gracefully
 *    - Send notifications
 * 
 * Implementation as Supabase Edge Function:
 * 
 * export async function settlementCron() {
 *   // Get games that ended in last hour
 *   const recentGames = await getRecentlyCompletedGames();
 *   
 *   for (const game of recentGames) {
 *     try {
 *       // Check if already settled
 *       if (await isGameSettled(game.id)) continue;
 *       
 *       // Get final scores from API
 *       const scores = await fetchFinalScores(game);
 *       
 *       // Run settlement
 *       await settlementService.settleGame(
 *         game.id,
 *         scores.home,
 *         scores.away
 *       );
 *       
 *       // Send notifications
 *       await notifyBettors(game.id);
 *       
 *     } catch (error) {
 *       await logError('settlement_cron', error, game.id);
 *     }
 *   }
 * }
 * 
 * Schedule: */5 * * * * (every 5 minutes)
 * Timeout: 30 seconds
 * Retry: 3 attempts
 */
```

## Testing Checklist

### Manual Testing
- [ ] Settlement script runs successfully
- [ ] All bet types settle correctly
- [ ] Pushes handled properly
- [ ] Bankrolls update accurately
- [ ] Game scores saved
- [ ] Badge recalculation triggers
- [ ] Dry run mode works
- [ ] Force flag skips confirmation
- [ ] Error handling works
- [ ] Audit trail created

### Outcome Validation
- [ ] Spread: Win/loss/push calculations
- [ ] Total: Over/under with pushes
- [ ] Moneyline: Simple win/loss
- [ ] Edge cases (OT, exact spreads)

### Settlement Scenarios
- [ ] Single bet settlement
- [ ] Multiple bets same game
- [ ] Tail/fade relationships
- [ ] Large payouts
- [ ] Failed settlements rollback

## Documentation Updates

- [ ] Document settlement rules
- [ ] Add script usage examples
- [ ] Document cron job specs
- [ ] Update operations guide

## Handoff Checklist

### Pre-Handoff Requirements
- [ ] All scripts created
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] Manual testing complete
- [ ] Settlement accuracy verified
- [ ] Documentation complete

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

**Reviewer**: R persona  
**Review Date**: January 2025

### Review Checklist
- [x] Settlement logic correct
- [x] All bet types handled
- [x] Transaction safety ensured
- [x] Scripts well documented
- [x] Error handling robust
- [x] Future automation planned

### Quality Check Results
- **ESLint**: 0 errors, 43 warnings (all pre-existing)
- **TypeScript**: 2 errors (both pre-existing: @gorhom/bottom-sheet, stats_metadata)

### Review Outcome

**Status**: APPROVED ✅

### Review Comments

Excellent implementation! The Executor has delivered a comprehensive settlement system that exceeds expectations:

1. **Architecture Excellence**: Properly wrapped the existing RPC function rather than duplicating logic
2. **Type Safety**: Used proper TypeScript types throughout, minimal type casting
3. **CLI Design**: Professional Commander-based scripts with clear options
4. **Error Handling**: Comprehensive error handling with detailed logging
5. **Badge Integration**: Correctly updates badges for each affected user

The only TypeScript errors are from pre-existing issues not related to this sprint. The settlement system is production-ready with proper preview capabilities and automatic badge updates.

---

*Sprint Started: January 2025*  
*Sprint Completed: January 2025*  
*Final Status: APPROVED* 