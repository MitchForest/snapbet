#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '@/services/supabase/client';
import { Game } from '@/types/database-helpers';
import { Json } from '@/types/database';

export class OddsUpdateJob extends BaseJob {
  constructor() {
    super({
      name: 'odds-updates',
      description: 'Update odds and simulate line movements for upcoming games',
      schedule: '*/30 * * * *', // Every 30 minutes
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    // Get upcoming games within 24 hours
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const now = new Date();

    const { data: upcomingGames, error } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'scheduled')
      .gte('commence_time', now.toISOString())
      .lte('commence_time', tomorrow.toISOString())
      .order('commence_time', { ascending: true });

    if (error) throw error;
    if (!upcomingGames || upcomingGames.length === 0) {
      return {
        success: true,
        message: 'No upcoming games to update odds for',
        affected: 0,
      };
    }

    if (options.dryRun) {
      if (options.verbose) {
        console.log(`  📊 Would update odds for ${upcomingGames.length} games`);
        upcomingGames.forEach((game) => {
          console.log(
            `     ${game.away_team} @ ${game.home_team} (${new Date(game.commence_time).toLocaleString()})`
          );
        });
      }
      return {
        success: true,
        message: `Would update odds for ${upcomingGames.length} games`,
        affected: upcomingGames.length,
      };
    }

    let updatedCount = 0;
    const errors: string[] = [];
    const gamesToProcess = options.limit ? upcomingGames.slice(0, options.limit) : upcomingGames;

    for (const game of gamesToProcess) {
      try {
        const updatedOdds = this.simulateLineMovement(game as Game);

        const { error: updateError } = await supabase
          .from('games')
          .update({
            odds_data: updatedOdds as Json,
            last_updated: new Date().toISOString(),
          })
          .eq('id', game.id);

        if (updateError) throw updateError;
        updatedCount++;

        if (options.verbose) {
          const odds = updatedOdds as {
            bookmakers?: Array<{
              markets?: {
                spreads?: { line: number };
                totals?: { line: number };
              };
            }>;
          };
          const spread = odds.bookmakers?.[0]?.markets?.spreads?.line || 0;
          const total = odds.bookmakers?.[0]?.markets?.totals?.line || 0;
          console.log(`  📊 Updated: ${game.away_team} @ ${game.home_team}`);
          console.log(`     Spread: ${spread > 0 ? '+' : ''}${spread} | Total: ${total}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Game ${game.id}: ${errorMessage}`);
      }
    }

    return {
      success: errors.length === 0,
      message: `Updated odds for ${updatedCount}/${gamesToProcess.length} games`,
      affected: updatedCount,
      details: {
        totalGames: gamesToProcess.length,
        updated: updatedCount,
        errors: errors.slice(0, 5),
      },
    };
  }

  private simulateLineMovement(game: Game): unknown {
    const currentOdds = game.odds_data as unknown as {
      bookmakers?: Array<{
        key: string;
        markets: {
          h2h?: { home: number; away: number };
          spreads?: { line: number; home: number; away: number };
          totals?: { line: number; over: number; under: number };
        };
      }>;
    };

    if (!currentOdds?.bookmakers?.[0]) {
      // Initialize odds if missing
      return this.generateInitialOdds(game);
    }

    // const bookmaker = currentOdds.bookmakers[0]; // Not used
    const hoursUntilGame = this.getHoursUntilGame(game);

    // More movement closer to game time
    const movementFactor = hoursUntilGame < 6 ? 0.8 : hoursUntilGame < 12 ? 0.5 : 0.3;

    // Simulate different types of line movements
    const movementType = Math.random();

    if (movementType < 0.4 && currentOdds.bookmakers) {
      // Sharp money movement (bigger, one-sided)
      return this.applySharpMovement(
        currentOdds as { bookmakers: typeof currentOdds.bookmakers },
        movementFactor
      );
    } else if (movementType < 0.7 && currentOdds.bookmakers) {
      // Public betting movement (smaller, gradual)
      return this.applyPublicMovement(
        currentOdds as { bookmakers: typeof currentOdds.bookmakers },
        movementFactor
      );
    } else {
      // No movement
      return currentOdds;
    }
  }

  private generateInitialOdds(game: Game): unknown {
    const isNBA = game.sport === 'basketball_nba';
    const baseTotal = isNBA ? 225 : 45;
    const totalVariance = isNBA ? 10 : 5;
    const total = baseTotal + Math.random() * totalVariance * 2 - totalVariance;

    // Generate spread based on home/away teams (simplified)
    const spread = Math.random() * 10 - 5; // -5 to +5

    return {
      bookmakers: [
        {
          key: 'snapbet',
          markets: {
            h2h: {
              home: spread < 0 ? -150 : 130,
              away: spread < 0 ? 130 : -150,
            },
            spreads: {
              line: Math.round(spread * 2) / 2, // Round to nearest 0.5
              home: -110,
              away: -110,
            },
            totals: {
              line: Math.round(total),
              over: -110,
              under: -110,
            },
          },
        },
      ],
    };
  }

  private applySharpMovement(
    currentOdds: {
      bookmakers: Array<{
        key: string;
        markets: {
          h2h?: { home: number; away: number };
          spreads?: { line: number; home: number; away: number };
          totals?: { line: number; over: number; under: number };
        };
      }>;
    },
    factor: number
  ): unknown {
    const bookmaker = { ...currentOdds.bookmakers[0] };
    const markets = { ...bookmaker.markets };

    // Sharp money typically moves lines 0.5-2 points
    const spreadMovement = (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 1.5) * factor;
    const totalMovement = (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 1) * factor;

    // Update spread
    if (markets.spreads) {
      markets.spreads = {
        ...markets.spreads,
        line: Math.round((markets.spreads.line + spreadMovement) * 2) / 2,
      };

      // Adjust juice based on movement direction
      if (spreadMovement > 0) {
        markets.spreads.home = -115;
        markets.spreads.away = -105;
      } else {
        markets.spreads.home = -105;
        markets.spreads.away = -115;
      }
    }

    // Update total
    if (markets.totals) {
      markets.totals = {
        ...markets.totals,
        line: Math.round((markets.totals.line + totalMovement) * 2) / 2,
      };

      // Adjust juice
      if (totalMovement > 0) {
        markets.totals.over = -115;
        markets.totals.under = -105;
      } else {
        markets.totals.over = -105;
        markets.totals.under = -115;
      }
    }

    // Update moneyline based on spread movement
    if (markets.h2h && markets.spreads) {
      const newML = this.calculateMoneylineFromSpread(markets.spreads.line);
      markets.h2h = newML;
    }

    return {
      bookmakers: [
        {
          ...bookmaker,
          markets,
        },
      ],
    };
  }

  private applyPublicMovement(
    currentOdds: {
      bookmakers: Array<{
        key: string;
        markets: {
          h2h?: { home: number; away: number };
          spreads?: { line: number; home: number; away: number };
          totals?: { line: number; over: number; under: number };
        };
      }>;
    },
    factor: number
  ): unknown {
    const bookmaker = { ...currentOdds.bookmakers[0] };
    const markets = { ...bookmaker.markets };

    // Public money typically moves lines 0.5 points max
    const spreadMovement = (Math.random() < 0.5 ? -0.5 : 0.5) * factor;
    const totalMovement = (Math.random() < 0.5 ? -0.5 : 0.5) * factor;

    // Update spread
    if (markets.spreads) {
      markets.spreads = {
        ...markets.spreads,
        line: Math.round((markets.spreads.line + spreadMovement) * 2) / 2,
      };
    }

    // Update total
    if (markets.totals) {
      markets.totals = {
        ...markets.totals,
        line: Math.round((markets.totals.line + totalMovement) * 2) / 2,
      };
    }

    // Small moneyline adjustment
    if (markets.h2h) {
      const homeML = markets.h2h.home;
      const awayML = markets.h2h.away;

      markets.h2h = {
        home: homeML + (spreadMovement > 0 ? 5 : -5),
        away: awayML + (spreadMovement > 0 ? -5 : 5),
      };
    }

    return {
      bookmakers: [
        {
          ...bookmaker,
          markets,
        },
      ],
    };
  }

  private calculateMoneylineFromSpread(spread: number): { home: number; away: number } {
    // Convert spread to moneyline odds
    const absSpread = Math.abs(spread);
    let favoriteML: number;
    let underdogML: number;

    if (absSpread >= 10) {
      favoriteML = -400;
      underdogML = 320;
    } else if (absSpread >= 7) {
      favoriteML = -300;
      underdogML = 250;
    } else if (absSpread >= 3.5) {
      favoriteML = -200;
      underdogML = 170;
    } else if (absSpread >= 1) {
      favoriteML = -130;
      underdogML = 110;
    } else {
      favoriteML = -110;
      underdogML = -110;
    }

    return {
      home: spread < 0 ? favoriteML : underdogML,
      away: spread < 0 ? underdogML : favoriteML,
    };
  }

  private getHoursUntilGame(game: Game): number {
    const gameTime = new Date(game.commence_time);
    const now = new Date();
    return Math.max(0, (gameTime.getTime() - now.getTime()) / (1000 * 60 * 60));
  }
}

// CLI execution
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const job = new OddsUpdateJob();
  const options: JobOptions = {
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
  };

  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
  if (limitArg) {
    options.limit = parseInt(limitArg.split('=')[1], 10);
  }

  await job.execute(options);
}
