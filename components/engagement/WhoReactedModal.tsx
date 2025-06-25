import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Avatar } from '@/components/common/Avatar';
import { Colors } from '@/theme';
import { reactionService } from '@/services/engagement/reactionService';
import { toastService } from '@/services/toastService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface WhoReactedModalProps {
  postId: string;
  emoji: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ReactingUser {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

const USERS_PER_PAGE = 50;

export function WhoReactedModal({ postId, emoji, isOpen, onClose }: WhoReactedModalProps) {
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<ReactingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  // Load users who reacted
  const loadUsers = async (pageNum: number = 0) => {
    try {
      if (pageNum === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const result = await reactionService.getReactionUsers(
        postId,
        emoji,
        USERS_PER_PAGE,
        pageNum * USERS_PER_PAGE
      );

      if (pageNum === 0) {
        setUsers(result.users);
      } else {
        setUsers((prev) => [...prev, ...result.users]);
      }

      setTotal(result.total);
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load reaction users:', error);
      toastService.showError('Failed to load users');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      setPage(0);
      loadUsers(0);
    }
  }, [isOpen, postId, emoji]);

  // Handle load more
  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore) return;
    loadUsers(page + 1);
  };

  // Render user item
  const renderUser = ({ item }: { item: ReactingUser }) => (
    <View style={styles.userItem}>
      <Avatar
        size={40}
        src={item.avatar_url || undefined}
        fallback={item.username ? item.username[0]?.toUpperCase() : '#'}
      />
      <Text style={styles.username}>@{item.username || 'deleted_user'}</Text>
    </View>
  );

  // Render footer
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
          <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={styles.emoji}>{emoji}</Text>
                <Text style={styles.title}>
                  {total} {total === 1 ? 'reaction' : 'reactions'}
                </Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            {/* Users List */}
            {isLoading ? (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : users.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No reactions yet</Text>
              </View>
            ) : (
              <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={renderUser}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.listContent}
              />
            )}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: Colors.text.secondary,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  listContent: {
    paddingVertical: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  username: {
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
