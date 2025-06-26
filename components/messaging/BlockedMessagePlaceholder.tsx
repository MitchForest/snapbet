import React from 'react';
import { View, Text, Stack } from '@tamagui/core';

interface BlockedMessagePlaceholderProps {
  isOwn?: boolean;
}

export const BlockedMessagePlaceholder: React.FC<BlockedMessagePlaceholderProps> = ({
  isOwn = false,
}) => {
  return (
    <Stack
      flexDirection={isOwn ? 'row-reverse' : 'row'}
      gap="$2"
      alignItems="flex-end"
      maxWidth="75%"
    >
      {/* Spacer for avatar alignment */}
      {!isOwn && <View width={28} />}

      <View
        backgroundColor="$gray3"
        borderRadius={16}
        borderBottomRightRadius={isOwn ? 4 : 16}
        borderBottomLeftRadius={isOwn ? 16 : 4}
        padding="$3"
        maxWidth="75%"
        minWidth={60}
      >
        <Text fontSize="$3" color="$gray11" fontStyle="italic">
          [Blocked User]
        </Text>
      </View>
    </Stack>
  );
};
