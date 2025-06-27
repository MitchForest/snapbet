#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '@/services/supabase/client';

export class ContentExpirationJob extends BaseJob {
  constructor() {
    super({
      name: 'content-expiration',
      description:
        'Expire posts, stories, messages, and related data based on their expiration times',
      schedule: '0 * * * *', // Every hour
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    let totalAffected = 0;
    const details: Record<string, number> = {};

    // 1. Expire posts (24h after creation)
    const expiredPosts = await this.expirePosts(options);
    totalAffected += expiredPosts;
    details.posts = expiredPosts;

    // 2. Expire pick posts (3h after game start)
    const expiredPicks = await this.expirePickPosts(options);
    totalAffected += expiredPicks;
    details.picks = expiredPicks;

    // 3. Expire stories (24h after creation)
    const expiredStories = await this.expireStories(options);
    totalAffected += expiredStories;
    details.stories = expiredStories;

    // 4. Expire messages (based on chat settings)
    const expiredMessages = await this.expireMessages(options);
    totalAffected += expiredMessages;
    details.messages = expiredMessages;

    // 5. Cleanup comments for expired posts
    const cleanedComments = await this.cleanupComments(options);
    details.comments = cleanedComments;

    // 6. Cleanup pick_actions for expired posts
    const cleanedPickActions = await this.cleanupPickActions(options);
    details.pickActions = cleanedPickActions;

    // 7. Cleanup story_views for expired stories
    const cleanedStoryViews = await this.cleanupStoryViews(options);
    details.storyViews = cleanedStoryViews;

    // 8. Hard delete old soft-deleted content (30+ days)
    const hardDeleted = await this.hardDeleteOldContent(options);
    details.hardDeleted = hardDeleted;

    return {
      success: true,
      message: `Expired ${totalAffected} items, cleaned ${cleanedComments + cleanedPickActions + cleanedStoryViews} related records, hard deleted ${hardDeleted} items`,
      affected: totalAffected,
      details,
    };
  }

  private async expirePosts(options: JobOptions): Promise<number> {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (options.dryRun) {
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .eq('post_type', 'content')
        .lt('created_at', twentyFourHoursAgo.toISOString());

      if (options.verbose) {
        console.log(`  📸 Would expire ${count || 0} content posts`);
      }
      return count || 0;
    }

    // Build query for posts to expire
    let query = supabase
      .from('posts')
      .update({ deleted_at: now.toISOString() })
      .is('deleted_at', null)
      .eq('post_type', 'content')
      .lt('created_at', twentyFourHoursAgo.toISOString())
      .select();

    if (options.limit) {
      // Get IDs to limit the update
      const { data: toExpire } = await supabase
        .from('posts')
        .select('id')
        .is('deleted_at', null)
        .eq('post_type', 'content')
        .lt('created_at', twentyFourHoursAgo.toISOString())
        .limit(options.limit);

      if (!toExpire || toExpire.length === 0) return 0;

      query = supabase
        .from('posts')
        .update({ deleted_at: now.toISOString() })
        .in(
          'id',
          toExpire.map((p) => p.id)
        )
        .select();
    }

    const { data, error } = await query;
    if (error) throw error;

    if (options.verbose && data) {
      console.log(`  📸 Expired ${data.length} content posts`);
    }

    return data?.length || 0;
  }

  private async expirePickPosts(options: JobOptions): Promise<number> {
    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    // First get pick posts with their associated game data
    const { data: picksWithGames, error: fetchError } = await supabase
      .from('posts')
      .select(
        `
        id,
        bet:bets!bet_id(
          game:games!game_id(
            start_time:commence_time
          )
        )
      `
      )
      .is('deleted_at', null)
      .eq('post_type', 'pick')
      .not('bet_id', 'is', null);

    if (fetchError) throw fetchError;
    if (!picksWithGames || picksWithGames.length === 0) return 0;

    // Filter picks where game started more than 3 hours ago
    const idsToExpire = picksWithGames
      .filter((post) => {
        const gameStartTime = (post.bet as unknown as { game?: { start_time?: string } })?.game
          ?.start_time;
        return gameStartTime && new Date(gameStartTime) < new Date(threeHoursAgo);
      })
      .map((post) => post.id);

    if (idsToExpire.length === 0) return 0;

    if (options.dryRun) {
      if (options.verbose) {
        console.log(`  🎯 Would expire ${idsToExpire.length} pick posts`);
      }
      return idsToExpire.length;
    }

    // Apply limit if specified
    const limitedIds = options.limit ? idsToExpire.slice(0, options.limit) : idsToExpire;

    const { data, error } = await supabase
      .from('posts')
      .update({ deleted_at: now.toISOString() })
      .in('id', limitedIds)
      .select();

    if (error) throw error;

    if (options.verbose && data) {
      console.log(`  🎯 Expired ${data.length} pick posts`);
    }

    return data?.length || 0;
  }

  private async expireStories(options: JobOptions): Promise<number> {
    const now = new Date().toISOString();

    if (options.dryRun) {
      const { count } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .lt('expires_at', now);

      if (options.verbose) {
        console.log(`  📖 Would expire ${count || 0} stories`);
      }
      return count || 0;
    }

    // Build query for stories to expire
    let query = supabase
      .from('stories')
      .update({ deleted_at: now })
      .is('deleted_at', null)
      .lt('expires_at', now)
      .select();

    if (options.limit) {
      // Get IDs to limit the update
      const { data: toExpire } = await supabase
        .from('stories')
        .select('id')
        .is('deleted_at', null)
        .lt('expires_at', now)
        .limit(options.limit);

      if (!toExpire || toExpire.length === 0) return 0;

      query = supabase
        .from('stories')
        .update({ deleted_at: now })
        .in(
          'id',
          toExpire.map((s) => s.id)
        )
        .select();
    }

    const { data, error } = await query;
    if (error) throw error;

    if (options.verbose && data) {
      console.log(`  📖 Expired ${data.length} stories`);
    }

    return data?.length || 0;
  }

  private async expireMessages(options: JobOptions): Promise<number> {
    const now = new Date().toISOString();

    if (options.dryRun) {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .not('expires_at', 'is', null)
        .lt('expires_at', now);

      if (options.verbose) {
        console.log(`  💬 Would expire ${count || 0} messages`);
      }
      return count || 0;
    }

    // Build query for messages to expire
    let query = supabase
      .from('messages')
      .update({ deleted_at: now })
      .is('deleted_at', null)
      .not('expires_at', 'is', null)
      .lt('expires_at', now)
      .select();

    if (options.limit) {
      // Get IDs to limit the update
      const { data: toExpire } = await supabase
        .from('messages')
        .select('id')
        .is('deleted_at', null)
        .not('expires_at', 'is', null)
        .lt('expires_at', now)
        .limit(options.limit);

      if (!toExpire || toExpire.length === 0) return 0;

      query = supabase
        .from('messages')
        .update({ deleted_at: now })
        .in(
          'id',
          toExpire.map((m) => m.id)
        )
        .select();
    }

    const { data, error } = await query;
    if (error) throw error;

    if (options.verbose && data) {
      console.log(`  💬 Expired ${data.length} messages`);
    }

    return data?.length || 0;
  }

  private async cleanupComments(options: JobOptions): Promise<number> {
    // Get expired posts to clean up their comments
    const { data: expiredPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id')
      .not('deleted_at', 'is', null);

    if (fetchError) throw fetchError;
    if (!expiredPosts || expiredPosts.length === 0) return 0;

    const postIds = expiredPosts.map((p) => p.id);

    if (options.dryRun) {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .in('post_id', postIds)
        .is('deleted_at', null);

      if (options.verbose) {
        console.log(`  💭 Would cleanup ${count || 0} comments from expired posts`);
      }
      return count || 0;
    }

    // Soft delete comments for expired posts
    const { data, error } = await supabase
      .from('comments')
      .update({ deleted_at: new Date().toISOString() })
      .in('post_id', postIds)
      .is('deleted_at', null)
      .select();

    if (error) throw error;

    if (options.verbose && data) {
      console.log(`  💭 Cleaned up ${data.length} comments`);
    }

    return data?.length || 0;
  }

  private async cleanupPickActions(options: JobOptions): Promise<number> {
    // Get expired posts to clean up their pick actions
    const { data: expiredPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id')
      .not('deleted_at', 'is', null)
      .eq('post_type', 'pick');

    if (fetchError) throw fetchError;
    if (!expiredPosts || expiredPosts.length === 0) return 0;

    const postIds = expiredPosts.map((p) => p.id);

    if (options.dryRun) {
      const { count } = await supabase
        .from('pick_actions')
        .select('*', { count: 'exact', head: true })
        .in('post_id', postIds);

      if (options.verbose) {
        console.log(`  🎲 Would cleanup ${count || 0} pick actions from expired posts`);
      }
      return count || 0;
    }

    // Delete pick actions for expired posts
    const { data, error } = await supabase
      .from('pick_actions')
      .delete()
      .in('post_id', postIds)
      .select();

    if (error) throw error;

    if (options.verbose && data) {
      console.log(`  🎲 Cleaned up ${data.length} pick actions`);
    }

    return data?.length || 0;
  }

  private async cleanupStoryViews(options: JobOptions): Promise<number> {
    // Get expired stories to clean up their views
    const { data: expiredStories, error: fetchError } = await supabase
      .from('stories')
      .select('id')
      .not('deleted_at', 'is', null);

    if (fetchError) throw fetchError;
    if (!expiredStories || expiredStories.length === 0) return 0;

    const storyIds = expiredStories.map((s) => s.id);

    if (options.dryRun) {
      const { count } = await supabase
        .from('story_views')
        .select('*', { count: 'exact', head: true })
        .in('story_id', storyIds);

      if (options.verbose) {
        console.log(`  👁️ Would cleanup ${count || 0} story views from expired stories`);
      }
      return count || 0;
    }

    // Delete story views for expired stories
    const { data, error } = await supabase
      .from('story_views')
      .delete()
      .in('story_id', storyIds)
      .select();

    if (error) throw error;

    if (options.verbose && data) {
      console.log(`  👁️ Cleaned up ${data.length} story views`);
    }

    return data?.length || 0;
  }

  private async hardDeleteOldContent(options: JobOptions): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let totalDeleted = 0;

    // Hard delete old posts
    if (options.dryRun) {
      const { count: postCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .not('deleted_at', 'is', null)
        .lt('deleted_at', thirtyDaysAgo.toISOString());

      const { count: storyCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .not('deleted_at', 'is', null)
        .lt('deleted_at', thirtyDaysAgo.toISOString());

      const { count: messageCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .not('deleted_at', 'is', null)
        .lt('deleted_at', thirtyDaysAgo.toISOString());

      const { count: commentCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .not('deleted_at', 'is', null)
        .lt('deleted_at', thirtyDaysAgo.toISOString());

      totalDeleted =
        (postCount || 0) + (storyCount || 0) + (messageCount || 0) + (commentCount || 0);

      if (options.verbose) {
        console.log(`  🗑️ Would hard delete:`);
        console.log(`     - ${postCount || 0} posts`);
        console.log(`     - ${storyCount || 0} stories`);
        console.log(`     - ${messageCount || 0} messages`);
        console.log(`     - ${commentCount || 0} comments`);
      }
      return totalDeleted;
    }

    // Hard delete old posts
    const { data: deletedPosts, error: postError } = await supabase
      .from('posts')
      .delete()
      .not('deleted_at', 'is', null)
      .lt('deleted_at', thirtyDaysAgo.toISOString())
      .select();

    if (postError) throw postError;
    totalDeleted += deletedPosts?.length || 0;

    // Hard delete old stories
    const { data: deletedStories, error: storyError } = await supabase
      .from('stories')
      .delete()
      .not('deleted_at', 'is', null)
      .lt('deleted_at', thirtyDaysAgo.toISOString())
      .select();

    if (storyError) throw storyError;
    totalDeleted += deletedStories?.length || 0;

    // Hard delete old messages
    const { data: deletedMessages, error: messageError } = await supabase
      .from('messages')
      .delete()
      .not('deleted_at', 'is', null)
      .lt('deleted_at', thirtyDaysAgo.toISOString())
      .select();

    if (messageError) throw messageError;
    totalDeleted += deletedMessages?.length || 0;

    // Hard delete old comments
    const { data: deletedComments, error: commentError } = await supabase
      .from('comments')
      .delete()
      .not('deleted_at', 'is', null)
      .lt('deleted_at', thirtyDaysAgo.toISOString())
      .select();

    if (commentError) throw commentError;
    totalDeleted += deletedComments?.length || 0;

    if (options.verbose) {
      console.log(`  🗑️ Hard deleted:`);
      console.log(`     - ${deletedPosts?.length || 0} posts`);
      console.log(`     - ${deletedStories?.length || 0} stories`);
      console.log(`     - ${deletedMessages?.length || 0} messages`);
      console.log(`     - ${deletedComments?.length || 0} comments`);
    }

    return totalDeleted;
  }
}

// CLI execution
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const job = new ContentExpirationJob();
  const options: JobOptions = {
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
  };

  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
  if (limitArg) {
    options.limit = parseInt(limitArg.split('=')[1], 10);
  }

  await job.execute(options);
}
