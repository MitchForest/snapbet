import React from 'react';
import { View, Text } from '@tamagui/core';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { InviteCard } from '@/components/invite/InviteCard';
import { ReferralStats } from '@/components/invite/ReferralStats';
import { useReferral } from '@/hooks/useReferral';
import { Colors } from '@/theme';

export default function InviteScreen() {
  const { code, stats, referredUsers, isLoading, error } = useReferral();

  if (isLoading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !code) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Text fontSize={16} color="$textSecondary">
          Unable to load invite data
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View marginBottom="$6">
        <Text fontSize={28} fontWeight="bold" color="$textPrimary" marginBottom="$2">
          Invite Friends
        </Text>
        <Text fontSize={16} color="$textSecondary">
          Share your referral code and grow the SnapBet community
        </Text>
      </View>

      {/* Invite Card */}
      <InviteCard referralCode={code} />

      {/* Referral Stats */}
      <ReferralStats stats={stats} referredUsers={referredUsers} />

      {/* Info Section */}
      <View marginTop="$6" padding="$4" backgroundColor="$surfaceAlt" borderRadius="$3">
        <Text fontSize={16} fontWeight="600" color="$textPrimary" marginBottom="$2">
          How it works
        </Text>
        <Text fontSize={14} color="$textSecondary" lineHeight={20}>
          When someone signs up with your code, they&apos;ll automatically follow you. Build your
          following and compete for the top referrer badges!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
});
