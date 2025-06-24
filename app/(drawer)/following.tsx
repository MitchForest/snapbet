import React, { useState, useEffect } from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase/client';
import { UserListItem } from '@/components/common/UserListItem';

export default function FollowingScreen() {
  const user = useAuthStore((state) => state.user);
  interface UserData {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
  }

  const [following, setFollowing] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchFollowing();
    }
  }, [user?.id]);

  const fetchFollowing = async () => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(
          `
          following:following_id (
            id,
            username,
            display_name,
            avatar_url,
            bio
          )
        `
        )
        .eq('follower_id', user!.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setFollowing(data.map((item: Record<string, any>) => item.following));
      }
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor="$background">
      <ScrollView>
        {following.length === 0 ? (
          <View flex={1} justifyContent="center" alignItems="center" paddingVertical="$8">
            <Text fontSize={18} color="$textSecondary" marginBottom="$2">
              Not following anyone yet
            </Text>
            <Text fontSize={14} color="$textSecondary" textAlign="center" paddingHorizontal="$4">
              Find bettors to follow and see their picks in your feed
            </Text>
          </View>
        ) : (
          following.map((user) => <UserListItem key={user.id} user={user} />)
        )}
      </ScrollView>
    </View>
  );
}
