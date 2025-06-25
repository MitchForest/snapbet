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

export const EnhancedParticle: React.FC<ParticleProps> = ({
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
  const skewX = useSharedValue(0);
  const skewY = useSharedValue(0);

  const { physics, duration, delay: configDelay } = config;
  const effectiveDuration = duration || 3000;
  const particleDelay = (configDelay || 0) + particleIndex * 30;

  useEffect(() => {
    switch (physics) {
      case 'enhancedFloat': {
        const floatRadius = 100 + Math.random() * 50;
        const floatSpeed = 3000 + Math.random() * 1000;
        translateX.value = (Math.random() - 0.5) * 200;
        translateY.value = SCREEN_HEIGHT / 4;
        opacity.value = withDelay(particleDelay, withTiming(1, { duration: 500 }));
        scale.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(1.2, { duration: floatSpeed / 2 }),
              withTiming(0.8, { duration: floatSpeed / 2 })
            ),
            -1
          )
        );
        // Complex float pattern
        translateX.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(translateX.value + floatRadius, {
                duration: floatSpeed,
                easing: Easing.inOut(Easing.ease),
              }),
              withTiming(translateX.value - floatRadius, {
                duration: floatSpeed,
                easing: Easing.inOut(Easing.ease),
              })
            ),
            -1
          )
        );
        translateY.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(-SCREEN_HEIGHT / 2, {
                duration: floatSpeed * 2,
                easing: Easing.out(Easing.ease),
              }),
              withTiming(SCREEN_HEIGHT / 2, { duration: 0 })
            ),
            -1
          )
        );
        rotate.value = withDelay(
          particleDelay,
          withRepeat(withTiming(360, { duration: floatSpeed }), -1)
        );
        break;
      }

      case 'money3D': {
        const moneyX = (particleIndex - totalInGroup / 2) * 60;
        translateX.value = moneyX;
        translateY.value = -SCREEN_HEIGHT / 2;
        opacity.value = withDelay(particleDelay, withTiming(1, { duration: 300 }));
        // 3D rotation effect
        rotate.value = withDelay(
          particleDelay,
          withRepeat(
            withTiming(360, {
              duration: 2000,
              easing: Easing.linear,
            }),
            -1
          )
        );
        // Simulate 3D with scale and skew
        scale.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(1.5, { duration: 1000 }), withTiming(0.5, { duration: 1000 })),
            -1
          )
        );
        skewX.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(0.3, { duration: 1000 }), withTiming(-0.3, { duration: 1000 })),
            -1
          )
        );
        // Rain down
        translateY.value = withDelay(
          particleDelay,
          withTiming(SCREEN_HEIGHT / 2, {
            duration: effectiveDuration,
            easing: Easing.in(Easing.quad),
          })
        );
        break;
      }

      case 'multiExplode': {
        const explodeStage1Angle = (particleIndex / totalInGroup) * Math.PI * 2;
        const explodeStage1Radius = 100;
        const explodeStage2Radius = 250;
        translateX.value = 0;
        translateY.value = 0;
        opacity.value = 1;
        // Stage 1: Small explosion
        scale.value = withDelay(
          particleDelay,
          withSequence(
            withSpring(1.5, { damping: 5, stiffness: 300 }),
            withTiming(0.8, { duration: 200 }),
            withSpring(2, { damping: 5, stiffness: 300 }),
            withTiming(0, { duration: 500 })
          )
        );
        translateX.value = withDelay(
          particleDelay,
          withSequence(
            withSpring(Math.cos(explodeStage1Angle) * explodeStage1Radius, {
              damping: 8,
              stiffness: 200,
            }),
            withDelay(
              300,
              withSpring(Math.cos(explodeStage1Angle) * explodeStage2Radius, {
                damping: 6,
                stiffness: 150,
              })
            )
          )
        );
        translateY.value = withDelay(
          particleDelay,
          withSequence(
            withSpring(Math.sin(explodeStage1Angle) * explodeStage1Radius, {
              damping: 8,
              stiffness: 200,
            }),
            withDelay(
              300,
              withSpring(Math.sin(explodeStage1Angle) * explodeStage2Radius, {
                damping: 6,
                stiffness: 150,
              })
            )
          )
        );
        break;
      }

      case 'riverFlow': {
        const riverY = (particleIndex / totalInGroup) * SCREEN_HEIGHT - SCREEN_HEIGHT / 2;
        translateX.value = -SCREEN_WIDTH / 2;
        translateY.value = riverY;
        opacity.value = withDelay(particleDelay, withTiming(1, { duration: 300 }));
        scale.value = 0.8 + Math.random() * 0.4;
        // Flow across screen with wave motion
        translateX.value = withDelay(
          particleDelay,
          withTiming(SCREEN_WIDTH / 2, {
            duration: effectiveDuration,
            easing: Easing.linear,
          })
        );
        translateY.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(riverY - 20, { duration: 500 }),
              withTiming(riverY + 20, { duration: 500 })
            ),
            Math.floor(effectiveDuration / 1000)
          )
        );
        rotate.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(15, { duration: 500 }), withTiming(-15, { duration: 500 })),
            -1
          )
        );
        break;
      }

      case 'iceCool': {
        const icePattern = (particleIndex / totalInGroup) * Math.PI * 2;
        const iceRadius = 150;
        translateX.value = 0;
        translateY.value = 0;
        opacity.value = 0;
        scale.value = 0;
        // Crystallize from center
        opacity.value = withDelay(
          particleDelay,
          withSequence(
            withTiming(1, { duration: 300 }),
            withTiming(0.7, { duration: effectiveDuration - 300 })
          )
        );
        scale.value = withDelay(particleDelay, withSpring(1, { damping: 12, stiffness: 100 }));
        translateX.value = withDelay(
          particleDelay,
          withSequence(
            withSpring(Math.cos(icePattern) * iceRadius, {
              damping: 15,
              stiffness: 80,
            }),
            withRepeat(
              withSequence(
                withTiming(Math.cos(icePattern) * iceRadius * 1.1, { duration: 1000 }),
                withTiming(Math.cos(icePattern) * iceRadius * 0.9, { duration: 1000 })
              ),
              -1
            )
          )
        );
        translateY.value = withDelay(
          particleDelay,
          withSequence(
            withSpring(Math.sin(icePattern) * iceRadius, {
              damping: 15,
              stiffness: 80,
            }),
            withRepeat(
              withSequence(
                withTiming(Math.sin(icePattern) * iceRadius * 1.1, { duration: 1000 }),
                withTiming(Math.sin(icePattern) * iceRadius * 0.9, { duration: 1000 })
              ),
              -1
            )
          )
        );
        // Shimmer effect
        rotate.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(5, { duration: 2000 }), withTiming(-5, { duration: 2000 })),
            -1
          )
        );
        break;
      }

      case 'sportsRain': {
        const sportX = (Math.random() - 0.5) * SCREEN_WIDTH;
        translateX.value = sportX;
        translateY.value = -SCREEN_HEIGHT / 2 - Math.random() * 200;
        opacity.value = 1;
        scale.value = 0.8 + Math.random() * 0.4;
        // Fall with rotation
        translateY.value = withDelay(
          particleDelay,
          withTiming(SCREEN_HEIGHT / 2, {
            duration: effectiveDuration,
            easing: Easing.in(Easing.quad),
          })
        );
        rotate.value = withDelay(
          particleDelay,
          withRepeat(
            withTiming(360, {
              duration: 1000 + Math.random() * 500,
            }),
            -1
          )
        );
        // Slight drift
        translateX.value = withDelay(
          particleDelay,
          withTiming(sportX + (Math.random() - 0.5) * 50, {
            duration: effectiveDuration,
          })
        );
        break;
      }

      case 'swirlPattern': {
        const swirlRadius = 100 + particleIndex * 10;
        const swirlSpeed = 2000;
        const swirlAngle = (particleIndex / totalInGroup) * Math.PI * 2;
        translateX.value = Math.cos(swirlAngle) * swirlRadius;
        translateY.value = Math.sin(swirlAngle) * swirlRadius;
        opacity.value = withDelay(particleDelay, withTiming(1, { duration: 300 }));
        scale.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(1.2, { duration: 500 }), withTiming(0.8, { duration: 500 })),
            -1
          )
        );
        // Animated swirl
        rotate.value = withDelay(
          particleDelay,
          withRepeat(
            withTiming(360, {
              duration: swirlSpeed,
              easing: Easing.linear,
            }),
            -1
          )
        );
        break;
      }

      case 'beastFlex': {
        const flexX = (particleIndex - totalInGroup / 2) * 80;
        translateX.value = flexX;
        translateY.value = 0;
        opacity.value = 1;
        // Flex animation
        scale.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withSpring(2, { damping: 3, stiffness: 300 }),
              withTiming(1.5, { duration: 200 }),
              withSpring(2.5, { damping: 3, stiffness: 300 }),
              withTiming(1, { duration: 400 })
            ),
            -1
          )
        );
        // Power vibration
        translateX.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(flexX + 10, { duration: 50 }),
              withTiming(flexX - 10, { duration: 50 })
            ),
            -1
          )
        );
        translateY.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(-20, { duration: 400 }), withTiming(20, { duration: 400 })),
            -1
          )
        );
        break;
      }

      case 'diceRoll': {
        const diceStartX = (particleIndex - totalInGroup / 2) * 100;
        translateX.value = diceStartX;
        translateY.value = -SCREEN_HEIGHT / 3;
        opacity.value = 1;
        scale.value = 1;
        // Roll and bounce
        translateY.value = withDelay(
          particleDelay,
          withSequence(
            withTiming(0, {
              duration: 500,
              easing: Easing.in(Easing.quad),
            }),
            withRepeat(
              withSequence(
                withTiming(-30, { duration: 200, easing: Easing.out(Easing.quad) }),
                withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) })
              ),
              2
            )
          )
        );
        // Tumbling rotation
        rotate.value = withDelay(
          particleDelay,
          withSequence(
            withTiming(720 + Math.random() * 360, {
              duration: 1000,
              easing: Easing.out(Easing.quad),
            }),
            withRepeat(
              withSequence(
                withTiming(rotate.value + 90, { duration: 300 }),
                withTiming(rotate.value, { duration: 100 })
              ),
              2
            )
          )
        );
        break;
      }

      case 'stormSystem': {
        const stormRadius = 200;
        const stormAngle = (particleIndex / totalInGroup) * Math.PI * 2;
        const stormSpeed = 1500 + Math.random() * 500;
        translateX.value = Math.cos(stormAngle) * stormRadius;
        translateY.value = Math.sin(stormAngle) * stormRadius;
        opacity.value = withDelay(particleDelay, withTiming(1, { duration: 300 }));
        scale.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(1.5, { duration: 300 }), withTiming(0.8, { duration: 300 })),
            -1
          )
        );
        // Storm rotation - use simple rotation instead
        rotate.value = withDelay(
          particleDelay,
          withRepeat(
            withTiming(360, {
              duration: stormSpeed,
              easing: Easing.linear,
            }),
            -1
          )
        );
        break;
      }

      case 'freezeWind': {
        const windY = (particleIndex / totalInGroup) * SCREEN_HEIGHT - SCREEN_HEIGHT / 2;
        translateX.value = -SCREEN_WIDTH / 2;
        translateY.value = windY;
        opacity.value = withDelay(
          particleDelay,
          withSequence(
            withTiming(0.7, { duration: 300 }),
            withTiming(0.3, { duration: effectiveDuration - 300 })
          )
        );
        scale.value = 0.5 + Math.random() * 0.5;
        // Wind blow across
        translateX.value = withDelay(
          particleDelay,
          withTiming(SCREEN_WIDTH / 2, {
            duration: effectiveDuration / 2,
            easing: Easing.out(Easing.quad),
          })
        );
        // Crystallize effect
        scale.value = withDelay(
          particleDelay + effectiveDuration / 2,
          withSequence(withTiming(1.5, { duration: 200 }), withTiming(1, { duration: 300 }))
        );
        break;
      }

      case 'ratioOverwhelm': {
        const ratioPositions = [
          // Form ratio numbers
          { x: -60, y: -30 },
          { x: -40, y: -30 },
          { x: -20, y: -30 },
          { x: 0, y: 0 }, // colon
          { x: 20, y: 30 },
          { x: 40, y: 30 },
          { x: 60, y: 30 },
        ];
        const ratioPos = ratioPositions[particleIndex % ratioPositions.length];
        opacity.value = 0;
        scale.value = 0;
        translateX.value = (Math.random() - 0.5) * SCREEN_WIDTH;
        translateY.value = (Math.random() - 0.5) * SCREEN_HEIGHT;
        // Converge to form ratio
        opacity.value = withDelay(particleDelay, withTiming(1, { duration: 300 }));
        translateX.value = withDelay(
          particleDelay,
          withSpring(ratioPos.x, { damping: 10, stiffness: 100 })
        );
        translateY.value = withDelay(
          particleDelay,
          withSpring(ratioPos.y, { damping: 10, stiffness: 100 })
        );
        scale.value = withDelay(
          particleDelay,
          withSequence(
            withSpring(2, { damping: 5, stiffness: 200 }),
            withTiming(1.5, { duration: 300 })
          )
        );
        // Pulsing overwhelm
        scale.value = withDelay(
          particleDelay + 1000,
          withRepeat(
            withSequence(withTiming(2, { duration: 300 }), withTiming(1.5, { duration: 300 })),
            -1
          )
        );
        break;
      }

      case 'grassGrow': {
        const grassX = (particleIndex - totalInGroup / 2) * 30;
        translateX.value = grassX;
        translateY.value = SCREEN_HEIGHT / 3;
        opacity.value = withDelay(particleDelay, withTiming(1, { duration: 300 }));
        scale.value = 0;
        // Grow upward
        scale.value = withDelay(particleDelay, withSpring(1, { damping: 8, stiffness: 100 }));
        translateY.value = withDelay(
          particleDelay,
          withSpring(SCREEN_HEIGHT / 3 - 100 - Math.random() * 50, {
            damping: 10,
            stiffness: 80,
          })
        );
        // Sway in wind
        rotate.value = withDelay(
          particleDelay + 500,
          withRepeat(
            withSequence(
              withTiming(5, { duration: 1000 + Math.random() * 500 }),
              withTiming(-5, { duration: 1000 + Math.random() * 500 })
            ),
            -1
          )
        );
        break;
      }

      case 'chadEnergy': {
        const chadRadius = 150 + Math.random() * 50;
        const chadAngle = (particleIndex / totalInGroup) * Math.PI * 2;
        translateX.value = Math.cos(chadAngle) * chadRadius;
        translateY.value = Math.sin(chadAngle) * chadRadius;
        opacity.value = withDelay(
          particleDelay,
          withSequence(
            withTiming(0.8, { duration: 300 }),
            withRepeat(
              withSequence(withTiming(1, { duration: 500 }), withTiming(0.6, { duration: 500 })),
              -1
            )
          )
        );
        scale.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(1.5, { duration: 400 }), withTiming(1, { duration: 400 })),
            -1
          )
        );
        // Energy pulse outward - use scale to simulate pulsing
        scale.value = withDelay(
          particleDelay + 500,
          withRepeat(
            withSequence(withTiming(1.3, { duration: 800 }), withTiming(1, { duration: 800 })),
            -1
          )
        );
        break;
      }

      case 'cameraFlashes': {
        const flashGrid = [
          { x: -100, y: -100 },
          { x: 0, y: -100 },
          { x: 100, y: -100 },
          { x: -100, y: 0 },
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: -100, y: 100 },
          { x: 0, y: 100 },
          { x: 100, y: 100 },
        ];
        const flashPos = flashGrid[particleIndex % flashGrid.length];
        translateX.value = flashPos.x;
        translateY.value = flashPos.y;
        opacity.value = 0;
        scale.value = 0.5;
        // Sequential flashes
        opacity.value = withDelay(
          particleDelay + particleIndex * 200,
          withSequence(
            withTiming(1, { duration: 50 }),
            withTiming(0.5, { duration: 100 }),
            withTiming(1, { duration: 50 }),
            withTiming(0, { duration: 300 })
          )
        );
        scale.value = withDelay(
          particleDelay + particleIndex * 200,
          withSequence(withTiming(3, { duration: 50 }), withTiming(2, { duration: 250 }))
        );
        break;
      }

      case 'diamondHold': {
        const diamondPattern = [
          { x: 0, y: -80 }, // top
          { x: 60, y: 0 }, // right
          { x: 0, y: 80 }, // bottom
          { x: -60, y: 0 }, // left
        ];
        const diamondPos = diamondPattern[particleIndex % diamondPattern.length];
        translateX.value = diamondPos.x;
        translateY.value = diamondPos.y;
        opacity.value = withDelay(particleDelay, withTiming(1, { duration: 300 }));
        scale.value = withDelay(particleDelay, withSpring(1, { damping: 8, stiffness: 200 }));
        // Diamond shine rotation
        rotate.value = withDelay(
          particleDelay,
          withRepeat(
            withTiming(360, {
              duration: 3000,
              easing: Easing.linear,
            }),
            -1
          )
        );
        // Pulsing hold
        scale.value = withDelay(
          particleDelay + 500,
          withRepeat(
            withSequence(withTiming(1.3, { duration: 1000 }), withTiming(1, { duration: 1000 })),
            -1
          )
        );
        break;
      }

      case 'lastSecond': {
        const countdownRadius = 100;
        const countdownAngle = (particleIndex / totalInGroup) * Math.PI * 2 - Math.PI / 2;
        translateX.value = Math.cos(countdownAngle) * countdownRadius;
        translateY.value = Math.sin(countdownAngle) * countdownRadius;
        opacity.value = 0;
        scale.value = 2;
        // Urgent countdown
        opacity.value = withDelay(
          particleIndex * 50,
          withSequence(
            withTiming(1, { duration: 100 }),
            withRepeat(
              withSequence(withTiming(0.3, { duration: 100 }), withTiming(1, { duration: 100 })),
              5
            ),
            withTiming(0, { duration: 200 })
          )
        );
        scale.value = withDelay(
          particleIndex * 50,
          withSequence(
            withSpring(1, { damping: 5, stiffness: 300 }),
            withRepeat(
              withSequence(withTiming(1.2, { duration: 100 }), withTiming(0.8, { duration: 100 })),
              5
            )
          )
        );
        // Converge to center
        translateX.value = withDelay(
          particleDelay + 1000,
          withSpring(0, { damping: 8, stiffness: 200 })
        );
        translateY.value = withDelay(
          particleDelay + 1000,
          withSpring(0, { damping: 8, stiffness: 200 })
        );
        break;
      }

      default:
        // Fallback to enhanced float
        opacity.value = 1;
        scale.value = 1;
        translateY.value = withDelay(
          particleDelay,
          withTiming(-SCREEN_HEIGHT, {
            duration: effectiveDuration,
            easing: Easing.linear,
          })
        );
        console.warn(`EnhancedParticle: Unknown physics type "${physics}", falling back to float`);
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
        { skewX: `${skewX.value}rad` },
        { skewY: `${skewY.value}rad` },
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
