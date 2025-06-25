import { EffectConfig } from '../../../types';

export const coolLevel3Effect: EffectConfig = {
  id: 'cool_level_3',
  name: 'Untouchable',
  tier: 2,
  category: 'wins',
  particles: [
    { emoji: '😎', count: 5, size: { min: 50, max: 70 } },
    { emoji: '🕶️', count: 8, size: { min: 40, max: 60 } },
    { emoji: '💎', count: 20, size: { min: 20, max: 40 } },
    { emoji: '✨', count: 15, size: { min: 15, max: 25 } },
  ],
  physics: 'diamondAura',
  duration: 'continuous',
  unlockRequirement: {
    type: 'badge',
    value: 'sharp',
  },
};
