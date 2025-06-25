import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFeed } from '@/hooks/useFeed';
import { PostCard } from '@/components/content/PostCard';
import { PostWithType } from '@/types/content';
import { StoriesBar } from '@/components/ui/StoriesBar';
import { EmptyFeed } from '@/components/feed/EmptyFeed';
import { FeedSkeleton } from '@/components/feed/FeedSkeleton';
import { Colors } from '@/theme';
import { useAuth } from '@/hooks/useAuth';

const ESTIMATED_POST_HEIGHT = 500; // Approximate height for PostCard

export default function HomeScreen() {
  const { user } = useAuth();
  const { posts, isLoading, isLoadingMore, refreshing, refetch, loadMore, hasMore } = useFeed();

  const renderPost = useCallback(
    ({ item }: { item: PostWithType }) => <PostCard post={item} />,
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
