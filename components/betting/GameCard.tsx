import React, { memo } from 'react';
import { View, Text, Stack } from '@tamagui/core';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/theme';
import { Game } from '@/types/database-helpers';
import { SportBadge } from './SportBadge';
import { Storage, StorageKeys } from '@/services/storage/storageService';
import * as Haptics from 'expo-haptics';
import { getTeamByFullName } from '@/data/teams';
import { getOddsData } from '@/types/betting';

interface GameCardProps {
  game: Game;
  onQuickBet: (game: Game) => void;
}

export const GameCard = memo(
  ({ game, onQuickBet }: GameCardProps) => {
    const isLive = game.status === 'live';
    const isFinal = game.status === 'completed';
    const sport = game.sport_title as 'NBA' | 'NFL';

    // Get team info using full names
    const homeTeam = getTeamByFullName(game.home_team);
    const awayTeam = getTeamByFullName(game.away_team);
    const homeTeamAbbr = homeTeam?.abbreviation || getTeamAbbreviation(game.home_team);
    const awayTeamAbbr = awayTeam?.abbreviation || getTeamAbbreviation(game.away_team);

    // Format time
    const gameTime = new Date(game.commence_time);
    const timeString = formatGameTime(gameTime);

    // Get odds
    const oddsData = getOddsData(game.odds_data);
    const odds = oddsData?.bookmakers?.[0]?.markets;
    const spread = odds?.spreads;
    const total = odds?.totals;
    const moneyline = odds?.h2h;

    const handleQuickBet = () => {
      // Store the selected game for future use
      Storage.betting.set(StorageKeys.BETTING.SELECTED_GAME, game);

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Call the onQuickBet handler
      onQuickBet(game);
    };

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Stack flexDirection="row" alignItems="center" gap={8}>
            <SportBadge sport={sport} />
            <Text style={styles.timeText}>• {timeString}</Text>
          </Stack>
          {isLive && (
            <View style={styles.liveIndicator}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        {/* Table Layout */}
        {!isFinal ? (
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.teamColumn} />
              <View style={styles.oddsColumn}>
                <Text style={styles.columnHeader}>Spread</Text>
              </View>
              <View style={styles.oddsColumn}>
                <Text style={styles.columnHeader}>Total</Text>
              </View>
              <View style={styles.oddsColumn}>
                <Text style={styles.columnHeader}>Moneyline</Text>
              </View>
            </View>

            {/* Away Team Row */}
            <View style={styles.tableRow}>
              <View style={styles.teamColumn}>
                <View style={styles.teamInfo}>
                  <View
                    style={[
                      styles.teamBadge,
                      { backgroundColor: awayTeam?.primaryColor || Colors.gray[200] },
                    ]}
                  >
                    <Text style={styles.teamBadgeText}>{awayTeamAbbr}</Text>
                  </View>
                  <Text style={styles.teamName}>{awayTeamAbbr}</Text>
                  <Text style={styles.teamRecord}>{getTeamRecord(awayTeamAbbr)}</Text>
                </View>
              </View>
              <View style={styles.oddsColumn}>
                <TouchableOpacity onPress={handleQuickBet} style={styles.oddsCell}>
                  <Text style={styles.oddsLine}>
                    {spread ? formatSpread(spread.line * -1) : '-'}
                  </Text>
                  <Text style={styles.oddsValue}>{spread ? formatOdds(spread.away) : '-'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.oddsColumn}>
                <TouchableOpacity onPress={handleQuickBet} style={styles.oddsCell}>
                  <Text style={styles.oddsLine}>O {total?.line || '-'}</Text>
                  <Text style={styles.oddsValue}>{total ? formatOdds(total.over) : '-'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.oddsColumn}>
                <TouchableOpacity onPress={handleQuickBet} style={styles.oddsCell}>
                  <Text style={styles.oddsValue}>
                    {moneyline ? formatOdds(moneyline.away) : '-'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Home Team Row */}
            <View style={[styles.tableRow, styles.lastRow]}>
              <View style={styles.teamColumn}>
                <View style={styles.teamInfo}>
                  <View
                    style={[
                      styles.teamBadge,
                      { backgroundColor: homeTeam?.primaryColor || Colors.gray[200] },
                    ]}
                  >
                    <Text style={styles.teamBadgeText}>{homeTeamAbbr}</Text>
                  </View>
                  <Text style={styles.teamName}>{homeTeamAbbr}</Text>
                  <Text style={styles.teamRecord}>{getTeamRecord(homeTeamAbbr)}</Text>
                </View>
              </View>
              <View style={styles.oddsColumn}>
                <TouchableOpacity onPress={handleQuickBet} style={styles.oddsCell}>
                  <Text style={styles.oddsLine}>{spread ? formatSpread(spread.line) : '-'}</Text>
                  <Text style={styles.oddsValue}>{spread ? formatOdds(spread.home) : '-'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.oddsColumn}>
                <TouchableOpacity onPress={handleQuickBet} style={styles.oddsCell}>
                  <Text style={styles.oddsLine}>U {total?.line || '-'}</Text>
                  <Text style={styles.oddsValue}>{total ? formatOdds(total.under) : '-'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.oddsColumn}>
                <TouchableOpacity onPress={handleQuickBet} style={styles.oddsCell}>
                  <Text style={styles.oddsValue}>
                    {moneyline ? formatOdds(moneyline.home) : '-'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          // Final Score Display
          <View style={styles.finalScoreContainer}>
            <View style={styles.finalTeam}>
              <View
                style={[
                  styles.teamBadge,
                  { backgroundColor: awayTeam?.primaryColor || Colors.gray[200] },
                ]}
              >
                <Text style={styles.teamBadgeText}>{awayTeamAbbr}</Text>
              </View>
              <Text style={styles.finalScore}>{game.away_score}</Text>
            </View>
            <Text style={styles.finalDivider}>-</Text>
            <View style={styles.finalTeam}>
              <View
                style={[
                  styles.teamBadge,
                  { backgroundColor: homeTeam?.primaryColor || Colors.gray[200] },
                ]}
              >
                <Text style={styles.teamBadgeText}>{homeTeamAbbr}</Text>
              </View>
              <Text style={styles.finalScore}>{game.home_score}</Text>
            </View>
          </View>
        )}

        {/* Quick Bet Button */}
        {!isFinal && (
          <TouchableOpacity onPress={handleQuickBet} style={styles.quickBetButton}>
            <Text style={styles.quickBetText}>Quick Bet →</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for re-renders
    return (
      prevProps.game.id === nextProps.game.id &&
      prevProps.game.home_score === nextProps.game.home_score &&
      prevProps.game.away_score === nextProps.game.away_score &&
      prevProps.game.status === nextProps.game.status
    );
  }
);

GameCard.displayName = 'GameCard';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border.default,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  timeText: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  liveIndicator: {
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  tableContainer: {
    backgroundColor: Colors.background,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  teamColumn: {
    flex: 1.2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: Colors.border.light,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  teamName: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  teamRecord: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginLeft: 'auto',
  },
  oddsColumn: {
    flex: 1,
  },
  columnHeader: {
    color: Colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 8,
  },
  oddsCell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  oddsLine: {
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  oddsValue: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  finalScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 24,
  },
  finalTeam: {
    alignItems: 'center',
    gap: 8,
  },
  finalScore: {
    color: Colors.text.primary,
    fontSize: 28,
    fontWeight: '700',
  },
  finalDivider: {
    color: Colors.text.secondary,
    fontSize: 20,
  },
  quickBetButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickBetText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

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

function getTeamRecord(teamAbbr: string): string {
  // Mock records for now
  const records: Record<string, string> = {
    LAL: '45-20',
    BOS: '42-23',
    GSW: '38-27',
    MIA: '35-30',
    KC: '14-3',
    BUF: '13-4',
    SF: '12-5',
    DAL: '11-6',
  };

  return records[teamAbbr] || '0-0';
}

function formatGameTime(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = new Date(now.getTime() + 86400000).toDateString() === date.toDateString();

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm} ET`;

  if (isToday) return `Tonight ${timeStr}`;
  if (isTomorrow) return `Tomorrow ${timeStr}`;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[date.getDay()]} ${timeStr}`;
}

function formatOdds(odds: number): string {
  if (odds > 0) return `+${odds}`;
  return odds.toString();
}

function formatSpread(spread: number): string {
  if (spread > 0) return `+${spread}`;
  return spread.toString();
}
