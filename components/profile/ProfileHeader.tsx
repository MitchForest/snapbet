import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable, StyleSheet } from 'react-native';
import { Avatar } from '@/components/common/Avatar';
import { WeeklyBadgeGrid } from '@/components/badges/WeeklyBadgeGrid';
import { followService } from '@/services/social/followService';
import { FollowRequestButton } from './FollowRequestButton';
import { useReferralRewards } from '@/hooks/useReferralRewards';
import { Colors } from '@/theme';
import { router } from 'expo-router';

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
  aiReasons?: string[] | null;
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
  aiReasons,
}) => {
  // Calculate stats - Updated to remove decimals
  const winRate =
    stats && stats.win_count + stats.loss_count > 0
      ? Math.round((stats.win_count / (stats.win_count + stats.loss_count)) * 100)
      : 0;
  const profit = stats ? Math.round((stats.total_won - stats.total_wagered) / 100) : 0;
  const roi =
    stats && stats.total_wagered > 0
      ? Math.round(((stats.total_won - stats.total_wagered) / stats.total_wagered) * 100)
      : 0;

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
      {/* More options button in top right */}
      {!isOwnProfile && onBlock && (
        <View position="absolute" top="$4" right="$4" zIndex={1}>
          <Pressable onPress={onBlock} style={styles.moreButton}>
            <Text fontSize={18} color="$textSecondary">
              •••
            </Text>
          </Pressable>
        </View>
      )}

      {/* Profile Info Row */}
      <View flexDirection="row" alignItems="flex-start" marginBottom="$3">
        <Avatar size={80} src={user.avatar_url} username={user.username} />
        <View flex={1} marginLeft="$3">
          <View flexDirection="row" alignItems="center" gap="$2" marginTop="$1">
            <Text fontSize={24} fontWeight="600" color="$textPrimary">
              {user.display_name || user.username}
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

          {/* Combined Follow Stats and Action Row - Under display name */}
          <View flexDirection="row" alignItems="center" marginTop="$3">
            {/* Followers */}
            <Pressable onPress={() => router.push('/followers')}>
              <View alignItems="center">
                <Text fontSize={16} fontWeight="600" color="$textPrimary">
                  {followerCount}
                </Text>
                <Text fontSize={12} color="$textSecondary">
                  Followers
                </Text>
              </View>
            </Pressable>

            {/* Following */}
            <View marginLeft={25}>
              <Pressable onPress={() => router.push('/following')}>
                <View alignItems="center">
                  <Text fontSize={16} fontWeight="600" color="$textPrimary">
                    {followingCount}
                  </Text>
                  <Text fontSize={12} color="$textSecondary">
                    Following
                  </Text>
                </View>
              </Pressable>
            </View>

            {/* Action Button */}
            <View marginLeft={25}>
              {isOwnProfile ? (
                <Pressable onPress={onEditProfile} style={styles.editProfileButton}>
                  <Text fontSize={14} fontWeight="600" color="$textPrimary">
                    Edit Profile
                  </Text>
                </Pressable>
              ) : (
                <FollowRequestButton
                  targetUserId={user.id}
                  isPrivate={isPrivate}
                  onFollowChange={(_newFollowState) => {
                    onFollow?.();
                  }}
                />
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Bio */}
      {user.bio && (
        <Text fontSize={14} color="$textPrimary" marginBottom="$3" lineHeight={20}>
          {user.bio}
        </Text>
      )}

      {/* AI Suggestion Reasons - Positioned after bio */}
      {aiReasons && aiReasons.length > 0 && !isOwnProfile && !_isFollowing && (
        <View
          backgroundColor="$surfaceAlt"
          paddingHorizontal={16}
          paddingVertical={12}
          borderRadius={12}
          marginBottom={16}
          marginTop={8}
          flexDirection="row"
          alignItems="center"
          gap={8}
        >
          <View
            backgroundColor={Colors.ai}
            paddingHorizontal={10}
            paddingVertical={4}
            borderRadius={12}
          >
            <Text fontSize={11} fontWeight="600" color={Colors.white}>
              ✨ AI Match
            </Text>
          </View>
          <Text fontSize={13} color="$textPrimary" flex={1}>
            {aiReasons.join(' • ')}
          </Text>
        </View>
      )}

      {/* Referral Bonus Info - only show on own profile */}
      {isOwnProfile && referralCount > 0 && (
        <View
          backgroundColor="$primary"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$2"
          marginBottom="$3"
          alignSelf="flex-start"
        >
          <Text fontSize={14} fontWeight="600" color="$textInverse">
            {referralCount} referrals • +{formattedBonus}/week
          </Text>
        </View>
      )}

      {/* Stats Row - only show if we have stats access */}
      {showStats && stats && (
        <View flexDirection="row" justifyContent="space-around" marginBottom="$3">
          <View alignItems="center">
            <View
              width={64}
              height={64}
              borderRadius={32}
              backgroundColor="$surfaceAlt"
              alignItems="center"
              justifyContent="center"
              marginBottom="$1"
            >
              <Text fontSize={16} fontWeight="600" color="$textPrimary">
                {stats.win_count + stats.loss_count}
              </Text>
            </View>
            <Text fontSize={12} color="$textSecondary">
              Bets
            </Text>
          </View>
          <View alignItems="center">
            <View
              width={64}
              height={64}
              borderRadius={32}
              backgroundColor="$surfaceAlt"
              alignItems="center"
              justifyContent="center"
              marginBottom="$1"
            >
              <Text fontSize={16} fontWeight="600" color="$textPrimary">
                {winRate}%
              </Text>
            </View>
            <Text fontSize={12} color="$textSecondary">
              Win Rate
            </Text>
          </View>
          {showBankroll && (
            <>
              <View alignItems="center">
                <View
                  width={64}
                  height={64}
                  borderRadius={32}
                  backgroundColor="$surfaceAlt"
                  alignItems="center"
                  justifyContent="center"
                  marginBottom="$1"
                >
                  <Text fontSize={16} fontWeight="600" color="$textPrimary">
                    {profit}
                  </Text>
                </View>
                <Text fontSize={12} color="$textSecondary">
                  Profit ($)
                </Text>
              </View>
              <View alignItems="center">
                <View
                  width={64}
                  height={64}
                  borderRadius={32}
                  backgroundColor="$surfaceAlt"
                  alignItems="center"
                  justifyContent="center"
                  marginBottom="$1"
                >
                  <Text fontSize={16} fontWeight="600" color="$textPrimary">
                    {roi}%
                  </Text>
                </View>
                <Text fontSize={12} color="$textSecondary">
                  ROI
                </Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Weekly Badges - only show if we have stats access */}
      {showStats && badges.length > 0 && (
        <View marginBottom="$3">
          {console.log('[ProfileHeader Debug] Rendering badges:', badges)}
          <WeeklyBadgeGrid badges={badges} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  editProfileButton: {
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  moreButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
});
