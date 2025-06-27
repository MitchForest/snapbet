#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '@/services/supabase/client';
import { Game } from '@/types/database';

export class GameUpdateJob extends BaseJob {
  constructor() {
    super({
      name: 'game-updates',
      description: 'Update game scores and status for live and recently completed games',
      schedule: '*/5 * * * *', // Every 5 minutes
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    let totalUpdated = 0;
    const details: Record<string, number> = {};

    // 1. Update live games
    const liveGamesUpdated = await this.updateLiveGames(options);
    totalUpdated += liveGamesUpdated;
    details.liveGames = liveGamesUpdated;

    // 2. Complete finished games
    const completedGames = await this.completeFinishedGames(options);
    totalUpdated += completedGames;
    details.completedGames = completedGames;

    // 3. Start games that should be live
    const startedGames = await this.startGames(options);
    totalUpdated += startedGames;
    details.startedGames = startedGames;

    return {
      success: true,
      message: `Updated ${totalUpdated} games (${liveGamesUpdated} live, ${completedGames} completed, ${startedGames} started)`,
      affected: totalUpdated,
      details,
    };
  }

  private async updateLiveGames(options: JobOptions): Promise<number> {
    // Get games that are currently live
    const { data: liveGames, error } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'live')
      .order('commence_time', { ascending: true });

    if (error) throw error;
    if (!liveGames || liveGames.length === 0) return 0;

    if (options.dryRun) {
      if (options.verbose) {
        console.log(`  🏈 Would update ${liveGames.length} live games`);
        liveGames.forEach((game) => {
          console.log(`     ${game.away_team} @ ${game.home_team}`);
        });
      }
      return liveGames.length;
    }

    let updatedCount = 0;
    const gamesToProcess = options.limit ? liveGames.slice(0, options.limit) : liveGames;

    for (const game of gamesToProcess) {
      try {
        const scores = this.generateRealisticScores(game as Game);

        const { error: updateError } = await supabase
          .from('games')
          .update({
            home_score: scores.home,
            away_score: scores.away,
            last_updated: new Date().toISOString(),
          })
          .eq('id', game.id);

        if (updateError) throw updateError;
        updatedCount++;

        if (options.verbose) {
          console.log(
            `  🏈 Updated: ${game.away_team} ${scores.away} @ ${game.home_team} ${scores.home}`
          );
        }
      } catch (error) {
        console.error(`Failed to update game ${game.id}:`, error);
      }
    }

    return updatedCount;
  }

  private async completeFinishedGames(options: JobOptions): Promise<number> {
    // Get live games that should be finished (3+ hours after start)
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

    const { data: gamesToComplete, error } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'live')
      .lt('commence_time', threeHoursAgo.toISOString());

    if (error) throw error;
    if (!gamesToComplete || gamesToComplete.length === 0) return 0;

    if (options.dryRun) {
      if (options.verbose) {
        console.log(`  ✅ Would complete ${gamesToComplete.length} games`);
      }
      return gamesToComplete.length;
    }

    let completedCount = 0;
    const games = options.limit ? gamesToComplete.slice(0, options.limit) : gamesToComplete;

    for (const game of games) {
      try {
        // Generate final scores if not already set
        const finalScores =
          game.home_score !== null && game.away_score !== null
            ? { home: game.home_score, away: game.away_score }
            : this.generateFinalScores(game as Game);

        const { error: updateError } = await supabase
          .from('games')
          .update({
            status: 'completed',
            home_score: finalScores.home,
            away_score: finalScores.away,
            last_updated: new Date().toISOString(),
          })
          .eq('id', game.id);

        if (updateError) throw updateError;
        completedCount++;

        if (options.verbose) {
          console.log(
            `  ✅ Completed: ${game.away_team} ${finalScores.away} @ ${game.home_team} ${finalScores.home}`
          );
        }
      } catch (error) {
        console.error(`Failed to complete game ${game.id}:`, error);
      }
    }

    return completedCount;
  }

  private async startGames(options: JobOptions): Promise<number> {
    // Get scheduled games that should be live
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    const { data: gamesToStart, error } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'scheduled')
      .lt('commence_time', now.toISOString())
      .gt('commence_time', thirtyMinutesAgo.toISOString());

    if (error) throw error;
    if (!gamesToStart || gamesToStart.length === 0) return 0;

    if (options.dryRun) {
      if (options.verbose) {
        console.log(`  🎮 Would start ${gamesToStart.length} games`);
      }
      return gamesToStart.length;
    }

    let startedCount = 0;
    const games = options.limit ? gamesToStart.slice(0, options.limit) : gamesToStart;

    for (const game of games) {
      try {
        const { error: updateError } = await supabase
          .from('games')
          .update({
            status: 'live',
            home_score: 0,
            away_score: 0,
            last_updated: new Date().toISOString(),
          })
          .eq('id', game.id);

        if (updateError) throw updateError;
        startedCount++;

        if (options.verbose) {
          console.log(`  🎮 Started: ${game.away_team} @ ${game.home_team}`);
        }
      } catch (error) {
        console.error(`Failed to start game ${game.id}:`, error);
      }
    }

    return startedCount;
  }

  private generateRealisticScores(game: Game): { home: number; away: number } {
    // Use the spread to influence scores
    const oddsData = game.odds_data as unknown as {
      bookmakers?: Array<{
        markets?: {
          spreads?: { line: number };
        };
      }>;
    };

    const spread = oddsData?.bookmakers?.[0]?.markets?.spreads?.line || 0;
    const gameMinutesElapsed = this.getGameMinutesElapsed(game);
    const progressFactor = gameMinutesElapsed / this.getTotalGameMinutes(game.sport);

    if (game.sport === 'basketball_nba') {
      return this.generateNBAScores(
        spread,
        progressFactor,
        game.home_score || 0,
        game.away_score || 0
      );
    } else if (game.sport === 'american_football_nfl') {
      return this.generateNFLScores(
        spread,
        progressFactor,
        game.home_score || 0,
        game.away_score || 0
      );
    }

    // Default for unknown sports
    return { home: game.home_score || 0, away: game.away_score || 0 };
  }

  private generateNBAScores(
    spread: number,
    progress: number,
    currentHome: number,
    currentAway: number
  ): { home: number; away: number } {
    // NBA games average ~220 total points
    const expectedTotal = 220 * progress;
    const currentTotal = currentHome + currentAway;

    if (currentTotal >= expectedTotal) {
      return { home: currentHome, away: currentAway };
    }

    // Add points based on expected pace
    const pointsToAdd = Math.floor((expectedTotal - currentTotal) / 2);
    const homeAdvantage = spread < 0 ? Math.abs(spread) * progress : 0;
    const awayAdvantage = spread > 0 ? Math.abs(spread) * progress : 0;

    // Add some randomness
    const homeRandom = Math.floor(Math.random() * 5) - 2;
    const awayRandom = Math.floor(Math.random() * 5) - 2;

    return {
      home: currentHome + pointsToAdd + Math.floor(homeAdvantage) + homeRandom,
      away: currentAway + pointsToAdd + Math.floor(awayAdvantage) + awayRandom,
    };
  }

  private generateNFLScores(
    spread: number,
    progress: number,
    currentHome: number,
    currentAway: number
  ): { home: number; away: number } {
    // NFL games average ~45 total points
    const expectedTotal = 45 * progress;
    const currentTotal = currentHome + currentAway;

    if (currentTotal >= expectedTotal) {
      return { home: currentHome, away: currentAway };
    }

    // NFL scoring is chunkier (3, 7 points at a time)
    const scoringPlays = Math.floor((expectedTotal - currentTotal) / 5);
    let homePoints = currentHome;
    let awayPoints = currentAway;

    for (let i = 0; i < scoringPlays; i++) {
      const scoringTeam = Math.random() < 0.5 + spread / 50 ? 'home' : 'away';
      const scoreType = Math.random();

      if (scoreType < 0.4) {
        // Field goal
        if (scoringTeam === 'home') homePoints += 3;
        else awayPoints += 3;
      } else if (scoreType < 0.9) {
        // Touchdown + extra point
        if (scoringTeam === 'home') homePoints += 7;
        else awayPoints += 7;
      } else {
        // Touchdown + 2pt conversion
        if (scoringTeam === 'home') homePoints += 8;
        else awayPoints += 8;
      }
    }

    return { home: homePoints, away: awayPoints };
  }

  private generateFinalScores(game: Game): { home: number; away: number } {
    // Generate complete game scores based on odds
    const oddsData = game.odds_data as unknown as {
      bookmakers?: Array<{
        markets?: {
          spreads?: { line: number };
          totals?: { line: number };
        };
      }>;
    };

    const spread = oddsData?.bookmakers?.[0]?.markets?.spreads?.line || 0;
    const total =
      oddsData?.bookmakers?.[0]?.markets?.totals?.line ||
      (game.sport === 'basketball_nba' ? 220 : 45);

    // Calculate scores based on spread and total
    const homeScore = Math.floor(total / 2 - spread / 2);
    const awayScore = Math.floor(total / 2 + spread / 2);

    // Add some variance
    const variance = game.sport === 'basketball_nba' ? 10 : 3;
    const homeVariance = Math.floor(Math.random() * variance * 2) - variance;
    const awayVariance = Math.floor(Math.random() * variance * 2) - variance;

    return {
      home: Math.max(0, homeScore + homeVariance),
      away: Math.max(0, awayScore + awayVariance),
    };
  }

  private getGameMinutesElapsed(game: Game): number {
    if (!game.commence_time) return 0;
    const start = new Date(game.commence_time);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
  }

  private getTotalGameMinutes(sport: string): number {
    switch (sport) {
      case 'basketball_nba':
        return 48; // 4 quarters × 12 minutes
      case 'american_football_nfl':
        return 60; // 4 quarters × 15 minutes
      default:
        return 90; // Default to soccer length
    }
  }
}

// CLI execution
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const job = new GameUpdateJob();
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
