import { EffectConfig } from '../../../types';

export const rageQuitEffect: EffectConfig = {
  id: 'rage_quit',
  name: 'Rage Quit',
  tier: 0,
  category: 'hype',
  particles: [
    { emoji: '😤', count: 1, size: { min: 60, max: 60 } },
    { emoji: '💢', count: 5, size: { min: 25, max: 35 } },
    { emoji: '🎮', count: 2, size: { min: 40, max: 40 } },
    { emoji: '💥', count: 3, size: { min: 30, max: 45 } },
  ],
  physics: 'angerBurst',
  duration: 2000,
};
