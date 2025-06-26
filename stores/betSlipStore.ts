import { create } from 'zustand';
import { Game } from '@/types/database';
import { BetType, BetSelection } from '@/services/betting/types';
import { bettingService } from '@/services/betting/bettingService';
import { Storage, StorageKeys } from '@/services/storage/storageService';

interface BetSlipState {
  // Current bet being configured
  game: Game | null;
  betType: BetType;
  selection: BetSelection | null;
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
}));

// Helper function to extract odds from game data
function getOddsForSelection(game: Game, betType: BetType, selection: BetSelection): number | null {
  const bookmaker = game.odds_data?.bookmakers?.[0];
  if (!bookmaker) return null;

  switch (betType) {
    case 'spread':
      if (!selection.team || !bookmaker.markets.spreads) return null;
      return selection.team === game.home_team
        ? bookmaker.markets.spreads.home
        : bookmaker.markets.spreads.away;

    case 'total':
      if (!selection.totalType || !bookmaker.markets.totals) return null;
      return selection.totalType === 'over'
        ? bookmaker.markets.totals.over
        : bookmaker.markets.totals.under;

    case 'moneyline':
      if (!selection.team || !bookmaker.markets.h2h) return null;
      return selection.team === game.home_team
        ? bookmaker.markets.h2h.home
        : bookmaker.markets.h2h.away;

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
      if (!state.selection.team || state.selection.line === undefined) {
        return { isValid: false, error: 'Invalid spread selection' };
      }
      break;

    case 'total':
      if (!state.selection.totalType || state.selection.line === undefined) {
        return { isValid: false, error: 'Invalid total selection' };
      }
      break;

    case 'moneyline':
      if (!state.selection.team) {
        return { isValid: false, error: 'Invalid moneyline selection' };
      }
      break;
  }

  return { isValid: true };
}
