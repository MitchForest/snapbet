import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { ParticleConfig } from '@/types/effects';

interface AnimatedParticleProps {
  config: ParticleConfig;
  onComplete?: () => void;
}

export function AnimatedParticle({ config, onComplete }: AnimatedParticleProps) {
  const translateX = useSharedValue(config.startX);
  const translateY = useSharedValue(config.startY);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    switch (config.physics) {
      case 'bounce':
        // Bouncing motion with decay
        scale.value = withSpring(1, { damping: 6 });
        translateY.value = withSequence(
          withTiming(config.startY - 200, { duration: 400, easing: Easing.out(Easing.quad) }),
          withTiming(config.startY, { duration: 300, easing: Easing.in(Easing.quad) }),
          withTiming(config.startY - 100, { duration: 300, easing: Easing.out(Easing.quad) }),
          withTiming(config.startY, { duration: 200, easing: Easing.in(Easing.quad) }),
          withTiming(config.startY - 50, { duration: 200, easing: Easing.out(Easing.quad) }),
          withTiming(config.startY, { duration: 150, easing: Easing.in(Easing.quad) }, () => {
            if (onComplete) runOnJS(onComplete)();
          })
        );
        opacity.value = withDelay(
          config.duration * 0.8,
          withTiming(0, { duration: config.duration * 0.2 })
        );
        break;

      case 'spinAway': {
        // Spin and fly away
        scale.value = withSpring(1, { damping: 8 });
        rotate.value = withTiming(720, { duration: config.duration, easing: Easing.linear });
        const spinAngle = Math.random() * Math.PI * 2;
        translateX.value = withTiming(config.startX + Math.cos(spinAngle) * 300, {
          duration: config.duration,
          easing: Easing.out(Easing.cubic),
        });
        translateY.value = withTiming(
          config.startY + Math.sin(spinAngle) * 300,
          {
            duration: config.duration,
            easing: Easing.out(Easing.cubic),
          },
          () => {
            if (onComplete) runOnJS(onComplete)();
          }
        );
        opacity.value = withDelay(
          config.duration * 0.6,
          withTiming(0, { duration: config.duration * 0.4 })
        );
        break;
      }

      case 'zoomDance':
        // Zoom in and dance around
        scale.value = withSequence(
          withSpring(2, { damping: 4 }),
          withRepeat(
            withSequence(withTiming(1.5, { duration: 200 }), withTiming(2, { duration: 200 })),
            3
          )
        );
        translateX.value = withRepeat(
          withSequence(
            withTiming(config.startX + 30, { duration: 250 }),
            withTiming(config.startX - 30, { duration: 250 })
          ),
          4
        );
        translateY.value = withRepeat(
          withSequence(
            withTiming(config.startY - 20, { duration: 250 }),
            withTiming(config.startY + 20, { duration: 250 })
          ),
          4,
          false,
          () => {
            if (onComplete) runOnJS(onComplete)();
          }
        );
        opacity.value = withDelay(
          config.duration * 0.8,
          withTiming(0, { duration: config.duration * 0.2 })
        );
        break;

      case 'swirl':
        // Swirling motion
        scale.value = withSpring(1, { damping: 10 });
        translateX.value = withTiming(config.startX, { duration: 0 });
        translateY.value = withTiming(config.startY - 200, { duration: config.duration }, () => {
          if (onComplete) runOnJS(onComplete)();
        });
        // Swirl effect is handled in animated style
        break;

      case 'wave':
        // Wave motion
        scale.value = withSpring(1, { damping: 12 });
        translateY.value = withTiming(
          config.startY - 300,
          { duration: config.duration, easing: Easing.linear },
          () => {
            if (onComplete) runOnJS(onComplete)();
          }
        );
        translateX.value = withRepeat(
          withSequence(
            withTiming(config.startX + 50, { duration: 500, easing: Easing.inOut(Easing.sin) }),
            withTiming(config.startX - 50, { duration: 500, easing: Easing.inOut(Easing.sin) })
          ),
          Math.floor(config.duration / 1000)
        );
        opacity.value = withDelay(
          config.duration * 0.7,
          withTiming(0, { duration: config.duration * 0.3 })
        );
        break;

      case 'pulse':
        // Pulsing scale effect
        scale.value = withRepeat(
          withSequence(
            withTiming(1.5, { duration: 300, easing: Easing.out(Easing.quad) }),
            withTiming(0.8, { duration: 300, easing: Easing.in(Easing.quad) })
          ),
          Math.floor(config.duration / 600),
          false,
          () => {
            if (onComplete) runOnJS(onComplete)();
          }
        );
        translateY.value = withTiming(config.startY - 200, {
          duration: config.duration,
          easing: Easing.out(Easing.quad),
        });
        opacity.value = withDelay(
          config.duration * 0.8,
          withTiming(0, { duration: config.duration * 0.2 })
        );
        break;

      case 'shake':
        // Shaking motion
        scale.value = withSpring(1, { damping: 8 });
        translateX.value = withRepeat(
          withSequence(
            withTiming(config.startX + 10, { duration: 50 }),
            withTiming(config.startX - 10, { duration: 50 })
          ),
          Math.floor(config.duration / 100),
          false,
          () => {
            if (onComplete) runOnJS(onComplete)();
          }
        );
        translateY.value = withTiming(config.startY - 100, { duration: config.duration });
        opacity.value = withDelay(
          config.duration * 0.8,
          withTiming(0, { duration: config.duration * 0.2 })
        );
        break;

      case 'rotate':
        // Simple rotation
        scale.value = withSpring(1, { damping: 10 });
        rotate.value = withRepeat(
          withTiming(360, { duration: 1000, easing: Easing.linear }),
          Math.floor(config.duration / 1000),
          false,
          () => {
            if (onComplete) runOnJS(onComplete)();
          }
        );
        translateY.value = withTiming(config.startY - 250, {
          duration: config.duration,
          easing: Easing.out(Easing.quad),
        });
        opacity.value = withDelay(
          config.duration * 0.7,
          withTiming(0, { duration: config.duration * 0.3 })
        );
        break;

      case 'fadeIn':
        // Fade in with scale
        opacity.value = 0;
        scale.value = 0.5;
        opacity.value = withTiming(1, { duration: 500 });
        scale.value = withSpring(1, { damping: 6 });
        translateY.value = withDelay(
          500,
          withTiming(
            config.startY - 200,
            { duration: config.duration - 500, easing: Easing.out(Easing.quad) },
            () => {
              if (onComplete) runOnJS(onComplete)();
            }
          )
        );
        opacity.value = withDelay(
          config.duration * 0.8,
          withTiming(0, { duration: config.duration * 0.2 })
        );
        break;

      case 'slideIn':
        // Slide in from side
        translateX.value = config.startX + 200;
        scale.value = withSpring(1, { damping: 8 });
        translateX.value = withSpring(config.startX, { damping: 10 });
        translateY.value = withDelay(
          300,
          withTiming(
            config.startY - 200,
            { duration: config.duration - 300, easing: Easing.out(Easing.quad) },
            () => {
              if (onComplete) runOnJS(onComplete)();
            }
          )
        );
        opacity.value = withDelay(
          config.duration * 0.7,
          withTiming(0, { duration: config.duration * 0.3 })
        );
        break;

      default:
        // Fallback to bounce
        console.warn(`Unsupported physics type: ${config.physics}, falling back to bounce`);
        scale.value = withSpring(1, { damping: 6 });
        translateY.value = withSequence(
          withTiming(config.startY - 200, { duration: 400, easing: Easing.out(Easing.quad) }),
          withTiming(config.startY, { duration: 300, easing: Easing.in(Easing.quad) }, () => {
            if (onComplete) runOnJS(onComplete)();
          })
        );
        opacity.value = withDelay(
          config.duration * 0.8,
          withTiming(0, { duration: config.duration * 0.2 })
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    if (config.physics === 'swirl') {
      // Special handling for swirl physics
      const angle = translateY.value * 0.02;
      const swirlX = Math.cos(angle) * 100;
      return {
        transform: [
          { translateX: translateX.value + swirlX },
          { translateY: translateY.value },
          { scale: scale.value },
          { rotate: `${rotate.value}deg` },
        ],
        opacity: opacity.value,
      };
    }

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotate.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

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
