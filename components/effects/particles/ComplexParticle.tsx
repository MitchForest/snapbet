import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { ParticleProps } from '@/types/effects';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ComplexParticle: React.FC<ParticleProps> = ({
  emoji,
  size,
  groupIndex,
  particleIndex,
  totalInGroup,
  config,
  onAnimationComplete,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  const { physics, duration, delay: configDelay } = config;
  const effectiveDuration = duration || 3000;
  const particleDelay = (configDelay || 0) + particleIndex * 50;

  useEffect(() => {
    switch (physics) {
      case 'rainbowArc': {
        // Create rainbow arc pattern
        const arcRadius = 200;
        const arcAngle = (particleIndex / totalInGroup) * Math.PI; // 0 to PI (half circle)
        translateX.value = -arcRadius + (particleIndex / totalInGroup) * arcRadius * 2;
        translateY.value = 0;
        opacity.value = withDelay(particleDelay, withTiming(1, { duration: 300 }));
        scale.value = withDelay(particleDelay, withSpring(1, { damping: 8, stiffness: 150 }));
        // Animate along arc path
        translateY.value = withDelay(
          particleDelay,
          withTiming(-Math.sin(arcAngle) * arcRadius, {
            duration: effectiveDuration,
            easing: Easing.inOut(Easing.ease),
          })
        );
        // Rainbow shimmer effect
        rotate.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(10, { duration: 500 }), withTiming(-10, { duration: 500 })),
            -1
          )
        );
        break;
      }

      case 'slideInLook': {
        const slideFromRight = particleIndex % 2 === 0;
        translateX.value = slideFromRight ? SCREEN_WIDTH / 2 : -SCREEN_WIDTH / 2;
        translateY.value = (particleIndex - totalInGroup / 2) * 50;
        opacity.value = 1;
        scale.value = 1;
        translateX.value = withDelay(
          particleDelay,
          withSequence(
            withSpring(0, { damping: 10, stiffness: 100 }),
            withDelay(
              500,
              withRepeat(
                withSequence(withTiming(20, { duration: 300 }), withTiming(-20, { duration: 300 })),
                2
              )
            ),
            withTiming(slideFromRight ? SCREEN_WIDTH / 2 : -SCREEN_WIDTH / 2, {
              duration: 500,
            })
          )
        );
        // "Looking" rotation
        rotate.value = withDelay(
          particleDelay + 500,
          withRepeat(
            withSequence(withTiming(30, { duration: 300 }), withTiming(-30, { duration: 300 })),
            2
          )
        );
        break;
      }

      case 'kissMotion': {
        const kissAngle = (particleIndex / totalInGroup) * Math.PI * 0.5 - Math.PI * 0.25;
        translateX.value = 0;
        translateY.value = -50;
        opacity.value = withDelay(particleDelay, withTiming(1, { duration: 200 }));
        scale.value = withDelay(
          particleDelay,
          withSequence(
            withSpring(1.5, { damping: 5, stiffness: 200 }),
            withTiming(0.8, { duration: effectiveDuration - 500 })
          )
        );
        // Curved kiss trajectory
        const kissDistance = 200;
        translateX.value = withDelay(
          particleDelay,
          withTiming(Math.cos(kissAngle) * kissDistance, {
            duration: effectiveDuration,
            easing: Easing.out(Easing.ease),
          })
        );
        translateY.value = withDelay(
          particleDelay,
          withTiming(-50 + Math.sin(kissAngle) * kissDistance, {
            duration: effectiveDuration,
            easing: Easing.out(Easing.ease),
          })
        );
        // Wobble effect
        rotate.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(15, { duration: 200 }), withTiming(-15, { duration: 200 })),
            -1
          )
        );
        break;
      }

      case 'cameraFlash':
        opacity.value = 0;
        scale.value = 0.1;
        translateX.value = (particleIndex - totalInGroup / 2) * 100;
        translateY.value = (groupIndex - 1) * 100;
        // Flash sequence
        opacity.value = withDelay(
          particleDelay,
          withSequence(
            withTiming(1, { duration: 50 }), // Instant flash
            withTiming(0.8, { duration: 100 }),
            withTiming(0, { duration: 500 })
          )
        );
        scale.value = withDelay(
          particleDelay,
          withSequence(
            withTiming(3, { duration: 50 }), // Expand quickly
            withTiming(2, { duration: 100 }),
            withTiming(1, { duration: 500 })
          )
        );
        break;

      case 'roboticMarch': {
        const marchX = (particleIndex - totalInGroup / 2) * 60;
        translateX.value = marchX;
        translateY.value = SCREEN_HEIGHT / 4;
        opacity.value = 1;
        scale.value = 1;
        // Marching motion
        translateY.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(SCREEN_HEIGHT / 4 - 30, { duration: 200 }),
              withTiming(SCREEN_HEIGHT / 4, { duration: 200 })
            ),
            -1
          )
        );
        // Robotic rotation
        rotate.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(-10, { duration: 200 }), withTiming(10, { duration: 200 })),
            -1
          )
        );
        // Forward march
        translateX.value = withDelay(
          particleDelay,
          withTiming(marchX + (particleIndex % 2 === 0 ? 100 : -100), {
            duration: effectiveDuration,
          })
        );
        break;
      }

      case 'twinkle': {
        const twinklePos = {
          x: (Math.random() - 0.5) * SCREEN_WIDTH * 0.8,
          y: (Math.random() - 0.5) * SCREEN_HEIGHT * 0.6,
        };
        translateX.value = twinklePos.x;
        translateY.value = twinklePos.y;
        // Twinkle animation
        opacity.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(0, { duration: 200 }),
              withTiming(1, { duration: 200 }),
              withTiming(0.3, { duration: 200 }),
              withTiming(1, { duration: 200 })
            ),
            -1
          )
        );
        scale.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(0.5, { duration: 400 }), withTiming(1.2, { duration: 400 })),
            -1
          )
        );
        rotate.value = withDelay(
          particleDelay,
          withRepeat(withTiming(360, { duration: 2000 }), -1)
        );
        break;
      }

      case 'holdStrong': {
        const holdX = (particleIndex - totalInGroup / 2) * 80;
        translateX.value = holdX;
        translateY.value = 0;
        opacity.value = 1;
        scale.value = withDelay(
          particleDelay,
          withSequence(
            withSpring(1.5, { damping: 5, stiffness: 200 }),
            withRepeat(
              withSequence(withTiming(1.4, { duration: 100 }), withTiming(1.6, { duration: 100 })),
              -1
            )
          )
        );
        // Strength vibration
        translateX.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(holdX + 3, { duration: 50 }),
              withTiming(holdX - 3, { duration: 50 })
            ),
            -1
          )
        );
        break;
      }

      case 'intensifySweat': {
        const sweatX = (particleIndex - totalInGroup / 2) * 40;
        translateX.value = sweatX;
        translateY.value = -SCREEN_HEIGHT / 3;
        opacity.value = withDelay(particleDelay, withTiming(1, { duration: 200 }));
        // Intensifying drops
        scale.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(0.5, { duration: 500 }), withTiming(1.5, { duration: 500 })),
            -1
          )
        );
        // Accelerating fall
        translateY.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(SCREEN_HEIGHT / 2, {
                duration: 1000,
                easing: Easing.in(Easing.quad),
              }),
              withTiming(-SCREEN_HEIGHT / 3, { duration: 0 })
            ),
            -1
          )
        );
        break;
      }

      case 'spiralDown': {
        // Spiral downward motion
        const spiralRadius = 100;
        const spiralSpeed = 2000;
        opacity.value = 1;
        scale.value = 1;
        // Simplified spiral - just move down with rotation
        translateY.value = withDelay(
          particleDelay,
          withTiming(SCREEN_HEIGHT, {
            duration: spiralSpeed,
            easing: Easing.linear,
          })
        );
        translateX.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(spiralRadius, { duration: spiralSpeed / 4 }),
              withTiming(-spiralRadius, { duration: spiralSpeed / 4 })
            ),
            4
          )
        );
        rotate.value = withDelay(particleDelay, withTiming(720, { duration: spiralSpeed }));
        break;
      }

      case 'formAmount': {
        const amountPositions = [
          // $ symbol
          { x: -80, y: -20 },
          { x: -80, y: 0 },
          { x: -80, y: 20 },
          { x: -60, y: -30 },
          { x: -60, y: 30 },
          // Numbers
          { x: -20, y: -20 },
          { x: -20, y: 0 },
          { x: -20, y: 20 },
          { x: 20, y: -20 },
          { x: 20, y: 0 },
          { x: 20, y: 20 },
          { x: 60, y: -20 },
          { x: 60, y: 0 },
          { x: 60, y: 20 },
        ];
        const amountPos = amountPositions[particleIndex % amountPositions.length];
        opacity.value = withDelay(particleDelay, withTiming(1, { duration: 300 }));
        translateX.value = withDelay(
          particleDelay,
          withSpring(amountPos.x, { damping: 10, stiffness: 100 })
        );
        translateY.value = withDelay(
          particleDelay,
          withSpring(amountPos.y, { damping: 10, stiffness: 100 })
        );
        scale.value = withDelay(
          particleDelay,
          withSequence(
            withSpring(1.2, { damping: 8, stiffness: 150 }),
            withTiming(1, { duration: 300 })
          )
        );
        break;
      }

      case 'lightningStrike': {
        const lightningPath = particleIndex / totalInGroup;
        translateX.value = (lightningPath - 0.5) * 200 + (Math.random() - 0.5) * 50;
        translateY.value = -SCREEN_HEIGHT / 2;
        opacity.value = 0;
        scale.value = 1;
        // Lightning flash
        opacity.value = withDelay(
          particleDelay + lightningPath * 100,
          withSequence(
            withTiming(1, { duration: 50 }),
            withTiming(0.5, { duration: 50 }),
            withTiming(1, { duration: 50 }),
            withTiming(0, { duration: 200 })
          )
        );
        translateY.value = withDelay(
          particleDelay + lightningPath * 100,
          withTiming(SCREEN_HEIGHT / 2, {
            duration: 300,
            easing: Easing.linear,
          })
        );
        break;
      }

      case 'moonLaunch': {
        const launchX = (particleIndex - totalInGroup / 2) * 30;
        translateX.value = launchX;
        translateY.value = SCREEN_HEIGHT / 4;
        opacity.value = 1;
        scale.value = 0.5;
        // Launch sequence
        scale.value = withDelay(
          particleDelay,
          withSequence(
            withSpring(1.5, { damping: 5, stiffness: 300 }),
            withTiming(0.3, { duration: effectiveDuration - 500 })
          )
        );
        translateY.value = withDelay(
          particleDelay,
          withSequence(
            withSpring(-SCREEN_HEIGHT / 2, {
              damping: 8,
              stiffness: 100,
              velocity: 500,
            }),
            withTiming(-SCREEN_HEIGHT, {
              duration: 1000,
              easing: Easing.out(Easing.quad),
            })
          )
        );
        // Slight arc
        translateX.value = withDelay(
          particleDelay,
          withTiming(launchX + (particleIndex % 2 === 0 ? 50 : -50), {
            duration: effectiveDuration,
            easing: Easing.inOut(Easing.ease),
          })
        );
        rotate.value = withDelay(particleDelay, withRepeat(withTiming(360, { duration: 500 }), -1));
        break;
      }

      case 'alertOpen': {
        const alertRadius = 150;
        const alertAngle = (particleIndex / totalInGroup) * Math.PI * 2;
        translateX.value = 0;
        translateY.value = 0;
        opacity.value = 0;
        scale.value = 0;
        // Alert expansion
        opacity.value = withDelay(
          particleDelay,
          withSequence(
            withTiming(1, { duration: 100 }),
            withTiming(1, { duration: effectiveDuration - 200 }),
            withTiming(0, { duration: 100 })
          )
        );
        scale.value = withDelay(particleDelay, withSpring(1, { damping: 6, stiffness: 200 }));
        translateX.value = withDelay(
          particleDelay,
          withSpring(Math.cos(alertAngle) * alertRadius, {
            damping: 8,
            stiffness: 150,
          })
        );
        translateY.value = withDelay(
          particleDelay,
          withSpring(Math.sin(alertAngle) * alertRadius, {
            damping: 8,
            stiffness: 150,
          })
        );
        // Pulsing alert
        scale.value = withDelay(
          particleDelay + 500,
          withRepeat(
            withSequence(withTiming(1.2, { duration: 300 }), withTiming(0.8, { duration: 300 })),
            3
          )
        );
        break;
      }

      case 'clockCountdown': {
        const clockRadius = 120;
        const clockAngle = ((12 - particleIndex) / 12) * Math.PI * 2 - Math.PI / 2;
        translateX.value = Math.cos(clockAngle) * clockRadius;
        translateY.value = Math.sin(clockAngle) * clockRadius;
        opacity.value = withDelay(particleIndex * 100, withTiming(1, { duration: 200 }));
        scale.value = withDelay(
          particleIndex * 100,
          withSequence(
            withSpring(1.3, { damping: 5, stiffness: 200 }),
            withTiming(1, { duration: 300 })
          )
        );
        // Countdown disappear
        opacity.value = withDelay(
          particleDelay + 1000 + particleIndex * 100,
          withTiming(0, { duration: 300 })
        );
        scale.value = withDelay(
          particleDelay + 1000 + particleIndex * 100,
          withTiming(0, { duration: 300 })
        );
        break;
      }

      default:
        // Fallback to float
        opacity.value = 1;
        scale.value = 1;
        translateY.value = withDelay(
          particleDelay,
          withTiming(-SCREEN_HEIGHT, {
            duration: effectiveDuration,
            easing: Easing.linear,
          })
        );
        console.warn(`ComplexParticle: Unknown physics type "${physics}", falling back to float`);
    }

    // Handle animation completion
    if (onAnimationComplete) {
      setTimeout(() => {
        runOnJS(onAnimationComplete)();
      }, effectiveDuration + particleDelay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [physics, effectiveDuration, particleDelay, particleIndex, totalInGroup, groupIndex]);

  const animatedStyle = useAnimatedStyle(() => {
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
      <Animated.Text style={[styles.emoji, { fontSize: size }]}>{emoji}</Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
});
