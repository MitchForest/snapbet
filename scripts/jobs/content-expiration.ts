#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '../supabase-client';

export class ContentExpirationJob extends BaseJob {
  constructor() {
    super({
      name: 'content-expiration',
      description:
        'Archive posts, stories, messages, bets, and engagement data based on their age, preserving them for AI/RAG features',
      schedule: '0 * * * *', // Every hour
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    let totalAffected = 0;
    const details: Record<string, number> = {};

    // 1. Archive posts (24h after creation)
    const archivedPosts = await this.expirePosts(options);
    totalAffected += archivedPosts;
    details.posts = archivedPosts;

    // 2. Archive pick posts (3h after game start)
    const archivedPicks = await this.expirePickPosts(options);
    totalAffected += archivedPicks;
    details.picks = archivedPicks;

    // 3. Archive stories (24h after creation)
    const archivedStories = await this.expireStories(options);
    totalAffected += archivedStories;
    details.stories = archivedStories;

    // 4. Archive messages (based on chat settings)
    const archivedMessages = await this.expireMessages(options);
    totalAffected += archivedMessages;
    details.messages = archivedMessages;

    // 5. Archive bets (older than 7 days)
    const archivedBets = await this.archiveBets(options);
    totalAffected += archivedBets;
    details.bets = archivedBets;

    // 6. Archive engagement data (reactions and pick_actions older than 3 days)
    const archivedEngagement = await this.archiveEngagementData(options);
    totalAffected += archivedEngagement;
    details.engagement = archivedEngagement;

    // 7. Cleanup comments for expired posts
    const cleanedComments = await this.cleanupComments(options);
    details.comments = cleanedComments;

    // 8. Cleanup pick_actions for expired posts
    const cleanedPickActions = await this.cleanupPickActions(options);
    details.pickActions = cleanedPickActions;

    // 9. Cleanup story_views for expired stories
    const cleanedStoryViews = await this.cleanupStoryViews(options);
    details.storyViews = cleanedStoryViews;

    // 10. Hard delete old soft-deleted content (30+ days)
    const hardDeleted = await this.hardDeleteOldContent(options);
    details.hardDeleted = hardDeleted;

    return {
      success: true,
      message: `Archived ${totalAffected} items, cleaned ${cleanedComments + cleanedPickActions + cleanedStoryViews} related records, hard deleted ${hardDeleted} items`,
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
        .eq('archived', false)
        .eq('post_type', 'content')
        .lt('created_at', twentyFourHoursAgo.toISOString());

      if (options.verbose) {
        console.log(`  📸 Would archive ${count || 0} content posts`);
      }
      return count || 0;
    }

    // Build query for posts to archive
    let query = supabase
      .from('posts')
      .update({ archived: true })
      .is('deleted_at', null)
      .eq('archived', false)
      .eq('post_type', 'content')
      .lt('created_at', twentyFourHoursAgo.toISOString())
      .select();

    if (options.limit) {
      // Get IDs to limit the update
      const { data: toArchive } = await supabase
        .from('posts')
        .select('id')
        .is('deleted_at', null)
        .eq('archived', false)
        .eq('post_type', 'content')
        .lt('created_at', twentyFourHoursAgo.toISOString())
        .limit(options.limit);

      if (!toArchive || toArchive.length === 0) return 0;

      query = supabase
        .from('posts')
        .update({ archived: true })
        .in(
          'id',
          toArchive.map((p) => p.id)
        )
        .select();
    }

    const { data, error } = await query;
    if (error) throw error;

    if (options.verbose && data) {
      console.log(`  📸 Archived ${data.length} content posts`);
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
      .eq('archived', false)
      .eq('post_type', 'pick')
      .not('bet_id', 'is', null);

    if (fetchError) throw fetchError;
    if (!picksWithGames || picksWithGames.length === 0) return 0;

    // Filter picks where game started more than 3 hours ago
    const idsToArchive = picksWithGames
      .filter((post) => {
        const gameStartTime = (post.bet as unknown as { game?: { start_time?: string } })?.game
          ?.start_time;
        return gameStartTime && new Date(gameStartTime) < new Date(threeHoursAgo);
      })
      .map((post) => post.id);

    if (idsToArchive.length === 0) return 0;

    if (options.dryRun) {
      if (options.verbose) {
        console.log(`  🎯 Would archive ${idsToArchive.length} pick posts`);
      }
      return idsToArchive.length;
    }

    // Apply limit if specified
    const limitedIds = options.limit ? idsToArchive.slice(0, options.limit) : idsToArchive;

    const { data, error } = await supabase
      .from('posts')
      .update({ archived: true })
      .in('id', limitedIds)
      .select();

    if (error) throw error;

    if (options.verbose && data) {
      console.log(`  🎯 Archived ${data.length} pick posts`);
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
        .eq('archived', false)
        .lt('expires_at', now);

      if (options.verbose) {
        console.log(`  📖 Would archive ${count || 0} stories`);
      }
      return count || 0;
    }

    // Build query for stories to archive
    let query = supabase
      .from('stories')
      .update({ archived: true })
      .is('deleted_at', null)
      .eq('archived', false)
      .lt('expires_at', now)
      .select();

    if (options.limit) {
      // Get IDs to limit the update
      const { data: toArchive } = await supabase
        .from('stories')
        .select('id')
        .is('deleted_at', null)
        .eq('archived', false)
        .lt('expires_at', now)
        .limit(options.limit);

      if (!toArchive || toArchive.length === 0) return 0;

      query = supabase
        .from('stories')
        .update({ archived: true })
        .in(
          'id',
          toArchive.map((s) => s.id)
        )
        .select();
    }

    const { data, error } = await query;
    if (error) throw error;

    if (options.verbose && data) {
      console.log(`  📖 Archived ${data.length} stories`);
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
        .eq('archived', false)
        .not('expires_at', 'is', null)
        .lt('expires_at', now);

      if (options.verbose) {
        console.log(`  💬 Would archive ${count || 0} messages`);
      }
      return count || 0;
    }

    // Build query for messages to archive
    let query = supabase
      .from('messages')
      .update({ archived: true })
      .is('deleted_at', null)
      .eq('archived', false)
      .not('expires_at', 'is', null)
      .lt('expires_at', now)
      .select();

    if (options.limit) {
      // Get IDs to limit the update
      const { data: toArchive } = await supabase
        .from('messages')
        .select('id')
        .is('deleted_at', null)
        .eq('archived', false)
        .not('expires_at', 'is', null)
        .lt('expires_at', now)
        .limit(options.limit);

      if (!toArchive || toArchive.length === 0) return 0;

      query = supabase
        .from('messages')
        .update({ archived: true })
        .in(
          'id',
          toArchive.map((m) => m.id)
        )
        .select();
    }

    const { data, error } = await query;
    if (error) throw error;

    if (options.verbose && data) {
      console.log(`  💬 Archived ${data.length} messages`);
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

  private async archiveBets(options: JobOptions): Promise<number> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    if (options.dryRun) {
      const { count } = await supabase
        .from('bets')
        .select('*', { count: 'exact', head: true })
        .eq('archived', false)
        .lt('created_at', oneWeekAgo.toISOString());

      if (options.verbose) {
        console.log(`  💰 Would archive ${count || 0} bets (older than 7 days)`);
      }
      return count || 0;
    }

    // Build query for bets to archive
    let query = supabase
      .from('bets')
      .update({ archived: true })
      .eq('archived', false)
      .lt('created_at', oneWeekAgo.toISOString())
      .select();

    if (options.limit) {
      // Get IDs to limit the update
      const { data: toArchive } = await supabase
        .from('bets')
        .select('id')
        .eq('archived', false)
        .lt('created_at', oneWeekAgo.toISOString())
        .limit(options.limit);

      if (!toArchive || toArchive.length === 0) return 0;

      query = supabase
        .from('bets')
        .update({ archived: true })
        .in(
          'id',
          toArchive.map((b) => b.id)
        )
        .select();
    }

    const { data, error } = await query;
    if (error) throw error;

    if (options.verbose && data) {
      console.log(`  💰 Archived ${data.length} bets (weekly cleanup)`);
    }

    return data?.length || 0;
  }

  private async archiveEngagementData(options: JobOptions): Promise<number> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    let totalArchived = 0;

    // Archive old reactions
    if (options.dryRun) {
      const { count: reactionsCount } = await supabase
        .from('reactions')
        .select('*', { count: 'exact', head: true })
        .eq('archived', false)
        .lt('created_at', threeDaysAgo.toISOString());

      const { count: pickActionsCount } = await supabase
        .from('pick_actions')
        .select('*', { count: 'exact', head: true })
        .eq('archived', false)
        .lt('created_at', threeDaysAgo.toISOString());

      if (options.verbose) {
        console.log(`  👍 Would archive ${reactionsCount || 0} reactions (older than 3 days)`);
        console.log(`  🎲 Would archive ${pickActionsCount || 0} pick actions (older than 3 days)`);
      }
      return (reactionsCount || 0) + (pickActionsCount || 0);
    }

    // Archive reactions
    let reactionsQuery = supabase
      .from('reactions')
      .update({ archived: true })
      .eq('archived', false)
      .lt('created_at', threeDaysAgo.toISOString())
      .select();

    if (options.limit) {
      const { data: toArchive } = await supabase
        .from('reactions')
        .select('id')
        .eq('archived', false)
        .lt('created_at', threeDaysAgo.toISOString())
        .limit(Math.floor(options.limit / 2)); // Split limit between reactions and pick_actions

      if (toArchive && toArchive.length > 0) {
        reactionsQuery = supabase
          .from('reactions')
          .update({ archived: true })
          .in(
            'id',
            toArchive.map((r) => r.id)
          )
          .select();
      }
    }

    const { data: reactionsData, error: reactionsError } = await reactionsQuery;
    if (reactionsError) throw reactionsError;
    totalArchived += reactionsData?.length || 0;

    // Archive pick_actions
    let pickActionsQuery = supabase
      .from('pick_actions')
      .update({ archived: true })
      .eq('archived', false)
      .lt('created_at', threeDaysAgo.toISOString())
      .select();

    if (options.limit) {
      const { data: toArchive } = await supabase
        .from('pick_actions')
        .select('id')
        .eq('archived', false)
        .lt('created_at', threeDaysAgo.toISOString())
        .limit(Math.ceil(options.limit / 2)); // Split limit between reactions and pick_actions

      if (toArchive && toArchive.length > 0) {
        pickActionsQuery = supabase
          .from('pick_actions')
          .update({ archived: true })
          .in(
            'id',
            toArchive.map((p) => p.id)
          )
          .select();
      }
    }

    const { data: pickActionsData, error: pickActionsError } = await pickActionsQuery;
    if (pickActionsError) throw pickActionsError;
    totalArchived += pickActionsData?.length || 0;

    if (options.verbose) {
      console.log(`  👍 Archived ${reactionsData?.length || 0} reactions`);
      console.log(`  🎲 Archived ${pickActionsData?.length || 0} pick actions`);
    }

    return totalArchived;
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
