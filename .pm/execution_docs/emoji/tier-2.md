// ========================================
// TIER 2 EFFECTS: SPECIFIC BADGE REQUIREMENTS
// ========================================
// This implements all Tier 2 effects that require specific badges to unlock
// Total: 12 effects with unique unlock requirements
//
// EFFECTS:
// - fire_level_3: 🔥 Inferno Mode (hot_streak badge)
// - money_level_3: 💰 Make It Rain (profit_leader badge)
// - celebration_level_3: 🎆 Epic Celebration (perfect_day badge)
// - tears_level_3: 🌊 Waterworks (fade_material badge)
// - cool_level_3: 💎 Untouchable (sharp badge)
// - sports_level_3: 🏆 Championship Mode (sport_specific badges)
// - sparkle_level_3: 🌠 Cosmic (special_achievement badge)
// - slot_machine: 🎰 Jackpot (gambling_achievement badge)
// - toxic: ☠️ Toxic Trait (controversial badge)
// - rizz: 😏 W Rizz (charm badge)
// - main_character: 🌟 Main Character (star_player badge)
// - bag_alert: 💼 Bag Alert (profit_leader badge)
// ========================================

// ========================================
// File: components/effects/constants/tier2Effects.ts
// ========================================

import { EffectConfig } from '../types';

export const TIER2_EFFECTS: Record<string, EffectConfig> = {
  // 🔥 FIRE LEVEL 3 - INFERNO MODE
  fire_level_3: {
    id: 'fire_level_3',
    name: 'Inferno Mode',
    tier: 2,
    category: 'wins',
    particles: [
      { emoji: '🔥', count: 40, size: { min: 20, max: 60 } },
      { emoji: '🌋', count: 3, size: { min: 70, max: 90 } },
      { emoji: '💥', count: 8, size: { min: 40, max: 60 } }
    ],
    physics: 'infernoEruption',
    duration: 'continuous',
    unlockRequirement: {
      type: 'badge',
      value: 'hot_streak'
    }
  },

  // 💰 MONEY LEVEL 3 - MAKE IT RAIN
  money_level_3: {
    id: 'money_level_3',
    name: 'Make It Rain',
    tier: 2,
    category: 'wins',
    particles: [
      { emoji: '💵', count: 20, size: { min: 30, max: 45 } },
      { emoji: '💴', count: 15, size: { min: 30, max: 45 } },
      { emoji: '💶', count: 15, size: { min: 30, max: 45 } },
      { emoji: '💷', count: 10, size: { min: 30, max: 45 } },
      { emoji: '💰', count: 5, size: { min: 50, max: 70 } },
      { emoji: '💸', count: 10, size: { min: 35, max: 50 } },
      { emoji: '🤑', count: 3, size: { min: 60, max: 80 } }
    ],
    physics: 'moneyTornado',
    duration: 'continuous',
    unlockRequirement: {
      type: 'badge',
      value: 'profit_leader'
    }
  },

  // 🎆 CELEBRATION LEVEL 3 - EPIC CELEBRATION
  celebration_level_3: {
    id: 'celebration_level_3',
    name: 'Epic Celebration',
    tier: 2,
    category: 'wins',
    particles: [
      { emoji: '🎉', count: 15, size: { min: 30, max: 50 } },
      { emoji: '🎊', count: 15, size: { min: 30, max: 50 } },
      { emoji: '🎈', count: 10, size: { min: 35, max: 55 } },
      { emoji: '🎆', count: 8, size: { min: 50, max: 70 } },
      { emoji: '🎇', count: 8, size: { min: 45, max: 65 } },
      { emoji: '✨', count: 20, size: { min: 15, max: 30 } },
      { emoji: '💫', count: 15, size: { min: 20, max: 35 } },
      { emoji: '⭐', count: 10, size: { min: 25, max: 40 } }
    ],
    physics: 'fireworksShow',
    duration: 5000,
    unlockRequirement: {
      type: 'badge',
      value: 'perfect_day'
    }
  },

  // 🌊 TEARS LEVEL 3 - WATERWORKS
  tears_level_3: {
    id: 'tears_level_3',
    name: 'Waterworks',
    tier: 2,
    category: 'losses',
    particles: [
      { emoji: '😭', count: 8, size: { min: 50, max: 70 } },
      { emoji: '💧', count: 30, size: { min: 15, max: 30 } },
      { emoji: '💦', count: 20, size: { min: 20, max: 40 } },
      { emoji: '🌊', count: 5, size: { min: 80, max: 100 } }
    ],
    physics: 'floodingTears',
    duration: 'continuous',
    unlockRequirement: {
      type: 'badge',
      value: 'fade_material'
    }
  },

  // 💎 COOL LEVEL 3 - UNTOUCHABLE
  cool_level_3: {
    id: 'cool_level_3',
    name: 'Untouchable',
    tier: 2,
    category: 'wins',
    particles: [
      { emoji: '😎', count: 5, size: { min: 50, max: 70 } },
      { emoji: '🕶️', count: 8, size: { min: 40, max: 60 } },
      { emoji: '💎', count: 20, size: { min: 20, max: 40 } },
      { emoji: '✨', count: 15, size: { min: 15, max: 25 } }
    ],
    physics: 'diamondAura',
    duration: 'continuous',
    unlockRequirement: {
      type: 'badge',
      value: 'sharp'
    }
  },

  // 🏆 SPORTS LEVEL 3 - CHAMPIONSHIP MODE
  sports_level_3: {
    id: 'sports_level_3',
    name: 'Championship Mode',
    tier: 2,
    category: 'hype',
    particles: [
      { emoji: '🏆', count: 3, size: { min: 70, max: 90 } },
      { emoji: '🥇', count: 5, size: { min: 50, max: 70 } },
      { emoji: '🎯', count: 3, size: { min: 60, max: 80 } },
      { emoji: '🏀', count: 8, size: { min: 35, max: 45 } },
      { emoji: '🏈', count: 8, size: { min: 35, max: 45 } },
      { emoji: '⚾', count: 8, size: { min: 35, max: 45 } }
    ],
    physics: 'championOrbit',
    duration: 'continuous',
    unlockRequirement: {
      type: 'badge',
      value: 'sport_champion'
    }
  },

  // 🌠 SPARKLE LEVEL 3 - COSMIC
  sparkle_level_3: {
    id: 'sparkle_level_3',
    name: 'Cosmic',
    tier: 2,
    category: 'wildcards',
    particles: [
      { emoji: '✨', count: 30, size: { min: 15, max: 35 } },
      { emoji: '⭐', count: 20, size: { min: 20, max: 40 } },
      { emoji: '💫', count: 15, size: { min: 25, max: 45 } },
      { emoji: '🌟', count: 10, size: { min: 35, max: 55 } },
      { emoji: '🌠', count: 5, size: { min: 50, max: 70 } },
      { emoji: '☄️', count: 3, size: { min: 60, max: 80 } }
    ],
    physics: 'galaxySwirl',
    duration: 'continuous',
    unlockRequirement: {
      type: 'badge',
      value: 'special_achievement'
    }
  },

  // 🎰 SLOT MACHINE - JACKPOT
  slot_machine: {
    id: 'slot_machine',
    name: 'Jackpot',
    tier: 2,
    category: 'wildcards',
    particles: [
      { emoji: '🎰', count: 1, size: { min: 100, max: 100 } },
      { emoji: '7️⃣', count: 9, size: { min: 40, max: 50 } },
      { emoji: '🍒', count: 6, size: { min: 35, max: 45 } },
      { emoji: '🍋', count: 6, size: { min: 35, max: 45 } }
    ],
    physics: 'slotSpin',
    duration: 3000,
    unlockRequirement: {
      type: 'badge',
      value: 'gambling_achievement'
    }
  },

  // ☠️ TOXIC TRAIT
  toxic: {
    id: 'toxic',
    name: 'Toxic Trait',
    tier: 2,
    category: 'hype',
    particles: [
      { emoji: '☠️', count: 10, size: { min: 30, max: 50 } },
      { emoji: '💚', count: 15, size: { min: 25, max: 40 } },
      { emoji: '🧪', count: 8, size: { min: 35, max: 55 } }
    ],
    physics: 'toxicBubble',
    duration: 'continuous',
    unlockRequirement: {
      type: 'badge',
      value: 'controversial'
    }
  },

  // 😏 W RIZZ
  rizz: {
    id: 'rizz',
    name: 'W Rizz',
    tier: 2,
    category: 'vibes',
    particles: [
      { emoji: '😏', count: 5, size: { min: 50, max: 70 } },
      { emoji: '💫', count: 15, size: { min: 20, max: 35 } },
      { emoji: '🌹', count: 10, size: { min: 30, max: 45 } }
    ],
    physics: 'smoothCharm',
    duration: 3000,
    unlockRequirement: {
      type: 'badge',
      value: 'charm'
    }
  },

  // 🌟 MAIN CHARACTER
  main_character: {
    id: 'main_character',
    name: 'Main Character',
    tier: 2,
    category: 'vibes',
    particles: [
      { emoji: '🌟', count: 1, size: { min: 100, max: 100 } },
      { emoji: '🎬', count: 4, size: { min: 50, max: 60 } },
      { emoji: '✨', count: 20, size: { min: 15, max: 30 } }
    ],
    physics: 'spotlight',
    duration: 'continuous',
    unlockRequirement: {
      type: 'badge',
      value: 'star_player'
    }
  },

  // 💼 BAG ALERT (Full Version)
  bag_alert: {
    id: 'bag_alert',
    name: 'Bag Alert',
    tier: 2,
    category: 'betting',
    particles: [
      { emoji: '💼', count: 1, size: { min: 80, max: 80 } },
      { emoji: '🚨', count: 6, size: { min: 40, max: 50 } },
      { emoji: '💰', count: 20, size: { min: 30, max: 45 } }
    ],
    physics: 'bagBurst',
    duration: 'continuous',
    unlockRequirement: {
      type: 'badge',
      value: 'profit_leader'
    }
  }
};

// ========================================
// File: components/effects/particles/Tier2Particles.tsx
// ========================================

import React, { useEffect, useRef } from 'react';
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

interface Tier2ParticleProps {
  emoji: string;
  index: number;
  physics: PhysicsType;
  duration: number | null;
  size?: { min: number; max: number };
  totalCount?: number;
  onComplete?: () => void;
}

export const Tier2Particle: React.FC<Tier2ParticleProps> = ({
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
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const delay = index * 30;
    const particleSize = size.min + Math.random() * (size.max - size.min);
    const scaleFactor = particleSize / 30;

    switch (physics) {
      // 🔥 INFERNO ERUPTION - Volcanic fire effect
      case 'infernoEruption':
        if (emoji === '🌋') {
          // Volcanoes at base
          const volcanoX = SCREEN_WIDTH * 0.2 + (index * SCREEN_WIDTH * 0.3);
          translateX.value = volcanoX;
          translateY.value = SCREEN_HEIGHT - 100;
          scale.value = scaleFactor;
          
          // Rumbling effect
          translateX.value = withRepeat(
            withSequence(
              withTiming(volcanoX - 5, { duration: 100 }),
              withTiming(volcanoX + 5, { duration: 100 })
            ),
            -1,
            true
          );
          
          // Eruption pulse
          scale.value = withRepeat(
            withSequence(
              withTiming(scaleFactor, { duration: 2000 }),
              withTiming(scaleFactor * 1.2, { duration: 500 }),
              withTiming(scaleFactor, { duration: 500 })
            ),
            -1,
            false
          );
        } else if (emoji === '💥') {
          // Explosion bursts
          const burstDelay = 2500 + (index % 3) * 500;
          const volcanoIndex = Math.floor(index / 3);
          const baseX = SCREEN_WIDTH * 0.2 + (volcanoIndex * SCREEN_WIDTH * 0.3);
          
          translateX.value = baseX;
          translateY.value = SCREEN_HEIGHT - 100;
          scale.value = 0;
          
          // Periodic eruptions
          const eruptAnimation = () => {
            setTimeout(() => {
              // Burst upward
              translateY.value = withTiming(SCREEN_HEIGHT - 300, {
                duration: 300,
                easing: Easing.out(Easing.cubic)
              });
              
              scale.value = withSequence(
                withSpring(scaleFactor * 1.5),
                withTiming(0, { duration: 500 })
              );
              
              opacity.value = withSequence(
                withTiming(1, { duration: 300 }),
                withTiming(0, { duration: 500 })
              );
              
              // Reset and repeat
              setTimeout(() => {
                translateY.value = SCREEN_HEIGHT - 100;
                opacity.value = 1;
                eruptAnimation();
              }, 1000);
            }, burstDelay);
          };
          
          eruptAnimation();
        } else {
          // Fire particles with intense movement
          const fireX = Math.random() * SCREEN_WIDTH;
          translateX.value = fireX;
          translateY.value = SCREEN_HEIGHT - 50;
          
          scale.value = withDelay(delay, withSpring(scaleFactor));
          
          // Intense upward movement
          const intenseFireAnimation = () => {
            let time = 0;
            const baseSpeed = 80 + Math.random() * 40;
            
            const animate = () => {
              time += 0.016;
              
              // Chaotic movement
              const chaosX = Math.sin(time * 5 + index) * 40 + 
                           Math.sin(time * 8 + index * 2) * 20 +
                           Math.cos(time * 3) * 15;
              const riseY = SCREEN_HEIGHT - 50 - (time * baseSpeed) % (SCREEN_HEIGHT + 200);
              
              translateX.value = fireX + chaosX;
              translateY.value = riseY;
              
              // Flickering
              scale.value = scaleFactor * (0.8 + Math.sin(time * 10) * 0.4);
              rotation.value = Math.sin(time * 4) * 30;
              
              if (riseY < -100) {
                translateX.value = Math.random() * SCREEN_WIDTH;
                translateY.value = SCREEN_HEIGHT;
                time = 0;
              }
              
              animationRef.current = requestAnimationFrame(animate);
            };
            animate();
          };
          
          setTimeout(intenseFireAnimation, delay);
        }
        break;

      // 💰 MONEY TORNADO - Swirling money vortex
      case 'moneyTornado':
        const tornadoCenter = SCREEN_WIDTH / 2;
        const layer = Math.floor(index / 10); // Different layers of tornado
        const angleInLayer = (index % 10) * (Math.PI * 2 / 10);
        
        scale.value = withDelay(delay, withSpring(scaleFactor));
        
        // Tornado animation
        const tornadoAnimation = () => {
          let time = 0;
          
          const animate = () => {
            time += 0.02;
            
            // Spiral parameters
            const currentAngle = angleInLayer + time * 2;
            const radiusBase = 50 + layer * 30;
            const radius = radiusBase + Math.sin(time * 3) * 20;
            const height = SCREEN_HEIGHT - 100 - (time * 100 + layer * 100) % SCREEN_HEIGHT;
            
            translateX.value = tornadoCenter + Math.cos(currentAngle) * radius;
            translateY.value = height;
            
            // Rotation for 3D effect
            rotation.value = currentAngle * (180 / Math.PI);
            
            // Scale changes with height
            const heightFactor = 1 - (height / SCREEN_HEIGHT) * 0.5;
            scale.value = scaleFactor * heightFactor;
            
            // Money bag explosions
            if (emoji === '💰' && Math.random() < 0.001) {
              // Burst effect
              scale.value = withSequence(
                withSpring(scaleFactor * 2),
                withTiming(0, { duration: 500 })
              );
            }
            
            // Face emoji reactions
            if (emoji === '🤑') {
              scale.value = scaleFactor * (1 + Math.sin(time * 5) * 0.2);
            }
            
            animationRef.current = requestAnimationFrame(animate);
          };
          animate();
        };
        
        setTimeout(tornadoAnimation, delay);
        break;

      // 🎆 FIREWORKS SHOW - Multi-stage fireworks
      case 'fireworksShow':
        // Different firework types
        const fireworkTypes = {
          '🎆': { stages: 3, spread: 200, trails: true },
          '🎇': { stages: 2, spread: 150, trails: true },
          '🎉': { stages: 1, spread: 100, trails: false },
          '🎊': { stages: 1, spread: 120, trails: false }
        };
        
        const type = fireworkTypes[emoji] || { stages: 1, spread: 100, trails: false };
        
        if (emoji === '🎆' || emoji === '🎇') {
          // Launch positions
          const launchX = SCREEN_WIDTH * 0.2 + (index * SCREEN_WIDTH * 0.15);
          const launchDelay = index * 500;
          
          translateX.value = launchX;
          translateY.value = SCREEN_HEIGHT;
          scale.value = 0;
          
          setTimeout(() => {
            // Launch upward
            scale.value = withSpring(scaleFactor);
            
            translateY.value = withTiming(SCREEN_HEIGHT * 0.3, {
              duration: 1000,
              easing: Easing.out(Easing.cubic)
            });
            
            // Trail effect
            opacity.value = withRepeat(
              withSequence(
                withTiming(0.8, { duration: 100 }),
                withTiming(1, { duration: 100 })
              ),
              5,
              true
            );
            
            // Explode at peak
            setTimeout(() => {
              scale.value = withSequence(
                withTiming(scaleFactor * 3, { duration: 200 }),
                withTiming(0, { duration: 800 })
              );
              
              opacity.value = withTiming(0, { duration: 1000 });
            }, 1000);
          }, launchDelay);
        } else {
          // Burst particles
          const burstX = SCREEN_WIDTH * 0.2 + ((index % 5) * SCREEN_WIDTH * 0.15);
          const burstY = SCREEN_HEIGHT * 0.2 + ((index % 3) * SCREEN_HEIGHT * 0.2);
          const burstDelay = Math.floor(index / 5) * 600;
          
          translateX.value = burstX;
          translateY.value = burstY;
          scale.value = 0;
          
          setTimeout(() => {
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            
            scale.value = withSpring(scaleFactor);
            
            translateX.value = withTiming(
              burstX + Math.cos(angle) * distance,
              { duration: 1000, easing: Easing.out(Easing.cubic) }
            );
            
            translateY.value = withSequence(
              withTiming(burstY + Math.sin(angle) * distance - 50, {
                duration: 500,
                easing: Easing.out(Easing.cubic)
              }),
              withTiming(burstY + Math.sin(angle) * distance + 100, {
                duration: 500,
                easing: Easing.in(Easing.quad)
              })
            );
            
            rotation.value = withTiming(720, { duration: 1000 });
            
            opacity.value = withSequence(
              withTiming(1, { duration: 200 }),
              withTiming(0, { duration: 800 })
            );
          }, burstDelay);
        }
        break;

      // 🌊 FLOODING TEARS - Wave effect at bottom
      case 'floodingTears':
        if (emoji === '🌊') {
          // Wave at bottom
          const waveX = SCREEN_WIDTH * 0.2 * index;
          translateX.value = waveX;
          translateY.value = SCREEN_HEIGHT - 50;
          scale.value = scaleFactor;
          
          // Wave motion
          const waveAnimation = () => {
            let time = 0;
            
            const animate = () => {
              time += 0.02;
              
              // Sine wave movement
              const waveOffset = Math.sin(time + index * 0.5) * 30;
              translateY.value = SCREEN_HEIGHT - 50 + waveOffset;
              
              // Slight rotation for wave effect
              rotation.value = Math.sin(time + index * 0.5) * 10;
              
              // Scale pulsing
              scale.value = scaleFactor * (1 + Math.sin(time * 2) * 0.1);
              
              animationRef.current = requestAnimationFrame(animate);
            };
            animate();
          };
          
          waveAnimation();
        } else if (emoji === '😭') {
          // Multiple crying faces
          const faceX = SCREEN_WIDTH * 0.15 + (index * SCREEN_WIDTH * 0.1);
          translateX.value = faceX;
          translateY.value = SCREEN_HEIGHT * 0.1 + (index * 30);
          scale.value = scaleFactor;
          
          // Bobbing motion
          translateY.value = withRepeat(
            withSequence(
              withTiming(translateY.value - 10, { duration: 1000 }),
              withTiming(translateY.value + 10, { duration: 1000 })
            ),
            -1,
            true
          );
          
          // Shaking with sadness
          translateX.value = withRepeat(
            withSequence(
              withTiming(faceX - 5, { duration: 100 }),
              withTiming(faceX + 5, { duration: 100 })
            ),
            -1,
            true
          );
        } else {
          // Tear drops creating flood
          const dropX = Math.random() * SCREEN_WIDTH;
          const startY = SCREEN_HEIGHT * 0.2 + Math.random() * 200;
          
          translateX.value = dropX;
          translateY.value = startY;
          scale.value = withDelay(delay, withSpring(scaleFactor));
          
          // Fall and accumulate
          translateY.value = withDelay(
            delay,
            withTiming(SCREEN_HEIGHT - 100 + Math.random() * 50, {
              duration: 2000,
              easing: Easing.in(Easing.quad)
            })
          );
          
          // Spread on impact
          translateX.value = withDelay(
            delay + 2000,
            withTiming(dropX + (Math.random() - 0.5) * 100, {
              duration: 500
            })
          );
          
          // Fade into flood
          opacity.value = withDelay(
            delay + 2000,
            withTiming(0.3, { duration: 1000 })
          );
        }
        break;

      // 💎 DIAMOND AURA - Sparkling diamond field
      case 'diamondAura':
        if (emoji === '😎' || emoji === '🕶️') {
          // Sunglasses formation
          const glassesX = SCREEN_WIDTH * 0.3 + (index * SCREEN_WIDTH * 0.1);
          const glassesY = SCREEN_HEIGHT * 0.3 + (Math.floor(index / 5) * 80);
          
          translateX.value = glassesX;
          translateY.value = -100;
          
          // Slide in with style
          translateY.value = withDelay(
            index * 100,
            withSpring(glassesY, { damping: 10, stiffness: 80 })
          );
          
          scale.value = withDelay(
            index * 100,
            withSpring(scaleFactor)
          );
          
          // Cool float
          translateX.value = withDelay(
            index * 100 + 500,
            withRepeat(
              withSequence(
                withTiming(glassesX - 10, { duration: 2000 }),
                withTiming(glassesX + 10, { duration: 2000 })
              ),
              -1,
              true
            )
          );
        } else if (emoji === '💎') {
          // Diamond field effect
          const fieldX = Math.random() * SCREEN_WIDTH;
          const fieldY = SCREEN_HEIGHT * 0.2 + Math.random() * SCREEN_HEIGHT * 0.6;
          
          translateX.value = fieldX;
          translateY.value = fieldY;
          scale.value = 0;
          
          // Appear with sparkle
          scale.value = withDelay(
            Math.random() * 1000,
            withSequence(
              withSpring(scaleFactor * 1.5),
              withSpring(scaleFactor)
            )
          );
          
          // Floating motion
          const floatAnimation = () => {
            translateY.value = withRepeat(
              withSequence(
                withTiming(fieldY - 20, { duration: 2000 + Math.random() * 1000 }),
                withTiming(fieldY + 20, { duration: 2000 + Math.random() * 1000 })
              ),
              -1,
              true
            );
            
            // Diamond rotation
            rotation.value = withRepeat(
              withTiming(360, { duration: 5000 }),
              -1
            );
          };
          
          setTimeout(floatAnimation, Math.random() * 1000);
        } else {
          // Sparkle effects
          const sparkleX = Math.random() * SCREEN_WIDTH;
          const sparkleY = SCREEN_HEIGHT * 0.2 + Math.random() * SCREEN_HEIGHT * 0.6;
          
          translateX.value = sparkleX;
          translateY.value = sparkleY;
          
          // Twinkling
          const twinkleAnimation = () => {
            scale.value = withRepeat(
              withSequence(
                withTiming(0, { duration: 200 }),
                withSpring(scaleFactor * 1.2),
                withTiming(scaleFactor, { duration: 300 }),
                withTiming(0, { duration: 200 }),
                withTiming(0, { duration: Math.random() * 2000 })
              ),
              -1,
              false
            );
            
            opacity.value = withRepeat(
              withSequence(
                withTiming(0, { duration: 200 }),
                withTiming(1, { duration: 200 }),
                withTiming(1, { duration: 300 }),
                withTiming(0, { duration: 200 }),
                withTiming(0, { duration: Math.random() * 2000 })
              ),
              -1,
              false
            );
          };
          
          setTimeout(twinkleAnimation, Math.random() * 2000);
        }
        break;

      // 🏆 CHAMPION ORBIT - Trophies orbiting with sports balls
      case 'championOrbit':
        const orbitCenterX = SCREEN_WIDTH / 2;
        const orbitCenterY = SCREEN_HEIGHT / 2;
        
        if (emoji === '🏆' || emoji === '🥇' || emoji === '🎯') {
          // Central trophies
          const trophyRadius = 80 + (index * 40);
          const trophyAngle = (index * Math.PI * 2) / 3;
          
          translateX.value = orbitCenterX + Math.cos(trophyAngle) * trophyRadius;
          translateY.value = orbitCenterY + Math.sin(trophyAngle) * trophyRadius;
          scale.value = scaleFactor;
          
          // Slow rotation
          const trophyOrbit = () => {
            let time = 0;
            
            const animate = () => {
              time += 0.01;
              
              const angle = trophyAngle + time;
              translateX.value = orbitCenterX + Math.cos(angle) * trophyRadius;
              translateY.value = orbitCenterY + Math.sin(angle) * trophyRadius;
              
              // Trophy spin
              rotation.value = (time * 50) % 360;
              
              // Pulse
              scale.value = scaleFactor * (1 + Math.sin(time * 2) * 0.1);
              
              animationRef.current = requestAnimationFrame(animate);
            };
            animate();
          };
          
          trophyOrbit();
        } else {
          // Sports balls in outer orbit
          const ballRadius = 150 + Math.random() * 50;
          const ballAngle = (index * Math.PI * 2) / 24;
          const orbitSpeed = 0.02 + Math.random() * 0.01;
          
          scale.value = scaleFactor;
          
          const ballOrbit = () => {
            let time = 0;
            
            const animate = () => {
              time += orbitSpeed;
              
              const angle = ballAngle + time;
              translateX.value = orbitCenterX + Math.cos(angle) * ballRadius;
              translateY.value = orbitCenterY + Math.sin(angle) * ballRadius;
              
              // Ball rotation
              rotation.value = (time * 200) % 360;
              
              animationRef.current = requestAnimationFrame(animate);
            };
            animate();
          };
          
          setTimeout(ballOrbit, delay);
        }
        break;

      // 🌠 GALAXY SWIRL - Complex cosmic effect
      case 'galaxySwirl':
        const galaxyCenterX = SCREEN_WIDTH / 2;
        const galaxyCenterY = SCREEN_HEIGHT / 2;
        
        if (emoji === '☄️') {
          // Comets
          const cometDelay = index * 3000;
          
          setTimeout(() => {
            // Random trajectory
            const startX = Math.random() < 0.5 ? -50 : SCREEN_WIDTH + 50;
            const startY = Math.random() * SCREEN_HEIGHT * 0.5;
            const endX = Math.random() < 0.5 ? SCREEN_WIDTH + 50 : -50;
            const endY = SCREEN_HEIGHT * 0.5 + Math.random() * SCREEN_HEIGHT * 0.5;
            
            translateX.value = startX;
            translateY.value = startY;
            scale.value = scaleFactor;
            
            // Comet trail
            translateX.value = withTiming(endX, {
              duration: 2000,
              easing: Easing.inOut(Easing.quad)
            });
            
            translateY.value = withTiming(endY, {
              duration: 2000,
              easing: Easing.inOut(Easing.quad)
            });
            
            // Fade trail
            opacity.value = withSequence(
              withTiming(1, { duration: 500 }),
              withTiming(0, { duration: 1500 })
            );
            
            rotation.value = withTiming(
              Math.atan2(endY - startY, endX - startX) * (180 / Math.PI),
              { duration: 100 }
            );
          }, cometDelay);
        } else if (emoji === '🌠') {
          // Shooting stars
          const shootDelay = index * 2000;
          
          setTimeout(() => {
            const shootAngle = Math.random() * Math.PI * 2;
            const shootDistance = 200 + Math.random() * 200;
            
            translateX.value = galaxyCenterX + Math.random() * 200 - 100;
            translateY.value = galaxyCenterY + Math.random() * 200 - 100;
            scale.value = scaleFactor;
            
            translateX.value = withTiming(
              translateX.value + Math.cos(shootAngle) * shootDistance,
              { duration: 1000 }
            );
            
            translateY.value = withTiming(
              translateY.value + Math.sin(shootAngle) * shootDistance,
              { duration: 1000 }
            );
            
            scale.value = withTiming(0, { duration: 1000 });
            opacity.value = withTiming(0, { duration: 1000 });
          }, shootDelay);
        } else {
          // Regular stars in spiral
          const layer = Math.floor(index / 10);
          const spiralAngle = (index % 10) * (Math.PI * 2 / 10);
          const baseRadius = 50 + layer * 40;
          
          scale.value = withDelay(delay, withSpring(scaleFactor));
          
          const galaxyAnimation = () => {
            let time = 0;
            
            const animate = () => {
              time += 0.008;
              
              // Logarithmic spiral
              const spiralGrowth = 1 + time * 0.1;
              const currentAngle = spiralAngle + time * (1 - layer * 0.2);
              const currentRadius = baseRadius * spiralGrowth;
              
              translateX.value = galaxyCenterX + Math.cos(currentAngle) * currentRadius;
              translateY.value = galaxyCenterY + Math.sin(currentAngle) * currentRadius;
              
              // Twinkle
              if (emoji === '✨' || emoji === '💫') {
                scale.value = scaleFactor * (0.8 + Math.sin(time * 5 + index) * 0.3);
                opacity.value = 0.7 + Math.sin(time * 3 + index) * 0.3;
              }
              
              // Reset at edge
              if (currentRadius > 300) {
                time = 0;
              }
              
              animationRef.current = requestAnimationFrame(animate);
            };
            animate();
          };
          
          setTimeout(galaxyAnimation, delay);
        }
        break;

      // 🎰 SLOT SPIN - Slot machine reels
      case 'slotSpin':
        if (emoji === '🎰') {
          // Main slot machine
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = scaleFactor;
          
          // Shake on pull
          translateX.value = withSequence(
            withTiming(SCREEN_WIDTH / 2, { duration: 500 }),
            withRepeat(
              withSequence(
                withTiming(SCREEN_WIDTH / 2 - 10, { duration: 50 }),
                withTiming(SCREEN_WIDTH / 2 + 10, { duration: 50 })
              ),
              5,
              true
            ),
            withTiming(SCREEN_WIDTH / 2, { duration: 100 })
          );
          
          // Flash on win
          opacity.value = withDelay(
            2000,
            withRepeat(
              withSequence(
                withTiming(0.5, { duration: 100 }),
                withTiming(1, { duration: 100 })
              ),
              5,
              true
            )
          );
        } else {
          // Reel symbols
          const reelColumn = index % 3;
          const reelX = SCREEN_WIDTH / 2 - 80 + reelColumn * 80;
          const symbolsPerReel = Math.floor(totalCount / 3);
          const symbolIndex = Math.floor(index / 3);
          
          translateX.value = reelX;
          translateY.value = SCREEN_HEIGHT / 2 - 100;
          scale.value = scaleFactor;
          
          // Spinning animation
          const spinDuration = 1500 + reelColumn * 300;
          
          translateY.value = withSequence(
            // Spin fast
            withTiming(SCREEN_HEIGHT + 100, {
              duration: spinDuration,
              easing: Easing.in(Easing.cubic)
            }),
            // Reset to top
            withTiming(-100, { duration: 0 }),
            // Final position
            withTiming(SCREEN_HEIGHT / 2 + (symbolIndex % 3 - 1) * 60, {
              duration: 500,
              easing: Easing.out(Easing.back)
            })
          );
          
          // Show winning line
          if (emoji === '7️⃣' && symbolIndex === 0) {
            scale.value = withDelay(
              2500,
              withRepeat(
                withSequence(
                  withSpring(scaleFactor * 1.3),
                  withSpring(scaleFactor)
                ),
                3,
                true
              )
            );
          }
        }
        break;

      // ☠️ TOXIC BUBBLE - Bubbling toxic effect
      case 'toxicBubble':
        const bubbleX = Math.random() * SCREEN_WIDTH;
        const bubbleY = SCREEN_HEIGHT - 100 - Math.random() * 200;
        
        translateX.value = bubbleX;
        translateY.value = bubbleY;
        scale.value = 0;
        
        // Bubble up animation
        const bubbleDelay = delay + Math.random() * 2000;
        
        scale.value = withDelay(
          bubbleDelay,
          withSequence(
            withSpring(scaleFactor * 0.5),
            withSpring(scaleFactor)
          )
        );
        
        // Rise with wobble
        translateY.value = withDelay(
          bubbleDelay,
          withTiming(-100, {
            duration: 3000 + Math.random() * 2000,
            easing: Easing.inOut(Easing.ease)
          })
        );
        
        translateX.value = withDelay(
          bubbleDelay,
          withRepeat(
            withSequence(
              withTiming(bubbleX - 20, { duration: 500 }),
              withTiming(bubbleX + 20, { duration: 500 })
            ),
            3,
            true
          )
        );
        
        // Pop at top
        scale.value = withDelay(
          bubbleDelay + 2500,
          withSequence(
            withSpring(scaleFactor * 1.5),
            withTiming(0, { duration: 200 })
          )
        );
        
        // Green glow effect
        if (emoji === '💚') {
          opacity.value = withDelay(
            bubbleDelay,
            withRepeat(
              withSequence(
                withTiming(0.6, { duration: 500 }),
                withTiming(1, { duration: 500 })
              ),
              2,
              true
            )
          );
        }
        break;

      // 😏 SMOOTH CHARM - Rose petals and winks
      case 'smoothCharm':
        if (emoji === '😏') {
          // Winking faces
          const winkX = SCREEN_WIDTH * 0.2 + (index * SCREEN_WIDTH * 0.2);
          translateX.value = winkX;
          translateY.value = -100;
          
          // Smooth entrance
          translateY.value = withSpring(SCREEN_HEIGHT * 0.3, {
            damping: 20,
            stiffness: 60
          });
          
          scale.value = withSpring(scaleFactor);
          
          // Wink animation
          scale.value = withDelay(
            1000 + index * 200,
            withSequence(
              withTiming(scaleFactor * 0.9, { duration: 100 }),
              withTiming(scaleFactor * 1.1, { duration: 100 }),
              withTiming(scaleFactor, { duration: 100 })
            )
          );
        } else if (emoji === '🌹') {
          // Rose petals falling
          const petalX = Math.random() * SCREEN_WIDTH;
          translateX.value = petalX;
          translateY.value = -50;
          
          scale.value = withDelay(
            500 + delay,
            withSpring(scaleFactor)
          );
          
          // Gentle fall
          translateY.value = withDelay(
            500 + delay,
            withTiming(SCREEN_HEIGHT + 50, {
              duration: 4000,
              easing: Easing.inOut(Easing.ease)
            })
          );
          
          // Sway
          translateX.value = withDelay(
            500 + delay,
            withRepeat(
              withSequence(
                withTiming(petalX - 30, { duration: 1000 }),
                withTiming(petalX + 30, { duration: 1000 })
              ),
              2,
              true
            )
          );
          
          // Rotation
          rotation.value = withDelay(
            500 + delay,
            withTiming(360, { duration: 4000 })
          );
        } else {
          // Sparkles around
          const sparkleRadius = 100 + Math.random() * 100;
          const sparkleAngle = Math.random() * Math.PI * 2;
          
          translateX.value = SCREEN_WIDTH / 2 + Math.cos(sparkleAngle) * sparkleRadius;
          translateY.value = SCREEN_HEIGHT * 0.3 + Math.sin(sparkleAngle) * sparkleRadius;
          
          // Twinkle in
          scale.value = withDelay(
            200 + Math.random() * 800,
            withSequence(
              withSpring(scaleFactor * 1.5),
              withSpring(scaleFactor),
              withDelay(500, withTiming(0, { duration: 300 }))
            )
          );
        }
        break;

      // 🌟 SPOTLIGHT - Main character effect
      case 'spotlight':
        if (emoji === '🌟') {
          // Central star
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = scaleFactor;
          
          // Pulsing glow
          scale.value = withRepeat(
            withSequence(
              withTiming(scaleFactor * 1.1, { duration: 1000 }),
              withTiming(scaleFactor * 0.9, { duration: 1000 })
            ),
            -1,
            true
          );
          
          // Slow rotation
          rotation.value = withRepeat(
            withTiming(360, { duration: 10000, easing: Easing.linear }),
            -1
          );
        } else if (emoji === '🎬') {
          // Director boards
          const boardAngle = (index * Math.PI * 2) / 4;
          const boardRadius = 150;
          
          translateX.value = SCREEN_WIDTH / 2 + Math.cos(boardAngle) * boardRadius;
          translateY.value = SCREEN_HEIGHT / 2 + Math.sin(boardAngle) * boardRadius;
          scale.value = scaleFactor;
          
          // Clap animation
          rotation.value = withRepeat(
            withSequence(
              withTiming(-20, { duration: 500 }),
              withTiming(20, { duration: 500 })
            ),
            -1,
            true
          );
        } else {
          // Spotlight sparkles
          const spotlightRadius = Math.random() * 200;
          const spotlightAngle = Math.random() * Math.PI * 2;
          
          translateX.value = SCREEN_WIDTH / 2 + Math.cos(spotlightAngle) * spotlightRadius;
          translateY.value = SCREEN_HEIGHT / 2 + Math.sin(spotlightAngle) * spotlightRadius;
          
          // Continuous sparkle
          const sparkleLoop = () => {
            scale.value = withSequence(
              withTiming(0, { duration: Math.random() * 2000 }),
              withSpring(scaleFactor),
              withTiming(scaleFactor, { duration: 500 }),
              withTiming(0, { duration: 300 })
            );
            
            setTimeout(sparkleLoop, Math.random() * 3000 + 1000);
          };
          
          sparkleLoop();
        }
        break;

      // 💼 BAG BURST - Continuous money alerts
      case 'bagBurst':
        if (emoji === '💼') {
          // Briefcase center
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = scaleFactor;
          
          // Continuous shake
          translateX.value = withRepeat(
            withSequence(
              withTiming(SCREEN_WIDTH / 2 - 5, { duration: 100 }),
              withTiming(SCREEN_WIDTH / 2 + 5, { duration: 100 })
            ),
            -1,
            true
          );
          
          // Breathing effect
          scale.value = withRepeat(
            withSequence(
              withTiming(scaleFactor * 1.1, { duration: 1000 }),
              withTiming(scaleFactor, { duration: 1000 })
            ),
            -1,
            true
          );
        } else if (emoji === '🚨') {
          // Alert sirens
          const sirenAngle = (index * Math.PI * 2) / 6;
          const sirenRadius = 100;
          
          scale.value = scaleFactor;
          
          // Rotating sirens
          const sirenAnimation = () => {
            let time = 0;
            
            const animate = () => {
              time += 0.05;
              
              const angle = sirenAngle + time;
              translateX.value = SCREEN_WIDTH / 2 + Math.cos(angle) * sirenRadius;
              translateY.value = SCREEN_HEIGHT / 2 + Math.sin(angle) * sirenRadius;
              
              // Flash effect
              opacity.value = 0.5 + Math.sin(time * 10) * 0.5;
              
              animationRef.current = requestAnimationFrame(animate);
            };
            animate();
          };
          
          sirenAnimation();
        } else {
          // Money continuously bursting
          const burstAnimation = () => {
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 150;
            
            translateX.value = SCREEN_WIDTH / 2;
            translateY.value = SCREEN_HEIGHT / 2;
            scale.value = 0;
            opacity.value = 1;
            
            // Burst out
            translateX.value = withTiming(
              SCREEN_WIDTH / 2 + Math.cos(angle) * distance,
              { duration: 1000, easing: Easing.out(Easing.cubic) }
            );
            
            translateY.value = withSequence(
              withTiming(
                SCREEN_HEIGHT / 2 + Math.sin(angle) * distance - 50,
                { duration: 500, easing: Easing.out(Easing.cubic) }
              ),
              withTiming(
                SCREEN_HEIGHT / 2 + Math.sin(angle) * distance + 50,
                { duration: 500, easing: Easing.in(Easing.quad) }
              )
            );
            
            scale.value = withSequence(
              withSpring(scaleFactor),
              withDelay(500, withTiming(0, { duration: 500 }))
            );
            
            rotation.value = withTiming(720, { duration: 1000 });
            
            // Repeat after delay
            setTimeout(burstAnimation, 2000 + Math.random() * 1000);
          };
          
          setTimeout(burstAnimation, delay * 3);
        }
        break;
    }

    // Handle completion
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
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
import { TIER2_EFFECTS } from './constants/tier2Effects';
import { Tier2Particle } from './particles/Tier2Particles';

// Update ALL_EFFECTS to include tier 2
export const ALL_EFFECTS = {
  ...EFFECT_CONFIGS,  // Batch 1 (Tier 0)
  ...BATCH2_EFFECTS,  // Batch 2 (Tier 0)
  ...BATCH3_EFFECTS,  // Batch 3 (Tier 0)
  ...BATCH4_EFFECTS,  // Batch 4 (Tier 0)
  ...TIER1_EFFECTS,   // Tier 1 (Any Badge)
  ...TIER2_EFFECTS    // Tier 2 (Specific Badges)
};

// Add tier 2 physics to the render function
const tier2Physics = ['infernoEruption', 'moneyTornado', 'fireworksShow', 'floodingTears',
                     'diamondAura', 'championOrbit', 'galaxySwirl', 'slotSpin',
                     'toxicBubble', 'smoothCharm', 'spotlight', 'bagBurst'];

// In renderParticle function, add tier 2 handling
if (tier2Physics.includes(config.physics)) {
  return (
    <Tier2Particle
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

// ========================================
// File: Update types.ts to include tier 2 physics
// ========================================

export type PhysicsType = 
  // ... existing physics ...
  // Tier 2
  | 'infernoEruption' | 'moneyTornado' | 'fireworksShow' | 'floodingTears'
  | 'diamondAura' | 'championOrbit' | 'galaxySwirl' | 'slotSpin'
  | 'toxicBubble' | 'smoothCharm' | 'spotlight' | 'bagBurst';

// ========================================
// File: Update badge mappings
// ========================================

// Badge ID mappings for Tier 2 effects
export const BADGE_REQUIREMENTS = {
  hot_streak: 'fire_level_3',
  profit_leader: ['money_level_3', 'bag_alert'],
  perfect_day: 'celebration_level_3',
  fade_material: 'tears_level_3',
  sharp: 'cool_level_3',
  sport_champion: 'sports_level_3',
  special_achievement: 'sparkle_level_3',
  gambling_achievement: 'slot_machine',
  controversial: 'toxic',
  charm: 'rizz',
  star_player: 'main_character'
};