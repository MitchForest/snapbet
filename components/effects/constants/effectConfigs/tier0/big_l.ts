import { EffectConfig } from '../../../types';

export const bigLEffect: EffectConfig = {
  id: 'big_l',
  name: 'Big L',
  tier: 0,
  category: 'vibes',
  particles: [{ emoji: '😢', count: 20, size: { min: 20, max: 35 } }],
  physics: 'formLetter',
  duration: 2000,
};
