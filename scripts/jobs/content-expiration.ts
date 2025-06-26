#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '@/services/supabase/client';

export class ContentExpirationJob extends BaseJob {
  constructor() {
    super({
      name: 'content-expiration',
      description: 'Expire posts, stories, and messages based on their expiration times',
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

    // 3. Expire messages (based on chat settings)
    const expiredMessages = await this.expireMessages(options);
    totalAffected += expiredMessages;
    details.messages = expiredMessages;

    // 4. Hard delete old soft-deleted content (30+ days)
    const hardDeleted = await this.hardDeleteOldContent(options);
    details.hardDeleted = hardDeleted;

    return {
      success: true,
      message: `Expired ${totalAffected} items, hard deleted ${hardDeleted} items`,
      affected: totalAffected,
      details,
    };
  }

  private async expirePosts(options: JobOptions): Promise<number> {
    const now = new Date().toISOString();

    if (options.dryRun) {
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .lt('expires_at', now);

      if (options.verbose) {
        console.log(`  📝 Would expire ${count || 0} posts`);
      }
      return count || 0;
    }

    // Build query for posts to expire
    let query = supabase
      .from('posts')
      .update({ deleted_at: now })
      .is('deleted_at', null)
      .lt('expires_at', now)
      .select();

    if (options.limit) {
      // Get IDs to limit the update
      const { data: toExpire } = await supabase
        .from('posts')
        .select('id')
        .is('deleted_at', null)
        .lt('expires_at', now)
        .limit(options.limit);

      if (!toExpire || toExpire.length === 0) return 0;

      query = supabase
        .from('posts')
        .update({ deleted_at: now })
        .in(
          'id',
          toExpire.map((p) => p.id)
        )
        .select();
    }

    const { data, error } = await query;
    if (error) throw error;

    if (options.verbose && data) {
      console.log(`  📝 Expired ${data.length} posts`);
    }

    return data?.length || 0;
  }

  private async expirePickPosts(options: JobOptions): Promise<number> {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

    if (options.dryRun) {
      // Find pick posts with games that started 3+ hours ago
      const { count } = await supabase
        .from('posts')
        .select(
          `
          *,
          bet:bets!inner(
            game:games!inner(
              start_time
            )
          )
        `,
          { count: 'exact', head: true }
        )
        .eq('post_type', 'pick')
        .is('deleted_at', null)
        .not('bet_id', 'is', null);

      // We'll need to filter client-side for game start time
      if (options.verbose) {
        console.log(`  🎯 Would check ${count || 0} pick posts for expiration`);
      }
      return count || 0;
    }

    // Get pick posts with their associated bets and games
    const { data: picksWithGames } = await supabase
      .from('posts')
      .select(
        `
        id,
        bet:bets!inner(
          game:games!inner(
            start_time
          )
        )
      `
      )
      .eq('post_type', 'pick')
      .is('deleted_at', null)
      .not('bet_id', 'is', null);

    if (!picksWithGames || picksWithGames.length === 0) return 0;

    // Filter posts where game started 3+ hours ago
    const idsToExpire = picksWithGames
      .filter((post) => {
        const gameStartTime = (post.bet as unknown as { game?: { start_time?: string } })?.game
          ?.start_time;
        return gameStartTime && new Date(gameStartTime) < new Date(threeHoursAgo);
      })
      .map((post) => post.id);

    if (idsToExpire.length === 0) return 0;

    // Apply limit if specified
    const limitedIds = options.limit ? idsToExpire.slice(0, options.limit) : idsToExpire;

    const { data, error } = await supabase
      .from('posts')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', limitedIds)
      .select();

    if (error) throw error;

    if (options.verbose && data) {
      console.log(`  🎯 Expired ${data.length} pick posts`);
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

  private async hardDeleteOldContent(options: JobOptions): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    let totalDeleted = 0;

    // Hard delete old posts
    if (options.dryRun) {
      const { count: postCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .not('deleted_at', 'is', null)
        .lt('deleted_at', thirtyDaysAgo);

      const { count: messageCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .not('deleted_at', 'is', null)
        .lt('deleted_at', thirtyDaysAgo);

      totalDeleted = (postCount || 0) + (messageCount || 0);

      if (options.verbose) {
        console.log(
          `  🗑️  Would hard delete ${postCount || 0} posts and ${messageCount || 0} messages`
        );
      }
      return totalDeleted;
    }

    // Hard delete old posts
    const { data: deletedPosts, error: postError } = await supabase
      .from('posts')
      .delete()
      .not('deleted_at', 'is', null)
      .lt('deleted_at', thirtyDaysAgo)
      .select();

    if (postError) throw postError;
    totalDeleted += deletedPosts?.length || 0;

    // Hard delete old messages
    const { data: deletedMessages, error: messageError } = await supabase
      .from('messages')
      .delete()
      .not('deleted_at', 'is', null)
      .lt('deleted_at', thirtyDaysAgo)
      .select();

    if (messageError) throw messageError;
    totalDeleted += deletedMessages?.length || 0;

    if (options.verbose) {
      console.log(
        `  🗑️  Hard deleted ${deletedPosts?.length || 0} posts and ${deletedMessages?.length || 0} messages`
      );
    }

    return totalDeleted;
  }
}

// CLI execution
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const job = new ContentExpirationJob();
  await job.execute({
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
    limit: process.argv.includes('--limit')
      ? parseInt(process.argv[process.argv.indexOf('--limit') + 1])
      : undefined,
  });
}
