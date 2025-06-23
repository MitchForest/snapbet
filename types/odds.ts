/**
 * Mock odds data structure following The Odds API format
 * https://the-odds-api.com/
 */

export interface MockOdds {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Markets;
}

export interface Markets {
  h2h?: H2HMarket;
  spreads?: SpreadMarket[];
  totals?: TotalMarket[];
}

export interface H2HMarket {
  home_team: string;
  away_team: string;
  home_price: number;
  away_price: number;
}

export interface SpreadMarket {
  home_team: string;
  away_team: string;
  home_point: number;
  away_point: number;
  home_price: number;
  away_price: number;
}

export interface TotalMarket {
  point: number;
  over_price: number;
  under_price: number;
}

// Simplified structure for our app
export interface SimplifiedOdds {
  gameId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: Date;
  markets: {
    moneyline?: {
      home: number;
      away: number;
    };
    spread?: {
      line: number;
      homeOdds: number;
      awayOdds: number;
    };
    total?: {
      line: number;
      overOdds: number;
      underOdds: number;
    };
  };
}

// Sport keys used by The Odds API
export enum SportKey {
  NFL = 'americanfootball_nfl',
  NBA = 'basketball_nba',
  MLB = 'baseball_mlb',
  NHL = 'icehockey_nhl',
  NCAAF = 'americanfootball_ncaaf',
  NCAAB = 'basketball_ncaab',
}

// Helper function to convert API odds to our simplified format
export function convertToSimplifiedOdds(apiOdds: MockOdds): SimplifiedOdds {
  const bookmaker = apiOdds.bookmakers[0]; // Use first bookmaker for simplicity

  const simplified: SimplifiedOdds = {
    gameId: apiOdds.id,
    sport: apiOdds.sport_key,
    homeTeam: apiOdds.home_team,
    awayTeam: apiOdds.away_team,
    commenceTime: new Date(apiOdds.commence_time),
    markets: {},
  };

  // Convert moneyline (h2h)
  if (bookmaker?.markets.h2h) {
    simplified.markets.moneyline = {
      home: bookmaker.markets.h2h.home_price,
      away: bookmaker.markets.h2h.away_price,
    };
  }

  // Convert spread
  if (bookmaker?.markets.spreads?.[0]) {
    const spread = bookmaker.markets.spreads[0];
    simplified.markets.spread = {
      line: spread.home_point,
      homeOdds: spread.home_price,
      awayOdds: spread.away_price,
    };
  }

  // Convert total
  if (bookmaker?.markets.totals?.[0]) {
    const total = bookmaker.markets.totals[0];
    simplified.markets.total = {
      line: total.point,
      overOdds: total.over_price,
      underOdds: total.under_price,
    };
  }

  return simplified;
}
