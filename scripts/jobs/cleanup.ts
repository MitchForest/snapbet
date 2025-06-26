#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '@/services/supabase/client';

export class CleanupJob extends BaseJob {
  constructor() {
    super({
      name: 'cleanup',
      description: 'Database maintenance and cleanup of orphaned records',
      schedule: '0 3 * * *', // Daily at 3 AM
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    let totalCleaned = 0;
    const details: Record<string, number> = {};

    // 1. Clean orphaned reactions (posts that no longer exist)
    const orphanedReactions = await this.cleanOrphanedReactions(options);
    totalCleaned += orphanedReactions;
    details.orphanedReactions = orphanedReactions;

    // 2. Clean orphaned comments (posts that no longer exist)
    const orphanedComments = await this.cleanOrphanedComments(options);
    totalCleaned += orphanedComments;
    details.orphanedComments = orphanedComments;

    // 3. Clean orphaned tail/fade bets (original bets that no longer exist)
    const orphanedBets = await this.cleanOrphanedBets(options);
    totalCleaned += orphanedBets;
    details.orphanedBets = orphanedBets;

    // 4. Clean expired notifications (older than 30 days)
    const expiredNotifications = await this.cleanExpiredNotifications(options);
    totalCleaned += expiredNotifications;
    details.expiredNotifications = expiredNotifications;

    // 5. Clean old job executions
    const oldJobExecutions = await this.cleanOldJobExecutions(options);
    totalCleaned += oldJobExecutions;
    details.oldJobExecutions = oldJobExecutions;

    // 6. Vacuum analyze tables (maintenance)
    if (!options.dryRun) {
      await this.vacuumAnalyzeTables(options);
    }

    return {
      success: true,
      message: `Cleaned ${totalCleaned} orphaned/expired records`,
      affected: totalCleaned,
      details,
    };
  }

  private async cleanOrphanedReactions(options: JobOptions): Promise<number> {
    // Get all post IDs
    const { data: posts } = await supabase.from('posts').select('id');

    if (!posts || posts.length === 0) return 0;

    const postIds = posts.map((p) => p.id);

    if (options.dryRun) {
      // Count orphaned reactions
      const { count } = await supabase
        .from('reactions')
        .select('*', { count: 'exact', head: true })
        .not('post_id', 'in', postIds);

      if (options.verbose) {
        console.log(`  🗑️  Would clean ${count || 0} orphaned reactions`);
      }
      return count || 0;
    }

    // Delete orphaned reactions
    const { data, error } = await supabase
      .from('reactions')
      .delete()
      .not('post_id', 'in', postIds)
      .select();

    if (error) {
      console.error('Failed to clean orphaned reactions:', error);
      return 0;
    }

    const cleaned = data?.length || 0;
    if (options.verbose) {
      console.log(`  🗑️  Cleaned ${cleaned} orphaned reactions`);
    }

    return cleaned;
  }

  private async cleanOrphanedComments(options: JobOptions): Promise<number> {
    // Get all post IDs
    const { data: posts } = await supabase.from('posts').select('id');

    if (!posts || posts.length === 0) return 0;

    const postIds = posts.map((p) => p.id);

    if (options.dryRun) {
      // Count orphaned comments
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .not('post_id', 'in', postIds);

      if (options.verbose) {
        console.log(`  🗑️  Would clean ${count || 0} orphaned comments`);
      }
      return count || 0;
    }

    // Delete orphaned comments
    const { data, error } = await supabase
      .from('comments')
      .delete()
      .not('post_id', 'in', postIds)
      .select();

    if (error) {
      console.error('Failed to clean orphaned comments:', error);
      return 0;
    }

    const cleaned = data?.length || 0;
    if (options.verbose) {
      console.log(`  🗑️  Cleaned ${cleaned} orphaned comments`);
    }

    return cleaned;
  }

  private async cleanOrphanedBets(options: JobOptions): Promise<number> {
    // Get all bet IDs
    const { data: bets } = await supabase
      .from('bets')
      .select('id, original_pick_id')
      .not('original_pick_id', 'is', null);

    if (!bets || bets.length === 0) return 0;

    // Get all valid bet IDs
    const { data: validBets } = await supabase.from('bets').select('id');

    const validBetIds = new Set(validBets?.map((b) => b.id) || []);

    // Find orphaned bets
    const orphanedBetIds = bets
      .filter((b) => b.original_pick_id && !validBetIds.has(b.original_pick_id))
      .map((b) => b.id);

    if (orphanedBetIds.length === 0) return 0;

    if (options.dryRun) {
      if (options.verbose) {
        console.log(`  🗑️  Would clean ${orphanedBetIds.length} orphaned tail/fade bets`);
      }
      return orphanedBetIds.length;
    }

    // Delete orphaned bets
    const { data, error } = await supabase.from('bets').delete().in('id', orphanedBetIds).select();

    if (error) {
      console.error('Failed to clean orphaned bets:', error);
      return 0;
    }

    const cleaned = data?.length || 0;
    if (options.verbose) {
      console.log(`  🗑️  Cleaned ${cleaned} orphaned tail/fade bets`);
    }

    return cleaned;
  }

  private async cleanExpiredNotifications(options: JobOptions): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    if (options.dryRun) {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', thirtyDaysAgo);

      if (options.verbose) {
        console.log(`  🗑️  Would clean ${count || 0} expired notifications`);
      }
      return count || 0;
    }

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', thirtyDaysAgo)
      .select();

    if (error) {
      console.error('Failed to clean expired notifications:', error);
      return 0;
    }

    const cleaned = data?.length || 0;
    if (options.verbose) {
      console.log(`  🗑️  Cleaned ${cleaned} expired notifications`);
    }

    return cleaned;
  }

  private async cleanOldJobExecutions(options: JobOptions): Promise<number> {
    if (options.dryRun) {
      // In dry run, just log what would happen
      if (options.verbose) {
        console.log(`  🗑️  Would clean old job executions`);
      }
      return 0;
    }

    // Call the cleanup function we created in the migration
    const { error } = await supabase.rpc('cleanup_old_job_executions');

    if (error) {
      console.error('Failed to clean old job executions:', error);
      return 0;
    }

    if (options.verbose) {
      console.log(`  🗑️  Cleaned old job executions`);
    }

    return 0; // Function doesn't return count
  }

  private async vacuumAnalyzeTables(options: JobOptions): Promise<void> {
    if (options.verbose) {
      console.log('  🔧 Running VACUUM ANALYZE on tables...');
    }

    // Note: VACUUM cannot be run inside a transaction block
    // In production, this would be handled by a separate maintenance script
    // or scheduled through the database's own maintenance features

    const tables = ['posts', 'bets', 'reactions', 'comments', 'notifications', 'messages'];

    // For now, just log that we would vacuum
    if (options.verbose) {
      console.log(`  🔧 Would vacuum ${tables.length} tables in production`);
    }
  }
}

// CLI execution
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const job = new CleanupJob();
  await job.execute({
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
  });
}
