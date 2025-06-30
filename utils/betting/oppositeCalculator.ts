import { Game } from '@/types/database-helpers';
import { Bet, BetType } from '@/services/betting/types';
import { getOddsData } from '@/types/betting';

interface BetInput {
  gameId: string;
  betType: BetType;
  selection: SpreadSelection | TotalSelection | MoneylineSelection;
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
  if (!originalBet.bet_details || typeof originalBet.bet_details !== 'object') {
    throw new Error('Invalid bet details');
  }

  const details = originalBet.bet_details as Record<string, unknown>;

  switch (originalBet.bet_type) {
    case 'spread':
      return {
        betType: 'spread',
        selection: getFadeSpread(details, game),
        odds: -110, // Standard spread odds
      };

    case 'total':
      return {
        betType: 'total',
        selection: getFadeTotal(details),
        odds: -110, // Standard total odds
      };

    case 'moneyline':
      return {
        betType: 'moneyline',
        selection: getFadeMoneyline(details, game),
        odds: getFadeMoneylineOdds(details, game),
      };

    default:
      throw new Error(`Unknown bet type: ${originalBet.bet_type}`);
  }
}

/**
 * Get opposite spread bet
 */
export function getFadeSpread(original: Record<string, unknown>, game: Game): SpreadSelection {
  const oppositeTeam = original.team === game.home_team ? game.away_team : game.home_team;

  // Line flips to opposite team
  const oppositeLine = -(original.line as number);

  return {
    team: oppositeTeam,
    line: oppositeLine,
  };
}

/**
 * Get opposite total bet
 */
export function getFadeTotal(original: Record<string, unknown>): TotalSelection {
  return {
    type: original.total_type === 'over' ? 'under' : 'over',
    line: original.line as number,
  };
}

/**
 * Get opposite moneyline bet
 */
export function getFadeMoneyline(
  original: Record<string, unknown>,
  game: Game
): MoneylineSelection {
  const oppositeTeam = original.team === game.home_team ? game.away_team : game.home_team;

  return {
    team: oppositeTeam,
  };
}

/**
 * Get moneyline odds for the opposite team
 */
export function getFadeMoneylineOdds(original: Record<string, unknown>, game: Game): number {
  // Access the odds from the game data structure
  const oddsData = getOddsData(game.odds_data);
  const h2h = oddsData?.bookmakers?.[0]?.markets?.h2h;

  if (!h2h) {
    throw new Error('No odds data available for this game');
  }

  // Return opposite team's odds
  return original.team === game.home_team ? h2h.away : h2h.home;
}

/**
 * Format bet details for display
 */
export function formatBetDetails(bet: Bet, game?: Game): string {
  if (!bet.bet_details) return 'Unknown bet';

  const details = bet.bet_details as Record<string, unknown>;

  switch (bet.bet_type) {
    case 'spread':
      return `${details.team as string} ${(details.line as number) > 0 ? '+' : ''}${details.line}`;

    case 'total': {
      const totalLine = `${details.total_type as string} ${details.line}`;
      if (game) {
        return `${game.home_team} vs ${game.away_team} ${totalLine}`;
      }
      return totalLine;
    }

    case 'moneyline':
      return details.team as string;

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
