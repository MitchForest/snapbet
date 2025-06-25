import { EffectConfig } from '../../../types';

export const tooCoolEffect: EffectConfig = {
  id: 'too_cool',
  name: 'Too Cool',
  tier: 0,
  category: 'wins',
  particles: [{ emoji: '😎', count: 1, size: { min: 80, max: 80 } }],
  physics: 'slideDown',
  duration: 1500,
};
