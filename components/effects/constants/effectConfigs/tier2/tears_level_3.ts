import { EffectConfig } from '../../../types';

export const tearsLevel3Effect: EffectConfig = {
  id: 'tears_level_3',
  name: 'Waterworks',
  tier: 2,
  category: 'losses',
  particles: [
    { emoji: '😭', count: 8, size: { min: 50, max: 70 } },
    { emoji: '💧', count: 30, size: { min: 15, max: 30 } },
    { emoji: '💦', count: 20, size: { min: 20, max: 40 } },
    { emoji: '🌊', count: 5, size: { min: 80, max: 100 } },
  ],
  physics: 'floodingTears',
  duration: 'continuous',
  unlockRequirement: {
    type: 'badge',
    value: 'fade_material',
  },
};
