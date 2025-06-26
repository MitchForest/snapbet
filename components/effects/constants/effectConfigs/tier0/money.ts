import { EffectConfig } from '../../../types';

export const moneyEffect: EffectConfig = {
  id: 'money',
  name: 'Cha-Ching',
  tier: 0,
  category: 'wins',
  particles: [
    { emoji: '💵', count: 10, size: { min: 30, max: 50 } }, // Bills
    { emoji: '💰', count: 5, size: { min: 25, max: 35 } }, // Money bags
    { emoji: '🪙', count: 8, size: { min: 15, max: 25 } }, // Coins fall faster
  ],
  physics: 'fall',
  duration: 'continuous',
};
