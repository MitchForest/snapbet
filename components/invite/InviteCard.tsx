import React, { useState } from 'react';
import { View, Text, Stack } from '@tamagui/core';
import { Alert, Pressable } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { getShareContent } from '@/services/referral/referralService';

interface InviteCardProps {
  referralCode: string;
}

export function InviteCard({ referralCode }: InviteCardProps) {
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const handleShare = async () => {
    try {
      const shareContent = getShareContent(referralCode);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        // Use native share sheet
        await Sharing.shareAsync(shareContent.url, {
          mimeType: 'text/plain',
          dialogTitle: 'Share your invite code',
        });
      } else {
        // Fallback to clipboard
        await handleCopyCode();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to clipboard
      await handleCopyCode();
    }
  };

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(referralCode);
      setShowCopiedToast(true);

      // Hide toast after 2 seconds
      setTimeout(() => {
        setShowCopiedToast(false);
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy code. Please try again.');
    }
  };

  return (
    <Stack>
      <View
        backgroundColor="$primary"
        borderRadius="$4"
        padding="$6"
        alignItems="center"
        marginBottom="$4"
        position="relative"
        overflow="hidden"
      >
        {/* Background pattern */}
        <View
          position="absolute"
          top={-20}
          right={-20}
          width={100}
          height={100}
          backgroundColor="$primaryHover"
          borderRadius={50}
          opacity={0.3}
        />
        <View
          position="absolute"
          bottom={-30}
          left={-30}
          width={120}
          height={120}
          backgroundColor="$primaryHover"
          borderRadius={60}
          opacity={0.2}
        />

        {/* Content */}
        <Text fontSize={20} fontWeight="600" color="$textInverse" marginBottom="$2">
          Your Invite Code
        </Text>

        <Pressable onPress={handleCopyCode}>
          <View
            backgroundColor="$surface"
            paddingHorizontal="$6"
            paddingVertical="$3"
            borderRadius="$3"
            marginBottom="$4"
          >
            <Text fontSize={32} fontWeight="700" color="$primary" letterSpacing={2}>
              {referralCode}
            </Text>
          </View>
        </Pressable>

        <Text fontSize={14} color="$textInverse" opacity={0.9} textAlign="center" marginBottom="$4">
          Tap code to copy
        </Text>

        {/* Share button */}
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <View
            backgroundColor="$surface"
            paddingHorizontal="$6"
            paddingVertical="$3"
            borderRadius="$3"
            flexDirection="row"
            alignItems="center"
            gap="$2"
          >
            <Text fontSize={20}>📤</Text>
            <Text fontSize={16} fontWeight="600" color="$primary">
              Share Invite
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Copied toast */}
      {showCopiedToast && (
        <View
          position="absolute"
          bottom={-40}
          alignSelf="center"
          backgroundColor="$backgroundStrong"
          paddingHorizontal="$4"
          paddingVertical="$2"
          borderRadius="$2"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.25}
          shadowRadius={3.84}
        >
          <Text fontSize={14} color="$textPrimary">
            ✓ Code copied to clipboard!
          </Text>
        </View>
      )}
    </Stack>
  );
}
