import { useState, useCallback, useMemo } from 'react';
import { ALL_EFFECTS, getEffectById } from '@/components/effects/constants/allEffects';
import { EmojiEffect, EffectCategory, EffectWithUnlockStatus } from '@/types/effects';
import { hasRequiredBadge } from '@/utils/effects/badgeRequirements';

export function useEffects(userBadges: string[]) {
  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null);

  // Check if a specific effect is unlocked
  const isEffectUnlocked = useCallback(
    (effect: EmojiEffect): boolean => {
      return hasRequiredBadge(effect, userBadges);
    },
    [userBadges]
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
  };
}
