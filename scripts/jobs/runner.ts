#!/usr/bin/env bun

import { ContentExpirationJob } from './content-expiration';
import { BankrollResetJob } from './bankroll-reset';
import { BadgeCalculationJob } from './badge-calculation';
import { GameSettlementJob } from './game-settlement';
import { StatsRollupJob } from './stats-rollup';
import { CleanupJob } from './cleanup';
import { MediaCleanupJob } from './media-cleanup';
import { GameUpdateJob } from './game-updates';
import { OddsUpdateJob } from './odds-updates';
import { NotificationJob } from './notifications';
import { BaseJob } from './types';

interface JobSchedule {
  job: BaseJob;
  schedule: {
    minute?: number | '*' | string;
    hour?: number | '*' | string;
    dayOfWeek?: number | '*';
  };
}

export class JobRunner {
  private jobs: JobSchedule[] = [
    {
      job: new ContentExpirationJob(),
      schedule: { minute: 0, hour: '*' }, // Every hour
    },
    {
      job: new GameUpdateJob(),
      schedule: { minute: '*/5', hour: '*' }, // Every 5 minutes
    },
    {
      job: new OddsUpdateJob(),
      schedule: { minute: '*/30', hour: '*' }, // Every 30 minutes
    },
    {
      job: new NotificationJob(),
      schedule: { minute: '*/5', hour: '*' }, // Every 5 minutes
    },
    {
      job: new BadgeCalculationJob(),
      schedule: { minute: 0, hour: '*' }, // Every hour
    },
    {
      job: new GameSettlementJob(),
      schedule: { minute: '*/30', hour: '*' }, // Every 30 minutes
    },
    {
      job: new StatsRollupJob(),
      schedule: { minute: 0, hour: '*' }, // Every hour
    },
    {
      job: new BankrollResetJob(),
      schedule: { minute: 0, hour: 0, dayOfWeek: 1 }, // Monday midnight
    },
    {
      job: new CleanupJob(),
      schedule: { minute: 0, hour: 3 }, // Daily at 3 AM
    },
    {
      job: new MediaCleanupJob(),
      schedule: { minute: 0, hour: 4 }, // Daily at 4 AM
    },
  ];

  async start() {
    console.log('🚀 Job Runner started');
    console.log(`📅 Monitoring ${this.jobs.length} jobs\n`);

    // Run jobs that should run on startup
    await this.checkAndRunJobs();

    // Check every minute
    setInterval(() => {
      this.checkAndRunJobs();
    }, 60 * 1000);
  }

  private async checkAndRunJobs() {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentHour = now.getHours();
    const currentDayOfWeek = now.getDay();

    for (const { job, schedule } of this.jobs) {
      if (this.shouldRun(schedule, currentMinute, currentHour, currentDayOfWeek)) {
        console.log(`\n⏰ Running ${job.name}...`);

        try {
          const result = await job.execute({ dryRun: false, verbose: false });

          if (result.success) {
            console.log(`✅ ${job.name} completed: ${result.message}`);
          } else {
            console.error(`❌ ${job.name} failed: ${result.message}`);
          }
        } catch (error) {
          console.error(`❌ ${job.name} error:`, error);
        }
      }
    }
  }

  private shouldRun(
    schedule: JobSchedule['schedule'],
    currentMinute: number,
    currentHour: number,
    currentDayOfWeek: number
  ): boolean {
    // Check minute
    if (schedule.minute !== undefined) {
      if (schedule.minute === '*') {
        // Runs every minute - always true
      } else if (typeof schedule.minute === 'string' && schedule.minute.startsWith('*/')) {
        // Interval schedule (e.g., */5 means every 5 minutes)
        const interval = parseInt(schedule.minute.substring(2));
        if (currentMinute % interval !== 0) return false;
      } else if (schedule.minute !== currentMinute) {
        return false;
      }
    }

    // Check hour
    if (schedule.hour !== undefined) {
      if (schedule.hour === '*') {
        // Runs every hour - always true
      } else if (typeof schedule.hour === 'string' && schedule.hour.startsWith('*/')) {
        // Interval schedule
        const interval = parseInt(schedule.hour.substring(2));
        if (currentHour % interval !== 0) return false;
      } else if (schedule.hour !== currentHour) {
        return false;
      }
    }

    // Check day of week
    if (schedule.dayOfWeek !== undefined && schedule.dayOfWeek !== '*') {
      if (schedule.dayOfWeek !== currentDayOfWeek) return false;
    }

    return true;
  }

  async runOnce(jobName?: string) {
    if (jobName) {
      const jobSchedule = this.jobs.find(
        (js) => js.job.name.toLowerCase() === jobName.toLowerCase()
      );

      if (!jobSchedule) {
        console.error(`❌ Job not found: ${jobName}`);
        console.log('\nAvailable jobs:');
        this.jobs.forEach((js) => console.log(`  - ${js.job.name}`));
        return;
      }

      console.log(`🚀 Running ${jobSchedule.job.name}...`);
      const result = await jobSchedule.job.execute({ dryRun: false, verbose: true });
      console.log(result.success ? '✅ Success' : '❌ Failed');
      console.log(`Message: ${result.message}`);
    } else {
      // Run all jobs once
      console.log('🚀 Running all jobs once...\n');

      for (const { job } of this.jobs) {
        console.log(`\n⏰ Running ${job.name}...`);

        try {
          const result = await job.execute({ dryRun: false, verbose: false });
          console.log(result.success ? '✅ Success' : '❌ Failed');
          console.log(`Message: ${result.message}`);
        } catch (error) {
          console.error(`❌ Error:`, error);
        }
      }
    }
  }
}

// CLI execution
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const runner = new JobRunner();

  const command = process.argv[2];

  if (command === 'once') {
    // Run all jobs once
    await runner.runOnce(process.argv[3]);
  } else {
    // Start the continuous runner
    await runner.start();
  }
}
