import { EffectConfig } from '../../../types';

export const bagAlertPreviewEffect: EffectConfig = {
  id: 'bag_alert_preview',
  name: 'Bag Alert (Preview)',
  tier: 0,
  category: 'betting',
  particles: [
    { emoji: '💼', count: 1, size: { min: 70, max: 70 } },
    { emoji: '🚨', count: 4, size: { min: 30, max: 40 } },
    { emoji: '💰', count: 15, size: { min: 25, max: 35 } },
  ],
  physics: 'alertOpen',
  duration: 5000, // Preview
};
