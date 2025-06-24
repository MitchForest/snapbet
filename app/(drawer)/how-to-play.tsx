import React from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView } from 'react-native';

export default function HowToPlayScreen() {
  return (
    <View flex={1} backgroundColor="$background">
      <ScrollView>
        <View padding="$4">
          <Text fontSize={24} fontWeight="600" color="$textPrimary" marginBottom="$4">
            How to Play SnapBet
          </Text>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              📸 1. Make Your Picks
            </Text>
            <Text fontSize={14} color="$textSecondary" lineHeight={20}>
              Share your sports betting picks with photo or video proof. Add your analysis and stake
              amount.
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              👆 2. Tail or Fade
            </Text>
            <Text fontSize={14} color="$textSecondary" lineHeight={20}>
              Follow other bettors' picks (tail) or bet against them (fade). Build your bankroll by
              making smart decisions.
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              💰 3. Track Your Bankroll
            </Text>
            <Text fontSize={14} color="$textSecondary" lineHeight={20}>
              Start with $1,000 in virtual currency. Track your wins, losses, and ROI. Reset anytime
              to start fresh.
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              🏆 4. Earn Badges
            </Text>
            <Text fontSize={14} color="$textSecondary" lineHeight={20}>
              Unlock achievements like Hot Streak, Sharp, and Profit Leader. Show off your betting
              skills!
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              ⏰ 5. 24-Hour Stories
            </Text>
            <Text fontSize={14} color="$textSecondary" lineHeight={20}>
              All picks disappear after 24 hours, keeping the action fresh and the pressure on!
            </Text>
          </View>

          <View backgroundColor="$surfaceAlt" padding="$3" borderRadius="$2" marginTop="$4">
            <Text fontSize={12} color="$textSecondary" textAlign="center">
              SnapBet is for entertainment purposes only. No real money wagering. Must be 21+.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
