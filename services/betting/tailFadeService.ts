import { supabase } from '@/services/supabase';
import { eventEmitter, EngagementEvents } from '@/utils/eventEmitter';
import { bettingService } from './bettingService';
import { calculateFadeBet } from '@/utils/betting/oppositeCalculator';
import { Bet, BetInput, BettingError, BetSelection } from './types';
import { Game } from '@/types/database-helpers';
import { Database } from '@/types/database-helpers';
import { toastService } from '@/services/toastService';

type PickAction = Database['public']['Tables']['pick_actions']['Row'];
type PickActionInsert = Database['public']['Tables']['pick_actions']['Insert'];

export interface TailFadeInput {
  postId: string;
  originalBetId: string;
  stake: number;
  action: 'tail' | 'fade';
}

export interface TailFadeResult {
  bet: Bet;
  pickAction: PickAction;
}

export interface TailFadeCounts {
  tailCount: number;
  fadeCount: number;
}

class TailFadeService {
  /**
   * Tail a pick - copy the exact bet
   */
  async tailPick(input: TailFadeInput): Promise<TailFadeResult> {
    try {
      // Get original bet with game details
      const { data: originalBet, error: betError } = await supabase
        .from('bets')
        .select('*, game:games(*)')
        .eq('id', input.originalBetId)
        .single();

      if (betError || !originalBet) {
        throw new BettingError('Original bet not found', 'VALIDATION_ERROR');
      }

      // Place matching bet
      const betInput: BetInput = {
        gameId: originalBet.game_id,
        betType: originalBet.bet_type,
        selection: originalBet.bet_details as BetSelection,
        stake: input.stake,
        odds: originalBet.odds,
      };

      // Add tail flag to bet details
      const newBet = await bettingService.placeBet({
        ...betInput,
        shareToFeed: false, // Don't auto-share tailed bets
      });

      // Update the bet to mark it as a tail
      await supabase
        .from('bets')
        .update({
          is_tail: true,
          original_pick_id: originalBet.id,
        })
        .eq('id', newBet.id);

      // Record in pick_actions
      const pickActionData: PickActionInsert = {
        post_id: input.postId,
        user_id: newBet.user_id,
        action_type: 'tail',
        resulting_bet_id: newBet.id,
      };

      const { data: pickAction, error: actionError } = await supabase
        .from('pick_actions')
        .insert(pickActionData)
        .select()
        .single();

      if (actionError) {
        console.error('Failed to create pick_action:', actionError);
        // Don't throw - bet was still placed successfully
      }

      // Emit event for real-time update
      eventEmitter.emit(EngagementEvents.TAIL_FADE_CHANGED, {
        postId: input.postId,
        action: 'tail',
      });

      toastService.showSuccess('Tailed successfully! 🤝');

      return {
        bet: { ...newBet, is_tail: true, original_pick_id: originalBet.id },
        pickAction: pickAction!,
      };
    } catch (error) {
      if (error instanceof BettingError) {
        throw error;
      }
      throw new BettingError('Failed to tail pick', 'UNKNOWN');
    }
  }

  /**
   * Fade a pick - bet the opposite
   */
  async fadePick(input: TailFadeInput): Promise<TailFadeResult> {
    try {
      // Get original bet with game details
      const { data: originalBet, error: betError } = await supabase
        .from('bets')
        .select('*, game:games(*)')
        .eq('id', input.originalBetId)
        .single();

      if (betError || !originalBet) {
        throw new BettingError('Original bet not found', 'VALIDATION_ERROR');
      }

      // Get game for calculating opposite bet
      const game = originalBet.game as unknown as Game;

      // Calculate opposite bet
      const oppositeDetails = calculateFadeBet(originalBet as Bet, game);

      const betInput: BetInput = {
        gameId: originalBet.game_id,
        betType: originalBet.bet_type,
        selection: oppositeDetails.selection!,
        stake: input.stake,
        odds: oppositeDetails.odds!,
      };

      // Place opposite bet
      const newBet = await bettingService.placeBet({
        ...betInput,
        shareToFeed: false, // Don't auto-share faded bets
      });

      // Update the bet to mark it as a fade
      await supabase
        .from('bets')
        .update({
          is_fade: true,
          original_pick_id: originalBet.id,
        })
        .eq('id', newBet.id);

      // Record in pick_actions
      const pickActionData: PickActionInsert = {
        post_id: input.postId,
        user_id: newBet.user_id,
        action_type: 'fade',
        resulting_bet_id: newBet.id,
      };

      const { data: pickAction, error: actionError } = await supabase
        .from('pick_actions')
        .insert(pickActionData)
        .select()
        .single();

      if (actionError) {
        console.error('Failed to create pick_action:', actionError);
        // Don't throw - bet was still placed successfully
      }

      // Emit event for real-time update
      eventEmitter.emit(EngagementEvents.TAIL_FADE_CHANGED, {
        postId: input.postId,
        action: 'fade',
      });

      toastService.showSuccess('Faded successfully! ⚔️');

      return {
        bet: { ...newBet, is_fade: true, original_pick_id: originalBet.id },
        pickAction: pickAction!,
      };
    } catch (error) {
      if (error instanceof BettingError) {
        throw error;
      }
      throw new BettingError('Failed to fade pick', 'UNKNOWN');
    }
  }

  /**
   * Get user's pick action for a post
   */
  async getUserPickAction(postId: string, userId: string): Promise<PickAction | null> {
    const { data, error } = await supabase
      .from('pick_actions')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * Get tail/fade counts for a post
   */
  async getPickActionCounts(postId: string): Promise<TailFadeCounts> {
    const { data, error } = await supabase
      .from('pick_actions')
      .select('action_type')
      .eq('post_id', postId);

    if (error || !data) {
      return { tailCount: 0, fadeCount: 0 };
    }

    const tailCount = data.filter((action) => action.action_type === 'tail').length;
    const fadeCount = data.filter((action) => action.action_type === 'fade').length;

    return { tailCount, fadeCount };
  }

  /**
   * Get all pick actions for a post with user details
   */
  async getPickActionsWithUsers(postId: string) {
    const { data, error } = await supabase
      .from('pick_actions')
      .select(
        `
        *,
        user:users!pick_actions_user_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        ),
        bet:bets!pick_actions_resulting_bet_id_fkey(
          id,
          stake,
          potential_win,
          status
        )
      `
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch pick actions:', error);
      return [];
    }

    return data || [];
  }
}

export const tailFadeService = new TailFadeService();
