import { MMKV } from 'react-native-mmkv';
import { PendingShareBet } from '@/types/content';

const storage = new MMKV({ id: 'betting' });
const PENDING_BET_KEY = 'pendingShareBet';
const EXPIRY_DURATION = 5 * 60 * 1000; // 5 minutes

export function useBetSharing() {
  const storeBetForSharing = (bet: PendingShareBet) => {
    const data = {
      ...bet,
      storedAt: Date.now(),
    };
    storage.set(PENDING_BET_KEY, JSON.stringify(data));
  };

  const retrieveAndClearBet = (): PendingShareBet | null => {
    const dataStr = storage.getString(PENDING_BET_KEY);
    if (!dataStr) return null;

    try {
      const data = JSON.parse(dataStr);

      // Check if data has expired
      if (data.storedAt && Date.now() - data.storedAt > EXPIRY_DURATION) {
        storage.delete(PENDING_BET_KEY);
        return null;
      }

      // Clear after reading
      storage.delete(PENDING_BET_KEY);

      // Remove storedAt before returning
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { storedAt: _, ...bet } = data;
      return bet;
    } catch (error) {
      console.error('Error parsing bet data:', error);
      storage.delete(PENDING_BET_KEY);
      return null;
    }
  };

  const clearPendingBet = () => {
    storage.delete(PENDING_BET_KEY);
  };

  return {
    storeBetForSharing,
    retrieveAndClearBet,
    clearPendingBet,
  };
}
