import { useState, useCallback, useMemo } from 'react';
import { ALL_EFFECTS, getEffectById } from '@/components/effects/constants/allEffects';
import { EmojiEffect, EffectCategory, EffectWithUnlockStatus } from '@/types/effects';
import { useAuthStore } from '@/stores/authStore';

export function useEffects() {
  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null);
  const weeklyBadgeCount = useAuthStore((state) => state.weeklyBadgeCount);

  // Check if a specific effect is unlocked based on badge count
  const isEffectUnlocked = useCallback(
    (effect: EmojiEffect): boolean => {
      // Tier 0 effects are always unlocked
      if (effect.tier === 0) {
        return true;
      }

      // Tier 1 effects require at least 1 badge
      if (effect.tier === 1) {
        return weeklyBadgeCount >= 1;
      }

      // Tier 2 effects require at least 3 badges
      if (effect.tier === 2) {
        return weeklyBadgeCount >= 3;
      }

      return false;
    },
    [weeklyBadgeCount]
  );

  // Get all effects with their unlock status for a category
  const getAvailableEffects = useCallback(
    (category: EffectCategory | 'all'): EffectWithUnlockStatus[] => {
      let effects = ALL_EFFECTS;

      if (category !== 'all') {
        effects = effects.filter((e) => e.category === category);
      }

      return effects.map((effect) => ({
        ...effect,
        isUnlocked: isEffectUnlocked(effect),
      }));
    },
    [isEffectUnlocked]
  );

  // Get the currently selected effect
  const selectedEffect = useMemo(
    () => (selectedEffectId ? getEffectById(selectedEffectId) : null),
    [selectedEffectId]
  );

  // Clear the selected effect
  const clearEffect = useCallback(() => {
    setSelectedEffectId(null);
  }, []);

  // Get count of unlocked effects
  const unlockedEffectCount = useMemo(() => {
    return ALL_EFFECTS.filter((effect) => isEffectUnlocked(effect)).length;
  }, [isEffectUnlocked]);

  return {
    selectedEffect,
    selectedEffectId,
    setSelectedEffectId,
    clearEffect,
    isEffectUnlocked,
    getAvailableEffects,
    unlockedEffectCount,
    weeklyBadgeCount,
  };
}
