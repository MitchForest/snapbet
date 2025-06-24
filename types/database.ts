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
