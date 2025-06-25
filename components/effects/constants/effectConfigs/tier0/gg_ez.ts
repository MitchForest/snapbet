import { EffectConfig } from '../../../types';

export const ggEzEffect: EffectConfig = {
  id: 'gg_ez',
  name: 'GG EZ',
  tier: 0,
  category: 'hype',
  particles: [
    { emoji: '🎮', count: 8, size: { min: 30, max: 40 } },
    { emoji: '🏆', count: 5, size: { min: 35, max: 45 } },
  ],
  physics: 'victoryDance',
  duration: 2000,
};
