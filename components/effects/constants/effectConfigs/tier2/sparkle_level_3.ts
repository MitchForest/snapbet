import { EffectConfig } from '../../../types';

export const sparkleLevel3Effect: EffectConfig = {
  id: 'sparkle_level_3',
  name: 'Cosmic',
  tier: 2,
  category: 'wildcards',
  particles: [
    { emoji: '✨', count: 30, size: { min: 15, max: 35 } },
    { emoji: '⭐', count: 20, size: { min: 20, max: 40 } },
    { emoji: '💫', count: 15, size: { min: 25, max: 45 } },
    { emoji: '🌟', count: 10, size: { min: 35, max: 55 } },
    { emoji: '🌠', count: 5, size: { min: 50, max: 70 } },
    { emoji: '☄️', count: 3, size: { min: 60, max: 80 } },
  ],
  physics: 'galaxySwirl',
  duration: 'continuous',
  unlockRequirement: {
    type: 'badge',
    value: 'special_achievement',
  },
};
