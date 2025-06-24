import React from 'react';
import { View, Text, Stack } from '@tamagui/core';
import { Pressable } from 'react-native';

interface UsernameSuggestionsProps {
  suggestions: string[];
  onSelect: (username: string) => void;
}

export function UsernameSuggestions({ suggestions, onSelect }: UsernameSuggestionsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View marginTop="$3">
      <Text fontSize={14} color="$textSecondary" marginBottom="$2">
        Try one of these available usernames:
      </Text>
      <Stack flexDirection="row" flexWrap="wrap" gap="$2">
        {suggestions.map((suggestion) => (
          <Pressable
            key={suggestion}
            onPress={() => onSelect(suggestion)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View
              backgroundColor="$backgroundSecondary"
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$border"
            >
              <Text fontSize={14} color="$textPrimary">
                @{suggestion}
              </Text>
            </View>
          </Pressable>
        ))}
      </Stack>
    </View>
  );
}
