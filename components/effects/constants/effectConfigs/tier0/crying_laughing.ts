import { EffectConfig } from '../../../types';

export const cryingLaughingEffect: EffectConfig = {
  id: 'crying_laughing',
  name: "Can't Stop Laughing",
  tier: 0,
  category: 'vibes',
  particles: [{ emoji: '😂', count: 20, size: { min: 25, max: 40 } }],
  physics: 'bounce',
  duration: 'continuous',
};
