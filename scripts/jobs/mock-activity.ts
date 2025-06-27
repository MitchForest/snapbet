#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { generateHourlyActivity } from '../mock/activity-generator';

export class MockActivityJob extends BaseJob {
  constructor() {
    super({
      name: 'mock-activity',
      description: 'Generate hourly mock user activity for demo purposes',
      schedule: '0 * * * *', // Every hour on the hour
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    // Skip late night hours (2am - 6am)
    const hour = new Date().getHours();
    if (hour >= 2 && hour <= 6) {
      if (options.verbose) {
        console.log('⏸️  Skipping mock activity during late night hours (2am-6am)');
      }
      return {
        success: true,
        message: 'Skipped: Late night hours',
        affected: 0,
      };
    }

    try {
      if (options.dryRun) {
        console.log('🤖 Would generate mock activity for current hour');
        console.log(`   Current hour: ${hour}:00`);
        console.log('   Activity types: posts, messages, reactions');
        return {
          success: true,
          message: 'Dry run: Would generate mock activity',
          affected: 0,
        };
      }

      // Generate the activity
      await generateHourlyActivity();

      return {
        success: true,
        message: `Generated mock activity for hour ${hour}`,
        affected: 1, // We don't track exact numbers for simplicity
      };
    } catch (error) {
      console.error('Error generating mock activity:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        affected: 0,
      };
    }
  }
}

// CLI execution
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const job = new MockActivityJob();
  await job.execute({
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
  });
}
