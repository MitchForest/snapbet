import React from 'react';
import { Stack, Text, View } from '@tamagui/core';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/theme';
import { Bet } from '@/services/betting/types';
import { Game } from '@/types/database-helpers';
import { formatOdds } from '@/utils/betting/oddsCalculator';
import * as Haptics from 'expo-haptics';

interface BetPickOverlayProps {
  bet: Bet & { game?: Game };
  onTail?: () => void;
  onFade?: () => void;
  userAction?: 'tail' | 'fade';
}

interface BetDetails {
  team?: string;
  line?: number;
  spread?: number;
  total_type?: 'over' | 'under';
}

export function BetPickOverlay({ bet, onTail, onFade, userAction }: BetPickOverlayProps) {
  const game = bet.game;

  const handleTail = () => {
    if (onTail) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onTail();
    }
  };

  const handleFade = () => {
    if (onFade) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onFade();
    }
  };

  const formatGameTime = () => {
    if (!game || !game.commence_time) return '';

    try {
      const gameDate = new Date(game.commence_time);

      // Check if date is valid
      if (isNaN(gameDate.getTime())) {
        return '';
      }

      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Format time
      const timeStr = gameDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });

      if (gameDate.toDateString() === now.toDateString()) {
        return `Today ${timeStr}`;
      } else if (gameDate.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow ${timeStr}`;
      } else {
        const dateStr = gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${dateStr} ${timeStr}`;
      }
    } catch (error) {
      console.error('Error formatting game time:', error);
      return '';
    }
  };

  const formatBetSelection = () => {
    const details = bet.bet_details as BetDetails;

    if (!details) return '';

    switch (bet.bet_type) {
      case 'spread': {
        if (!details.team) return '';
        // Handle both 'line' and 'spread' fields for backwards compatibility
        const spreadValue = details.line ?? details.spread;
        if (spreadValue === undefined) return details.team;
        const spread = spreadValue > 0 ? `+${spreadValue}` : spreadValue;
        return `${details.team} ${spread}`;
      }
      case 'total': {
        if (!details.total_type || details.line === undefined) return '';
        return `${details.total_type === 'over' ? 'Over' : 'Under'} ${details.line}`;
      }
      case 'moneyline':
        return details.team || '';
      default:
        return '';
    }
  };

  const betTypeLabel = bet.bet_type.toUpperCase();
  const stake = Math.round(bet.stake / 100);
  const toWin = Math.round(bet.potential_win / 100);

  return (
    <Stack
      backgroundColor={Colors.black + '99'} // 60% opacity
      padding="$4"
      borderRadius="$4"
      gap="$1"
      minWidth={200}
    >
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

      {/* Action Buttons or Status */}
      {userAction ? (
        <View
          style={[
            styles.statusBadge,
            userAction === 'tail' ? styles.tailedBadge : styles.fadedBadge,
          ]}
        >
          <Text style={styles.statusText}>{userAction === 'tail' ? 'TAILED!' : 'FADED!'}</Text>
        </View>
      ) : onTail && onFade ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.tailButton]}
            onPress={handleTail}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>TAIL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.fadeButton]}
            onPress={handleFade}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>FADE</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </Stack>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  tailButton: {
    backgroundColor: Colors.success,
  },
  fadeButton: {
    backgroundColor: Colors.error,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 12,
  },
  tailedBadge: {
    backgroundColor: Colors.success,
  },
  fadedBadge: {
    backgroundColor: Colors.error,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
