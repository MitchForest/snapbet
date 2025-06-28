import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/theme';
import { Game } from '@/types/database-helpers';
import { BetType, BetSelection, TeamSelection, TotalSelection } from '@/stores/betSlipStore';
import { getTeamByFullName } from '@/data/teams';
import * as Haptics from 'expo-haptics';
import { getOddsData } from '@/types/betting';

interface TeamSelectorProps {
  game: Game;
  betType: BetType;
  selected: BetSelection;
  onChange: (selection: BetSelection) => void;
}

export function TeamSelector({ game, betType, selected, onChange }: TeamSelectorProps) {
  const oddsData = getOddsData(game.odds_data);
  const odds = oddsData?.bookmakers?.[0]?.markets;
  if (!odds) return null;

  const handleSelection = async (selection: BetSelection) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onChange(selection);
  };

  // Get team info
  const homeTeam = getTeamByFullName(game.home_team);
  const awayTeam = getTeamByFullName(game.away_team);
  const homeTeamAbbr = homeTeam?.abbreviation || getTeamAbbreviation(game.home_team);
  const awayTeamAbbr = awayTeam?.abbreviation || getTeamAbbreviation(game.away_team);

  if (betType === 'spread' || betType === 'moneyline') {
    const spread = odds.spreads;
    const moneyline = odds.h2h;
    const isSpread = betType === 'spread';

    return (
      <View style={styles.selectorContainer}>
        {/* Away Team */}
        <TouchableOpacity
          style={[
            styles.teamButton,
            selected &&
              'team' in selected &&
              selected.team === game.away_team &&
              styles.selectedButton,
          ]}
          onPress={() =>
            handleSelection({
              team: game.away_team,
              line: isSpread ? (spread?.line ? -spread.line : undefined) : undefined,
            } as TeamSelection)
          }
        >
          <View
            style={[
              styles.teamLogo,
              { backgroundColor: awayTeam?.primaryColor || Colors.gray[300] },
            ]}
          >
            <Text style={styles.teamLogoText}>{awayTeamAbbr}</Text>
          </View>
          <Text style={styles.teamName}>{awayTeamAbbr}</Text>
          {isSpread && spread && (
            <Text style={styles.spreadText}>
              {spread.line && spread.line > 0 ? '+' : ''}
              {spread.line ? -spread.line : 0}
            </Text>
          )}
          <Text style={styles.oddsText}>
            {formatOdds(isSpread ? spread?.away || 0 : moneyline?.away || 0)}
          </Text>
        </TouchableOpacity>

        {/* Home Team */}
        <TouchableOpacity
          style={[
            styles.teamButton,
            selected &&
              'team' in selected &&
              selected.team === game.home_team &&
              styles.selectedButton,
          ]}
          onPress={() =>
            handleSelection({
              team: game.home_team,
              line: isSpread ? spread?.line : undefined,
            } as TeamSelection)
          }
        >
          <View
            style={[
              styles.teamLogo,
              { backgroundColor: homeTeam?.primaryColor || Colors.gray[300] },
            ]}
          >
            <Text style={styles.teamLogoText}>{homeTeamAbbr}</Text>
          </View>
          <Text style={styles.teamName}>{homeTeamAbbr}</Text>
          {isSpread && spread && (
            <Text style={styles.spreadText}>
              {spread.line && spread.line > 0 ? '+' : ''}
              {spread.line || 0}
            </Text>
          )}
          <Text style={styles.oddsText}>
            {formatOdds(isSpread ? spread?.home || 0 : moneyline?.home || 0)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Total (Over/Under)
  if (betType === 'total' && odds?.totals) {
    const totals = odds.totals;
    return (
      <View style={styles.selectorContainer}>
        {/* Over */}
        <TouchableOpacity
          style={[
            styles.totalButton,
            selected &&
              'totalType' in selected &&
              selected.totalType === 'over' &&
              styles.selectedButton,
          ]}
          onPress={() =>
            handleSelection({
              totalType: 'over',
              line: totals.line,
            } as TotalSelection)
          }
        >
          <Text style={styles.totalText}>OVER</Text>
          <Text style={styles.totalLineText}>{totals.line}</Text>
          <Text style={styles.totalOddsText}>{formatOdds(totals.over)}</Text>
        </TouchableOpacity>

        {/* Under */}
        <TouchableOpacity
          style={[
            styles.totalButton,
            selected &&
              'totalType' in selected &&
              selected.totalType === 'under' &&
              styles.selectedButton,
          ]}
          onPress={() =>
            handleSelection({
              totalType: 'under',
              line: totals.line,
            } as TotalSelection)
          }
        >
          <Text style={styles.totalText}>UNDER</Text>
          <Text style={styles.totalLineText}>{totals.line}</Text>
          <Text style={styles.totalOddsText}>{formatOdds(totals.under)}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

// Helper functions
function getTeamAbbreviation(fullName: string): string {
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

function formatOdds(odds: number): string {
  if (odds > 0) return `+${odds}`;
  return odds.toString();
}

const styles = StyleSheet.create({
  selectorContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  teamButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border.default,
  },
  totalButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border.default,
  },
  selectedButton: {
    borderColor: Colors.primary,
    backgroundColor: Colors.lightGreen,
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogoText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  teamName: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  spreadText: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  oddsText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  totalText: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  totalLineText: {
    color: Colors.text.secondary,
    fontSize: 16,
    marginTop: 4,
  },
  totalOddsText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
});
