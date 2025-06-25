import { EmojiEffect } from '@/types/effects';

// Map badge IDs to their required effects
// Using underscore format to match existing badge system
export const BADGE_EFFECT_REQUIREMENTS: Record<string, string[]> = {
  hot_streak: ['mega_fire'],
  profit_leader: ['money_rain'],
  sharp: ['laser_focus'],
  perfect_day: ['diamond_shower'],
};

// Helper function to check if a user has the required badge for an effect
export function hasRequiredBadge(effect: EmojiEffect, userBadges: string[]): boolean {
  // Tier 0 effects are always unlocked
  if (effect.tier === 0) {
    return true;
  }

  // Tier 1 effects require any badge
  if (effect.tier === 1) {
    return userBadges.length > 0;
  }

  // Tier 2 effects require specific badges
  if (effect.tier === 2 && effect.requirement) {
    if (effect.requirement.type === 'badge') {
      // Check if user has at least one of the required badges
      return effect.requirement.badges.some((badge) => userBadges.includes(badge));
    }

    if (effect.requirement.type === 'multiple_badges') {
      // Check if user has all required badges
      return effect.requirement.badges.every((badge) => userBadges.includes(badge));
    }
  }

  return false;
}

// Get all effects unlocked by a specific badge
export function getEffectsUnlockedByBadge(badgeId: string): string[] {
  return BADGE_EFFECT_REQUIREMENTS[badgeId] || [];
}

// Get all badge-locked effect IDs
export function getBadgeLockedEffectIds(): string[] {
  return Object.values(BADGE_EFFECT_REQUIREMENTS).flat();
}
