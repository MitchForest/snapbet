import { Game } from '@/types/database';
import { Bet, BetType } from '@/services/betting/types';

interface BetInput {
  gameId: string;
  betType: BetType;
  selection: any;
  stake: number;
  odds: number;
}

interface SpreadSelection {
  team: string;
  line: number;
}

interface TotalSelection {
  type: 'over' | 'under';
  line: number;
}

interface MoneylineSelection {
  team: string;
}

/**
 * Calculate the opposite bet for fading
 */
export function calculateFadeBet(originalBet: Bet, game: Game): Partial<BetInput> {
  switch (originalBet.bet_type) {
    case 'spread':
      return {
        betType: 'spread',
        selection: getFadeSpread(originalBet.bet_details, game),
        odds: -110, // Standard spread odds
      };

    case 'total':
      return {
        betType: 'total',
        selection: getFadeTotal(originalBet.bet_details),
        odds: -110, // Standard total odds
      };

    case 'moneyline':
      return {
        betType: 'moneyline',
        selection: getFadeMoneyline(originalBet.bet_details, game),
        odds: getFadeMoneylineOdds(originalBet.bet_details, game),
      };

    default:
      throw new Error(`Unknown bet type: ${originalBet.bet_type}`);
  }
}

/**
 * Get opposite spread bet
 */
export function getFadeSpread(original: any, game: Game): SpreadSelection {
  const oppositeTeam = original.team === game.home_team ? game.away_team : game.home_team;

  // Line flips to opposite team
  const oppositeLine = -original.line;

  return {
    team: oppositeTeam,
    line: oppositeLine,
  };
}

/**
 * Get opposite total bet
 */
export function getFadeTotal(original: any): TotalSelection {
  return {
    type: original.total_type === 'over' ? 'under' : 'over',
    line: original.line,
  };
}

/**
 * Get opposite moneyline bet
 */
export function getFadeMoneyline(original: any, game: Game): MoneylineSelection {
  const oppositeTeam = original.team === game.home_team ? game.away_team : game.home_team;

  return {
    team: oppositeTeam,
  };
}

/**
 * Get moneyline odds for the opposite team
 */
export function getFadeMoneylineOdds(original: any, game: Game): number {
  // Access the odds from the game data structure
  const oddsData = game.odds_data?.bookmakers?.[0]?.markets?.h2h;

  if (!oddsData) {
    throw new Error('No odds data available for this game');
  }

  // Return opposite team's odds
  return original.team === game.home_team ? oddsData.away : oddsData.home;
}

/**
 * Format bet details for display
 */
export function formatBetDetails(bet: Bet): string {
  if (!bet.bet_details) return 'Unknown bet';

  const details = bet.bet_details as any;

  switch (bet.bet_type) {
    case 'spread':
      return `${details.team} ${details.line > 0 ? '+' : ''}${details.line}`;

    case 'total':
      return `${details.total_type} ${details.line}`;

    case 'moneyline':
      return details.team;

    default:
      return 'Unknown bet';
  }
}

/**
 * Format odds for display
 */
export function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}
