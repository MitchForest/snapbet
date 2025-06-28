import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/theme';
import { GamesList } from '@/components/betting/GamesList';
import { BetSheet } from '@/components/betting/BetSheet';
import { BankrollBadge } from '@/components/betting/BankrollBadge';
import { BankrollStatsModal } from '@/components/betting/BankrollStatsModal';
import { Game } from '@/types/database-helpers';

export default function GamesScreen() {
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
    <View style={styles.container}>
      {/* Sticky Bankroll Badge */}
      <View style={styles.bankrollContainer}>
        <BankrollBadge onPress={handleBankrollPress} />
      </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bankrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    alignItems: 'center',
    zIndex: 10,
  },
});
