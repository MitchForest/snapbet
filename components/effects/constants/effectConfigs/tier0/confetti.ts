import { EffectConfig } from '../../../types';

export const confettiEffect: EffectConfig = {
  id: 'confetti',
  name: 'Winner!',
  tier: 0,
  category: 'wins',
  particles: [
    { emoji: '🎉', count: 10 },
    { emoji: '🎊', count: 10 },
    { emoji: '🎈', count: 5 },
  ],
  physics: 'explode',
  duration: 2000,
};
