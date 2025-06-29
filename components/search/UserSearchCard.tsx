import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/theme';
import { UserWithStats } from '@/services/search/searchService';
import { FollowButton } from '@/components/common/FollowButton';
import { Avatar } from '@/components/common/Avatar';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface UserSearchCardProps {
  user: UserWithStats;
  isFollowing?: boolean;
  onFollowChange?: (userId: string, isFollowing: boolean) => void;
}

export function UserSearchCard({ user, isFollowing = false, onFollowChange }: UserSearchCardProps) {
  const router = useRouter();

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/profile/${user.username}`);
  };

  const formatStats = (): string => {
    // Check for custom stats (for trending users)
    if ('customStats' in user && user.customStats) {
      return String(user.customStats);
    }

    if (!user.total_bets || user.total_bets === 0) {
      return 'No bets yet';
    }

    // Handle win_rate whether it's a decimal (0-1) or percentage (0-100)
    let winRate = user.win_rate || 0;
    if (winRate <= 1) {
      // It's a decimal, convert to percentage
      winRate = Math.round(winRate * 100);
    } else {
      // It's already a percentage, just round it
      winRate = Math.round(winRate);
    }
    
    return `${user.win_count || 0}-${user.loss_count || 0} • ${winRate}%`;
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.container, { opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={styles.content}>
        <Avatar
          src={user.avatar_url}
          username={user.username}
          size={40}
          fallback={user.username?.[0]?.toUpperCase() || '?'}
        />
        <View style={styles.info}>
          <View style={styles.nameContainer}>
            <Text style={styles.username} numberOfLines={1}>
              @{user.username}
            </Text>
            {user.display_name && (
              <Text style={styles.displayName} numberOfLines={1}>
                {user.display_name}
              </Text>
            )}
          </View>
          <Text style={styles.stats} numberOfLines={1}>
            {formatStats()}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <FollowButton
            userId={user.id}
            isFollowing={isFollowing}
            size="small"
            onFollowChange={(newFollowState) => onFollowChange?.(user.id, newFollowState)}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  nameContainer: {
    flexDirection: 'column',
    gap: 2,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  displayName: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  stats: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  buttonContainer: {
    flexShrink: 0,
  },
});
