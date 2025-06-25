import { EffectConfig } from '../../../types';

export const roughPatchEffect: EffectConfig = {
  id: 'rough_patch',
  name: 'Rough Patch',
  tier: 0,
  category: 'losses',
  particles: [
    { emoji: '📉', count: 3, size: { min: 50, max: 70 } },
    { emoji: '💸', count: 10, size: { min: 25, max: 35 } },
    { emoji: '⬇️', count: 5, size: { min: 20, max: 30 } },
  ],
  physics: 'crashDown',
  duration: 2000,
};
