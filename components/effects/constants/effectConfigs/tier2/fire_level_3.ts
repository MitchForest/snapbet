import { EffectConfig } from '../../../types';

export const fireLevel3Effect: EffectConfig = {
  id: 'fire_level_3',
  name: 'Inferno Mode',
  tier: 2,
  category: 'wins',
  particles: [
    { emoji: '🔥', count: 40, size: { min: 30, max: 50 } },
    { emoji: '🌋', count: 3, size: { min: 60, max: 80 } },
    { emoji: '💥', count: 8, size: { min: 40, max: 60 } },
  ],
  physics: 'infernoEruption',
  duration: 'continuous',
  unlockRequirement: {
    type: 'badge',
    value: 'hot_streak',
  },
};
