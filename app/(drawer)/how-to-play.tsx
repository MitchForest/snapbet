import React from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView } from 'react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/theme';

export default function HowToPlayScreen() {
  return (
    <View flex={1} backgroundColor={Colors.background}>
      <ScreenHeader title="How to Play" />

      <ScrollView>
        <View padding="$4" gap="$4">
          <View backgroundColor="$surface" padding="$4" borderRadius="$3">
            <Text fontSize={24} fontWeight="bold" color="$textPrimary" marginBottom="$3">
              Welcome to SnapBet!
            </Text>
            <Text fontSize={16} color="$textSecondary" lineHeight={24}>
              The social sports betting game where you compete with friends using virtual money.
            </Text>
          </View>

          <View backgroundColor="$surface" padding="$4" borderRadius="$3">
            <Text fontSize={20} fontWeight="600" color="$textPrimary" marginBottom="$3">
              🎯 How It Works
            </Text>
            <View gap="$3">
              <Text fontSize={16} color="$textSecondary" lineHeight={24}>
                1. Start with $1,000 in virtual money
              </Text>
              <Text fontSize={16} color="$textSecondary" lineHeight={24}>
                2. Make picks on real games
              </Text>
              <Text fontSize={16} color="$textSecondary" lineHeight={24}>
                3. Share your picks with friends
              </Text>
              <Text fontSize={16} color="$textSecondary" lineHeight={24}>
                4. Tail or fade other bettors
              </Text>
              <Text fontSize={16} color="$textSecondary" lineHeight={24}>
                5. Track your performance and climb the leaderboard
              </Text>
            </View>
          </View>

          <View backgroundColor="$surface" padding="$4" borderRadius="$3">
            <Text fontSize={20} fontWeight="600" color="$textPrimary" marginBottom="$3">
              💰 Bankroll Management
            </Text>
            <Text fontSize={16} color="$textSecondary" lineHeight={24}>
              Your bankroll resets to $1,000 whenever you run out. Track your all-time profit and
              ROI to show your true betting skills!
            </Text>
          </View>

          <View backgroundColor="$surface" padding="$4" borderRadius="$3">
            <Text fontSize={20} fontWeight="600" color="$textPrimary" marginBottom="$3">
              🏆 Earn Badges
            </Text>
            <Text fontSize={16} color="$textSecondary" lineHeight={24}>
              Unlock achievements like Hot Streak, Sharp, and more. Display your favorite badge on
              your profile!
            </Text>
          </View>

          <View backgroundColor="$surface" padding="$4" borderRadius="$3" marginBottom="$4">
            <Text fontSize={14} color="$textSecondary" textAlign="center" lineHeight={20}>
              Remember: This is for entertainment only. No real money is involved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
