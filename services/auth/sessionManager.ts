import * as SecureStore from 'expo-secure-store';
import { Session } from '@supabase/supabase-js';
import { SessionData } from './types';

const SESSION_KEY = 'snapbet_session';
const REFRESH_BUFFER = 60 * 5; // Refresh 5 minutes before expiry

export class SessionManager {
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  async saveSession(session: Session): Promise<void> {
    try {
      const sessionData: SessionData = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at || 0,
        user: session.user,
      };

      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(sessionData));

      // Schedule automatic refresh
      this.scheduleRefresh(session.expires_at || 0);
    } catch (error) {
      console.error('Failed to save session:', error);
      throw error;
    }
  }

  async getSession(): Promise<SessionData | null> {
    try {
      const sessionString = await SecureStore.getItemAsync(SESSION_KEY);
      if (!sessionString) return null;

      const sessionData: SessionData = JSON.parse(sessionString);

      // Check if session is expired
      const now = Math.floor(Date.now() / 1000);
      if (sessionData.expires_at && sessionData.expires_at < now) {
        await this.clearSession();
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  async clearSession(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      this.clearRefreshTimer();
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  private scheduleRefresh(expiresAt: number): void {
    this.clearRefreshTimer();

    const now = Math.floor(Date.now() / 1000);
    const refreshAt = expiresAt - REFRESH_BUFFER;
    const delay = (refreshAt - now) * 1000;

    if (delay > 0) {
      this.refreshTimer = setTimeout(() => {
        // This will be called by the auth service
        this.onRefreshNeeded?.();
      }, delay);
    }
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Callback for when refresh is needed
  onRefreshNeeded?: () => void;

  // Storage adapter for Supabase client
  getStorageAdapter() {
    return {
      getItem: async (key: string): Promise<string | null> => {
        try {
          return await SecureStore.getItemAsync(key);
        } catch {
          return null;
        }
      },
      setItem: async (key: string, value: string): Promise<void> => {
        try {
          await SecureStore.setItemAsync(key, value);
        } catch (error) {
          console.error('Failed to set item:', error);
        }
      },
      removeItem: async (key: string): Promise<void> => {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (error) {
          console.error('Failed to remove item:', error);
        }
      },
    };
  }
}

export const sessionManager = new SessionManager();
