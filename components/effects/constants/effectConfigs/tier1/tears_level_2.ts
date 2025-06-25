import { EffectConfig } from '../../../types';

export const tearsLevel2Effect: EffectConfig = {
  id: 'tears_level_2',
  name: 'Crying Rivers',
  tier: 1,
  category: 'losses',
  particles: [
    { emoji: '😭', count: 5, size: { min: 45, max: 55 } },
    { emoji: '💧', count: 20, size: { min: 15, max: 25 } },
    { emoji: '💦', count: 10, size: { min: 20, max: 30 } },
  ],
  physics: 'riverFlow',
  duration: 'continuous',
  unlockRequirement: {
    type: 'badge',
    value: 'any',
  },
};
