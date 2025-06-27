export interface WeeklyBadge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  calculation: string; // Description of how it's calculated
  priority: number; // Higher = more exclusive
}

export const WEEKLY_BADGES: Record<string, WeeklyBadge> = {
  HOT_STREAK: {
    id: 'hot_streak',
    emoji: '🔥',
    name: 'Hot Streak',
    description: '3+ wins in a row',
    calculation: 'current_streak >= 3',
    priority: 7,
  },
  PROFIT_MACHINE: {
    id: 'profit_machine',
    emoji: '💰',
    name: 'Profit Machine',
    description: '$100+ profit this week',
    calculation: 'weekly_profit >= 100',
    priority: 8,
  },
  SHARP_SHOOTER: {
    id: 'sharp_shooter',
    emoji: '🎯',
    name: 'Sharp Shooter',
    description: '70%+ win rate (min 5 bets)',
    calculation: 'win_rate >= 0.7 AND total_bets >= 5',
    priority: 9,
  },
  HIGH_ROLLER: {
    id: 'high_roller',
    emoji: '💎',
    name: 'High Roller',
    description: '$500+ wagered this week',
    calculation: 'total_wagered >= 500',
    priority: 6,
  },
  COMEBACK_KID: {
    id: 'comeback_kid',
    emoji: '🔄',
    name: 'Comeback Kid',
    description: 'Positive after being down',
    calculation: 'profit > 0 AND losses > 0',
    priority: 5,
  },
  PERFECT_SUNDAY: {
    id: 'perfect_sunday',
    emoji: '🏆',
    name: 'Perfect Sunday',
    description: 'Perfect NFL Sunday',
    calculation: 'perfect_nfl_sunday',
    priority: 10,
  },
  SOCIAL_BUTTERFLY: {
    id: 'social_butterfly',
    emoji: '🦋',
    name: 'Social Butterfly',
    description: '5+ picks posted this week',
    calculation: 'picks_posted >= 5',
    priority: 4,
  },
  INFLUENCER: {
    id: 'influencer',
    emoji: '⭐',
    name: 'Influencer',
    description: 'Generated profit for others',
    calculation: 'tail_profit_generated > 0 OR fade_profit_generated > 0',
    priority: 7,
  },
  HOT_RIGHT_NOW: {
    id: 'hot_right_now',
    emoji: '🔥',
    name: 'Hot Right Now',
    description: 'Won last 3+ picks this week',
    calculation: 'current_week_streak >= 3',
    priority: 7,
  },
  WEEKS_PROFIT_KING: {
    id: 'weeks_profit_king',
    emoji: '💰',
    name: "Week's Profit King",
    description: 'Up the most this week',
    calculation: 'highest_weekly_profit',
    priority: 9,
  },
  RIDING_THE_WAVE: {
    id: 'riding_the_wave',
    emoji: '🌊',
    name: 'Riding the Wave',
    description: 'Others profiting from your picks this week',
    calculation: 'tail_profit_generated > 0',
    priority: 6,
  },
  THIS_WEEKS_SHARP: {
    id: 'this_weeks_sharp',
    emoji: '🎯',
    name: "This Week's Sharp",
    description: '70%+ win rate (min 5 bets)',
    calculation: 'weekly_win_rate >= 0.7 AND weekly_bet_count >= 5',
    priority: 8,
  },
  FADE_GOD: {
    id: 'fade_god',
    emoji: '🎪',
    name: 'Fade God',
    description: 'People made money fading you this week',
    calculation: 'fade_profit_generated > 0',
    priority: 3,
  },
  MOST_ACTIVE: {
    id: 'most_active',
    emoji: '⚡',
    name: 'Most Active',
    description: 'Posted 10+ picks this week',
    calculation: 'weekly_pick_count >= 10',
    priority: 4,
  },
  GHOST: {
    id: 'ghost',
    emoji: '👻',
    name: 'Ghost',
    description: "Haven't posted in 3+ days",
    calculation: 'days_since_last_post >= 3',
    priority: 1,
  },
  SUNDAY_SWEEP: {
    id: 'sunday_sweep',
    emoji: '🏆',
    name: 'Sunday Sweep',
    description: 'Perfect NFL Sunday',
    calculation: 'perfect_nfl_sunday',
    priority: 10,
  },
};

// Helper functions
export const getWeeklyBadgeById = (id: string): WeeklyBadge | undefined => {
  return WEEKLY_BADGES[id.toUpperCase()];
};

export const sortWeeklyBadgesByPriority = (badges: WeeklyBadge[]): WeeklyBadge[] => {
  return [...badges].sort((a, b) => b.priority - a.priority);
};

export const getHighestPriorityWeeklyBadge = (badgeIds: string[]): WeeklyBadge | undefined => {
  const badges = badgeIds
    .map((id) => getWeeklyBadgeById(id))
    .filter((badge): badge is WeeklyBadge => badge !== undefined);

  if (badges.length === 0) return undefined;

  return badges.reduce((highest, current) =>
    current.priority > highest.priority ? current : highest
  );
};

// Get badge expiration info
export const getBadgeExpirationInfo = (
  earnedDate: Date
): {
  expiresAt: Date;
  daysRemaining: number;
  hoursRemaining: number;
} => {
  const weekStart = new Date(earnedDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Get Monday
  weekStart.setHours(0, 0, 0, 0);

  const expiresAt = new Date(weekStart);
  expiresAt.setDate(expiresAt.getDate() + 7); // Next Monday

  const now = new Date();
  const msRemaining = expiresAt.getTime() - now.getTime();
  const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
  const daysRemaining = Math.floor(hoursRemaining / 24);

  return {
    expiresAt,
    daysRemaining,
    hoursRemaining,
  };
};
