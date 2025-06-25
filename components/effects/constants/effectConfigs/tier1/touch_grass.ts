import { EffectConfig } from '../../../types';

export const touchGrassEffect: EffectConfig = {
  id: 'touch_grass',
  name: 'Touch Grass',
  tier: 1,
  category: 'hype',
  particles: [
    { emoji: '🌱', count: 20, size: { min: 20, max: 30 } },
    { emoji: '🌿', count: 15, size: { min: 25, max: 35 } },
    { emoji: '☘️', count: 10, size: { min: 20, max: 30 } },
  ],
  physics: 'grassGrow',
  duration: 3000,
  unlockRequirement: {
    type: 'badge',
    value: 'any',
  },
};
