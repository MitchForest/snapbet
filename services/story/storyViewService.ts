import { supabase } from '@/services/supabase';
import { StoryWithType } from '@/types/content';
import { Storage } from '@/services/storage/storageService';

const VIEWED_STORIES_KEY = 'viewed_stories';
const VIEW_DELAY_MS = 1000; // 1 second delay before tracking view

interface ViewedStoriesCache {
  [storyId: string]: number; // timestamp when viewed
}

class StoryViewService {
  private viewTimers = new Map<string, ReturnType<typeof setTimeout>>();

  /**
   * Get all active stories for a specific user
   */
  async getStoriesForUser(userId: string): Promise<StoryWithType[]> {
    const { data, error } = await supabase
      .from('stories')
      .select(
        `
        *,
        user:users(id, username, avatar_url)
      `
      )
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true }); // Oldest first

    if (error) throw error;
    return (data || []) as unknown as StoryWithType[];
  }

  /**
   * Get a single story by ID
   */
  async getStory(storyId: string): Promise<StoryWithType | null> {
    const { data, error } = await supabase
      .from('stories')
      .select(
        `
        *,
        user:users(id, username, avatar_url)
      `
      )
      .eq('id', storyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as unknown as StoryWithType;
  }

  /**
   * Track a story view after the delay
   */
  async trackStoryView(storyId: string, userId: string): Promise<void> {
    // Clear any existing timer for this story
    this.cancelViewTracking(storyId);

    // Set a timer to track the view after 1 second
    const timer = setTimeout(async () => {
      try {
        // Check if already viewed
        const isViewed = await this.hasUserViewedStory(storyId, userId);
        if (isViewed) return;

        // Track the view in the database
        await supabase.from('story_views').insert({
          story_id: storyId,
          viewer_id: userId,
        });

        // Update local cache
        const viewedStories = Storage.general.get<ViewedStoriesCache>(VIEWED_STORIES_KEY) || {};
        viewedStories[storyId] = Date.now();
        Storage.general.set(VIEWED_STORIES_KEY, viewedStories);

        // The trigger will automatically increment view_count
      } catch (error) {
        console.error('Failed to track story view:', error);
      } finally {
        this.viewTimers.delete(storyId);
      }
    }, VIEW_DELAY_MS);

    this.viewTimers.set(storyId, timer);
  }

  /**
   * Cancel view tracking for a story (called when navigating away quickly)
   */
  cancelViewTracking(storyId: string): void {
    const timer = this.viewTimers.get(storyId);
    if (timer) {
      clearTimeout(timer);
      this.viewTimers.delete(storyId);
    }
  }

  /**
   * Cancel all pending view tracking
   */
  cancelAllViewTracking(): void {
    this.viewTimers.forEach((timer) => clearTimeout(timer));
    this.viewTimers.clear();
  }

  /**
   * Check if a user has viewed a story
   */
  async hasUserViewedStory(storyId: string, userId: string): Promise<boolean> {
    // Check local cache first
    const viewedStories = Storage.general.get<ViewedStoriesCache>(VIEWED_STORIES_KEY) || {};
    if (viewedStories[storyId]) return true;

    // Check database
    const { data } = await supabase
      .from('story_views')
      .select('id')
      .eq('story_id', storyId)
      .eq('viewer_id', userId)
      .single();

    return !!data;
  }

  /**
   * Get viewers for a story (for story owner)
   */
  async getStoryViewers(
    storyId: string,
    limit = 50,
    offset = 0
  ): Promise<{
    viewers: Array<{ id: string; username: string | null; avatar_url: string | null }>;
    total: number;
  }> {
    // Get total count
    const { count } = await supabase
      .from('story_views')
      .select('*', { count: 'exact', head: true })
      .eq('story_id', storyId);

    // Get viewers with user info
    const { data, error } = await supabase
      .from('story_views')
      .select(
        `
        viewer:users!viewer_id (
          id,
          username,
          avatar_url
        )
      `
      )
      .eq('story_id', storyId)
      .order('viewed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const viewers = data?.map((view) => view.viewer).filter(Boolean) || [];

    return {
      viewers,
      total: count || 0,
    };
  }

  /**
   * Clear viewed stories cache (useful for testing or logout)
   */
  clearViewedStoriesCache(): void {
    Storage.general.delete(VIEWED_STORIES_KEY);
  }
}

export const storyViewService = new StoryViewService();
