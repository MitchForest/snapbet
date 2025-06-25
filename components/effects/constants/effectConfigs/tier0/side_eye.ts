import { EffectConfig } from '../../../types';

export const sideEyeEffect: EffectConfig = {
  id: 'side_eye',
  name: 'Side Eye',
  tier: 0,
  category: 'wildcards',
  particles: [{ emoji: '👀', count: 20, size: { min: 25, max: 40 } }],
  physics: 'slideInLook',
  duration: 'continuous',
};
