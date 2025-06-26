import React from 'react';
import { Stack, Text, View } from '@tamagui/core';
import { Colors } from '@/theme';
import { PendingShareBet } from '@/types/content';
import { formatOdds } from '@/utils/betting/oddsCalculator';

interface BetOutcomeOverlayProps {
  bet: PendingShareBet;
}

export function BetOutcomeOverlay({ bet }: BetOutcomeOverlayProps) {
  const isWin = bet.status === 'won';
  const isPush = bet.status === 'push';
  const resultColor = isWin ? '#10B981' : isPush ? Colors.gray[500] : '#EF4444';
  const resultEmoji = isWin ? '💰' : isPush ? '🤝' : '💸';

  const formatBetSelection = () => {
    switch (bet.betType) {
      case 'spread': {
        const spreadLine = bet.betDetails.line || 0;
        return `${bet.betDetails.team} ${spreadLine > 0 ? '+' : ''}${spreadLine} (${formatOdds(bet.odds)})`;
      }
      case 'total':
        return `${bet.betDetails.total_type?.toUpperCase()} ${bet.betDetails.line} (${formatOdds(bet.odds)})`;
      case 'moneyline':
        return `${bet.betDetails.team} ML (${formatOdds(bet.odds)})`;
      default:
        return '';
    }
  };

  const getResultAmount = () => {
    if (isPush) return bet.stake;
    return bet.actualWin || bet.stake;
  };

  return (
    <Stack
      position="absolute"
      bottom="$4"
      left="$4"
      right="$4"
      backgroundColor={Colors.black + 'E6'} // 90% opacity
      padding="$4"
      borderRadius="$4"
      borderWidth={3}
      borderColor={resultColor}
    >
      {/* Result Badge */}
      <Stack alignItems="center" marginBottom="$3">
        <View
          backgroundColor={resultColor}
          paddingHorizontal="$4"
          paddingVertical="$2"
          borderRadius="$3"
        >
          <Text color={Colors.white} fontSize="$6" fontWeight="bold">
            {isWin ? 'WINNER!' : isPush ? 'PUSH' : 'LOSS'} {resultEmoji}
          </Text>
        </View>
      </Stack>

      {/* Profit/Loss */}
      <Text
        color={resultColor}
        fontSize="$7"
        fontWeight="bold"
        textAlign="center"
        marginBottom="$2"
      >
        {isWin ? '+' : isPush ? '' : '-'}${(Math.abs(getResultAmount()) / 100).toFixed(2)}
      </Text>

      {/* Bet Details */}
      <Text color={Colors.gray[400]} fontSize="$3" textAlign="center" marginBottom="$1">
        {formatBetSelection()}
      </Text>

      {/* Final Score */}
      {bet.game && bet.game.away_score !== null && bet.game.home_score !== null && (
        <Text color={Colors.gray[400]} fontSize="$2" textAlign="center">
          {bet.game.away_team} {bet.game.away_score} - {bet.game.home_team} {bet.game.home_score}
        </Text>
      )}
    </Stack>
  );
}
