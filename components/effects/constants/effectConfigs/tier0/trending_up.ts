import { EffectConfig } from '../../../types';

export const trendingUpEffect: EffectConfig = {
  id: 'trending_up',
  name: 'Trending Up',
  tier: 0,
  category: 'wins',
  particles: [
    { emoji: '📈', count: 3, size: { min: 50, max: 70 } },
    { emoji: '💹', count: 2, size: { min: 40, max: 60 } },
    { emoji: '⬆️', count: 5, size: { min: 25, max: 35 } },
  ],
  physics: 'riseUp',
  duration: 2000,
};
