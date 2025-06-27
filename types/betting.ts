import { Json } from './database';

// Define the structure of odds data stored in the games table
export interface OddsData {
  bookmakers: Array<{
    key: string;
    markets: {
      h2h?: { home: number; away: number };
      spreads?: { line: number; home: number; away: number };
      totals?: { line: number; over: number; under: number };
    };
  }>;
}

// Type guard to check if Json is OddsData
export function isOddsData(data: unknown): data is OddsData {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  return (
    Array.isArray(obj.bookmakers) &&
    obj.bookmakers.every((bookmaker: unknown) => {
      if (!bookmaker || typeof bookmaker !== 'object' || Array.isArray(bookmaker)) {
        return false;
      }
      const b = bookmaker as Record<string, unknown>;
      return typeof b.key === 'string' && typeof b.markets === 'object' && b.markets !== null;
    })
  );
}

// Helper to safely get odds data
export function getOddsData(oddsData: Json | null | undefined): OddsData | null {
  if (isOddsData(oddsData)) {
    return oddsData;
  }
  return null;
}
