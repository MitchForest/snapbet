import React from 'react';
import { Stack, Text } from '@tamagui/core';
import { Colors } from '@/theme';
import { Bet } from '@/services/betting/types';
import { Game } from '@/types/database-helpers';
import { formatOdds } from '@/utils/betting/oddsCalculator';

interface BetPickOverlayProps {
  bet: Bet & { game?: Game };
}

export function BetPickOverlay({ bet }: BetPickOverlayProps) {
  const game = bet.game;

  // Parse bet_details JSON
  const betDetails = bet.bet_details as {
    team?: string;
    line?: number;
    total_type?: 'over' | 'under';
  };

  // Format the bet selection - clean and simple
  const formatBetSelection = () => {
    switch (bet.bet_type) {
      case 'spread': {
        const line = betDetails.line || 0;
        const lineStr = line !== 0 ? ` ${line > 0 ? '+' : ''}${line}` : '';
        return `${betDetails.team}${lineStr}`;
      }
      case 'total': {
        const line = betDetails.line || 0;
        return `${betDetails.total_type?.toUpperCase()} ${line}`;
      }
      case 'moneyline':
        return betDetails.team || '';
      default:
        return '';
    }
  };

  const formatGameTime = () => {
    if (!game) return '';
    const date = new Date(game.commence_time);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const time = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    if (date.toDateString() === today.toDateString()) {
      return `Tonight ${time}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${time}`;
    } else {
      return `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${time}`;
    }
  };

  const betTypeLabel = bet.bet_type.toUpperCase();
  const stake = Math.round(bet.stake / 100);
  const toWin = Math.round(bet.potential_win / 100);

  return (
    <Stack
      backgroundColor={Colors.black + 'CC'} // 80% opacity - much more visible
      padding="$2.5"
      borderRadius="$3"
      gap="$2"
      maxWidth={300}
      alignSelf="center"
    >
      {/* Minimal header */}
      <Text color={Colors.gray[400]} fontSize="$2">
        {betTypeLabel} • {formatGameTime()}
      </Text>

      {/* Main bet selection */}
      <Text color={Colors.white} fontSize="$5" fontWeight="700">
        {formatBetSelection()}
      </Text>

      {/* Compact odds and stake */}
      <Text color={Colors.gray[300]} fontSize="$3">
        {formatOdds(bet.odds)} • ${stake} to win ${toWin}
      </Text>
    </Stack>
  );
}
