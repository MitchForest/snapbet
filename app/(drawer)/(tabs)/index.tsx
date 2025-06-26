import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
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

const ESTIMATED_POST_HEIGHT = 500; // Approximate height for PostCard

function HomeScreenContent() {
  const { user } = useAuthStore();
  const { posts, isLoading, isLoadingMore, refreshing, refetch, loadMore, hasMore } = useFeed();

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
    return (
      <View style={styles.container}>
        <StoriesBar />
        <FeedSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
      />
    </View>
  );
}

export default function HomeScreen() {
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
