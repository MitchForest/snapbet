import { EffectConfig } from '../../../types';

export const ratioEffect: EffectConfig = {
  id: 'ratio',
  name: "Ratio'd",
  tier: 1,
  category: 'vibes',
  particles: [
    { emoji: '💬', count: 30, size: { min: 20, max: 35 } },
    { emoji: '📊', count: 3, size: { min: 40, max: 50 } },
    { emoji: '📉', count: 2, size: { min: 35, max: 45 } },
  ],
  physics: 'ratioOverwhelm',
  duration: 3000,
  unlockRequirement: {
    type: 'badge',
    value: 'any',
  },
};
