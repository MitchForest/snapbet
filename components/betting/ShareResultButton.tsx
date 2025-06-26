import React from 'react';
import { Text } from '@tamagui/core';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Bet } from '@/services/betting/types';
import { Game } from '@/types/database';
import { useBetSharing } from '@/hooks/useBetSharing';
import { PendingShareBet } from '@/types/content';
import { Colors, OpacityColors } from '@/theme';

interface ShareResultButtonProps {
  bet: Bet & { game?: Game };
  variant?: 'primary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
}

export function ShareResultButton({
  bet,
  variant = 'ghost',
  size = 'small',
}: ShareResultButtonProps) {
  const router = useRouter();
  const { storeBetForSharing } = useBetSharing();

  const handleShare = () => {
    if (!bet.game) return;

    const pendingBet: PendingShareBet = {
      betId: bet.id,
      type: 'outcome',
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
      status: bet.status as 'won' | 'lost' | 'push',
      actualWin: bet.actual_win || 0,
      game: bet.game,
    };

    storeBetForSharing(pendingBet);
    router.push('/camera?mode=outcome');
  };

  // Only show for settled bets
  if (bet.status === 'pending' || bet.status === 'cancelled') {
    return null;
  }

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
      <Text style={[styles.text, textStyle]}>Share Result</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  text: {
    fontWeight: '600',
    fontSize: 14,
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
    minHeight: 28,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
  },
});
