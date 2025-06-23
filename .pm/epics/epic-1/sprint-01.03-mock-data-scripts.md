# Sprint 01.03: Mock Data & Scripts

## Sprint Overview

**Epic**: 01 - Foundation & Infrastructure  
**Sprint**: 01.03  
**Name**: Mock Data & Scripts  
**Status**: COMPLETED  
**Estimated Duration**: 1.5 hours  
**Actual Duration**: 2 hours  

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

- [x] 30 mock users in database with `is_mock` flag
- [x] Each user has defined personality type and behavior patterns
- [x] Follow relationships established between mock users
- [x] Mock games available for today and upcoming days
- [x] Database can be reset easily with scripts
- [x] Scripts are well-documented in README

## Tasks

### 1. Create Mock User Data Structure
- [x] **Reference [Mock User Personalities](.pm/docs/mock.md#user-personality-archetypes)** for exact templates
- [x] Create `scripts/data/mock-users.ts` with user templates:
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
- [x] Include variety of personalities:
  - [x] 4 Sharp bettors (high win rate)
  - [x] 6 Square bettors (bet favorites)
  - [x] 5 Fade material (consistently wrong)
  - [x] 3 Chalk eaters (heavy favorites only)
  - [x] 2 Dog lovers (underdogs only)
  - [x] 2 Parlay degens (always parlays)
  - [x] 2 Homers (only bet their team)
  - [x] 0 Trend followers (hot/cold streaks) - included as personality but not separate users
  - [x] 2 Contrarians (fade the public)
  - [x] 3 Entertainment (2 entertainment + 1 casual)

### 2. Create Seed Mock Data Script
- [x] Create `scripts/seed-mock-data.ts`
- [x] Connect to Supabase using admin credentials
- [x] Insert mock users with:
  - [x] OAuth provider: 'google' (mock)
  - [x] `is_mock: true` flag
  - [x] Personality metadata stored in `mock_personality_id` field
  - [x] Initial bankroll of $1,000 (100000 cents)
- [x] Create follow relationships:
  - [x] Popular users (sharps) get 15-20 followers
  - [x] Average users get 5-10 followers
  - [x] Some mutual follow relationships
  - [x] Total: 280 follow relationships created
- [x] Generate initial betting history:
  - [x] Bets on completed games
  - [x] Match personality types (chalk eaters bet moneyline, etc.)
  - [x] Variety of bet types and stakes ($10-$50)

### 3. Create Mock Games Generator
- [x] **Reference [Realistic Game Scheduling](.pm/docs/mock.md#realistic-game-scheduling)** for patterns
- [x] Create `scripts/data/mock-games.ts`
- [x] Generate realistic game schedules using patterns from mock.md:
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
- [x] Include realistic odds:
  - [x] Correlated spreads/totals/moneylines
  - [x] Standard juice (-110)
  - [x] Spread-based moneyline conversion
- [x] Create games for next 7 days
- [x] Create 2 recently settled games to show win/loss states

### 4. Create Add Games Script
- [x] Create `scripts/add-games.ts`
- [x] Generate games for next N days (configurable, default 7)
- [x] Use real NBA team matchups
- [x] Vary game times realistically:
  - [x] NBA: 7:00, 7:30, 8:00, 10:00, 10:30 PM ET
  - [x] Avoids duplicate games
- [x] Store in games table with mock odds

### 5. Create Settlement Script
- [x] Create `scripts/settle-bets.ts`
- [x] Accept game ID and scores as parameters
- [x] Call `settle_game_bets` database function
- [x] Show detailed settlement summary
- [x] Generate realistic scores:
  - [x] NBA: Based on spread correlation
- [x] Display win/loss breakdown

### 6. Create Database Reset Script
- [x] Create `scripts/setup-db.ts`
- [x] Options for different reset levels:
  ```bash
  # Full reset (dangerous!)
  bun run scripts/setup-db.ts --full
  
  # Reset only mock data
  bun run scripts/setup-db.ts --mock-only
  
  # Reset only bets/games
  bun run scripts/setup-db.ts --bets-only
  ```
- [x] Confirm before destructive operations
- [x] Added --force and --dry-run flags

### 7. Create Mock Activity Generator
- [x] Create `scripts/generate-activity.ts`
- [x] Generate 5-10 recent posts from mock users:
  - [x] Sharp bettors: Analytical captions with picks
  - [x] Homers: Team-biased posts with enthusiasm
  - [x] Fade material: Self-deprecating with bad picks
  - [x] Entertainment: Funny captions and reactions
- [x] Create realistic follow relationships:
  - [x] Already handled in seed script
  - [x] Popular users (sharps) get 15-20 followers
  - [x] Average users get 5-10 followers
  - [x] Fade material users get 10-15 followers
- [x] Create some group chats:
  - [x] "NBA Degens 🏀" - 10 members
  - [x] "Parlay Squad 🎰" - 6 members
  - [x] "Fade Kings 👑" - 5 members
- [x] Add recent message history to groups
- [x] Create tail/fade actions on posts (17 total)

### 8. Documentation
- [x] Create `scripts/README.md` with:
  - [x] Purpose of each script
  - [x] Usage examples
  - [x] Parameters and options
  - [x] Safety warnings
- [x] Add npm scripts to package.json:
  ```json
  "scripts": {
    "db:setup": "bun scripts/setup-db.ts",
    "db:seed-mock": "bun scripts/seed-mock-data.ts",
    "db:add-games": "bun scripts/add-games.ts",
    "db:settle": "bun scripts/settle-bets.ts",
    "db:generate-activity": "bun scripts/generate-activity.ts"
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

**Status**: COMPLETED

### What Was Implemented
1. **Mock User System**: Created 30 unique mock users with 12 different personality types
2. **Database Scripts**: Full suite of admin scripts for database management
3. **Mock Data Generation**: Realistic games, bets, posts, and social interactions
4. **Activity Simulation**: Posts with personality-driven captions, group chats, and tail/fade actions
5. **Comprehensive Documentation**: Complete README with usage examples and safety warnings

### Files Modified/Created
- `scripts/data/mock-users.ts` - 30 mock user definitions with personalities
- `scripts/data/mock-games.ts` - NBA game generation with realistic odds
- `scripts/seed-mock-data.ts` - Main seeding script (users, bankrolls, follows, games, bets)
- `scripts/setup-db.ts` - Database reset utility with safety features
- `scripts/add-games.ts` - Add additional games to database
- `scripts/settle-bets.ts` - Settle bets for completed games
- `scripts/generate-activity.ts` - Generate posts, chats, and interactions
- `scripts/README.md` - Complete documentation
- `package.json` - Added npm scripts for convenience

### Key Decisions Made
1. **Personality Distribution**: Adjusted from original spec to create exactly 30 users with good variety
2. **Mock Data Identification**: Used existing `is_mock` field from database schema
3. **Safety Features**: Added --force and --dry-run flags to prevent accidental data loss
4. **NBA Focus**: Generated only NBA games for initial testing (NFL can be added later)
5. **Realistic Social Graph**: Popular users (sharps) get more followers, fade material surprisingly popular

### Testing Performed
- ✅ Successfully seeded 31 mock users (30 mock + 1 existing real user)
- ✅ Created 280 follow relationships with realistic distribution
- ✅ Generated 58 NBA games (4 completed, 54 upcoming)
- ✅ Created 37 total bets (29 historical + 8 from activity)
- ✅ Generated 8 posts with personality-appropriate captions
- ✅ Created 3 group chats with message history
- ✅ Added 17 tail/fade actions on posts
- ✅ All scripts execute without errors
- ✅ Database reset functionality verified

### Issues Encountered & Resolved
1. **Delete Count Issue**: Supabase delete operations don't return count - updated UI to handle null counts
2. **Game Deletion**: Fixed game deletion query to use `.gte('')` instead of `.neq('')`
3. **Linter Errors**: Removed `.select()` from delete operations to fix TypeScript errors

---

*Sprint Started: December 29, 2024*  
*Sprint Completed: December 29, 2024*  
*Actual Duration: 2 hours* 