import { EffectConfig } from '../../../types';

export const chefsKissEffect: EffectConfig = {
  id: 'chefs_kiss',
  name: "Chef's Kiss",
  tier: 0,
  category: 'wildcards',
  particles: [
    { emoji: '👨‍🍳', count: 1, size: { min: 60, max: 60 } },
    { emoji: '💋', count: 5, size: { min: 25, max: 35 } },
    { emoji: '✨', count: 10, size: { min: 15, max: 20 } },
  ],
  physics: 'kissMotion',
  duration: 1500,
};
