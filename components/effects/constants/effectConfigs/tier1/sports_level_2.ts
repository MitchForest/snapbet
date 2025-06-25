import { EffectConfig } from '../../../types';

export const sportsLevel2Effect: EffectConfig = {
  id: 'sports_level_2',
  name: 'Sports Mania',
  tier: 1,
  category: 'hype',
  particles: [
    { emoji: '🏀', count: 5, size: { min: 35, max: 45 } },
    { emoji: '🏈', count: 5, size: { min: 35, max: 45 } },
    { emoji: '⚾', count: 5, size: { min: 35, max: 45 } },
    { emoji: '⚽', count: 5, size: { min: 35, max: 45 } },
    { emoji: '🏒', count: 5, size: { min: 35, max: 45 } },
  ],
  physics: 'sportsRain',
  duration: 'continuous',
  unlockRequirement: {
    type: 'badge',
    value: 'any',
  },
};
