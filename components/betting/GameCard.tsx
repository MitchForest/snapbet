import React, { memo } from 'react';
import { View, Text, Stack } from '@tamagui/core';
import { TouchableOpacity } from 'react-native';
import { Colors } from '@/theme';
import { Game } from '@/types/database';
import { SportBadge } from './SportBadge';
import { Storage, StorageKeys } from '@/services/storage/storageService';
import * as Haptics from 'expo-haptics';
import { getTeamById } from '@/data/teams';

interface GameCardProps {
  game: Game;
  onQuickBet: (game: Game) => void;
}

export const GameCard = memo(
  ({ game, onQuickBet }: GameCardProps) => {
    const isLive = game.status === 'live';
    const isFinal = game.status === 'completed';
    const sport = game.sport_title as 'NBA' | 'NFL';

    // Get team colors
    const homeTeamAbbr = getTeamAbbreviation(game.home_team);
    const awayTeamAbbr = getTeamAbbreviation(game.away_team);
    const homeTeam = getTeamById(homeTeamAbbr);
    const awayTeam = getTeamById(awayTeamAbbr);

    // Format time
    const gameTime = new Date(game.commence_time);
    const timeString = formatGameTime(gameTime);

    // Get odds
    const odds = game.odds_data?.bookmakers?.[0]?.markets;
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
      <View
        backgroundColor={Colors.surface}
        borderRadius={12}
        padding={16}
        marginBottom={8}
        borderWidth={1}
        borderColor={Colors.border.default}
      >
        {/* Header */}
        <Stack
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginBottom={12}
        >
          <Stack flexDirection="row" alignItems="center" gap={8}>
            <SportBadge sport={sport} />
            <Text color={Colors.text.secondary} fontSize={14}>
              • {timeString}
            </Text>
          </Stack>
          {isLive && (
            <View
              backgroundColor={Colors.error}
              paddingHorizontal={8}
              paddingVertical={4}
              borderRadius={8}
            >
              <Text color={Colors.white} fontSize={12} fontWeight="600">
                LIVE
              </Text>
            </View>
          )}
        </Stack>

        {/* Teams and Score */}
        <Stack
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginBottom={16}
        >
          {/* Away Team */}
          <Stack alignItems="center" flex={1}>
            <View
              width={60}
              height={60}
              backgroundColor={awayTeam?.primaryColor || Colors.gray[200]}
              borderRadius={8}
              justifyContent="center"
              alignItems="center"
              marginBottom={8}
            >
              <Text color={Colors.white} fontSize={20} fontWeight="700">
                {awayTeamAbbr}
              </Text>
            </View>
            <Text color={Colors.text.primary} fontSize={14} fontWeight="600">
              {awayTeamAbbr}
            </Text>
            <Text color={Colors.text.secondary} fontSize={12}>
              {getTeamRecord(awayTeamAbbr)}
            </Text>
          </Stack>

          {/* Score or VS */}
          <Stack flex={1} alignItems="center">
            {(isLive || isFinal) && game.home_score !== null && game.away_score !== null ? (
              <Stack flexDirection="row" alignItems="center" gap={12}>
                <Text color={Colors.text.primary} fontSize={24} fontWeight="700">
                  {game.away_score}
                </Text>
                <Text color={Colors.text.secondary} fontSize={16}>
                  -
                </Text>
                <Text color={Colors.text.primary} fontSize={24} fontWeight="700">
                  {game.home_score}
                </Text>
              </Stack>
            ) : (
              <Text color={Colors.text.secondary} fontSize={16} fontWeight="500">
                VS
              </Text>
            )}
          </Stack>

          {/* Home Team */}
          <Stack alignItems="center" flex={1}>
            <View
              width={60}
              height={60}
              backgroundColor={homeTeam?.primaryColor || Colors.gray[200]}
              borderRadius={8}
              justifyContent="center"
              alignItems="center"
              marginBottom={8}
            >
              <Text color={Colors.white} fontSize={20} fontWeight="700">
                {homeTeamAbbr}
              </Text>
            </View>
            <Text color={Colors.text.primary} fontSize={14} fontWeight="600">
              {homeTeamAbbr}
            </Text>
            <Text color={Colors.text.secondary} fontSize={12}>
              {getTeamRecord(homeTeamAbbr)}
            </Text>
          </Stack>
        </Stack>

        {/* Odds */}
        {odds && !isFinal && (
          <Stack gap={8} marginBottom={16}>
            {/* Spread */}
            {spread && (
              <Stack flexDirection="row" justifyContent="space-between">
                <Text color={Colors.text.secondary} fontSize={13}>
                  Spread:
                </Text>
                <Stack flexDirection="row" gap={8}>
                  <Text color={Colors.text.primary} fontSize={13} fontWeight="500">
                    {awayTeamAbbr} {formatSpread(spread.line * -1)} ({formatOdds(spread.away)})
                  </Text>
                  <Text color={Colors.text.secondary} fontSize={13}>
                    |
                  </Text>
                  <Text color={Colors.text.primary} fontSize={13} fontWeight="500">
                    {homeTeamAbbr} {formatSpread(spread.line)} ({formatOdds(spread.home)})
                  </Text>
                </Stack>
              </Stack>
            )}

            {/* Total */}
            {total && (
              <Stack flexDirection="row" justifyContent="space-between">
                <Text color={Colors.text.secondary} fontSize={13}>
                  Total:
                </Text>
                <Stack flexDirection="row" gap={8}>
                  <Text color={Colors.text.primary} fontSize={13} fontWeight="500">
                    O {total.line} ({formatOdds(total.over)})
                  </Text>
                  <Text color={Colors.text.secondary} fontSize={13}>
                    |
                  </Text>
                  <Text color={Colors.text.primary} fontSize={13} fontWeight="500">
                    U {total.line} ({formatOdds(total.under)})
                  </Text>
                </Stack>
              </Stack>
            )}

            {/* Moneyline */}
            {moneyline && (
              <Stack flexDirection="row" justifyContent="space-between">
                <Text color={Colors.text.secondary} fontSize={13}>
                  Money:
                </Text>
                <Stack flexDirection="row" gap={8}>
                  <Text color={Colors.text.primary} fontSize={13} fontWeight="500">
                    {awayTeamAbbr} {formatOdds(moneyline.away)}
                  </Text>
                  <Text color={Colors.text.secondary} fontSize={13}>
                    |
                  </Text>
                  <Text color={Colors.text.primary} fontSize={13} fontWeight="500">
                    {homeTeamAbbr} {formatOdds(moneyline.home)}
                  </Text>
                </Stack>
              </Stack>
            )}
          </Stack>
        )}

        {/* Quick Bet Button */}
        {!isFinal && (
          <TouchableOpacity onPress={handleQuickBet}>
            <View
              backgroundColor={Colors.primary}
              paddingVertical={12}
              borderRadius={8}
              alignItems="center"
            >
              <Text color={Colors.white} fontSize={16} fontWeight="600">
                Quick Bet →
              </Text>
            </View>
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
