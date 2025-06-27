import { supabase } from '@/services/supabase/client';
import { gameService } from '@/services/games/gameService';
import { Game } from '@/types/database-helpers';
import type { Json } from '@/types/database';
import {
  Bet,
  BetInput,
  BetHistoryOptions,
  BetWithGame,
  BettingError,
  ValidationResult,
  PayoutCalculation,
} from './types';
import { getOddsData } from '@/types/betting';

class BettingService {
  // Place a new bet
  async placeBet(input: BetInput): Promise<Bet> {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new BettingError('Not authenticated', 'VALIDATION_ERROR');
      }

      // Get game details for validation
      const game = await gameService.getGame(input.gameId);
      if (!game) {
        throw new BettingError('Game not found', 'VALIDATION_ERROR');
      }

      // Check if user has sufficient bankroll
      const hasFunds = await this.checkBankrollSufficient(user.id, input.stake);
      if (!hasFunds) {
        throw new BettingError('Insufficient funds', 'INSUFFICIENT_FUNDS');
      }

      // Validate the bet
      const validation = this.validateBet(input, game);
      if (!validation.isValid) {
        throw new BettingError(validation.error || 'Invalid bet', 'VALIDATION_ERROR');
      }

      // Prepare bet details based on bet type
      const betDetails = this.prepareBetDetails(input, game);

      // Use the database function to place the bet
      const { data, error } = await supabase.rpc('place_bet_with_bankroll_check', {
        p_user_id: user.id,
        p_game_id: input.gameId,
        p_bet_type: input.betType,
        p_bet_details: betDetails,
        p_stake: input.stake,
        p_odds: input.odds,
        p_expires_at: game.commence_time,
        p_is_tail: false,
        p_is_fade: false,
        p_original_pick_id: undefined,
      });

      if (error) {
        console.error('Error placing bet:', error);
        throw new BettingError(error.message, 'UNKNOWN');
      }

      // Get the full bet details
      const bet = await this.getBet(data);
      if (!bet) {
        throw new BettingError('Failed to retrieve placed bet', 'UNKNOWN');
      }

      return bet;
    } catch (error) {
      if (error instanceof BettingError) {
        throw error;
      }
      throw new BettingError('Failed to place bet', 'UNKNOWN');
    }
  }

  // Get user's active (pending) bets
  async getActiveBets(userId: string): Promise<BetWithGame[]> {
    try {
      const { data, error } = await supabase
        .from('bets')
        .select(
          '*, game:games(id, sport, home_team, away_team, commence_time, status, home_score, away_score)'
        )
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []) as unknown as BetWithGame[];
    } catch (error) {
      console.error('Error fetching active bets:', error);
      throw new BettingError('Failed to fetch active bets', 'UNKNOWN');
    }
  }

  // Get user's bet history
  async getBetHistory(userId: string, options: BetHistoryOptions = {}): Promise<BetWithGame[]> {
    try {
      const { limit = 20, offset = 0, status, includeGameDetails = true } = options;

      let query = supabase
        .from('bets')
        .select(
          includeGameDetails
            ? '*, game:games(id, sport, home_team, away_team, commence_time, status, home_score, away_score)'
            : '*'
        );

      query = query.eq('user_id', userId);

      if (status) {
        query = query.eq('status', status);
      }

      query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      return (data || []) as unknown as BetWithGame[];
    } catch (error) {
      console.error('Error fetching bet history:', error);
      throw new BettingError('Failed to fetch bet history', 'UNKNOWN');
    }
  }

  // Get single bet details
  async getBet(betId: string): Promise<Bet | null> {
    try {
      const { data, error } = await supabase.from('bets').select('*').eq('id', betId).single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching bet:', error);
      return null;
    }
  }

  // Cancel bet (if allowed - before game starts)
  async cancelBet(betId: string): Promise<void> {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new BettingError('Not authenticated', 'VALIDATION_ERROR');
      }

      // Get bet details
      interface BetWithGameData {
        id: string;
        user_id: string;
        game_id: string;
        stake: number;
        game: {
          commence_time: string;
        };
      }

      const { data: bet, error: betError } = (await supabase
        .from('bets')
        .select('*, game:games(*)')
        .eq('id', betId)
        .eq('user_id', user.id)
        .single()) as { data: BetWithGameData | null; error: Error | null };

      if (betError || !bet) {
        throw new BettingError('Bet not found', 'VALIDATION_ERROR');
      }

      // Check if game has started
      if (new Date(bet.game.commence_time) <= new Date()) {
        throw new BettingError('Cannot cancel bet - game has started', 'GAME_STARTED');
      }

      // Cancel the bet
      const { error: cancelError } = await supabase
        .from('bets')
        .update({ status: 'cancelled' })
        .eq('id', betId);

      if (cancelError) throw cancelError;

      // Refund the stake to bankroll
      const { error: refundError } = await supabase.rpc('reset_bankroll', {
        p_user_id: user.id,
      });

      if (refundError) throw refundError;
    } catch (error) {
      if (error instanceof BettingError) {
        throw error;
      }
      throw new BettingError('Failed to cancel bet', 'UNKNOWN');
    }
  }

  // Private helper methods

  // Check if user has sufficient bankroll (considering pending bets)
  private async checkBankrollSufficient(userId: string, amount: number): Promise<boolean> {
    try {
      const { bankrollService } = await import('./bankrollService');
      return await bankrollService.canPlaceBet(userId, amount);
    } catch (error) {
      console.error('Error checking bankroll:', error);
      return false;
    }
  }

  private validateBet(input: BetInput, game: Game): ValidationResult {
    // Check minimum bet ($5 = 500 cents)
    if (input.stake < 500) {
      return { isValid: false, error: 'Minimum bet is $5' };
    }

    // Allow live betting - remove game started check
    // if (new Date(game.commence_time) < new Date()) {
    //   return { isValid: false, error: 'Game has already started' };
    // }

    // Validate odds exist for bet type
    const oddsData = getOddsData(game.odds_data);
    const gameOdds = oddsData?.bookmakers?.[0]?.markets;
    if (!gameOdds) {
      return { isValid: false, error: 'No odds available for this game' };
    }

    // Validate based on bet type
    switch (input.betType) {
      case 'spread':
        if (!input.selection.team || input.selection.line === undefined) {
          return { isValid: false, error: 'Invalid spread bet selection' };
        }
        if (!gameOdds.spreads) {
          return { isValid: false, error: 'Spread betting not available for this game' };
        }
        break;

      case 'total':
        if (!input.selection.totalType || input.selection.line === undefined) {
          return { isValid: false, error: 'Invalid total bet selection' };
        }
        if (!gameOdds.totals) {
          return { isValid: false, error: 'Total betting not available for this game' };
        }
        break;

      case 'moneyline':
        if (!input.selection.team) {
          return { isValid: false, error: 'Invalid moneyline bet selection' };
        }
        if (!gameOdds.h2h) {
          return { isValid: false, error: 'Moneyline betting not available for this game' };
        }
        break;

      default:
        return { isValid: false, error: 'Invalid bet type' };
    }

    return { isValid: true };
  }

  private calculatePotentialWin(stake: number, odds: number): number {
    // Convert American odds to decimal
    let decimal: number;
    if (odds > 0) {
      decimal = odds / 100 + 1;
    } else {
      decimal = 100 / Math.abs(odds) + 1;
    }

    // Calculate win amount (profit only, not including stake)
    return Math.floor(stake * (decimal - 1));
  }

  private prepareBetDetails(input: BetInput, _game: Game): Json {
    const details: Record<string, Json> = {};

    switch (input.betType) {
      case 'spread':
        details.team = input.selection.team || null;
        details.line = input.selection.line ?? null;
        break;

      case 'total':
        details.total_type = input.selection.totalType || null;
        details.line = input.selection.line ?? null;
        break;

      case 'moneyline':
        details.team = input.selection.team || null;
        break;
    }

    return details;
  }

  // Public utility method for payout calculation
  calculatePayout(stake: number, odds: number): PayoutCalculation {
    const toWin = this.calculatePotentialWin(stake, odds);
    const totalReturn = stake + toWin;
    return { toWin, totalReturn };
  }
}

// Export singleton instance
export const bettingService = new BettingService();
