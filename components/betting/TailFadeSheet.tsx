import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { BaseSheet } from '@/components/engagement/sheets/BaseSheet';
import { Bet } from '@/services/betting/types';
import { Game } from '@/types/database-helpers';
import { PostWithType } from '@/types/content';
import { formatBetDetails, formatOdds } from '@/utils/betting/oppositeCalculator';
import { StakeInput } from './StakeInput';
import { PayoutDisplay } from './PayoutDisplay';
import { useTailPick, useFadePick } from '@/hooks/useTailFade';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/theme';

interface TailFadeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'tail' | 'fade' | null;
  originalBet: Bet | null;
  originalPost: PostWithType | null;
  originalUser: { username: string; display_name: string | null } | null;
}

export function TailFadeSheet({
  isOpen,
  onClose,
  action,
  originalBet,
  originalPost,
  originalUser,
}: TailFadeSheetProps) {
  const { user } = useAuth();
  const { mutate: tailPick, isLoading: isTailing } = useTailPick();
  const { mutate: fadePick, isLoading: isFading } = useFadePick();

  const [stake, setStake] = useState(0);
  const [availableBankroll, setAvailableBankroll] = useState(0);
  const [game, setGame] = useState<Game | null>(null);

  const isLoading = isTailing || isFading;

  // Debug logging
  useEffect(() => {
    if (isOpen && originalBet) {
      console.log('[TailFadeSheet] Original bet:', originalBet);
      console.log('[TailFadeSheet] Original bet ID:', originalBet.id);
      console.log('[TailFadeSheet] Original post:', originalPost);
    }
  }, [isOpen, originalBet, originalPost]);

  const fetchUserBankroll = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('bankrolls')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setAvailableBankroll(data.balance);
    }
  }, [user]);

  const fetchGameDetails = useCallback(async () => {
    if (!originalBet) return;

    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('id', originalBet.game_id)
      .single();

    if (data) {
      setGame(data as Game);
    }
  }, [originalBet]);

  // Fetch bankroll when sheet opens
  useEffect(() => {
    if (isOpen && user) {
      fetchUserBankroll();
    }
  }, [isOpen, user, fetchUserBankroll]);

  // Fetch game details when bet changes
  useEffect(() => {
    if (originalBet) {
      fetchGameDetails();
    }
  }, [originalBet, fetchGameDetails]);

  // Set default stake to match original bet
  useEffect(() => {
    if (originalBet) {
      setStake(originalBet.stake);
    }
  }, [originalBet]);

  const handleConfirm = useCallback(async () => {
    if (!originalBet || !originalPost || !action || !stake) {
      console.error('[TailFadeSheet] Missing required data:', {
        originalBet: !!originalBet,
        originalBetId: originalBet?.id,
        originalPost: !!originalPost,
        action,
        stake,
      });
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const input = {
      postId: originalPost.id,
      originalBetId: originalBet.id,
      stake,
      action,
    };

    console.log('[TailFadeSheet] Submitting with input:', input);

    if (action === 'tail') {
      await tailPick(input);
    } else {
      await fadePick(input);
    }

    onClose();
  }, [originalBet, originalPost, action, stake, tailPick, fadePick, onClose]);

  if (!originalBet || !originalUser || !action) return null;

  const actionColor = action === 'tail' ? Colors.primary : Colors.error;
  const actionEmoji = action === 'tail' ? '🤝' : '⚔️';
  const actionText =
    action === 'tail'
      ? "You'll ride with them on this pick. Win or lose together!"
      : "You're betting against them. May the best bettor win!";

  return (
    <BaseSheet
      isVisible={isOpen}
      onClose={onClose}
      height="70%"
      showDragIndicator={true}
      enableSwipeToClose={true}
    >
      <View style={styles.container}>
        <Text style={styles.title}>
          {action === 'tail' ? 'Tail' : 'Fade'} @{originalUser.username}?
        </Text>

        {/* Original Bet Details */}
        <View style={styles.betDetailsContainer}>
          <Text style={styles.betDetailsLabel}>
            {originalUser.display_name || originalUser.username}&apos;s Bet
          </Text>
          <Text style={styles.betDetailsText}>
            {formatBetDetails(originalBet, game || undefined)} ({formatOdds(originalBet.odds)})
          </Text>
          <Text style={styles.betDetailsSubtext}>
            ${originalBet.stake / 100} → Win: ${originalBet.potential_win / 100}
          </Text>
        </View>

        {/* Stake Selection */}
        <View style={styles.stakeContainer}>
          <Text style={styles.stakeLabel}>Your Stake:</Text>
          <Text style={styles.originalStakeNote}>
            {originalUser.username} bet ${originalBet.stake / 100}
          </Text>

          <StakeInput
            value={stake}
            onChange={setStake}
            maxAmount={availableBankroll}
            quickAmounts={[25, 50, 100]}
          />
        </View>

        {/* Insufficient Funds Warning */}
        {stake > availableBankroll && (
          <Text style={styles.warningText}>
            Insufficient funds (Available: ${availableBankroll / 100})
          </Text>
        )}

        {/* Payout Display */}
        {stake > 0 && game && (
          <PayoutDisplay
            stake={stake}
            odds={originalBet.odds}
            potentialWin={calculatePotentialWin(stake, originalBet.odds)}
          />
        )}

        {/* Action Message */}
        <Text style={styles.actionMessage}>
          {actionText} {actionEmoji}
        </Text>

        {/* Confirm Button */}
        <Pressable
          style={[
            styles.confirmButton,
            { backgroundColor: actionColor },
            (!stake || stake < 500 || stake > availableBankroll || isLoading) &&
              styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!stake || stake < 500 || stake > availableBankroll || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.confirmButtonText}>
              Confirm {action === 'tail' ? 'Tail' : 'Fade'} - ${stake / 100}
            </Text>
          )}
        </Pressable>
      </View>
    </BaseSheet>
  );
}

// Helper function to calculate potential win
function calculatePotentialWin(stake: number, odds: number): number {
  if (odds > 0) {
    // Positive odds: (stake * odds) / 100
    return Math.floor((stake * odds) / 100);
  } else {
    // Negative odds: (stake * 100) / Math.abs(odds)
    return Math.floor((stake * 100) / Math.abs(odds));
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  betDetailsContainer: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    gap: 4,
    marginTop: 16,
  },
  betDetailsLabel: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  betDetailsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  betDetailsSubtext: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  stakeContainer: {
    gap: 8,
    marginTop: 16,
  },
  stakeLabel: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  originalStakeNote: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  warningText: {
    color: Colors.error,
    fontSize: 12,
    textAlign: 'center',
  },
  actionMessage: {
    textAlign: 'center',
    color: Colors.text.secondary,
    fontSize: 14,
    marginVertical: 8,
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
