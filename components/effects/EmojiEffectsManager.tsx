import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { EmojiEffect, ParticleConfig, PhysicsType } from '@/types/effects';
import { BaseParticle } from './particles/BaseParticle';
import { AnimatedParticle } from './particles/AnimatedParticle';

interface EmojiEffectsManagerProps {
  effect: EmojiEffect;
  isActive: boolean;
  performanceTier?: 'low' | 'medium' | 'high';
}

interface ActiveParticle extends ParticleConfig {
  id: string;
}

// Map physics types to their component
const PHYSICS_COMPONENT_MAP: Record<string, PhysicsType[]> = {
  BaseParticle: ['float', 'floatUp', 'fall', 'explode', 'launch'],
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
  ],
  // TODO: Add other components as they're created
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function EmojiEffectsManager({
  effect,
  isActive,
  performanceTier = 'medium',
}: EmojiEffectsManagerProps) {
  const [particles, setParticles] = useState<ActiveParticle[]>([]);
  const particleIdRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Adjust particle count based on performance tier
  const getParticleCount = useCallback(() => {
    const baseCount = effect.count;
    switch (performanceTier) {
      case 'low':
        return Math.min(10, Math.floor(baseCount * 0.5));
      case 'high':
        return Math.min(30, baseCount);
      case 'medium':
      default:
        return Math.min(20, Math.floor(baseCount * 0.75));
    }
  }, [effect.count, performanceTier]);

  // Create a new particle
  const createParticle = useCallback(() => {
    const id = `particle-${particleIdRef.current++}`;
    const startX = Math.random() * SCREEN_WIDTH;
    const startY = SCREEN_HEIGHT * 0.7 + Math.random() * 100;

    const newParticle: ActiveParticle = {
      id,
      emoji: effect.emoji,
      startX,
      startY,
      physics: effect.physics,
      duration: effect.duration,
      delay: 0,
    };

    setParticles((prev) => [...prev, newParticle]);

    // Remove particle after duration
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, effect.duration + 500);
  }, [effect]);

  // Handle particle spawning
  useEffect(() => {
    if (!isActive) {
      // Clear all particles when not active
      setParticles([]);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start spawning particles
    const particleCount = getParticleCount();
    const spawnInterval = effect.duration / particleCount;

    // Create initial burst of particles
    for (let i = 0; i < Math.min(3, particleCount); i++) {
      setTimeout(() => createParticle(), i * 100);
    }

    // Continue spawning particles
    intervalRef.current = setInterval(() => {
      createParticle();
    }, spawnInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, createParticle, getParticleCount, effect.duration]);

  // Render particle based on physics type
  const renderParticle = (particle: ActiveParticle) => {
    // Find which component handles this physics type
    const componentType = Object.entries(PHYSICS_COMPONENT_MAP).find(([_, physics]) =>
      physics.includes(particle.physics)
    )?.[0];

    const particleConfig: ParticleConfig = {
      emoji: particle.emoji,
      startX: particle.startX,
      startY: particle.startY,
      physics: particle.physics,
      duration: particle.duration,
      delay: particle.delay,
    };

    switch (componentType) {
      case 'BaseParticle':
        return <BaseParticle key={particle.id} config={particleConfig} />;
      case 'AnimatedParticle':
        return <AnimatedParticle key={particle.id} config={particleConfig} />;
      default:
        // Fallback to BaseParticle with float physics
        console.warn(`No component found for physics type: ${particle.physics}`);
        return <BaseParticle key={particle.id} config={{ ...particleConfig, physics: 'float' }} />;
    }
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map(renderParticle)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
});
