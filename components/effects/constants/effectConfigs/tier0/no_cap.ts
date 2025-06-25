import { EffectConfig } from '../../../types';

export const noCapEffect: EffectConfig = {
  id: 'no_cap',
  name: 'No Cap',
  tier: 0,
  category: 'vibes',
  particles: [{ emoji: '🧢', count: 15, size: { min: 30, max: 45 } }],
  physics: 'spinAway',
  duration: 2000,
};
