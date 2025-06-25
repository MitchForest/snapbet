import { EffectConfig } from '../../../types';

export const diamondHandsEffect: EffectConfig = {
  id: 'diamond_hands',
  name: 'Diamond Hands',
  tier: 1,
  category: 'betting',
  particles: [
    { emoji: '💎', count: 20, size: { min: 25, max: 40 } },
    { emoji: '🙌', count: 2, size: { min: 60, max: 60 } },
  ],
  physics: 'diamondHold',
  duration: 'continuous',
  unlockRequirement: {
    type: 'badge',
    value: 'any',
  },
};
