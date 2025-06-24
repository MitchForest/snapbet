import { Effect } from '@/types/effects';

// Map badge IDs to their required effects
// Using underscore format to match existing badge system
export const BADGE_EFFECT_REQUIREMENTS: Record<string, string[]> = {
  hot_streak: ['mega_fire'],
  profit_leader: ['money_rain'],
  sharp: ['laser_focus'],
  perfect_day: ['diamond_shower'],
};

// Helper function to check if a user has the required badge for an effect
export function hasRequiredBadge(effect: Effect, userBadges: string[]): boolean {
  if (!effect.requirement || effect.tier === 0) {
    return true; // No requirement or base tier effect
  }

  if (effect.requirement.type === 'badge') {
    // Check if user has at least one of the required badges
    return effect.requirement.badges.some((badge) => userBadges.includes(badge));
  }

  if (effect.requirement.type === 'multiple_badges') {
    // Check if user has all required badges
    return effect.requirement.badges.every((badge) => userBadges.includes(badge));
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
