import { EffectConfig } from '../../../types';

export const celebrationLevel3Effect: EffectConfig = {
  id: 'celebration_level_3',
  name: 'Epic Celebration',
  tier: 2,
  category: 'wins',
  particles: [
    { emoji: '🎉', count: 15, size: { min: 30, max: 50 } },
    { emoji: '🎊', count: 15, size: { min: 30, max: 50 } },
    { emoji: '🎈', count: 10, size: { min: 35, max: 55 } },
    { emoji: '🎆', count: 8, size: { min: 50, max: 70 } },
    { emoji: '🎇', count: 8, size: { min: 45, max: 65 } },
    { emoji: '✨', count: 20, size: { min: 15, max: 30 } },
    { emoji: '💫', count: 15, size: { min: 20, max: 35 } },
    { emoji: '⭐', count: 10, size: { min: 25, max: 40 } },
  ],
  physics: 'fireworksShow',
  duration: 5000,
  unlockRequirement: {
    type: 'badge',
    value: 'perfect_day',
  },
};
