import { EffectConfig } from '../../../types';

export const moneyLevel3Effect: EffectConfig = {
  id: 'money_level_3',
  name: 'Make It Rain',
  tier: 2,
  category: 'wins',
  particles: [
    { emoji: '💵', count: 20, size: { min: 30, max: 45 } },
    { emoji: '💴', count: 15, size: { min: 30, max: 45 } },
    { emoji: '💶', count: 15, size: { min: 30, max: 45 } },
    { emoji: '💷', count: 10, size: { min: 30, max: 45 } },
    { emoji: '💰', count: 5, size: { min: 50, max: 70 } },
    { emoji: '💸', count: 10, size: { min: 35, max: 50 } },
    { emoji: '🤑', count: 3, size: { min: 60, max: 80 } },
  ],
  physics: 'moneyTornado',
  duration: 'continuous',
  unlockRequirement: {
    type: 'badge',
    value: 'profit_leader',
  },
};
