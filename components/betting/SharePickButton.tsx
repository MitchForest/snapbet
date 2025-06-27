import React from 'react';
import { Text } from '@tamagui/core';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Bet } from '@/services/betting/types';
import { Game } from '@/types/database-helpers';
import { useBetSharing } from '@/hooks/useBetSharing';
import { PendingShareBet } from '@/types/content';
import { Colors, OpacityColors } from '@/theme';

interface SharePickButtonProps {
  bet: Bet;
  game: Game;
  variant?: 'primary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
}

export function SharePickButton({
  bet,
  game,
  variant = 'primary',
  size = 'medium',
}: SharePickButtonProps) {
  const router = useRouter();
  const { storeBetForSharing } = useBetSharing();

  const handleShare = () => {
    const pendingBet: PendingShareBet = {
      betId: bet.id,
      type: 'pick',
      gameId: bet.game_id,
      betType: bet.bet_type,
      betDetails: bet.bet_details as {
        team?: string;
        line?: number;
        total_type?: 'over' | 'under';
      },
      stake: bet.stake,
      odds: bet.odds,
      potentialWin: bet.potential_win,
      expiresAt: game.commence_time,
      game,
    };

    storeBetForSharing(pendingBet);
    router.push('/camera?mode=pick');
  };

  const buttonStyle = variant === 'primary' ? styles.primaryButton : styles.ghostButton;
  const textStyle = variant === 'primary' ? styles.primaryText : styles.ghostText;
  const sizeStyle =
    size === 'small' ? styles.small : size === 'large' ? styles.large : styles.medium;

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle, sizeStyle]}
      onPress={handleShare}
      activeOpacity={0.8}
    >
      <Text style={[styles.icon, textStyle]}>📸</Text>
      <Text style={[styles.text, textStyle]}>Share Pick</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  ghostButton: {
    backgroundColor: OpacityColors.transparent,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: Colors.white,
  },
  ghostText: {
    color: Colors.text.primary,
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 52,
  },
});
