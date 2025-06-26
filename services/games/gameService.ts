import { supabase } from '@/services/supabase/client';
import { Game } from '@/types/database';
import { Storage, StorageKeys, CacheUtils } from '@/services/storage/storageService';
import { generateMockGames } from '@/scripts/data/mock-games';

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

      // For MVP, use mock data
      const mockGames = generateMockGames(7);

      // Transform mock games to our Game type
      const games: Game[] = mockGames.map((game) => ({
        id: game.id,
        sport: game.sport,
        sport_title: game.sport_title,
        home_team: game.home_team,
        away_team: game.away_team,
        commence_time: game.commence_time,
        status: game.status || 'scheduled',
        home_score: game.home_score ?? null,
        away_score: game.away_score ?? null,
        odds_data: game.odds_data as unknown as Game['odds_data'],
        created_at: game.created_at ?? null,
        last_updated: game.last_updated ?? null,
      }));

      // Cache the games
      this.cacheGames(games);

      return this.filterBySport(games, options?.sport);
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
