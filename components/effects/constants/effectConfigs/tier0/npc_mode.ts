import { EffectConfig } from '../../../types';

export const npcModeEffect: EffectConfig = {
  id: 'npc_mode',
  name: 'NPC Mode',
  tier: 0,
  category: 'wildcards',
  particles: [{ emoji: '🤖', count: 15, size: { min: 30, max: 40 } }],
  physics: 'roboticMarch',
  duration: 'continuous',
};
