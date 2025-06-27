import { Game } from './database';
import { Bet } from '@/services/betting/types';

export enum PostType {
  CONTENT = 'content',
  PICK = 'pick',
  OUTCOME = 'outcome',
}

export interface PostTypeConfig {
  type: PostType;
  label: string;
  description: string;
  icon: string;
  expirationRule: string;
  requiresBet: boolean;
  entryPoint: string;
}

export const POST_TYPE_CONFIGS: Record<PostType, PostTypeConfig> = {
  [PostType.CONTENT]: {
    type: PostType.CONTENT,
    label: 'Content',
    description: 'Share a moment',
    icon: '📸',
    expirationRule: '24 hours',
    requiresBet: false,
    entryPoint: 'camera_tab',
  },
  [PostType.PICK]: {
    type: PostType.PICK,
    label: 'Pick',
    description: 'Share your bet',
    icon: '🎯',
    expirationRule: 'At game time',
    requiresBet: true,
    entryPoint: 'bet_confirmation',
  },
  [PostType.OUTCOME]: {
    type: PostType.OUTCOME,
    label: 'Outcome',
    description: 'Share your result',
    icon: '🏆',
    expirationRule: '24 hours',
    requiresBet: true,
    entryPoint: 'bet_history',
  },
};

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string | null;
  deleted_at: string | null;
  // Relations
  user?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface PendingShareBet {
  betId: string;
  type: 'pick' | 'outcome';
  gameId: string;
  betType: 'spread' | 'total' | 'moneyline';
  betDetails: {
    team?: string;
    line?: number;
    total_type?: 'over' | 'under';
  };
  stake: number;
  odds: number;
  potentialWin: number;
  expiresAt?: string;
  // For outcome posts
  status?: 'won' | 'lost' | 'push';
  actualWin?: number;
  game?: Game;
}

export interface PostWithType {
  id: string;
  user_id: string;
  post_type: PostType;
  media_url: string;
  media_type: 'photo' | 'video' | 'gif';
  thumbnail_url: string | null;
  caption: string | null;
  effect_id: string | null;
  bet_id: string | null;
  settled_bet_id: string | null;
  comment_count: number;
  tail_count: number;
  fade_count: number;
  reaction_count: number;
  report_count?: number;
  created_at: string;
  expires_at: string;
  deleted_at: string | null;
  // Relations
  user?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  bet?: Bet & { game?: Game };
  settled_bet?: Bet & { game?: Game };
}

export interface CreatePostParams {
  media_url: string;
  media_type: 'photo' | 'video' | 'gif';
  thumbnail_url?: string;
  caption?: string;
  effect_id?: string;
  post_type?: PostType;
  bet_id?: string;
  settled_bet_id?: string;
  expires_at?: Date;
}

export interface StoryWithType {
  id: string;
  user_id: string;
  story_content_type: string | null;
  media_url: string;
  media_type: 'photo' | 'video' | 'gif';
  caption: string | null;
  created_at: string | null;
  expires_at: string;
  deleted_at: string | null;
  metadata: Record<string, unknown> | null;
  story_type: string | null;
  view_count: number | null;
  // Relations
  user?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
}
