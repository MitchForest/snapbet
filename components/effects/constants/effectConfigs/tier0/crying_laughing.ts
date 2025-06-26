import { EffectConfig } from '../../../types';

export const cryingLaughingEffect: EffectConfig = {
  id: 'crying_laughing',
  name: "Can't Stop Laughing",
  tier: 0,
  category: 'vibes',
  particles: [
    { emoji: '😂', count: 12, size: { min: 30, max: 50 } },
    { emoji: '🤣', count: 8, size: { min: 25, max: 40 } }, // Add rolling laughing
    { emoji: '💧', count: 10, size: { min: 10, max: 20 } }, // Tears flying off
  ],
  physics: 'bounce',
  duration: 'continuous',
};
