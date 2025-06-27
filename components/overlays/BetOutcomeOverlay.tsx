import React from 'react';
import { Stack, Text } from '@tamagui/core';
import { Colors } from '@/theme';
import { Bet } from '@/services/betting/types';
import { Game } from '@/types/database-helpers';

interface BetOutcomeOverlayProps {
  bet: Bet & { game?: Game };
}

export function BetOutcomeOverlay({ bet }: BetOutcomeOverlayProps) {
  const game = bet.game;
  const isWin = bet.status === 'won';
  const isPush = bet.status === 'push';
  const resultColor = isWin ? '#10B981' : isPush ? '#FFA500' : '#EF4444';
  const resultEmoji = isWin ? '💰' : isPush ? '🤝' : '💸';
  const resultText = isWin ? 'WINNER' : isPush ? 'PUSH' : 'LOSS';

  // Parse bet_details JSON
  const betDetails = bet.bet_details as {
    team?: string;
    line?: number;
    total_type?: 'over' | 'under';
  };

  // Format the bet selection
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

  const getResultAmount = () => {
    if (isPush) return 0;
    if (isWin && bet.actual_win !== null) {
      return bet.actual_win;
    }
    return -bet.stake;
  };

  const resultAmount = getResultAmount();
  const betTypeLabel = bet.bet_type.toUpperCase();
  const displayAmount = Math.abs(Math.round(resultAmount / 100));

  // Format score if available
  const formatScore = () => {
    if (!game || game.away_score === null || game.home_score === null) return '';
    // Use team abbreviations if available, otherwise first 3 letters
    const awayAbbr = game.away_team.substring(0, 3).toUpperCase();
    const homeAbbr = game.home_team.substring(0, 3).toUpperCase();
    return `${awayAbbr} ${game.away_score}-${game.home_score} ${homeAbbr}`;
  };

  return (
    <Stack
      backgroundColor={Colors.black + 'E6'} // 90% opacity
      padding="$4"
      borderRadius="$4"
      gap="$3"
      width="100%"
    >
      {/* Header with bet type and result */}
      <Text color={Colors.gray[400]} fontSize="$3" fontWeight="500">
        {betTypeLabel} • {resultText} {resultEmoji}
      </Text>

      {/* Profit/Loss amount - main focus */}
      <Text color={resultColor} fontSize="$8" fontWeight="800" lineHeight="$8">
        {resultAmount > 0 ? '+' : resultAmount === 0 ? '' : '-'}${displayAmount}
      </Text>

      {/* Bet details and score */}
      <Stack gap="$1">
        <Text color={Colors.gray[300]} fontSize="$4">
          {formatBetSelection()}
        </Text>
        {formatScore() && (
          <Text color={Colors.gray[400]} fontSize="$3">
            Final: {formatScore()}
          </Text>
        )}
      </Stack>
    </Stack>
  );
}
