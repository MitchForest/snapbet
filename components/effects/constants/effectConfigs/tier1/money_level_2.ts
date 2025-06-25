import { EffectConfig } from '../../../types';

export const moneyLevel2Effect: EffectConfig = {
  id: 'money_level_2',
  name: 'Money Shower',
  tier: 1,
  category: 'wins',
  particles: [
    { emoji: '💵', count: 10, size: { min: 30, max: 40 } },
    { emoji: '💴', count: 8, size: { min: 30, max: 40 } },
    { emoji: '💶', count: 6, size: { min: 30, max: 40 } },
    { emoji: '💷', count: 6, size: { min: 30, max: 40 } },
  ],
  physics: 'money3D',
  duration: 'continuous',
  unlockRequirement: {
    type: 'badge',
    value: 'any',
  },
};
