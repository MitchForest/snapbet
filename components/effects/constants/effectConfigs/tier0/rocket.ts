import { EffectConfig } from '../../../types';

export const rocketEffect: EffectConfig = {
  id: 'rocket',
  name: 'To The Moon',
  tier: 0,
  category: 'hype',
  particles: [
    { emoji: '🚀', count: 1, size: { min: 50, max: 50 } },
    { emoji: '⭐', count: 10, size: { min: 15, max: 25 } },
    { emoji: '🌙', count: 1, size: { min: 60, max: 60 } },
  ],
  physics: 'launch',
  duration: 3000,
};
