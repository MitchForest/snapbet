import React, { useState } from 'react';
import { View, Stack, Text } from '@tamagui/core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { GamesList } from '@/components/betting/GamesList';
import { BetSheet } from '@/components/betting/BetSheet';
import { BankrollBadge } from '@/components/betting/BankrollBadge';
import { BankrollStatsModal } from '@/components/betting/BankrollStatsModal';
import { Game } from '@/types/database';

export default function GamesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isBetSheetVisible, setIsBetSheetVisible] = useState(false);
  const [isBankrollModalVisible, setIsBankrollModalVisible] = useState(false);

  const handleQuickBet = (game: Game) => {
    setSelectedGame(game);
    setIsBetSheetVisible(true);
  };

  const handleCloseBetSheet = () => {
    setIsBetSheetVisible(false);
    // Clear selected game after animation
    setTimeout(() => setSelectedGame(null), 300);
  };

  const handleBankrollPress = () => {
    setIsBankrollModalVisible(true);
  };

  return (
    <View flex={1} backgroundColor={Colors.background}>
      {/* Header */}
      <Stack
        paddingTop={insets.top}
        paddingHorizontal="$4"
        paddingBottom="$3"
        backgroundColor={Colors.background}
        borderBottomWidth={1}
        borderBottomColor="$gray3"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text fontSize="$6" fontWeight="bold">
          Games
        </Text>
        <BankrollBadge onPress={handleBankrollPress} />
      </Stack>

      {/* Games List */}
      <GamesList onQuickBet={handleQuickBet} />

      {/* Modals */}
      <BetSheet isVisible={isBetSheetVisible} onClose={handleCloseBetSheet} game={selectedGame} />
      <BankrollStatsModal
        isOpen={isBankrollModalVisible}
        onClose={() => setIsBankrollModalVisible(false)}
      />
    </View>
  );
}
