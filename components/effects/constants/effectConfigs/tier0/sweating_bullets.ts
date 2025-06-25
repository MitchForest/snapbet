import { EffectConfig } from '../../../types';

export const sweatingBulletsEffect: EffectConfig = {
  id: 'sweating_bullets',
  name: 'Sweating Bullets',
  tier: 0,
  category: 'betting',
  particles: [
    { emoji: '😅', count: 1, size: { min: 80, max: 80 } },
    { emoji: '💦', count: 20, size: { min: 15, max: 25 } },
    { emoji: '💧', count: 15, size: { min: 10, max: 20 } },
  ],
  physics: 'intensifySweat',
  duration: 'continuous',
};
