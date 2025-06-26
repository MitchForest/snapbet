import React, { useEffect, useState } from 'react';
import { View, Text } from '@tamagui/core';
import { FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { PostCard } from '@/components/content/PostCard';
import { PostWithType } from '@/types/content';
import { supabase } from '@/services/supabase/client';
import { Colors } from '@/theme';

interface PostsListProps {
  userId?: string;
  canView?: boolean;
}

export const PostsList: React.FC<PostsListProps> = ({ userId, canView = true }) => {
  const [posts, setPosts] = useState<PostWithType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (canView) {
      loadPosts();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, canView]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) {
        setPosts([]);
        return;
      }

      // Fetch posts for specific user
      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          *,
          user:users(id, username, avatar_url)
        `
        )
        .eq('user_id', userId)
        .is('deleted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts((data || []) as PostWithType[]);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  if (!canView) {
    return (
      <View flex={1} padding="$4" alignItems="center" justifyContent="center" minHeight={200}>
        <Text fontSize={16} color="$textSecondary" textAlign="center">
          This account&apos;s posts are private
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View flex={1} padding="$4" alignItems="center" justifyContent="center" minHeight={200}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View flex={1} padding="$4" alignItems="center" justifyContent="center" minHeight={200}>
        <Text fontSize={16} color="$textSecondary" textAlign="center">
          {error}
        </Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View flex={1} padding="$4" alignItems="center" justifyContent="center" minHeight={200}>
        <Text fontSize={18} color="$textSecondary" textAlign="center">
          No posts yet
        </Text>
        <Text fontSize={14} color="$textSecondary" textAlign="center" marginTop="$2">
          Create your first post to get started!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PostCard post={item} onPress={() => console.log('Post pressed:', item.id)} />
      )}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 8,
    paddingBottom: 100, // Extra padding to account for tab bar
  },
});
