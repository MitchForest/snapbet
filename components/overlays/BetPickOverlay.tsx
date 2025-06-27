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
}

export function BetPickOverlay({ bet, onTail, onFade }: BetPickOverlayProps) {
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

  const handleTail = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTail?.();
  };

  const handleFade = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFade?.();
  };

  return (
    <Stack
      backgroundColor={Colors.black + '99'} // 60% opacity - less dark
      padding="$4"
      borderRadius="$4"
      gap="$3"
      width="100%"
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

      {/* Tail/Fade buttons */}
      {onTail && onFade && (
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
      )}
    </Stack>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
});
