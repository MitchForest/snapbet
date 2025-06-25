import { EffectConfig } from '../../../types';

export const diceRollEffect: EffectConfig = {
  id: 'dice_roll',
  name: 'Rolling Dice',
  tier: 1,
  category: 'wildcards',
  particles: [{ emoji: '🎲', count: 2, size: { min: 50, max: 60 } }],
  physics: 'diceRoll',
  duration: 2000,
  unlockRequirement: {
    type: 'badge',
    value: 'any',
  },
};
