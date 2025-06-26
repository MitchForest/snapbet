#!/usr/bin/env bun

import { BaseJob, JobOptions } from './types';
import { ContentExpirationJob } from './content-expiration';
import { BankrollResetJob } from './bankroll-reset';
import { BadgeCalculationJob } from './badge-calculation';
import { GameSettlementJob } from './game-settlement';
import { StatsRollupJob } from './stats-rollup';
import { CleanupJob } from './cleanup';
import { MediaCleanupJob } from './media-cleanup';

interface JobSchedule {
  job: BaseJob;
  cronExpression: string;
  lastRun?: Date;
  nextRun?: Date;
}

export class JobRunner {
  private schedules: JobSchedule[] = [];

  constructor() {
    this.initializeSchedules();
  }

  private initializeSchedules() {
    // Initialize all job schedules
    this.schedules = [
      {
        job: new ContentExpirationJob(),
        cronExpression: '0 * * * *', // Every hour
      },
      {
        job: new BadgeCalculationJob(),
        cronExpression: '0 * * * *', // Every hour
      },
      {
        job: new BankrollResetJob(),
        cronExpression: '0 0 * * 1', // Monday midnight
      },
      {
        job: new GameSettlementJob(),
        cronExpression: '*/30 * * * *', // Every 30 minutes
      },
      {
        job: new StatsRollupJob(),
        cronExpression: '0 * * * *', // Every hour
      },
      {
        job: new CleanupJob(),
        cronExpression: '0 3 * * *', // Daily at 3 AM
      },
      {
        job: new MediaCleanupJob(),
        cronExpression: '0 4 * * *', // Daily at 4 AM
      },
    ];
  }

  /**
   * Run all jobs that are due based on their schedule
   */
  async runDueJobs(options: JobOptions = {}): Promise<void> {
    const now = new Date();
    console.log(`🕐 Checking for due jobs at ${now.toISOString()}`);

    for (const schedule of this.schedules) {
      if (this.isDue(schedule, now)) {
        console.log(`\n▶️  Running ${schedule.job.constructor.name}...`);

        try {
          const result = await schedule.job.execute(options);
          schedule.lastRun = now;

          if (result.success) {
            console.log(`✅ Success: ${result.message}`);
          } else {
            console.log(`❌ Failed: ${result.message}`);
          }
        } catch (error) {
          console.error(`❌ Error running ${schedule.job.constructor.name}:`, error);
        }
      }
    }
  }

  /**
   * Run a specific job by name
   */
  async runJob(jobName: string, options: JobOptions = {}): Promise<void> {
    const schedule = this.schedules.find(
      (s) => s.job.constructor.name.toLowerCase() === jobName.toLowerCase()
    );

    if (!schedule) {
      throw new Error(`Job not found: ${jobName}`);
    }

    await schedule.job.execute(options);
  }

  /**
   * List all registered jobs
   */
  listJobs(): void {
    console.log('\n📋 Registered Jobs:\n');

    const jobInfo = this.schedules.map((schedule) => ({
      name: schedule.job.constructor.name,
      schedule: schedule.cronExpression,
      lastRun: schedule.lastRun?.toISOString() || 'Never',
    }));

    console.table(jobInfo);
  }

  /**
   * Check if a job is due to run
   * Note: This is a simplified check - in production you'd use a proper cron parser
   */
  private isDue(schedule: JobSchedule, now: Date): boolean {
    // For demo purposes, we'll just check if it hasn't run in the last hour
    // In production, you'd use a cron parser library
    if (!schedule.lastRun) return true;

    const hoursSinceLastRun = (now.getTime() - schedule.lastRun.getTime()) / (1000 * 60 * 60);

    // Simple logic based on cron expression
    if (schedule.cronExpression.includes('*/30')) {
      // Every 30 minutes
      return hoursSinceLastRun >= 0.5;
    } else if (schedule.cronExpression.startsWith('0 * * * *')) {
      // Every hour
      return hoursSinceLastRun >= 1;
    } else if (
      schedule.cronExpression.startsWith('0 3 * * *') ||
      schedule.cronExpression.startsWith('0 4 * * *')
    ) {
      // Daily
      return hoursSinceLastRun >= 24;
    } else if (schedule.cronExpression === '0 0 * * 1') {
      // Weekly on Monday
      return now.getDay() === 1 && hoursSinceLastRun >= 168;
    }

    return false;
  }
}

// CLI execution
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const runner = new JobRunner();
  const command = process.argv[2];

  const options: JobOptions = {
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
  };

  switch (command) {
    case 'run-due':
      await runner.runDueJobs(options);
      break;
    case 'list':
      runner.listJobs();
      break;
    case 'run': {
      const jobName = process.argv[3];
      if (!jobName) {
        console.error('Please specify a job name');
        process.exit(1);
      }
      await runner.runJob(jobName, options);
      break;
    }
    default:
      console.log('Usage:');
      console.log('  bun run scripts/jobs/runner.ts run-due [--dry-run] [--verbose]');
      console.log('  bun run scripts/jobs/runner.ts list');
      console.log('  bun run scripts/jobs/runner.ts run <job-name> [--dry-run] [--verbose]');
  }
}
