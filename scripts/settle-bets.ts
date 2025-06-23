#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

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

if (args.length < 3) {
  console.log('Bet Settlement Script');
  console.log('====================\n');
  console.log('Usage: bun run scripts/settle-bets.ts <game_id> <home_score> <away_score>\n');
  console.log('Example:');
  console.log('  bun run scripts/settle-bets.ts nba_2024-01-15_LAL_BOS 112 118');
  process.exit(0);
}

const gameId = args[0];
const homeScore = parseInt(args[1]);
const awayScore = parseInt(args[2]);

if (isNaN(homeScore) || isNaN(awayScore)) {
  console.error('❌ Scores must be valid numbers');
  process.exit(1);
}

async function settleBets() {
  console.log('🎯 Settling bets for game...\n');

  try {
    // First, get the game details
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      console.error('❌ Game not found:', gameId);
      return;
    }

    console.log(`📋 Game: ${game.away_team} @ ${game.home_team}`);
    console.log(`📊 Final Score: ${awayScore} - ${homeScore}`);

    // Update game with final scores
    const { error: updateError } = await supabase
      .from('games')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: 'completed' as Database['public']['Enums']['game_status'],
      })
      .eq('id', gameId);

    if (updateError) {
      console.error('❌ Error updating game:', updateError);
      return;
    }

    // Call the settle_game_bets function
    const { data, error: settleError } = await supabase.rpc('settle_game_bets', {
      p_game_id: gameId,
    });

    if (settleError) {
      console.error('❌ Error settling bets:', settleError);
      return;
    }

    console.log(`\n✅ Successfully settled ${data} bets for game ${gameId}`);

    // Get details of settled bets
    const { data: settledBets, error: betsError } = await supabase
      .from('bets')
      .select(
        `
        id,
        user_id,
        bet_type,
        bet_details,
        stake,
        status,
        actual_win,
        users (username)
      `
      )
      .eq('game_id', gameId)
      .neq('status', 'pending');

    if (!betsError && settledBets && settledBets.length > 0) {
      console.log('\n📊 Settlement Details:');

      let totalWon = 0;
      let totalLost = 0;
      let wonCount = 0;
      let lostCount = 0;
      let pushCount = 0;

      settledBets.forEach((bet) => {
        const username = bet.users?.username || 'Unknown';
        const result = bet.status === 'won' ? '✅' : bet.status === 'lost' ? '❌' : '➖';
        const profit = bet.actual_win ? bet.actual_win - bet.stake : -bet.stake;

        console.log(
          `  ${result} ${username}: ${bet.bet_type} - $${(bet.stake / 100).toFixed(2)} → $${(profit / 100).toFixed(2)}`
        );

        if (bet.status === 'won') {
          wonCount++;
          totalWon += profit;
        } else if (bet.status === 'lost') {
          lostCount++;
          totalLost += bet.stake;
        } else {
          pushCount++;
        }
      });

      console.log('\n📈 Summary:');
      console.log(`  Won: ${wonCount} bets (+$${(totalWon / 100).toFixed(2)})`);
      console.log(`  Lost: ${lostCount} bets (-$${(totalLost / 100).toFixed(2)})`);
      console.log(`  Push: ${pushCount} bets`);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the settlement
settleBets();
