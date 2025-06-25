import { EffectConfig } from '../../../types';

export const stormEffect: EffectConfig = {
  id: 'storm',
  name: 'Storm Coming',
  tier: 1,
  category: 'wildcards',
  particles: [
    { emoji: '⛈️', count: 3, size: { min: 60, max: 80 } },
    { emoji: '⚡', count: 8, size: { min: 30, max: 40 } },
    { emoji: '🌧️', count: 30, size: { min: 15, max: 20 } },
  ],
  physics: 'stormSystem',
  duration: 'continuous',
  unlockRequirement: {
    type: 'badge',
    value: 'any',
  },
};
