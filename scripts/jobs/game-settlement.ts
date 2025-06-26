#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '@/services/supabase/client';
import { settlementService } from '@/services/betting/settlementService';

export class GameSettlementJob extends BaseJob {
  constructor() {
    super({
      name: 'game-settlement',
      description: 'Settle completed games and update bet outcomes',
      schedule: '*/30 * * * *', // Every 30 minutes
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    // Get games that are completed but not settled
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

    const { data: gamesToSettle, error } = await supabase
      .from('games')
      .select('*')
      .lt('commence_time', oneHourAgo) // Game started at least 1 hour ago
      .neq('status', 'completed')
      .not('home_score', 'is', null)
      .not('away_score', 'is', null)
      .order('commence_time');

    if (error) throw error;

    if (!gamesToSettle || gamesToSettle.length === 0) {
      return {
        success: true,
        message: 'No games to settle',
        affected: 0,
      };
    }

    if (options.dryRun) {
      if (options.verbose) {
        console.log('  🏈 Games to settle:');
        gamesToSettle.forEach((game) => {
          console.log(`    ${game.away_team} @ ${game.home_team} (${game.commence_time})`);
        });
      }
      return {
        success: true,
        message: `Would settle ${gamesToSettle.length} games`,
        affected: gamesToSettle.length,
      };
    }

    let settledCount = 0;
    let betCount = 0;
    const errors: string[] = [];

    // Apply limit if specified
    const gamesToProcess = options.limit ? gamesToSettle.slice(0, options.limit) : gamesToSettle;

    for (const game of gamesToProcess) {
      try {
        if (options.verbose) {
          console.log(`  🏈 Settling ${game.away_team} @ ${game.home_team}...`);
        }

        // Use the settlement service to settle the game with scores
        const result = await settlementService.settleGame(
          game.id,
          game.home_score!,
          game.away_score!
        );

        settledCount++;
        betCount += result.settledCount;

        if (options.verbose) {
          console.log(`    ✅ Settled ${result.settledCount} bets`);
        }

        if (result.errors.length > 0) {
          errors.push(...result.errors.map((e) => `Game ${game.id}: ${e}`));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Game ${game.id}: ${message}`);
        console.error(`Failed to settle game ${game.id}:`, error);
      }
    }

    return {
      success: errors.length === 0,
      message: `Settled ${settledCount} games with ${betCount} bets`,
      affected: betCount,
      details: {
        gamesSettled: settledCount,
        betsSettled: betCount,
        errors: errors.length > 0 ? errors : undefined,
      },
    };
  }
}

// CLI execution
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const job = new GameSettlementJob();
  await job.execute({
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
    limit: process.argv.includes('--limit')
      ? parseInt(process.argv[process.argv.indexOf('--limit') + 1])
      : undefined,
  });
}
