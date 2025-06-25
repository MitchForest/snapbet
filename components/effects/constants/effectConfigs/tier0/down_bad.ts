import { EffectConfig } from '../../../types';

export const downBadEffect: EffectConfig = {
  id: 'down_bad',
  name: 'Down Bad',
  tier: 0,
  category: 'betting',
  particles: [
    { emoji: '📉', count: 1, size: { min: 70, max: 70 } },
    { emoji: '😩', count: 1, size: { min: 60, max: 60 } },
    { emoji: '💸', count: 15, size: { min: 20, max: 30 } },
  ],
  physics: 'spiralDown',
  duration: 2000,
};
