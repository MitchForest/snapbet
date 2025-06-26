import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable, TextInput, StyleSheet } from 'react-native';
import { Colors } from '@/theme';

interface ChatSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export const ChatSearch: React.FC<ChatSearchProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search conversations...',
}) => {
  return (
    <View
      paddingHorizontal="$4"
      paddingVertical="$2"
      backgroundColor="$background"
      borderBottomWidth={1}
      borderBottomColor="$border"
    >
      <View
        flexDirection="row"
        alignItems="center"
        backgroundColor="$surfaceAlt"
        borderRadius="$3"
        paddingHorizontal="$3"
        height={40}
        gap="$2"
      >
        <Text fontSize="$4" color="$gray11">
          🔍
        </Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray[400]}
        />
        {value.length > 0 && (
          <Pressable onPress={onClear}>
            <View
              width={20}
              height={20}
              borderRadius="$round"
              backgroundColor="$gray8"
              justifyContent="center"
              alignItems="center"
            >
              <Text fontSize="$2" color="white">
                ✕
              </Text>
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
});
