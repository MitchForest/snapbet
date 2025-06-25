import * as tier0Effects from './effectConfigs/tier0';
import * as tier1Effects from './effectConfigs/tier1';
import * as tier2Effects from './effectConfigs/tier2';
import { EmojiEffect } from '@/types/effects';
import { EffectConfig } from '../types';

// Convert the effect configs to EmojiEffect format
const convertToEmojiEffect = (effect: EffectConfig): EmojiEffect => {
  // Extract the first particle's emoji as the main emoji
  const mainEmoji = effect.particles?.[0]?.emoji || '✨';
  const particleCount = effect.particles?.[0]?.count || 20;

  return {
    id: effect.id,
    name: effect.name,
    category: effect.category.toUpperCase() as EmojiEffect['category'],
    tier: effect.tier as 0 | 1 | 2,
    physics: effect.physics,
    emoji: mainEmoji,
    count: particleCount,
    duration: typeof effect.duration === 'number' ? effect.duration : 5000,
    preview: mainEmoji,
    requirement: effect.unlockRequirement
      ? {
          type: effect.unlockRequirement.type as 'badge' | 'multiple_badges',
          badges: [effect.unlockRequirement.value],
        }
      : undefined,
  };
};

// Collect all effects from the modules
const allEffectConfigs = [
  ...Object.values(tier0Effects),
  ...Object.values(tier1Effects),
  ...Object.values(tier2Effects),
];

// Convert and export as array
export const ALL_EFFECTS: EmojiEffect[] = allEffectConfigs.map(convertToEmojiEffect);

// Helper to get effect by ID
export const getEffectById = (id: string): EmojiEffect | null => {
  return ALL_EFFECTS.find((effect) => effect.id === id) || null;
};
