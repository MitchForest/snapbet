import React, { useState, useEffect } from 'react';
import { View, Text } from '@tamagui/core';
import { ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase/client';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { PostsList } from '@/components/profile/PostsList';
import { BetsList } from '@/components/profile/BetsList';
import { useFollowState } from '@/hooks/useFollowState';
import { privacyService } from '@/services/privacy/privacyService';

export default function ProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
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
  const [activeTab, setActiveTab] = useState<'posts' | 'bets'>('posts');
  const [refreshing, setRefreshing] = useState(false);
  const [canViewContent, setCanViewContent] = useState(false);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);

  const isOwnProfile = currentUser?.user_metadata?.username === username;

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
      // Get user data with privacy columns
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, bio, favorite_team, is_private')
        .eq('username', username.toLowerCase())
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
          const { calculateUserBadges } = await import('@/services/badges/badgeService');
          const userBadges = await calculateUserBadges(user.id);
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const handleFollow = async () => {
    await toggleFollow();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  if (isLoading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!profileUser) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Text fontSize={18} color="$textSecondary">
          Profile not found
        </Text>
      </View>
    );
  }

  // Private profile and we can't view it
  if (profileUser.is_private && !canViewContent && !isOwnProfile) {
    return (
      <View flex={1} backgroundColor="$background">
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
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
      >
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
        />

        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'posts' ? (
          <PostsList userId={profileUser.id} canView={canViewContent || isOwnProfile} />
        ) : (
          <BetsList userId={profileUser.id} canView={canViewContent || isOwnProfile} />
        )}
      </ScrollView>
    </View>
  );
}
