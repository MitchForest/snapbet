import { create } from 'zustand';
import { Game } from '@/types/database';
import { bettingService } from '@/services/betting/bettingService';
import { Storage, StorageKeys } from '@/services/storage/storageService';

export type BetType = 'spread' | 'total' | 'moneyline';

export interface TeamSelection {
  team: string;
  line?: number;
}

export interface TotalSelection {
  totalType: 'over' | 'under';
  line: number;
}

export type BetSelection = TeamSelection | TotalSelection | null;

interface BetSlipState {
  // Current bet being configured
  game: Game | null;
  betType: BetType;
  selection: BetSelection;
  stake: number;
  quickAmounts: [25, 50, 100]; // Fixed amounts in dollars
  shareToFeed: boolean;

  // Computed values
  odds: number;
  potentialWin: number;
  totalReturn: number;

  // UI state
  isPlacing: boolean;

  // Actions
  setGame: (game: Game) => void;
  setBetType: (type: BetType) => void;
  setSelection: (selection: BetSelection) => void;
  setStake: (amount: number) => void;
  toggleShareToFeed: () => void;
  setIsPlacing: (isPlacing: boolean) => void;
  reset: () => void;

  // Validation
  isValid: boolean;
  validationError: string | null;

  // Draft management
  saveDraft: () => void;
  loadDraft: () => void;
  clearDraft: () => void;

  // Internal methods
  updateComputedValues: () => void;

  // Computed getters
  getCurrentOdds: () => number;
  getPotentialPayout: () => number;
}

export const useBetSlipStore = create<BetSlipState>((set, get) => ({
  // Initial state
  game: null,
  betType: 'spread', // Default to spread as most common
  selection: null,
  stake: 2500, // $25 in cents (default quick amount)
  quickAmounts: [25, 50, 100],
  shareToFeed: true, // Default on for viral sharing
  odds: 0,
  potentialWin: 0,
  totalReturn: 0,
  isPlacing: false,
  isValid: false,
  validationError: null,

  // Actions
  setGame: (game: Game) => {
    set({ game, selection: null });
    get().updateComputedValues();
    get().saveDraft();
  },

  setBetType: (betType: BetType) => {
    set({ betType, selection: null });
    get().updateComputedValues();
    get().saveDraft();
  },

  setSelection: (selection: BetSelection) => {
    set({ selection });
    get().updateComputedValues();
    get().saveDraft();
  },

  setStake: (stake: number) => {
    set({ stake });
    get().updateComputedValues();
    get().saveDraft();
  },

  toggleShareToFeed: () => {
    set((state) => ({ shareToFeed: !state.shareToFeed }));
    get().saveDraft();
  },

  setIsPlacing: (isPlacing: boolean) => set({ isPlacing }),

  reset: () => {
    set({
      game: null,
      betType: 'spread',
      selection: null,
      stake: 2500,
      shareToFeed: true,
      odds: 0,
      potentialWin: 0,
      totalReturn: 0,
      isPlacing: false,
      isValid: false,
      validationError: null,
    });
    get().clearDraft();
  },

  // Draft management
  saveDraft: () => {
    const state = get();
    if (!state.game) return;

    const draft = {
      gameId: state.game.id,
      betType: state.betType,
      selection: state.selection,
      stake: state.stake,
      shareToFeed: state.shareToFeed,
    };

    Storage.betting.set(StorageKeys.BETTING.SELECTED_GAME, draft);
  },

  loadDraft: async () => {
    interface DraftData {
      gameId: string;
      betType: BetType;
      selection: BetSelection | null;
      stake: number;
      shareToFeed: boolean;
    }
    const draft = Storage.betting.get<DraftData>(StorageKeys.BETTING.SELECTED_GAME);
    if (!draft || !draft.gameId) return;

    // Note: Game loading would be handled by the UI component
    // This just restores the bet configuration
    set({
      betType: draft.betType || 'spread',
      selection: draft.selection || null,
      stake: draft.stake || 2500,
      shareToFeed: draft.shareToFeed ?? true,
    });
  },

  clearDraft: () => {
    Storage.betting.delete(StorageKeys.BETTING.SELECTED_GAME);
  },

  // Private method to update computed values
  updateComputedValues: () => {
    const state = get();
    if (!state.game || !state.selection) {
      set({
        odds: 0,
        potentialWin: 0,
        totalReturn: 0,
        isValid: false,
        validationError: 'Incomplete selection',
      });
      return;
    }

    // Get odds based on selection
    const odds = getOddsForSelection(state.game, state.betType, state.selection);
    if (!odds) {
      set({
        odds: 0,
        potentialWin: 0,
        totalReturn: 0,
        isValid: false,
        validationError: 'Odds not available',
      });
      return;
    }

    // Calculate payout
    const payout = bettingService.calculatePayout(state.stake, odds);

    // Validate
    const validation = validateBetSlip(state);

    set({
      odds,
      potentialWin: payout.toWin,
      totalReturn: payout.totalReturn,
      isValid: validation.isValid,
      validationError: validation.error || null,
    });
  },

  // Computed getters
  getCurrentOdds: () => {
    const state = get();
    if (!state.game || !state.selection) return 0;

    const odds = state.game.odds_data?.bookmakers?.[0]?.markets;
    if (!odds) return 0;

    switch (state.betType) {
      case 'spread':
        if ('team' in state.selection) {
          return state.selection.team === state.game.home_team
            ? odds.spreads?.home || 0
            : odds.spreads?.away || 0;
        }
        return 0;

      case 'total':
        if ('totalType' in state.selection) {
          return state.selection.totalType === 'over'
            ? odds.totals?.over || 0
            : odds.totals?.under || 0;
        }
        return 0;

      case 'moneyline':
        if ('team' in state.selection) {
          return state.selection.team === state.game.home_team
            ? odds.h2h?.home || 0
            : odds.h2h?.away || 0;
        }
        return 0;

      default:
        return 0;
    }
  },

  getPotentialPayout: () => {
    const state = get();
    const odds = state.getCurrentOdds();
    if (!odds || !state.stake) return 0;

    // Convert American odds to decimal
    let decimal: number;
    if (odds > 0) {
      decimal = odds / 100 + 1;
    } else {
      decimal = 100 / Math.abs(odds) + 1;
    }

    // Calculate win amount (profit only, not including stake)
    return Math.floor(state.stake * (decimal - 1));
  },
}));

// Helper function to extract odds from game data
function getOddsForSelection(game: Game, betType: BetType, selection: BetSelection): number | null {
  if (!selection) return null;

  const bookmaker = game.odds_data?.bookmakers?.[0];
  if (!bookmaker) return null;

  switch (betType) {
    case 'spread':
      if ('team' in selection && bookmaker.markets.spreads) {
        return selection.team === game.home_team
          ? bookmaker.markets.spreads.home
          : bookmaker.markets.spreads.away;
      }
      return null;

    case 'total':
      if ('totalType' in selection && bookmaker.markets.totals) {
        return selection.totalType === 'over'
          ? bookmaker.markets.totals.over
          : bookmaker.markets.totals.under;
      }
      return null;

    case 'moneyline':
      if ('team' in selection && bookmaker.markets.h2h) {
        return selection.team === game.home_team
          ? bookmaker.markets.h2h.home
          : bookmaker.markets.h2h.away;
      }
      return null;

    default:
      return null;
  }
}

// Helper function to validate bet slip
function validateBetSlip(state: Partial<BetSlipState>): {
  isValid: boolean;
  error?: string;
} {
  if (!state.game) {
    return { isValid: false, error: 'No game selected' };
  }

  if (!state.selection) {
    return { isValid: false, error: 'No selection made' };
  }

  if (!state.stake || state.stake < 500) {
    return { isValid: false, error: 'Minimum bet is $5' };
  }

  // Check game hasn't started
  if (new Date(state.game.commence_time) < new Date()) {
    return { isValid: false, error: 'Game has already started' };
  }

  // Validate selection based on bet type
  switch (state.betType) {
    case 'spread':
      if (!('team' in state.selection) || state.selection.line === undefined) {
        return { isValid: false, error: 'Invalid spread selection' };
      }
      break;

    case 'total':
      if (!('totalType' in state.selection) || state.selection.line === undefined) {
        return { isValid: false, error: 'Invalid total selection' };
      }
      break;

    case 'moneyline':
      if (!('team' in state.selection)) {
        return { isValid: false, error: 'Invalid moneyline selection' };
      }
      break;
  }

  return { isValid: true };
}
