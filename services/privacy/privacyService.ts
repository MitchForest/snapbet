import { supabase } from '@/services/supabase/client';
import { Storage, StorageKeys } from '@/services/storage/storageService';
import { followService } from '@/services/social/followService'; // Keep this import for now

interface PrivacySettings {
  is_private: boolean;
  show_bankroll: boolean;
  show_stats: boolean;
  show_picks: boolean;
}

interface PrivacyCheckResult {
  canView: boolean;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

export class PrivacyService {
  private static instance: PrivacyService;
  private privacyCache = new Map<string, { settings: PrivacySettings; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private cacheLoaded = false;

  private constructor() {
    // Don't load cache here - do it lazily on first use
  }

  static getInstance(): PrivacyService {
    if (!this.instance) {
      this.instance = new PrivacyService();
    }
    return this.instance;
  }

  private async ensureCacheLoaded() {
    if (!this.cacheLoaded) {
      await this.loadCachedSettings();
      this.cacheLoaded = true;
    }
  }

  private async loadCachedSettings() {
    const cached = Storage.general.get<
      Record<string, { settings: PrivacySettings; timestamp: number }>
    >(StorageKeys.PRIVACY.SETTINGS_CACHE);
    if (cached) {
      Object.entries(cached).forEach(
        ([userId, data]: [string, { settings: PrivacySettings; timestamp: number }]) => {
          if (Date.now() - data.timestamp < this.CACHE_TTL) {
            this.privacyCache.set(userId, data);
          }
        }
      );
    }
  }

  private persistCache() {
    const cacheData: Record<string, { settings: PrivacySettings; timestamp: number }> = {};
    this.privacyCache.forEach((data, userId) => {
      cacheData[userId] = data;
    });
    Storage.general.set(StorageKeys.PRIVACY.SETTINGS_CACHE, cacheData);
  }

  async getPrivacySettings(userId: string): Promise<PrivacySettings> {
    await this.ensureCacheLoaded();

    // Check cache first
    const cached = this.privacyCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.settings;
    }

    // Fetch from database - cast the response since generated types don't include new columns yet
    const { data, error } = await supabase
      .from('users')
      .select('is_private, show_bankroll, show_stats, show_picks')
      .eq('id', userId)
      .single();

    if (error || !data) {
      // Default to public settings if error
      return {
        is_private: false,
        show_bankroll: true,
        show_stats: true,
        show_picks: true,
      };
    }

    const privacyData = data;

    // Create properly typed settings object
    const settings: PrivacySettings = {
      is_private: privacyData.is_private ?? false,
      show_bankroll: privacyData.show_bankroll ?? true,
      show_stats: privacyData.show_stats ?? true,
      show_picks: privacyData.show_picks ?? true,
    };

    // Cache the result
    this.privacyCache.set(userId, {
      settings,
      timestamp: Date.now(),
    });
    this.persistCache();

    return settings;
  }

  async updatePrivacySettings(
    userId: string,
    settings: Partial<PrivacySettings>
  ): Promise<{ success: boolean; error?: string }> {
    await this.ensureCacheLoaded();

    try {
      // Cast settings to bypass type checking until types are regenerated
      const updateData = settings as {
        is_private?: boolean;
        show_bankroll?: boolean;
        show_stats?: boolean;
        show_picks?: boolean;
      };

      const { error } = await supabase.from('users').update(updateData).eq('id', userId);

      if (error) throw error;

      // Update cache
      const currentSettings = await this.getPrivacySettings(userId);
      this.privacyCache.set(userId, {
        settings: { ...currentSettings, ...settings },
        timestamp: Date.now(),
      });
      this.persistCache();

      return { success: true };
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return { success: false, error: 'Failed to update privacy settings' };
    }
  }

  async canViewUserContent(
    viewerId: string | null,
    targetUserId: string
  ): Promise<PrivacyCheckResult> {
    // User can always view their own content
    if (viewerId === targetUserId) {
      return { canView: true, isFollowing: false, isOwnProfile: true };
    }

    // Get target user's privacy settings
    const settings = await this.getPrivacySettings(targetUserId);

    // Public profiles are always viewable
    if (!settings.is_private) {
      return { canView: true, isFollowing: false, isOwnProfile: false };
    }

    // Private profiles require following
    if (!viewerId) {
      return { canView: false, isFollowing: false, isOwnProfile: false };
    }

    // Check if viewer is following target
    const followState = await followService.getFollowState(targetUserId, viewerId);
    return {
      canView: followState.isFollowing,
      isFollowing: followState.isFollowing,
      isOwnProfile: false,
    };
  }

  async canViewUserStats(
    viewerId: string | null,
    targetUserId: string,
    statType: 'bankroll' | 'stats' | 'picks'
  ): Promise<boolean> {
    // First check if can view content at all
    const { canView, isOwnProfile } = await this.canViewUserContent(viewerId, targetUserId);

    if (!canView) return false;
    if (isOwnProfile) return true;

    // Get privacy settings
    const settings = await this.getPrivacySettings(targetUserId);

    switch (statType) {
      case 'bankroll':
        return settings.show_bankroll;
      case 'stats':
        return settings.show_stats;
      case 'picks':
        return settings.show_picks;
      default:
        return false;
    }
  }

  // Build privacy filter for queries
  buildPrivacyFilter(currentUserId: string) {
    return {
      or: [
        { user_id: currentUserId }, // Own content
        { 'user.is_private': false }, // Public accounts
        {
          // Private accounts where we're following
          and: [
            { 'user.is_private': true },
            {
              'user.follows': {
                some: {
                  follower_id: currentUserId,
                },
              },
            },
          ],
        },
      ],
    };
  }

  // Clear cache for a specific user
  invalidateUserCache(userId: string) {
    this.privacyCache.delete(userId);
    this.persistCache();
  }

  // Clear all caches
  clearCache() {
    this.privacyCache.clear();
    Storage.general.delete('privacy_settings_cache');
  }
}

export const privacyService = PrivacyService.getInstance();
