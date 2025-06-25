import { EffectConfig } from '../../../types';

export const slotMachineEffect: EffectConfig = {
  id: 'slot_machine',
  name: 'Jackpot',
  tier: 2,
  category: 'wildcards',
  particles: [
    { emoji: '🎰', count: 1, size: { min: 100, max: 100 } },
    { emoji: '7️⃣', count: 9, size: { min: 40, max: 50 } },
    { emoji: '🍒', count: 6, size: { min: 35, max: 45 } },
    { emoji: '🍋', count: 6, size: { min: 35, max: 45 } },
  ],
  physics: 'slotSpin',
  duration: 3000,
  unlockRequirement: {
    type: 'badge',
    value: 'gambling_achievement',
  },
};
