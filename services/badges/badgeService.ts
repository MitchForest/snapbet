// Re-export weekly badge functions as the main badge service
export {
  calculateWeeklyBadges as calculateUserBadges,
  saveWeeklyBadges as saveUserBadges,
  getUserWeeklyBadges as getUserBadges,
  updateUserWeeklyBadges as updateUserBadges,
  getUserBadgeCount,
} from './weeklyBadgeService';
