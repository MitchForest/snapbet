import React, { useEffect, useState } from 'react';
import { View, Text } from '@tamagui/core';
import { FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { PostCard } from '@/components/content/PostCard';
import { PostWithType } from '@/types/content';
import { getAllPosts } from '@/services/content/postService';
import { Colors } from '@/theme';

interface PostsListProps {
  userId?: string;
}

export const PostsList: React.FC<PostsListProps> = ({ userId }) => {
  const [posts, setPosts] = useState<PostWithType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, [userId]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Add filtering by userId when needed
      const fetchedPosts = await getAllPosts(20);
      setPosts(fetchedPosts);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

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
  },
});
