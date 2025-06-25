import { EffectConfig } from '../../../types';

export const nervousEffect: EffectConfig = {
  id: 'nervous',
  name: 'Nervous',
  tier: 0,
  category: 'losses',
  particles: [
    { emoji: '😰', count: 3, size: { min: 40, max: 50 } },
    { emoji: '💧', count: 15, size: { min: 15, max: 25 } },
  ],
  physics: 'sweatDrop',
  duration: 'continuous',
};
