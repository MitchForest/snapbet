import React from 'react';
import { View, Text } from '@tamagui/core';

export default function InviteScreen() {
  return (
    <View
      flex={1}
      backgroundColor="$background"
      justifyContent="center"
      alignItems="center"
      padding="$4"
    >
      <Text fontSize={48} marginBottom="$4">
        🎁
      </Text>
      <Text
        fontSize={24}
        fontWeight="600"
        color="$textPrimary"
        marginBottom="$2"
        textAlign="center"
      >
        Invite Friends
      </Text>
      <Text fontSize={16} color="$textSecondary" textAlign="center" lineHeight={24}>
        The referral system will be available in a future update. You'll be able to invite friends
        and earn rewards!
      </Text>
    </View>
  );
}
