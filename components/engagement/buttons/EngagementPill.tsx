import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { Colors } from '@/theme';

interface EngagementPillProps {
  icon: string;
  count?: number;
  onPress: () => void;
  isActive?: boolean;
  activeColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function EngagementPill({
  icon,
  count,
  onPress,
  isActive = false,
  activeColor = Colors.primary,
  style,
  textStyle,
}: EngagementPillProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    onPress();
  };

  const containerStyle = [
    styles.pill,
    isActive && styles.pillActive,
    isActive && { backgroundColor: `${activeColor}20`, borderColor: activeColor },
    animatedStyle,
    style,
  ];

  const countStyle = [
    styles.count,
    isActive && styles.countActive,
    isActive && { color: activeColor },
    textStyle,
  ];

  const formatCount = (num?: number) => {
    if (num === undefined) return null;
    return num.toString();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={containerStyle}
    >
      <Text style={styles.icon}>{icon}</Text>
      {count !== undefined && <Text style={countStyle}>{formatCount(count)}</Text>}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: 6,
  },
  pillActive: {
    // Active styles are now applied dynamically with activeColor
  },
  icon: {
    fontSize: 16,
  },
  count: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  countActive: {
    // Active color is applied dynamically
  },
});
