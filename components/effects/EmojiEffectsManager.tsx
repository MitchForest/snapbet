import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BaseParticle } from './particles/BaseParticle';
import { AnimatedParticle } from './particles/AnimatedParticle';
import { ExpressiveParticle } from './particles/ExpressiveParticle';
import { ComplexParticle } from './particles/ComplexParticle';
import { EnhancedParticle } from './particles/EnhancedParticle';
import { PremiumParticle } from './particles/PremiumParticle';
import { EmojiEffect, PhysicsType } from '@/types/effects';
import { EffectConfig } from './types';
import { getAdjustedParticleCount } from './utils/devicePerformance';
import { triggerHaptic } from './constants/hapticPatterns';
import * as tier0Effects from './constants/effectConfigs/tier0';
import * as tier1Effects from './constants/effectConfigs/tier1';
import * as tier2Effects from './constants/effectConfigs/tier2';

export type PerformanceTier = 'low' | 'medium' | 'high';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EmojiEffectsManagerProps {
  effect: EmojiEffect;
  isActive: boolean;
  performanceTier?: PerformanceTier;
}

interface ActiveParticle {
  id: string;
  emoji: string;
  size: number;
  groupIndex: number;
  particleIndex: number;
  totalInGroup: number;
  physics: PhysicsType;
  duration: number;
  delay: number;
  startX?: number;
  startY?: number;
}

// Get the full effect config from the effect ID
const getEffectConfig = (effectId: string): EffectConfig | null => {
  const allEffects: Record<string, EffectConfig> = {
    ...tier0Effects,
    ...tier1Effects,
    ...tier2Effects,
  };
  // Access by effect ID
  for (const [, value] of Object.entries(allEffects)) {
    if (value && typeof value === 'object' && 'id' in value && value.id === effectId) {
      return value;
    }
  }
  return null;
};

export function EmojiEffectsManager({
  effect,
  isActive,
  performanceTier = 'medium',
}: EmojiEffectsManagerProps) {
  const [particles, setParticles] = useState<ActiveParticle[]>([]);

  // Map physics types to their respective components
  const PHYSICS_COMPONENT_MAP: Record<string, PhysicsType[]> = {
    BaseParticle: [
      'float', 'floatUp', 'fall', 'explode', 'launch',
      'gentleFloat', 'slideDown', 'lookAround', 'riseUp'
    ],
    AnimatedParticle: [
      'bounce',
      'spinAway',
      'zoomDance',
      'swirl',
      'wave',
      'pulse',
      'shake',
      'rotate',
      'fadeIn',
      'slideIn',
      'explodeOut',
    ],
    ExpressiveParticle: [
      'crashDown',
      'headExplode',
      'sweatDrop',
      'victoryDance',
      'angerBurst',
      'popIn',
      'formF',
      'formLetter',
      'sportsBounce',
      'chaosCircle',
      'temperatureFlux',
      'saltPour',
    ],
    ComplexParticle: [
      'rainbowArc',
      'slideInLook',
      'kissMotion',
      'cameraFlash',
      'roboticMarch',
      'twinkle',
      'holdStrong',
      'intensifySweat',
      'spiralDown',
      'formAmount',
      'lightningStrike',
      'moonLaunch',
      'alertOpen',
      'clockCountdown',
    ],
    EnhancedParticle: [
      'enhancedFloat',
      'money3D',
      'multiExplode',
      'riverFlow',
      'iceCool',
      'sportsRain',
      'swirlPattern',
      'beastFlex',
      'diceRoll',
      'stormSystem',
      'freezeWind',
      'ratioOverwhelm',
      'grassGrow',
      'chadEnergy',
      'cameraFlashes',
      'diamondHold',
      'lastSecond',
    ],
    PremiumParticle: [
      'infernoEruption',
      'moneyTornado',
      'fireworksShow',
      'floodingTears',
      'diamondAura',
      'championOrbit',
      'galaxySwirl',
      'slotSpin',
      'toxicBubble',
      'smoothCharm',
      'spotlight',
      'bagBurst',
    ],
  };

  const generateParticles = useCallback(() => {
    if (!isActive || !effect) return;

    // Get the full effect config
    const effectConfig = getEffectConfig(effect.id);
    if (!effectConfig) return;

    // Trigger haptic feedback
    triggerHaptic();

    const newParticles: ActiveParticle[] = [];
    const duration = typeof effectConfig.duration === 'number' ? effectConfig.duration : 5000;

    effectConfig.particles.forEach((particleGroup, groupIndex) => {
      const adjustedCount = getAdjustedParticleCount(
        particleGroup.count,
        performanceTier,
        effectConfig.tier
      );

      for (let i = 0; i < adjustedCount; i++) {
        const id = `${Date.now()}-${groupIndex}-${i}`;
        const size = particleGroup.size
          ? particleGroup.size.min +
            Math.random() * (particleGroup.size.max - particleGroup.size.min)
          : 24;
        const delay = particleGroup.delay
          ? particleGroup.delay.min +
            Math.random() * (particleGroup.delay.max - particleGroup.delay.min)
          : 0;

        // Calculate start positions for old-style particles
        const startX = Math.random() * SCREEN_WIDTH - SCREEN_WIDTH / 2;
        const startY = SCREEN_HEIGHT / 2;

        newParticles.push({
          id,
          emoji: particleGroup.emoji,
          size,
          groupIndex,
          particleIndex: i,
          totalInGroup: adjustedCount,
          physics: effectConfig.physics,
          duration,
          delay,
          startX,
          startY,
        });
      }
    });

    setParticles((prev) => [...prev, ...newParticles]);

    // Remove particles after duration
    const cleanupDelay = duration + 500;
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, cleanupDelay);
  }, [effect, isActive, performanceTier]);

  useEffect(() => {
    if (isActive) {
      generateParticles();

      // For continuous effects, regenerate particles
      const effectConfig = getEffectConfig(effect.id);
      if (effectConfig && effectConfig.duration === 'continuous') {
        const interval = setInterval(generateParticles, 3000); // Regenerate every 3 seconds
        return () => clearInterval(interval);
      }
    }
  }, [effect, isActive, generateParticles]);

  const renderParticle = (particle: ActiveParticle) => {
    // Find which component handles this physics type
    const componentType = Object.entries(PHYSICS_COMPONENT_MAP).find(([_, physics]) =>
      physics.includes(particle.physics)
    )?.[0];

    // Props for new-style particle components
    const particleProps = {
      emoji: particle.emoji,
      size: particle.size,
      groupIndex: particle.groupIndex,
      particleIndex: particle.particleIndex,
      totalInGroup: particle.totalInGroup,
      config: {
        physics: particle.physics,
        duration: particle.duration,
        delay: particle.delay,
      },
    };

    // Config for old-style particle components
    const oldStyleConfig = {
      emoji: particle.emoji,
      startX: particle.startX || 0,
      startY: particle.startY || 0,
      physics: particle.physics,
      duration: particle.duration,
      delay: particle.delay,
    };

    switch (componentType) {
      case 'BaseParticle':
        return <BaseParticle key={particle.id} config={oldStyleConfig} />;
      case 'AnimatedParticle':
        return <AnimatedParticle key={particle.id} config={oldStyleConfig} />;
      case 'ExpressiveParticle':
        return <ExpressiveParticle key={particle.id} {...particleProps} />;
      case 'ComplexParticle':
        return <ComplexParticle key={particle.id} {...particleProps} />;
      case 'EnhancedParticle':
        return <EnhancedParticle key={particle.id} {...particleProps} />;
      case 'PremiumParticle':
        return <PremiumParticle key={particle.id} {...particleProps} />;
      default:
        // Fallback to BaseParticle with float physics
        console.warn(`No component found for physics type: ${particle.physics}`);
        return <BaseParticle key={particle.id} config={{ ...oldStyleConfig, physics: 'float' }} />;
    }
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map(renderParticle)}
    </View>
  );
}
