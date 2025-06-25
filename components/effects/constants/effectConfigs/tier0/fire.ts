import { EffectConfig } from '../../../types';

export const fireEffect: EffectConfig = {
  id: 'fire',
  name: 'On Fire',
  tier: 0,
  category: 'wins',
  particles: [{ emoji: '🔥', count: 15, size: { min: 20, max: 40 } }],
  physics: 'float',
  duration: 'continuous',
};
