import { EffectConfig } from '../../../types';

export const caught4kEffect: EffectConfig = {
  id: 'caught_4k',
  name: 'Caught in 4K',
  tier: 1,
  category: 'vibes',
  particles: [
    { emoji: '📸', count: 8, size: { min: 35, max: 45 } },
    { emoji: '📹', count: 4, size: { min: 40, max: 50 } },
    { emoji: '🎬', count: 2, size: { min: 45, max: 55 } },
  ],
  physics: 'cameraFlashes',
  duration: 2000,
  unlockRequirement: {
    type: 'badge',
    value: 'any',
  },
};
