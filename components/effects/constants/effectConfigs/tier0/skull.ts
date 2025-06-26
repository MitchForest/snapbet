import { EffectConfig } from '../../../types';

export const skullEffect: EffectConfig = {
  id: 'skull',
  name: "I'm Dead 💀",
  tier: 0,
  category: 'vibes',
  particles: [
    { emoji: '💀', count: 15, size: { min: 30, max: 45 } },
    { emoji: '👻', count: 5, size: { min: 20, max: 30 } }, // Add ghosts
  ],
  physics: 'floatUp',
  duration: 'continuous',
};
