import { EffectConfig } from '../../../types';

export const thisYouEffect: EffectConfig = {
  id: 'this_you',
  name: 'This You?',
  tier: 0,
  category: 'wildcards',
  particles: [
    { emoji: '🤔', count: 1, size: { min: 60, max: 60 } },
    { emoji: '📸', count: 1, size: { min: 50, max: 50 } },
  ],
  physics: 'cameraFlash',
  duration: 1000,
};
