import { EffectConfig } from '../../../types';

export const goodVibesEffect: EffectConfig = {
  id: 'good_vibes',
  name: 'Good Vibes',
  tier: 0,
  category: 'wildcards',
  particles: [
    { emoji: '🌈', count: 1, size: { min: 120, max: 120 } },
    { emoji: '☁️', count: 6, size: { min: 30, max: 50 } },
    { emoji: '✨', count: 15, size: { min: 15, max: 25 } },
  ],
  physics: 'rainbowArc',
  duration: 'continuous',
};
