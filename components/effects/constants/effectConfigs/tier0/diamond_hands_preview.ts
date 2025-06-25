import { EffectConfig } from '../../../types';

export const diamondHandsPreviewEffect: EffectConfig = {
  id: 'diamond_hands_preview',
  name: 'Diamond Hands (Preview)',
  tier: 0,
  category: 'wildcards',
  particles: [
    { emoji: '💎', count: 10, size: { min: 30, max: 40 } },
    { emoji: '🙌', count: 2, size: { min: 50, max: 50 } },
  ],
  physics: 'holdStrong',
  duration: 5000, // Preview lasts 5 seconds
};
