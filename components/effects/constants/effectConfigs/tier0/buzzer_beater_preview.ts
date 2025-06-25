import { EffectConfig } from '../../../types';

export const buzzerBeaterPreviewEffect: EffectConfig = {
  id: 'buzzer_beater_preview',
  name: 'Buzzer Beater (Preview)',
  tier: 0,
  category: 'betting',
  particles: [
    { emoji: '⏰', count: 1, size: { min: 60, max: 60 } },
    { emoji: '💥', count: 8, size: { min: 30, max: 45 } },
    { emoji: '🎯', count: 1, size: { min: 50, max: 50 } },
  ],
  physics: 'clockCountdown',
  duration: 5000, // Preview
};
