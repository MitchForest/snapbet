import { EffectConfig } from '../../../types';

export const susEffect: EffectConfig = {
  id: 'sus',
  name: "That's Sus",
  tier: 0,
  category: 'vibes',
  particles: [
    { emoji: '🤨', count: 8, size: { min: 30, max: 40 } },
    { emoji: '👀', count: 12, size: { min: 25, max: 35 } },
  ],
  physics: 'lookAround',
  duration: 'continuous',
};
