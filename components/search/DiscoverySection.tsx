import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { Colors } from '@/theme';
import { UserWithStats, TrendingPickUser } from '@/services/search/searchService';
import { UserSearchCard } from './UserSearchCard';
import * as Haptics from 'expo-haptics';

interface DiscoverySectionProps {
  title: string;
  subtitle?: string;
  emoji: string;
  users: UserWithStats[] | TrendingPickUser[];
  isLoading: boolean;
  error?: string | null;
  emptyMessage?: string;
  followingStatus?: Record<string, boolean>;
  onFollowChange?: (userId: string, isFollowing: boolean) => void;
  onRefresh?: () => void;
  showAIBadge?: boolean;
}

export function DiscoverySection({
  title,
  subtitle,
  emoji,
  users,
  isLoading,
  error,
  emptyMessage = 'No users found',
  followingStatus = {},
  onFollowChange,
  onRefresh,
  showAIBadge = false,
}: DiscoverySectionProps) {
  const handleRefresh = async () => {
    if (onRefresh) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRefresh();
    }
  };

  // Convert TrendingPickUser to UserWithStats format for display
  const normalizeUsers = (): UserWithStats[] => {
    return users.map((user) => {
      if ('user_id' in user) {
        // This is a TrendingPickUser
        const trendingUser = user as TrendingPickUser;
        return {
          id: trendingUser.user_id,
          username: trendingUser.username,
          display_name: trendingUser.display_name,
          avatar_url: trendingUser.avatar_url,
          bio: null,
          favorite_team: null,
          created_at: '',
          win_count: 0,
          loss_count: 0,
          win_rate: 0,
          total_bets: 0,
          // Add custom display for trending users
          customStats: `${trendingUser.total_tails} tails • ${trendingUser.pick_count} picks`,
        } as UserWithStats & { customStats?: string };
      }
      return user as UserWithStats;
    });
  };

  const normalizedUsers = normalizeUsers();

  return (
    <View style={styles.container}>
      <Pressable onPress={handleRefresh} disabled={!onRefresh}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.emoji}>{emoji}</Text>
            <View style={styles.titleTextContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{title}</Text>
                {showAIBadge && (
                  <View style={styles.aiBadge}>
                    <Text style={styles.aiBadgeText}>✨ Powered by AI</Text>
                  </View>
                )}
              </View>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>
          {onRefresh && <Text style={styles.refreshHint}>Tap to refresh</Text>}
        </View>
      </Pressable>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          {onRefresh && (
            <Pressable onPress={handleRefresh} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          )}
        </View>
      ) : normalizedUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {normalizedUsers.map((user) => (
            <View key={user.id} style={styles.cardWrapper}>
              <UserSearchCard
                user={user}
                isFollowing={followingStatus[user.id] || false}
                onFollowChange={onFollowChange}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleTextContainer: {
    flex: 1,
  },
  titleRow: {
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
  subtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  aiBadge: {
    backgroundColor: Colors.ai,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
  },
  refreshHint: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingRight: 32,
  },
  cardWrapper: {
    width: 320,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  retryText: {
    fontSize: 14,
    color: Colors.text.inverse,
    fontWeight: '500',
  },
});
