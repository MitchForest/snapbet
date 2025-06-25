import { EffectConfig } from '../../../types';

export const bussinEffect: EffectConfig = {
  id: 'bussin',
  name: 'Bussin FR',
  tier: 0,
  category: 'vibes',
  particles: [
    { emoji: '🔥', count: 10, size: { min: 30, max: 40 } },
    { emoji: '💯', count: 5, size: { min: 40, max: 50 } },
    { emoji: '🚀', count: 3, size: { min: 35, max: 45 } },
  ],
  physics: 'explodeOut',
  duration: 2000,
};
