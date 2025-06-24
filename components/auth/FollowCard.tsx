import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Avatar } from '@/components/common/Avatar';
import { BadgeDisplay } from '@/components/common/BadgeDisplay';
import { getUserBadges } from '@/services/badges/badgeService';
import { getDefaultPrimaryStat } from '@/utils/onboarding/suggestions';
import { Colors } from '@/theme';

interface FollowCardProps {
  user: {
    id: string;
    username: string;
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    win_count?: number;
    loss_count?: number;
    total_wagered?: number;
    total_won?: number;
    balance?: number;
    stats_metadata?: Record<string, unknown>;
  };
  isFollowing: boolean;
  onToggle: (userId: string) => void;
}

export const FollowCard: React.FC<FollowCardProps> = ({ user, isFollowing, onToggle }) => {
  const [loading, setLoading] = useState(false);
  const [badges, setBadges] = useState<string[]>([]);

  // Calculate badges on mount
  React.useEffect(() => {
    getUserBadges(user.id).then(setBadges);
  }, [user.id]);

  const handleToggle = async () => {
    setLoading(true);
    await onToggle(user.id);
    setLoading(false);
  };

  const primaryStat = getDefaultPrimaryStat(user);

  return (
    <View style={styles.card}>
      <View style={styles.leftContent}>
        <Avatar
          src={user.avatar_url || undefined}
          size={48}
          fallback={user.username[0].toUpperCase()}
        />
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{user.display_name || user.username}</Text>
            <BadgeDisplay badges={badges} size="small" maxBadges={2} />
          </View>
          {user.bio && (
            <Text style={styles.bio} numberOfLines={1}>
              {user.bio}
            </Text>
          )}
          <View style={styles.stats}>
            <Text style={styles.statText}>{primaryStat.value}</Text>
            <Text style={styles.statText}>{primaryStat.label}</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={[styles.followButton, isFollowing && styles.followingButton]}
        onPress={handleToggle}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={isFollowing ? Colors.primaryDark : Colors.white} />
        ) : (
          <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  stats: {
    fontSize: 14,
    color: Colors.text.secondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: Colors.primaryDark,
    marginRight: 12,
  },
  bio: {
    fontSize: 14,
    color: Colors.text.tertiary,
  },
  followButton: {
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  followButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: Colors.primaryDark,
  },
});
