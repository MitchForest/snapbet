import { EffectConfig } from '../../../types';

export const builtDifferentEffect: EffectConfig = {
  id: 'built_different',
  name: 'Built Different',
  tier: 1,
  category: 'hype',
  particles: [
    { emoji: '🗿', count: 1, size: { min: 100, max: 100 } },
    { emoji: '💪', count: 4, size: { min: 40, max: 50 } },
    { emoji: '⚡', count: 12, size: { min: 25, max: 35 } },
  ],
  physics: 'chadEnergy',
  duration: 2000,
  unlockRequirement: {
    type: 'badge',
    value: 'any',
  },
};
