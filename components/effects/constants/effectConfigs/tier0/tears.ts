import { EffectConfig } from '../../../types';

export const tearsEffect: EffectConfig = {
  id: 'tears',
  name: 'Bad Beat',
  tier: 0,
  category: 'losses',
  particles: [
    { emoji: '💧', count: 15, size: { min: 15, max: 25 } },
    { emoji: '😭', count: 3, size: { min: 35, max: 45 } },
  ],
  physics: 'fall',
  duration: 'continuous',
};
