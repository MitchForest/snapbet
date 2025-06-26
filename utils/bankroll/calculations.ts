/**
 * Calculate available balance (total - pending bets)
 */
export function getAvailableBalance(balance: number, pendingBets: { stake: number }[]): number {
  const pendingTotal = pendingBets.reduce((sum, bet) => sum + bet.stake, 0);
  return Math.max(0, balance - pendingTotal);
}

/**
 * Calculate weekly profit/loss
 */
export function calculateWeeklyPL(currentBalance: number, weeklyDeposit: number): number {
  return currentBalance - weeklyDeposit;
}

/**
 * Calculate weekly ROI percentage
 */
export function calculateWeeklyROI(currentBalance: number, weeklyDeposit: number): number {
  if (weeklyDeposit === 0) return 0;
  const pl = calculateWeeklyPL(currentBalance, weeklyDeposit);
  return (pl / weeklyDeposit) * 100;
}

/**
 * Format cents to display string with commas
 */
export function formatCentsToDisplay(cents: number): string {
  return (cents / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format cents to currency with decimals
 */
export function formatCentsToCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Get bankroll color based on P&L
 */
export function getBankrollColor(weeklyPL: number): 'success' | 'error' | 'neutral' {
  if (weeklyPL > 0) return 'success';
  if (weeklyPL < 0) return 'error';
  return 'neutral';
}

/**
 * Calculate total weekly deposit (base + referral bonus)
 */
export function calculateWeeklyDeposit(referralCount: number): number {
  const BASE_BANKROLL = 100000; // $1,000 in cents
  const REFERRAL_BONUS = 10000; // $100 in cents
  return BASE_BANKROLL + referralCount * REFERRAL_BONUS;
}

/**
 * Format time until next reset
 */
export function formatTimeUntilReset(nextReset: Date): string {
  const now = new Date();
  const msRemaining = nextReset.getTime() - now.getTime();

  const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Get next Monday at midnight
 */
export function getNextMondayMidnight(): Date {
  const now = new Date();
  const nextMonday = new Date(now);

  // Set to next Monday
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
  nextMonday.setDate(now.getDate() + daysUntilMonday);

  // Set to midnight
  nextMonday.setHours(0, 0, 0, 0);

  return nextMonday;
}
