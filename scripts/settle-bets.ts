#!/usr/bin/env bun

import { Command } from 'commander';
import { settlementService } from '@/services/betting/settlementService';
import { gameService } from '@/services/games/gameService';
import readline from 'readline';

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

// Create readline interface for prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper to prompt for confirmation
function promptConfirmation(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(`${question} (y/N): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Helper to format currency
function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Helper to format timestamp
function getTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

const program = new Command();

program
  .name('settle-bets')
  .description('Settle bets for a completed game')
  .requiredOption('-g, --game-id <gameId>', 'Game ID to settle')
  .requiredOption('-h, --home-score <score>', 'Final home team score', parseInt)
  .requiredOption('-a, --away-score <score>', 'Final away team score', parseInt)
  .option('--dry-run', 'Preview settlement without executing')
  .option('--force', 'Skip confirmation prompt')
  .parse(process.argv);

const options = program.opts();

async function settleBets() {
  console.log(`\n🏈 Bet Settlement Script - ${getTimestamp()}`);
  console.log('=====================================');
  console.log(`Game ID: ${options.gameId}`);
  console.log(`Final Score: Home ${options.homeScore} - Away ${options.awayScore}`);

  try {
    // Fetch game details
    const game = await gameService.getGame(options.gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    console.log(`\n📋 Game: ${game.away_team} @ ${game.home_team}`);
    console.log(`🏀 Sport: ${game.sport_title}`);
    console.log(`📅 Started: ${new Date(game.commence_time).toLocaleString()}`);

    // Get pending bets
    const pendingBets = await settlementService.getPendingBetsForGame(options.gameId);
    console.log(`\n📊 Found ${pendingBets.length} pending bets`);

    if (pendingBets.length === 0) {
      console.log('✅ No bets to settle');
      rl.close();
      return;
    }

    // Preview settlement
    const preview = await settlementService.previewSettlement(
      pendingBets,
      game,
      options.homeScore,
      options.awayScore
    );

    console.log('\n📈 Settlement Preview:');
    console.log('=====================');
    console.log(`✅ Wins: ${preview.wins} bets (${formatCents(preview.totalWinnings)} profit)`);
    console.log(`❌ Losses: ${preview.losses} bets`);
    console.log(`➖ Pushes: ${preview.pushes} bets`);
    console.log(`💰 Total Staked: ${formatCents(preview.totalStaked)}`);
    console.log(`💸 Net Payout: ${formatCents(preview.netPayout)}`);

    // Show individual bet previews
    if (preview.betPreviews.length <= 10) {
      console.log('\n📋 Individual Bets:');
      preview.betPreviews.forEach((betPreview) => {
        const icon =
          betPreview.outcome === 'won' ? '✅' : betPreview.outcome === 'lost' ? '❌' : '➖';
        const profit =
          betPreview.outcome === 'won'
            ? betPreview.payout - betPreview.stake
            : betPreview.outcome === 'push'
              ? 0
              : -betPreview.stake;

        console.log(
          `  ${icon} ${betPreview.username}: ${betPreview.betType} - ` +
            `${formatCents(betPreview.stake)} → ${formatCents(profit)}`
        );
      });
    }

    if (options.dryRun) {
      console.log('\n🔍 --dry-run specified, exiting without settlement');
      rl.close();
      return;
    }

    // Confirm settlement
    if (!options.force) {
      const confirm = await promptConfirmation(
        `\n⚠️  Settle ${pendingBets.length} bets with these results?`
      );
      if (!confirm) {
        console.log('❌ Settlement cancelled');
        rl.close();
        return;
      }
    }

    // Execute settlement
    console.log(`\n⏳ Executing settlement at ${getTimestamp()}...`);
    const result = await settlementService.settleGame(
      options.gameId,
      options.homeScore,
      options.awayScore
    );

    console.log(`\n✅ Settlement Complete at ${getTimestamp()}!`);
    console.log('===================================');
    console.log(`📊 Settled: ${result.settledCount} bets`);
    console.log(`💰 Total paid out: ${formatCents(result.totalPaidOut)}`);
    console.log(`🏅 Badges updated for ${result.affectedUserIds.length} users`);

    if (result.errors.length > 0) {
      console.error('\n⚠️  Errors encountered:');
      result.errors.forEach((err) => console.error(`  - ${err}`));
    }

    console.log('\n✨ Settlement process completed successfully!');
  } catch (error) {
    console.error(`\n❌ Settlement failed at ${getTimestamp()}:`, error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the settlement
settleBets();
