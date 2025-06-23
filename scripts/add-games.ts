#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { generateMockGames } from './data/mock-games';

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

// Parse command line arguments
const args = process.argv.slice(2);
const daysAhead = args[0] ? parseInt(args[0]) : 7;

if (isNaN(daysAhead) || daysAhead < 1 || daysAhead > 30) {
  console.log('Add Games Script');
  console.log('================\n');
  console.log('Usage: bun run scripts/add-games.ts [days_ahead]\n');
  console.log('Arguments:');
  console.log('  days_ahead   Number of days to generate games for (1-30, default: 7)\n');
  console.log('Examples:');
  console.log('  bun run scripts/add-games.ts        # Add games for next 7 days');
  console.log('  bun run scripts/add-games.ts 14     # Add games for next 14 days');
  process.exit(0);
}

async function addGames() {
  console.log(`🏀 Adding NBA games for the next ${daysAhead} days...\n`);

  try {
    // Generate mock games
    const mockGames = generateMockGames(daysAhead);

    // Filter out games that might already exist
    const gameIds = mockGames.map((g) => g.id);
    const { data: existingGames } = await supabase.from('games').select('id').in('id', gameIds);

    const existingIds = new Set(existingGames?.map((g) => g.id) || []);
    const newGames = mockGames.filter((g) => !existingIds.has(g.id));

    if (newGames.length === 0) {
      console.log('ℹ️  No new games to add (all games already exist)');
      return;
    }

    // Insert new games
    const { data: insertedGames, error } = await supabase
      .from('games')
      .insert(newGames)
      .select('id, home_team, away_team, commence_time');

    if (error) {
      console.error('❌ Error inserting games:', error);
      return;
    }

    console.log(`✅ Successfully added ${insertedGames.length} games`);

    // Group games by date
    const gamesByDate = insertedGames.reduce(
      (acc: Record<string, typeof insertedGames>, game) => {
        const date = new Date(game.commence_time).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(game);
        return acc;
      },
      {} as Record<string, typeof insertedGames>
    );

    // Display games by date
    console.log('\n📅 Games added by date:');
    Object.entries(gamesByDate).forEach(([date, games]) => {
      console.log(`\n${date}:`);
      games.forEach((game) => {
        const time = new Date(game.commence_time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        console.log(`  ${time} - ${game.away_team} @ ${game.home_team}`);
      });
    });

    // Summary
    const totalGames = await supabase.from('games').select('*', { count: 'exact', head: true });

    console.log(`\n📊 Database now contains ${totalGames.count} total games`);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
addGames();
