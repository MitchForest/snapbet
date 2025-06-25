import { EffectConfig } from '../../../types';

export const boostedEffect: EffectConfig = {
  id: 'boosted',
  name: 'Boosted',
  tier: 0,
  category: 'betting',
  particles: [
    { emoji: '⚡', count: 5, size: { min: 30, max: 40 } },
    { emoji: '📈', count: 1, size: { min: 60, max: 60 } },
    { emoji: '🔥', count: 8, size: { min: 20, max: 30 } },
  ],
  physics: 'lightningStrike',
  duration: 1500,
};
