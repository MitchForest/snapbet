import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Colors } from '@/theme';
import { UserWithStats } from '@/services/search/searchService';
import { FollowButton } from '@/components/common/FollowButton';
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

  const formatStats = () => {
    if (!user.total_bets || user.total_bets === 0) {
      return 'No bets yet';
    }

    const winRate = Math.round((user.win_rate || 0) * 100);
    return `${user.win_count}-${user.loss_count} • ${winRate}%`;
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.container, { opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={styles.content}>
        <Image
          source={{
            uri:
              user.avatar_url ||
              `https://ui-avatars.com/api/?name=${user.username}&background=random`,
          }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>@{user.username}</Text>
            {user.display_name && <Text style={styles.displayName}>{user.display_name}</Text>}
          </View>
          <Text style={styles.stats}>{formatStats()}</Text>
        </View>
        <FollowButton
          userId={user.id}
          isFollowing={isFollowing}
          size="small"
          onFollowChange={(newFollowState) => onFollowChange?.(user.id, newFollowState)}
        />
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[200],
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  displayName: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  stats: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});
