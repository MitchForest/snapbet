// ========================================
// TIER 1 EFFECTS: UNLOCKED WITH ANY BADGE
// ========================================
// This implements all Tier 1 effects that unlock when user earns ANY badge
// Total: 17 effects across all categories
//
// ENHANCED VERSIONS:
// - fire_level_2: 🔥 Blazing Hot
// - money_level_2: 💵 Money Shower
// - celebration_level_2: 🎉 Party Time
// - tears_level_2: 😭 Crying Rivers
// - cool_level_2: 😎 Ice Cold
// - sports_level_2: 🏀 Sports Mania
// - sparkle_level_2: ✨ Stardust
// - muscle_level_2: 💪 Beast Mode
//
// NEW TIER 1 EFFECTS:
// - dice_roll: 🎲 Rolling Dice
// - storm: ⛈️ Storm Coming
// - sheesh: 🥶 SHEEEESH
// - ratio: 💬 Ratio'd
// - touch_grass: 🌱 Touch Grass
// - built_different: 🗿 Built Different
// - caught_4k: 📸 Caught in 4K
// - diamond_hands: 💎 Diamond Hands (full version)
// - buzzer_beater: ⏰ Buzzer Beater (full version)
// ========================================

// ========================================
// File: components/effects/constants/tier1Effects.ts
// ========================================

import { EffectConfig } from '../types';

export const TIER1_EFFECTS: Record<string, EffectConfig> = {
  // ==================== ENHANCED TIER 1 VERSIONS ====================
  
  // 🔥 FIRE LEVEL 2
  fire_level_2: {
    id: 'fire_level_2',
    name: 'Blazing Hot',
    tier: 1,
    category: 'wins',
    particles: [
      { emoji: '🔥', count: 25, size: { min: 20, max: 50 } },
      { emoji: '✨', count: 10, size: { min: 15, max: 25 } }
    ],
    physics: 'enhancedFloat',
    duration: 'continuous',
    unlockRequirement: {
      type: 'badge',
      value: 'any'
    }
  },

  // 💵 MONEY LEVEL 2
  money_level_2: {
    id: 'money_level_2',
    name: 'Money Shower',
    tier: 1,
    category: 'wins',
    particles: [
      { emoji: '💵', count: 10, size: { min: 30, max: 40 } },
      { emoji: '💴', count: 8, size: { min: 30, max: 40 } },
      { emoji: '💶', count: 6, size: { min: 30, max: 40 } },
      { emoji: '💷', count: 6, size: { min: 30, max: 40 } }
    ],
    physics: 'money3D',
    duration: 'continuous',
    unlockRequirement: {
      type: 'badge',
      value: 'any'
    }
  },

  // 🎉 CELEBRATION LEVEL 2
  celebration_level_2: {
    id: 'celebration_level_2',
    name: 'Party Time',
    tier: 1,
    category: 'wins',
    particles: [
      { emoji: '🎉', count: 12, size: { min: 30, max: 45 } },
      { emoji: '🎊', count: 12, size: { min: 30, max: 45 } },
      { emoji: '🎈', count: 8, size: { min: 25, max: 40 } }
    ],
    physics: 'multiExplode',
    duration: 3000,
    unlockRequirement: {
      type: 'badge',
      value: 'any'
    }
  },

  // 😭 TEARS LEVEL 2
  tears_level_2: {
    id: 'tears_level_2',
    name: 'Crying Rivers',
    tier: 1,
    category: 'losses',
    particles: [
      { emoji: '😭', count: 5, size: { min: 45, max: 55 } },
      { emoji: '💧', count: 20, size: { min: 15, max: 25 } },
      { emoji: '💦', count: 10, size: { min: 20, max: 30 } }
    ],
    physics: 'riverFlow',
    duration: 'continuous',
    unlockRequirement: {
      type: 'badge',
      value: 'any'
    }
  },

  // 😎 COOL LEVEL 2
  cool_level_2: {
    id: 'cool_level_2',
    name: 'Ice Cold',
    tier: 1,
    category: 'wins',
    particles: [
      { emoji: '😎', count: 3, size: { min: 50, max: 60 } },
      { emoji: '❄️', count: 15, size: { min: 20, max: 30 } },
      { emoji: '✨', count: 10, size: { min: 15, max: 20 } }
    ],
    physics: 'iceCool',
    duration: 'continuous',
    unlockRequirement: {
      type: 'badge',
      value: 'any'
    }
  },

  // 🏀 SPORTS LEVEL 2
  sports_level_2: {
    id: 'sports_level_2',
    name: 'Sports Mania',
    tier: 1,
    category: 'hype',
    particles: [
      { emoji: '🏀', count: 5, size: { min: 35, max: 45 } },
      { emoji: '🏈', count: 5, size: { min: 35, max: 45 } },
      { emoji: '⚾', count: 5, size: { min: 35, max: 45 } },
      { emoji: '⚽', count: 5, size: { min: 35, max: 45 } },
      { emoji: '🏒', count: 5, size: { min: 35, max: 45 } }
    ],
    physics: 'sportsRain',
    duration: 'continuous',
    unlockRequirement: {
      type: 'badge',
      value: 'any'
    }
  },

  // ✨ SPARKLE LEVEL 2
  sparkle_level_2: {
    id: 'sparkle_level_2',
    name: 'Stardust',
    tier: 1,
    category: 'wildcards',
    particles: [
      { emoji: '✨', count: 20, size: { min: 15, max: 30 } },
      { emoji: '⭐', count: 15, size: { min: 20, max: 35 } },
      { emoji: '💫', count: 10, size: { min: 25, max: 40 } }
    ],
    physics: 'swirlPattern',
    duration: 'continuous',
    unlockRequirement: {
      type: 'badge',
      value: 'any'
    }
  },

  // 💪 MUSCLE LEVEL 2
  muscle_level_2: {
    id: 'muscle_level_2',
    name: 'Beast Mode',
    tier: 1,
    category: 'hype',
    particles: [
      { emoji: '💪', count: 4, size: { min: 50, max: 60 } },
      { emoji: '🦾', count: 2, size: { min: 50, max: 60 } },
      { emoji: '⚡', count: 8, size: { min: 25, max: 35 } }
    ],
    physics: 'beastFlex',
    duration: 'continuous',
    unlockRequirement: {
      type: 'badge',
      value: 'any'
    }
  },

  // ==================== NEW TIER 1 EFFECTS ====================

  // 🎲 DICE ROLL
  dice_roll: {
    id: 'dice_roll',
    name: 'Rolling Dice',
    tier: 1,
    category: 'wildcards',
    particles: [
      { emoji: '🎲', count: 2, size: { min: 50, max: 60 } }
    ],
    physics: 'diceRoll',
    duration: 2000,
    unlockRequirement: {
      type: 'badge',
      value: 'any'
    }
  },

  // ⛈️ STORM
  storm: {
    id: 'storm',
    name: 'Storm Coming',
    tier: 1,
    category: 'wildcards',
    particles: [
      { emoji: '⛈️', count: 3, size: { min: 60, max: 80 } },
      { emoji: '⚡', count: 8, size: { min: 30, max: 40 } },
      { emoji: '🌧️', count: 30, size: { min: 15, max: 20 } }
    ],
    physics: 'stormSystem',
    duration: 'continuous',
    unlockRequirement: {
      type: 'badge',
      value: 'any'
    }
  },

  // 🥶 SHEESH
  sheesh: {
    id: 'sheesh',
    name: 'SHEEEESH',
    tier: 1,
    category: 'vibes',
    particles: [
      { emoji: '🥶', count: 5, size: { min: 40, max: 50 } },
      { emoji: '❄️', count: 20, size: { min: 20, max: 30 } },
      { emoji: '💨', count: 10, size: { min: 30, max: 40 } }
    ],
    physics: 'freezeWind',
    duration: 2000,
    unlockRequirement: {
      type: 'badge',
      value: 'any'
    }
  },

  // 💬 RATIO
  ratio: {
    id: 'ratio',
    name: "Ratio'd",
    tier: 1,
    category: 'vibes',
    particles: [
      { emoji: '💬', count: 30, size: { min: 20, max: 35 } },
      { emoji: '📊', count: 3, size: { min: 40, max: 50 } },
      { emoji: '📉', count: 2, size: { min: 35, max: 45 } }
    ],
    physics: 'ratioOverwhelm',
    duration: 3000,
    unlockRequirement: {
      type: 'badge',
      value: 'any'
    }
  },

  // 🌱 TOUCH GRASS
  touch_grass: {
    id: 'touch_grass',
    name: 'Touch Grass',
    tier: 1,
    category: 'hype',
    particles: [
      { emoji: '🌱', count: 20, size: { min: 20, max: 30 } },
      { emoji: '🌿', count: 15, size: { min: 25, max: 35 } },
      { emoji: '☘️', count: 10, size: { min: 20, max: 30 } }
    ],
    physics: 'grassGrow',
    duration: 3000,
    unlockRequirement: {
      type: 'badge',
      value: 'any'
    }
  },

  // 🗿 BUILT DIFFERENT
  built_different: {
    id: 'built_different',
    name: 'Built Different',
    tier: 1,
    category: 'hype',
    particles: [
      { emoji: '🗿', count: 1, size: { min: 100, max: 100 } },
      { emoji: '💪', count: 4, size: { min: 40, max: 50 } },
      { emoji: '⚡', count: 12, size: { min: 25, max: 35 } }
    ],
    physics: 'chadEnergy',
    duration: 2000,
    unlockRequirement: {
      type: 'badge',
      value: 'any'
    }
  },

  // 📸 CAUGHT IN 4K
  caught_4k: {
    id: 'caught_4k',
    name: 'Caught in 4K',
    tier: 1,
    category: 'vibes',
    particles: [
      { emoji: '📸', count: 8, size: { min: 35, max: 45 } },
      { emoji: '📹', count: 4, size: { min: 40, max: 50 } },
      { emoji: '🎬', count: 2, size: { min: 45, max: 55 } }
    ],
    physics: 'cameraFlashes',
    duration: 2000,
    unlockRequirement: {
      type: 'badge',
      value: 'any'
    }
  },

  // 💎🙌 DIAMOND HANDS (Full Version)
  diamond_hands: {
    id: 'diamond_hands',
    name: 'Diamond Hands',
    tier: 1,
    category: 'betting',
    particles: [
      { emoji: '💎', count: 20, size: { min: 25, max: 40 } },
      { emoji: '🙌', count: 2, size: { min: 60, max: 60 } }
    ],
    physics: 'diamondHold',
    duration: 'continuous',
    unlockRequirement: {
      type: 'badge',
      value: 'any'
    }
  },

  // ⏰ BUZZER BEATER (Full Version)
  buzzer_beater: {
    id: 'buzzer_beater',
    name: 'Buzzer Beater',
    tier: 1,
    category: 'betting',
    particles: [
      { emoji: '⏰', count: 1, size: { min: 70, max: 70 } },
      { emoji: '💥', count: 12, size: { min: 30, max: 50 } },
      { emoji: '🎯', count: 1, size: { min: 60, max: 60 } }
    ],
    physics: 'lastSecond',
    duration: 3000,
    unlockRequirement: {
      type: 'badge',
      value: 'any'
    }
  }
};

// ========================================
// File: components/effects/particles/Tier1Particles.tsx
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

interface Tier1ParticleProps {
  emoji: string;
  index: number;
  physics: PhysicsType;
  duration: number | null;
  size?: { min: number; max: number };
  totalCount?: number;
  onComplete?: () => void;
}

export const Tier1Particle: React.FC<Tier1ParticleProps> = ({
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
  const rotateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const delay = index * 30;
    const particleSize = size.min + Math.random() * (size.max - size.min);
    const scaleFactor = particleSize / 30;

    switch (physics) {
      // 🔥 ENHANCED FLOAT - More dynamic fire movement
      case 'enhancedFloat':
        const fireStartX = Math.random() * SCREEN_WIDTH;
        translateX.value = fireStartX;
        translateY.value = SCREEN_HEIGHT - 100;
        
        scale.value = withDelay(delay, withSpring(scaleFactor));
        
        // More complex movement pattern
        const fireAnimation = () => {
          let time = 0;
          const animate = () => {
            time += 0.016;
            
            // Enhanced wobble with multiple sine waves
            const wobbleX = Math.sin(time * 2 + index) * 30 + 
                          Math.sin(time * 3.5 + index * 2) * 15;
            const floatY = SCREEN_HEIGHT - 100 - (time * 60) % (SCREEN_HEIGHT + 200);
            
            translateX.value = fireStartX + wobbleX;
            translateY.value = floatY;
            
            // Dynamic rotation
            rotation.value = Math.sin(time * 2 + index) * 20 + 
                           Math.cos(time * 1.5) * 10;
            
            // Size pulsing for sparkles
            if (emoji === '✨') {
              scale.value = scaleFactor * (0.8 + Math.sin(time * 5) * 0.3);
            }
            
            if (floatY < -100) {
              translateX.value = Math.random() * SCREEN_WIDTH;
              translateY.value = SCREEN_HEIGHT;
              time = 0;
            }
            
            animationRef.current = requestAnimationFrame(animate);
          };
          animate();
        };
        
        setTimeout(fireAnimation, delay);
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
      cancelAnimation(rotateY);
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
      { rotate: `${rotation.value}deg` },
      { rotateY: `${rotateY.value}deg` }
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
import { TIER1_EFFECTS } from './constants/tier1Effects';
import { Tier1Particle } from './particles/Tier1Particles';

// Update ALL_EFFECTS to include tier 1
export const ALL_EFFECTS = {
  ...EFFECT_CONFIGS,  // Batch 1 (Tier 0)
  ...BATCH2_EFFECTS,  // Batch 2 (Tier 0)
  ...BATCH3_EFFECTS,  // Batch 3 (Tier 0)
  ...BATCH4_EFFECTS,  // Batch 4 (Tier 0)
  ...TIER1_EFFECTS    // Tier 1 (Any Badge)
};

// Add tier 1 physics to the render function
const tier1Physics = ['enhancedFloat', 'money3D', 'multiExplode', 'riverFlow', 
                     'iceCool', 'sportsRain', 'swirlPattern', 'beastFlex',
                     'diceRoll', 'stormSystem', 'freezeWind', 'ratioOverwhelm',
                     'grassGrow', 'chadEnergy', 'cameraFlashes', 'diamondHold',
                     'lastSecond'];

// In renderParticle function, add tier 1 handling
if (tier1Physics.includes(config.physics)) {
  return (
    <Tier1Particle
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
// File: Update types.ts to include tier 1 physics
// ========================================

export type PhysicsType = 
  // Batch 1 (Tier 0)
  | 'float' | 'floatUp' | 'fall' | 'explode' | 'launch' | 'bounce' | 'orbit' | 'wave'
  // Batch 2 (Tier 0)
  | 'bounce' | 'spinAway' | 'zoomDance' | 'gentleFloat' | 'explodeOut' 
  | 'lookAround' | 'formLetter' | 'riseUp' | 'slideDown' | 'flexPump'
  // Batch 3 (Tier 0)
  | 'crashDown' | 'headExplode' | 'sweatDrop' | 'victoryDance' 
  | 'angerBurst' | 'popIn' | 'formF' | 'sportsBounce' 
  | 'chaosCircle' | 'temperatureFlux' | 'saltPour'
  // Batch 4 (Tier 0)
  | 'rainbowArc' | 'slideInLook' | 'kissMotion' | 'cameraFlash'
  | 'roboticMarch' | 'twinkle' | 'holdStrong' | 'intensifySweat'
  | 'spiralDown' | 'formAmount' | 'lightningStrike' | 'moonLaunch'
  | 'alertOpen' | 'clockCountdown'
  // Tier 1
  | 'enhancedFloat' | 'money3D' | 'multiExplode' | 'riverFlow'
  | 'iceCool' | 'sportsRain' | 'swirlPattern' | 'beastFlex'
  | 'diceRoll' | 'stormSystem' | 'freezeWind' | 'ratioOverwhelm'
  | 'grassGrow' | 'chadEnergy' | 'cameraFlashes' | 'diamondHold'
  | 'lastSecond';

// ========================================
// File: Update components/effects/utils/badgeCheck.ts
// ========================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_EFFECTS } from '../EmojiEffectsManager';

export const checkEffectUnlocked = async (effectId: string): Promise<boolean> => {
  const effect = ALL_EFFECTS[effectId];
  if (!effect) return false;
  
  // Tier 0 is always unlocked
  if (effect.tier === 0) return true;
  
  // Get user badges
  const badgesJson = await AsyncStorage.getItem('user_badges');
  const userBadges = badgesJson ? JSON.parse(badgesJson) : [];
  
  // Tier 1 requires any badge
  if (effect.tier === 1 && effect.unlockRequirement?.value === 'any') {
    return userBadges.length > 0;
  }
  
  // Specific badge requirements (for Tier 2+)
  if (effect.unlockRequirement?.type === 'badge' && effect.unlockRequirement?.value !== 'any') {
    return userBadges.includes(effect.unlockRequirement.value);
  }
  
  return false;
};

// Get all unlocked effects for a user
export const getUserUnlockedEffects = async (): Promise<string[]> => {
  const allEffectIds = Object.keys(ALL_EFFECTS);
  const unlockedEffects: string[] = [];
  
  for (const effectId of allEffectIds) {
    const isUnlocked = await checkEffectUnlocked(effectId);
    if (isUnlocked) {
      unlockedEffects.push(effectId);
    }
  }
  
  return unlockedEffects;
};

// ========================================
// File: Update EffectSelector.tsx for tier display
// ========================================

// Add tier indicator to effect buttons
const EffectButton = ({ effect, isActive, isLocked, onPress }) => {
  const getTierColor = (tier: number) => {
    switch (tier) {
      case 0: return '#4CAF50'; // Green for free
      case 1: return '#2196F3'; // Blue for any badge
      case 2: return '#9C27B0'; // Purple for specific badge
      case 3: return '#FF9800'; // Orange for elite
      case 4: return '#F44336'; // Red for limited
      default: return '#666';
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.effectButton,
        isActive && styles.activeEffect,
        isLocked && styles.lockedEffect
      ]}
      onPress={() => onPress(effect.id)}
    >
      <View style={styles.tierIndicator}>
        <View style={[
          styles.tierDot,
          { backgroundColor: getTierColor(effect.tier) }
        ]} />
      </View>
      <Text style={styles.effectEmoji}>
        {effect.particles[0].emoji}
      </Text>
      <Text style={[
        styles.effectName,
        isLocked && styles.lockedText
      ]}>
        {effect.name}
      </Text>
      {isLocked && (
        <View style={styles.lockIcon}>
          <Text style={styles.lockEmoji}>🔒</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Add these styles
const styles = StyleSheet.create({
  // ... existing styles ...
  tierIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lockedEffect: {
    opacity: 0.6,
  },
  lockedText: {
    color: '#999',
  },
  lockIcon: {
    position: 'absolute',
    top: 5,
    left: 5,
  },
  lockEmoji: {
    fontSize: 12,
  },
});

      // 💵 MONEY 3D - Bills with 3D rotation
      case 'money3D':
        const moneyX = Math.random() * SCREEN_WIDTH;
        translateX.value = moneyX;
        translateY.value = -100;
        
        scale.value = withDelay(
          delay + Math.random() * 500,
          withSpring(scaleFactor)
        );
        
        // 3D rotation effect
        rotateY.value = withDelay(
          delay,
          withRepeat(
            withTiming(360, {
              duration: 2000 + Math.random() * 1000,
              easing: Easing.linear
            }),
            -1
          )
        );
        
        // Complex falling pattern
        translateY.value = withDelay(
          delay + Math.random() * 500,
          withRepeat(
            withTiming(SCREEN_HEIGHT + 100, {
              duration: 3000 + Math.random() * 2000,
              easing: Easing.linear
            }),
            -1,
            false
          )
        );
        
        // Swaying motion
        translateX.value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(moneyX + 40, { 
                duration: 1500 + Math.random() * 500,
                easing: Easing.inOut(Easing.ease)
              }),
              withTiming(moneyX - 40, { 
                duration: 1500 + Math.random() * 500,
                easing: Easing.inOut(Easing.ease)
              })
            ),
            -1,
            true
          )
        );
        break;

      // 🎉 MULTI EXPLODE - Multiple explosion points
      case 'multiExplode':
        // Three explosion centers
        const explosionCenters = [
          { x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT * 0.4 },
          { x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.5 },
          { x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.4 }
        ];
        
        const centerIndex = index % 3;
        const center = explosionCenters[centerIndex];
        const particleAngle = (Math.PI * 2 * Math.floor(index / 3)) / Math.floor(totalCount / 3);
        const velocity = 300 + Math.random() * 200;
        
        translateX.value = center.x;
        translateY.value = center.y;
        
        // Staggered explosions
        const explosionDelay = centerIndex * 200 + delay;
        
        scale.value = withDelay(
          explosionDelay,
          withSequence(
            withSpring(scaleFactor * 1.2, { damping: 5, stiffness: 300 }),
            withTiming(scaleFactor, { duration: 300 })
          )
        );
        
        // Explode outward
        translateX.value = withDelay(
          explosionDelay,
          withTiming(center.x + Math.cos(particleAngle) * velocity, {
            duration: 1500,
            easing: Easing.out(Easing.cubic)
          })
        );
        
        translateY.value = withDelay(
          explosionDelay,
          withSequence(
            withTiming(center.y + Math.sin(particleAngle) * velocity - 100, {
              duration: 700,
              easing: Easing.out(Easing.cubic)
            }),
            withTiming(SCREEN_HEIGHT + 100, {
              duration: 1300,
              easing: Easing.in(Easing.quad)
            })
          )
        );
        
        rotation.value = withDelay(
          explosionDelay,
          withTiming(Math.random() * 720, { duration: 2000 })
        );
        
        opacity.value = withDelay(
          explosionDelay + 1500,
          withTiming(0, { duration: 500 })
        );
        break;

      // 😭 RIVER FLOW - Tears flowing like rivers
      case 'riverFlow':
        if (emoji === '😭') {
          // Crying faces at different heights
          const faceX = SCREEN_WIDTH * 0.2 + (index * SCREEN_WIDTH * 0.2);
          translateX.value = faceX;
          translateY.value = SCREEN_HEIGHT * 0.1 + index * 50;
          scale.value = scaleFactor;
          
          // Gentle wobble
          translateX.value = withRepeat(
            withSequence(
              withTiming(faceX - 10, { duration: 1500 }),
              withTiming(faceX + 10, { duration: 1500 })
            ),
            -1,
            true
          );
        } else {
          // Tears flow in streams
          const streamIndex = Math.floor(index / 5);
          const baseX = SCREEN_WIDTH * 0.2 + (streamIndex * SCREEN_WIDTH * 0.2);
          
          translateX.value = baseX + (Math.random() - 0.5) * 30;
          translateY.value = SCREEN_HEIGHT * 0.2 + streamIndex * 50;
          
          scale.value = withDelay(
            delay + Math.random() * 500,
            withSpring(scaleFactor)
          );
          
          // River-like flow
          const flowAnimation = () => {
            let time = 0;
            const animate = () => {
              time += 0.02;
              
              // Sinusoidal flow pattern
              const flowX = baseX + Math.sin(time * 2 + index) * 20 + 
                          Math.sin(time * 3.5) * 10;
              const flowY = (SCREEN_HEIGHT * 0.2 + streamIndex * 50) + time * 150;
              
              translateX.value = flowX;
              translateY.value = flowY;
              
              if (flowY > SCREEN_HEIGHT + 50) {
                time = 0;
              }
              
              animationRef.current = requestAnimationFrame(animate);
            };
            animate();
          };
          
          setTimeout(flowAnimation, delay);
        }
        break;

      // 😎 ICE COOL - Sunglasses with frost effect
      case 'iceCool':
        if (emoji === '😎') {
          // Cool sunglasses sliding in
          const coolX = SCREEN_WIDTH * 0.25 + index * (SCREEN_WIDTH * 0.25);
          translateX.value = coolX;
          translateY.value = -100;
          
          // Smooth slide down
          translateY.value = withSpring(SCREEN_HEIGHT * 0.3, {
            damping: 15,
            stiffness: 60,
            velocity: 10
          });
          
          scale.value = withSpring(scaleFactor);
          
          // Cool wobble
          rotation.value = withRepeat(
            withSequence(
              withTiming(-5, { duration: 2000 }),
              withTiming(5, { duration: 2000 })
            ),
            -1,
            true
          );
        } else if (emoji === '❄️') {
          // Frost particles
          const frostX = Math.random() * SCREEN_WIDTH;
          const frostY = SCREEN_HEIGHT * 0.2 + Math.random() * SCREEN_HEIGHT * 0.3;
          
          translateX.value = frostX;
          translateY.value = frostY;
          
          scale.value = withDelay(
            delay,
            withSequence(
              withSpring(scaleFactor),
              withRepeat(
                withSequence(
                  withTiming(scaleFactor * 1.2, { duration: 1000 }),
                  withTiming(scaleFactor, { duration: 1000 })
                ),
                -1,
                true
              )
            )
          );
          
          // Gentle drift
          translateX.value = withRepeat(
            withSequence(
              withTiming(frostX - 20, { duration: 3000 }),
              withTiming(frostX + 20, { duration: 3000 })
            ),
            -1,
            true
          );
          
          // Sparkle rotation
          rotation.value = withRepeat(
            withTiming(360, { duration: 4000 }),
            -1
          );
        } else {
          // Sparkles
          const sparkleX = Math.random() * SCREEN_WIDTH;
          const sparkleY = SCREEN_HEIGHT * 0.2 + Math.random() * SCREEN_HEIGHT * 0.4;
          
          translateX.value = sparkleX;
          translateY.value = sparkleY;
          
          // Twinkle effect
          opacity.value = withDelay(
            Math.random() * 2000,
            withRepeat(
              withSequence(
                withTiming(0, { duration: 200 }),
                withTiming(1, { duration: 200 })
              ),
              -1,
              false
            )
          );
          
          scale.value = withDelay(
            Math.random() * 2000,
            withRepeat(
              withSequence(
                withSpring(scaleFactor * 1.5),
                withSpring(scaleFactor * 0.5)
              ),
              -1,
              false
            )
          );
        }
        break;

      // 🏀 SPORTS RAIN - Enhanced sports balls
      case 'sportsRain':
        const sportX = Math.random() * (SCREEN_WIDTH - 100) + 50;
        translateX.value = sportX;
        translateY.value = -100 - Math.random() * 200;
        
        scale.value = withDelay(
          delay + Math.random() * 500,
          withSpring(scaleFactor)
        );
        
        // Different physics for each sport
        const sportBehaviors = {
          '🏀': { bounce: 0.8, spin: 360, wobble: 20 },
          '🏈': { bounce: 0.6, spin: 720, wobble: 40 },
          '⚾': { bounce: 0.7, spin: 180, wobble: 15 },
          '⚽': { bounce: 0.75, spin: 540, wobble: 25 },
          '🏒': { bounce: 0.5, spin: 90, wobble: 50 }
        };
        
        const behavior = sportBehaviors[emoji] || sportBehaviors['🏀'];
        
        // Complex bouncing with different heights
        const bounceAnimation = () => {
          let velocity = 0;
          let position = translateY.value;
          let bounceCount = 0;
          
          const animate = () => {
            velocity += 0.5; // Gravity
            position += velocity;
            
            if (position > SCREEN_HEIGHT - 100) {
              position = SCREEN_HEIGHT - 100;
              velocity = -velocity * behavior.bounce;
              bounceCount++;
              
              // Reset after several bounces
              if (bounceCount > 5 || Math.abs(velocity) < 1) {
                position = -100 - Math.random() * 200;
                translateX.value = Math.random() * (SCREEN_WIDTH - 100) + 50;
                velocity = 0;
                bounceCount = 0;
              }
            }
            
            translateY.value = position;
            rotation.value = (rotation.value + behavior.spin / 60) % 360;
            
            // Wobble on X axis
            translateX.value = sportX + Math.sin(Date.now() / 1000 * 2) * behavior.wobble;
            
            animationRef.current = requestAnimationFrame(animate);
          };
          animate();
        };
        
        setTimeout(bounceAnimation, delay);
        break;

      // ✨ SWIRL PATTERN - Complex swirling stardust
      case 'swirlPattern':
        const centerX = SCREEN_WIDTH / 2;
        const centerY = SCREEN_HEIGHT / 2;
        const radius = 100 + (index / totalCount) * 100;
        const angleOffset = (index / totalCount) * Math.PI * 2;
        
        scale.value = withDelay(delay, withSpring(scaleFactor));
        
        // Swirling motion
        const swirlAnimation = () => {
          let time = 0;
          const animate = () => {
            time += 0.02;
            
            // Spiral outward
            const currentRadius = radius + time * 20;
            const angle = angleOffset + time * 2;
            
            translateX.value = centerX + Math.cos(angle) * currentRadius;
            translateY.value = centerY + Math.sin(angle) * currentRadius;
            
            // Fade as it moves outward
            if (currentRadius > 250) {
              opacity.value = Math.max(0, 1 - (currentRadius - 250) / 100);
            }
            
            // Reset when too far
            if (currentRadius > 350) {
              time = 0;
              opacity.value = 1;
            }
            
            // Sparkle effect
            if (emoji === '✨') {
              scale.value = scaleFactor * (0.8 + Math.sin(time * 10) * 0.3);
            }
            
            animationRef.current = requestAnimationFrame(animate);
          };
          animate();
        };
        
        setTimeout(swirlAnimation, delay);
        break;

      // 💪 BEAST FLEX - Lightning between arms
      case 'beastFlex':
        if (emoji === '💪' || emoji === '🦾') {
          // Arms positioning
          const armPositions = [
            { x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT * 0.4 },
            { x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.4 },
            { x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT * 0.6 },
            { x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.6 }
          ];
          
          const pos = armPositions[index % 4];
          translateX.value = pos.x;
          translateY.value = pos.y;
          scale.value = scaleFactor;
          
          // Flex animation
          scale.value = withRepeat(
            withSequence(
              withTiming(scaleFactor * 1.3, { duration: 400 }),
              withTiming(scaleFactor, { duration: 400 })
            ),
            -1,
            false
          );
          
          // Slight rotation for flex
          rotation.value = withRepeat(
            withSequence(
              withTiming(index % 2 === 0 ? -10 : 10, { duration: 400 }),
              withTiming(0, { duration: 400 })
            ),
            -1,
            true
          );
        } else {
          // Lightning bolts
          const lightningPaths = [
            { start: 0, end: 1 },
            { start: 2, end: 3 },
            { start: 0, end: 2 },
            { start: 1, end: 3 }
          ];
          
          const pathIndex = index % lightningPaths.length;
          const path = lightningPaths[pathIndex];
          
          const armPositions = [
            { x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT * 0.4 },
            { x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.4 },
            { x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT * 0.6 },
            { x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.6 }
          ];
          
          const startPos = armPositions[path.start];
          const endPos = armPositions[path.end];
          
          translateX.value = startPos.x;
          translateY.value = startPos.y;
          scale.value = 0;
          
          // Lightning strike animation
          const strikeAnimation = () => {
            opacity.value = withSequence(
              withTiming(0, { duration: 1000 }),
              withTiming(1, { duration: 50 }),
              withTiming(0, { duration: 100 }),
              withTiming(1, { duration: 50 }),
              withTiming(0, { duration: 100 })
            );
            
            // Move along path
            translateX.value = withTiming(endPos.x, { duration: 100 });
            translateY.value = withTiming(endPos.y, { duration: 100 });
            scale.value = withSequence(
              withTiming(scaleFactor * 2, { duration: 50 }),
              withTiming(scaleFactor, { duration: 50 })
            );
            
            setTimeout(() => strikeAnimation(), 2000);
          };
          
          setTimeout(() => strikeAnimation(), 500 + pathIndex * 200);
        }
        break;

      // 🎲 DICE ROLL - Tumbling dice
      case 'diceRoll':
        const diceStartX = index === 0 ? SCREEN_WIDTH * 0.3 : SCREEN_WIDTH * 0.7;
        translateX.value = diceStartX;
        translateY.value = SCREEN_HEIGHT * 0.2;
        scale.value = scaleFactor;
        
        // Tumbling motion
        const tumbleAnimation = () => {
          // Random end position
          const endX = SCREEN_WIDTH * 0.2 + Math.random() * SCREEN_WIDTH * 0.6;
          const endY = SCREEN_HEIGHT * 0.6 + Math.random() * 100;
          
          translateX.value = withTiming(endX, {
            duration: 1500,
            easing: Easing.out(Easing.cubic)
          });
          
          translateY.value = withSequence(
            withTiming(SCREEN_HEIGHT * 0.4, {
              duration: 400,
              easing: Easing.out(Easing.quad)
            }),
            withTiming(endY, {
              duration: 600,
              easing: Easing.bounce
            }),
            withTiming(endY - 20, { duration: 200 }),
            withTiming(endY, { duration: 200 })
          );
          
          // Multiple rotations
          rotation.value = withTiming(
            720 + Math.random() * 360,
            { duration: 1500 }
          );
          
          // Slight wobble at end
          rotation.value = withDelay(
            1500,
            withRepeat(
              withSequence(
                withTiming(rotation.value - 5, { duration: 100 }),
                withTiming(rotation.value + 5, { duration: 100 })
              ),
              2,
              true
            )
          );
        };
        
        setTimeout(tumbleAnimation, index * 200);
        break;

      // ⛈️ STORM SYSTEM - Complex weather
      case 'stormSystem':
        if (emoji === '⛈️') {
          // Storm clouds
          const cloudX = SCREEN_WIDTH * 0.2 + index * SCREEN_WIDTH * 0.3;
          translateX.value = cloudX;
          translateY.value = SCREEN_HEIGHT * 0.1;
          scale.value = scaleFactor;
          
          // Cloud movement
          translateX.value = withRepeat(
            withSequence(
              withTiming(cloudX - 30, { duration: 4000 }),
              withTiming(cloudX + 30, { duration: 4000 })
            ),
            -1,
            true
          );
          
          // Rumble effect
          translateY.value = withRepeat(
            withSequence(
              withTiming(SCREEN_HEIGHT * 0.1 - 5, { duration: 100 }),
              withTiming(SCREEN_HEIGHT * 0.1 + 5, { duration: 100 })
            ),
            -1,
            true
          );
        } else if (emoji === '⚡') {
          // Lightning strikes
          const strikeX = Math.random() * SCREEN_WIDTH;
          translateX.value = strikeX;
          translateY.value = SCREEN_HEIGHT * 0.15;
          scale.value = 0;
          
          // Random lightning strikes
          const lightningStrike = () => {
            const strikeDelay = Math.random() * 3000 + 1000;
            
            setTimeout(() => {
              opacity.value = withSequence(
                withTiming(1, { duration: 50 }),
                withTiming(0.3, { duration: 50 }),
                withTiming(1, { duration: 50 }),
                withTiming(0, { duration: 100 })
              );
              
              scale.value = withSequence(
                withTiming(scaleFactor * 2, { duration: 50 }),
                withTiming(scaleFactor, { duration: 200 })
              );
              
              translateY.value = withTiming(SCREEN_HEIGHT * 0.7, {
                duration: 200,
                easing: Easing.in(Easing.cubic)
              });
              
              // Reset and repeat
              setTimeout(() => {
                translateX.value = Math.random() * SCREEN_WIDTH;
                translateY.value = SCREEN_HEIGHT * 0.15;
                lightningStrike();
              }, 300);
            }, strikeDelay);
          };
          
          lightningStrike();
        } else {
          // Rain drops
          const rainX = Math.random() * SCREEN_WIDTH;
          translateX.value = rainX;
          translateY.value = SCREEN_HEIGHT * 0.2 + Math.random() * 100;
          
          scale.value = withDelay(
            Math.random() * 1000,
            withSpring(scaleFactor)
          );
          
          // Heavy rain fall
          translateY.value = withDelay(
            Math.random() * 1000,
            withRepeat(
              withTiming(SCREEN_HEIGHT + 50, {
                duration: 1000,
                easing: Easing.in(Easing.linear)
              }),
              -1,
              false
            )
          );
          
          // Wind effect
          translateX.value = withRepeat(
            withSequence(
              withTiming(rainX - 20, { duration: 500 }),
              withTiming(rainX + 20, { duration: 500 })
            ),
            -1,
            true
          );
        }
        break;

      // 🥶 FREEZE WIND - Icy wind effect
      case 'freezeWind':
        if (emoji === '🥶') {
          // Frozen faces
          const faceX = SCREEN_WIDTH * 0.2 + (index * SCREEN_WIDTH * 0.15);
          translateX.value = faceX;
          translateY.value = SCREEN_HEIGHT * 0.4;
          scale.value = scaleFactor;
          
          // Shivering effect
          translateX.value = withRepeat(
            withSequence(
              withTiming(faceX - 3, { duration: 50 }),
              withTiming(faceX + 3, { duration: 50 })
            ),
            20,
            true
          );
          
          // Slight scale pulse
          scale.value = withRepeat(
            withSequence(
              withTiming(scaleFactor * 0.95, { duration: 200 }),
              withTiming(scaleFactor * 1.05, { duration: 200 })
            ),
            5,
            true
          );
        } else if (emoji === '❄️') {
          // Snowflakes
          const snowX = Math.random() * SCREEN_WIDTH;
          translateX.value = snowX;
          translateY.value = -50;
          
          scale.value = withSpring(scaleFactor);
          
          // Drifting fall
          translateY.value = withTiming(SCREEN_HEIGHT + 50, {
            duration: 3000 + Math.random() * 2000,
            easing: Easing.linear
          });
          
          translateX.value = withRepeat(
            withSequence(
              withTiming(snowX - 30, { duration: 1000 }),
              withTiming(snowX + 30, { duration: 1000 })
            ),
            2,
            true
          );
          
          rotation.value = withRepeat(
            withTiming(360, { duration: 2000 }),
            2
          );
        } else {
          // Wind gusts
          translateX.value = -50;
          translateY.value = SCREEN_HEIGHT * 0.3 + Math.random() * SCREEN_HEIGHT * 0.4;
          
          scale.value = withSpring(scaleFactor);
          
          // Whoosh across screen
          translateX.value = withTiming(SCREEN_WIDTH + 50, {
            duration: 1000 + Math.random() * 500,
            easing: Easing.in(Easing.cubic)
          });
          
          // Wind wobble
          translateY.value = withSequence(
            withTiming(translateY.value - 20, { duration: 300 }),
            withTiming(translateY.value + 40, { duration: 400 }),
            withTiming(translateY.value, { duration: 300 })
          );
          
          opacity.value = withSequence(
            withTiming(0.8, { duration: 200 }),
            withTiming(0, { duration: 800 })
          );
        }
        break;

      // 💬 RATIO OVERWHELM - Comments multiplying
      case 'ratioOverwhelm':
        if (emoji === '💬') {
          // Comments appear from all sides
          const sides = ['left', 'right', 'top', 'bottom'];
          const side = sides[index % 4];
          
          let startX, startY, endX, endY;
          
          switch (side) {
            case 'left':
              startX = -50;
              startY = Math.random() * SCREEN_HEIGHT;
              endX = SCREEN_WIDTH * 0.2 + Math.random() * SCREEN_WIDTH * 0.6;
              endY = SCREEN_HEIGHT * 0.3 + Math.random() * SCREEN_HEIGHT * 0.4;
              break;
            case 'right':
              startX = SCREEN_WIDTH + 50;
              startY = Math.random() * SCREEN_HEIGHT;
              endX = SCREEN_WIDTH * 0.2 + Math.random() * SCREEN_WIDTH * 0.6;
              endY = SCREEN_HEIGHT * 0.3 + Math.random() * SCREEN_HEIGHT * 0.4;
              break;
            case 'top':
              startX = Math.random() * SCREEN_WIDTH;
              startY = -50;
              endX = SCREEN_WIDTH * 0.2 + Math.random() * SCREEN_WIDTH * 0.6;
              endY = SCREEN_HEIGHT * 0.3 + Math.random() * SCREEN_HEIGHT * 0.4;
              break;
            case 'bottom':
              startX = Math.random() * SCREEN_WIDTH;
              startY = SCREEN_HEIGHT + 50;
              endX = SCREEN_WIDTH * 0.2 + Math.random() * SCREEN_WIDTH * 0.6;
              endY = SCREEN_HEIGHT * 0.3 + Math.random() * SCREEN_HEIGHT * 0.4;
              break;
          }
          
          translateX.value = startX;
          translateY.value = startY;
          scale.value = 0;
          
          // Rapid appearance
          const appearDelay = index * 50;
          
          translateX.value = withDelay(
            appearDelay,
            withSpring(endX, { damping: 15, stiffness: 150 })
          );
          
          translateY.value = withDelay(
            appearDelay,
            withSpring(endY, { damping: 15, stiffness: 150 })
          );
          
          scale.value = withDelay(
            appearDelay,
            withSequence(
              withSpring(scaleFactor * 1.2, { damping: 10, stiffness: 200 }),
              withSpring(scaleFactor, { damping: 15, stiffness: 150 })
            )
          );
          
          // Pile up effect
          translateY.value = withDelay(
            appearDelay + 1500,
            withTiming(endY + 20, { duration: 500 })
          );
        } else if (emoji === '📊') {
          // Charts appear
          const chartX = SCREEN_WIDTH * 0.3 + index * 100;
          translateX.value = chartX;
          translateY.value = SCREEN_HEIGHT + 50;
          
          scale.value = withDelay(
            1500,
            withSpring(scaleFactor)
          );
          
          translateY.value = withDelay(
            1500,
            withSpring(SCREEN_HEIGHT * 0.7, { damping: 10, stiffness: 100 })
          );
        } else {
          // Down arrows
          const arrowX = SCREEN_WIDTH * 0.4 + index * 80;
          translateX.value = arrowX;
          translateY.value = -50;
          
          scale.value = withDelay(
            2000,
            withSpring(scaleFactor)
          );
          
          translateY.value = withDelay(
            2000,
            withTiming(SCREEN_HEIGHT * 0.6, {
              duration: 800,
              easing: Easing.bounce
            })
          );
        }
        break;

      // 🌱 GRASS GROW - Sprouting from bottom
      case 'grassGrow':
        const grassX = Math.random() * SCREEN_WIDTH;
        const grassRow = Math.floor(index / 10);
        const baseY = SCREEN_HEIGHT - 50 - grassRow * 30;
        
        translateX.value = grassX;
        translateY.value = baseY + 100;
        scale.value = 0;
        
        // Grow animation
        const growDelay = index * 50 + Math.random() * 200;
        
        translateY.value = withDelay(
          growDelay,
          withSpring(baseY, { damping: 10, stiffness: 100 })
        );
        
        scale.value = withDelay(
          growDelay,
          withSequence(
            withSpring(scaleFactor * 1.2, { damping: 8, stiffness: 200 }),
            withSpring(scaleFactor, { damping: 10, stiffness: 150 })
          )
        );
        
        // Gentle sway after growing
        translateX.value = withDelay(
          growDelay + 500,
          withRepeat(
            withSequence(
              withTiming(grassX - 5, { duration: 1000 + Math.random() * 500 }),
              withTiming(grassX + 5, { duration: 1000 + Math.random() * 500 })
            ),
            -1,
            true
          )
        );
        
        rotation.value = withDelay(
          growDelay + 500,
          withRepeat(
            withSequence(
              withTiming(-10, { duration: 1000 + Math.random() * 500 }),
              withTiming(10, { duration: 1000 + Math.random() * 500 })
            ),
            -1,
            true
          )
        );
        break;

      // 🗿 CHAD ENERGY - Stone face with power
      case 'chadEnergy':
        if (emoji === '🗿') {
          // Giant stone face
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = -150;
          scale.value = scaleFactor;
          
          // Dramatic entrance
          translateY.value = withSequence(
            withTiming(SCREEN_HEIGHT / 2, {
              duration: 800,
              easing: Easing.in(Easing.cubic)
            }),
            withTiming(SCREEN_HEIGHT / 2 - 20, { duration: 200 }),
            withTiming(SCREEN_HEIGHT / 2, { duration: 100 })
          );
          
          // Power pulse
          scale.value = withDelay(
            1100,
            withRepeat(
              withSequence(
                withTiming(scaleFactor * 1.1, { duration: 300 }),
                withTiming(scaleFactor, { duration: 300 })
              ),
              3,
              true
            )
          );
        } else if (emoji === '💪') {
          // Muscles around stone
          const muscleAngle = (Math.PI * 2 * index) / 4;
          const radius = 120;
          
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = 0;
          
          // Appear after stone
          setTimeout(() => {
            translateX.value = SCREEN_WIDTH / 2 + Math.cos(muscleAngle) * radius;
            translateY.value = SCREEN_HEIGHT / 2 + Math.sin(muscleAngle) * radius;
            
            scale.value = withSpring(scaleFactor, { damping: 10, stiffness: 200 });
            
            // Flex animation
            scale.value = withDelay(
              200,
              withRepeat(
                withSequence(
                  withTiming(scaleFactor * 1.3, { duration: 300 }),
                  withTiming(scaleFactor, { duration: 300 })
                ),
                3,
                true
              )
            );
          }, 1200);
        } else {
          // Lightning power
          const lightningAngle = Math.random() * Math.PI * 2;
          const lightningRadius = 80 + Math.random() * 80;
          
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = 0;
          opacity.value = 0;
          
          // Lightning bursts
          setTimeout(() => {
            translateX.value = SCREEN_WIDTH / 2 + Math.cos(lightningAngle) * lightningRadius;
            translateY.value = SCREEN_HEIGHT / 2 + Math.sin(lightningAngle) * lightningRadius;
            
            opacity.value = withSequence(
              withTiming(1, { duration: 100 }),
              withTiming(0, { duration: 100 }),
              withTiming(1, { duration: 100 }),
              withTiming(0, { duration: 200 })
            );
            
            scale.value = withSequence(
              withTiming(scaleFactor * 2, { duration: 100 }),
              withTiming(scaleFactor, { duration: 400 })
            );
          }, 1000 + index * 100);
        }
        break;

      // 📸 CAMERA FLASHES - Multiple cameras
      case 'cameraFlashes':
        const flashPositions = [
          { x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT * 0.3 },
          { x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.3 },
          { x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.2 },
          { x: SCREEN_WIDTH * 0.3, y: SCREEN_HEIGHT * 0.6 },
          { x: SCREEN_WIDTH * 0.7, y: SCREEN_HEIGHT * 0.6 },
          { x: SCREEN_WIDTH * 0.1, y: SCREEN_HEIGHT * 0.5 },
          { x: SCREEN_WIDTH * 0.9, y: SCREEN_HEIGHT * 0.5 },
          { x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.7 }
        ];
        
        const pos = flashPositions[index % flashPositions.length];
        translateX.value = pos.x;
        translateY.value = pos.y;
        scale.value = 0;
        
        // Staggered flashes
        const flashDelay = index * 150;
        
        scale.value = withDelay(
          flashDelay,
          withSequence(
            withSpring(scaleFactor * 1.2, { damping: 10, stiffness: 300 }),
            withTiming(scaleFactor, { duration: 200 })
          )
        );
        
        // Flash effect (simulate with opacity)
        opacity.value = withDelay(
          flashDelay + 200,
          withSequence(
            withTiming(0.2, { duration: 50 }),
            withTiming(1, { duration: 50 }),
            withTiming(0.2, { duration: 50 }),
            withTiming(1, { duration: 50 })
          )
        );
        
        // Slight shake on flash
        translateX.value = withDelay(
          flashDelay + 200,
          withSequence(
            withTiming(pos.x - 5, { duration: 50 }),
            withTiming(pos.x + 5, { duration: 50 }),
            withTiming(pos.x, { duration: 50 })
          )
        );
        break;

      // 💎 DIAMOND HOLD - Continuous diamond hands
      case 'diamondHold':
        if (emoji === '🙌') {
          // Hands at bottom holding position
          const handX = index === 0 ? SCREEN_WIDTH * 0.3 : SCREEN_WIDTH * 0.7;
          translateX.value = handX;
          translateY.value = SCREEN_HEIGHT * 0.8;
          scale.value = scaleFactor;
          
          // Strong holding animation
          scale.value = withRepeat(
            withSequence(
              withTiming(scaleFactor * 1.15, { duration: 1500 }),
              withTiming(scaleFactor, { duration: 1500 })
            ),
            -1,
            true
          );
          
          // Slight shake showing strength
          translateX.value = withRepeat(
            withSequence(
              withTiming(handX - 2, { duration: 100 }),
              withTiming(handX + 2, { duration: 100 })
            ),
            -1,
            true
          );
        } else {
          // Diamonds floating above hands
          const diamondPattern = index % 5;
          const centerX = SCREEN_WIDTH / 2;
          const baseY = SCREEN_HEIGHT * 0.6;
          
          // Diamond formation positions
          const positions = [
            { x: centerX, y: baseY - 100 },
            { x: centerX - 60, y: baseY - 50 },
            { x: centerX + 60, y: baseY - 50 },
            { x: centerX - 30, y: baseY },
            { x: centerX + 30, y: baseY }
          ];
          
          const targetPos = positions[diamondPattern % positions.length];
          
          translateX.value = centerX;
          translateY.value = SCREEN_HEIGHT;
          scale.value = 0;
          
          // Rise into position
          translateX.value = withDelay(
            index * 100,
            withSpring(targetPos.x, { damping: 10, stiffness: 80 })
          );
          
          translateY.value = withDelay(
            index * 100,
            withSpring(targetPos.y, { damping: 10, stiffness: 80 })
          );
          
          scale.value = withDelay(
            index * 100,
            withSpring(scaleFactor)
          );
          
          // Continuous sparkle
          opacity.value = withDelay(
            index * 100 + 500,
            withRepeat(
              withSequence(
                withTiming(0.7, { duration: 800 }),
                withTiming(1, { duration: 800 })
              ),
              -1,
              true
            )
          );
          
          // Gentle floating
          translateY.value = withDelay(
            index * 100 + 1000,
            withRepeat(
              withSequence(
                withTiming(targetPos.y - 10, { duration: 2000 }),
                withTiming(targetPos.y + 10, { duration: 2000 })
              ),
              -1,
              true
            )
          );
        }
        break;

      // ⏰ LAST SECOND - Buzzer beater countdown
      case 'lastSecond':
        if (emoji === '⏰') {
          // Clock in center
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = scaleFactor;
          
          // Urgent ticking
          rotation.value = withRepeat(
            withSequence(
              withTiming(15, { duration: 100 }),
              withTiming(-15, { duration: 100 })
            ),
            12,
            true
          );
          
          // Growing urgency
          scale.value = withSequence(
            withTiming(scaleFactor, { duration: 1500 }),
            withTiming(scaleFactor * 1.2, { duration: 500 }),
            withTiming(scaleFactor * 1.4, { duration: 400 }),
            withTiming(0, { duration: 100 })
          );
          
          // Red pulse (simulate with opacity)
          opacity.value = withRepeat(
            withSequence(
              withTiming(0.7, { duration: 200 }),
              withTiming(1, { duration: 200 })
            ),
            6,
            true
          );
        } else if (emoji === '💥') {
          // Explosion particles
          const explodeAngle = (Math.PI * 2 * index) / 12;
          const explodeDistance = 200;
          
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = 0;
          opacity.value = 0;
          
          // Wait for countdown
          setTimeout(() => {
            opacity.value = 1;
            
            // Explode outward
            translateX.value = withTiming(
              SCREEN_WIDTH / 2 + Math.cos(explodeAngle) * explodeDistance,
              {
                duration: 500,
                easing: Easing.out(Easing.cubic)
              }
            );
            
            translateY.value = withTiming(
              SCREEN_HEIGHT / 2 + Math.sin(explodeAngle) * explodeDistance,
              {
                duration: 500,
                easing: Easing.out(Easing.cubic)
              }
            );
            
            scale.value = withSequence(
              withSpring(scaleFactor * 2, { damping: 10, stiffness: 200 }),
              withSpring(scaleFactor * 1.5, { damping: 15, stiffness: 150 }),
              withRepeat(
                withSequence(
                  withTiming(scaleFactor * 1.6, { duration: 200 }),
                  withTiming(scaleFactor * 1.4, { duration: 200 })
                ),
                3,
                true
              )
            );
          }, 2900);
        }
        break;actor * 1.5, { damping: 8, stiffness: 300 }),
              withTiming(0, { duration: 300 })
            );
            
            rotation.value = withTiming(360, { duration: 500 });
          }, 2400);
        

// This completes the cut-off section of the lastSecond case
// Continue from where it was cut off in the Tier 1 implementation

        } else {
          // Target appears after explosion
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = 0;
          opacity.value = 0;
          
          // Appear after explosion
          setTimeout(() => {
            opacity.value = 1;
            scale.value = withSequence(
              withSpring(scaleFactor * 2, { damping: 10, stiffness: 200 }),
              withSpring(scaleFactor * 1.5, { damping: 15, stiffness: 150 }),
              withRepeat(
                withSequence(
                  withTiming(scaleFactor * 1.6, { duration: 200 }),
                  withTiming(scaleFactor * 1.4, { duration: 200 })
                ),
                3,
                true
              )
            );
          }, 2900);
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
      cancelAnimation(rotateY);
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
      { rotate: `${rotation.value}deg` },
      { rotateY: `${rotateY.value}deg` }
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
import { TIER1_EFFECTS } from './constants/tier1Effects';
import { Tier1Particle } from './particles/Tier1Particles';

// Update ALL_EFFECTS to include tier 1
export const ALL_EFFECTS = {
  ...EFFECT_CONFIGS,  // Batch 1 (Tier 0)
  ...BATCH2_EFFECTS,  // Batch 2 (Tier 0)
  ...BATCH3_EFFECTS,  // Batch 3 (Tier 0)
  ...BATCH4_EFFECTS,  // Batch 4 (Tier 0)
  ...TIER1_EFFECTS    // Tier 1 (Any Badge)
};

// Add tier 1 physics to the render function
const tier1Physics = ['enhancedFloat', 'money3D', 'multiExplode', 'riverFlow', 
                     'iceCool', 'sportsRain', 'swirlPattern', 'beastFlex',
                     'diceRoll', 'stormSystem', 'freezeWind', 'ratioOverwhelm',
                     'grassGrow', 'chadEnergy', 'cameraFlashes', 'diamondHold',
                     'lastSecond'];

// In renderParticle function, add tier 1 handling
if (tier1Physics.includes(config.physics)) {
  return (
    <Tier1Particle
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
// File: Update types.ts to include tier 1 physics
// ========================================

export type PhysicsType = 
  // Batch 1 (Tier 0)
  | 'float' | 'floatUp' | 'fall' | 'explode' | 'launch' | 'bounce' | 'orbit' | 'wave'
  // Batch 2 (Tier 0)
  | 'bounce' | 'spinAway' | 'zoomDance' | 'gentleFloat' | 'explodeOut' 
  | 'lookAround' | 'formLetter' | 'riseUp' | 'slideDown' | 'flexPump'
  // Batch 3 (Tier 0)
  | 'crashDown' | 'headExplode' | 'sweatDrop' | 'victoryDance' 
  | 'angerBurst' | 'popIn' | 'formF' | 'sportsBounce' 
  | 'chaosCircle' | 'temperatureFlux' | 'saltPour'
  // Batch 4 (Tier 0)
  | 'rainbowArc' | 'slideInLook' | 'kissMotion' | 'cameraFlash'
  | 'roboticMarch' | 'twinkle' | 'holdStrong' | 'intensifySweat'
  | 'spiralDown' | 'formAmount' | 'lightningStrike' | 'moonLaunch'
  | 'alertOpen' | 'clockCountdown'
  // Tier 1
  | 'enhancedFloat' | 'money3D' | 'multiExplode' | 'riverFlow'
  | 'iceCool' | 'sportsRain' | 'swirlPattern' | 'beastFlex'
  | 'diceRoll' | 'stormSystem' | 'freezeWind' | 'ratioOverwhelm'
  | 'grassGrow' | 'chadEnergy' | 'cameraFlashes' | 'diamondHold'
  | 'lastSecond';

// ========================================
// File: Update components/effects/utils/badgeCheck.ts
// ========================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_EFFECTS } from '../EmojiEffectsManager';

export const checkEffectUnlocked = async (effectId: string): Promise<boolean> => {
  const effect = ALL_EFFECTS[effectId];
  if (!effect) return false;
  
  // Tier 0 is always unlocked
  if (effect.tier === 0) return true;
  
  // Get user badges
  const badgesJson = await AsyncStorage.getItem('user_badges');
  const userBadges = badgesJson ? JSON.parse(badgesJson) : [];
  
  // Tier 1 requires any badge
  if (effect.tier === 1 && effect.unlockRequirement?.value === 'any') {
    return userBadges.length > 0;
  }
  
  // Specific badge requirements (for Tier 2+)
  if (effect.unlockRequirement?.type === 'badge' && effect.unlockRequirement?.value !== 'any') {
    return userBadges.includes(effect.unlockRequirement.value);
  }
  
  return false;
};

// Get all unlocked effects for a user
export const getUserUnlockedEffects = async (): Promise<string[]> => {
  const allEffectIds = Object.keys(ALL_EFFECTS);
  const unlockedEffects: string[] = [];
  
  for (const effectId of allEffectIds) {
    const isUnlocked = await checkEffectUnlocked(effectId);
    if (isUnlocked) {
      unlockedEffects.push(effectId);
    }
  }
  
  return unlockedEffects;
};

// ========================================
// File: Update EffectSelector.tsx for tier display
// ========================================

// Add tier indicator to effect buttons
const EffectButton = ({ effect, isActive, isLocked, onPress }) => {
  const getTierColor = (tier: number) => {
    switch (tier) {
      case 0: return '#4CAF50'; // Green for free
      case 1: return '#2196F3'; // Blue for any badge
      case 2: return '#9C27B0'; // Purple for specific badge
      case 3: return '#FF9800'; // Orange for elite
      case 4: return '#F44336'; // Red for limited
      default: return '#666';
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.effectButton,
        isActive && styles.activeEffect,
        isLocked && styles.lockedEffect
      ]}
      onPress={() => onPress(effect.id)}
    >
      <View style={styles.tierIndicator}>
        <View style={[
          styles.tierDot,
          { backgroundColor: getTierColor(effect.tier) }
        ]} />
      </View>
      <Text style={styles.effectEmoji}>
        {effect.particles[0].emoji}
      </Text>
      <Text style={[
        styles.effectName,
        isLocked && styles.lockedText
      ]}>
        {effect.name}
      </Text>
      {isLocked && (
        <View style={styles.lockIcon}>
          <Text style={styles.lockEmoji}>🔒</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Add these styles
const styles = StyleSheet.create({
  // ... existing styles ...
  tierIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lockedEffect: {
    opacity: 0.6,
  },
  lockedText: {
    color: '#999',
  },
  lockIcon: {
    position: 'absolute',
    top: 5,
    left: 5,
  },
  lockEmoji: {
    fontSize: 12,
  },
});