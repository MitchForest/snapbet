import { BetInput, ValidationResult } from '@/services/betting/types';
import { Game } from '@/types/database';

/**
 * Validate a bet input
 * @param input Bet input to validate
 * @param availableBankroll User's available bankroll in cents
 * @param game Game details
 * @returns Validation result
 */
export function validateBet(
  input: BetInput,
  availableBankroll: number,
  game: Game
): ValidationResult {
  // Check minimum bet ($5 = 500 cents)
  if (input.stake < 500) {
    return { isValid: false, error: 'Minimum bet is $5' };
  }

  // Check bankroll
  if (input.stake > availableBankroll) {
    return { isValid: false, error: 'Insufficient funds' };
  }

  // Check game hasn't started
  if (new Date(game.commence_time) < new Date()) {
    return { isValid: false, error: 'Game has already started' };
  }

  // Validate odds exist for bet type
  const gameOdds = game.odds_data?.bookmakers?.[0]?.markets;
  if (!gameOdds) {
    return { isValid: false, error: 'Odds not available for this game' };
  }

  // Validate based on bet type
  switch (input.betType) {
    case 'spread':
      if (!input.selection.team || input.selection.line === undefined) {
        return { isValid: false, error: 'Invalid spread bet selection' };
      }
      if (!gameOdds.spreads) {
        return { isValid: false, error: 'Spread betting not available' };
      }
      break;

    case 'total':
      if (!input.selection.totalType || input.selection.line === undefined) {
        return { isValid: false, error: 'Invalid total bet selection' };
      }
      if (!gameOdds.totals) {
        return { isValid: false, error: 'Total betting not available' };
      }
      break;

    case 'moneyline':
      if (!input.selection.team) {
        return { isValid: false, error: 'Invalid moneyline bet selection' };
      }
      if (!gameOdds.h2h) {
        return { isValid: false, error: 'Moneyline betting not available' };
      }
      break;

    default:
      return { isValid: false, error: 'Invalid bet type' };
  }

  return { isValid: true };
}

/**
 * Check if a game is eligible for betting
 * @param game Game to check
 * @returns True if game can be bet on
 */
export function isGameBettable(game: Game): boolean {
  // Game must not have started
  if (new Date(game.commence_time) <= new Date()) {
    return false;
  }

  // Game must have odds
  if (!game.odds_data?.bookmakers?.length) {
    return false;
  }

  // Game must be scheduled (not cancelled)
  if (game.status !== 'scheduled') {
    return false;
  }

  return true;
}

/**
 * Get the maximum bet amount based on available bankroll
 * @param availableBankroll Available bankroll in cents
 * @returns Maximum bet amount in cents
 */
export function getMaxBet(availableBankroll: number): number {
  // For MVP, max bet is entire bankroll
  return availableBankroll;
}

/**
 * Validate stake amount
 * @param stake Stake amount in cents
 * @param availableBankroll Available bankroll in cents
 * @returns Error message if invalid, null if valid
 */
export function validateStake(stake: number, availableBankroll: number): string | null {
  if (stake < 500) {
    return 'Minimum bet is $5';
  }

  if (stake > availableBankroll) {
    return 'Insufficient funds';
  }

  if (!Number.isInteger(stake)) {
    return 'Invalid bet amount';
  }

  return null;
}
