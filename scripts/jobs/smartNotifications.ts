import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '../supabase-client';
import { notificationService } from '@/services/notifications/notificationService';

/**
 * Smart Notifications Job
 * Runs every 5 minutes to generate AI-powered notifications for users
 * based on their behavioral patterns and similar users' activities
 */
export class SmartNotificationsJob extends BaseJob {
  constructor() {
    super({
      name: 'smart-notifications',
      description: 'Generate AI-powered notifications based on behavioral patterns',
      schedule: '*/5 * * * *', // Every 5 minutes
      timeout: 300000, // 5 minutes
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    this.log('Starting smart notifications job...');
    let processedCount = 0;

    try {
      // Initialize notification service with supabase client
      notificationService.initialize(supabase);

      // Get all users with behavioral embeddings
      const { data: users, error } = await supabase
        .from('users')
        .select('id, username')
        .not('profile_embedding', 'is', null)
        .eq('archived', false);

      if (error) {
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      if (!users || users.length === 0) {
        this.log('No users with behavioral embeddings found');
        return {
          success: true,
          message: 'No users to process',
          affected: 0,
        };
      }

      this.log(`Processing ${users.length} users for smart notifications`);

      // Process users in batches to avoid overwhelming the system
      const batchSize = options.limit || 10;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (user) => {
            try {
              this.log(`Generating smart notifications for user ${user.username}`);
              await notificationService.generateSmartNotifications(user.id);
              processedCount++;
            } catch (error) {
              console.error(`Error processing user ${user.username}:`, error);
            }
          })
        );

        // Small delay between batches
        if (i + batchSize < users.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return {
        success: true,
        message: `Generated smart notifications for ${processedCount} users`,
        affected: processedCount,
      };
    } catch (error) {
      console.error('Smart notifications job failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        affected: processedCount,
      };
    }
  }
}

// For direct execution
if (require.main === module) {
  const job = new SmartNotificationsJob();
  job
    .execute()
    .then((result) => {
      console.log('Job completed:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error: Error) => {
      console.error('Job failed:', error);
      process.exit(1);
    });
}
