import { EffectConfig } from '../../../types';

export const toxicEffect: EffectConfig = {
  id: 'toxic',
  name: 'Toxic Trait',
  tier: 2,
  category: 'hype',
  particles: [
    { emoji: '☠️', count: 10, size: { min: 30, max: 50 } },
    { emoji: '💚', count: 15, size: { min: 25, max: 40 } },
    { emoji: '🧪', count: 8, size: { min: 35, max: 55 } },
  ],
  physics: 'toxicBubble',
  duration: 'continuous',
  unlockRequirement: {
    type: 'badge',
    value: 'controversial',
  },
};
