import { EffectConfig } from '../../../types';

export const sportsLevel3Effect: EffectConfig = {
  id: 'sports_level_3',
  name: 'Championship Mode',
  tier: 2,
  category: 'hype',
  particles: [
    { emoji: '🏆', count: 3, size: { min: 70, max: 90 } },
    { emoji: '🥇', count: 5, size: { min: 50, max: 70 } },
    { emoji: '🎯', count: 3, size: { min: 60, max: 80 } },
    { emoji: '🏀', count: 8, size: { min: 35, max: 45 } },
    { emoji: '🏈', count: 8, size: { min: 35, max: 45 } },
    { emoji: '⚾', count: 8, size: { min: 35, max: 45 } },
  ],
  physics: 'championOrbit',
  duration: 'continuous',
  unlockRequirement: {
    type: 'badge',
    value: 'sport_champion',
  },
};
