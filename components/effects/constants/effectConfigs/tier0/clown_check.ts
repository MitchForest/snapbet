import { EffectConfig } from '../../../types';

export const clownCheckEffect: EffectConfig = {
  id: 'clown_check',
  name: 'Clown Check',
  tier: 0,
  category: 'vibes',
  particles: [
    { emoji: '🤡', count: 1, size: { min: 80, max: 80 } },
    { emoji: '🤡', count: 8, size: { min: 25, max: 35 } },
  ],
  physics: 'zoomDance',
  duration: 2000,
};
