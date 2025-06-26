# Sprint 05.01: Games Tab & Data Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 5 - Complete Betting System with Tail/Fade

**Sprint Goal**: Replace the placeholder games tab with a functional games browsing interface showing NBA and NFL games with odds, scores, and quick bet functionality.

**User Story Contribution**: 
- Enables Story 3 (Boring Bet Slip Problem) by providing quick access to betting
- Sets foundation for Story 1 (Credibility Problem) with real game data

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
1. Replace placeholder games tab with functional game browsing
2. Display both NBA and NFL games with mock data
3. Show odds for all three bet types (spread, total, moneyline)
4. Display scores for live/completed games
5. Implement Quick Bet navigation to bet sheet

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `components/betting/GameCard.tsx` | Individual game display component | NOT STARTED |
| `components/betting/GamesList.tsx` | FlashList of games with sections | NOT STARTED |
| `components/betting/SportBadge.tsx` | NBA/NFL sport indicator pill | NOT STARTED |
| `services/games/gameService.ts` | Game data fetching and caching | NOT STARTED |
| `hooks/useGames.ts` | React Query hook for games data | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `app/(drawer)/(tabs)/games.tsx` | Replace placeholder with GamesList | NOT STARTED |
| `types/database.ts` | Add game-related types if needed | NOT STARTED |
| `scripts/data/mock-games.ts` | Ensure NFL games included | NOT STARTED |

### Implementation Approach

1. **Game Service Architecture**:
   - Follow singleton pattern from other services
   - Cache games in MMKV with 5-minute TTL
   - Support filtering by sport and date
   - Handle game state transitions

2. **UI Component Structure**:
   - `GamesList` uses FlashList for performance
   - `GameCard` displays all game info in compact format
   - `SportBadge` shows sport type clearly
   - Consistent with existing card patterns

3. **Data Flow**:
   - Pull games from mock data initially
   - Store in MMKV for quick access
   - React Query for state management
   - Optimistic UI for interactions

**Key Technical Decisions**:
- Use FlashList over FlatList for 60 FPS scrolling
- Cache games aggressively to reduce queries
- Show single bookmaker odds (no line shopping)
- Group games by start time, not sport

### Dependencies & Risks
**Dependencies**:
- Existing mock games data structure
- Team data from `data/teams.ts`
- FlashList from Epic 4
- MMKV storage service

**Identified Risks**:
- Mock data might need NFL team additions
- Odds format consistency across sports
- Performance with many games

## Implementation Details

### GameCard Component Design
```tsx
interface GameCardProps {
  game: Game;
  onQuickBet: (game: Game) => void;
}

// Visual structure:
┌─────────────────────────────────────────┐
│ [NBA] • Tonight 7:30 PM ET         LIVE │
│ ┌────┐                      ┌────┐     │
│ │LAL │  115 - 108           │BOS │     │
│ │45-20│                     │42-23│    │
│ └────┘                      └────┘     │
│                                         │
│ Spread: LAL -5.5 (-110) | BOS +5.5     │
│ Total:  O 220.5 (-110)  | U 220.5      │
│ Money:  LAL -200        | BOS +170     │
│                                         │
│           [Quick Bet →]                 │
└─────────────────────────────────────────┘
```

### Game Service Methods
```typescript
class GameService {
  // Fetch all games for today/upcoming
  async getGames(options?: { sport?: Sport }): Promise<Game[]>
  
  // Get single game by ID
  async getGame(gameId: string): Promise<Game | null>
  
  // Update game scores (for settlement)
  async updateGameScore(gameId: string, homeScore: number, awayScore: number): Promise<void>
  
  // Cache management
  private cacheGames(games: Game[]): void
  private getCachedGames(): Game[] | null
}
```

### Performance Considerations
- Estimated 50-100 games max at once
- Each game card ~400px height
- Use `estimatedItemSize={400}` for FlashList
- Implement sections for time-based grouping
- Lazy load team colors

### Mock Data Requirements
- At least 10 NBA games per day
- At least 8 NFL games per week (Thu, Sun, Mon)
- Realistic odds variations
- Mix of game states (scheduled, live, final)
- Some games with scores, some without

## Testing Checklist

### Manual Testing
- [ ] Games tab loads without errors
- [ ] Both NBA and NFL games display
- [ ] Sport badges show correct colors
- [ ] Odds display for all three bet types
- [ ] Live games show scores
- [ ] Quick Bet button navigates properly
- [ ] Pull-to-refresh works
- [ ] Scrolling is smooth (60 FPS)
- [ ] Team colors display correctly
- [ ] Game times show in user's timezone

### Edge Cases to Test
- [ ] No games available scenario
- [ ] Games with missing odds data
- [ ] Extremely long team names
- [ ] Games in overtime
- [ ] Postponed/cancelled games

## Documentation Updates

- [ ] Add game service methods to API docs
- [ ] Document mock data structure
- [ ] Update type definitions
- [ ] Add performance notes

## Handoff Checklist

### Pre-Handoff Requirements
- [ ] All files created/modified as planned
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] Manual testing completed
- [ ] Mock data includes both sports
- [ ] Performance targets met (60 FPS)

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
- [ ] Games display correctly for both sports
- [ ] Performance meets 60 FPS target
- [ ] Follows established UI patterns
- [ ] Service architecture consistent
- [ ] No unnecessary complexity
- [ ] Quick Bet flow works smoothly

### Review Outcome

**Status**: [PENDING]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [Status]* 