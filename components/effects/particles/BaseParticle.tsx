import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
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
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);

  // Add variance to make each particle unique
  const durationVariance = 0.8 + Math.random() * 0.4; // 80% to 120% of base duration
  const sizeVariance = 0.9 + Math.random() * 0.2; // 90% to 110% of base size

  useEffect(() => {
    // Entry animation - fade in with scale
    opacity.value = withTiming(1, { duration: 200 });

    const effectiveDuration = config.duration * durationVariance;

    // Start animations based on physics type
    switch (config.physics) {
      case 'float': {
        // Enhanced floating with natural sway and rotation
        scale.value = withSpring(sizeVariance, { damping: 8, stiffness: 120 });

        // Natural floating motion with sine wave
        const swayAmount = 30 + Math.random() * 20;
        translateX.value = withRepeat(
          withSequence(
            withTiming(config.startX + swayAmount, {
              duration: effectiveDuration / 3,
              easing: Easing.inOut(Easing.sin),
            }),
            withTiming(config.startX - swayAmount, {
              duration: effectiveDuration / 3,
              easing: Easing.inOut(Easing.sin),
            })
          ),
          -1,
          true
        );

        translateY.value = withTiming(
          config.startY - 300 - Math.random() * 100,
          { duration: effectiveDuration, easing: Easing.out(Easing.quad) },
          () => {
            if (onComplete) runOnJS(onComplete)();
          }
        );

        // Add gentle rotation
        rotate.value = withRepeat(
          withTiming(360, { duration: effectiveDuration * 1.5, easing: Easing.linear }),
          -1
        );

        opacity.value = withDelay(
          effectiveDuration * 0.7,
          withTiming(0, { duration: effectiveDuration * 0.3 })
        );
        break;
      }

      case 'floatUp': {
        // Enhanced upward float with subtle wobble
        scale.value = withSequence(
          withSpring(sizeVariance * 1.2, { damping: 5, stiffness: 200 }),
          withSpring(sizeVariance, { damping: 10 })
        );

        // Add slight horizontal wobble
        const wobbleAmount = 10 + Math.random() * 10;
        translateX.value = withRepeat(
          withSequence(
            withTiming(config.startX + wobbleAmount, { duration: 300 }),
            withTiming(config.startX - wobbleAmount, { duration: 300 })
          ),
          Math.floor(effectiveDuration / 600)
        );

        translateY.value = withTiming(
          config.startY - 400 - Math.random() * 100,
          { duration: effectiveDuration, easing: Easing.out(Easing.cubic) },
          () => {
            if (onComplete) runOnJS(onComplete)();
          }
        );

        // Slow rotation
        rotate.value = withTiming(180 + Math.random() * 180, {
          duration: effectiveDuration,
          easing: Easing.inOut(Easing.ease),
        });

        opacity.value = withDelay(
          effectiveDuration * 0.8,
          withTiming(0, { duration: effectiveDuration * 0.2 })
        );
        break;
      }

      case 'fall': {
        // Enhanced falling with realistic physics
        scale.value = withSequence(
          withSpring(sizeVariance * 0.8, { damping: 5 }),
          withSpring(sizeVariance, { damping: 12 })
        );

        // Add air resistance drift
        const driftAmount = (Math.random() - 0.5) * 40;
        translateX.value = withTiming(config.startX + driftAmount, {
          duration: effectiveDuration,
          easing: Easing.out(Easing.sin),
        });

        translateY.value = withTiming(
          config.startY + 400 + Math.random() * 100,
          { duration: effectiveDuration, easing: Easing.in(Easing.quad) },
          () => {
            if (onComplete) runOnJS(onComplete)();
          }
        );

        // Tumbling rotation
        rotate.value = withTiming((Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360), {
          duration: effectiveDuration,
          easing: Easing.linear,
        });

        // Add bounce effect at the end
        scale.value = withDelay(
          effectiveDuration * 0.9,
          withSequence(
            withSpring(sizeVariance * 1.2, { damping: 3 }),
            withSpring(0, { damping: 10 })
          )
        );

        opacity.value = withDelay(
          effectiveDuration * 0.7,
          withTiming(0, { duration: effectiveDuration * 0.3 })
        );
        break;
      }

      case 'explode': {
        // Enhanced explosion with shockwave effect
        const angle = Math.random() * Math.PI * 2;
        const distance = 150 + Math.random() * 150;
        const explosionDelay = Math.random() * 100; // Stagger explosions

        // Initial shockwave scale
        scale.value = withDelay(
          explosionDelay,
          withSequence(
            withSpring(sizeVariance * 1.8, { damping: 3, stiffness: 300 }),
            withTiming(sizeVariance * 0.6, { duration: effectiveDuration * 0.8 })
          )
        );

        translateX.value = withDelay(
          explosionDelay,
          withTiming(
            config.startX + Math.cos(angle) * distance,
            {
              duration: effectiveDuration,
              easing: Easing.out(Easing.exp),
            },
            () => {
              if (onComplete) runOnJS(onComplete)();
            }
          )
        );

        translateY.value = withDelay(
          explosionDelay,
          withTiming(config.startY + Math.sin(angle) * distance, {
            duration: effectiveDuration,
            easing: Easing.out(Easing.exp),
          })
        );

        // Spin during explosion
        rotate.value = withDelay(
          explosionDelay,
          withTiming(360 * (1 + Math.random()), {
            duration: effectiveDuration,
            easing: Easing.out(Easing.cubic),
          })
        );

        opacity.value = withDelay(
          explosionDelay + effectiveDuration * 0.3,
          withTiming(0, { duration: effectiveDuration * 0.7, easing: Easing.in(Easing.quad) })
        );
        break;
      }

      case 'launch': {
        // Enhanced rocket launch with thrust effect
        const launchAngle = (Math.random() - 0.5) * 0.3; // Slight angle variation

        // Initial thrust scale
        scale.value = withSequence(
          withSpring(sizeVariance * 1.5, { damping: 2, stiffness: 300 }),
          withTiming(sizeVariance * 0.5, { duration: effectiveDuration * 0.8 })
        );

        // Launch trajectory with acceleration
        translateY.value = withSequence(
          withSpring(config.startY - 80, { damping: 5, stiffness: 200 }),
          withTiming(
            config.startY - 450 - Math.random() * 100,
            { duration: effectiveDuration - 200, easing: Easing.out(Easing.exp) },
            () => {
              if (onComplete) runOnJS(onComplete)();
            }
          )
        );

        // Slight horizontal drift based on launch angle
        translateX.value = withTiming(config.startX + Math.sin(launchAngle) * 100, {
          duration: effectiveDuration,
          easing: Easing.out(Easing.quad),
        });

        // Spin accelerating during launch
        rotate.value = withTiming(720 + Math.random() * 360, {
          duration: effectiveDuration,
          easing: Easing.in(Easing.cubic),
        });

        opacity.value = withDelay(
          effectiveDuration * 0.5,
          withTiming(0, { duration: effectiveDuration * 0.5, easing: Easing.out(Easing.exp) })
        );
        break;
      }

      case 'gentleFloat': {
        // Very slow, peaceful floating
        scale.value = withSpring(sizeVariance, { damping: 15, stiffness: 80 });

        const gentleSway = 15 + Math.random() * 10;
        translateX.value = withRepeat(
          withTiming(config.startX + gentleSway * (Math.random() > 0.5 ? 1 : -1), {
            duration: effectiveDuration * 0.8,
            easing: Easing.inOut(Easing.sin),
          }),
          -1,
          true
        );

        translateY.value = withTiming(
          config.startY - 200 - Math.random() * 50,
          { duration: effectiveDuration * 1.5, easing: Easing.out(Easing.sin) },
          () => {
            if (onComplete) runOnJS(onComplete)();
          }
        );

        // Very slow rotation
        rotate.value = withRepeat(
          withTiming(30, { duration: effectiveDuration * 2, easing: Easing.inOut(Easing.sin) }),
          -1,
          true
        );

        opacity.value = withDelay(
          effectiveDuration * 0.8,
          withTiming(0, { duration: effectiveDuration * 0.4 })
        );
        break;
      }

      case 'slideDown': {
        // Slide down with style
        scale.value = withSequence(
          withSpring(sizeVariance * 1.3, { damping: 5 }),
          withSpring(sizeVariance, { damping: 10 })
        );

        translateY.value = withSequence(
          withTiming(config.startY + 50, { duration: 200, easing: Easing.out(Easing.cubic) }),
          withTiming(
            config.startY + 300,
            { duration: effectiveDuration - 200, easing: Easing.inOut(Easing.cubic) },
            () => {
              if (onComplete) runOnJS(onComplete)();
            }
          )
        );

        // Slide with slight angle
        translateX.value = withTiming(config.startX + (Math.random() - 0.5) * 60, {
          duration: effectiveDuration,
          easing: Easing.out(Easing.cubic),
        });

        // Cool rotation effect
        rotate.value = withSequence(
          withTiming(-15, { duration: 200 }),
          withTiming(15, { duration: effectiveDuration - 200 })
        );

        opacity.value = withDelay(
          effectiveDuration * 0.7,
          withTiming(0, { duration: effectiveDuration * 0.3 })
        );
        break;
      }

      case 'lookAround': {
        // Curious looking around motion
        scale.value = withSpring(sizeVariance, { damping: 8 });

        // Look left and right
        translateX.value = withSequence(
          withTiming(config.startX - 40, { duration: 400, easing: Easing.out(Easing.cubic) }),
          withTiming(config.startX + 40, { duration: 600, easing: Easing.inOut(Easing.cubic) }),
          withTiming(config.startX, { duration: 400, easing: Easing.out(Easing.cubic) })
        );

        // Slight up and down motion
        translateY.value = withRepeat(
          withSequence(
            withTiming(config.startY - 10, { duration: 500 }),
            withTiming(config.startY + 10, { duration: 500 })
          ),
          Math.floor(effectiveDuration / 1000)
        );

        // Tilt while looking
        rotate.value = withSequence(
          withTiming(-20, { duration: 400 }),
          withTiming(20, { duration: 600 }),
          withTiming(0, { duration: 400 })
        );

        opacity.value = withDelay(
          effectiveDuration * 0.8,
          withTiming(0, { duration: effectiveDuration * 0.2 })
        );

        setTimeout(() => {
          if (onComplete) runOnJS(onComplete)();
        }, effectiveDuration);
        break;
      }

      case 'riseUp': {
        // Triumphant rise with emphasis
        scale.value = withSequence(
          withSpring(sizeVariance * 0.5, { damping: 5 }),
          withSpring(sizeVariance * 1.4, { damping: 6, stiffness: 150 }),
          withSpring(sizeVariance, { damping: 10 })
        );

        translateY.value = withTiming(
          config.startY - 350 - Math.random() * 50,
          { duration: effectiveDuration, easing: Easing.out(Easing.exp) },
          () => {
            if (onComplete) runOnJS(onComplete)();
          }
        );

        // Slight zigzag on the way up
        translateX.value = withSequence(
          withTiming(config.startX + 20, { duration: effectiveDuration / 3 }),
          withTiming(config.startX - 20, { duration: effectiveDuration / 3 }),
          withTiming(config.startX, { duration: effectiveDuration / 3 })
        );

        // Victory spin
        rotate.value = withTiming(360, {
          duration: effectiveDuration,
          easing: Easing.out(Easing.cubic),
        });

        opacity.value = withDelay(
          effectiveDuration * 0.7,
          withTiming(0, { duration: effectiveDuration * 0.3 })
        );
        break;
      }

      default:
        // Fallback to enhanced float
        console.warn(`Unsupported physics type: ${config.physics}, falling back to float`);
        scale.value = withSpring(sizeVariance, { damping: 8 });
        translateY.value = withTiming(
          config.startY - 300,
          { duration: effectiveDuration, easing: Easing.out(Easing.quad) },
          () => {
            if (onComplete) runOnJS(onComplete)();
          }
        );
        rotate.value = withTiming(180, { duration: effectiveDuration });
        opacity.value = withDelay(
          effectiveDuration * 0.7,
          withTiming(0, { duration: effectiveDuration * 0.3 })
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
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
