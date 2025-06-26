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

export const ExpressiveParticle: React.FC<ParticleProps> = ({
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
  const effectiveDuration = duration || 2000;
  const particleDelay = (configDelay || 0) + particleIndex * 50;

  useEffect(() => {
    const startX = Math.random() * SCREEN_WIDTH - SCREEN_WIDTH / 2;

    switch (physics) {
      case 'crashDown':
        translateY.value = -SCREEN_HEIGHT / 2;
        translateX.value = startX;
        opacity.value = 1;
        scale.value = withSequence(
          withTiming(1.5, { duration: 200 }),
          withTiming(1, { duration: 100 })
        );
        translateY.value = withDelay(
          particleDelay,
          withSequence(
            withSpring(SCREEN_HEIGHT / 2, {
              damping: 5,
              stiffness: 150,
              velocity: 100,
            }),
            withTiming(SCREEN_HEIGHT / 2 + 20, { duration: 100 }),
            withTiming(SCREEN_HEIGHT / 2, { duration: 100 })
          )
        );
        translateX.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(startX + 10, { duration: 50 }),
              withTiming(startX - 10, { duration: 50 })
            ),
            3
          )
        );
        break;

      case 'headExplode': {
        const explodeAngle = (particleIndex / totalInGroup) * Math.PI * 2;
        const explodeRadius = 150 + Math.random() * 100;
        translateY.value = -SCREEN_HEIGHT / 4; // Head area
        translateX.value = 0;
        opacity.value = 1;
        scale.value = withDelay(
          particleDelay,
          withSequence(
            withTiming(2, { duration: 100 }),
            withTiming(0.5, { duration: effectiveDuration - 100 })
          )
        );
        translateX.value = withDelay(
          particleDelay,
          withSpring(Math.cos(explodeAngle) * explodeRadius, {
            damping: 8,
            stiffness: 100,
          })
        );
        translateY.value = withDelay(
          particleDelay,
          withSpring(-SCREEN_HEIGHT / 4 + Math.sin(explodeAngle) * explodeRadius, {
            damping: 8,
            stiffness: 100,
          })
        );
        rotate.value = withDelay(particleDelay, withRepeat(withTiming(360, { duration: 500 }), -1));
        break;
      }

      case 'sweatDrop':
        translateY.value = -SCREEN_HEIGHT / 3;
        translateX.value = (particleIndex - totalInGroup / 2) * 30;
        opacity.value = withDelay(particleDelay, withTiming(1, { duration: 200 }));
        scale.value = withDelay(
          particleDelay,
          withSequence(
            withTiming(0.5, { duration: 100 }),
            withTiming(1.2, { duration: 200 }),
            withTiming(1, { duration: 100 })
          )
        );
        translateY.value = withDelay(
          particleDelay,
          withTiming(SCREEN_HEIGHT / 2, {
            duration: effectiveDuration,
            easing: Easing.in(Easing.quad),
          })
        );
        break;

      case 'victoryDance': {
        const danceX = (particleIndex - totalInGroup / 2) * 50;
        translateX.value = danceX;
        translateY.value = 0;
        opacity.value = 1;
        scale.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(1.3, { duration: 200 }), withTiming(0.8, { duration: 200 })),
            -1
          )
        );
        translateY.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withSpring(-100, { damping: 5, stiffness: 200 }),
              withSpring(0, { damping: 5, stiffness: 200 })
            ),
            -1
          )
        );
        rotate.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(-30, { duration: 200 }), withTiming(30, { duration: 200 })),
            -1
          )
        );
        break;
      }

      case 'angerBurst': {
        const burstAngle = (particleIndex / totalInGroup) * Math.PI * 2;
        translateX.value = 0;
        translateY.value = 0;
        opacity.value = 1;
        scale.value = withDelay(
          particleDelay,
          withSequence(withTiming(2, { duration: 100 }), withTiming(1, { duration: 300 }))
        );
        const burstRadius = 200;
        translateX.value = withDelay(
          particleDelay,
          withSequence(
            withSpring(Math.cos(burstAngle) * burstRadius, {
              damping: 4,
              stiffness: 300,
              velocity: 50,
            }),
            withRepeat(
              withSequence(
                withTiming(Math.cos(burstAngle) * burstRadius + 5, { duration: 50 }),
                withTiming(Math.cos(burstAngle) * burstRadius - 5, { duration: 50 })
              ),
              3
            )
          )
        );
        translateY.value = withDelay(
          particleDelay,
          withSpring(Math.sin(burstAngle) * burstRadius, {
            damping: 4,
            stiffness: 300,
            velocity: 50,
          })
        );
        break;
      }

      case 'popIn': {
        opacity.value = 0;
        scale.value = 0;
        const popX = (particleIndex - totalInGroup / 2) * 60;
        const popY = (groupIndex - 1) * 80;
        translateX.value = popX;
        translateY.value = popY;
        opacity.value = withDelay(particleDelay, withTiming(1, { duration: 100 }));
        scale.value = withDelay(
          particleDelay,
          withSpring(1, {
            damping: 4,
            stiffness: 200,
            overshootClamping: false,
          })
        );
        rotate.value = withDelay(
          particleDelay,
          withSequence(
            withTiming(10, { duration: 100 }),
            withTiming(-10, { duration: 100 }),
            withTiming(0, { duration: 100 })
          )
        );
        break;
      }

      case 'formF': {
        const fPositions = [
          // Vertical line
          { x: -50, y: -100 },
          { x: -50, y: -50 },
          { x: -50, y: 0 },
          { x: -50, y: 50 },
          { x: -50, y: 100 },
          // Top horizontal
          { x: -50, y: -100 },
          { x: 0, y: -100 },
          { x: 50, y: -100 },
          // Middle horizontal
          { x: -50, y: 0 },
          { x: 0, y: 0 },
          { x: 25, y: 0 },
        ];
        const fPos = fPositions[particleIndex % fPositions.length];
        translateX.value = withDelay(
          particleDelay,
          withSpring(fPos.x, { damping: 10, stiffness: 100 })
        );
        translateY.value = withDelay(
          particleDelay,
          withSpring(fPos.y, { damping: 10, stiffness: 100 })
        );
        opacity.value = withDelay(particleDelay, withTiming(1, { duration: 300 }));
        scale.value = withDelay(particleDelay, withSpring(1, { damping: 8, stiffness: 150 }));
        break;
      }

      case 'sportsBounce': {
        const bounceX = (particleIndex - totalInGroup / 2) * 80;
        translateX.value = bounceX;
        translateY.value = -SCREEN_HEIGHT / 2;
        opacity.value = 1;
        scale.value = 1;
        translateY.value = withDelay(
          particleDelay,
          withSequence(
            withTiming(SCREEN_HEIGHT / 4, {
              duration: 500,
              easing: Easing.in(Easing.quad),
            }),
            withRepeat(
              withSequence(
                withTiming(-50, {
                  duration: 400,
                  easing: Easing.out(Easing.quad),
                }),
                withTiming(SCREEN_HEIGHT / 4, {
                  duration: 400,
                  easing: Easing.in(Easing.quad),
                })
              ),
              2
            )
          )
        );
        rotate.value = withDelay(
          particleDelay,
          withRepeat(withTiming(360, { duration: 1000 }), -1)
        );
        scale.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(1, { duration: 400 }),
              withTiming(1.1, { duration: 50 }),
              withTiming(0.9, { duration: 50 }),
              withTiming(1, { duration: 100 })
            ),
            -1
          )
        );
        break;
      }

      case 'chaosCircle': {
        const radius = 100 + Math.random() * 50;
        const speed = 1000 + Math.random() * 500;
        opacity.value = 1;
        scale.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(1.5, { duration: 200 }), withTiming(0.8, { duration: 200 })),
            -1
          )
        );
        // Create chaotic circular motion
        rotate.value = withDelay(
          particleDelay,
          withRepeat(
            withTiming(360, {
              duration: speed,
              easing: Easing.linear,
            }),
            -1
          )
        );
        // Move in chaotic pattern
        translateX.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(radius, { duration: speed / 4 }),
              withTiming(0, { duration: speed / 4 }),
              withTiming(-radius, { duration: speed / 4 }),
              withTiming(0, { duration: speed / 4 })
            ),
            -1
          )
        );
        translateY.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(0, { duration: speed / 4 }),
              withTiming(radius, { duration: speed / 4 }),
              withTiming(0, { duration: speed / 4 }),
              withTiming(-radius, { duration: speed / 4 })
            ),
            -1
          )
        );
        break;
      }

      case 'temperatureFlux':
        translateX.value = (particleIndex - totalInGroup / 2) * 40;
        opacity.value = 1;
        scale.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(1.3, { duration: 1000 }), // Hot - expand
              withTiming(0.7, { duration: 1000 }) // Cold - contract
            ),
            -1
          )
        );
        translateY.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(-100, { duration: 1000 }), // Hot - rise
              withTiming(100, { duration: 1000 }) // Cold - fall
            ),
            -1
          )
        );
        rotate.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(180, { duration: 1000 }), withTiming(0, { duration: 1000 })),
            -1
          )
        );
        break;

      case 'saltPour': {
        const saltSpread = 30;
        translateX.value = (Math.random() - 0.5) * saltSpread;
        translateY.value = -SCREEN_HEIGHT / 3;
        opacity.value = withDelay(
          particleDelay,
          withSequence(
            withTiming(1, { duration: 100 }),
            withTiming(1, { duration: effectiveDuration - 200 }),
            withTiming(0, { duration: 100 })
          )
        );
        scale.value = 0.3 + Math.random() * 0.4;
        translateY.value = withDelay(
          particleDelay,
          withTiming(SCREEN_HEIGHT / 2, {
            duration: effectiveDuration,
            easing: Easing.in(Easing.linear),
          })
        );
        // Slight sideways drift
        translateX.value = withDelay(
          particleDelay,
          withTiming(translateX.value + (Math.random() - 0.5) * 20, {
            duration: effectiveDuration,
          })
        );
        break;
      }

      case 'flexPump': {
        // Muscle flex animation - pump up and show off
        const flexX = particleIndex === 0 ? -80 : 80; // Two arms flexing
        translateX.value = flexX;
        translateY.value = 0;
        opacity.value = 1;

        // Continuous flexing motion
        scale.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(0.8, { duration: 300 }),
              withSpring(1.5, { damping: 4, stiffness: 200 }),
              withTiming(1.2, { duration: 200 }),
              withTiming(1, { duration: 300 })
            ),
            -1
          )
        );

        // Slight rotation during flex
        rotate.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(particleIndex === 0 ? -15 : 15, { duration: 400 }),
              withTiming(0, { duration: 400 })
            ),
            -1
          )
        );

        // Subtle up/down motion
        translateY.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(-20, { duration: 600 }), withTiming(20, { duration: 600 })),
            -1
          )
        );
        break;
      }

      case 'formLetter': {
        // Form a W shape for big_w effect
        const wPositions = [
          // First V of W
          { x: -100, y: -50 },
          { x: -75, y: 0 },
          { x: -50, y: 50 },
          { x: -25, y: 0 },
          // Second V of W
          { x: 0, y: -50 },
          { x: 25, y: 0 },
          { x: 50, y: 50 },
          { x: 75, y: 0 },
          { x: 100, y: -50 },
        ];

        const position = wPositions[particleIndex % wPositions.length];
        opacity.value = 0;
        scale.value = 0;

        // Animate to position with stagger
        translateX.value = withDelay(
          particleDelay + particleIndex * 30,
          withSpring(position.x, { damping: 10, stiffness: 150 })
        );
        translateY.value = withDelay(
          particleDelay + particleIndex * 30,
          withSpring(position.y, { damping: 10, stiffness: 150 })
        );

        // Pop in effect
        opacity.value = withDelay(
          particleDelay + particleIndex * 30,
          withTiming(1, { duration: 200 })
        );
        scale.value = withDelay(
          particleDelay + particleIndex * 30,
          withSpring(1, { damping: 6, stiffness: 200, overshootClamping: false })
        );

        // Gentle floating after formation
        translateY.value = withDelay(
          particleDelay + 1000,
          withRepeat(
            withSequence(
              withTiming(position.y - 10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
              withTiming(position.y + 10, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1
          )
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
        console.warn(
          `ExpressiveParticle: Unknown physics type "${physics}", falling back to float`
        );
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
