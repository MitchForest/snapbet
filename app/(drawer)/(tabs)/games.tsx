import React, { useState } from 'react';
import { View } from '@tamagui/core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { GamesList } from '@/components/betting/GamesList';
import { BetSheet } from '@/components/betting/BetSheet';
import { Game } from '@/types/database';

export default function GamesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isBetSheetVisible, setIsBetSheetVisible] = useState(false);

  const handleQuickBet = (game: Game) => {
    setSelectedGame(game);
    setIsBetSheetVisible(true);
  };

  const handleCloseBetSheet = () => {
    setIsBetSheetVisible(false);
    // Clear selected game after animation
    setTimeout(() => setSelectedGame(null), 300);
  };

  return (
    <View flex={1} backgroundColor={Colors.background} paddingTop={insets.top}>
      <GamesList onQuickBet={handleQuickBet} />

      <BetSheet isVisible={isBetSheetVisible} onClose={handleCloseBetSheet} game={selectedGame} />
    </View>
  );
}
