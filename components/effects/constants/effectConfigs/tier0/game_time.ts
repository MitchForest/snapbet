import { EffectConfig } from '../../../types';

export const gameTimeEffect: EffectConfig = {
  id: 'game_time',
  name: 'Game Time',
  tier: 0,
  category: 'hype',
  particles: [
    { emoji: '🏀', count: 5, size: { min: 35, max: 45 } },
    { emoji: '🏈', count: 5, size: { min: 35, max: 45 } },
    { emoji: '⚾', count: 5, size: { min: 35, max: 45 } },
  ],
  physics: 'sportsBounce',
  duration: 'continuous',
};
