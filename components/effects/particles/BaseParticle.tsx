import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { ParticleConfig } from '@/types/effects';

interface BaseParticleProps {
  config: ParticleConfig;
  onComplete?: () => void;
}

export function BaseParticle({ config, onComplete }: BaseParticleProps) {
  const translateX = useSharedValue(config.startX);
  const translateY = useSharedValue(config.startY);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  useEffect(() => {
    // Start animations based on physics type
    switch (config.physics) {
      case 'float':
        // Gentle floating upward with slight horizontal drift
        scale.value = withSpring(1, { damping: 8 });
        translateY.value = withTiming(
          config.startY - 300,
          { duration: config.duration, easing: Easing.out(Easing.quad) },
          () => {
            if (onComplete) runOnJS(onComplete)();
          }
        );
        translateX.value = withSequence(
          withTiming(config.startX + 20, { duration: config.duration / 2 }),
          withTiming(config.startX - 20, { duration: config.duration / 2 })
        );
        opacity.value = withDelay(
          config.duration * 0.7,
          withTiming(0, { duration: config.duration * 0.3 })
        );
        break;

      case 'floatUp':
        // Straight upward float
        scale.value = withSpring(1, { damping: 10 });
        translateY.value = withTiming(
          config.startY - 400,
          { duration: config.duration, easing: Easing.linear },
          () => {
            if (onComplete) runOnJS(onComplete)();
          }
        );
        opacity.value = withDelay(
          config.duration * 0.8,
          withTiming(0, { duration: config.duration * 0.2 })
        );
        break;

      case 'fall':
        // Falling downward with gravity acceleration
        scale.value = withSpring(1, { damping: 12 });
        translateY.value = withTiming(
          config.startY + 400,
          { duration: config.duration, easing: Easing.in(Easing.quad) },
          () => {
            if (onComplete) runOnJS(onComplete)();
          }
        );
        translateX.value = withSequence(
          withTiming(config.startX - 10, { duration: config.duration / 3 }),
          withTiming(config.startX + 10, { duration: config.duration / 3 }),
          withTiming(config.startX, { duration: config.duration / 3 })
        );
        opacity.value = withDelay(
          config.duration * 0.7,
          withTiming(0, { duration: config.duration * 0.3 })
        );
        break;

      case 'explode': {
        // Explode outward from center
        const angle = Math.random() * Math.PI * 2;
        const distance = 200 + Math.random() * 100;
        scale.value = withSequence(
          withSpring(1.5, { damping: 5 }),
          withTiming(0.8, { duration: config.duration * 0.8 })
        );
        translateX.value = withTiming(
          config.startX + Math.cos(angle) * distance,
          {
            duration: config.duration,
            easing: Easing.out(Easing.cubic),
          },
          () => {
            if (onComplete) runOnJS(onComplete)();
          }
        );
        translateY.value = withTiming(config.startY + Math.sin(angle) * distance, {
          duration: config.duration,
          easing: Easing.out(Easing.cubic),
        });
        opacity.value = withDelay(
          config.duration * 0.5,
          withTiming(0, { duration: config.duration * 0.5 })
        );
        break;
      }

      case 'launch':
        // Launch upward with initial burst
        scale.value = withSequence(
          withSpring(1.2, { damping: 3 }),
          withTiming(0.6, { duration: config.duration * 0.7 })
        );
        translateY.value = withSequence(
          withTiming(config.startY - 50, { duration: 100, easing: Easing.out(Easing.cubic) }),
          withTiming(
            config.startY - 350,
            { duration: config.duration - 100, easing: Easing.out(Easing.quad) },
            () => {
              if (onComplete) runOnJS(onComplete)();
            }
          )
        );
        opacity.value = withDelay(
          config.duration * 0.6,
          withTiming(0, { duration: config.duration * 0.4 })
        );
        break;

      default:
        // Fallback to float
        console.warn(`Unsupported physics type: ${config.physics}, falling back to float`);
        scale.value = withSpring(1, { damping: 8 });
        translateY.value = withTiming(
          config.startY - 300,
          { duration: config.duration, easing: Easing.out(Easing.quad) },
          () => {
            if (onComplete) runOnJS(onComplete)();
          }
        );
        opacity.value = withDelay(
          config.duration * 0.7,
          withTiming(0, { duration: config.duration * 0.3 })
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.particle, animatedStyle]}>
      <Text style={styles.emoji}>{config.emoji}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
  emoji: {
    fontSize: 30,
  },
});
