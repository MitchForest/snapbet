import React from 'react';
import { Stack, Text, View } from '@tamagui/core';
import { Colors } from '@/theme';
import { PendingShareBet } from '@/types/content';
import { formatOdds } from '@/utils/betting/oddsCalculator';

interface BetPickOverlayProps {
  bet: PendingShareBet;
}

export function BetPickOverlay({ bet }: BetPickOverlayProps) {
  // Simple team color mapping for MVP
  const getTeamColor = () => {
    const team = bet.betDetails.team?.toLowerCase() || '';
    if (team.includes('lakers')) return '#552583';
    if (team.includes('celtics')) return '#007A33';
    if (team.includes('warriors')) return '#1D428A';
    if (team.includes('heat')) return '#98002E';
    if (team.includes('chiefs')) return '#E31837';
    if (team.includes('bills')) return '#00338D';
    return Colors.primary;
  };

  const teamColor = getTeamColor();

  const formatBetSelection = () => {
    switch (bet.betType) {
      case 'spread': {
        const spreadLine = bet.betDetails.line || 0;
        return `${bet.betDetails.team} ${spreadLine > 0 ? '+' : ''}${spreadLine}`;
      }
      case 'total':
        return `${bet.betDetails.total_type?.toUpperCase()} ${bet.betDetails.line}`;
      case 'moneyline':
        return `${bet.betDetails.team} ML`;
      default:
        return '';
    }
  };

  const formatGameTime = () => {
    if (!bet.game) return '';
    const date = new Date(bet.game.commence_time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `Tonight ${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <Stack
      position="absolute"
      bottom="$4"
      left="$4"
      right="$4"
      backgroundColor={Colors.black + 'CC'} // 80% opacity
      padding="$3"
      borderRadius="$4"
      borderWidth={2}
      borderColor={teamColor}
    >
      {/* Bet Type Badge and Game Time */}
      <Stack flexDirection="row" justifyContent="space-between" marginBottom="$2">
        <View
          backgroundColor={teamColor}
          paddingHorizontal="$2"
          paddingVertical="$1"
          borderRadius="$2"
        >
          <Text color={Colors.white} fontSize="$2" fontWeight="bold">
            {bet.betType.toUpperCase()}
          </Text>
        </View>
        <Text color={Colors.gray[400]} fontSize="$2">
          {formatGameTime()}
        </Text>
      </Stack>

      {/* Bet Selection */}
      <Text color={Colors.white} fontSize="$5" fontWeight="bold" marginBottom="$1">
        {formatBetSelection()}
      </Text>

      {/* Odds & Stake */}
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text color={Colors.gray[400]} fontSize="$3">
          {formatOdds(bet.odds)} • ${(bet.stake / 100).toFixed(2)}
        </Text>
        <Text color="#10B981" fontSize="$3">
          Win ${(bet.potentialWin / 100).toFixed(2)}
        </Text>
      </Stack>
    </Stack>
  );
}
