import { EffectConfig } from '../../../types';

export const betSlipDropEffect: EffectConfig = {
  id: 'bet_slip_drop',
  name: 'Bet Slip Drop',
  tier: 0,
  category: 'betting',
  particles: [
    { emoji: '📋', count: 1, size: { min: 60, max: 60 } },
    { emoji: '💵', count: 20, size: { min: 25, max: 35 } },
  ],
  physics: 'formAmount',
  duration: 2000,
};
