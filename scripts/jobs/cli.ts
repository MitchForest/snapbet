#!/usr/bin/env bun

import { Command } from 'commander';
import { BaseJob } from './types';
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

const program = new Command();

program.name('jobs').description('Run SnapBet automation jobs').version('1.0.0');

// Run all jobs
program
  .command('all')
  .description('Run all non-destructive jobs')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show detailed output')
  .action(async (options) => {
    const jobs = [
      new ContentExpirationJob(),
      new BadgeCalculationJob(),
      new GameSettlementJob(),
      new StatsRollupJob(),
      new GameUpdateJob(),
      new OddsUpdateJob(),
      new NotificationJob(),
      // Don't include bankroll reset, cleanup, or media cleanup in "all"
    ];

    for (const job of jobs) {
      try {
        await job.execute(options);
        console.log('---');
        console.log('✅ Job completed successfully');
      } catch (error) {
        console.error('❌ Job failed:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    }
  });

// Individual job commands
program
  .command('expire')
  .description('Expire content (posts, stories, messages)')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show detailed output')
  .option('--limit <number>', 'Limit number of items to process', parseInt)
  .action(async (options) => {
    const job = new ContentExpirationJob();
    try {
      await job.execute(options);
      console.log('✅ Job completed successfully');
    } catch (error) {
      console.error('❌ Job failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('badges')
  .description('Calculate weekly badges')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show badge details')
  .action(async (options) => {
    const job = new BadgeCalculationJob();
    try {
      await job.execute(options);
      console.log('✅ Job completed successfully');
    } catch (error) {
      console.error('❌ Job failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('reset-bankrolls')
  .description('Reset weekly bankrolls (use with caution!)')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show detailed output')
  .option('--force', 'Skip confirmation')
  .action(async (options) => {
    if (!options.dryRun && !options.force) {
      console.log('⚠️  This will reset ALL user bankrolls to $1,000 + referral bonuses!');
      console.log('Use --dry-run to preview or --force to skip this confirmation.');
      process.exit(1);
    }

    const job = new BankrollResetJob();
    try {
      await job.execute(options);
      console.log('✅ Job completed successfully');
    } catch (error) {
      console.error('❌ Job failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('settle-games')
  .description('Settle bets for completed games')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show detailed output')
  .option('--limit <number>', 'Limit number of games to process', parseInt)
  .action(async (options) => {
    const job = new GameSettlementJob();
    try {
      await job.execute(options);
      console.log('✅ Job completed successfully');
    } catch (error) {
      console.error('❌ Job failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('stats')
  .description('Calculate and update user statistics')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show detailed output')
  .option('--limit <number>', 'Limit number of users to process', parseInt)
  .action(async (options) => {
    const job = new StatsRollupJob();
    try {
      await job.execute(options);
      console.log('✅ Job completed successfully');
    } catch (error) {
      console.error('❌ Job failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('game-updates')
  .description('Update live game scores and status')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show detailed output')
  .option('--limit <number>', 'Limit number of games to process', parseInt)
  .action(async (options) => {
    const job = new GameUpdateJob();
    try {
      await job.execute(options);
      console.log('✅ Job completed successfully');
    } catch (error) {
      console.error('❌ Job failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('odds-updates')
  .description('Update odds and simulate line movements')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show detailed output')
  .option('--limit <number>', 'Limit number of games to process', parseInt)
  .action(async (options) => {
    const job = new OddsUpdateJob();
    try {
      await job.execute(options);
      console.log('✅ Job completed successfully');
    } catch (error) {
      console.error('❌ Job failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('notifications')
  .description('Send timely notifications (game starts, outcomes, etc)')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show detailed output')
  .action(async (options) => {
    const job = new NotificationJob();
    try {
      await job.execute(options);
      console.log('✅ Job completed successfully');
    } catch (error) {
      console.error('❌ Job failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('cleanup')
  .description('Clean up orphaned data and old records')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show detailed output')
  .action(async (options) => {
    const job = new CleanupJob();
    try {
      await job.execute(options);
      console.log('✅ Job completed successfully');
    } catch (error) {
      console.error('❌ Job failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('media-cleanup')
  .description('Clean up orphaned media files')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show detailed output')
  .option('--limit <number>', 'Limit number of files to process', parseInt)
  .action(async (options) => {
    const job = new MediaCleanupJob();
    try {
      await job.execute(options);
      console.log('✅ Job completed successfully');
    } catch (error) {
      console.error('❌ Job failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Schedule command to show when jobs run
program
  .command('schedule')
  .description('Show job schedules')
  .action(() => {
    const jobs = [
      { name: 'Content Expiration', schedule: 'Every hour', command: 'bun run jobs:expire' },
      { name: 'Game Updates', schedule: 'Every 5 minutes', command: 'bun run jobs:game-updates' },
      { name: 'Odds Updates', schedule: 'Every 30 minutes', command: 'bun run jobs:odds-updates' },
      { name: 'Notifications', schedule: 'Every 5 minutes', command: 'bun run jobs:notifications' },
      { name: 'Badge Calculation', schedule: 'Every hour', command: 'bun run jobs:badges' },
      { name: 'Game Settlement', schedule: 'Every 30 minutes', command: 'bun run jobs:settle' },
      { name: 'Stats Rollup', schedule: 'Every hour', command: 'bun run jobs:stats' },
      { name: 'Bankroll Reset', schedule: 'Monday midnight', command: 'bun run jobs:reset' },
      { name: 'Cleanup', schedule: 'Daily at 3 AM', command: 'bun run jobs:cleanup' },
      { name: 'Media Cleanup', schedule: 'Daily at 4 AM', command: 'bun run jobs:media-cleanup' },
    ];

    console.log('\n📅 Job Schedule:\n');
    console.table(jobs);
    console.log('\n💡 Tip: Use --dry-run to preview any job without making changes');
  });

// Run command to execute a specific job by name
program
  .command('run <jobName>')
  .description('Run a specific job by name')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show detailed output')
  .option('--limit <number>', 'Limit number of items to process', parseInt)
  .action(async (jobName, options) => {
    const jobMap: Record<string, () => BaseJob> = {
      'content-expiration': () => new ContentExpirationJob(),
      'badge-calculation': () => new BadgeCalculationJob(),
      'bankroll-reset': () => new BankrollResetJob(),
      'game-settlement': () => new GameSettlementJob(),
      'stats-rollup': () => new StatsRollupJob(),
      'game-updates': () => new GameUpdateJob(),
      'odds-updates': () => new OddsUpdateJob(),
      notifications: () => new NotificationJob(),
      cleanup: () => new CleanupJob(),
      'media-cleanup': () => new MediaCleanupJob(),
    };

    const jobFactory = jobMap[jobName];
    if (!jobFactory) {
      console.error(`❌ Unknown job: ${jobName}`);
      console.log('\nAvailable jobs:');
      Object.keys(jobMap).forEach((name) => console.log(`  - ${name}`));
      process.exit(1);
    }

    const job = jobFactory();
    try {
      await job.execute(options);
      console.log('✅ Job completed successfully');
    } catch (error) {
      console.error('❌ Job failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();
