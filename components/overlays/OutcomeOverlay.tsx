import React from 'react';
import { BetOutcomeOverlay } from './BetOutcomeOverlay';
import { PendingShareBet } from '@/types/content';
import { Bet } from '@/services/betting/types';

interface OutcomeOverlayProps {
  bet?: PendingShareBet;
}

export function OutcomeOverlay({ bet }: OutcomeOverlayProps) {
  if (!bet || bet.type !== 'outcome') {
    return null;
  }

  // Convert PendingShareBet to Bet format
  const betData: Bet & { game?: typeof bet.game } = {
    id: bet.betId,
    user_id: '', // Not needed for display
    game_id: bet.gameId,
    bet_type: bet.betType,
    bet_details: JSON.parse(JSON.stringify(bet.betDetails)), // Type conversion for JSON
    stake: bet.stake,
    odds: bet.odds,
    potential_win: bet.potentialWin,
    actual_win: bet.actualWin ?? null,
    status: bet.status ?? 'pending',
    created_at: null,
    settled_at: null,
    expires_at: bet.expiresAt ?? null,
    is_fade: false,
    is_tail: false,
    original_pick_id: null,
    archived: false,
    embedding: null,
    deleted_at: null,
    game: bet.game,
  };

  return <BetOutcomeOverlay bet={betData} />;
}
