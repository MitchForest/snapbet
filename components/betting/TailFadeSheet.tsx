import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Bet } from '@/services/betting/types';
import { Game } from '@/types/database';
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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { user } = useAuth();
  const { mutate: tailPick, isLoading: isTailing } = useTailPick();
  const { mutate: fadePick, isLoading: isFading } = useFadePick();

  const [stake, setStake] = useState(0);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [availableBankroll, setAvailableBankroll] = useState(0);
  const [game, setGame] = useState<Game | null>(null);

  const isLoading = isTailing || isFading;

  // Fetch bankroll when sheet opens
  useEffect(() => {
    if (isOpen && user) {
      fetchUserBankroll();
    }
  }, [isOpen, user]);

  // Fetch game details when bet changes
  useEffect(() => {
    if (originalBet) {
      fetchGameDetails();
    }
  }, [originalBet]);

  // Set default stake to match original bet
  useEffect(() => {
    if (originalBet) {
      setStake(originalBet.stake);
      setShowCustomInput(false);
    }
  }, [originalBet]);

  // Handle sheet state
  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const fetchUserBankroll = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('bankrolls')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setAvailableBankroll(data.balance);
    }
  };

  const fetchGameDetails = async () => {
    if (!originalBet) return;

    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('id', originalBet.game_id)
      .single();

    if (data) {
      setGame(data as Game);
    }
  };

  const quickAmounts = useMemo(() => {
    if (!originalBet) return [];
    return [
      originalBet.stake,
      2500, // $25
      5000, // $50
      10000, // $100
    ];
  }, [originalBet]);

  const handleConfirm = useCallback(async () => {
    if (!originalBet || !originalPost || !action || !stake) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const input = {
      postId: originalPost.id,
      originalBetId: originalBet.id,
      stake,
      action,
    };

    if (action === 'tail') {
      await tailPick(input);
    } else {
      await fadePick(input);
    }

    onClose();
  }, [originalBet, originalPost, action, stake, tailPick, fadePick, onClose]);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  if (!originalBet || !originalUser || !action) return null;

  const actionColor = action === 'tail' ? Colors.primary : Colors.error;
  const actionEmoji = action === 'tail' ? '🤝' : '⚔️';
  const actionText =
    action === 'tail'
      ? "You'll ride with them on this pick. Win or lose together!"
      : "You're betting against them. May the best bettor win!";

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['50%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onClose={onClose}
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
            {formatBetDetails(originalBet)} ({formatOdds(originalBet.odds)})
          </Text>
          <Text style={styles.betDetailsSubtext}>
            ${originalBet.stake / 100} → Win: ${originalBet.potential_win / 100}
          </Text>
        </View>

        {/* Stake Selection */}
        <View style={styles.stakeContainer}>
          <Text style={styles.stakeLabel}>Your Stake:</Text>

          {!showCustomInput ? (
            <View style={styles.quickAmountsContainer}>
              {quickAmounts.map((amount) => (
                <Pressable
                  key={amount}
                  style={[
                    styles.quickAmountButton,
                    stake === amount && { backgroundColor: actionColor },
                  ]}
                  onPress={() => {
                    setStake(amount);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      stake === amount && styles.quickAmountTextActive,
                    ]}
                  >
                    ${amount / 100}
                    {amount === originalBet.stake && ' (match)'}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                style={[styles.quickAmountButton, styles.customButton]}
                onPress={() => {
                  setShowCustomInput(true);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={styles.quickAmountText}>Custom</Text>
              </Pressable>
            </View>
          ) : (
            <StakeInput
              value={stake}
              onChange={setStake}
              maxAmount={availableBankroll}
              quickAmounts={[25, 50, 100]}
            />
          )}
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
            potentialWin={originalBet.potential_win}
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
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
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
  },
  stakeLabel: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAmountButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  quickAmountText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  quickAmountTextActive: {
    color: Colors.white,
  },
  customButton: {
    borderStyle: 'dashed',
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
