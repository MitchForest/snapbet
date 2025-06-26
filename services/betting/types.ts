import { Database } from '@/types/supabase-generated';

// Re-export database types for convenience
export type Bet = Database['public']['Tables']['bets']['Row'];
export type BetInsert = Database['public']['Tables']['bets']['Insert'];
export type BetType = Database['public']['Enums']['bet_type'];
export type BetStatus = Database['public']['Enums']['bet_status'];

// Bet input for placing a new bet
export interface BetInput {
  gameId: string;
  betType: BetType;
  selection: BetSelection;
  stake: number; // in cents
  odds: number; // American odds
  shareToFeed?: boolean; // Whether to create a pick post
}

// Selection types for different bet types
export interface BetSelection {
  team?: string; // for spread/moneyline
  totalType?: 'over' | 'under'; // for totals
  line?: number; // for spread/total
}

// Options for fetching bet history
export interface BetHistoryOptions {
  limit?: number;
  offset?: number;
  status?: BetStatus;
  includeGameDetails?: boolean;
}

// Extended bet type with game info
export interface BetWithGame extends Bet {
  game?: {
    id: string;
    sport: string;
    home_team: string;
    away_team: string;
    commence_time: string;
    status: string;
    home_score: number | null;
    away_score: number | null;
  };
}

// Bet validation result
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Custom error class for betting operations
export class BettingError extends Error {
  constructor(
    message: string,
    public code:
      | 'INSUFFICIENT_FUNDS'
      | 'GAME_STARTED'
      | 'INVALID_ODDS'
      | 'MIN_BET'
      | 'VALIDATION_ERROR'
      | 'UNKNOWN'
  ) {
    super(message);
    this.name = 'BettingError';
  }
}

// Payout calculation result
export interface PayoutCalculation {
  toWin: number; // Amount to win (profit)
  totalReturn: number; // Total return including stake
}
