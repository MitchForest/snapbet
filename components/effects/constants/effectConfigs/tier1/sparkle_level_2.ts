import { EffectConfig } from '../../../types';

export const sparkleLevel2Effect: EffectConfig = {
  id: 'sparkle_level_2',
  name: 'Stardust',
  tier: 1,
  category: 'wildcards',
  particles: [
    { emoji: '✨', count: 20, size: { min: 15, max: 30 } },
    { emoji: '⭐', count: 15, size: { min: 20, max: 35 } },
    { emoji: '💫', count: 10, size: { min: 25, max: 40 } },
  ],
  physics: 'swirlPattern',
  duration: 'continuous',
  unlockRequirement: {
    type: 'badge',
    value: 'any',
  },
};
