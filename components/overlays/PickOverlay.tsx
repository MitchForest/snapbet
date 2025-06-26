import React from 'react';
import { BetPickOverlay } from './BetPickOverlay';
import { PendingShareBet } from '@/types/content';

interface PickOverlayProps {
  bet?: PendingShareBet;
}

export function PickOverlay({ bet }: PickOverlayProps) {
  if (!bet || bet.type !== 'pick') {
    return null;
  }

  return <BetPickOverlay bet={bet} />;
}
