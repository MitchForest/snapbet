import { EffectConfig } from '../../../types';

export const muscleLevel2Effect: EffectConfig = {
  id: 'muscle_level_2',
  name: 'Beast Mode',
  tier: 1,
  category: 'hype',
  particles: [
    { emoji: '💪', count: 4, size: { min: 50, max: 60 } },
    { emoji: '🦾', count: 2, size: { min: 50, max: 60 } },
    { emoji: '⚡', count: 8, size: { min: 25, max: 35 } },
  ],
  physics: 'beastFlex',
  duration: 'continuous',
  unlockRequirement: {
    type: 'badge',
    value: 'any',
  },
};
