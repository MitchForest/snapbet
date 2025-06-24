import React, { useState, useEffect } from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Avatar } from '@/components/common/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase/client';
import { useNotifications } from '@/hooks/useNotifications';

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: number;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onPress, badge }) => (
  <Pressable onPress={onPress}>
    <View flexDirection="row" alignItems="center" paddingVertical="$3" paddingHorizontal="$4">
      <Text fontSize={20} marginRight="$3">
        {icon}
      </Text>
      <Text fontSize={16} color="$textPrimary" flex={1}>
        {label}
      </Text>
      {badge !== undefined && badge > 0 && (
        <View
          backgroundColor="$error"
          borderRadius="$round"
          paddingHorizontal="$2"
          paddingVertical="$0.5"
          minWidth={20}
          alignItems="center"
        >
          <Text fontSize={12} color="$textInverse" fontWeight="600">
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </View>
  </Pressable>
);

export const DrawerContent: React.FC<DrawerContentComponentProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, signOut, resetBankroll } = useAuthStore();
  const { unreadCount } = useNotifications();
  const [userStats, setUserStats] = useState<Record<string, any> | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    // Fetch user stats and counts
    const fetchUserData = async () => {
      try {
        // Get bankroll stats
        const { data: bankroll } = await supabase
          .from('bankrolls')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Get follower/following counts
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

        setUserStats(bankroll);
        setFollowerCount(followers || 0);
        setFollowingCount(following || 0);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user?.id]);

  const handleResetBankroll = () => {
    Alert.alert(
      'Reset Bankroll',
      'Are you sure you want to reset your bankroll to $1,000? This will clear your betting history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const { error } = await resetBankroll();
            if (error) {
              Alert.alert('Error', 'Failed to reset bankroll');
            } else {
              Alert.alert('Success', 'Your bankroll has been reset to $1,000');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.closeDrawer();
        },
      },
    ]);
  };

  // Calculate display stats
  const winRate = userStats
    ? ((userStats.win_count / (userStats.win_count + userStats.loss_count)) * 100).toFixed(1)
    : '0.0';

  const username = user?.user_metadata?.username || 'user';

  return (
    <View flex={1} backgroundColor="$background">
      <ScrollView>
        <View paddingTop={insets.top + 20}>
          {/* Profile Section */}
          <View
            paddingHorizontal="$4"
            paddingBottom="$4"
            borderBottomWidth={1}
            borderBottomColor="$divider"
          >
            <Avatar size={64} />
            <Text fontSize={20} fontWeight="600" marginTop="$3" color="$textPrimary">
              @{username}
            </Text>
            <Text fontSize={14} color="$textSecondary" marginTop="$1">
              {userStats ? `${userStats.win_count}-${userStats.loss_count}` : '0-0'} • {winRate}%
              Win Rate
            </Text>

            {/* Current Bankroll */}
            <Text fontSize={24} fontWeight="600" color="$primary" marginTop="$3">
              ${userStats ? (userStats.balance / 100).toFixed(2) : '1,000.00'}
            </Text>
            <Text fontSize={12} color="$textSecondary">
              Current Bankroll
            </Text>
          </View>

          {/* Profile Section */}
          <View paddingTop="$3">
            <MenuItem
              icon="👤"
              label="View Profile"
              onPress={() => {
                navigation.navigate('profile/[username]', { username });
                navigation.closeDrawer();
              }}
            />
            <MenuItem
              icon="👥"
              label={`Following (${followingCount})`}
              onPress={() => {
                navigation.navigate('following');
                navigation.closeDrawer();
              }}
            />
            <MenuItem
              icon="👤"
              label={`Followers (${followerCount})`}
              onPress={() => {
                navigation.navigate('followers');
                navigation.closeDrawer();
              }}
            />
          </View>

          {/* Activity Section */}
          <View paddingTop="$3" borderTopWidth={1} borderTopColor="$divider" marginTop="$3">
            <MenuItem
              icon="🔔"
              label="Notifications"
              badge={unreadCount}
              onPress={() => {
                navigation.navigate('notifications');
                navigation.closeDrawer();
              }}
            />
            <MenuItem
              icon="📜"
              label="Bet History"
              onPress={() => {
                // TODO: Navigate to bet history (future sprint)
                Alert.alert('Coming Soon', 'Bet History will be available in a future update');
                navigation.closeDrawer();
              }}
            />
          </View>

          {/* Settings Section */}
          <View paddingTop="$3" borderTopWidth={1} borderTopColor="$divider" marginTop="$3">
            <MenuItem
              icon="⚙️"
              label="Settings"
              onPress={() => {
                navigation.navigate('settings/index');
                navigation.closeDrawer();
              }}
            />
            <MenuItem icon="↻" label="Reset Bankroll" onPress={handleResetBankroll} />
          </View>

          {/* Social Section */}
          <View paddingTop="$3" borderTopWidth={1} borderTopColor="$divider" marginTop="$3">
            <MenuItem
              icon="🎁"
              label="Invite Friends"
              onPress={() => {
                navigation.navigate('invite');
                navigation.closeDrawer();
              }}
            />
            <MenuItem
              icon="📖"
              label="How to Play"
              onPress={() => {
                navigation.navigate('how-to-play');
                navigation.closeDrawer();
              }}
            />
          </View>

          {/* Account Section */}
          <View
            marginTop="$3"
            paddingTop="$3"
            borderTopWidth={1}
            borderTopColor="$divider"
            paddingBottom={insets.bottom + 20}
          >
            <MenuItem icon="🚪" label="Sign Out" onPress={handleSignOut} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
