import { EffectConfig } from '../../../types';

export const sheeshEffect: EffectConfig = {
  id: 'sheesh',
  name: 'SHEEEESH',
  tier: 1,
  category: 'vibes',
  particles: [
    { emoji: '🥶', count: 5, size: { min: 40, max: 50 } },
    { emoji: '❄️', count: 20, size: { min: 20, max: 30 } },
    { emoji: '💨', count: 10, size: { min: 30, max: 40 } },
  ],
  physics: 'freezeWind',
  duration: 2000,
  unlockRequirement: {
    type: 'badge',
    value: 'any',
  },
};
