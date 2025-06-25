import { EffectConfig } from '../../../types';

export const vibingEffect: EffectConfig = {
  id: 'vibing',
  name: 'Vibing',
  tier: 0,
  category: 'vibes',
  particles: [
    { emoji: '😌', count: 5, size: { min: 35, max: 45 } },
    { emoji: '✨', count: 15, size: { min: 15, max: 25 } },
    { emoji: '🎵', count: 10, size: { min: 20, max: 30 } },
  ],
  physics: 'gentleFloat',
  duration: 'continuous',
};
