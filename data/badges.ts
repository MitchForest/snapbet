// Re-export weekly badges as the main badge system
export {
  WEEKLY_BADGES as BADGES,
  getWeeklyBadgeById as getBadgeById,
  sortWeeklyBadgesByPriority as sortBadgesByPriority,
  getHighestPriorityWeeklyBadge as getHighestPriorityBadge,
  getBadgeExpirationInfo,
  type WeeklyBadge as Badge,
} from './weeklyBadges';

import { WEEKLY_BADGES, type WeeklyBadge as Badge } from './weeklyBadges';

// Keep category for backward compatibility but all weekly badges are 'performance'
export const getBadgesByCategory = (category: 'performance' | 'social' | 'special'): Badge[] => {
  // All weekly badges are performance-based
  if (category === 'performance') {
    return Object.values(WEEKLY_BADGES);
  }
  return [];
};
