import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, OpacityColors } from '@/theme';

const REACTIONS = ['🔥', '💰', '😂', '😭', '💯', '🎯'];

interface ReactionPickerProps {
  onSelect?: (emoji: string) => void;
  currentReaction?: string | null;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ReactionButton({
  emoji,
  isSelected,
  onPress,
}: {
  emoji: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const handlePress = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animation
    scale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1, {
        damping: 5,
        stiffness: 300,
      })
    );

    if (!isSelected) {
      rotation.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 100 }),
        withTiming(0, { duration: 50 })
      );
    }

    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[styles.reactionButton, isSelected && styles.reactionButtonSelected, animatedStyle]}
    >
      <Text style={styles.reactionEmoji}>{emoji}</Text>
    </AnimatedPressable>
  );
}

export function ReactionPicker({ onSelect, currentReaction, style }: ReactionPickerProps) {
  const handleSelect = (emoji: string) => {
    if (onSelect) {
      onSelect(emoji);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {REACTIONS.map((emoji) => (
        <ReactionButton
          key={emoji}
          emoji={emoji}
          isSelected={currentReaction === emoji}
          onPress={() => handleSelect(emoji)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  reactionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: OpacityColors.transparent,
  },
  reactionButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  reactionEmoji: {
    fontSize: 24,
  },
});
