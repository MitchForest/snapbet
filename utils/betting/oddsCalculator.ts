/**
 * Odds calculation utilities for American odds format
 */

/**
 * Convert American odds to decimal format
 * @param odds American odds (e.g., -110, +150)
 * @returns Decimal odds
 */
export function americanToDecimal(odds: number): number {
  if (odds > 0) {
    return odds / 100 + 1;
  } else {
    return 100 / Math.abs(odds) + 1;
  }
}

/**
 * Calculate payout from stake and American odds
 * @param stake Bet amount in cents
 * @param odds American odds
 * @returns Payout details
 */
export function calculatePayout(
  stake: number,
  odds: number
): {
  toWin: number;
  totalReturn: number;
} {
  const decimal = americanToDecimal(odds);
  const toWin = Math.floor(stake * (decimal - 1));
  const totalReturn = stake + toWin;
  return { toWin, totalReturn };
}

/**
 * Format money for display (cents to dollars)
 * @param cents Amount in cents
 * @returns Formatted dollar string
 */
export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Convert dollar input to cents
 * @param dollars Dollar amount as string
 * @returns Amount in cents
 */
export function formatMoneyInput(dollars: string): number {
  const amount = parseFloat(dollars);
  if (isNaN(amount)) return 0;
  return Math.round(amount * 100);
}

/**
 * Format American odds for display
 * @param odds American odds
 * @returns Formatted odds string with + or -
 */
export function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

/**
 * Calculate implied probability from American odds
 * @param odds American odds
 * @returns Implied probability as percentage
 */
export function calculateImpliedProbability(odds: number): number {
  if (odds > 0) {
    return (100 / (odds + 100)) * 100;
  } else {
    return (Math.abs(odds) / (Math.abs(odds) + 100)) * 100;
  }
}
