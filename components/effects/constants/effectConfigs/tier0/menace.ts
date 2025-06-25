import { EffectConfig } from '../../../types';

export const menaceEffect: EffectConfig = {
  id: 'menace',
  name: 'Menace to Society',
  tier: 0,
  category: 'hype',
  particles: [
    { emoji: '😈', count: 12, size: { min: 30, max: 40 } },
    { emoji: '🔥', count: 8, size: { min: 20, max: 30 } },
  ],
  physics: 'chaosCircle',
  duration: 'continuous',
};
