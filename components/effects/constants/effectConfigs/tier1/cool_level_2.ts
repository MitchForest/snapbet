import { EffectConfig } from '../../../types';

export const coolLevel2Effect: EffectConfig = {
  id: 'cool_level_2',
  name: 'Ice Cold',
  tier: 1,
  category: 'wins',
  particles: [
    { emoji: '😎', count: 3, size: { min: 50, max: 60 } },
    { emoji: '❄️', count: 15, size: { min: 20, max: 30 } },
    { emoji: '✨', count: 10, size: { min: 15, max: 20 } },
  ],
  physics: 'iceCool',
  duration: 'continuous',
  unlockRequirement: {
    type: 'badge',
    value: 'any',
  },
};
