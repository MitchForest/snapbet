#!/usr/bin/env bun

import { Command } from 'commander';
import { createClient } from '@supabase/supabase-js';
import type { Database, Json } from '@/types/supabase-generated';

// Get Supabase URL and service key from environment
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  if (!supabaseUrl) console.error('  - EXPO_PUBLIC_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_KEY');
  console.error('\nPlease check your .env file');
  process.exit(1);
}

// Create Supabase client with service key for admin operations
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Helper to validate American odds
function validateAmericanOdds(odds: number): boolean {
  return (odds > 100 || odds < -100) && odds !== 0;
}

// Helper to format timestamp
function getTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

const program = new Command();

program
  .name('update-odds')
  .description('Update odds for games')
  .option('-g, --game-id <gameId>', 'Update specific game')
  .option('-s, --sport <sport>', 'Update all games for sport (NBA or NFL)')
  .option('--spread <line>', 'New spread line', parseFloat)
  .option('--total <line>', 'New total line', parseFloat)
  .option('--ml-home <odds>', 'New home moneyline (American odds)', parseInt)
  .option('--ml-away <odds>', 'New away moneyline (American odds)', parseInt)
  .parse(process.argv);

const options = program.opts();

interface UpdateOptions {
  gameId?: string;
  sport?: string;
  spread?: number;
  total?: number;
  mlHome?: number;
  mlAway?: number;
}

async function updateOdds() {
  console.log(`\n📊 Updating Game Odds - ${getTimestamp()}`);
  console.log('=====================================');

  try {
    // Validate that at least one update option is provided
    if (!options.spread && !options.total && !options.mlHome && !options.mlAway) {
      console.error(
        '❌ Must specify at least one odds update (--spread, --total, --ml-home, --ml-away)'
      );
      process.exit(1);
    }

    // Validate American odds format
    if (options.mlHome && !validateAmericanOdds(options.mlHome)) {
      console.error('❌ Invalid home moneyline odds. Must be > 100 or < -100');
      process.exit(1);
    }
    if (options.mlAway && !validateAmericanOdds(options.mlAway)) {
      console.error('❌ Invalid away moneyline odds. Must be > 100 or < -100');
      process.exit(1);
    }

    if (options.gameId) {
      // Update specific game
      await updateSingleGame(options.gameId, options);
    } else if (options.sport) {
      // Update all games for sport
      if (!['NBA', 'NFL'].includes(options.sport.toUpperCase())) {
        console.error('❌ Sport must be NBA or NFL');
        process.exit(1);
      }
      await updateSportGames(options.sport.toUpperCase() as 'NBA' | 'NFL', options);
    } else {
      console.error('❌ Must specify --game-id or --sport');
      process.exit(1);
    }

    console.log(`\n✅ Odds updated successfully at ${getTimestamp()}`);
  } catch (error) {
    console.error(`\n❌ Update failed at ${getTimestamp()}:`, error);
    process.exit(1);
  }
}

async function updateSingleGame(gameId: string, options: UpdateOptions) {
  // Get current game data
  const { data: game, error: fetchError } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (fetchError || !game) {
    throw new Error(`Game not found: ${gameId}`);
  }

  console.log(`\n📋 Updating: ${game.away_team} @ ${game.home_team}`);
  console.log(`🏀 Sport: ${game.sport_title}`);

  // Build updates object
  interface OddsData {
    bookmakers: Array<{
      key: string;
      markets: {
        h2h?: { home: number; away: number };
        spreads?: { line: number; home: number; away: number };
        totals?: { line: number; over: number; under: number };
      };
    }>;
  }

  const currentOdds = (game.odds_data as unknown as OddsData) || { bookmakers: [] };
  if (!currentOdds.bookmakers[0]) {
    currentOdds.bookmakers[0] = {
      key: 'snapbet',
      markets: {
        h2h: { home: -110, away: -110 },
        spreads: { line: 0, home: -110, away: -110 },
        totals: { line: 0, over: -110, under: -110 },
      },
    };
  }

  const markets = currentOdds.bookmakers[0].markets;
  const changes: string[] = [];

  if (options.spread !== undefined) {
    const oldSpread = markets.spreads?.line || 0;
    markets.spreads = {
      line: options.spread,
      home: -110,
      away: -110,
    };
    changes.push(
      `Spread: ${oldSpread > 0 ? '+' : ''}${oldSpread} → ${options.spread > 0 ? '+' : ''}${options.spread}`
    );
  }

  if (options.total !== undefined) {
    const oldTotal = markets.totals?.line || 0;
    markets.totals = {
      line: options.total,
      over: -110,
      under: -110,
    };
    changes.push(`Total: ${oldTotal} → ${options.total}`);
  }

  if (options.mlHome || options.mlAway) {
    const oldHomeML = markets.h2h?.home || -110;
    const oldAwayML = markets.h2h?.away || -110;
    markets.h2h = {
      home: options.mlHome || oldHomeML,
      away: options.mlAway || oldAwayML,
    };
    if (options.mlHome) {
      changes.push(
        `Home ML: ${oldHomeML > 0 ? '+' : ''}${oldHomeML} → ${options.mlHome > 0 ? '+' : ''}${options.mlHome}`
      );
    }
    if (options.mlAway) {
      changes.push(
        `Away ML: ${oldAwayML > 0 ? '+' : ''}${oldAwayML} → ${options.mlAway > 0 ? '+' : ''}${options.mlAway}`
      );
    }
  }

  // Update the game
  const { error: updateError } = await supabase
    .from('games')
    .update({
      odds_data: currentOdds as unknown as Json,
      last_updated: new Date().toISOString(),
    })
    .eq('id', gameId);

  if (updateError) {
    throw new Error(`Failed to update game: ${updateError.message}`);
  }

  console.log('\n✅ Changes applied:');
  changes.forEach((change) => console.log(`  - ${change}`));
}

async function updateSportGames(sport: 'NBA' | 'NFL', options: UpdateOptions) {
  // Get all games for the sport
  const sportKey = sport === 'NBA' ? 'basketball_nba' : 'american_football_nfl';

  const { data: games, error: fetchError } = await supabase
    .from('games')
    .select('id, home_team, away_team')
    .eq('sport', sportKey)
    .eq('status', 'scheduled');

  if (fetchError || !games || games.length === 0) {
    throw new Error(`No scheduled ${sport} games found`);
  }

  console.log(`\n📋 Updating ${games.length} ${sport} games...`);

  let updatedCount = 0;
  for (const game of games) {
    try {
      await updateSingleGame(game.id, options);
      updatedCount++;
    } catch (error) {
      console.error(`❌ Failed to update ${game.away_team} @ ${game.home_team}: ${error}`);
    }
  }

  console.log(`\n✅ Updated ${updatedCount}/${games.length} games`);
}

// Run the update
updateOdds();
