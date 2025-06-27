import { Storage } from '@/services/storage/storageService';
import { PendingShareBet } from '@/types/content';

const PENDING_BET_KEY = 'pendingShareBet';
const EXPIRY_DURATION = 5 * 60 * 1000; // 5 minutes

export function useBetSharing() {
  const storeBetForSharing = (bet: PendingShareBet) => {
    const data = {
      ...bet,
      storedAt: Date.now(),
    };
    Storage.general.set(PENDING_BET_KEY, data);
  };

  const retrieveAndClearBet = (): PendingShareBet | null => {
    const data = Storage.general.get<{ storedAt: number } & PendingShareBet>(PENDING_BET_KEY);
    if (!data) return null;

    // Check if data has expired
    if (data.storedAt && Date.now() - data.storedAt > EXPIRY_DURATION) {
      Storage.general.delete(PENDING_BET_KEY);
      return null;
    }

    // Clear after reading
    Storage.general.delete(PENDING_BET_KEY);

    // Remove storedAt before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { storedAt: _, ...bet } = data;
    return bet;
  };

  const clearPendingBet = () => {
    Storage.general.delete(PENDING_BET_KEY);
  };

  return {
    storeBetForSharing,
    retrieveAndClearBet,
    clearPendingBet,
  };
}
