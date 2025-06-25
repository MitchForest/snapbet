import { EffectConfig } from '../../../types';

export const staySaltyEffect: EffectConfig = {
  id: 'stay_salty',
  name: 'Stay Salty',
  tier: 0,
  category: 'hype',
  particles: [
    { emoji: '🧂', count: 20, size: { min: 25, max: 35 } },
    { emoji: '😭', count: 3, size: { min: 35, max: 45 } },
  ],
  physics: 'saltPour',
  duration: 'continuous',
};
