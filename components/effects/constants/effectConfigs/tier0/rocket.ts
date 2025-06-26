import { EffectConfig } from '../../../types';

export const rocketEffect: EffectConfig = {
  id: 'rocket',
  name: 'To The Moon',
  tier: 0,
  category: 'hype',
  particles: [
    { emoji: '🚀', count: 3, size: { min: 40, max: 60 } }, // Multiple rockets
    { emoji: '⭐', count: 15, size: { min: 10, max: 25 } },
    { emoji: '💫', count: 8, size: { min: 15, max: 30 } }, // Add shooting stars
    { emoji: '🌙', count: 1, size: { min: 60, max: 60 } },
    { emoji: '💨', count: 10, size: { min: 20, max: 35 } }, // Smoke trail
  ],
  physics: 'launch',
  duration: 3000,
};
