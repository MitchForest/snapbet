// Manual type definitions for tables not yet in generated types
// These match the actual database schema from migrations

export interface UserBadge {
  user_id: string;
  badge_id: string;
  earned_at: string;
  lost_at: string | null;
}

export interface UserStatsDisplay {
  user_id: string;
  primary_stat: string;
  show_badge: boolean | null;
  selected_badge: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BadgeHistory {
  id: string;
  user_id: string;
  badge_id: string;
  action: 'earned' | 'lost';
  created_at: string | null;
}

export interface ReferralCode {
  user_id: string;
  code: string;
  uses_count: number | null;
  created_at: string | null;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  code: string;
  created_at: string | null;
}

// Type for the updated notification structure
export interface Notification {
  id: string;
  user_id: string;
  type:
    | 'tail'
    | 'fade'
    | 'bet_won'
    | 'bet_lost'
    | 'tail_won'
    | 'tail_lost'
    | 'fade_won'
    | 'fade_lost'
    | 'follow'
    | 'message'
    | 'mention'
    | 'milestone'
    | 'system';
  data: Record<string, unknown>;
  read: boolean | null;
  created_at: string | null;
  read_at: string | null;
}

// Comment table type
export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string | null;
  deleted_at: string | null;
}

// Reaction type
export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  emoji: string;
  created_at: string | null;
}

// Tail/Fade action type
export interface PostAction {
  id: string;
  post_id: string;
  user_id: string;
  action: 'tail' | 'fade';
  created_at: string | null;
}

// Extended post type with new fields
export interface PostExtended {
  // Extends the generated Post type with new fields
  post_type: 'content' | 'pick' | 'outcome';
  effect_id: string | null;
  comment_count: number;
  settled_bet_id: string | null;
  tail_count?: number;
  fade_count?: number;
  reaction_count?: number;
}

// Engagement summary type
export interface EngagementSummary {
  reactions: Array<{
    emoji: string;
    count: number;
    users?: string[]; // User IDs who reacted
  }>;
  totalReactions: number;
  totalComments: number;
  totalTails: number;
  totalFades: number;
  userReaction?: string;
  userAction?: 'tail' | 'fade';
}
