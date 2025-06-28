import React, { useCallback, useState } from 'react';
import { View, Text, Stack } from '@tamagui/core';
import { FlashList } from '@shopify/flash-list';
import { RefreshControl, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useBetHistory, useActiveBets } from '@/hooks/useBetting';
import { useBankroll } from '@/hooks/useBankroll';
import { Colors } from '@/theme';
import { BetWithGame } from '@/services/betting/types';
import { format } from 'date-fns';

interface BetsListProps {
  userId: string;
  canView?: boolean;
  scrollable?: boolean;
}

// Simple BetCard component inline
function BetCard({ bet }: { bet: BetWithGame }) {
  const isSettled = bet.status !== 'pending';
  const isWin = bet.status === 'won';
  const isPush = bet.status === 'push';

  const getStatusColor = () => {
    if (isWin) return Colors.success;
    if (isPush) return Colors.gray[500];
    return Colors.error;
  };

  const getStatusEmoji = () => {
    if (isWin) return '✅';
    if (isPush) return '🤝';
    return '❌';
  };

  const formatBetDetails = () => {
    const details = bet.bet_details as {
      team?: string;
      line?: number;
      total_type?: 'over' | 'under';
    };
    switch (bet.bet_type) {
      case 'spread':
        return `${details.team || ''} ${details.line && details.line > 0 ? '+' : ''}${details.line || ''}`;
      case 'total':
        return `${details.total_type?.toUpperCase() || ''} ${details.line || ''}`;
      case 'moneyline':
        return details.team || '';
      default:
        return '';
    }
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  return (
    <View
      backgroundColor="$gray2"
      padding="$3"
      marginHorizontal="$3"
      marginVertical="$1"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$borderDefault"
    >
      {/* Game Info */}
      <Stack
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="$2"
      >
        <Text fontSize="$3" color="$textSecondary">
          {bet.game?.sport?.toUpperCase()}
        </Text>
        <Text fontSize="$2" color="$textSecondary">
          {format(new Date(bet.created_at || ''), 'MMM d')}
        </Text>
      </Stack>

      {/* Teams */}
      <Text fontSize="$4" fontWeight="600" marginBottom="$2">
        {bet.game?.away_team} @ {bet.game?.home_team}
      </Text>

      {/* Bet Details */}
      <Stack
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="$2"
      >
        <View>
          <Text fontSize="$3" color="$textSecondary">
            {bet.bet_type.toUpperCase()}
          </Text>
          <Text fontSize="$4" fontWeight="500">
            {formatBetDetails()}
          </Text>
        </View>

        <View alignItems="flex-end">
          <Text fontSize="$3" color="$textSecondary">
            ${(bet.stake / 100).toFixed(2)}
          </Text>
          <Text fontSize="$3" color="$textSecondary">
            {formatOdds(bet.odds)}
          </Text>
        </View>
      </Stack>

      {/* Result Section */}
      {isSettled && (
        <Stack
          marginTop="$2"
          paddingTop="$2"
          borderTopWidth={1}
          borderTopColor="$borderDefault"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack flexDirection="row" alignItems="center" gap="$2">
            <Text fontSize="$5">{getStatusEmoji()}</Text>
            <View>
              <Text fontSize="$4" fontWeight="600" color={getStatusColor()}>
                {bet.status.toUpperCase()}
              </Text>
              {bet.actual_win && bet.status === 'won' && (
                <Text fontSize="$3" color={Colors.success}>
                  +${(bet.actual_win / 100).toFixed(2)}
                </Text>
              )}
            </View>
          </Stack>
        </Stack>
      )}

      {/* Live Score for Active Bets */}
      {!isSettled && bet.game?.status === 'live' && (
        <Stack
          marginTop="$2"
          paddingTop="$2"
          borderTopWidth={1}
          borderTopColor="$borderDefault"
          justifyContent="center"
          alignItems="center"
          flexDirection="row"
          gap="$3"
        >
          <View
            backgroundColor="$red9"
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius="$2"
          >
            <Text fontSize="$2" color="white" fontWeight="600">
              LIVE
            </Text>
          </View>
          <Text fontSize="$3">
            {bet.game.away_team} {bet.game.away_score} - {bet.game.home_team} {bet.game.home_score}
          </Text>
        </Stack>
      )}
    </View>
  );
}

// Simple Stats component
function BetStats({ userId: _userId }: { userId: string }) {
  const { data: bankroll } = useBankroll();

  if (!bankroll) return null;

  const weeklyPL = bankroll.balance - 100000; // Assuming $1000 weekly deposit
  const weeklyROI = weeklyPL !== 0 ? (weeklyPL / 100000) * 100 : 0;

  return (
    <View padding="$4" borderBottomWidth={1} borderBottomColor="$borderDefault">
      <Text fontSize="$3" color="$textSecondary" marginBottom="$2">
        This Week
      </Text>
      <Stack flexDirection="row" justifyContent="space-between">
        <View alignItems="center">
          <Text fontSize="$2" color="$textSecondary" marginBottom="$1">
            Balance
          </Text>
          <Text fontSize="$5" fontWeight="600">
            ${(bankroll.balance / 100).toFixed(2)}
          </Text>
        </View>
        <View alignItems="center">
          <Text fontSize="$2" color="$textSecondary" marginBottom="$1">
            P/L
          </Text>
          <Text fontSize="$5" fontWeight="600" color={weeklyPL > 0 ? Colors.success : Colors.error}>
            {weeklyPL > 0 ? '+' : ''}${(weeklyPL / 100).toFixed(2)}
          </Text>
        </View>
        <View alignItems="center">
          <Text fontSize="$2" color="$textSecondary" marginBottom="$1">
            ROI
          </Text>
          <Text
            fontSize="$5"
            fontWeight="600"
            color={weeklyROI > 0 ? Colors.success : Colors.error}
          >
            {weeklyROI > 0 ? '+' : ''}
            {weeklyROI.toFixed(1)}%
          </Text>
        </View>
      </Stack>
    </View>
  );
}

export const BetsList: React.FC<BetsListProps> = ({
  userId,
  canView = true,
  scrollable = true,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Use separate hooks for active and history
  const activeBetsData = useActiveBets();
  const historyData = useBetHistory({ status: 'won' });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeTab === 'active') {
      await activeBetsData.refetch();
    } else {
      await historyData.refetch();
    }
    setRefreshing(false);
  }, [activeTab, activeBetsData, historyData]);

  if (!canView) {
    return (
      <View flex={1} padding="$4" alignItems="center" justifyContent="center" minHeight={200}>
        <Text fontSize={16} color="$textSecondary" textAlign="center">
          This account&apos;s bets are private
        </Text>
      </View>
    );
  }

  const isLoading = activeTab === 'active' ? activeBetsData.isLoading : historyData.isLoading;
  const error = activeTab === 'active' ? activeBetsData.error : historyData.error;
  const bets = activeTab === 'active' ? activeBetsData.bets : historyData.bets;

  if (isLoading && !refreshing) {
    return (
      <View flex={1} alignItems="center" justifyContent="center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View flex={1} padding="$4" alignItems="center" justifyContent="center">
        <Text fontSize={24}>⚠️</Text>
        <Text fontSize={16} color="$textSecondary" textAlign="center" marginTop="$2">
          Unable to load bets
        </Text>
        <Text fontSize={14} color="$textSecondary" textAlign="center" marginTop="$1">
          Pull to refresh and try again
        </Text>
      </View>
    );
  }

  const emptyMessage = activeTab === 'active' ? 'No active bets' : 'No betting history yet';

  return (
    <Stack flex={1}>
      {/* Stats Summary */}
      <BetStats userId={userId} />

      {/* Tabs */}
      <Stack
        paddingHorizontal="$4"
        paddingVertical="$2"
        gap="$2"
        borderBottomWidth={1}
        borderBottomColor="$borderDefault"
        flexDirection="row"
      >
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text
            textAlign="center"
            fontSize="$4"
            fontWeight="600"
            color={activeTab === 'active' ? Colors.white : Colors.text.primary}
          >
            Active ({activeBetsData.bets.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            textAlign="center"
            fontSize="$4"
            fontWeight="600"
            color={activeTab === 'history' ? Colors.white : Colors.text.primary}
          >
            History
          </Text>
        </TouchableOpacity>
      </Stack>

      {/* Bet List */}
      {!scrollable ? (
        <View style={styles.nonScrollableContainer}>
          {bets.length === 0 ? (
            <View padding="$8" alignItems="center">
              <Text fontSize="$6" marginBottom="$2">
                🎲
              </Text>
              <Text fontSize="$5" color="$textSecondary" textAlign="center">
                {emptyMessage}
              </Text>
              {activeTab === 'history' && (
                <Text fontSize="$3" color="$textSecondary" textAlign="center" marginTop="$1">
                  Place your first bet to see it here
                </Text>
              )}
            </View>
          ) : (
            bets.map((bet) => <BetCard key={bet.id} bet={bet} />)
          )}
        </View>
      ) : (
        <FlashList
          data={bets}
          renderItem={({ item }) => <BetCard bet={item} />}
          keyExtractor={(item) => item.id}
          estimatedItemSize={140}
          onEndReached={activeTab === 'history' ? historyData.loadMore : undefined}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View padding="$8" alignItems="center">
              <Text fontSize="$6" marginBottom="$2">
                🎲
              </Text>
              <Text fontSize="$5" color="$textSecondary" textAlign="center">
                {emptyMessage}
              </Text>
              {activeTab === 'history' && (
                <Text fontSize="$3" color="$textSecondary" textAlign="center" marginTop="$1">
                  Place your first bet to see it here
                </Text>
              )}
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </Stack>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  nonScrollableContainer: {
    padding: 16,
  },
});
