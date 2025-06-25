import { EffectConfig } from '../../../types';

export const moneyEffect: EffectConfig = {
  id: 'money',
  name: 'Cha-Ching',
  tier: 0,
  category: 'wins',
  particles: [{ emoji: '💵', count: 15, size: { min: 25, max: 40 } }],
  physics: 'fall',
  duration: 'continuous',
};
