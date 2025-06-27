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
      backgroundColor={Colors.black + 'CC'} // 80% opacity - much more visible
      padding="$2.5"
      borderRadius="$3"
      gap="$2"
      maxWidth={300}
      alignSelf="center"
    >
      {/* Header with bet type and result */}
      <Text color={Colors.gray[400]} fontSize="$2">
        {betTypeLabel} • {resultText} {resultEmoji}
      </Text>

      {/* Profit/Loss amount - main focus */}
      <Text color={resultColor} fontSize="$6" fontWeight="800">
        {resultAmount > 0 ? '+' : resultAmount === 0 ? '' : '-'}${displayAmount}
      </Text>

      {/* Bet details and score on one line */}
      <Text color={Colors.gray[300]} fontSize="$3">
        {formatBetSelection()} • {formatScore()}
      </Text>
    </Stack>
  );
}
