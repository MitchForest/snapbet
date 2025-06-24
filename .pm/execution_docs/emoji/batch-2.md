// ========================================
// BATCH 2: VIBES & WINS CATEGORIES
// ========================================
// This batch implements 10 Tier 0 effects:
//
// VIBES (7 effects):
// - crying_laughing: 😂 Can't Stop Laughing
// - no_cap: 🧢 No Cap
// - clown_check: 🤡 Clown Check
// - vibing: 😌 Vibing
// - bussin: 🔥💯 Bussin FR
// - sus: 🤨👀 That's Sus
// - big_w_l: W/L Big W / Big L
//
// WINS (3 effects):
// - trending_up: 📈 Trending Up
// - too_cool: 😎 Too Cool
// - flex: 💪 Flex
// ========================================

// ========================================
// File: components/effects/constants/batch2Effects.ts
// ========================================

import { EffectConfig } from '../types';

export const BATCH2_EFFECTS: Record<string, EffectConfig> = {
  // ==================== VIBES CATEGORY ====================
  
  // 😂 CRYING LAUGHING
  crying_laughing: {
    id: 'crying_laughing',
    name: "Can't Stop Laughing",
    tier: 0,
    category: 'vibes',
    particles: [
      { emoji: '😂', count: 20, size: { min: 25, max: 40 } }
    ],
    physics: 'bounce',
    duration: 'continuous'
  },

  // 🧢 NO CAP
  no_cap: {
    id: 'no_cap',
    name: 'No Cap',
    tier: 0,
    category: 'vibes',
    particles: [
      { emoji: '🧢', count: 15, size: { min: 30, max: 45 } }
    ],
    physics: 'spinAway',
    duration: 2000
  },

  // 🤡 CLOWN CHECK
  clown_check: {
    id: 'clown_check',
    name: 'Clown Check',
    tier: 0,
    category: 'vibes',
    particles: [
      { emoji: '🤡', count: 1, size: { min: 80, max: 80 } }, // Big center clown
      { emoji: '🤡', count: 8, size: { min: 25, max: 35 } }  // Small dancing clowns
    ],
    physics: 'zoomDance',
    duration: 2000
  },

  // 😌 VIBING
  vibing: {
    id: 'vibing',
    name: 'Vibing',
    tier: 0,
    category: 'vibes',
    particles: [
      { emoji: '😌', count: 5, size: { min: 35, max: 45 } },
      { emoji: '✨', count: 15, size: { min: 15, max: 25 } },
      { emoji: '🎵', count: 10, size: { min: 20, max: 30 } }
    ],
    physics: 'gentleFloat',
    duration: 'continuous'
  },

  // 🔥💯 BUSSIN
  bussin: {
    id: 'bussin',
    name: 'Bussin FR',
    tier: 0,
    category: 'vibes',
    particles: [
      { emoji: '🔥', count: 10, size: { min: 30, max: 40 } },
      { emoji: '💯', count: 5, size: { min: 40, max: 50 } },
      { emoji: '🚀', count: 3, size: { min: 35, max: 45 } }
    ],
    physics: 'explodeOut',
    duration: 2000
  },

  // 🤨👀 SUS
  sus: {
    id: 'sus',
    name: "That's Sus",
    tier: 0,
    category: 'vibes',
    particles: [
      { emoji: '🤨', count: 8, size: { min: 30, max: 40 } },
      { emoji: '👀', count: 12, size: { min: 25, max: 35 } }
    ],
    physics: 'lookAround',
    duration: 'continuous'
  },

  // W/L BIG W / BIG L
  big_w: {
    id: 'big_w',
    name: 'Big W',
    tier: 0,
    category: 'vibes',
    particles: [
      { emoji: '🏆', count: 25, size: { min: 20, max: 35 } } // Forms W shape
    ],
    physics: 'formLetter',
    duration: 2000
  },

  big_l: {
    id: 'big_l',
    name: 'Big L',
    tier: 0,
    category: 'vibes',
    particles: [
      { emoji: '😢', count: 20, size: { min: 20, max: 35 } } // Forms L shape
    ],
    physics: 'formLetter',
    duration: 2000
  },

  // ==================== WINS CATEGORY ====================

  // 📈 TRENDING UP
  trending_up: {
    id: 'trending_up',
    name: 'Trending Up',
    tier: 0,
    category: 'wins',
    particles: [
      { emoji: '📈', count: 3, size: { min: 50, max: 70 } },
      { emoji: '💹', count: 2, size: { min: 40, max: 60 } },
      { emoji: '⬆️', count: 5, size: { min: 25, max: 35 } }
    ],
    physics: 'riseUp',
    duration: 2000
  },

  // 😎 TOO COOL
  too_cool: {
    id: 'too_cool',
    name: 'Too Cool',
    tier: 0,
    category: 'wins',
    particles: [
      { emoji: '😎', count: 1, size: { min: 80, max: 80 } } // Single large
    ],
    physics: 'slideDown',
    duration: 1500
  },

  // 💪 FLEX
  flex: {
    id: 'flex',
    name: 'Flex',
    tier: 0,
    category: 'wins',
    particles: [
      { emoji: '💪', count: 2, size: { min: 60, max: 70 } } // Left and right
    ],
    physics: 'flexPump',
    duration: 'continuous'
  }
};

// ========================================
// File: components/effects/particles/Batch2Particles.tsx
// ========================================

import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
  cancelAnimation
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';
import type { PhysicsType } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Batch2ParticleProps {
  emoji: string;
  index: number;
  physics: PhysicsType;
  duration: number | null;
  size?: { min: number; max: number };
  totalCount?: number; // For letter formation
  letterType?: 'W' | 'L'; // For W/L effect
  onComplete?: () => void;
}

export const Batch2Particle: React.FC<Batch2ParticleProps> = ({
  emoji,
  index,
  physics,
  duration,
  size = { min: 20, max: 40 },
  totalCount = 20,
  letterType,
  onComplete
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const delay = index * 30; // Stagger
    const particleSize = size.min + Math.random() * (size.max - size.min);
    const scaleFactor = particleSize / 30;

    switch (physics) {
      // 😂 BOUNCE - Crying laughing bouncing around
      case 'bounce':
        const bounceX = Math.random() * SCREEN_WIDTH;
        const bounceY = SCREEN_HEIGHT / 2 + (Math.random() - 0.5) * 200;
        
        translateX.value = bounceX;
        translateY.value = bounceY;
        scale.value = withDelay(delay, withSpring(scaleFactor));
        
        // Bounce movement
        translateY.value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(bounceY - 100, { duration: 500, easing: Easing.out(Easing.quad) }),
              withTiming(bounceY, { duration: 500, easing: Easing.in(Easing.quad) })
            ),
            -1,
            true
          )
        );
        
        // Slight rotation while bouncing
        rotation.value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(10, { duration: 500 }),
              withTiming(-10, { duration: 500 })
            ),
            -1,
            true
          )
        );
        
        // Tears flying off effect
        if (Math.random() > 0.7) {
          translateX.value = withDelay(
            delay + 1000,
            withRepeat(
              withTiming(bounceX + (Math.random() - 0.5) * 100, { duration: 2000 }),
              -1,
              true
            )
          );
        }
        break;

      // 🧢 SPIN AWAY - Caps spinning and flying off
      case 'spinAway':
        const centerX = SCREEN_WIDTH / 2;
        const centerY = SCREEN_HEIGHT / 2;
        
        translateX.value = centerX;
        translateY.value = centerY;
        
        scale.value = withDelay(
          delay,
          withSequence(
            withSpring(scaleFactor * 1.2),
            withTiming(scaleFactor, { duration: 300 })
          )
        );
        
        // Spin rapidly
        rotation.value = withDelay(
          delay,
          withTiming(720 + Math.random() * 360, {
            duration: 1000,
            easing: Easing.out(Easing.cubic)
          })
        );
        
        // Fly away in random direction
        const angle = (Math.PI * 2 * index) / totalCount;
        const distance = 200 + Math.random() * 100;
        
        translateX.value = withDelay(
          delay + 300,
          withTiming(centerX + Math.cos(angle) * distance, {
            duration: 700,
            easing: Easing.out(Easing.back)
          })
        );
        
        translateY.value = withDelay(
          delay + 300,
          withTiming(centerY + Math.sin(angle) * distance, {
            duration: 700,
            easing: Easing.out(Easing.back)
          })
        );
        
        opacity.value = withDelay(
          delay + 800,
          withTiming(0, { duration: 200 })
        );
        break;

      // 🤡 ZOOM DANCE - Big clown zoom in, small ones dance
      case 'zoomDance':
        if (index === 0) {
          // Big center clown
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          
          scale.value = withSequence(
            withTiming(0, { duration: 0 }),
            withSpring(scaleFactor, {
              damping: 10,
              stiffness: 100,
              velocity: 10
            })
          );
          
          rotation.value = withSequence(
            withTiming(360, { duration: 500 }),
            withRepeat(
              withSequence(
                withTiming(10, { duration: 200 }),
                withTiming(-10, { duration: 200 })
              ),
              3,
              true
            )
          );
        } else {
          // Small dancing clowns
          const danceAngle = (Math.PI * 2 * (index - 1)) / (totalCount - 1);
          const radius = 150;
          
          translateX.value = SCREEN_WIDTH / 2 + Math.cos(danceAngle) * radius;
          translateY.value = SCREEN_HEIGHT / 2 + Math.sin(danceAngle) * radius;
          
          scale.value = withDelay(500 + delay, withSpring(scaleFactor));
          
          // Dance in circle
          const startAngle = danceAngle;
          rotation.value = withDelay(
            500 + delay,
            withRepeat(
              withTiming(360, { duration: 1000, easing: Easing.linear }),
              1
            )
          );
        }
        break;

      // 😌 GENTLE FLOAT - Peaceful floating motion
      case 'gentleFloat':
        const floatX = Math.random() * SCREEN_WIDTH;
        const floatY = SCREEN_HEIGHT * 0.3 + Math.random() * SCREEN_HEIGHT * 0.4;
        
        translateX.value = floatX;
        translateY.value = floatY;
        
        scale.value = withDelay(
          delay,
          withSpring(scaleFactor, { damping: 20, stiffness: 60 })
        );
        
        // Gentle floating motion
        translateY.value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(floatY - 20, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
              withTiming(floatY + 20, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
          )
        );
        
        // Gentle sway
        translateX.value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(floatX - 15, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
              withTiming(floatX + 15, { duration: 3000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
          )
        );
        
        // Music notes float up
        if (emoji === '🎵') {
          translateY.value = withDelay(
            delay,
            withRepeat(
              withTiming(floatY - 200, { duration: 4000, easing: Easing.out(Easing.ease) }),
              -1,
              false
            )
          );
        }
        break;

      // 🔥💯 EXPLODE OUT - Explosive expansion
      case 'explodeOut':
        const explodeCenterX = SCREEN_WIDTH / 2;
        const explodeCenterY = SCREEN_HEIGHT / 2;
        
        translateX.value = explodeCenterX;
        translateY.value = explodeCenterY;
        
        // Scale up quickly
        scale.value = withSequence(
          withTiming(scaleFactor * 1.5, { duration: 200, easing: Easing.out(Easing.back) }),
          withTiming(scaleFactor, { duration: 100 })
        );
        
        // Explode outward
        const explodeAngle = Math.random() * Math.PI * 2;
        const explodeDistance = 150 + Math.random() * 150;
        
        translateX.value = withDelay(
          200,
          withTiming(
            explodeCenterX + Math.cos(explodeAngle) * explodeDistance,
            { duration: 800, easing: Easing.out(Easing.cubic) }
          )
        );
        
        translateY.value = withDelay(
          200,
          withTiming(
            explodeCenterY + Math.sin(explodeAngle) * explodeDistance,
            { duration: 800, easing: Easing.out(Easing.cubic) }
          )
        );
        
        rotation.value = withTiming(Math.random() * 720, { duration: 1000 });
        
        opacity.value = withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0, { duration: 200 })
        );
        break;

      // 🤨👀 LOOK AROUND - Eyes darting suspiciously
      case 'lookAround':
        const lookBaseX = Math.random() * SCREEN_WIDTH;
        const lookBaseY = SCREEN_HEIGHT * 0.2 + Math.random() * SCREEN_HEIGHT * 0.6;
        
        translateX.value = lookBaseX;
        translateY.value = lookBaseY;
        
        scale.value = withDelay(delay, withSpring(scaleFactor));
        
        if (emoji === '👀') {
          // Eyes dart around quickly
          translateX.value = withDelay(
            delay,
            withRepeat(
              withSequence(
                withTiming(lookBaseX - 50, { duration: 200 }),
                withTiming(lookBaseX + 50, { duration: 200 }),
                withTiming(lookBaseX, { duration: 200 })
              ),
              -1,
              false
            )
          );
        } else {
          // Eyebrows raise up and down
          translateY.value = withDelay(
            delay,
            withRepeat(
              withSequence(
                withTiming(lookBaseY - 10, { duration: 400 }),
                withTiming(lookBaseY + 10, { duration: 400 })
              ),
              -1,
              true
            )
          );
        }
        break;

      // W/L FORM LETTER - Particles form letter shape
      case 'formLetter':
        scale.value = 0;
        opacity.value = 0;
        
        // Calculate position for letter formation
        let targetX, targetY;
        
        if (letterType === 'W') {
          // Form W shape
          const segment = Math.floor(index / (totalCount / 4));
          const segmentIndex = index % (totalCount / 4);
          const segmentProgress = segmentIndex / (totalCount / 4);
          
          switch (segment) {
            case 0: // First downstroke
              targetX = SCREEN_WIDTH * 0.3;
              targetY = SCREEN_HEIGHT * 0.3 + segmentProgress * 200;
              break;
            case 1: // First upstroke
              targetX = SCREEN_WIDTH * 0.3 + segmentProgress * 60;
              targetY = SCREEN_HEIGHT * 0.5 - segmentProgress * 100;
              break;
            case 2: // Second downstroke
              targetX = SCREEN_WIDTH * 0.45 + segmentProgress * 60;
              targetY = SCREEN_HEIGHT * 0.4 + segmentProgress * 100;
              break;
            case 3: // Second upstroke
              targetX = SCREEN_WIDTH * 0.6 + segmentProgress * 60;
              targetY = SCREEN_HEIGHT * 0.5 - segmentProgress * 200;
              break;
            default:
              targetX = SCREEN_WIDTH / 2;
              targetY = SCREEN_HEIGHT / 2;
          }
        } else {
          // Form L shape
          if (index < totalCount * 0.6) {
            // Vertical line
            targetX = SCREEN_WIDTH * 0.4;
            targetY = SCREEN_HEIGHT * 0.3 + (index / (totalCount * 0.6)) * 200;
          } else {
            // Horizontal line
            const horizIndex = index - totalCount * 0.6;
            const horizProgress = horizIndex / (totalCount * 0.4);
            targetX = SCREEN_WIDTH * 0.4 + horizProgress * 150;
            targetY = SCREEN_HEIGHT * 0.5;
          }
        }
        
        // Animate to position
        translateX.value = withDelay(
          delay,
          withTiming(targetX, { duration: 800, easing: Easing.out(Easing.back) })
        );
        
        translateY.value = withDelay(
          delay,
          withTiming(targetY, { duration: 800, easing: Easing.out(Easing.back) })
        );
        
        scale.value = withDelay(
          delay,
          withSpring(scaleFactor)
        );
        
        opacity.value = withDelay(
          delay,
          withTiming(1, { duration: 300 })
        );
        
        // Pulse when formed
        scale.value = withDelay(
          1000,
          withRepeat(
            withSequence(
              withTiming(scaleFactor * 1.2, { duration: 300 }),
              withTiming(scaleFactor, { duration: 300 })
            ),
            2,
            true
          )
        );
        break;

      // 📈 RISE UP - Charts growing upward
      case 'riseUp':
        const chartX = SCREEN_WIDTH * 0.3 + index * 80;
        const startY = SCREEN_HEIGHT * 0.7;
        const endY = SCREEN_HEIGHT * 0.3 - index * 30;
        
        translateX.value = chartX;
        translateY.value = startY;
        scale.value = 0;
        
        // Grow upward
        translateY.value = withDelay(
          delay,
          withTiming(endY, {
            duration: 800,
            easing: Easing.out(Easing.back)
          })
        );
        
        scale.value = withDelay(
          delay,
          withSpring(scaleFactor, {
            damping: 10,
            stiffness: 100
          })
        );
        
        // Bounce at top
        translateY.value = withDelay(
          delay + 800,
          withRepeat(
            withSequence(
              withTiming(endY - 10, { duration: 300 }),
              withTiming(endY, { duration: 300 })
            ),
            2,
            true
          )
        );
        
        // Arrows shoot up
        if (emoji === '⬆️') {
          translateY.value = withDelay(
            delay + 500,
            withTiming(-100, { duration: 1000, easing: Easing.in(Easing.quad) })
          );
          opacity.value = withDelay(
            delay + 500,
            withTiming(0, { duration: 1000 })
          );
        }
        break;

      // 😎 SLIDE DOWN - Cool entrance
      case 'slideDown':
        translateX.value = SCREEN_WIDTH / 2;
        translateY.value = -100;
        scale.value = scaleFactor;
        rotation.value = -180;
        
        // Slide down with style
        translateY.value = withSpring(SCREEN_HEIGHT * 0.4, {
          damping: 15,
          stiffness: 80,
          velocity: 10
        });
        
        // Straighten out
        rotation.value = withSpring(0, {
          damping: 10,
          stiffness: 100
        });
        
        // Cool bounce
        translateY.value = withDelay(
          800,
          withSequence(
            withTiming(SCREEN_HEIGHT * 0.4 - 20, { duration: 200 }),
            withSpring(SCREEN_HEIGHT * 0.4)
          )
        );
        break;

      // 💪 FLEX PUMP - Flexing animation
      case 'flexPump':
        const isLeft = index === 0;
        const flexX = isLeft ? SCREEN_WIDTH * 0.3 : SCREEN_WIDTH * 0.7;
        
        translateX.value = flexX;
        translateY.value = SCREEN_HEIGHT / 2;
        scale.value = scaleFactor;
        
        // Mirror right arm
        if (!isLeft) {
          rotation.value = 180;
        }
        
        // Flex pumping
        scale.value = withDelay(
          isLeft ? 0 : 200,
          withRepeat(
            withSequence(
              withSpring(scaleFactor * 1.3, { damping: 5, stiffness: 200 }),
              withSpring(scaleFactor, { damping: 8, stiffness: 150 })
            ),
            -1,
            false
          )
        );
        
        // Slight movement
        translateY.value = withDelay(
          isLeft ? 0 : 200,
          withRepeat(
            withSequence(
              withTiming(SCREEN_HEIGHT / 2 - 10, { duration: 400 }),
              withTiming(SCREEN_HEIGHT / 2, { duration: 400 })
            ),
            -1,
            true
          )
        );
        break;
    }

    // Handle completion for one-time effects
    if (duration && onComplete) {
      setTimeout(() => {
        runOnJS(onComplete)();
      }, duration);
    }

    return () => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(scale);
      cancelAnimation(rotation);
      cancelAnimation(opacity);
    };
  }, [emoji, index, physics, duration, size, totalCount, letterType]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
    opacity: opacity.value
  }));

  return (
    <Animated.Text style={[{ position: 'absolute', fontSize: 30 }, animatedStyle]}>
      {emoji}
    </Animated.Text>
  );
};

// ========================================
// File: components/effects/effects/VibesEffects.tsx
// ========================================

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Batch2Particle } from '../particles/Batch2Particles';
import type { EffectConfig } from '../types';

interface VibesEffectProps {
  config: EffectConfig;
  onComplete?: () => void;
}

export const VibesEffect: React.FC<VibesEffectProps> = ({ config, onComplete }) => {
  const particles: JSX.Element[] = [];
  let particleId = 0;

  config.particles.forEach((particleConfig) => {
    const count = particleConfig.count;
    
    for (let i = 0; i < count; i++) {
      particles.push(
        <Batch2Particle
          key={`${config.id}_${particleId}`}
          emoji={particleConfig.emoji}
          index={particleId}
          physics={config.physics as any}
          duration={config.duration === 'continuous' ? null : config.duration}
          size={particleConfig.size}
          totalCount={count}
          letterType={config.id === 'big_w' ? 'W' : config.id === 'big_l' ? 'L' : undefined}
          onComplete={config.duration !== 'continuous' ? onComplete : undefined}
        />
      );
      particleId++;
    }
  });

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles}
    </View>
  );
};

// ========================================
// File: Update to EmojiEffectsManager.tsx
// ========================================

// Add to existing imports
import { BATCH2_EFFECTS } from './constants/batch2Effects';
import { VibesEffect } from './effects/VibesEffects';

// Update EFFECT_CONFIGS to include batch 2
export const ALL_EFFECTS = {
  ...EFFECT_CONFIGS,
  ...BATCH2_EFFECTS
};

// In the render section, add handling for new effect categories
if (config.category === 'vibes' || config.category === 'wins') {
  return (
    <VibesEffect
      config={config}
      onComplete={handleEffectComplete}
    />
  );
}