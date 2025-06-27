#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '@/services/supabase/client';

export class CleanupJob extends BaseJob {
  constructor() {
    super({
      name: 'cleanup',
      description: 'Clean up orphaned data and old records from the database',
      schedule: '0 3 * * *', // Daily at 3 AM
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    let totalCleaned = 0;
    const details: Record<string, number> = {};

    // 1. Clean up orphaned reactions
    const orphanedReactions = await this.cleanupOrphanedReactions(options);
    totalCleaned += orphanedReactions;
    details.reactions = orphanedReactions;

    // 2. Clean up orphaned comments
    const orphanedComments = await this.cleanupOrphanedComments(options);
    totalCleaned += orphanedComments;
    details.comments = orphanedComments;

    // 3. Clean up orphaned bets
    const orphanedBets = await this.cleanupOrphanedBets(options);
    totalCleaned += orphanedBets;
    details.bets = orphanedBets;

    // 4. Clean up old notifications (30+ days)
    const oldNotifications = await this.cleanupOldNotifications(options);
    totalCleaned += oldNotifications;
    details.notifications = oldNotifications;

    // 5. Clean up orphaned chat members
    const orphanedChatMembers = await this.cleanupOrphanedChatMembers(options);
    totalCleaned += orphanedChatMembers;
    details.chatMembers = orphanedChatMembers;

    // 6. Clean up orphaned message reads
    const orphanedMessageReads = await this.cleanupOrphanedMessageReads(options);
    totalCleaned += orphanedMessageReads;
    details.messageReads = orphanedMessageReads;

    // 7. Clean up expired sessions
    const expiredSessions = await this.cleanupExpiredSessions(options);
    totalCleaned += expiredSessions;
    details.sessions = expiredSessions;

    // 8. Clean up old job executions (30+ days)
    const oldJobExecutions = await this.cleanupOldJobExecutions(options);
    totalCleaned += oldJobExecutions;
    details.jobExecutions = oldJobExecutions;

    return {
      success: true,
      message: `Cleaned up ${totalCleaned} orphaned/old records`,
      affected: totalCleaned,
      details,
    };
  }

  private async cleanupOrphanedReactions(options: JobOptions): Promise<number> {
    // Get orphaned reactions without using RPC
    const { data: orphaned } = await supabase.from('reactions').select('id, post_id').limit(1000);

    if (!orphaned || orphaned.length === 0) return 0;

    // Check which posts exist
    const postIds = [...new Set(orphaned.map((r) => r.post_id).filter((id) => id !== null))];
    const { data: existingPosts } = await supabase
      .from('posts')
      .select('id')
      .in('id', postIds)
      .is('deleted_at', null);

    const existingPostIds = new Set(existingPosts?.map((p) => p.id) || []);
    const toDelete = orphaned.filter((r) => r.post_id && !existingPostIds.has(r.post_id));

    if (options.dryRun) {
      if (options.verbose) {
        console.log(`  🗑️ Would clean up ${toDelete.length} orphaned reactions`);
      }
      return toDelete.length;
    }

    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('reactions')
        .delete()
        .in(
          'id',
          toDelete.map((r) => r.id)
        );

      if (deleteError) throw deleteError;
    }

    if (options.verbose) {
      console.log(`  🗑️ Cleaned up ${toDelete.length} orphaned reactions`);
    }
    return toDelete.length;
  }

  private async cleanupOrphanedComments(options: JobOptions): Promise<number> {
    // Similar approach for comments
    if (options.dryRun) {
      // Check how many have deleted posts
      const { data: comments } = await supabase
        .from('comments')
        .select('id, post_id')
        .is('deleted_at', null)
        .limit(100);

      if (!comments) return 0;

      const postIds = [...new Set(comments.map((c) => c.post_id))];
      const { data: activePosts } = await supabase
        .from('posts')
        .select('id')
        .in('id', postIds)
        .is('deleted_at', null);

      const activePostIds = new Set(activePosts?.map((p) => p.id) || []);
      const orphanedCount = comments.filter((c) => !activePostIds.has(c.post_id)).length;

      if (options.verbose) {
        console.log(`  🗑️ Would clean up ~${orphanedCount} orphaned comments`);
      }
      return orphanedCount;
    }

    // Get comments for deleted posts
    const { data: orphanedComments } = await supabase
      .from('comments')
      .select('id, post_id')
      .is('deleted_at', null)
      .limit(1000);

    if (!orphanedComments || orphanedComments.length === 0) return 0;

    const postIds = [...new Set(orphanedComments.map((c) => c.post_id))];
    const { data: activePosts } = await supabase
      .from('posts')
      .select('id')
      .in('id', postIds)
      .is('deleted_at', null);

    const activePostIds = new Set(activePosts?.map((p) => p.id) || []);
    const toDelete = orphanedComments.filter((c) => !activePostIds.has(c.post_id));

    if (toDelete.length > 0) {
      const { error } = await supabase
        .from('comments')
        .update({ deleted_at: new Date().toISOString() })
        .in(
          'id',
          toDelete.map((c) => c.id)
        );

      if (error) throw error;
    }

    if (options.verbose) {
      console.log(`  🗑️ Cleaned up ${toDelete.length} orphaned comments`);
    }
    return toDelete.length;
  }

  private async cleanupOrphanedBets(options: JobOptions): Promise<number> {
    // Clean up pending bets for games that are completed
    const { data: orphanedBets, error } = await supabase
      .from('bets')
      .select(
        `
        id,
        game:games!game_id(
          status
        )
      `
      )
      .eq('status', 'pending')
      .limit(1000);

    if (error) throw error;
    if (!orphanedBets || orphanedBets.length === 0) return 0;

    // Find bets where game is completed or cancelled
    const toCancel = orphanedBets.filter((bet) => {
      const gameStatus = (bet.game as { status?: string })?.status;
      return gameStatus === 'completed' || gameStatus === 'cancelled';
    });

    if (options.dryRun) {
      if (options.verbose) {
        console.log(`  🗑️ Would cancel ${toCancel.length} orphaned bets`);
      }
      return toCancel.length;
    }

    if (toCancel.length > 0) {
      const { error: updateError } = await supabase
        .from('bets')
        .update({
          status: 'cancelled',
          settled_at: new Date().toISOString(),
        })
        .in(
          'id',
          toCancel.map((b) => b.id)
        );

      if (updateError) throw updateError;
    }

    if (options.verbose) {
      console.log(`  🗑️ Cancelled ${toCancel.length} orphaned bets`);
    }
    return toCancel.length;
  }

  private async cleanupOldNotifications(options: JobOptions): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    if (options.dryRun) {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (options.verbose) {
        console.log(`  🗑️ Would clean up ${count || 0} old notifications`);
      }
      return count || 0;
    }

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString())
      .select();

    if (error) throw error;

    if (options.verbose) {
      console.log(`  🗑️ Cleaned up ${data?.length || 0} old notifications`);
    }
    return data?.length || 0;
  }

  private async cleanupOrphanedChatMembers(options: JobOptions): Promise<number> {
    // Find chat members for deleted chats
    const { data: orphanedMembers } = await supabase
      .from('chat_members')
      .select('chat_id, user_id')
      .limit(1000);

    if (!orphanedMembers || orphanedMembers.length === 0) return 0;

    const chatIds = [...new Set(orphanedMembers.map((m) => m.chat_id))];
    const { data: existingChats } = await supabase.from('chats').select('id').in('id', chatIds);

    const existingChatIds = new Set(existingChats?.map((c) => c.id) || []);
    const toDelete = orphanedMembers.filter((m) => !existingChatIds.has(m.chat_id));

    if (options.dryRun) {
      if (options.verbose) {
        console.log(`  🗑️ Would clean up ${toDelete.length} orphaned chat members`);
      }
      return toDelete.length;
    }

    if (toDelete.length > 0) {
      for (const member of toDelete) {
        const { error } = await supabase
          .from('chat_members')
          .delete()
          .eq('chat_id', member.chat_id)
          .eq('user_id', member.user_id);

        if (error) console.error(`Failed to delete chat member: ${error.message}`);
      }
    }

    if (options.verbose) {
      console.log(`  🗑️ Cleaned up ${toDelete.length} orphaned chat members`);
    }
    return toDelete.length;
  }

  private async cleanupOrphanedMessageReads(options: JobOptions): Promise<number> {
    // Find message reads for deleted messages
    const { data: orphanedReads } = await supabase
      .from('message_reads')
      .select('message_id, user_id')
      .limit(1000);

    if (!orphanedReads || orphanedReads.length === 0) return 0;

    const messageIds = [...new Set(orphanedReads.map((r) => r.message_id))];
    const { data: existingMessages } = await supabase
      .from('messages')
      .select('id')
      .in('id', messageIds)
      .is('deleted_at', null);

    const existingMessageIds = new Set(existingMessages?.map((m) => m.id) || []);
    const toDelete = orphanedReads.filter((r) => !existingMessageIds.has(r.message_id));

    if (options.dryRun) {
      if (options.verbose) {
        console.log(`  🗑️ Would clean up ${toDelete.length} orphaned message reads`);
      }
      return toDelete.length;
    }

    if (toDelete.length > 0) {
      // Delete in batches
      const batchSize = 100;
      for (let i = 0; i < toDelete.length; i += batchSize) {
        const batch = toDelete.slice(i, i + batchSize);
        const { error } = await supabase
          .from('message_reads')
          .delete()
          .in(
            'message_id',
            batch.map((r) => r.message_id)
          );

        if (error) console.error(`Failed to delete message reads: ${error.message}`);
      }
    }

    if (options.verbose) {
      console.log(`  🗑️ Cleaned up ${toDelete.length} orphaned message reads`);
    }
    return toDelete.length;
  }

  private async cleanupExpiredSessions(options: JobOptions): Promise<number> {
    // Clean up auth sessions older than 30 days
    // Note: Direct auth schema access is restricted in Supabase

    if (options.verbose) {
      console.log(`  ⚠️ Session cleanup requires database admin access - skipping`);
    }

    return 0; // Can't clean sessions without admin access
  }

  private async cleanupOldJobExecutions(options: JobOptions): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    if (options.dryRun) {
      const { count } = await supabase
        .from('job_executions')
        .select('*', { count: 'exact', head: true })
        .lt('executed_at', thirtyDaysAgo.toISOString());

      if (options.verbose) {
        console.log(`  🗑️ Would clean up ${count || 0} old job executions`);
      }
      return count || 0;
    }

    const { data, error } = await supabase
      .from('job_executions')
      .delete()
      .lt('executed_at', thirtyDaysAgo.toISOString())
      .select();

    if (error) throw error;

    if (options.verbose) {
      console.log(`  🗑️ Cleaned up ${data?.length || 0} old job executions`);
    }
    return data?.length || 0;
  }
}

// CLI execution
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const job = new CleanupJob();
  const options: JobOptions = {
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
  };

  await job.execute(options);
}
