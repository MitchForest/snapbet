import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Avatar } from '@/components/common/Avatar';
import { BadgeDisplay } from '@/components/common/BadgeDisplay';
import { getUserBadges } from '@/services/badges/badgeService';
import { getDefaultPrimaryStat } from '@/utils/onboarding/suggestions';

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
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <Avatar
          src={user.avatar_url || undefined}
          size={48}
          fallback={user.username[0].toUpperCase()}
        />
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>@{user.username}</Text>
            <BadgeDisplay badges={badges} size="small" maxBadges={2} />
          </View>
          {user.bio && (
            <Text style={styles.bio} numberOfLines={1}>
              {user.bio}
            </Text>
          )}
          <View style={styles.statRow}>
            <Text style={styles.statValue}>{primaryStat.value}</Text>
            <Text style={styles.statLabel}>{primaryStat.label}</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={[styles.followButton, isFollowing && styles.followingButton]}
        onPress={handleToggle}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={isFollowing ? '#059669' : '#FFFFFF'} />
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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  bio: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#059669',
    minWidth: 90,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#059669',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  followingButtonText: {
    color: '#059669',
  },
});
