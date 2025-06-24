// ========================================
// File: components/effects/types.ts
// ========================================

export type PhysicsType = 'float' | 'floatUp' | 'fall' | 'explode' | 'launch' | 'bounce' | 'orbit' | 'wave';
export type EffectDuration = number | 'continuous';
export type DeviceTier = 'low' | 'medium' | 'high';

export interface ParticleConfig {
  emoji: string;
  count: number;
  size?: { min: number; max: number };
  opacity?: { min: number; max: number };
  delay?: { min: number; max: number };
}

export interface PhysicsConfig {
  type: PhysicsType;
  gravity?: number;
  damping?: number;
  initialVelocity?: { x: [number, number]; y: [number, number] };
  springConfig?: {
    damping: number;
    stiffness: number;
  };
}

export interface EffectConfig {
  id: string;
  name: string;
  tier: 0 | 1 | 2 | 3 | 4;
  category: 'wins' | 'losses' | 'vibes' | 'hype' | 'wildcards' | 'limited';
  particles: ParticleConfig[];
  physics: PhysicsType;
  duration: EffectDuration;
  unlockRequirement?: {
    type: 'badge' | 'achievement' | 'time';
    value: string;
  };
}

// ========================================
// File: components/effects/constants/effectsConfig.ts
// ========================================

import { EffectConfig } from '../types';

export const EFFECT_CONFIGS: Record<string, EffectConfig> = {
  // 🔥 FIRE EFFECT
  fire: {
    id: 'fire',
    name: 'On Fire',
    tier: 0,
    category: 'wins',
    particles: [
      { emoji: '🔥', count: 15, size: { min: 20, max: 40 } }
    ],
    physics: 'float',
    duration: 'continuous'
  },

  // 💀 SKULL EFFECT
  skull: {
    id: 'skull',
    name: "I'm Dead 💀",
    tier: 0,
    category: 'vibes',
    particles: [
      { emoji: '💀', count: 20, size: { min: 25, max: 35 } }
    ],
    physics: 'floatUp',
    duration: 'continuous'
  },

  // 💰 MONEY EFFECT
  money: {
    id: 'money',
    name: 'Cha-Ching',
    tier: 0,
    category: 'wins',
    particles: [
      { emoji: '💵', count: 15, size: { min: 25, max: 40 } }
    ],
    physics: 'fall',
    duration: 'continuous'
  },

  // 🎉 CONFETTI EFFECT
  confetti: {
    id: 'confetti',
    name: 'Winner!',
    tier: 0,
    category: 'wins',
    particles: [
      { emoji: '🎉', count: 10 },
      { emoji: '🎊', count: 10 },
      { emoji: '🎈', count: 5 }
    ],
    physics: 'explode',
    duration: 2000
  },

  // 😭 TEARS EFFECT
  tears: {
    id: 'tears',
    name: 'Bad Beat',
    tier: 0,
    category: 'losses',
    particles: [
      { emoji: '💧', count: 15, size: { min: 15, max: 25 } },
      { emoji: '😭', count: 3, size: { min: 35, max: 45 } }
    ],
    physics: 'fall',
    duration: 'continuous'
  },

  // 🚀 ROCKET EFFECT
  rocket: {
    id: 'rocket',
    name: 'To The Moon',
    tier: 0,
    category: 'hype',
    particles: [
      { emoji: '🚀', count: 1, size: { min: 50, max: 50 } },
      { emoji: '⭐', count: 10, size: { min: 15, max: 25 } },
      { emoji: '🌙', count: 1, size: { min: 60, max: 60 } }
    ],
    physics: 'launch',
    duration: 3000
  }
};

// ========================================
// File: components/effects/utils/devicePerformance.ts
// ========================================

import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import type { DeviceTier } from '../types';

interface PerformanceBenchmark {
  fps: number;
  totalMemory: number;
  deviceScore: number;
}

export const PARTICLE_LIMITS = {
  high: { base: 30, reduced: 20, max: 60 },
  medium: { base: 20, reduced: 15, max: 40 },
  low: { base: 10, reduced: 8, max: 20 }
};

let cachedTier: DeviceTier | null = null;

export const runPerformanceBenchmark = async (): Promise<PerformanceBenchmark> => {
  // Simple FPS test
  let frameCount = 0;
  const startTime = Date.now();
  
  const measureFPS = () => new Promise<number>((resolve) => {
    const countFrames = () => {
      frameCount++;
      if (Date.now() - startTime < 1000) {
        requestAnimationFrame(countFrames);
      } else {
        resolve(frameCount);
      }
    };
    requestAnimationFrame(countFrames);
  });

  const fps = await measureFPS();
  const totalMemory = await DeviceInfo.getTotalMemory();
  
  // Simple device scoring
  let deviceScore = 0;
  if (fps >= 58) deviceScore += 3;
  else if (fps >= 50) deviceScore += 2;
  else deviceScore += 1;
  
  if (totalMemory > 4000000000) deviceScore += 3; // 4GB+
  else if (totalMemory > 3000000000) deviceScore += 2; // 3GB+
  else deviceScore += 1;
  
  if (Platform.OS === 'ios') deviceScore += 1; // iOS generally better optimized
  
  return { fps, totalMemory, deviceScore };
};

export const getDevicePerformanceTier = async (): Promise<DeviceTier> => {
  if (cachedTier) return cachedTier;
  
  try {
    const benchmark = await runPerformanceBenchmark();
    
    if (benchmark.deviceScore >= 6) cachedTier = 'high';
    else if (benchmark.deviceScore >= 4) cachedTier = 'medium';
    else cachedTier = 'low';
    
  } catch (error) {
    console.warn('Performance benchmark failed, defaulting to medium', error);
    cachedTier = 'medium';
  }
  
  return cachedTier;
};

export const getParticleLimit = (tier: DeviceTier, effectTier: number): number => {
  const limits = PARTICLE_LIMITS[tier];
  if (effectTier === 0) return limits.base;
  if (effectTier === 1) return limits.reduced;
  return Math.min(limits.max, limits.base * (effectTier + 1));
};

// ========================================
// File: components/effects/particles/BaseParticle.tsx
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

interface BaseParticleProps {
  emoji: string;
  index: number;
  physics: PhysicsType;
  duration: number | null;
  size?: { min: number; max: number };
  onComplete?: () => void;
}

export const BaseParticle: React.FC<BaseParticleProps> = ({
  emoji,
  index,
  physics,
  duration,
  size = { min: 20, max: 40 },
  onComplete
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const delay = index * 50; // Stagger particles
    const particleSize = size.min + Math.random() * (size.max - size.min);
    const scaleFactor = particleSize / 30; // Base size is 30

    switch (physics) {
      case 'float':
        // Fire effect - float up from bottom
        const startX = Math.random() * SCREEN_WIDTH;
        translateX.value = startX;
        translateY.value = SCREEN_HEIGHT - 100;
        
        scale.value = withDelay(delay, withSpring(scaleFactor));
        
        translateY.value = withDelay(
          delay,
          withRepeat(
            withTiming(-200, {
              duration: 4000 + Math.random() * 2000,
              easing: Easing.linear
            }),
            -1,
            false
          )
        );
        
        translateX.value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(startX + 30, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
              withTiming(startX - 30, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
          )
        );
        
        rotation.value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(15, { duration: 1000 }),
              withTiming(-15, { duration: 1000 })
            ),
            -1,
            true
          )
        );
        break;

      case 'floatUp':
        // Skull effect - float up with wobble and fade
        const skullStartX = Math.random() * SCREEN_WIDTH;
        translateX.value = skullStartX;
        translateY.value = SCREEN_HEIGHT / 2 + Math.random() * 200;
        
        scale.value = withDelay(delay, withSpring(scaleFactor));
        
        translateY.value = withDelay(
          delay,
          withRepeat(
            withTiming(-200, {
              duration: 6000,
              easing: Easing.out(Easing.quad)
            }),
            -1,
            false
          )
        );
        
        translateX.value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(skullStartX + 40, { duration: 1000 }),
              withTiming(skullStartX - 40, { duration: 1000 })
            ),
            -1,
            true
          )
        );
        
        // Fade out as it rises
        opacity.value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(1, { duration: 3000 }),
              withTiming(0, { duration: 3000 })
            ),
            -1,
            false
          )
        );
        break;

      case 'fall':
        // Money/Tears effect - fall with sway
        const fallStartX = Math.random() * SCREEN_WIDTH;
        translateX.value = fallStartX;
        translateY.value = -100;
        
        const fallDelay = delay + Math.random() * 1000;
        scale.value = withDelay(fallDelay, withSpring(scaleFactor));
        
        translateY.value = withDelay(
          fallDelay,
          withRepeat(
            withTiming(SCREEN_HEIGHT + 100, {
              duration: 3000 + Math.random() * 2000,
              easing: Easing.linear
            }),
            -1,
            false
          )
        );
        
        translateX.value = withDelay(
          fallDelay,
          withRepeat(
            withSequence(
              withTiming(fallStartX + 30, { duration: 1500 }),
              withTiming(fallStartX - 30, { duration: 1500 })
            ),
            -1,
            true
          )
        );
        
        rotation.value = withDelay(
          fallDelay,
          withRepeat(
            withTiming(360, { duration: 2000, easing: Easing.linear }),
            -1
          )
        );
        break;

      case 'explode':
        // Confetti effect - explode from center
        const centerX = SCREEN_WIDTH / 2;
        const centerY = SCREEN_HEIGHT / 2;
        const angle = (Math.PI * 2 * index) / 25 + Math.random() * 0.5;
        const velocity = 300 + Math.random() * 300;
        
        translateX.value = centerX;
        translateY.value = centerY;
        
        scale.value = withDelay(
          delay,
          withSequence(
            withSpring(scaleFactor, { damping: 8, stiffness: 200 }),
            withDelay(1500, withTiming(0, { duration: 500 }))
          )
        );
        
        translateX.value = withDelay(
          delay,
          withTiming(centerX + Math.cos(angle) * velocity, {
            duration: 1500,
            easing: Easing.out(Easing.quad)
          })
        );
        
        translateY.value = withDelay(
          delay,
          withSequence(
            withTiming(centerY + Math.sin(angle) * velocity - 100, {
              duration: 800,
              easing: Easing.out(Easing.quad)
            }),
            withTiming(SCREEN_HEIGHT + 100, {
              duration: 1200,
              easing: Easing.in(Easing.quad)
            })
          )
        );
        
        rotation.value = withDelay(
          delay,
          withTiming(Math.random() * 720 - 360, {
            duration: 2000,
            easing: Easing.linear
          })
        );
        
        opacity.value = withDelay(
          delay,
          withSequence(
            withTiming(1, { duration: 1500 }),
            withTiming(0, { duration: 500 })
          )
        );
        
        if (duration && onComplete) {
          setTimeout(() => {
            runOnJS(onComplete)();
          }, duration);
        }
        break;

      case 'launch':
        // Rocket effect - launch trajectory
        if (emoji === '🚀') {
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT - 100;
          scale.value = withSpring(scaleFactor * 1.5);
          
          translateY.value = withTiming(-200, {
            duration: duration || 3000,
            easing: Easing.in(Easing.quad)
          });
          
          translateX.value = withRepeat(
            withSequence(
              withTiming(SCREEN_WIDTH / 2 + 20, { duration: 500 }),
              withTiming(SCREEN_WIDTH / 2 - 20, { duration: 500 })
            ),
            3,
            true
          );
          
          rotation.value = withRepeat(
            withSequence(
              withTiming(-15, { duration: 500 }),
              withTiming(15, { duration: 500 })
            ),
            3,
            true
          );
          
        } else if (emoji === '⭐') {
          // Star trail
          const starStartX = SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 100;
          translateX.value = starStartX;
          translateY.value = SCREEN_HEIGHT - 100;
          
          scale.value = withDelay(delay * 3, withSpring(scaleFactor * 0.7));
          
          translateY.value = withDelay(
            delay * 3,
            withTiming(100, {
              duration: duration || 3000,
              easing: Easing.out(Easing.quad)
            })
          );
          
          opacity.value = withDelay(
            delay * 3,
            withTiming(0, {
              duration: duration || 3000,
              easing: Easing.in(Easing.quad)
            })
          );
          
        } else if (emoji === '🌙') {
          // Moon at destination
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = 100;
          scale.value = 0;
          
          scale.value = withDelay(
            (duration || 3000) - 1000,
            withSequence(
              withSpring(scaleFactor * 2, { damping: 10, stiffness: 100 }),
              withDelay(500, withTiming(0, { duration: 500 }))
            )
          );
        }
        
        if (duration && onComplete) {
          setTimeout(() => {
            runOnJS(onComplete)();
          }, duration);
        }
        break;
    }

    return () => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(scale);
      cancelAnimation(rotation);
      cancelAnimation(opacity);
    };
  }, [emoji, index, physics, duration, size]);

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
// File: components/effects/EmojiEffectsManager.tsx
// ========================================

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { BaseParticle } from './particles/BaseParticle';
import { EFFECT_CONFIGS } from './constants/effectsConfig';
import { getDevicePerformanceTier, getParticleLimit } from './utils/devicePerformance';
import type { EffectConfig, DeviceTier } from './types';

interface EmojiEffectsManagerProps {
  effectId: string;
  onComplete?: () => void;
}

export const EmojiEffectsManager: React.FC<EmojiEffectsManagerProps> = ({
  effectId,
  onComplete
}) => {
  const [particles, setParticles] = useState<Array<{ id: string; emoji: string; size?: { min: number; max: number } }>>([]);
  const [deviceTier, setDeviceTier] = useState<DeviceTier>('medium');
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    // Get device performance tier
    getDevicePerformanceTier().then(setDeviceTier);
  }, []);

  useEffect(() => {
    const config = EFFECT_CONFIGS[effectId];
    if (!config) return;

    // Create particles based on config and device performance
    const particleLimit = getParticleLimit(deviceTier, config.tier);
    const newParticles: typeof particles = [];
    let totalParticles = 0;

    config.particles.forEach((particleConfig) => {
      const count = Math.min(
        particleConfig.count,
        particleLimit - totalParticles
      );
      
      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: `${effectId}_${particleConfig.emoji}_${i}`,
          emoji: particleConfig.emoji,
          size: particleConfig.size
        });
      }
      
      totalParticles += count;
    });

    setParticles(newParticles);
    setCompletedCount(0);
  }, [effectId, deviceTier]);

  const handleParticleComplete = useCallback(() => {
    setCompletedCount(prev => {
      const newCount = prev + 1;
      const config = EFFECT_CONFIGS[effectId];
      
      if (config?.duration !== 'continuous' && newCount >= particles.length && onComplete) {
        onComplete();
      }
      
      return newCount;
    });
  }, [effectId, particles.length, onComplete]);

  const config = EFFECT_CONFIGS[effectId];
  if (!config) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map((particle, index) => (
        <BaseParticle
          key={particle.id}
          emoji={particle.emoji}
          index={index}
          physics={config.physics}
          duration={config.duration === 'continuous' ? null : config.duration}
          size={particle.size}
          onComplete={config.duration !== 'continuous' ? handleParticleComplete : undefined}
        />
      ))}
    </View>
  );
};

// ========================================
// File: components/effects/EffectSelector.tsx
// ========================================

import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { EFFECT_CONFIGS } from './constants/effectsConfig';
import type { EffectConfig } from './types';

interface EffectSelectorProps {
  activeEffectId: string | null;
  onSelectEffect: (effectId: string) => void;
  unlockedEffects?: string[];
}

const CATEGORY_EMOJIS = {
  wins: '🏆',
  losses: '😭',
  vibes: '🎭',
  hype: '⚡',
  wildcards: '🎲',
  limited: '🎄'
};

export const EffectSelector: React.FC<EffectSelectorProps> = ({
  activeEffectId,
  onSelectEffect,
  unlockedEffects
}) => {
  // For now, show all Tier 0 effects
  const availableEffects = Object.values(EFFECT_CONFIGS).filter(
    effect => effect.tier === 0
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {availableEffects.map((effect) => (
          <TouchableOpacity
            key={effect.id}
            style={[
              styles.effectButton,
              activeEffectId === effect.id && styles.activeEffect
            ]}
            onPress={() => onSelectEffect(effect.id)}
          >
            <Text style={styles.effectEmoji}>
              {effect.particles[0].emoji}
            </Text>
            <Text style={styles.effectName}>{effect.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  effectButton: {
    alignItems: 'center',
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeEffect: {
    backgroundColor: 'rgba(76,175,80,0.3)',
    transform: [{ scale: 1.1 }],
  },
  effectEmoji: {
    fontSize: 30,
    marginBottom: 5,
  },
  effectName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

// ========================================
// File: screens/CameraScreen.tsx (Example Integration)
// ========================================

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { EmojiEffectsManager } from '../components/effects/EmojiEffectsManager';
import { EffectSelector } from '../components/effects/EffectSelector';
import { EFFECT_CONFIGS } from '../components/effects/constants/effectsConfig';

export const CameraScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [activeEffectId, setActiveEffectId] = useState<string | null>(null);
  const [camera, setCamera] = useState<Camera | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleEffectSelect = (effectId: string) => {
    if (activeEffectId === effectId) {
      setActiveEffectId(null);
    } else {
      setActiveEffectId(effectId);
    }
  };

  const handleEffectComplete = () => {
    const config = activeEffectId ? EFFECT_CONFIGS[activeEffectId] : null;
    if (config && config.duration !== 'continuous') {
      setActiveEffectId(null);
    }
  };

  const takePicture = async () => {
    if (camera) {
      const photo = await camera.takePictureAsync();
      // Handle photo with effect overlay
      console.log('Photo taken with effect:', activeEffectId);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container} />;
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={StyleSheet.absoluteFillObject}
        ref={(ref) => setCamera(ref)}
      />
      
      {/* Effects Overlay */}
      {activeEffectId && (
        <EmojiEffectsManager
          effectId={activeEffectId}
          onComplete={handleEffectComplete}
        />
      )}
      
      {/* Camera Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureInner} />
        </TouchableOpacity>
      </View>
      
      {/* Effect Selector */}
      <EffectSelector
        activeEffectId={activeEffectId}
        onSelectEffect={handleEffectSelect}
      />
      
      {/* Stop Effect Button (for continuous effects) */}
      {activeEffectId && EFFECT_CONFIGS[activeEffectId]?.duration === 'continuous' && (
        <TouchableOpacity
          style={styles.stopButton}
          onPress={() => setActiveEffectId(null)}
        >
          <Text style={styles.stopButtonText}>Stop Effect</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  stopButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(244,67,54,0.8)',
    borderRadius: 20,
  },
  stopButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});