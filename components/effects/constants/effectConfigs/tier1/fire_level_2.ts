import { EffectConfig } from '../../../types';

export const fireLevel2Effect: EffectConfig = {
  id: 'fire_level_2',
  name: 'Blazing Hot',
  tier: 1,
  category: 'wins',
  particles: [
    { emoji: '🔥', count: 25, size: { min: 20, max: 50 } },
    { emoji: '✨', count: 10, size: { min: 15, max: 25 } },
  ],
  physics: 'enhancedFloat',
  duration: 'continuous',
  unlockRequirement: {
    type: 'badge',
    value: 'any',
  },
};
