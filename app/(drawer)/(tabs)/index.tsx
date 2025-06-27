import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { FlashList } from '@shopify/flash-list';

import { useFeed } from '@/hooks/useFeed';
import { MemoizedPostCard } from '@/utils/performance/memoHelpers';
import { PostWithType } from '@/types/content';
import { StoriesBar } from '@/components/ui/StoriesBar';
import { EmptyFeed } from '@/components/feed/EmptyFeed';
import { FeedSkeleton } from '@/components/feed/FeedSkeleton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Colors } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { feedService } from '@/services/feed/feedService';

const ESTIMATED_POST_HEIGHT = 600; // Updated for square media + header + engagement

function HomeScreenContent() {
  const { user } = useAuthStore();
  const { posts, isLoading, isLoadingMore, refreshing, refetch, loadMore, hasMore } = useFeed();

  console.log(`[${new Date().toISOString()}] HomeScreenContent - RENDER`, {
    userId: user?.id,
    isLoading,
    postsLength: posts.length,
    refreshing,
  });

  // Clear cache on first mount to ensure fresh data after fixes
  React.useEffect(() => {
    console.log('Clearing feed cache to ensure fresh data...');
    feedService.clearCache();
  }, []);

  const renderPost = useCallback(
    ({ item }: { item: PostWithType }) => <MemoizedPostCard post={item} />,
    []
  );

  const renderHeader = useCallback(() => <StoriesBar />, []);

  const renderEmpty = useCallback(() => {
    if (isLoading) return <FeedSkeleton />;
    if (!user) return null;
    return <EmptyFeed />;
  }, [isLoading, user]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }, [isLoadingMore]);

  const keyExtractor = useCallback((item: PostWithType) => item.id, []);

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  // Show skeleton while initial loading
  if (isLoading && posts.length === 0) {
    console.log(`[${new Date().toISOString()}] HomeScreenContent - Showing skeleton`);
    return (
      <SafeAreaView style={styles.container}>
        <StoriesBar />
        <FeedSkeleton />
      </SafeAreaView>
    );
  }

  console.log(`[${new Date().toISOString()}] HomeScreenContent - Rendering FlashList`);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.listContainer}>
        <FlashList
          data={posts}
          renderItem={renderPost}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onRefresh={refetch}
          refreshing={refreshing}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={ESTIMATED_POST_HEIGHT}
          drawDistance={1000}
          removeClippedSubviews={true}
          contentContainerStyle={styles.listContent}
          // Add nestedScrollEnabled for better scroll handling
          nestedScrollEnabled={true}
          // Remove estimatedListSize as it can cause issues
        />
      </View>
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  console.log(`[${new Date().toISOString()}] HomeScreen - RENDER`);
  return (
    <ErrorBoundary level="tab">
      <HomeScreenContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20, // Reduced padding - tab bar is handled by safe area
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
