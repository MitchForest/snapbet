import React from 'react';
import { View, Text, Stack } from '@tamagui/core';
import { ScrollView, StyleSheet } from 'react-native';
import { Avatar } from '@/components/common/Avatar';

interface ReferralStatsType {
  totalReferrals: number;
  thisWeek: number;
  thisMonth: number;
}

interface ReferredUser {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface ReferralStatsProps {
  stats: ReferralStatsType;
  referredUsers: ReferredUser[];
}

export function ReferralStats({ stats, referredUsers }: ReferralStatsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <Stack gap="$4">
      {/* Stats Cards */}
      <View flexDirection="row" gap="$3">
        <View
          flex={1}
          backgroundColor="$backgroundStrong"
          padding="$4"
          borderRadius="$3"
          alignItems="center"
        >
          <Text fontSize={24} fontWeight="700" color="$textPrimary">
            {stats.totalReferrals}
          </Text>
          <Text fontSize={14} color="$textSecondary">
            Total Invites
          </Text>
        </View>

        <View
          flex={1}
          backgroundColor="$backgroundStrong"
          padding="$4"
          borderRadius="$3"
          alignItems="center"
        >
          <Text fontSize={24} fontWeight="700" color="$textPrimary">
            {stats.thisWeek}
          </Text>
          <Text fontSize={14} color="$textSecondary">
            This Week
          </Text>
        </View>

        <View
          flex={1}
          backgroundColor="$backgroundStrong"
          padding="$4"
          borderRadius="$3"
          alignItems="center"
        >
          <Text fontSize={24} fontWeight="700" color="$textPrimary">
            {stats.thisMonth}
          </Text>
          <Text fontSize={14} color="$textSecondary">
            This Month
          </Text>
        </View>
      </View>

      {/* Friends List */}
      {referredUsers.length > 0 && (
        <View>
          <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$3">
            Friends you invited ({referredUsers.length})
          </Text>

          <ScrollView style={styles.referredUsersList}>
            <Stack gap="$2">
              {referredUsers.map((user) => (
                <View
                  key={user.id}
                  flexDirection="row"
                  alignItems="center"
                  padding="$3"
                  backgroundColor="$backgroundStrong"
                  borderRadius="$2"
                  gap="$3"
                >
                  <Avatar
                    src={user.avatar_url || undefined}
                    username={user.username || undefined}
                    fallback={user.username?.charAt(0).toUpperCase() || '?'}
                    size={40}
                  />

                  <View flex={1}>
                    <Text fontSize={16} fontWeight="600" color="$textPrimary">
                      {user.display_name || (user.username ? `@${user.username}` : 'Anonymous')}
                    </Text>
                    <Text fontSize={14} color="$textSecondary">
                      Joined {formatDate(user.created_at)}
                    </Text>
                  </View>
                </View>
              ))}
            </Stack>
          </ScrollView>
        </View>
      )}

      {/* Empty state */}
      {referredUsers.length === 0 && stats.totalReferrals === 0 && (
        <View
          padding="$6"
          alignItems="center"
          backgroundColor="$backgroundStrong"
          borderRadius="$3"
        >
          <Text fontSize={48} marginBottom="$2">
            🎯
          </Text>
          <Text fontSize={16} fontWeight="600" color="$textPrimary" marginBottom="$1">
            No invites yet
          </Text>
          <Text fontSize={14} color="$textSecondary" textAlign="center">
            Share your code with friends to grow your betting network!
          </Text>
        </View>
      )}
    </Stack>
  );
}

const styles = StyleSheet.create({
  referredUsersList: {
    maxHeight: 300,
  },
});
