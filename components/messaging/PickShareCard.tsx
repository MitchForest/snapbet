import React, { useState } from 'react';
import { View, Text, Stack } from '@tamagui/core';
import { Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/theme';
import { formatOdds } from '@/utils/betting/oddsCalculator';
import { useTailPick, useFadePick } from '@/hooks/useTailFade';
import { toastService } from '@/services/toastService';
import * as Haptics from 'expo-haptics';

// Extended bet type with game info
interface ExtendedBet {
  id: string;
  stake: number;
  odds: number;
  potential_win: number;
  bet_type: string;
  bet_details: {
    team?: string;
    line?: number;
    total_type?: string;
  };
  game?: {
    home_team: string;
    away_team: string;
    start_time: string;
  };
}

interface PickShareCardProps {
  betId: string;
  bet?: ExtendedBet;
  isOwn: boolean;
}

export function PickShareCard({ betId, bet, isOwn }: PickShareCardProps) {
  const [action, setAction] = useState<'tail' | 'fade' | null>(null);
  const { mutate: tailPick, isLoading: isTailing } = useTailPick();
  const { mutate: fadePick, isLoading: isFading } = useFadePick();

  const isLoading = isTailing || isFading;

  if (!bet) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  const handleTail = async () => {
    if (isOwn || action) return;

    setAction('tail');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Create a mock post ID since we're in messages
      const mockPostId = `msg-bet-${betId}`;
      await tailPick({
        postId: mockPostId,
        originalBetId: betId,
        stake: bet.stake, // Copy the same stake
        action: 'tail',
      });
      toastService.show({
        message: 'Pick tailed! 🎯',
        type: 'success',
      });
    } catch (error) {
      setAction(null);
      console.error('Failed to tail pick:', error);
    }
  };

  const handleFade = async () => {
    if (isOwn || action) return;

    setAction('fade');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Create a mock post ID since we're in messages
      const mockPostId = `msg-bet-${betId}`;
      await fadePick({
        postId: mockPostId,
        originalBetId: betId,
        stake: bet.stake, // Copy the same stake
        action: 'fade',
      });
      toastService.show({
        message: 'Pick faded! 🔥',
        type: 'success',
      });
    } catch (error) {
      setAction(null);
      console.error('Failed to fade pick:', error);
    }
  };

  const formatBetSelection = () => {
    switch (bet.bet_type) {
      case 'spread': {
        const line = bet.bet_details?.line || 0;
        return `${bet.bet_details?.team} ${line > 0 ? '+' : ''}${line}`;
      }
      case 'total':
        return `${bet.bet_details?.total_type?.toUpperCase()} ${bet.bet_details?.line}`;
      case 'moneyline':
        return `${bet.bet_details?.team} ML`;
      default:
        return '';
    }
  };

  const getTeamColor = () => {
    const team = bet.bet_details?.team?.toLowerCase() || '';
    if (team.includes('lakers')) return '#552583';
    if (team.includes('celtics')) return '#007A33';
    if (team.includes('warriors')) return '#1D428A';
    if (team.includes('heat')) return '#98002E';
    return Colors.primary;
  };

  const teamColor = getTeamColor();

  return (
    <View style={[styles.container, { borderColor: teamColor }]}>
      {/* Header */}
      <Stack
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="$2"
      >
        <View
          backgroundColor={teamColor}
          paddingHorizontal="$2"
          paddingVertical="$1"
          borderRadius="$2"
        >
          <Text color={Colors.white} fontSize="$2" fontWeight="bold">
            {bet.bet_type?.toUpperCase()}
          </Text>
        </View>
        {bet.game && (
          <Text fontSize="$2" color={Colors.text.secondary}>
            {bet.game.home_team} vs {bet.game.away_team}
          </Text>
        )}
      </Stack>

      {/* Bet Selection */}
      <Text fontSize="$5" fontWeight="bold" color={Colors.text.primary} marginBottom="$1">
        {formatBetSelection()}
      </Text>

      {/* Odds & Stake */}
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text fontSize="$3" color={Colors.text.secondary}>
          {formatOdds(bet.odds)} • ${(bet.stake / 100).toFixed(2)}
        </Text>
        <Text fontSize="$3" color="#10B981">
          Win ${(bet.potential_win / 100).toFixed(2)}
        </Text>
      </Stack>

      {/* Action Buttons */}
      {!isOwn && (
        <Stack flexDirection="row" gap="$2" marginTop="$3">
          <Pressable
            style={[
              styles.actionButton,
              action === 'tail' && styles.tailedButton,
              (action || isLoading) && styles.disabledButton,
            ]}
            onPress={handleTail}
            disabled={!!action || isLoading}
          >
            {isLoading && action === 'tail' ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text
                color={action === 'tail' ? Colors.white : Colors.primary}
                fontSize="$3"
                fontWeight="600"
              >
                {action === 'tail' ? 'Tailed ✓' : 'Tail'}
              </Text>
            )}
          </Pressable>

          <Pressable
            style={[
              styles.actionButton,
              action === 'fade' && styles.fadedButton,
              (action || isLoading) && styles.disabledButton,
            ]}
            onPress={handleFade}
            disabled={!!action || isLoading}
          >
            {isLoading && action === 'fade' ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text
                color={action === 'fade' ? Colors.white : Colors.fade}
                fontSize="$3"
                fontWeight="600"
              >
                {action === 'fade' ? 'Faded ✓' : 'Fade'}
              </Text>
            )}
          </Pressable>
        </Stack>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    maxWidth: 280,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tailedButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  fadedButton: {
    backgroundColor: Colors.fade,
    borderColor: Colors.fade,
  },
  disabledButton: {
    opacity: 0.7,
  },
});
