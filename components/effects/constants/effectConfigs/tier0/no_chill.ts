import { EffectConfig } from '../../../types';

export const noChillEffect: EffectConfig = {
  id: 'no_chill',
  name: 'No Chill',
  tier: 0,
  category: 'hype',
  particles: [
    { emoji: '🥵', count: 5, size: { min: 40, max: 50 } },
    { emoji: '🔥', count: 10, size: { min: 20, max: 30 } },
    { emoji: '💦', count: 10, size: { min: 15, max: 25 } },
  ],
  physics: 'temperatureFlux',
  duration: 'continuous',
};
