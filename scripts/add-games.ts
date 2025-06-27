#!/usr/bin/env bun

import { supabase } from './supabase-client';
import { generateMockGames } from './mock/data/games';

async function addGames(daysAhead: number = 7) {
  console.log(`\n🎮 Adding mock games for the next ${daysAhead} days...`);

  try {
    // Generate mock games
    const games = generateMockGames(daysAhead);

    // Filter out games that might already exist
    const gameIds = games.map((g) => g.id);
    const { data: existingGames } = await supabase.from('games').select('id').in('id', gameIds);

    const existingIds = new Set(existingGames?.map((g) => g.id) || []);
    const newGames = games.filter((g) => !existingIds.has(g.id));

    if (newGames.length === 0) {
      console.log('✅ All games already exist in the database');
      return;
    }

    // Insert new games
    const { data: insertedGames, error } = await supabase.from('games').insert(newGames).select();

    if (error) {
      console.error('❌ Error inserting games:', error);
      return;
    }

    console.log(`✅ Successfully added ${insertedGames?.length || 0} new games`);

    // Group by sport for summary
    const bySport = insertedGames?.reduce(
      (acc, game) => {
        acc[game.sport_title] = (acc[game.sport_title] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    if (bySport) {
      console.log('\n📊 Games added by sport:');
      Object.entries(bySport).forEach(([sport, count]) => {
        console.log(`   ${sport}: ${count} games`);
      });
    }

    // Summary
    const totalGames = await supabase.from('games').select('*', { count: 'exact', head: true });

    console.log(`\n📊 Database now contains ${totalGames.count} total games`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const daysAhead = args[0] ? parseInt(args[0]) : 7;

if (isNaN(daysAhead) || daysAhead < 1) {
  console.error('❌ Please provide a valid number of days (1 or more)');
  process.exit(1);
}

// Run the script
addGames(daysAhead);
