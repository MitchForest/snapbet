import { Bet, BetWithGame } from '@/services/betting/types';

export interface BetOutcome {
  status: 'won' | 'lost' | 'push';
  winAmount: number; // Amount won (not including stake)
}

/**
 * Calculate bet outcome for preview purposes
 * Note: Actual settlement is handled by the database function
 */
export function calculateBetOutcome(bet: Bet, homeScore: number, awayScore: number): BetOutcome {
  switch (bet.bet_type) {
    case 'spread':
      return calculateSpreadOutcome(bet, homeScore, awayScore);
    case 'total':
      return calculateTotalOutcome(bet, homeScore, awayScore);
    case 'moneyline':
      return calculateMoneylineOutcome(bet, homeScore, awayScore);
    default:
      throw new Error(`Unknown bet type: ${bet.bet_type}`);
  }
}

/**
 * Calculate spread bet outcome
 * Home spread = home_score - away_score
 * For away team bets, use negative home spread
 */
function calculateSpreadOutcome(bet: Bet, homeScore: number, awayScore: number): BetOutcome {
  const betDetails = bet.bet_details as { team: string; line: number };
  const { team, line } = betDetails;

  // Get the game from bet relation if available, otherwise construct team check
  const homeTeam = (bet as BetWithGame & { game?: { home_team?: string } }).game?.home_team;
  const isHomeBet = homeTeam ? team === homeTeam : team.includes('home');

  const homeSpread = homeScore - awayScore;

  // Calculate cover margin
  let coverMargin: number;
  if (isHomeBet) {
    // Home team perspective: they need to win by more than -line
    // If line is -7, home needs to win by more than 7
    coverMargin = homeSpread + line;
  } else {
    // Away team perspective: they need to lose by less than -line
    // If line is +7, away can lose by up to 6
    coverMargin = -homeSpread + line;
  }

  if (coverMargin > 0) {
    return {
      status: 'won',
      winAmount: bet.potential_win,
    };
  } else if (coverMargin < 0) {
    return {
      status: 'lost',
      winAmount: 0,
    };
  } else {
    // Push - exact cover
    return {
      status: 'push',
      winAmount: 0,
    };
  }
}

/**
 * Calculate total (over/under) bet outcome
 */
function calculateTotalOutcome(bet: Bet, homeScore: number, awayScore: number): BetOutcome {
  const betDetails = bet.bet_details as { total_type: 'over' | 'under'; line: number };
  const { total_type, line } = betDetails;
  const actualTotal = homeScore + awayScore;

  if (actualTotal === line) {
    // Push on exact total
    return {
      status: 'push',
      winAmount: 0,
    };
  }

  const overHit = actualTotal > line;
  const betWon = (total_type === 'over' && overHit) || (total_type === 'under' && !overHit);

  return {
    status: betWon ? 'won' : 'lost',
    winAmount: betWon ? bet.potential_win : 0,
  };
}

/**
 * Calculate moneyline bet outcome
 * No pushes in moneyline (except rare NFL ties)
 */
function calculateMoneylineOutcome(bet: Bet, homeScore: number, awayScore: number): BetOutcome {
  const betDetails = bet.bet_details as { team: string };
  const { team } = betDetails;

  // Get the game from bet relation if available
  const homeTeam = (bet as BetWithGame & { game?: { home_team?: string } }).game?.home_team;
  const isHomeBet = homeTeam ? team === homeTeam : team.includes('home');

  // Check for tie (rare in NFL, not possible in NBA)
  if (homeScore === awayScore) {
    // In the rare case of a tie, it's a push
    return {
      status: 'push',
      winAmount: 0,
    };
  }

  const homeWon = homeScore > awayScore;
  const betWon = (isHomeBet && homeWon) || (!isHomeBet && !homeWon);

  return {
    status: betWon ? 'won' : 'lost',
    winAmount: betWon ? bet.potential_win : 0,
  };
}
