import { EffectConfig } from '../../../types';

export const mindBlownEffect: EffectConfig = {
  id: 'mind_blown',
  name: 'Mind Blown',
  tier: 0,
  category: 'losses',
  particles: [
    { emoji: '🤯', count: 1, size: { min: 80, max: 80 } },
    { emoji: '💥', count: 8, size: { min: 30, max: 50 } },
  ],
  physics: 'headExplode',
  duration: 2000,
};
