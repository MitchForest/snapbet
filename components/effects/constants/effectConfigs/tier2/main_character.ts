import { EffectConfig } from '../../../types';

export const mainCharacterEffect: EffectConfig = {
  id: 'main_character',
  name: 'Main Character',
  tier: 2,
  category: 'vibes',
  particles: [
    { emoji: '🌟', count: 1, size: { min: 100, max: 100 } },
    { emoji: '🎬', count: 4, size: { min: 50, max: 60 } },
    { emoji: '✨', count: 20, size: { min: 15, max: 30 } },
  ],
  physics: 'spotlight',
  duration: 'continuous',
  unlockRequirement: {
    type: 'badge',
    value: 'star_player',
  },
};
