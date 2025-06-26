import React from 'react';
import { View } from '@tamagui/core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { GamesList } from '@/components/betting/GamesList';
import { Game } from '@/types/database';

export default function GamesScreen() {
  const insets = useSafeAreaInsets();

  const handleQuickBet = (game: Game) => {
    // Quick bet flow will be implemented in Sprint 05.03
    console.log('Quick bet for game:', game.id);
  };

  return (
    <View flex={1} backgroundColor={Colors.background} paddingTop={insets.top}>
      <GamesList onQuickBet={handleQuickBet} />
    </View>
  );
}
