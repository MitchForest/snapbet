import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Colors } from '@/theme';

interface CaptionInputProps {
  value: string;
  onChange: (text: string) => void;
  maxLength?: number;
  placeholder?: string;
}

export function CaptionInput({
  value,
  onChange,
  maxLength = 280,
  placeholder = 'Add a caption...',
}: CaptionInputProps) {
  const charCount = value.length;
  const showCounter = charCount > 200;

  const getCounterColor = () => {
    if (charCount >= 280) return Colors.error;
    if (charCount >= 250) return Colors.warning;
    return Colors.text.secondary;
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.text.secondary}
        value={value}
        onChangeText={onChange}
        multiline
        maxLength={maxLength}
        textAlignVertical="top"
      />
      {showCounter && (
        <Text style={[styles.counter, { color: getCounterColor() }]}>
          {charCount}/{maxLength}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    color: Colors.text.primary,
    fontSize: 16,
    minHeight: 60,
    paddingRight: 60, // Space for counter
  },
  counter: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    fontSize: 12,
    fontWeight: '500',
  },
});
