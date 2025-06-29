/**
 * Mock Data Configuration
 * Centralized configuration for all mock data generation
 */

export const MOCK_CONFIG = {
  users: {
    count: 50, // Increased from 30 to have more variety
    followsFromMocks: 15,
    userFollowsMocks: 10, // Reduced from 25 to leave more unfollowed users
    personalities: {
      'sharp-steve': {
        usernamePrefix: 'sharp',
        displayName: 'Sharp Steve',
        bio: 'Advanced metrics only. Math > Emotions 📊',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sharp',
      },
      'casual-carl': {
        usernamePrefix: 'casual',
        displayName: 'Casual Carl',
        bio: "Just here for fun! Let's go team! 🎉",
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=casual',
      },
      'square-bob': {
        usernamePrefix: 'square',
        displayName: 'Square Bob',
        bio: 'I always bet the favorites! 🏆',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=square',
      },
      'public-pete': {
        usernamePrefix: 'public',
        displayName: 'Public Pete',
        bio: 'If everyone likes it, I love it! 📺',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=public',
      },
      'degen-dave': {
        usernamePrefix: 'degen',
        displayName: 'Degen Dave',
        bio: 'All gas no brakes! Parlays only 🚀',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=degen',
      },
      'fade-frank': {
        usernamePrefix: 'fade',
        displayName: 'Fade Frank',
        bio: 'Fading the public since 2019 🎯',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fade',
      },
    },
  },

  content: {
    stories: {
      count: 10,
      mediaUrls: {
        thinking: [
          'https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif',
          'https://media.giphy.com/media/xT0GqtpF1NWd9VbstO/giphy.gif',
          'https://media.giphy.com/media/Lopx9eUi34rbq/giphy.gif', // Token thinking
          'https://media.giphy.com/media/29JMqheuymy5mB2eTY/giphy.gif', // Reaction/thinking
          'https://media.giphy.com/media/xSM46ernAUN3y/giphy.gif', // Stoner sees/analyzing
        ],
        celebration: [
          'https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif',
          'https://media.giphy.com/media/l2JehQ2GitHGdVG9y/giphy.gif',
          'https://media.giphy.com/media/i1ET8AoIhL1O65w3aI/giphy.gif', // NFL Ja'Marr Chase celebration
          'https://media.giphy.com/media/xUPGck7rzlAftbFZza/giphy.gif', // NBA Warriors celebration
          'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif', // Thumbs up celebration
        ],
        frustration: [
          'https://media.giphy.com/media/xT0GqI5uUiCa3PufTi/giphy.gif',
          'https://media.giphy.com/media/3o7TKwmnDgQb5jemjK/giphy.gif',
          'https://media.giphy.com/media/12XMGIWtrHBl5e/giphy.gif', // Disappointed
          'https://media.giphy.com/media/p3P8lFeNeemwcPY00B/giphy.gif', // That 70s Show reaction
        ],
        positive: [
          'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
          'https://media.giphy.com/media/3o7TKU8RvQuomFfUUU/giphy.gif',
          'https://media.giphy.com/media/kd9BlRovbPOykLBMqX/giphy.gif', // Leonardo DiCaprio pointing
          'https://media.giphy.com/media/l46CqxtAEdguUgC2I/giphy.gif', // LeBron James photobomb
          'https://media.giphy.com/media/FY8c5SKwiNf1EtZKGs/giphy.gif', // Happy dog
        ],
        wild: [
          'https://media.giphy.com/media/rsf33kKU6WdA4/giphy.gif', // Jungle/wild
        ],
      },
    },

    posts: {
      regular: 20,
      picks: 10,
      outcomes: 8,
      userPosts: 3,
    },

    engagement: {
      reactionsPerPost: { min: 3, max: 15 },
      commentsPerPost: { min: 1, max: 5 },
      tailsPerPick: { min: 2, max: 10 },
    },
  },

  betting: {
    stakes: {
      small: [500, 750, 1000], // $5-$10
      medium: [1500, 2000, 2500], // $15-$25
      large: [5000, 7500], // $50-$75
      yolo: [10000], // $100 (reduced from higher amounts)
    },
    distribution: {
      small: 0.5, // 50% small bets
      medium: 0.35, // 35% medium bets
      large: 0.12, // 12% large bets
      yolo: 0.03, // 3% yolo bets
    },
    maxBankrollUsage: 0.5, // Use max 50% of available bankroll
    settlementRate: 0.7, // 70% of bets get settled in progress
    winRate: 0.45, // 45% win rate for variety
  },

  messaging: {
    dmChats: 3,
    groupChats: 3,
    userMessageRatio: 0.3,
    groupNames: ['NBA Degens 🏀', 'Saturday Squad 🏈', 'Degen Support Group 🫂'],
  },

  chats: {
    groupChats: 3,
    directChats: 3,
    messagesPerChat: { min: 10, max: 30 },
  },

  notifications: {
    recent: 10,
    types: ['follow', 'tail', 'message', 'milestone'],
  },

  badges: {
    ensureAllTypes: true,
    personalities: {
      hot_streak: 2,
      profit_king: 1,
      riding_wave: 2,
      sharp: 3,
      fade_god: 2,
      most_active: 3,
      ghost: 2,
      sunday_sweep: 1,
    },
    get totalPersonas() {
      return Object.values(this.personalities).reduce((sum, count) => sum + count, 0);
    },
  },
};

// Helper to get random stake based on distribution
export function getRandomStake(): number {
  const rand = Math.random();
  const { stakes, distribution } = MOCK_CONFIG.betting;

  if (rand < distribution.small) {
    return stakes.small[Math.floor(Math.random() * stakes.small.length)];
  } else if (rand < distribution.small + distribution.medium) {
    return stakes.medium[Math.floor(Math.random() * stakes.medium.length)];
  } else if (rand < distribution.small + distribution.medium + distribution.large) {
    return stakes.large[Math.floor(Math.random() * stakes.large.length)];
  } else {
    return stakes.yolo[Math.floor(Math.random() * stakes.yolo.length)];
  }
}

// Helper to get random media URL
export function getRandomMediaUrl(
  category: keyof typeof MOCK_CONFIG.content.stories.mediaUrls
): string {
  const urls = MOCK_CONFIG.content.stories.mediaUrls[category];
  return urls[Math.floor(Math.random() * urls.length)];
}

// Allowed emojis for reactions (must match database constraint)
export const ALLOWED_EMOJIS = ['🔥', '😭', '😂', '💀', '💯'] as const;
