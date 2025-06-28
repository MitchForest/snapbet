import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Switch, ScrollView } from 'react-native';
import { BaseSheet } from '@/components/engagement/sheets/BaseSheet';
import { Colors } from '@/theme';
import { useBetSlipStore } from '@/stores/betSlipStore';
import { BetTypeSelector } from './BetTypeSelector';
import { TeamSelector } from './TeamSelector';
import { StakeInput } from './StakeInput';
import { PayoutDisplay } from './PayoutDisplay';
import { PlaceBetButton } from './PlaceBetButton';
import { Game } from '@/types/database-helpers';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { toastService } from '@/services/toastService';
import { bettingService } from '@/services/betting/bettingService';
import { useBetSharing } from '@/hooks/useBetSharing';
import { PendingShareBet } from '@/types/content';
import { useAvailableBalance } from '@/hooks/useBankroll';

interface BetSheetProps {
  isVisible: boolean;
  onClose: () => void;
  game: Game | null;
}

export function BetSheet({ isVisible, onClose, game }: BetSheetProps) {
  const router = useRouter();
  const { storeBetForSharing } = useBetSharing();
  const availableBankroll = useAvailableBalance();

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
        // Prepare bet details for sharing
        const betDetails: {
          team?: string;
          line?: number;
          total_type?: 'over' | 'under';
        } = {};

        if (betType === 'spread' || betType === 'moneyline') {
          // Type guard for TeamSelection
          if (selection && 'team' in selection) {
            betDetails.team = selection.team;
            if (betType === 'spread' && selection.line !== undefined) {
              betDetails.line = selection.line;
            }
          }
        } else if (betType === 'total') {
          // Type guard for TotalSelection
          if (selection && 'totalType' in selection) {
            betDetails.total_type = selection.totalType;
            betDetails.line = selection.line;
          }
        }

        const pendingBet: PendingShareBet = {
          betId: bet.id,
          type: 'pick',
          gameId: bet.game_id,
          betType: bet.bet_type,
          betDetails,
          stake: bet.stake,
          odds: bet.odds,
          potentialWin: bet.potential_win,
          expiresAt: game.commence_time,
          game,
        };

        storeBetForSharing(pendingBet);

        // Close sheet first
        onClose();

        // Navigate to camera after a brief delay
        setTimeout(() => {
          router.push('/camera?mode=pick');
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
      height="75%"
      keyboardAvoidingEnabled={true}
      enableSwipeToClose={!isPlacing}
    >
      <ScrollView>
        <View style={styles.container}>
          {/* Game Header */}
          <View>
            <Text style={styles.gameHeader}>
              {awayTeamAbbr} @ {homeTeamAbbr}
            </Text>
            <Text style={styles.gameTime}>{formatGameTime(new Date(game.commence_time))}</Text>
          </View>

          {/* Bet Type Tabs */}
          <BetTypeSelector selected={betType} onChange={setBetType} />

          {/* Team/Side Selection */}
          <TeamSelector
            game={game}
            betType={betType}
            selected={selection}
            onChange={setSelection}
          />

          {/* Stake Input Section */}
          <StakeInput
            value={stake}
            onChange={setStake}
            quickAmounts={[25, 50, 100]}
            maxAmount={availableBankroll}
          />

          {/* Payout Display */}
          <PayoutDisplay
            stake={stake}
            odds={getCurrentOdds()}
            potentialWin={getPotentialPayout()}
          />

          {/* Share Toggle */}
          <View style={styles.shareToggleContainer}>
            <Text style={styles.shareToggleText}>Share Pick to Feed</Text>
            <Switch
              value={shareToFeed}
              onValueChange={toggleShareToFeed}
              trackColor={{
                false: Colors.gray[300],
                true: Colors.primary,
              }}
              thumbColor={Colors.white}
            />
          </View>

          {/* Place Bet Button */}
          <PlaceBetButton
            onPress={handlePlaceBet}
            isLoading={isPlacing}
            isDisabled={!isValid}
            errorMessage={validationError}
          />
        </View>
      </ScrollView>
    </BaseSheet>
  );
}

// Helper functions
function getTeamAbbreviation(fullName: string): string {
  // Comprehensive mapping for all teams
  const cityMap: Record<string, string> = {
    // NBA Teams
    'Los Angeles Lakers': 'LAL',
    'Los Angeles Clippers': 'LAC',
    'Boston Celtics': 'BOS',
    'Brooklyn Nets': 'BKN',
    'New York Knicks': 'NYK',
    'Philadelphia 76ers': 'PHI',
    'Toronto Raptors': 'TOR',
    'Chicago Bulls': 'CHI',
    'Cleveland Cavaliers': 'CLE',
    'Detroit Pistons': 'DET',
    'Indiana Pacers': 'IND',
    'Milwaukee Bucks': 'MIL',
    'Atlanta Hawks': 'ATL',
    'Charlotte Hornets': 'CHA',
    'Miami Heat': 'MIA',
    'Orlando Magic': 'ORL',
    'Washington Wizards': 'WAS',
    'Denver Nuggets': 'DEN',
    'Minnesota Timberwolves': 'MIN',
    'Oklahoma City Thunder': 'OKC',
    'Portland Trail Blazers': 'POR',
    'Utah Jazz': 'UTA',
    'Golden State Warriors': 'GSW',
    'Phoenix Suns': 'PHX',
    'Sacramento Kings': 'SAC',
    'Dallas Mavericks': 'DAL',
    'Houston Rockets': 'HOU',
    'Memphis Grizzlies': 'MEM',
    'New Orleans Pelicans': 'NOP',
    'San Antonio Spurs': 'SAS',
    // NFL Teams
    'Buffalo Bills': 'BUF',
    'Miami Dolphins': 'MIA',
    'New England Patriots': 'NE',
    'New York Jets': 'NYJ',
    'Baltimore Ravens': 'BAL',
    'Cincinnati Bengals': 'CIN',
    'Cleveland Browns': 'CLE',
    'Pittsburgh Steelers': 'PIT',
    'Houston Texans': 'HOU',
    'Indianapolis Colts': 'IND',
    'Jacksonville Jaguars': 'JAX',
    'Tennessee Titans': 'TEN',
    'Denver Broncos': 'DEN',
    'Kansas City Chiefs': 'KC',
    'Las Vegas Raiders': 'LV',
    'Los Angeles Chargers': 'LAC',
    'Dallas Cowboys': 'DAL',
    'New York Giants': 'NYG',
    'Philadelphia Eagles': 'PHI',
    'Washington Commanders': 'WAS',
    'Chicago Bears': 'CHI',
    'Detroit Lions': 'DET',
    'Green Bay Packers': 'GB',
    'Minnesota Vikings': 'MIN',
    'Atlanta Falcons': 'ATL',
    'Carolina Panthers': 'CAR',
    'New Orleans Saints': 'NO',
    'Tampa Bay Buccaneers': 'TB',
    'Arizona Cardinals': 'ARI',
    'Los Angeles Rams': 'LAR',
    'San Francisco 49ers': 'SF',
    'Seattle Seahawks': 'SEA',
  };

  return cityMap[fullName] || fullName.substring(0, 3).toUpperCase();
}

function formatGameTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm} ET`;
}

const styles = {
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  gameHeader: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  gameTime: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
  },
  shareToggleContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  shareToggleText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
};
