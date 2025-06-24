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
  }

  interface UserStats {
    balance: number;
    win_count: number;
    loss_count: number;
    total_wagered: number;
    total_won: number;
  }

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'bets'>('posts');
  const [refreshing, setRefreshing] = useState(false);

  const isOwnProfile = currentUser?.user_metadata?.username === username;

  const fetchProfileData = async () => {
    try {
      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.toLowerCase())
        .single();

      if (userError || !userData || !userData.username) {
        // Profile not found or user not onboarded
        router.replace('/');
        return;
      }

      setProfileUser({
        id: userData.id,
        username: userData.username,
        display_name: userData.display_name,
        avatar_url: userData.avatar_url,
        bio: userData.bio,
        favorite_team: userData.favorite_team,
      });

      // Get user stats
      const { data: bankrollData } = await supabase
        .from('bankrolls')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      setUserStats(bankrollData);

      // Get user badges (for now, calculate on the fly)
      // In production, these would come from user_badges table
      if (bankrollData) {
        const { calculateUserBadges } = await import('@/services/badges/badgeService');
        const userBadges = await calculateUserBadges(userData.id);
        setBadges(userBadges);
      }

      // Check if following (if not own profile)
      if (!isOwnProfile && currentUser?.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', currentUser.id)
          .eq('following_id', userData.id)
          .single();

        setIsFollowing(!!followData);
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
    if (!currentUser?.id || !profileUser?.id) return;

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profileUser.id);
      } else {
        // Follow
        await supabase.from('follows').insert({
          follower_id: currentUser.id,
          following_id: profileUser.id,
        });
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
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
          onFollow={handleFollow}
          onEditProfile={() => router.push('/settings/profile')}
        />

        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'posts' ? (
          <PostsList userId={profileUser.id} />
        ) : (
          <BetsList userId={profileUser.id} />
        )}
      </ScrollView>
    </View>
  );
}
