import { EffectConfig } from '../../../types';

export const poggersEffect: EffectConfig = {
  id: 'poggers',
  name: 'POGGERS',
  tier: 0,
  category: 'hype',
  particles: [
    { emoji: '😮', count: 15, size: { min: 25, max: 45 } },
    { emoji: '🎉', count: 5, size: { min: 20, max: 30 } },
  ],
  physics: 'popIn',
  duration: 1500,
};
