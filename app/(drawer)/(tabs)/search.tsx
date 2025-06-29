import React from 'react';
import { View, ScrollView, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/theme';
import { SearchBar } from '@/components/search/SearchBar';
import { UserSearchCard } from '@/components/search/UserSearchCard';
import { DiscoverySection } from '@/components/search/DiscoverySection';
import { RecentSearches } from '@/components/search/RecentSearches';
import { SearchSkeleton } from '@/components/skeletons/SearchSkeleton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useSearch } from '@/hooks/useSearch';
import { useDiscovery } from '@/hooks/useDiscovery';
import { useFriendDiscovery } from '@/hooks/useFriendDiscovery';

function SearchScreenContent() {
  const {
    query,
    setQuery,
    results,
    searchState,
    recentSearches,
    followingStatus: searchFollowingStatus,
    onRecentSearchSelect,
    clearRecentSearches,
    updateFollowingStatus: updateSearchFollowing,
  } = useSearch();

  const {
    hotBettors,
    trendingPicks,
    fadeMaterial,
    risingStars,
    isLoading,
    errors,
    followingStatus: discoveryFollowingStatus,
    updateFollowingStatus: updateDiscoveryFollowing,
    refreshHot,
    refreshTrending,
    refreshFade,
    refreshRising,
  } = useDiscovery();

  const {
    suggestions,
    isLoading: isFriendLoading,
    error: friendError,
    followingStatus: friendFollowingStatus,
    updateFollowingStatus: updateFriendFollowing,
    refresh: refreshFriends,
  } = useFriendDiscovery();

  // Combine following status from all hooks
  const allFollowingStatus = {
    ...discoveryFollowingStatus,
    ...searchFollowingStatus,
    ...friendFollowingStatus,
  };

  const handleFollowChange = (userId: string, isFollowing: boolean) => {
    updateSearchFollowing(userId, isFollowing);
    updateDiscoveryFollowing(userId, isFollowing);
    updateFriendFollowing(userId, isFollowing);
  };

  // Debug logging
  React.useEffect(() => {
    console.log('[SearchScreen] Hot bettors:', hotBettors.length);
    console.log('[SearchScreen] Loading state:', isLoading.hot);
    console.log('[SearchScreen] Error state:', errors.hot);
    if (hotBettors.length > 0) {
      console.log('[SearchScreen] First hot bettor:', hotBettors[0]);
    }
  }, [hotBettors, isLoading.hot, errors.hot]);

  const renderSearchResults = () => {
    if (searchState === 'searching') {
      return <SearchSkeleton />;
    }

    if (searchState === 'empty') {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No @{query} found</Text>
          <Text style={styles.emptySubtitle}>Try searching for their display name</Text>
        </View>
      );
    }

    if (searchState === 'results') {
      return (
        <View>
          {results.map((user, index) => (
            <Animated.View key={user.id} entering={FadeInDown.delay(index * 50).springify()}>
              <UserSearchCard
                user={user}
                isFollowing={allFollowingStatus[user.id] || false}
                onFollowChange={handleFollowChange}
              />
            </Animated.View>
          ))}
        </View>
      );
    }

    return null;
  };

  const renderDiscoverySections = () => (
    <>
      <RecentSearches
        searches={recentSearches}
        onSearchSelect={onRecentSearchSelect}
        onClear={clearRecentSearches}
      />

      <DiscoverySection
        title="Find Your Tribe"
        subtitle="Discover users similar to you"
        emoji="🤝"
        users={suggestions}
        isLoading={isFriendLoading}
        error={friendError}
        emptyMessage="No suggestions yet - bet more to find your tribe!"
        followingStatus={allFollowingStatus}
        onFollowChange={handleFollowChange}
        onRefresh={refreshFriends}
        showAIBadge={true}
      />

      <DiscoverySection
        title="Hot Bettors"
        subtitle="This week's winners"
        emoji="🔥"
        users={hotBettors}
        isLoading={isLoading.hot}
        error={errors.hot}
        emptyMessage="No hot bettors this week"
        followingStatus={allFollowingStatus}
        onFollowChange={handleFollowChange}
        onRefresh={refreshHot}
      />

      <DiscoverySection
        title="Trending Picks"
        subtitle="Most tailed in 24h"
        emoji="📈"
        users={trendingPicks}
        isLoading={isLoading.trending}
        error={errors.trending}
        emptyMessage="No trending picks yet"
        followingStatus={allFollowingStatus}
        onFollowChange={handleFollowChange}
        onRefresh={refreshTrending}
      />

      <DiscoverySection
        title="Fade Gods"
        subtitle="Entertainment value"
        emoji="🎪"
        users={fadeMaterial}
        isLoading={isLoading.fade}
        error={errors.fade}
        emptyMessage="Everyone's winning!"
        followingStatus={allFollowingStatus}
        onFollowChange={handleFollowChange}
        onRefresh={refreshFade}
      />

      <DiscoverySection
        title="Rising Stars"
        subtitle="New users crushing it"
        emoji="⭐"
        users={risingStars}
        isLoading={isLoading.rising}
        error={errors.rising}
        emptyMessage="No rising stars yet"
        followingStatus={allFollowingStatus}
        onFollowChange={handleFollowChange}
        onRefresh={refreshRising}
      />
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.container}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search users..."
          autoFocus={false}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={true}
          scrollEventThrottle={16}
        >
          {query.length > 0 ? renderSearchResults() : renderDiscoverySections()}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

export default function SearchScreen() {
  return (
    <ErrorBoundary level="tab">
      <SearchScreenContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
