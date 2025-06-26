#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '@/services/supabase/client';

export class BankrollResetJob extends BaseJob {
  constructor() {
    super({
      name: 'bankroll-reset',
      description: 'Reset all user bankrolls to base + referral bonuses',
      schedule: '0 0 * * 1', // Monday midnight
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    // Get all users with their referral counts
    const { data: users, error } = await supabase.from('users').select(`
        id,
        referral_count,
        bankrolls!inner(
          balance,
          user_id
        )
      `);

    if (error) throw error;
    if (!users || users.length === 0) {
      return {
        success: true,
        message: 'No users to reset',
        affected: 0,
      };
    }

    const resetTime = new Date().toISOString();
    const updates = users.map((user) => ({
      user_id: user.id,
      balance: 1000 + (user.referral_count || 0) * 100,
      weekly_reset_at: resetTime,
    }));

    if (options.dryRun) {
      if (options.verbose) {
        console.log('  💰 Bankroll reset preview:');
        updates.forEach((u) => console.log(`    User ${u.user_id}: $${u.balance}`));
      }
      return {
        success: true,
        message: `Would reset ${updates.length} bankrolls`,
        affected: updates.length,
        details: {
          totalNewBalance: updates.reduce((sum, u) => sum + u.balance, 0),
          averageBalance: Math.round(
            updates.reduce((sum, u) => sum + u.balance, 0) / updates.length
          ),
        },
      };
    }

    // Perform updates in batches to avoid timeouts
    const batchSize = 100;
    let totalUpdated = 0;

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);

      // Update each bankroll in the batch
      for (const update of batch) {
        const { error: updateError } = await supabase
          .from('bankrolls')
          .update({
            balance: update.balance,
            weekly_reset_at: update.weekly_reset_at,
          })
          .eq('user_id', update.user_id);

        if (updateError) {
          console.error(`Failed to reset bankroll for user ${update.user_id}:`, updateError);
        } else {
          totalUpdated++;
        }
      }

      if (options.verbose) {
        console.log(
          `  💰 Reset ${Math.min(i + batchSize, updates.length)} of ${updates.length} bankrolls`
        );
      }
    }

    // Send notifications
    if (!options.dryRun) {
      await this.sendResetNotifications(users.map((u) => u.id));
    }

    return {
      success: true,
      message: `Reset ${totalUpdated} bankrolls`,
      affected: totalUpdated,
      details: {
        totalNewBalance: updates.reduce((sum, u) => sum + u.balance, 0),
        averageBalance: Math.round(updates.reduce((sum, u) => sum + u.balance, 0) / updates.length),
        failedUpdates: updates.length - totalUpdated,
      },
    };
  }

  private async sendResetNotifications(userIds: string[]): Promise<void> {
    try {
      // Create notifications in batches
      const batchSize = 50;
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);

        const notifications = batch.map((userId) => ({
          user_id: userId,
          type: 'system' as const,
          data: {
            message:
              'Your bankroll has been reset to $1,000 plus any referral bonuses. Good luck this week!',
            action: 'bankroll_reset',
          },
          read: false,
          created_at: new Date().toISOString(),
        }));

        const { error } = await supabase.from('notifications').insert(notifications);

        if (error) {
          console.error('Failed to insert notifications batch:', error);
        }
      }
    } catch (error) {
      console.warn('Failed to send some reset notifications:', error);
    }
  }
}

// CLI execution
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const job = new BankrollResetJob();
  await job.execute({
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
  });
}
