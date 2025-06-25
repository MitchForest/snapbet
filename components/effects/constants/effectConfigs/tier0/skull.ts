import { EffectConfig } from '../../../types';

export const skullEffect: EffectConfig = {
  id: 'skull',
  name: "I'm Dead 💀",
  tier: 0,
  category: 'vibes',
  particles: [{ emoji: '💀', count: 20, size: { min: 25, max: 35 } }],
  physics: 'floatUp',
  duration: 'continuous',
};
