import { supabase } from '@/services/supabase/client';
import { bettingService } from './bettingService';
import { DeviceEventEmitter } from 'react-native';
import { Json } from '@/types/supabase-generated';

// Extend the generated type to include weekly_deposit until types are regenerated
export interface Bankroll {
  user_id: string;
  balance: number;
  weekly_deposit: number; // Added in migration 017
  total_wagered: number;
  total_won: number;
  win_count: number;
  loss_count: number;
  push_count: number;
  biggest_win: number | null;
  biggest_loss: number | null;
  season_high: number | null;
  season_low: number | null;
  last_reset: string | null;
  reset_count: number | null;
  created_at: string | null;
  updated_at: string | null;
  stats_metadata: Record<string, unknown> | null;
  referral_bonus: number | null;
}

export interface BankrollTransaction {
  type: 'bet_placed' | 'bet_won' | 'bet_lost' | 'bet_push' | 'weekly_reset';
  amount: number;
  betId?: string;
  timestamp: string;
}

export interface WeeklySnapshot {
  weekEnding: string;
  startBalance: number;
  endBalance: number;
  totalBets: number;
  totalWins: number;
  totalLosses: number;
  netPL: number;
  roi: number;
}

class BankrollService {
  private static instance: BankrollService;

  private constructor() {}

  static getInstance(): BankrollService {
    if (!BankrollService.instance) {
      BankrollService.instance = new BankrollService();
    }
    return BankrollService.instance;
  }

  /**
   * Get current bankroll with metadata
   */
  async getBankroll(userId: string): Promise<Bankroll> {
    const { data, error } = await supabase
      .from('bankrolls')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching bankroll:', error);
      throw new Error('Failed to fetch bankroll');
    }

    // Cast to our extended interface that includes weekly_deposit
    // This is temporary until types are regenerated after migration
    return data as unknown as Bankroll;
  }

  /**
   * Update bankroll balance with transaction logging
   */
  async updateBalance(
    userId: string,
    amount: number,
    type: BankrollTransaction['type'],
    betId?: string
  ): Promise<void> {
    try {
      // Update balance based on transaction type
      const updateAmount = type === 'bet_placed' ? -amount : amount;

      // Get current balance first
      const { data: currentBankroll } = await supabase
        .from('bankrolls')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (!currentBankroll) throw new Error('Bankroll not found');

      // Update with new balance
      const { error: updateError } = await supabase
        .from('bankrolls')
        .update({
          balance: currentBankroll.balance + updateAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Log transaction in metadata
      await this.logTransaction(userId, {
        type,
        amount,
        betId,
        timestamp: new Date().toISOString(),
      });

      // Emit event for real-time updates
      DeviceEventEmitter.emit('bankroll-updated', {
        userId,
        change: updateAmount,
        reason: type,
      });
    } catch (error) {
      console.error('Error updating bankroll:', error);
      throw new Error('Failed to update bankroll');
    }
  }

  /**
   * Calculate available balance (total - pending bets)
   */
  async getAvailableBalance(userId: string): Promise<number> {
    try {
      // Get current bankroll
      const bankroll = await this.getBankroll(userId);

      // Get pending bets
      const pendingBets = await bettingService.getActiveBets(userId);

      // Calculate pending total
      const pendingTotal = pendingBets.reduce((sum, bet) => sum + bet.stake, 0);

      // Return available balance
      return Math.max(0, bankroll.balance - pendingTotal);
    } catch (error) {
      console.error('Error calculating available balance:', error);
      return 0;
    }
  }

  /**
   * Check if user can place a bet of given amount
   */
  async canPlaceBet(userId: string, amount: number): Promise<boolean> {
    const available = await this.getAvailableBalance(userId);
    return available >= amount;
  }

  /**
   * Perform weekly reset with referral bonus calculation
   */
  async performWeeklyReset(userId: string): Promise<void> {
    try {
      // Use the database function which handles everything atomically
      const { error } = await supabase.rpc('reset_bankroll', {
        p_user_id: userId,
      });

      if (error) throw error;

      // Emit event for UI updates
      DeviceEventEmitter.emit('bankroll-reset', { userId });

      console.log(`Successfully reset bankroll for user ${userId}`);
    } catch (error) {
      console.error('Error performing weekly reset:', error);
      throw new Error('Failed to reset bankroll');
    }
  }

  /**
   * Get bankroll statistics for display
   */
  async getBankrollStats(userId: string): Promise<{
    currentBalance: number;
    weeklyDeposit: number;
    weeklyPL: number;
    weeklyPLPercent: number;
    pendingBets: number;
    available: number;
    lastReset: Date | null;
    nextReset: Date;
    referralBonus: number;
  }> {
    try {
      // Get bankroll data
      const bankroll = await this.getBankroll(userId);

      // Get pending bets
      const pendingBets = await bettingService.getActiveBets(userId);
      const pendingTotal = pendingBets.reduce((sum, bet) => sum + bet.stake, 0);

      // Calculate stats
      const weeklyPL = bankroll.balance - bankroll.weekly_deposit;
      const weeklyPLPercent =
        bankroll.weekly_deposit > 0 ? (weeklyPL / bankroll.weekly_deposit) * 100 : 0;

      // Get next reset time
      const nextReset = this.getNextMondayMidnight();

      return {
        currentBalance: bankroll.balance,
        weeklyDeposit: bankroll.weekly_deposit,
        weeklyPL,
        weeklyPLPercent,
        pendingBets: pendingTotal,
        available: bankroll.balance - pendingTotal,
        lastReset: bankroll.last_reset ? new Date(bankroll.last_reset) : null,
        nextReset,
        referralBonus: bankroll.referral_bonus || 0,
      };
    } catch (error) {
      console.error('Error getting bankroll stats:', error);
      throw error;
    }
  }

  /**
   * Get weekly history from metadata
   */
  async getWeeklyHistory(userId: string): Promise<WeeklySnapshot[]> {
    try {
      const bankroll = await this.getBankroll(userId);
      const metadata = bankroll.stats_metadata as { weeklyHistory?: WeeklySnapshot[] };
      return metadata?.weeklyHistory || [];
    } catch (error) {
      console.error('Error getting weekly history:', error);
      return [];
    }
  }

  /**
   * Get recent transactions from metadata
   */
  async getRecentTransactions(userId: string, limit = 10): Promise<BankrollTransaction[]> {
    try {
      const bankroll = await this.getBankroll(userId);
      const metadata = bankroll.stats_metadata as { transactions?: BankrollTransaction[] };
      const transactions = metadata?.transactions || [];
      return transactions.slice(0, limit);
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  /**
   * Calculate next Monday at midnight in user's local time
   */
  private getNextMondayMidnight(): Date {
    const now = new Date();
    const nextMonday = new Date(now);

    // Set to next Monday
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    nextMonday.setDate(now.getDate() + daysUntilMonday);

    // Set to midnight
    nextMonday.setHours(0, 0, 0, 0);

    return nextMonday;
  }

  /**
   * Format time until next reset
   */
  getTimeUntilReset(): string {
    const now = new Date();
    const nextReset = this.getNextMondayMidnight();
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
   * Log transaction to metadata
   */
  private async logTransaction(userId: string, transaction: BankrollTransaction): Promise<void> {
    try {
      const bankroll = await this.getBankroll(userId);
      // Type assertion to work with JSONB column
      const metadata = (bankroll.stats_metadata || {}) as Record<string, unknown>;

      // Initialize transactions array if needed
      if (!metadata.transactions) {
        metadata.transactions = [];
      }

      // Add new transaction and keep last 50
      const transactions = metadata.transactions as BankrollTransaction[];
      metadata.transactions = [transaction, ...transactions.slice(0, 49)];

      // Update metadata - cast to Json type for Supabase
      await supabase
        .from('bankrolls')
        .update({ stats_metadata: metadata as Json })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error logging transaction:', error);
    }
  }
}

// Export singleton instance
export const bankrollService = BankrollService.getInstance();
