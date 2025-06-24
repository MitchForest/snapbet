import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable } from 'react-native';
import { Avatar } from '@/components/common/Avatar';
import { BadgeDisplay } from '@/components/common/BadgeDisplay';

interface ProfileUser {
  id: string;
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  favorite_team?: string | null;
}

interface ProfileStats {
  balance: number;
  win_count: number;
  loss_count: number;
  total_wagered: number;
  total_won: number;
}

interface ProfileHeaderProps {
  user: ProfileUser;
  stats: ProfileStats | null;
  badges: string[];
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onEditProfile?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  stats,
  badges,
  isOwnProfile,
  isFollowing,
  onFollow,
  onEditProfile,
}) => {
  // Calculate stats
  const winRate = stats
    ? ((stats.win_count / (stats.win_count + stats.loss_count)) * 100).toFixed(1)
    : '0.0';
  const profit = stats ? ((stats.total_won - stats.total_wagered) / 100).toFixed(2) : '0.00';
  const roi =
    stats && stats.total_wagered > 0
      ? (((stats.total_won - stats.total_wagered) / stats.total_wagered) * 100).toFixed(1)
      : '0.0';

  // Get follower/following counts
  const [followerCount, setFollowerCount] = React.useState(0);
  const [followingCount, setFollowingCount] = React.useState(0);

  React.useEffect(() => {
    const fetchCounts = async () => {
      const { supabase } = await import('@/services/supabase/client');

      const [{ count: followers }, { count: following }] = await Promise.all([
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', user.id),
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', user.id),
      ]);

      setFollowerCount(followers || 0);
      setFollowingCount(following || 0);
    };

    if (user?.id) {
      fetchCounts();
    }
  }, [user?.id]);

  return (
    <View paddingHorizontal="$4" paddingVertical="$4" backgroundColor="$surface">
      {/* Profile Info Row */}
      <View flexDirection="row" alignItems="center" marginBottom="$3">
        <Avatar size={80} src={user.avatar_url || undefined} />
        <View flex={1} marginLeft="$3">
          <Text fontSize={24} fontWeight="600" color="$textPrimary">
            @{user.username}
          </Text>
          {user.display_name && (
            <Text fontSize={16} color="$textSecondary" marginTop="$1">
              {user.display_name}
            </Text>
          )}
        </View>
      </View>

      {/* Bio */}
      {user.bio && (
        <Text fontSize={14} color="$textPrimary" marginBottom="$3" lineHeight={20}>
          {user.bio}
        </Text>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <View marginBottom="$3">
          <BadgeDisplay badges={badges} size="large" showAll />
        </View>
      )}

      {/* Stats Row */}
      <View flexDirection="row" justifyContent="space-around" marginBottom="$3">
        <View alignItems="center">
          <Text fontSize={20} fontWeight="600" color="$textPrimary">
            {stats ? `${stats.win_count}-${stats.loss_count}` : '0-0'}
          </Text>
          <Text fontSize={12} color="$textSecondary">
            Record
          </Text>
        </View>
        <View alignItems="center">
          <Text fontSize={20} fontWeight="600" color="$textPrimary">
            {winRate}%
          </Text>
          <Text fontSize={12} color="$textSecondary">
            Win Rate
          </Text>
        </View>
        <View alignItems="center">
          <Text fontSize={20} fontWeight="600" color={profit.startsWith('-') ? '$loss' : '$win'}>
            ${profit}
          </Text>
          <Text fontSize={12} color="$textSecondary">
            Profit
          </Text>
        </View>
        <View alignItems="center">
          <Text fontSize={20} fontWeight="600" color={roi.startsWith('-') ? '$loss' : '$win'}>
            {roi}%
          </Text>
          <Text fontSize={12} color="$textSecondary">
            ROI
          </Text>
        </View>
      </View>

      {/* Following/Followers Row */}
      <View flexDirection="row" justifyContent="center" gap="$4" marginBottom="$3">
        <Pressable>
          <Text fontSize={14} color="$textPrimary">
            <Text fontWeight="600">{followingCount}</Text> Following
          </Text>
        </Pressable>
        <Pressable>
          <Text fontSize={14} color="$textPrimary">
            <Text fontWeight="600">{followerCount}</Text> Followers
          </Text>
        </Pressable>
      </View>

      {/* Action Button */}
      {isOwnProfile ? (
        <Pressable onPress={onEditProfile}>
          <View
            backgroundColor="$surface"
            borderWidth={1}
            borderColor="$divider"
            borderRadius="$2"
            paddingVertical="$2"
            alignItems="center"
          >
            <Text fontSize={16} fontWeight="600" color="$textPrimary">
              Edit Profile
            </Text>
          </View>
        </Pressable>
      ) : (
        <Pressable onPress={onFollow}>
          <View
            backgroundColor={isFollowing ? '$surface' : '$primary'}
            borderWidth={isFollowing ? 1 : 0}
            borderColor="$divider"
            borderRadius="$2"
            paddingVertical="$2"
            alignItems="center"
          >
            <Text
              fontSize={16}
              fontWeight="600"
              color={isFollowing ? '$textPrimary' : '$textInverse'}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  );
};
