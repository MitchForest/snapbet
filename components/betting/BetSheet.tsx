import React, { useEffect, useState } from 'react';
import { Text, Stack } from '@tamagui/core';
import { Switch } from 'react-native';
import { BaseSheet } from '@/components/engagement/sheets/BaseSheet';
import { Colors } from '@/theme';
import { useBetSlipStore } from '@/stores/betSlipStore';
import { BetTypeSelector } from './BetTypeSelector';
import { TeamSelector } from './TeamSelector';
import { StakeInput } from './StakeInput';
import { PayoutDisplay } from './PayoutDisplay';
import { PlaceBetButton } from './PlaceBetButton';
import { Game } from '@/types/database';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Storage } from '@/services/storage/storageService';
import { toastService } from '@/services/toastService';
import { bettingService } from '@/services/betting/bettingService';

interface BetSheetProps {
  isVisible: boolean;
  onClose: () => void;
  game: Game | null;
}

export function BetSheet({ isVisible, onClose, game }: BetSheetProps) {
  const router = useRouter();
  const [availableBankroll] = useState(100000); // $1000 default for MVP

  const {
    betType,
    selection,
    stake,
    shareToFeed,
    isPlacing,
    isValid,
    validationError,
    setGame,
    setBetType,
    setSelection,
    setStake,
    toggleShareToFeed,
    setIsPlacing,
    reset,
    getCurrentOdds,
    getPotentialPayout,
  } = useBetSlipStore();

  // Set game when sheet opens
  useEffect(() => {
    if (isVisible && game) {
      setGame(game);
    }
  }, [isVisible, game, setGame]);

  // Get team abbreviations for display
  const homeTeamAbbr = game ? getTeamAbbreviation(game.home_team) : '';
  const awayTeamAbbr = game ? getTeamAbbreviation(game.away_team) : '';

  const handlePlaceBet = async () => {
    if (!game || !selection || !isValid) return;

    setIsPlacing(true);

    try {
      // Prepare bet input
      const betInput = {
        gameId: game.id,
        betType,
        selection,
        stake,
        odds: getCurrentOdds(),
      };

      // Place bet via service
      const bet = await bettingService.placeBet(betInput);

      // Success haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Handle share flow
      if (shareToFeed) {
        // Store bet ID for camera
        Storage.betting.set('pendingShareBetId', bet.id);

        // Close sheet first
        onClose();

        // Navigate to camera after a brief delay
        setTimeout(() => {
          router.push('/camera');
        }, 300);
      } else {
        // Just close sheet
        onClose();
        toastService.show({
          message: 'Bet placed successfully! 🎯',
          type: 'success',
        });
      }

      // Reset store
      reset();
    } catch (error) {
      // Error handling
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toastService.show({
        message: error instanceof Error ? error.message : 'Failed to place bet',
        type: 'error',
      });
    } finally {
      setIsPlacing(false);
    }
  };

  const handleClose = () => {
    if (!isPlacing) {
      onClose();
      // Don't reset immediately to allow for animation
      setTimeout(() => reset(), 300);
    }
  };

  if (!game) return null;

  return (
    <BaseSheet
      isVisible={isVisible}
      onClose={handleClose}
      height="90%"
      keyboardAvoidingEnabled={true}
      enableSwipeToClose={!isPlacing}
    >
      <Stack flex={1} padding={16}>
        {/* Game Header */}
        <Stack marginBottom={16}>
          <Text
            fontSize={18}
            fontWeight="600"
            color={Colors.text.primary}
            textAlign="center"
            marginBottom={4}
          >
            {awayTeamAbbr} @ {homeTeamAbbr}
          </Text>
          <Text fontSize={14} color={Colors.text.secondary} textAlign="center">
            {formatGameTime(new Date(game.commence_time))}
          </Text>
        </Stack>

        {/* Bet Type Tabs */}
        <BetTypeSelector selected={betType} onChange={setBetType} />

        {/* Team/Side Selection */}
        <TeamSelector game={game} betType={betType} selected={selection} onChange={setSelection} />

        {/* Stake Input Section */}
        <StakeInput
          value={stake}
          onChange={setStake}
          quickAmounts={[25, 50, 100]}
          maxAmount={availableBankroll}
        />

        {/* Payout Display */}
        <PayoutDisplay stake={stake} odds={getCurrentOdds()} potentialWin={getPotentialPayout()} />

        {/* Share Toggle */}
        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          paddingVertical={16}
          borderTopWidth={1}
          borderTopColor={Colors.border.light}
          marginTop={16}
        >
          <Text fontSize={16} color={Colors.text.primary}>
            Share Pick to Feed
          </Text>
          <Switch
            value={shareToFeed}
            onValueChange={toggleShareToFeed}
            trackColor={{
              false: Colors.gray[300],
              true: Colors.primary,
            }}
            thumbColor={Colors.white}
          />
        </Stack>

        {/* Place Bet Button */}
        <PlaceBetButton
          onPress={handlePlaceBet}
          isLoading={isPlacing}
          isDisabled={!isValid}
          errorMessage={validationError}
        />
      </Stack>
    </BaseSheet>
  );
}

// Helper functions
function getTeamAbbreviation(fullName: string): string {
  // This is a simplified version - should match GameCard implementation
  const parts = fullName.split(' ');
  const cityMap: Record<string, string> = {
    'Los Angeles Lakers': 'LAL',
    'Los Angeles Clippers': 'LAC',
    'Boston Celtics': 'BOS',
    'Golden State Warriors': 'GSW',
    'Miami Heat': 'MIA',
    'Milwaukee Bucks': 'MIL',
    'Philadelphia 76ers': 'PHI',
    'Denver Nuggets': 'DEN',
    'Kansas City Chiefs': 'KC',
    'Buffalo Bills': 'BUF',
    'San Francisco 49ers': 'SF',
    'Dallas Cowboys': 'DAL',
  };

  return cityMap[fullName] || parts[parts.length - 1].substring(0, 3).toUpperCase();
}

function formatGameTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm} ET`;
}
