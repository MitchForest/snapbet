import { EffectConfig } from '../../../types';

export const flexEffect: EffectConfig = {
  id: 'flex',
  name: 'Flex',
  tier: 0,
  category: 'wins',
  particles: [{ emoji: '💪', count: 2, size: { min: 60, max: 70 } }],
  physics: 'flexPump',
  duration: 'continuous',
};
