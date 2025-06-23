# Sprint 01.03: Mock Data & Scripts

## Sprint Overview

**Epic**: 01 - Foundation & Infrastructure  
**Sprint**: 01.03  
**Name**: Mock Data & Scripts  
**Status**: NOT STARTED  
**Estimated Duration**: 1.5 hours  
**Actual Duration**: -  

## Sprint Objectives

- Create comprehensive mock data following mock.md strategy
- Generate 30 personality-driven mock users
- Set up admin scripts for database management
- Create initial games and betting data
- Document all scripts for future use

## Required Documentation

- **[Mock Data Strategy](.pm/docs/mock.md)** - Complete mock data system design
- **[Mock User System](.pm/docs/mock.md#mock-user-system)** - User personalities and archetypes
- **[Game & Odds Generation](.pm/docs/mock.md#game--odds-generation)** - Realistic game creation
- **[Content Generation](.pm/docs/mock.md#content-generation-strategy)** - Post templates

## Success Criteria

- [ ] 30 mock users in database with `is_mock` flag
- [ ] Each user has defined personality type and behavior patterns
- [ ] Follow relationships established between mock users
- [ ] Mock games available for today and upcoming days
- [ ] Database can be reset easily with scripts
- [ ] Scripts are well-documented in README

## Tasks

### 1. Create Mock User Data Structure
- [ ] **Reference [Mock User Personalities](.pm/docs/mock.md#user-personality-archetypes)** for exact templates
- [ ] Create `scripts/data/mock-users.ts` with user templates:
  ```typescript
  // Copy PersonalityType enum from mock.md
  enum PersonalityType {
    SHARP_BETTOR = 'sharp_bettor',
    SQUARE_BETTOR = 'square_bettor',
    FADE_MATERIAL = 'fade_material',
    // ... etc from mock.md
  }

  // Use mockUserTemplates from mock.md#mock-user-generation
  export const mockUsers: MockUserTemplate[] = [
    {
      username: 'SharpShooter23',
      personality: PersonalityType.SHARP_BETTOR,
      bio: 'Former sportsbook employee. Dogs and unders. 📊',
      avatar: '🎯',
      // ... use exact values from mock.md
    },
    // ... 29 more users from mock.md
  ]
  ```
- [ ] Include variety of personalities:
  - [ ] 3-4 Sharp bettors (high win rate)
  - [ ] 5-6 Square bettors (bet favorites)
  - [ ] 3-4 Fade material (consistently wrong)
  - [ ] 2-3 Chalk eaters (heavy favorites only)
  - [ ] 2-3 Dog lovers (underdogs only)
  - [ ] 2-3 Parlay degens (always parlays)
  - [ ] 3-4 Homers (only bet their team)
  - [ ] 2-3 Trend followers (hot/cold streaks)
  - [ ] 2-3 Contrarians (fade the public)
  - [ ] 3-4 Entertainment (fun personalities)

### 2. Create Seed Mock Data Script
- [ ] Create `scripts/seed-mock-data.ts`
- [ ] Connect to Supabase using admin credentials
- [ ] Insert mock users with:
  - [ ] OAuth provider: 'google' (mock)
  - [ ] `is_mock: true` flag
  - [ ] Personality metadata in JSONB
  - [ ] Initial bankroll of $1,000
- [ ] Create follow relationships:
  - [ ] Popular users get 15-20 followers
  - [ ] Average users get 5-10 followers
  - [ ] Some mutual follow relationships
- [ ] Generate initial betting history:
  - [ ] Past 7 days of settled bets
  - [ ] Match personality win rates
  - [ ] Variety of bet types and stakes

### 3. Create Mock Games Generator
- [ ] **Reference [Realistic Game Scheduling](.pm/docs/mock.md#realistic-game-scheduling)** for patterns
- [ ] Create `scripts/data/mock-games.ts`
- [ ] Generate realistic game schedules using patterns from mock.md:
  ```typescript
  // Use schedulePatterns from mock.md
  // NFL: Sunday, Monday, Thursday
  // NBA: Daily during season
  const generateGamesForDate = (date: Date) => {
    const games = []
    
    // Use exact logic from mock.md#realistic-game-scheduling
    if ([0, 1, 4].includes(date.getDay())) {
      games.push(...generateNFLGames(date))
    }
    
    games.push(...generateNBAGames(date, randomBetween(5, 12)))
    
    return games
  }
  ```
- [ ] Include realistic odds:
  - [ ] Correlated spreads/totals/moneylines
  - [ ] Standard juice (-110)
  - [ ] Some line movement
- [ ] Create 2-3 games for "today" for immediate testing
- [ ] Create 1 recently settled game to show win/loss states

### 4. Create Add Games Script
- [ ] Create `scripts/add-games.ts`
- [ ] Generate games for next 7 days
- [ ] Use team matchups that make sense
- [ ] Vary game times realistically:
  - [ ] NBA: 7:00, 7:30, 8:00, 10:00, 10:30 PM ET
  - [ ] NFL: 1:00, 4:05, 4:25, 8:20 PM ET
- [ ] Store in games table with mock odds

### 5. Create Settlement Script
- [ ] Create `scripts/settle-bets.ts`
- [ ] Accept game ID and scores as parameters
- [ ] Call `settle_game_bets` database function
- [ ] Generate realistic scores:
  - [ ] NFL: Common scores (24-21, 27-24, etc.)
  - [ ] NBA: 95-125 range typically
- [ ] Ensure personality win rates maintained

### 6. Create Database Reset Script
- [ ] Create `scripts/setup-db.ts`
- [ ] Options for different reset levels:
  ```bash
  # Full reset (dangerous!)
  bun run scripts/setup-db.ts --full
  
  # Reset only mock data
  bun run scripts/setup-db.ts --mock-only
  
  # Reset only bets/games
  bun run scripts/setup-db.ts --bets-only
  ```
- [ ] Confirm before destructive operations
- [ ] Re-seed mock data after reset

### 7. Create Mock Activity Generator
- [ ] Create `scripts/generate-activity.ts`
- [ ] Generate 5-10 recent posts from mock users:
  - [ ] Sharp bettors: Analytical captions with picks
  - [ ] Homers: Team-biased posts with enthusiasm
  - [ ] Fade material: Self-deprecating with bad picks
  - [ ] Entertainment: Funny captions and reactions
- [ ] Create realistic follow relationships:
  - [ ] Popular users (sharps) get 15-20 followers
  - [ ] Average users get 5-10 followers
  - [ ] Some mutual follow relationships
  - [ ] Fade material users surprisingly popular
- [ ] Create some group chats:
  - [ ] "NBA Degens" - 8-12 members
  - [ ] "Parlay Squad" - 5-8 members
  - [ ] "Fade Kings" - 4-6 members
- [ ] Add recent message history to groups
- [ ] Create a few tail/fade actions on posts

### 8. Documentation
- [ ] Create `scripts/README.md` with:
  - [ ] Purpose of each script
  - [ ] Usage examples
  - [ ] Parameters and options
  - [ ] Safety warnings
- [ ] Add npm scripts to package.json:
  ```json
  "scripts": {
    "db:setup": "bun scripts/setup-db.ts",
    "db:seed": "bun scripts/seed-mock-data.ts",
    "db:add-games": "bun scripts/add-games.ts",
    "db:settle": "bun scripts/settle-bets.ts"
  }
  ```

## Technical Decisions

### Mock User Distribution
- 30 total mock users
- Diverse personality types for realistic feed
- Some intentionally bad for fading
- Some consistently good for tailing
- Mix of activity levels

### Data Generation Strategy
- Deterministic based on seed for consistency
- Realistic patterns (not random)
- Personality drives all behavior
- Historical data for immediate app testing

### Script Safety
- All scripts require confirmation
- Mock data clearly marked with flags
- Non-destructive by default
- Clear documentation of impacts

## Known Issues & Blockers

- None identified yet

## Notes

- Mock users should feel real but be clearly marked in database
- Personalities should be consistent across all actions
- Win rates should converge to targets over time
- Group chats need realistic conversation history

## Handoff to Reviewer

**Status**: NOT STARTED

### What Was Implemented
[To be completed at sprint end]

### Files Modified/Created
[To be completed at sprint end]

### Key Decisions Made
[To be completed at sprint end]

### Testing Performed
[To be completed at sprint end]

---

*Sprint Started: -*  
*Sprint Completed: -* 