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

  // Simple team color mapping for MVP
  const getTeamColor = () => {
    const team = betDetails.team?.toLowerCase() || '';
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
    switch (bet.bet_type) {
      case 'spread': {
        const line = betDetails.line || 0;
        return `${betDetails.team} ${line > 0 ? '+' : ''}${line}`;
      }
      case 'total':
        return `${betDetails.total_type?.toUpperCase()} ${betDetails.line}`;
      case 'moneyline':
        return `${betDetails.team} ML`;
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

    // Check if game is today, tomorrow, or later
    if (date.toDateString() === today.toDateString()) {
      return `Today ${time}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${time}`;
    } else {
      return `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} ${time}`;
    }
  };

  return (
    <Stack
      backgroundColor={Colors.black + 'CC'} // 80% opacity
      padding="$3"
      borderRadius="$4"
      borderWidth={2}
      borderColor={teamColor}
    >
      {/* Bet Selection - Main Focus */}
      <Text color={Colors.white} fontSize="$5" fontWeight="bold" marginBottom="$2">
        {formatBetSelection()}
      </Text>

      {/* Odds, Stake & Potential Win */}
      <Stack
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="$1"
      >
        <Text color={Colors.gray[300]} fontSize="$3">
          {formatOdds(bet.odds)} • ${(bet.stake / 100).toFixed(2)}
        </Text>
        <Text color="#10B981" fontSize="$3" fontWeight="600">
          Win ${(bet.potential_win / 100).toFixed(2)}
        </Text>
      </Stack>

      {/* Game Time */}
      {game && (
        <Text color={Colors.gray[400]} fontSize="$2" textAlign="center">
          {formatGameTime()}
        </Text>
      )}
    </Stack>
  );
}
