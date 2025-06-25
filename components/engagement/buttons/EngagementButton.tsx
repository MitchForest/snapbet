import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/theme';

interface EngagementButtonProps {
  icon: string;
  label?: string;
  count?: number;
  onPress: () => void;
  isActive?: boolean;
  activeColor?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function EngagementButton({
  icon,
  label,
  count,
  onPress,
  isActive = false,
  activeColor = Colors.primary,
  disabled = false,
  size = 'medium',
  style,
  textStyle,
}: EngagementButtonProps) {
  const scale = useSharedValue(1);
  const lastPressTime = useRef(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    // Debounce to prevent rapid taps
    const now = Date.now();
    if (now - lastPressTime.current < 300) return;
    lastPressTime.current = now;

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animation
    scale.value = withSequence(
      withTiming(0.92, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    // Call onPress after animation starts
    setTimeout(onPress, 50);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          button: styles.buttonSmall,
          icon: styles.iconSmall,
          text: styles.textSmall,
        };
      case 'large':
        return {
          button: styles.buttonLarge,
          icon: styles.iconLarge,
          text: styles.textLarge,
        };
      default:
        return {
          button: styles.buttonMedium,
          icon: styles.iconMedium,
          text: styles.textMedium,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const buttonColor = isActive ? activeColor : 'transparent';
  const textColor = isActive ? Colors.white : Colors.text.secondary;

  const formatCount = (num?: number) => {
    if (!num) return '';
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.button,
        sizeStyles.button,
        { backgroundColor: buttonColor },
        isActive && styles.buttonActive,
        disabled && styles.buttonDisabled,
        animatedStyle,
        style,
      ]}
    >
      <Text style={[sizeStyles.icon, { color: textColor }]}>{icon}</Text>
      {label && <Text style={[sizeStyles.text, { color: textColor }, textStyle]}>{label}</Text>}
      {count !== undefined && (
        <Text style={[sizeStyles.text, { color: textColor }, textStyle]}>{formatCount(count)}</Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    gap: 4,
  },
  buttonActive: {
    borderWidth: 0,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  // Small size
  buttonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  iconSmall: {
    fontSize: 16,
  },
  textSmall: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Medium size
  buttonMedium: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  iconMedium: {
    fontSize: 20,
  },
  textMedium: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Large size
  buttonLarge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  iconLarge: {
    fontSize: 24,
  },
  textLarge: {
    fontSize: 16,
    fontWeight: '600',
  },
});
