import React from 'react';
import { Stack, Text, View } from '@tamagui/core';
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
  const resultText = isWin ? 'WINNER' : isPush ? 'PUSH' : 'LOSS';

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
  const stake = Math.round(bet.stake / 100);
  const toWin = Math.round(bet.potential_win / 100);

  return (
    <Stack
      backgroundColor={Colors.black + '99'} // 60% opacity - matching pick overlay
      padding="$4"
      borderRadius="$4"
      width="100%"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="stretch"
    >
      {/* Left side - same as pick overlay */}
      <Stack flex={1} gap="$3">
        {/* Header */}
        <Text color={Colors.gray[400]} fontSize="$3" fontWeight="500">
          {betTypeLabel} • {formatGameTime()}
        </Text>

        {/* Main bet selection */}
        <Text color={Colors.white} fontSize="$7" fontWeight="700" lineHeight="$7">
          {formatBetSelection()}
        </Text>

        {/* Odds and stake */}
        <Text color={Colors.gray[300]} fontSize="$4">
          {formatOdds(bet.odds)} • ${stake} to win ${toWin}
        </Text>
      </Stack>

      {/* Right side - result info */}
      <Stack alignItems="center" justifyContent="center" gap="$2" paddingLeft="$4">
        {/* Result badge */}
        <View
          backgroundColor={resultColor}
          paddingHorizontal="$3"
          paddingVertical="$1"
          borderRadius="$2"
        >
          <Text color={Colors.white} fontSize="$2" fontWeight="700" letterSpacing={0.5}>
            {resultText} {resultEmoji}
          </Text>
        </View>

        {/* Big profit/loss */}
        <Text color={resultColor} fontSize="$8" fontWeight="800">
          {resultAmount > 0 ? '+' : resultAmount === 0 ? '' : '-'}${displayAmount}
        </Text>
      </Stack>
    </Stack>
  );
}
