import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable } from 'react-native';
import { Colors } from '@/theme';

interface EmptyChatsProps {
  onStartChat?: () => void;
}

export const EmptyChats: React.FC<EmptyChatsProps> = ({ onStartChat }) => {
  return (
    <View
      flex={1}
      backgroundColor="$background"
      justifyContent="center"
      alignItems="center"
      paddingHorizontal="$6"
    >
      <Text fontSize={72} marginBottom="$4">
        💬
      </Text>
      <Text fontSize="$6" fontWeight="600" color="$textPrimary" textAlign="center">
        No conversations yet
      </Text>
      <Text
        fontSize="$4"
        color="$textSecondary"
        textAlign="center"
        marginTop="$2"
        marginBottom="$6"
      >
        Start a conversation with someone to share picks and talk about the games
      </Text>
      {onStartChat && (
        <Pressable
          onPress={onStartChat}
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.primaryDark : Colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          })}
        >
          <Text color="white" fontSize="$4" fontWeight="600">
            Start a Chat
          </Text>
        </Pressable>
      )}
    </View>
  );
};
