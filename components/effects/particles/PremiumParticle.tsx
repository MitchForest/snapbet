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

export const PremiumParticle: React.FC<ParticleProps> = ({
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
  const effectiveDuration = duration || 4000;
  const particleDelay = (configDelay || 0) + particleIndex * 25;

  useEffect(() => {
    switch (physics) {
      case 'infernoEruption': {
        const eruptionAngle = (particleIndex / totalInGroup) * Math.PI * 2;
        const eruptionForce = 300 + Math.random() * 200;
        translateX.value = 0;
        translateY.value = SCREEN_HEIGHT / 3;
        opacity.value = 1;
        scale.value = 0.5;

        // Eruption launch
        scale.value = withDelay(
          particleDelay,
          withSequence(
            withSpring(2, { damping: 3, stiffness: 400 }),
            withTiming(1, { duration: effectiveDuration - 500 })
          )
        );

        // Erupt outward and upward
        translateX.value = withDelay(
          particleDelay,
          withSequence(
            withSpring(Math.cos(eruptionAngle) * eruptionForce, {
              damping: 8,
              stiffness: 150,
              velocity: 200,
            }),
            withTiming(Math.cos(eruptionAngle) * eruptionForce * 1.5, {
              duration: 1000,
              easing: Easing.out(Easing.quad),
            })
          )
        );

        translateY.value = withDelay(
          particleDelay,
          withSequence(
            withSpring(-eruptionForce, {
              damping: 8,
              stiffness: 150,
              velocity: 300,
            }),
            withTiming(SCREEN_HEIGHT / 2, {
              duration: 1500,
              easing: Easing.in(Easing.quad),
            })
          )
        );

        // Inferno glow effect
        opacity.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(1, { duration: 200 }), withTiming(0.6, { duration: 200 })),
            -1
          )
        );

        rotate.value = withDelay(
          particleDelay,
          withRepeat(withTiming(360, { duration: 1000 }), -1)
        );
        break;
      }

      case 'moneyTornado': {
        const tornadoHeight = particleIndex * 30 - totalInGroup * 15;
        const tornadoSpeed = 1000 + Math.random() * 500;

        translateY.value = tornadoHeight;
        opacity.value = withDelay(particleDelay, withTiming(1, { duration: 300 }));
        scale.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(1.3, { duration: 500 }), withTiming(0.7, { duration: 500 })),
            -1
          )
        );

        // Tornado rotation with rising motion
        // 3D rotation effect
        rotate.value = withDelay(
          particleDelay,
          withRepeat(
            withTiming(360, {
              duration: tornadoSpeed,
              easing: Easing.linear,
            }),
            -1
          )
        );

        skewX.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(0.3, { duration: tornadoSpeed / 2 }),
              withTiming(-0.3, { duration: tornadoSpeed / 2 })
            ),
            -1
          )
        );
        break;
      }

      case 'fireworksShow': {
        const fireworkStage = Math.floor(particleIndex / (totalInGroup / 3));
        const fireworkAngle =
          ((particleIndex % (totalInGroup / 3)) / (totalInGroup / 3)) * Math.PI * 2;
        const fireworkRadius = 200 + fireworkStage * 50;

        translateX.value = 0;
        translateY.value = SCREEN_HEIGHT / 4;
        opacity.value = 0;
        scale.value = 0;

        // Launch delay based on stage
        const launchDelay = particleDelay + fireworkStage * 500;

        // Launch upward
        translateY.value = withDelay(
          launchDelay,
          withSequence(
            withTiming(-SCREEN_HEIGHT / 4, {
              duration: 800,
              easing: Easing.out(Easing.quad),
            }),
            withTiming(-SCREEN_HEIGHT / 4 + 50, { duration: 200 })
          )
        );

        // Explode at peak
        opacity.value = withDelay(
          launchDelay + 800,
          withSequence(withTiming(1, { duration: 100 }), withTiming(0, { duration: 1000 }))
        );

        scale.value = withDelay(
          launchDelay + 800,
          withSequence(
            withSpring(2, { damping: 5, stiffness: 300 }),
            withTiming(0.5, { duration: 1000 })
          )
        );

        translateX.value = withDelay(
          launchDelay + 800,
          withSpring(Math.cos(fireworkAngle) * fireworkRadius, {
            damping: 10,
            stiffness: 100,
          })
        );

        translateY.value = withDelay(
          launchDelay + 800,
          withSequence(
            withSpring(-SCREEN_HEIGHT / 4 + (Math.sin(fireworkAngle) * fireworkRadius) / 2, {
              damping: 10,
              stiffness: 100,
            }),
            withTiming(SCREEN_HEIGHT / 2, {
              duration: 1500,
              easing: Easing.in(Easing.quad),
            })
          )
        );

        // Sparkle effect
        rotate.value = withDelay(
          launchDelay + 800,
          withRepeat(withTiming(360, { duration: 500 }), -1)
        );
        break;
      }

      case 'floodingTears': {
        const tearX = (Math.random() - 0.5) * SCREEN_WIDTH;
        const tearWave = Math.floor(particleIndex / 5);
        translateX.value = tearX;
        translateY.value = -SCREEN_HEIGHT / 3 - tearWave * 50;
        opacity.value = withDelay(particleDelay + tearWave * 200, withTiming(1, { duration: 200 }));
        scale.value = 0.8 + Math.random() * 0.6;

        // Flood downward with acceleration
        translateY.value = withDelay(
          particleDelay + tearWave * 200,
          withTiming(SCREEN_HEIGHT / 2, {
            duration: effectiveDuration - tearWave * 200,
            easing: Easing.in(Easing.quad),
          })
        );

        // Spreading effect at bottom
        translateX.value = withDelay(
          particleDelay + effectiveDuration - 1000,
          withTiming(tearX + (Math.random() - 0.5) * 200, {
            duration: 1000,
            easing: Easing.out(Easing.quad),
          })
        );

        // Wobble while falling
        rotate.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(10, { duration: 200 }), withTiming(-10, { duration: 200 })),
            -1
          )
        );
        break;
      }

      case 'diamondAura': {
        const auraLayers = Math.floor(particleIndex / 8);
        const auraAngle = ((particleIndex % 8) / 8) * Math.PI * 2;
        const auraRadius = 100 + auraLayers * 40;

        translateX.value = Math.cos(auraAngle) * auraRadius;
        translateY.value = Math.sin(auraAngle) * auraRadius;
        opacity.value = withDelay(
          particleDelay + auraLayers * 100,
          withSequence(
            withTiming(0.6 - auraLayers * 0.1, { duration: 500 }),
            withRepeat(
              withSequence(
                withTiming(0.8 - auraLayers * 0.1, { duration: 1000 }),
                withTiming(0.4 - auraLayers * 0.1, { duration: 1000 })
              ),
              -1
            )
          )
        );

        scale.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(1.5, { duration: 2000 }), withTiming(1, { duration: 2000 })),
            -1
          )
        );

        // Diamond rotation with shimmer
        rotate.value = withDelay(
          particleDelay,
          withRepeat(
            withTiming(360, {
              duration: 4000 - auraLayers * 500,
              easing: Easing.linear,
            }),
            -1
          )
        );

        // Pulsing aura expansion - removed, using scale animation instead
        break;
      }

      case 'championOrbit': {
        const orbitSpeed = 2000 + (particleIndex % 3) * 500;

        opacity.value = withDelay(particleDelay, withTiming(1, { duration: 300 }));
        scale.value = withDelay(particleDelay, withSpring(1, { damping: 8, stiffness: 150 }));

        // Orbital motion
        // Champion glow
        opacity.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(1, { duration: 1000 }), withTiming(0.7, { duration: 1000 })),
            -1
          )
        );

        rotate.value = withDelay(
          particleDelay,
          withRepeat(withTiming(360, { duration: orbitSpeed }), -1)
        );
        break;
      }

      case 'galaxySwirl': {
        const galaxyArm = Math.floor(particleIndex / (totalInGroup / 3));
        const galaxyPosition = (particleIndex % (totalInGroup / 3)) / (totalInGroup / 3);
        const galaxyRadius = 50 + galaxyPosition * 200;
        const galaxyAngle = galaxyArm * ((Math.PI * 2) / 3) + (galaxyPosition * Math.PI) / 3;

        translateX.value = Math.cos(galaxyAngle) * galaxyRadius;
        translateY.value = Math.sin(galaxyAngle) * galaxyRadius;
        opacity.value = withDelay(
          particleDelay,
          withTiming(0.8 - galaxyPosition * 0.3, { duration: 500 })
        );
        scale.value = 1 - galaxyPosition * 0.5;

        // Galaxy rotation
        // Twinkle effect
        opacity.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(0.8 - galaxyPosition * 0.3, { duration: 200 }),
              withTiming(0.4 - galaxyPosition * 0.2, { duration: 200 })
            ),
            -1
          )
        );
        break;
      }

      case 'slotSpin': {
        const slotColumn = Math.floor(particleIndex / (totalInGroup / 3));
        const slotRow = particleIndex % (totalInGroup / 3);
        const slotX = (slotColumn - 1) * 80;
        const slotStartY = -SCREEN_HEIGHT / 2 - slotRow * 60;

        translateX.value = slotX;
        translateY.value = slotStartY;
        opacity.value = 1;
        scale.value = 1;

        // Spin animation with different speeds per column
        const spinDuration = 2000 + slotColumn * 500;
        translateY.value = withDelay(
          particleDelay,
          withSequence(
            withTiming(0, {
              duration: spinDuration,
              easing: Easing.out(Easing.cubic),
            }),
            withRepeat(
              withSequence(
                withTiming(-10, { duration: 100 }),
                withTiming(10, { duration: 100 }),
                withTiming(0, { duration: 100 })
              ),
              2
            )
          )
        );

        // Winning flash
        opacity.value = withDelay(
          particleDelay + spinDuration,
          withRepeat(
            withSequence(withTiming(1, { duration: 200 }), withTiming(0.5, { duration: 200 })),
            3
          )
        );

        scale.value = withDelay(
          particleDelay + spinDuration,
          withSequence(
            withSpring(1.5, { damping: 5, stiffness: 200 }),
            withTiming(1, { duration: 300 })
          )
        );
        break;
      }

      case 'toxicBubble': {
        const bubbleX = (Math.random() - 0.5) * SCREEN_WIDTH * 0.8;
        const bubbleSize = 0.5 + Math.random() * 0.5;
        translateX.value = bubbleX;
        translateY.value = SCREEN_HEIGHT / 3;
        opacity.value = withDelay(particleDelay, withTiming(0.7, { duration: 300 }));
        scale.value = 0;

        // Bubble up with wobble
        scale.value = withDelay(
          particleDelay,
          withSpring(bubbleSize, { damping: 8, stiffness: 100 })
        );

        translateY.value = withDelay(
          particleDelay,
          withTiming(-SCREEN_HEIGHT / 2, {
            duration: effectiveDuration,
            easing: Easing.out(Easing.quad),
          })
        );

        translateX.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(bubbleX + 20, { duration: 500 }),
              withTiming(bubbleX - 20, { duration: 500 })
            ),
            Math.floor(effectiveDuration / 1000)
          )
        );

        // Toxic glow
        opacity.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(withTiming(0.9, { duration: 300 }), withTiming(0.5, { duration: 300 })),
            -1
          )
        );

        // Pop at top
        scale.value = withDelay(
          particleDelay + effectiveDuration - 200,
          withSequence(
            withTiming(bubbleSize * 1.5, { duration: 100 }),
            withTiming(0, { duration: 100 })
          )
        );
        break;
      }

      case 'smoothCharm': {
        const charmWave = Math.sin((particleIndex / totalInGroup) * Math.PI);
        const charmX = (particleIndex - totalInGroup / 2) * 60;
        translateX.value = charmX;
        translateY.value = 0;
        opacity.value = 0;
        scale.value = 0;

        // Smooth entrance
        opacity.value = withDelay(
          particleDelay,
          withTiming(1, {
            duration: 800,
            easing: Easing.out(Easing.cubic),
          })
        );

        scale.value = withDelay(
          particleDelay,
          withSpring(1, {
            damping: 15,
            stiffness: 50,
            mass: 2,
          })
        );

        // Smooth wave motion
        translateY.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(-50 - charmWave * 30, {
                duration: 2000,
                easing: Easing.inOut(Easing.ease),
              }),
              withTiming(50 + charmWave * 30, {
                duration: 2000,
                easing: Easing.inOut(Easing.ease),
              })
            ),
            -1
          )
        );

        // Gentle rotation
        rotate.value = withDelay(
          particleDelay,
          withRepeat(
            withSequence(
              withTiming(15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
              withTiming(-15, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1
          )
        );
        break;
      }

      case 'spotlight': {
        const spotlightAngle = ((particleIndex / totalInGroup) * Math.PI) / 3 - Math.PI / 6;
        const spotlightDistance = 200 + Math.random() * 100;
        translateX.value = 0;
        translateY.value = -SCREEN_HEIGHT / 3;
        opacity.value = 0;
        scale.value = 1;

        // Spotlight beam
        opacity.value = withDelay(
          particleDelay,
          withSequence(
            withTiming(0.3, { duration: 500 }),
            withRepeat(
              withSequence(withTiming(0.6, { duration: 200 }), withTiming(0.3, { duration: 200 })),
              -1
            )
          )
        );

        // Beam projection
        translateX.value = withDelay(
          particleDelay,
          withTiming(Math.cos(spotlightAngle) * spotlightDistance, {
            duration: 1000,
            easing: Easing.out(Easing.quad),
          })
        );

        translateY.value = withDelay(
          particleDelay,
          withTiming(-SCREEN_HEIGHT / 3 + Math.sin(spotlightAngle) * spotlightDistance, {
            duration: 1000,
            easing: Easing.out(Easing.quad),
          })
        );

        // Scanning motion - removed, using rotation instead
        break;
      }

      case 'bagBurst': {
        const burstAngle = (particleIndex / totalInGroup) * Math.PI * 2;
        const burstRadius = 250;
        const burstHeight = Math.random() * 100 - 50;
        translateX.value = 0;
        translateY.value = 0;
        opacity.value = 0;
        scale.value = 0;

        // Bag shake before burst
        translateX.value = withDelay(
          particleDelay,
          withSequence(
            withRepeat(
              withSequence(withTiming(5, { duration: 50 }), withTiming(-5, { duration: 50 })),
              5
            ),
            withSpring(Math.cos(burstAngle) * burstRadius, {
              damping: 6,
              stiffness: 200,
              velocity: 300,
            })
          )
        );

        translateY.value = withDelay(
          particleDelay,
          withSequence(
            withTiming(0, { duration: 500 }), // Shake duration
            withSpring(burstHeight, {
              damping: 6,
              stiffness: 200,
              velocity: 200,
            }),
            withTiming(SCREEN_HEIGHT / 2, {
              duration: 2000,
              easing: Easing.in(Easing.quad),
            })
          )
        );

        // Burst appearance
        opacity.value = withDelay(particleDelay + 500, withTiming(1, { duration: 100 }));

        scale.value = withDelay(
          particleDelay + 500,
          withSequence(
            withSpring(1.5, { damping: 5, stiffness: 300 }),
            withTiming(1, { duration: 500 })
          )
        );

        // Money spin
        rotate.value = withDelay(
          particleDelay + 500,
          withRepeat(withTiming(360, { duration: 1000 }), -1)
        );
        break;
      }

      default:
        // Fallback to premium float
        opacity.value = 1;
        scale.value = 1;
        translateY.value = withDelay(
          particleDelay,
          withTiming(-SCREEN_HEIGHT, {
            duration: effectiveDuration,
            easing: Easing.linear,
          })
        );
        console.warn(`PremiumParticle: Unknown physics type "${physics}", falling back to float`);
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
