import { EffectConfig } from '../../../types';

export const buzzerBeaterEffect: EffectConfig = {
  id: 'buzzer_beater',
  name: 'Buzzer Beater',
  tier: 1,
  category: 'betting',
  particles: [
    { emoji: '⏰', count: 1, size: { min: 70, max: 70 } },
    { emoji: '💥', count: 12, size: { min: 30, max: 50 } },
    { emoji: '🎯', count: 1, size: { min: 60, max: 60 } },
  ],
  physics: 'lastSecond',
  duration: 3000,
  unlockRequirement: {
    type: 'badge',
    value: 'any',
  },
};
