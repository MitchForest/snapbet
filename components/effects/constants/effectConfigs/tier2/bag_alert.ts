import { EffectConfig } from '../../../types';

export const bagAlertEffect: EffectConfig = {
  id: 'bag_alert',
  name: 'Bag Alert',
  tier: 2,
  category: 'betting',
  particles: [
    { emoji: '💼', count: 1, size: { min: 80, max: 80 } },
    { emoji: '🚨', count: 6, size: { min: 40, max: 50 } },
    { emoji: '💰', count: 20, size: { min: 30, max: 45 } },
  ],
  physics: 'bagBurst',
  duration: 'continuous',
  unlockRequirement: {
    type: 'badge',
    value: 'profit_leader',
  },
};
