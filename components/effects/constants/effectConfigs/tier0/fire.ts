import { EffectConfig } from '../../../types';

export const fireEffect: EffectConfig = {
  id: 'fire',
  name: 'On Fire',
  tier: 0,
  category: 'wins',
  particles: [
    { emoji: '🔥', count: 12, size: { min: 25, max: 50 } },
    { emoji: '✨', count: 8, size: { min: 10, max: 20 } }, // Add spark particles
  ],
  physics: 'float',
  duration: 'continuous',
};
