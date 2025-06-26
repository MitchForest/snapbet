import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable } from 'react-native';
import { Avatar } from '@/components/common/Avatar';
import { WeeklyBadgeGrid } from '@/components/badges/WeeklyBadgeGrid';
import { followService } from '@/services/social/followService';
import { FollowRequestButton } from './FollowRequestButton';
import { useReferralRewards } from '@/hooks/useReferralRewards';
import { Colors } from '@/theme';

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

interface PrivacySettings {
  is_private: boolean;
  show_bankroll: boolean;
  show_stats: boolean;
  show_picks: boolean;
}

interface ProfileHeaderProps {
  user: ProfileUser;
  stats: ProfileStats | null;
  badges: string[];
  isOwnProfile: boolean;
  isFollowing?: boolean;
  isPrivate?: boolean;
  privacySettings?: PrivacySettings | null;
  onFollow?: () => void;
  onEditProfile?: () => void;
  onBlock?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  stats,
  badges,
  isOwnProfile,
  isFollowing: _isFollowing,
  isPrivate = false,
  privacySettings,
  onFollow,
  onEditProfile,
  onBlock,
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

  // Get follower/following counts with real-time updates
  const [followerCount, setFollowerCount] = React.useState(0);
  const [followingCount, setFollowingCount] = React.useState(0);

  // Get referral rewards for own profile
  const { referralCount, formattedBonus } = useReferralRewards();

  React.useEffect(() => {
    const fetchCounts = async () => {
      const counts = await followService.getFollowCounts(user.id);
      setFollowerCount(counts.followers);
      setFollowingCount(counts.following);
    };

    if (user?.id) {
      fetchCounts();

      // Subscribe to real-time count updates
      const unsubscribe = followService.subscribeToUserFollows(user.id, {
        onCountChange: (counts) => {
          setFollowerCount(counts.followers);
          setFollowingCount(counts.following);
        },
      });

      return unsubscribe;
    }
  }, [user?.id]);

  // Load badges when viewing profile
  React.useEffect(() => {
    const loadBadges = async () => {
      if (user?.id) {
        const { updateUserBadges } = await import('@/services/badges/badgeService');
        await updateUserBadges(user.id);
      }
    };

    loadBadges();
  }, [user?.id]);

  // Determine what stats to show based on privacy settings
  const showBankroll = isOwnProfile || !privacySettings || privacySettings.show_bankroll;
  const showStats = isOwnProfile || !privacySettings || privacySettings.show_stats;

  return (
    <View paddingHorizontal="$4" paddingVertical="$4" backgroundColor="$surface">
      {/* Profile Info Row */}
      <View flexDirection="row" alignItems="center" marginBottom="$3">
        <Avatar size={80} src={user.avatar_url || undefined} />
        <View flex={1} marginLeft="$3">
          <View flexDirection="row" alignItems="center" gap="$2">
            <Text fontSize={24} fontWeight="600" color="$textPrimary">
              @{user.username}
            </Text>
            {isPrivate && (
              <View
                backgroundColor="$surfaceAlt"
                paddingHorizontal="$2"
                paddingVertical="$0.5"
                borderRadius="$1"
              >
                <Text fontSize={12} color="$textSecondary">
                  🔒 Private
                </Text>
              </View>
            )}
          </View>
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

      {/* Referral Bonus Info - only show on own profile */}
      {isOwnProfile && referralCount > 0 && (
        <View
          backgroundColor="$emerald"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$2"
          marginBottom="$3"
          alignSelf="flex-start"
        >
          <Text fontSize={14} fontWeight="600" color="white">
            {referralCount} referrals • +{formattedBonus}/week
          </Text>
        </View>
      )}

      {/* Weekly Badges - only show if we have stats access */}
      {showStats && badges.length > 0 && (
        <View marginBottom="$3">
          <WeeklyBadgeGrid badges={badges} />
        </View>
      )}

      {/* Stats Row - only show if we have stats access */}
      {showStats && stats && (
        <View flexDirection="row" justifyContent="space-around" marginBottom="$3">
          <View alignItems="center">
            <Text fontSize={20} fontWeight="600" color="$textPrimary">
              {stats.win_count + stats.loss_count}
            </Text>
            <Text fontSize={12} color="$textSecondary">
              Bets
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
          {showBankroll && (
            <>
              <View alignItems="center">
                <Text fontSize={20} fontWeight="600" color="$textPrimary">
                  ${profit}
                </Text>
                <Text fontSize={12} color="$textSecondary">
                  Profit
                </Text>
              </View>
              <View alignItems="center">
                <Text fontSize={20} fontWeight="600" color="$textPrimary">
                  {roi}%
                </Text>
                <Text fontSize={12} color="$textSecondary">
                  ROI
                </Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Follow Stats Row */}
      <View flexDirection="row" justifyContent="space-around" marginBottom="$3">
        <Pressable>
          <View alignItems="center">
            <Text fontSize={18} fontWeight="600" color="$textPrimary">
              {followerCount}
            </Text>
            <Text fontSize={12} color="$textSecondary">
              Followers
            </Text>
          </View>
        </Pressable>
        <Pressable>
          <View alignItems="center">
            <Text fontSize={18} fontWeight="600" color="$textPrimary">
              {followingCount}
            </Text>
            <Text fontSize={12} color="$textSecondary">
              Following
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Action Buttons */}
      <View flexDirection="row" gap="$2">
        {isOwnProfile ? (
          <Pressable
            onPress={onEditProfile}
            style={{
              flex: 1,
              backgroundColor: '$surfaceAlt',
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text fontSize={14} fontWeight="600" color="$textPrimary">
              Edit Profile
            </Text>
          </Pressable>
        ) : (
          <>
            <View flex={1}>
              <FollowRequestButton
                targetUserId={user.id}
                isPrivate={isPrivate}
                onFollowChange={onFollow}
              />
            </View>
            {onBlock && (
              <Pressable
                onPress={onBlock}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: Colors.border.light,
                  alignItems: 'center',
                }}
              >
                <Text fontSize={14} fontWeight="600" color="$textSecondary">
                  •••
                </Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    </View>
  );
};
