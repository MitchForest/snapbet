import { EffectConfig } from '../../../types';

export const toTheMoonEffect: EffectConfig = {
  id: 'to_the_moon',
  name: 'To The Moon',
  tier: 0,
  category: 'betting',
  particles: [
    { emoji: '🚀', count: 1, size: { min: 60, max: 60 } },
    { emoji: '🌙', count: 1, size: { min: 80, max: 80 } },
    { emoji: '⭐', count: 15, size: { min: 15, max: 25 } },
    { emoji: '💰', count: 10, size: { min: 20, max: 30 } },
  ],
  physics: 'moonLaunch',
  duration: 3000,
};
