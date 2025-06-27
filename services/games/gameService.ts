import { supabase } from '@/services/supabase/client';
import { Game } from '@/types/database-helpers';
import type { Json } from '@/types/database';
import { Storage, StorageKeys, CacheUtils } from '@/services/storage/storageService';

// Types
export type Sport = 'NBA' | 'NFL' | 'all';

interface CachedGames {
  games: Game[];
  timestamp: number;
}

// Constants
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class GameService {
  // Fetch all games for today/upcoming
  async getGames(options?: { sport?: Sport }): Promise<Game[]> {
    try {
      // Check cache first
      const cached = this.getCachedGames();
      if (cached) {
        return this.filterBySport(cached, options?.sport);
      }

      // Fetch from database - only scheduled games
      const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .eq('status', 'scheduled')
        .order('commence_time', { ascending: true });

      if (error) throw error;

      const typedGames = (games || []) as Game[];

      // Cache the games
      this.cacheGames(typedGames);

      return this.filterBySport(typedGames, options?.sport);
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  }

  // Get single game by ID
  async getGame(gameId: string): Promise<Game | null> {
    try {
      const games = await this.getGames();
      return games.find((game) => game.id === gameId) || null;
    } catch (error) {
      console.error('Error fetching game:', error);
      return null;
    }
  }

  // Update game scores (for settlement)
  async updateGameScore(gameId: string, homeScore: number, awayScore: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('games')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          status: 'completed',
          last_updated: new Date().toISOString(),
        })
        .eq('id', gameId);

      if (error) throw error;

      // Clear cache to force refresh
      this.clearCache();
    } catch (error) {
      console.error('Error updating game score:', error);
      throw error;
    }
  }

  // Update game odds
  async updateOdds(
    gameId: string,
    oddsUpdate: {
      spread?: { line: number; home: number; away: number };
      total?: { line: number; over: number; under: number };
      moneyline?: { home: number; away: number };
    }
  ): Promise<void> {
    try {
      // Get current game
      const { data: game, error: fetchError } = await supabase
        .from('games')
        .select('odds_data')
        .eq('id', gameId)
        .single();

      if (fetchError || !game) throw new Error('Game not found');

      // Update odds data
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
          markets: {},
        };
      }

      const markets = currentOdds.bookmakers[0].markets;

      if (oddsUpdate.spread) {
        markets.spreads = oddsUpdate.spread;
      }
      if (oddsUpdate.total) {
        markets.totals = oddsUpdate.total;
      }
      if (oddsUpdate.moneyline) {
        markets.h2h = oddsUpdate.moneyline;
      }

      // Save updated odds
      const { error: updateError } = await supabase
        .from('games')
        .update({
          odds_data: currentOdds as unknown as Json,
          last_updated: new Date().toISOString(),
        })
        .eq('id', gameId);

      if (updateError) throw updateError;

      // Clear cache to force refresh
      this.clearCache();
    } catch (error) {
      console.error('Error updating odds:', error);
      throw error;
    }
  }

  // Get games by status
  async getGamesByStatus(status: Game['status']): Promise<Game[]> {
    const games = await this.getGames();
    return games.filter((game) => game.status === status);
  }

  // Check if any games are live
  async hasLiveGames(): Promise<boolean> {
    const games = await this.getGames();
    return games.some((game) => game.status === 'live');
  }

  // Private methods
  private filterBySport(games: Game[], sport?: Sport): Game[] {
    if (!sport || sport === 'all') return games;

    const sportFilter = sport === 'NBA' ? 'basketball_nba' : 'american_football_nfl';
    return games.filter((game) => game.sport === sportFilter);
  }

  private getCachedGames(): Game[] | null {
    const cached = Storage.games.get<CachedGames>(StorageKeys.GAMES.CACHED_GAMES);

    if (!cached) return null;

    // Check if cache is expired
    if (CacheUtils.isExpired(cached.timestamp, CACHE_TTL)) {
      Storage.games.delete(StorageKeys.GAMES.CACHED_GAMES);
      return null;
    }

    return cached.games;
  }

  private cacheGames(games: Game[]): void {
    const cacheData: CachedGames = {
      games,
      timestamp: Date.now(),
    };
    Storage.games.set(StorageKeys.GAMES.CACHED_GAMES, cacheData);
    Storage.games.set(StorageKeys.GAMES.LAST_FETCH, Date.now());
  }

  private clearCache(): void {
    Storage.games.delete(StorageKeys.GAMES.CACHED_GAMES);
    Storage.games.delete(StorageKeys.GAMES.LAST_FETCH);
  }
}

// Export singleton instance
export const gameService = new GameService();
