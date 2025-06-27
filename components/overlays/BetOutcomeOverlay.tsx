import React from 'react';
import { Stack, Text } from '@tamagui/core';
import { Colors } from '@/theme';
import { Bet } from '@/services/betting/types';
import { Game } from '@/types/database-helpers';
import { formatOdds } from '@/utils/betting/oddsCalculator';

interface BetOutcomeOverlayProps {
  bet: Bet & { game?: Game };
}

export function BetOutcomeOverlay({ bet }: BetOutcomeOverlayProps) {
  const game = bet.game;
  const isWin = bet.status === 'won';
  const isPush = bet.status === 'push';
  const resultColor = isWin ? '#10B981' : isPush ? '#FFA500' : '#EF4444';
  const resultEmoji = isWin ? '💰' : isPush ? '🤝' : '💸';

  // Parse bet_details JSON
  const betDetails = bet.bet_details as {
    team?: string;
    line?: number;
    total_type?: 'over' | 'under';
  };

  const formatBetSelection = () => {
    switch (bet.bet_type) {
      case 'spread': {
        const line = betDetails.line || 0;
        return `${betDetails.team} ${line > 0 ? '+' : ''}${line}`;
      }
      case 'total':
        return `${betDetails.total_type?.toUpperCase()} ${betDetails.line}`;
      case 'moneyline':
        return `${betDetails.team}`;
      default:
        return '';
    }
  };

  const getResultAmount = () => {
    if (isPush) return 0; // Push returns stake, but profit is 0
    if (isWin && bet.actual_win !== null) {
      return bet.actual_win; // This is the profit amount
    }
    return -bet.stake; // Loss amount
  };

  const resultAmount = getResultAmount();

  return (
    <Stack
      backgroundColor={Colors.black + 'E6'} // 90% opacity
      padding="$3"
      borderRadius="$4"
      borderWidth={2}
      borderColor={resultColor}
      alignItems="center"
    >
      {/* Result Status */}
      <Stack flexDirection="row" alignItems="center" gap="$2" marginBottom="$2">
        <Text fontSize="$7" fontWeight="bold" color={resultColor}>
          {isWin ? 'WINNER' : isPush ? 'PUSH' : 'LOSS'}
        </Text>
        <Text fontSize="$6">{resultEmoji}</Text>
      </Stack>

      {/* Profit/Loss Amount */}
      <Text color={resultColor} fontSize="$8" fontWeight="bold" marginBottom="$2">
        {resultAmount > 0 ? '+' : resultAmount === 0 ? '' : ''}$
        {(Math.abs(resultAmount) / 100).toFixed(2)}
      </Text>

      {/* Original Bet Info */}
      <Text color={Colors.gray[300]} fontSize="$2" marginBottom="$1">
        {formatBetSelection()} • {formatOdds(bet.odds)}
      </Text>

      {/* Final Score (if available) */}
      {game && game.away_score !== null && game.home_score !== null && (
        <Text color={Colors.gray[400]} fontSize="$2">
          Final: {game.away_team} {game.away_score}, {game.home_team} {game.home_score}
        </Text>
      )}
    </Stack>
  );
}
