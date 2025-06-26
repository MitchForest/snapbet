import React from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView } from 'react-native';
import { useReferral } from '@/hooks/useReferral';
import { InviteCard } from '@/components/invite/InviteCard';
import { ReferralStats } from '@/components/invite/ReferralStats';
import { ReferralStatsCard } from '@/components/referral/ReferralStatsCard';
import { ReferralBonusDisplay } from '@/components/referral/ReferralBonusDisplay';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/theme';

export default function InviteScreen() {
  const { code, stats, referredUsers } = useReferral();

  return (
    <View flex={1} backgroundColor={Colors.background}>
      <ScreenHeader title="Invite Friends" />

      <ScrollView>
        <View padding="$4" gap="$4">
          {/* Referral Rewards Card */}
          <ReferralStatsCard />

          {/* Weekly Bankroll Display */}
          <View backgroundColor="$surface" padding="$4" borderRadius="$3" marginBottom="$2">
            <ReferralBonusDisplay variant="detailed" />
          </View>

          {/* Invite Card */}
          <InviteCard referralCode={code || ''} />

          {/* Referral Stats */}
          <ReferralStats stats={stats} referredUsers={referredUsers} />

          {/* How it Works */}
          <View backgroundColor="$surface" padding="$4" borderRadius="$3">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$3">
              How it works
            </Text>

            <View gap="$3">
              <View flexDirection="row" gap="$3">
                <Text fontSize={24}>1️⃣</Text>
                <View flex={1}>
                  <Text fontSize={16} fontWeight="500" color="$textPrimary">
                    Share your code
                  </Text>
                  <Text fontSize={14} color="$textSecondary" marginTop="$1">
                    Send your unique referral code to friends
                  </Text>
                </View>
              </View>

              <View flexDirection="row" gap="$3">
                <Text fontSize={24}>2️⃣</Text>
                <View flex={1}>
                  <Text fontSize={16} fontWeight="500" color="$textPrimary">
                    They sign up
                  </Text>
                  <Text fontSize={14} color="$textSecondary" marginTop="$1">
                    Friends use your code when creating their account
                  </Text>
                </View>
              </View>

              <View flexDirection="row" gap="$3">
                <Text fontSize={24}>3️⃣</Text>
                <View flex={1}>
                  <Text fontSize={16} fontWeight="500" color="$textPrimary">
                    Track your impact
                  </Text>
                  <Text fontSize={14} color="$textSecondary" marginTop="$1">
                    See how many friends joined through your referral
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
