import React from 'react';
import { View, Text } from '@tamagui/core';
import { FlashList } from '@shopify/flash-list';
import { RefreshControl } from 'react-native';
import { Colors } from '@/theme';
import { Game } from '@/types/database';
import { GameCard } from './GameCard';
import { useGames } from '@/hooks/useGames';
import { Sport } from '@/services/games/gameService';

interface GamesListProps {
  sport?: Sport;
  onQuickBet: (game: Game) => void;
}

export function GamesList({ sport = 'all', onQuickBet }: GamesListProps) {
  const { sections, isLoading, refreshing, refetch, error } = useGames(sport);

  // Flatten sections for FlashList
  const flatData = sections.reduce((acc: Array<Game | string>, section) => {
    acc.push(section.title); // Section header
    acc.push(...section.data); // Games
    return acc;
  }, []);

  const renderItem = ({ item }: { item: Game | string }) => {
    if (typeof item === 'string') {
      // Section header
      return (
        <View paddingHorizontal={16} paddingVertical={12} backgroundColor={Colors.background}>
          <Text color={Colors.text.primary} fontSize={16} fontWeight="600">
            {item}
          </Text>
        </View>
      );
    }

    // Game card
    return (
      <View paddingHorizontal={16}>
        <GameCard game={item} onQuickBet={onQuickBet} />
      </View>
    );
  };

  const getItemType = (item: Game | string) => {
    return typeof item === 'string' ? 'section' : 'game';
  };

  const keyExtractor = (item: Game | string, index: number) => {
    if (typeof item === 'string') {
      return `section-${item}-${index}`;
    }
    return item.id;
  };

  // Loading state
  if (isLoading && flatData.length === 0) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <Text color={Colors.text.secondary}>Loading games...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" padding={16}>
        <Text color={Colors.error} fontSize={16} marginBottom={8}>
          Error loading games
        </Text>
        <Text color={Colors.text.secondary} textAlign="center">
          {error.message}
        </Text>
      </View>
    );
  }

  // Empty state
  if (flatData.length === 0) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" padding={16}>
        <Text color={Colors.text.primary} fontSize={18} marginBottom={8}>
          No games available
        </Text>
        <Text color={Colors.text.secondary} textAlign="center">
          Check back later for upcoming games
        </Text>
      </View>
    );
  }

  return (
    <FlashList
      data={flatData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      estimatedItemSize={400}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refetch}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
