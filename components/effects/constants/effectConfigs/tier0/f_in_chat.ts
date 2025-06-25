import { EffectConfig } from '../../../types';

export const fInChatEffect: EffectConfig = {
  id: 'f_in_chat',
  name: 'F',
  tier: 0,
  category: 'hype',
  particles: [{ emoji: '😔', count: 30, size: { min: 20, max: 30 } }],
  physics: 'formF',
  duration: 2000,
};
