import { EffectConfig } from '../../../types';

export const rizzEffect: EffectConfig = {
  id: 'rizz',
  name: 'W Rizz',
  tier: 2,
  category: 'vibes',
  particles: [
    { emoji: '😏', count: 5, size: { min: 50, max: 70 } },
    { emoji: '💫', count: 15, size: { min: 20, max: 35 } },
    { emoji: '🌹', count: 10, size: { min: 30, max: 45 } },
  ],
  physics: 'smoothCharm',
  duration: 3000,
  unlockRequirement: {
    type: 'badge',
    value: 'charm',
  },
};
