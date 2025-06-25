import { EffectConfig } from '../../../types';

export const sparkleEffect: EffectConfig = {
  id: 'sparkle',
  name: 'Sparkle',
  tier: 0,
  category: 'wildcards',
  particles: [{ emoji: '✨', count: 30, size: { min: 15, max: 35 } }],
  physics: 'twinkle',
  duration: 'continuous',
};
