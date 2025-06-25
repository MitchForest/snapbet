import React, { useState, useRef, useEffect } from 'react';
import { TextInput, Pressable, StyleSheet, Animated, View, Text } from 'react-native';
import { Colors } from '@/theme';
import * as Haptics from 'expo-haptics';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search users...',
  autoFocus = false,
  onFocus,
  onBlur,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const borderColorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(borderColorAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused, borderColorAnim]);

  const handleClear = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChangeText('');
  };

  const animatedBorderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border.default, Colors.primary],
  });

  return (
    <Animated.View style={[styles.container, { borderColor: animatedBorderColor }]}>
      <View style={styles.innerContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray[400]}
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
        />
        {value.length > 0 && (
          <Pressable
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={styles.clearIcon}>✕</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 16,
    color: Colors.gray[400],
  },
});
