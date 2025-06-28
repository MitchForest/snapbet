import React, { useState, useEffect } from 'react';
import { View, Text } from '@tamagui/core';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase/client';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { PostsList } from '@/components/profile/PostsList';
import { BetsList } from '@/components/profile/BetsList';
import { BlockConfirmation } from '@/components/moderation/BlockConfirmation';
import { ProfileSkeleton } from '@/components/skeletons/ProfileSkeleton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useFollowState } from '@/hooks/useFollowState';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { privacyService } from '@/services/privacy/privacyService';
import { Colors } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

function ProfileScreenContent() {
  const { username, activeTab: initialTab } = useLocalSearchParams<{
    username: string;
    activeTab?: string;
  }>();
  const currentUser = useAuthStore((state) => state.user);

  console.log('ProfileScreen - username param:', username);
  interface ProfileUser {
    id: string;
    username: string;
    display_name?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    favorite_team?: string | null;
    is_private?: boolean;
  }

  interface UserStats {
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

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'bets'>(
    initialTab === 'bets' ? 'bets' : 'posts'
  );

  const [canViewContent, setCanViewContent] = useState(false);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  const isOwnProfile = currentUsername === username;

  // Use block functionality
  const { blockUser, unblockUser, isBlocked } = useBlockedUsers();
  const isUserBlocked = profileUser ? isBlocked(profileUser.id) : false;

  // Use the new follow state hook
  const { isFollowing, toggleFollow } = useFollowState(profileUser?.id || '', {
    onFollowChange: (_newState) => {
      // Refetch profile data when follow state changes
      if (profileUser?.is_private) {
        fetchProfileData();
      }
    },
  });

  const fetchProfileData = async () => {
    try {
      // First, get current user's username from database
      if (currentUser?.id) {
        const { data: currentUserData } = await supabase
          .from('users')
          .select('username')
          .eq('id', currentUser.id)
          .single();

        if (currentUserData?.username) {
          setCurrentUsername(currentUserData.username);
        }
      }

      // Get user data with privacy columns
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, bio, favorite_team, is_private')
        .eq('username', username)
        .single();

      if (userError || !userData || !userData.username) {
        // Profile not found or user not onboarded
        router.replace('/');
        return;
      }

      const user = userData;

      setProfileUser({
        id: user.id,
        username: user.username || '',
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        favorite_team: user.favorite_team,
        is_private: user.is_private || false,
      });

      // Check if we can view this user's content
      const privacyCheck = await privacyService.canViewUserContent(
        currentUser?.id || null,
        user.id
      );
      setCanViewContent(privacyCheck.canView);

      // Get privacy settings
      const settings = await privacyService.getPrivacySettings(user.id);
      setPrivacySettings(settings);

      // Only fetch stats if we can view content or if privacy settings allow
      if (privacyCheck.canView || privacyCheck.isOwnProfile) {
        // Get user stats
        const { data: bankrollData } = await supabase
          .from('bankrolls')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setUserStats(bankrollData);

        // Get user badges
        if (bankrollData) {
          console.log('[Profile Debug] Fetching badges for user:', user.id);
          const { calculateUserBadges } = await import('@/services/badges/badgeService');
          const userBadges = await calculateUserBadges(user.id);
          console.log('[Profile Debug] Badges received:', userBadges);
          setBadges(userBadges);
        }
      } else {
        setUserStats(null);
        setBadges([]);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const handleFollow = async () => {
    await toggleFollow();
  };

  const handleBlockPress = () => {
    setShowBlockConfirm(true);
  };

  const handleBlockConfirm = async () => {
    if (profileUser) {
      if (isUserBlocked) {
        await unblockUser(profileUser.id);
      } else {
        await blockUser(profileUser.id);
        // Navigate back after blocking
        router.back();
      }
    }
  };

  if (isLoading) {
    return (
      <>
        <ScreenHeader title="Profile" />
        <ProfileSkeleton />
      </>
    );
  }

  if (!profileUser) {
    return (
      <>
        <ScreenHeader title="Profile" />
        <View flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
          <Text fontSize={18} color="$textSecondary">
            Profile not found
          </Text>
        </View>
      </>
    );
  }

  // If user is blocked, show limited view
  if (isUserBlocked) {
    return (
      <View flex={1} backgroundColor="$background">
        <ScreenHeader title={profileUser.display_name || profileUser.username} />
        <ProfileHeader
          user={profileUser}
          stats={null}
          badges={[]}
          isOwnProfile={false}
          isFollowing={false}
          isPrivate={true}
          privacySettings={null}
          onFollow={() => {}}
          onEditProfile={() => {}}
          onBlock={handleBlockPress}
        />

        <View flex={1} alignItems="center" justifyContent="center" paddingTop="$10">
          <Text fontSize={20} marginBottom="$2">
            🚫
          </Text>
          <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$1">
            You&apos;ve blocked this user
          </Text>
          <Text
            fontSize={14}
            color="$textSecondary"
            textAlign="center"
            paddingHorizontal="$6"
            marginBottom="$4"
          >
            You won&apos;t see their posts or stories
          </Text>
          <TouchableOpacity style={styles.unblockButton} onPress={handleBlockPress}>
            <Text style={styles.unblockButtonText}>Unblock</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Private profile and we can't view it
  if (profileUser.is_private && !canViewContent && !isOwnProfile) {
    return (
      <View flex={1} backgroundColor="$background">
        <ScreenHeader title={profileUser.display_name || profileUser.username} />
        <ProfileHeader
          user={profileUser}
          stats={null}
          badges={[]}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          isPrivate={true}
          privacySettings={privacySettings}
          onFollow={handleFollow}
          onEditProfile={() => router.push('/settings/profile')}
          onBlock={handleBlockPress}
        />

        <View flex={1} alignItems="center" justifyContent="center" paddingTop="$10">
          <Text fontSize={20} marginBottom="$2">
            🔒
          </Text>
          <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$1">
            This Account is Private
          </Text>
          <Text fontSize={14} color="$textSecondary" textAlign="center" paddingHorizontal="$6">
            Follow this account to see their posts, stats, and betting history
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor="$background">
      <ScreenHeader title={profileUser.display_name || profileUser.username} />
      <View flex={1}>
        <ProfileHeader
          user={profileUser}
          stats={userStats}
          badges={badges}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          isPrivate={profileUser.is_private}
          privacySettings={privacySettings}
          onFollow={handleFollow}
          onEditProfile={() => router.push('/settings/profile')}
          onBlock={isOwnProfile ? undefined : handleBlockPress}
        />

        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <View flex={1}>
          {activeTab === 'posts' ? (
            <PostsList userId={profileUser.id} canView={canViewContent || isOwnProfile} />
          ) : (
            <BetsList userId={profileUser.id} canView={canViewContent || isOwnProfile} />
          )}
        </View>
      </View>

      {/* Block Confirmation */}
      <BlockConfirmation
        isVisible={showBlockConfirm}
        onClose={() => setShowBlockConfirm(false)}
        onConfirm={handleBlockConfirm}
        username={profileUser.username}
        isBlocking={!isUserBlocked}
      />
    </View>
  );
}

export default function ProfileScreen() {
  return (
    <ErrorBoundary level="tab">
      <ProfileScreenContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  unblockButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  unblockButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
