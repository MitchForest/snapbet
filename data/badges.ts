export interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  category: 'performance' | 'social' | 'special';
  priority: number; // Higher = more exclusive
}

export const BADGES: Record<string, Badge> = {
  HOT_STREAK: {
    id: 'hot_streak',
    emoji: '🔥',
    name: 'Hot Streak',
    description: '3+ wins in a row',
    category: 'performance',
    priority: 3,
  },
  PROFIT_LEADER: {
    id: 'profit_leader',
    emoji: '💰',
    name: 'Profit Leader',
    description: '+$500 or more profit',
    category: 'performance',
    priority: 5,
  },
  HIGH_ROI: {
    id: 'high_roi',
    emoji: '📈',
    name: 'High ROI',
    description: '20%+ ROI with 20+ bets',
    category: 'performance',
    priority: 6,
  },
  SHARP: {
    id: 'sharp',
    emoji: '🎯',
    name: 'Sharp',
    description: '60%+ win rate with 20+ bets',
    category: 'performance',
    priority: 7,
  },
  FADE_MATERIAL: {
    id: 'fade_material',
    emoji: '🎪',
    name: 'Fade Material',
    description: 'Others profit by fading you',
    category: 'special',
    priority: 2,
  },
  INFLUENCER: {
    id: 'influencer',
    emoji: '👑',
    name: 'Influencer',
    description: '50+ followers',
    category: 'social',
    priority: 4,
  },
  PERFECT_DAY: {
    id: 'perfect_day',
    emoji: '💎',
    name: 'Perfect Day',
    description: '5-0 or better in one day',
    category: 'performance',
    priority: 8,
  },
  TEAM_LOYALIST: {
    id: 'team_loyalist',
    emoji: '🏆',
    name: 'Team Loyalist',
    description: '20+ bets on favorite team',
    category: 'special',
    priority: 1,
  },
};

// Helper functions
export const getBadgeById = (id: string): Badge | undefined => {
  return BADGES[id.toUpperCase()];
};

export const getBadgesByCategory = (category: Badge['category']): Badge[] => {
  return Object.values(BADGES).filter((badge) => badge.category === category);
};

export const sortBadgesByPriority = (badges: Badge[]): Badge[] => {
  return [...badges].sort((a, b) => b.priority - a.priority);
};

export const getHighestPriorityBadge = (badgeIds: string[]): Badge | undefined => {
  const badges = badgeIds
    .map((id) => getBadgeById(id))
    .filter((badge): badge is Badge => badge !== undefined);

  if (badges.length === 0) return undefined;

  return badges.reduce((highest, current) =>
    current.priority > highest.priority ? current : highest
  );
};
