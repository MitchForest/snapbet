import { supabase } from '@/services/supabase/client';
import { gameService } from '@/services/games/gameService';
import { updateUserBadges } from '@/services/badges/badgeService';
import { calculateBetOutcome } from '@/utils/betting/outcomeCalculator';
import { Bet, BetWithGame } from './types';
import { Game } from '@/types/database-helpers';

export interface SettlementResult {
  settledCount: number;
  totalPaidOut: number;
  errors: string[];
  affectedUserIds: string[];
}

export interface SettlementPreview {
  wins: number;
  losses: number;
  pushes: number;
  totalWinnings: number;
  totalStaked: number;
  netPayout: number;
  betPreviews: Array<{
    betId: string;
    username: string;
    betType: string;
    stake: number;
    outcome: 'won' | 'lost' | 'push';
    payout: number;
  }>;
}

class SettlementService {
  /**
   * Get all pending bets for a game
   */
  async getPendingBetsForGame(gameId: string): Promise<BetWithGame[]> {
    const { data, error } = await supabase
      .from('bets')
      .select(
        `
        *,
        game:games(*),
        user:users(id, username)
      `
      )
      .eq('game_id', gameId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching pending bets:', error);
      throw new Error(`Failed to fetch pending bets: ${error.message}`);
    }

    return (data || []) as unknown as BetWithGame[];
  }

  /**
   * Preview settlement without making changes
   */
  async previewSettlement(
    pendingBets: BetWithGame[],
    game: Game,
    homeScore: number,
    awayScore: number
  ): Promise<SettlementPreview> {
    const preview: SettlementPreview = {
      wins: 0,
      losses: 0,
      pushes: 0,
      totalWinnings: 0,
      totalStaked: 0,
      netPayout: 0,
      betPreviews: [],
    };

    for (const bet of pendingBets) {
      const outcome = calculateBetOutcome(bet as Bet, homeScore, awayScore);

      preview.totalStaked += bet.stake;

      let payout = 0;
      if (outcome.status === 'won') {
        preview.wins++;
        payout = bet.stake + outcome.winAmount; // Return stake + winnings
        preview.totalWinnings += outcome.winAmount;
      } else if (outcome.status === 'push') {
        preview.pushes++;
        payout = bet.stake; // Return stake only
      } else {
        preview.losses++;
        payout = 0; // Lose stake
      }

      preview.betPreviews.push({
        betId: bet.id,
        username:
          (bet as BetWithGame & { user?: { username?: string } }).user?.username || 'Unknown',
        betType: bet.bet_type,
        stake: bet.stake,
        outcome: outcome.status,
        payout,
      });
    }

    // Net payout is what the house pays out minus what was staked
    preview.netPayout =
      preview.totalWinnings + (preview.pushes * preview.totalStaked) / pendingBets.length;

    return preview;
  }

  /**
   * Settle all bets for a completed game
   */
  async settleGame(
    gameId: string,
    homeScore: number,
    awayScore: number
  ): Promise<SettlementResult> {
    const result: SettlementResult = {
      settledCount: 0,
      totalPaidOut: 0,
      errors: [],
      affectedUserIds: [],
    };

    try {
      // Step 1: Update game scores and status
      await gameService.updateGameScore(gameId, homeScore, awayScore);

      // Step 2: Get list of users with pending bets (for badge updates)
      const pendingBets = await this.getPendingBetsForGame(gameId);
      const uniqueUserIds = [...new Set(pendingBets.map((bet) => bet.user_id))];
      result.affectedUserIds = uniqueUserIds;

      // Step 3: Call the database settlement function
      const { data: settledCount, error: settleError } = await supabase.rpc('settle_game_bets', {
        p_game_id: gameId,
      });

      if (settleError) {
        throw new Error(`Settlement failed: ${settleError.message}`);
      }

      result.settledCount = settledCount || 0;

      // Step 4: Calculate total payout for reporting
      const { data: settledBets } = await supabase
        .from('bets')
        .select('actual_win, status')
        .eq('game_id', gameId)
        .in('status', ['won', 'push']);

      if (settledBets) {
        result.totalPaidOut = settledBets.reduce((sum, bet) => {
          if (bet.status === 'won' && bet.actual_win) {
            return sum + bet.actual_win;
          }
          return sum;
        }, 0);
      }

      // Step 5: Trigger badge updates for each affected user
      console.log(`Updating badges for ${uniqueUserIds.length} users...`);
      for (const userId of uniqueUserIds) {
        try {
          await updateUserBadges(userId);
        } catch (badgeError) {
          console.error(`Failed to update badges for user ${userId}:`, badgeError);
          result.errors.push(`Badge update failed for user ${userId}`);
        }
      }

      return result;
    } catch (error) {
      console.error('Settlement error:', error);
      throw error;
    }
  }

  /**
   * Mark game as settled (called by RPC internally, but exposed for manual use)
   */
  async markGameSettled(gameId: string): Promise<void> {
    const { error } = await supabase
      .from('games')
      .update({
        status: 'completed',
        last_updated: new Date().toISOString(),
      })
      .eq('id', gameId);

    if (error) {
      throw new Error(`Failed to mark game as settled: ${error.message}`);
    }
  }

  /**
   * Format cents to dollar string
   */
  formatCents(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

// Export singleton instance
export const settlementService = new SettlementService();
