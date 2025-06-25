import { EffectConfig } from '../../../types';

export const bigWEffect: EffectConfig = {
  id: 'big_w',
  name: 'Big W',
  tier: 0,
  category: 'vibes',
  particles: [{ emoji: '🏆', count: 25, size: { min: 20, max: 35 } }],
  physics: 'formLetter',
  duration: 2000,
};
