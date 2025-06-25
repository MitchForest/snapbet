import { EffectConfig } from '../../../types';

export const celebrationLevel2Effect: EffectConfig = {
  id: 'celebration_level_2',
  name: 'Party Time',
  tier: 1,
  category: 'wins',
  particles: [
    { emoji: '🎉', count: 12, size: { min: 30, max: 45 } },
    { emoji: '🎊', count: 12, size: { min: 30, max: 45 } },
    { emoji: '🎈', count: 8, size: { min: 25, max: 40 } },
  ],
  physics: 'multiExplode',
  duration: 3000,
  unlockRequirement: {
    type: 'badge',
    value: 'any',
  },
};
