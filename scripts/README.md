# SnapFade Scripts Documentation

This directory contains administrative scripts for managing the SnapFade database and mock data.

## Prerequisites

- Bun runtime installed
- Supabase project created and running
- Environment variables configured in `.env`:
  - `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
  - `SUPABASE_SERVICE_KEY` - Your Supabase service key (for admin operations)

## Available Scripts

### 1. `seed-mock-data.ts`

Seeds the database with 30 mock users, games, and initial betting data.

```bash
bun run scripts/seed-mock-data.ts
```

**What it does:**
- Creates 30 mock users with different betting personalities
- Sets up initial bankrolls ($1,000 each)
- Establishes follow relationships between users
- Generates NBA games for the next 7 days
- Creates historical bets for completed games

**Mock User Personalities:**
- Sharp Bettors (4) - High win rate, analytical approach
- Square Bettors (6) - Bet favorites and overs
- Fade Material (5) - Consistently wrong, good to fade
- Contrarians (4) - Bet underdogs, fade the public
- Chalk Eaters (3) - Only heavy favorites
- Parlay Enthusiasts (2) - Multi-leg bets only
- Live Bettors (2) - In-game betting specialists
- Homers (2) - Only bet their favorite team
- Casual/Entertainment (3) - Mixed style, fun-focused

### 2. `setup-db.ts`

Database reset and cleanup utility with multiple options.

```bash
# Show help
bun run scripts/setup-db.ts

# Reset only mock user data
bun run scripts/setup-db.ts --mock-only

# Reset only bets and games
bun run scripts/setup-db.ts --bets-only

# Full database reset (DANGEROUS!)
bun run scripts/setup-db.ts --full

# Skip confirmation prompts
bun run scripts/setup-db.ts --mock-only --force

# Preview what would be deleted
bun run scripts/setup-db.ts --full --dry-run
```

**Options:**
- `--mock-only` - Delete only mock users and their associated data
- `--bets-only` - Delete all bets and games
- `--full` - Complete database reset (deletes ALL data)
- `--force` - Skip confirmation prompts
- `--dry-run` - Show what would be deleted without executing

**Safety Features:**
- Requires confirmation for destructive operations
- Shows current database state before deletion
- Dry-run mode for previewing changes

### 3. `add-games.ts`

Adds additional NBA games to the database.

```bash
# Add games for next 7 days (default)
bun run scripts/add-games.ts

# Add games for next 14 days
bun run scripts/add-games.ts 14
```

**Features:**
- Generates realistic NBA game schedules
- Avoids duplicate games
- Shows games organized by date
- Includes realistic odds and spreads

### 4. `settle-bets.ts`

Settles all bets for a completed game.

```bash
# Usage: settle-bets.ts <game_id> <home_score> <away_score>
bun run scripts/settle-bets.ts nba_2024-01-15_LAL_BOS 112 118
```

**What it does:**
- Updates game with final scores
- Marks game as completed
- Calls database function to settle all related bets
- Shows settlement summary with win/loss breakdown

### 5. `generate-activity.ts`

Generates mock user activity including posts, group chats, and interactions.

```bash
bun run scripts/generate-activity.ts
```

**What it does:**
- Creates 5-10 posts from mock users with personality-driven captions
- Establishes group chats ("NBA Degens", "Parlay Squad", "Fade Kings")
- Adds message history to group chats
- Creates tail/fade actions on recent posts

### 6. `test-connection.ts`

Tests the Supabase connection (created in Sprint 01.01).

```bash
bun run scripts/test-connection.ts
```

## Data Structure

### Mock Users (`data/mock-users.ts`)
Contains 30 predefined mock users with:
- Unique usernames and emails
- Personality types that drive betting behavior
- Avatar emojis
- Behavior seeds for consistent randomness

### Mock Games (`data/mock-games.ts`)
Generates NBA games with:
- Real team names and matchups
- Realistic game times (7:00, 7:30, 8:00, 10:00, 10:30 PM ET)
- Correlated odds (spread, moneyline, total)
- Mix of scheduled and completed games

## Typical Workflow

1. **Initial Setup:**
   ```bash
   # Seed the database with mock data
   bun run scripts/seed-mock-data.ts
   ```

2. **Add More Games:**
   ```bash
   # Add games for testing
   bun run scripts/add-games.ts 7
   ```

3. **Settle Completed Games:**
   ```bash
   # Settle bets after a game finishes
   bun run scripts/settle-bets.ts <game_id> <home_score> <away_score>
   ```

4. **Reset for Fresh Start:**
   ```bash
   # Clear mock data and start over
   bun run scripts/setup-db.ts --mock-only
   bun run scripts/seed-mock-data.ts
   ```

## Safety Warnings

⚠️ **CAUTION**: The `--full` flag in `setup-db.ts` will delete ALL data in the database, including real user data if any exists. Always use `--dry-run` first to preview changes.

⚠️ **Service Key**: These scripts require the `SUPABASE_SERVICE_KEY` which bypasses Row Level Security. Keep this key secure and never commit it to version control.

## Troubleshooting

### Missing Environment Variables
If you see errors about missing environment variables:
1. Check that `.env` file exists in the project root
2. Ensure all required variables are set
3. The service key can be found in your Supabase project settings

### Permission Errors
If you get permission errors:
1. Ensure you're using the service key, not the anon key
2. Check that your Supabase project is running
3. Verify the database schema matches expectations

### Script Not Found
If bun can't find the scripts:
1. Ensure you're running from the project root
2. Check that the scripts have executable permissions
3. Try using the full path: `bun run ./scripts/script-name.ts` 