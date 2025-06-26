import React from 'react';
import { BetOutcomeOverlay } from './BetOutcomeOverlay';
import { PendingShareBet } from '@/types/content';

interface OutcomeOverlayProps {
  bet?: PendingShareBet;
}

export function OutcomeOverlay({ bet }: OutcomeOverlayProps) {
  if (!bet || bet.type !== 'outcome') {
    return null;
  }

  return <BetOutcomeOverlay bet={bet} />;
}
