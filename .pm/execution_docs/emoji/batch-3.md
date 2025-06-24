// ========================================
// BATCH 3: LOSSES & HYPE CATEGORIES
// ========================================
// This batch implements 11 Tier 0 effects:
//
// LOSSES (3 effects):
// - rough_patch: 📉 Rough Patch
// - mind_blown: 🤯 Mind Blown
// - nervous: 😰 Nervous
//
// HYPE (8 effects):
// - gg_ez: 🎮 GG EZ
// - rage_quit: 😤 Rage Quit
// - poggers: 😮 POGGERS
// - f_in_chat: F (made of 😔)
// - game_time: 🏀 Game Time (sports balls)
// - menace: 😈 Menace to Society
// - no_chill: 🥵 No Chill
// - stay_salty: 🧂 Stay Salty
// ========================================

// ========================================
// File: components/effects/constants/batch3Effects.ts
// ========================================

import { EffectConfig } from '../types';

export const BATCH3_EFFECTS: Record<string, EffectConfig> = {
  // ==================== LOSSES CATEGORY ====================
  
  // 📉 ROUGH PATCH
  rough_patch: {
    id: 'rough_patch',
    name: 'Rough Patch',
    tier: 0,
    category: 'losses',
    particles: [
      { emoji: '📉', count: 3, size: { min: 50, max: 70 } },
      { emoji: '💸', count: 10, size: { min: 25, max: 35 } },
      { emoji: '⬇️', count: 5, size: { min: 20, max: 30 } }
    ],
    physics: 'crashDown',
    duration: 2000
  },

  // 🤯 MIND BLOWN
  mind_blown: {
    id: 'mind_blown',
    name: 'Mind Blown',
    tier: 0,
    category: 'losses',
    particles: [
      { emoji: '🤯', count: 1, size: { min: 80, max: 80 } },
      { emoji: '💥', count: 8, size: { min: 30, max: 50 } }
    ],
    physics: 'headExplode',
    duration: 2000
  },

  // 😰 NERVOUS
  nervous: {
    id: 'nervous',
    name: 'Nervous',
    tier: 0,
    category: 'losses',
    particles: [
      { emoji: '😰', count: 3, size: { min: 40, max: 50 } },
      { emoji: '💧', count: 15, size: { min: 15, max: 25 } }
    ],
    physics: 'sweatDrop',
    duration: 'continuous'
  },

  // ==================== HYPE CATEGORY ====================

  // 🎮 GG EZ
  gg_ez: {
    id: 'gg_ez',
    name: 'GG EZ',
    tier: 0,
    category: 'hype',
    particles: [
      { emoji: '🎮', count: 8, size: { min: 30, max: 40 } },
      { emoji: '🏆', count: 5, size: { min: 35, max: 45 } }
    ],
    physics: 'victoryDance',
    duration: 2000
  },

  // 😤 RAGE QUIT
  rage_quit: {
    id: 'rage_quit',
    name: 'Rage Quit',
    tier: 0,
    category: 'hype',
    particles: [
      { emoji: '😤', count: 1, size: { min: 60, max: 60 } },
      { emoji: '💢', count: 5, size: { min: 25, max: 35 } },
      { emoji: '🎮', count: 2, size: { min: 40, max: 40 } },
      { emoji: '💥', count: 3, size: { min: 30, max: 45 } }
    ],
    physics: 'angerBurst',
    duration: 2000
  },

  // 😮 POGGERS
  poggers: {
    id: 'poggers',
    name: 'POGGERS',
    tier: 0,
    category: 'hype',
    particles: [
      { emoji: '😮', count: 15, size: { min: 25, max: 45 } },
      { emoji: '🎉', count: 5, size: { min: 20, max: 30 } }
    ],
    physics: 'popIn',
    duration: 1500
  },

  // F IN CHAT
  f_in_chat: {
    id: 'f_in_chat',
    name: 'F',
    tier: 0,
    category: 'hype',
    particles: [
      { emoji: '😔', count: 30, size: { min: 20, max: 30 } }
    ],
    physics: 'formF',
    duration: 2000
  },

  // 🏀 GAME TIME (Dynamic sport selection)
  game_time: {
    id: 'game_time',
    name: 'Game Time',
    tier: 0,
    category: 'hype',
    particles: [
      { emoji: '🏀', count: 5, size: { min: 35, max: 45 } },
      { emoji: '🏈', count: 5, size: { min: 35, max: 45 } },
      { emoji: '⚾', count: 5, size: { min: 35, max: 45 } }
    ],
    physics: 'sportsBounce',
    duration: 'continuous'
  },

  // 😈 MENACE
  menace: {
    id: 'menace',
    name: 'Menace to Society',
    tier: 0,
    category: 'hype',
    particles: [
      { emoji: '😈', count: 12, size: { min: 30, max: 40 } },
      { emoji: '🔥', count: 8, size: { min: 20, max: 30 } }
    ],
    physics: 'chaosCircle',
    duration: 'continuous'
  },

  // 🥵 NO CHILL
  no_chill: {
    id: 'no_chill',
    name: 'No Chill',
    tier: 0,
    category: 'hype',
    particles: [
      { emoji: '🥵', count: 5, size: { min: 40, max: 50 } },
      { emoji: '🔥', count: 10, size: { min: 20, max: 30 } },
      { emoji: '💦', count: 10, size: { min: 15, max: 25 } }
    ],
    physics: 'temperatureFlux',
    duration: 'continuous'
  },

  // 🧂 STAY SALTY
  stay_salty: {
    id: 'stay_salty',
    name: 'Stay Salty',
    tier: 0,
    category: 'hype',
    particles: [
      { emoji: '🧂', count: 20, size: { min: 25, max: 35 } },
      { emoji: '😭', count: 3, size: { min: 35, max: 45 } }
    ],
    physics: 'saltPour',
    duration: 'continuous'
  }
};

// ========================================
// File: components/effects/particles/Batch3Particles.tsx
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

interface Batch3ParticleProps {
  emoji: string;
  index: number;
  physics: PhysicsType;
  duration: number | null;
  size?: { min: number; max: number };
  totalCount?: number;
  onComplete?: () => void;
}

export const Batch3Particle: React.FC<Batch3ParticleProps> = ({
  emoji,
  index,
  physics,
  duration,
  size = { min: 20, max: 40 },
  totalCount = 20,
  onComplete
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const delay = index * 30;
    const particleSize = size.min + Math.random() * (size.max - size.min);
    const scaleFactor = particleSize / 30;

    switch (physics) {
      // 📉 CRASH DOWN - Charts crashing with money flying away
      case 'crashDown':
        if (emoji === '📉') {
          // Charts crash down
          const chartX = SCREEN_WIDTH * 0.3 + index * 80;
          translateX.value = chartX;
          translateY.value = SCREEN_HEIGHT * 0.3;
          scale.value = scaleFactor;
          
          // Crash animation
          translateY.value = withDelay(
            delay,
            withSequence(
              withTiming(SCREEN_HEIGHT * 0.35, { duration: 200 }), // Small rise
              withTiming(SCREEN_HEIGHT * 0.8, { 
                duration: 800,
                easing: Easing.in(Easing.quad)
              })
            )
          );
          
          // Shake on impact
          translateX.value = withDelay(
            delay + 1000,
            withRepeat(
              withSequence(
                withTiming(chartX - 5, { duration: 50 }),
                withTiming(chartX + 5, { duration: 50 })
              ),
              3,
              true
            )
          );
        } else if (emoji === '💸') {
          // Money flies away
          const startX = SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 200;
          translateX.value = startX;
          translateY.value = SCREEN_HEIGHT * 0.6;
          
          scale.value = withDelay(delay + 500, withSpring(scaleFactor));
          
          // Fly away in random directions
          const angle = Math.random() * Math.PI - Math.PI / 2; // Upward arc
          const distance = 200 + Math.random() * 100;
          
          translateX.value = withDelay(
            delay + 500,
            withTiming(startX + Math.cos(angle) * distance, {
              duration: 1000,
              easing: Easing.out(Easing.quad)
            })
          );
          
          translateY.value = withDelay(
            delay + 500,
            withTiming(SCREEN_HEIGHT * 0.6 + Math.sin(angle) * distance, {
              duration: 1000,
              easing: Easing.out(Easing.quad)
            })
          );
          
          opacity.value = withDelay(
            delay + 1000,
            withTiming(0, { duration: 500 })
          );
        } else {
          // Arrows point down
          translateX.value = SCREEN_WIDTH * 0.3 + (index - 13) * 60;
          translateY.value = SCREEN_HEIGHT * 0.5;
          
          scale.value = withDelay(delay + 700, withSpring(scaleFactor));
          
          translateY.value = withDelay(
            delay + 700,
            withTiming(SCREEN_HEIGHT + 50, {
              duration: 800,
              easing: Easing.in(Easing.cubic)
            })
          );
        }
        break;

      // 🤯 HEAD EXPLODE - Head shakes then explodes
      case 'headExplode':
        if (index === 0) {
          // Main head
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = scaleFactor;
          
          // Shake before explosion
          translateX.value = withSequence(
            withRepeat(
              withSequence(
                withTiming(SCREEN_WIDTH / 2 - 10, { duration: 50 }),
                withTiming(SCREEN_WIDTH / 2 + 10, { duration: 50 })
              ),
              5,
              true
            ),
            withTiming(SCREEN_WIDTH / 2, { duration: 0 })
          );
          
          // Scale up before disappearing
          scale.value = withDelay(
            500,
            withSequence(
              withTiming(scaleFactor * 1.5, { duration: 200 }),
              withTiming(0, { duration: 100 })
            )
          );
        } else {
          // Explosion particles
          const angle = (Math.PI * 2 * (index - 1)) / (totalCount - 1);
          const distance = 100 + Math.random() * 100;
          
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = 0;
          
          // Explode outward
          scale.value = withDelay(700, withSpring(scaleFactor));
          
          translateX.value = withDelay(
            700,
            withTiming(SCREEN_WIDTH / 2 + Math.cos(angle) * distance, {
              duration: 500,
              easing: Easing.out(Easing.cubic)
            })
          );
          
          translateY.value = withDelay(
            700,
            withTiming(SCREEN_HEIGHT / 2 + Math.sin(angle) * distance, {
              duration: 500,
              easing: Easing.out(Easing.cubic)
            })
          );
          
          opacity.value = withDelay(
            1000,
            withTiming(0, { duration: 200 })
          );
        }
        break;

      // 😰 SWEAT DROP - Face sweating with drops falling
      case 'sweatDrop':
        if (emoji === '😰') {
          // Sweating faces at top
          translateX.value = SCREEN_WIDTH * 0.25 + index * (SCREEN_WIDTH * 0.25);
          translateY.value = SCREEN_HEIGHT * 0.2;
          scale.value = scaleFactor;
          
          // Slight wobble
          rotation.value = withRepeat(
            withSequence(
              withTiming(-5, { duration: 1000 }),
              withTiming(5, { duration: 1000 })
            ),
            -1,
            true
          );
        } else {
          // Sweat drops
          const faceIndex = Math.floor(index / 5);
          const dropIndex = index % 5;
          const baseX = SCREEN_WIDTH * 0.25 + faceIndex * (SCREEN_WIDTH * 0.25);
          
          translateX.value = baseX + (Math.random() - 0.5) * 40;
          translateY.value = SCREEN_HEIGHT * 0.2 + 40;
          
          scale.value = withDelay(
            delay + Math.random() * 1000,
            withSpring(scaleFactor)
          );
          
          // Fall down
          translateY.value = withDelay(
            delay + Math.random() * 1000,
            withRepeat(
              withTiming(SCREEN_HEIGHT + 50, {
                duration: 2000,
                easing: Easing.in(Easing.quad)
              }),
              -1,
              false
            )
          );
        }
        break;

      // 🎮 VICTORY DANCE - Controllers and trophies dancing
      case 'victoryDance':
        const danceRadius = 100;
        const centerX = SCREEN_WIDTH / 2;
        const centerY = SCREEN_HEIGHT / 2;
        const startAngle = (Math.PI * 2 * index) / totalCount;
        
        // Start in circle formation
        translateX.value = centerX + Math.cos(startAngle) * danceRadius;
        translateY.value = centerY + Math.sin(startAngle) * danceRadius;
        scale.value = withDelay(delay, withSpring(scaleFactor));
        
        // Dance in circle
        const animateDance = () => {
          translateX.value = withRepeat(
            withTiming(centerX + Math.cos(startAngle + Math.PI * 2) * danceRadius, {
              duration: 2000,
              easing: Easing.linear
            }),
            1,
            false
          );
          
          translateY.value = withRepeat(
            withTiming(centerY + Math.sin(startAngle + Math.PI * 2) * danceRadius, {
              duration: 2000,
              easing: Easing.linear
            }),
            1,
            false
          );
        };
        
        animateDance();
        
        // Bounce while dancing
        scale.value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(scaleFactor * 1.2, { duration: 200 }),
              withTiming(scaleFactor, { duration: 200 })
            ),
            5,
            true
          )
        );
        break;

      // 😤 ANGER BURST - Angry face with steam and controllers flying
      case 'angerBurst':
        if (emoji === '😤' && index === 0) {
          // Main angry face
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = scaleFactor;
          
          // Grow with anger
          scale.value = withSequence(
            withTiming(scaleFactor * 1.3, { duration: 500 }),
            withTiming(scaleFactor * 1.1, { duration: 500 })
          );
          
          // Shake with rage
          rotation.value = withRepeat(
            withSequence(
              withTiming(-10, { duration: 100 }),
              withTiming(10, { duration: 100 })
            ),
            5,
            true
          );
        } else if (emoji === '💢') {
          // Anger marks
          const angle = (Math.PI * 2 * index) / 5;
          translateX.value = SCREEN_WIDTH / 2 + Math.cos(angle) * 60;
          translateY.value = SCREEN_HEIGHT / 2 + Math.sin(angle) * 60;
          
          scale.value = withDelay(
            200 + index * 50,
            withSequence(
              withSpring(scaleFactor),
              withDelay(500, withTiming(0, { duration: 300 }))
            )
          );
        } else if (emoji === '🎮') {
          // Flying controllers
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          
          scale.value = withDelay(500, withSpring(scaleFactor));
          
          // Throw controllers
          const throwAngle = index * Math.PI;
          const throwDistance = 200;
          
          translateX.value = withDelay(
            500,
            withTiming(SCREEN_WIDTH / 2 + Math.cos(throwAngle) * throwDistance, {
              duration: 800,
              easing: Easing.out(Easing.quad)
            })
          );
          
          translateY.value = withDelay(
            500,
            withSequence(
              withTiming(SCREEN_HEIGHT / 2 - 50, { duration: 300 }),
              withTiming(SCREEN_HEIGHT / 2 + Math.sin(throwAngle) * throwDistance, {
                duration: 500,
                easing: Easing.in(Easing.quad)
              })
            )
          );
          
          rotation.value = withDelay(
            500,
            withTiming(720, { duration: 800 })
          );
        } else {
          // Explosion effects
          const explodeAngle = Math.random() * Math.PI * 2;
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          
          scale.value = withDelay(800, withSpring(scaleFactor));
          opacity.value = withDelay(1200, withTiming(0, { duration: 300 }));
          
          translateX.value = withDelay(
            800,
            withTiming(SCREEN_WIDTH / 2 + Math.cos(explodeAngle) * 150, {
              duration: 400
            })
          );
          
          translateY.value = withDelay(
            800,
            withTiming(SCREEN_HEIGHT / 2 + Math.sin(explodeAngle) * 150, {
              duration: 400
            })
          );
        }
        break;

      // 😮 POP IN - Shocked faces popping in with excitement
      case 'popIn':
        const popX = Math.random() * SCREEN_WIDTH;
        const popY = SCREEN_HEIGHT * 0.3 + Math.random() * SCREEN_HEIGHT * 0.4;
        
        translateX.value = popX;
        translateY.value = popY;
        
        // Pop in effect
        scale.value = withDelay(
          delay,
          withSequence(
            withSpring(scaleFactor * 1.3, { damping: 5, stiffness: 200 }),
            withSpring(scaleFactor, { damping: 10, stiffness: 150 })
          )
        );
        
        // Wiggle with excitement
        rotation.value = withDelay(
          delay + 300,
          withRepeat(
            withSequence(
              withTiming(-15, { duration: 100 }),
              withTiming(15, { duration: 100 })
            ),
            3,
            true
          )
        );
        
        if (emoji === '🎉') {
          // Confetti pops up
          translateY.value = withDelay(
            delay + 500,
            withTiming(popY - 100, { duration: 500 })
          );
          opacity.value = withDelay(
            delay + 800,
            withTiming(0, { duration: 200 })
          );
        }
        break;

      // F FORM F - Emojis form the letter F
      case 'formF':
        scale.value = 0;
        opacity.value = 0;
        
        // Calculate F formation positions
        let targetX, targetY;
        const fWidth = 150;
        const fHeight = 200;
        const startX = (SCREEN_WIDTH - fWidth) / 2;
        const startY = (SCREEN_HEIGHT - fHeight) / 2;
        
        if (index < totalCount * 0.3) {
          // Top horizontal line
          const progress = index / (totalCount * 0.3);
          targetX = startX + progress * fWidth;
          targetY = startY;
        } else if (index < totalCount * 0.5) {
          // Middle horizontal line (shorter)
          const progress = (index - totalCount * 0.3) / (totalCount * 0.2);
          targetX = startX + progress * (fWidth * 0.7);
          targetY = startY + fHeight * 0.4;
        } else {
          // Vertical line
          const progress = (index - totalCount * 0.5) / (totalCount * 0.5);
          targetX = startX;
          targetY = startY + progress * fHeight;
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
        
        // Drop down after formation
        translateY.value = withDelay(
          1500,
          withTiming(targetY + 50, { duration: 500, easing: Easing.in(Easing.quad) })
        );
        
        opacity.value = withDelay(
          1700,
          withTiming(0, { duration: 300 })
        );
        break;

      // 🏀 SPORTS BOUNCE - Different balls bouncing differently
      case 'sportsBounce':
        const sportX = Math.random() * (SCREEN_WIDTH - 100) + 50;
        translateX.value = sportX;
        translateY.value = -50;
        
        scale.value = withDelay(
          delay + Math.random() * 500,
          withSpring(scaleFactor)
        );
        
        if (emoji === '🏀') {
          // Basketball - high bounce
          translateY.value = withDelay(
            delay,
            withRepeat(
              withSequence(
                withTiming(SCREEN_HEIGHT - 100, {
                  duration: 1000,
                  easing: Easing.in(Easing.quad)
                }),
                withTiming(SCREEN_HEIGHT * 0.3, {
                  duration: 1000,
                  easing: Easing.out(Easing.quad)
                })
              ),
              -1,
              false
            )
          );
          
          rotation.value = withRepeat(
            withTiming(360, { duration: 1000, easing: Easing.linear }),
            -1
          );
        } else if (emoji === '🏈') {
          // Football - tumbling bounce
          translateY.value = withDelay(
            delay,
            withRepeat(
              withSequence(
                withTiming(SCREEN_HEIGHT - 100, {
                  duration: 1200,
                  easing: Easing.in(Easing.quad)
                }),
                withTiming(SCREEN_HEIGHT * 0.5, {
                  duration: 800,
                  easing: Easing.out(Easing.quad)
                })
              ),
              -1,
              false
            )
          );
          
          // Tumble rotation
          rotation.value = withRepeat(
            withTiming(720, { duration: 1500, easing: Easing.linear }),
            -1
          );
        } else {
          // Baseball - lower bounce
          translateY.value = withDelay(
            delay,
            withRepeat(
              withSequence(
                withTiming(SCREEN_HEIGHT - 100, {
                  duration: 800,
                  easing: Easing.in(Easing.quad)
                }),
                withTiming(SCREEN_HEIGHT * 0.6, {
                  duration: 600,
                  easing: Easing.out(Easing.quad)
                })
              ),
              -1,
              false
            )
          );
          
          rotation.value = withRepeat(
            withTiming(180, { duration: 800, easing: Easing.linear }),
            -1
          );
        }
        
        // Horizontal movement
        translateX.value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(sportX + 30, { duration: 2000 }),
              withTiming(sportX - 30, { duration: 2000 })
            ),
            -1,
            true
          )
        );
        break;

      // 😈 CHAOS CIRCLE - Devils circling with fire trail
      case 'chaosCircle':
        const chaosRadius = 120;
        const chaosAngle = (Math.PI * 2 * index) / totalCount;
        const rotationSpeed = emoji === '😈' ? 2000 : 1500;
        
        // Initialize in circle
        translateX.value = SCREEN_WIDTH / 2 + Math.cos(chaosAngle) * chaosRadius;
        translateY.value = SCREEN_HEIGHT / 2 + Math.sin(chaosAngle) * chaosRadius;
        scale.value = withDelay(delay, withSpring(scaleFactor));
        
        // Rotate around center
        const animateCircle = () => {
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const angle = chaosAngle + (elapsed / rotationSpeed) * Math.PI * 2;
            
            translateX.value = SCREEN_WIDTH / 2 + Math.cos(angle) * chaosRadius;
            translateY.value = SCREEN_HEIGHT / 2 + Math.sin(angle) * chaosRadius;
            
            if (emoji === '🔥') {
              // Fire trails behind devils
              opacity.value = 0.6 + Math.sin(elapsed / 200) * 0.4;
              scale.value = scaleFactor * (0.8 + Math.sin(elapsed / 300) * 0.2);
            }
            
            animationRef.current = requestAnimationFrame(animate);
          };
          animate();
        };
        
        animateCircle();
        break;

      // 🥵 TEMPERATURE FLUX - Alternating hot and cold
      case 'temperatureFlux':
        const fluxX = Math.random() * SCREEN_WIDTH;
        const fluxY = SCREEN_HEIGHT * 0.2 + Math.random() * SCREEN_HEIGHT * 0.6;
        
        translateX.value = fluxX;
        translateY.value = fluxY;
        scale.value = withDelay(delay, withSpring(scaleFactor));
        
        if (emoji === '🥵') {
          // Main sweating faces
          scale.value = withRepeat(
            withSequence(
              withTiming(scaleFactor * 1.2, { duration: 1000 }),
              withTiming(scaleFactor, { duration: 1000 })
            ),
            -1,
            true
          );
        } else if (emoji === '🔥') {
          // Fire rises
          translateY.value = withRepeat(
            withTiming(fluxY - 150, { duration: 2000, easing: Easing.out(Easing.quad) }),
            -1,
            false
          );
          
          opacity.value = withRepeat(
            withSequence(
              withTiming(1, { duration: 1000 }),
              withTiming(0, { duration: 1000 })
            ),
            -1,
            false
          );
        } else {
          // Water drops fall
          translateY.value = withDelay(
            delay + 1000,
            withRepeat(
              withTiming(fluxY + 150, { duration: 1500, easing: Easing.in(Easing.quad) }),
              -1,
              false
            )
          );
          
          translateX.value = withRepeat(
            withSequence(
              withTiming(fluxX - 20, { duration: 750 }),
              withTiming(fluxX + 20, { duration: 750 })
            ),
            -1,
            true
          );
        }
        break;

      // 🧂 SALT POUR - Salt shakers pouring
      case 'saltPour':
        if (emoji === '🧂') {
          // Salt shakers at top
          const shakerX = SCREEN_WIDTH * 0.3 + (index % 4) * SCREEN_WIDTH * 0.15;
          translateX.value = shakerX;
          translateY.value = SCREEN_HEIGHT * 0.1;
          scale.value = scaleFactor;
          
          // Tilt to pour
          rotation.value = withRepeat(
            withSequence(
              withTiming(45, { duration: 1000 }),
              withTiming(0, { duration: 1000 })
            ),
            -1,
            true
          );
          
          // Shake motion
          translateX.value = withRepeat(
            withSequence(
              withTiming(shakerX - 5, { duration: 100 }),
              withTiming(shakerX + 5, { duration: 100 })
            ),
            -1,
            true
          );
        } else {
          // Crying faces at bottom
          translateX.value = SCREEN_WIDTH * 0.25 + index * SCREEN_WIDTH * 0.25;
          translateY.value = SCREEN_HEIGHT * 0.8;
          scale.value = scaleFactor;
          
          // Bob up and down sadly
          translateY.value = withRepeat(
            withSequence(
              withTiming(SCREEN_HEIGHT * 0.8 - 20, { duration: 2000 }),
              withTiming(SCREEN_HEIGHT * 0.8, { duration: 2000 })
            ),
            -1,
            true
          );
        }
        
        // Salt particles (reuse some salt shakers as particles)
        if (emoji === '🧂' && index > 3) {
          const shakerIndex = index % 4;
          const baseX = SCREEN_WIDTH * 0.3 + shakerIndex * SCREEN_WIDTH * 0.15;
          
          translateX.value = baseX + (Math.random() - 0.5) * 30;
          translateY.value = SCREEN_HEIGHT * 0.15;
          scale.value = scaleFactor * 0.5;
          
          // Fall as salt
          translateY.value = withDelay(
            Math.random() * 2000,
            withRepeat(
              withTiming(SCREEN_HEIGHT * 0.7, {
                duration: 2000,
                easing: Easing.in(Easing.quad)
              }),
              -1,
              false
            )
          );
          
          opacity.value = withRepeat(
            withSequence(
              withTiming(0.8, { duration: 500 }),
              withTiming(0, { duration: 1500 })
            ),
            -1,
            false
          );
        }
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
  }, [emoji, index, physics, duration, size, totalCount]);

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
// File: Update components/effects/EmojiEffectsManager.tsx
// ========================================

// Add to imports
import { BATCH3_EFFECTS } from './constants/batch3Effects';
import { Batch3Particle } from './particles/Batch3Particles';

// Update ALL_EFFECTS to include batch 3
export const ALL_EFFECTS = {
  ...EFFECT_CONFIGS,  // Batch 1
  ...BATCH2_EFFECTS,  // Batch 2
  ...BATCH3_EFFECTS   // Batch 3
};

// In the render section, update to handle batch 3 physics
const renderParticle = (particle: any, index: number) => {
  const config = ALL_EFFECTS[effectId];
  
  // Check which batch the physics type belongs to
  const batch1Physics = ['float', 'floatUp', 'fall', 'explode', 'launch'];
  const batch2Physics = ['bounce', 'spinAway', 'zoomDance', 'gentleFloat', 'explodeOut', 
                        'lookAround', 'formLetter', 'riseUp', 'slideDown', 'flexPump'];
  const batch3Physics = ['crashDown', 'headExplode', 'sweatDrop', 'victoryDance', 
                        'angerBurst', 'popIn', 'formF', 'sportsBounce', 
                        'chaosCircle', 'temperatureFlux', 'saltPour'];
  
  if (batch1Physics.includes(config.physics)) {
    return (
      <BaseParticle
        key={particle.id}
        emoji={particle.emoji}
        index={index}
        physics={config.physics}
        duration={config.duration === 'continuous' ? null : config.duration}
        size={particle.size}
        onComplete={config.duration !== 'continuous' ? handleParticleComplete : undefined}
      />
    );
  } else if (batch2Physics.includes(config.physics)) {
    return (
      <Batch2Particle
        key={particle.id}
        emoji={particle.emoji}
        index={index}
        physics={config.physics}
        duration={config.duration === 'continuous' ? null : config.duration}
        size={particle.size}
        totalCount={particles.length}
        letterType={config.id === 'big_w' ? 'W' : config.id === 'big_l' ? 'L' : undefined}
        onComplete={config.duration !== 'continuous' ? handleParticleComplete : undefined}
      />
    );
  } else if (batch3Physics.includes(config.physics)) {
    return (
      <Batch3Particle
        key={particle.id}
        emoji={particle.emoji}
        index={index}
        physics={config.physics}
        duration={config.duration === 'continuous' ? null : config.duration}
        size={particle.size}
        totalCount={particles.length}
        onComplete={config.duration !== 'continuous' ? handleParticleComplete : undefined}
      />
    );
  }
  
  return null;
};

// Update the main render to use the new function
return (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    {particles.map((particle, index) => renderParticle(particle, index))}
  </View>
);

// ========================================
// File: Update types.ts to include new physics
// ========================================

export type PhysicsType = 
  // Batch 1
  | 'float' | 'floatUp' | 'fall' | 'explode' | 'launch' | 'bounce' | 'orbit' | 'wave'
  // Batch 2
  | 'bounce' | 'spinAway' | 'zoomDance' | 'gentleFloat' | 'explodeOut' 
  | 'lookAround' | 'formLetter' | 'riseUp' | 'slideDown' | 'flexPump'
  // Batch 3
  | 'crashDown' | 'headExplode' | 'sweatDrop' | 'victoryDance' 
  | 'angerBurst' | 'popIn' | 'formF' | 'sportsBounce' 
  | 'chaosCircle' | 'temperatureFlux' | 'saltPour';