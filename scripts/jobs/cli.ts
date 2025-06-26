#!/usr/bin/env bun

import { Command } from 'commander';
import { ContentExpirationJob } from './content-expiration';
import { BankrollResetJob } from './bankroll-reset';
import { BadgeCalculationJob } from './badge-calculation';
import { GameSettlementJob } from './game-settlement';
import { StatsRollupJob } from './stats-rollup';
import { CleanupJob } from './cleanup';
import { MediaCleanupJob } from './media-cleanup';
import { BaseJob } from './types';

const program = new Command();

program.name('jobs').description('Run SnapBet automation jobs').version('1.0.0');

// Run all jobs
program
  .command('all')
  .description('Run all production jobs')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show detailed output')
  .action(async (options) => {
    console.log('🚀 Running all production jobs...\n');

    const jobs: BaseJob[] = [
      new ContentExpirationJob(),
      new BadgeCalculationJob(),
      new GameSettlementJob(),
      new StatsRollupJob(),
      new CleanupJob(),
      new MediaCleanupJob(),
      // Don't include bankroll reset in "all" - it's weekly only
    ];

    for (const job of jobs) {
      await job.execute(options);
      console.log('---\n');
    }

    console.log('✅ All jobs completed!');
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
    await job.execute(options);
  });

program
  .command('badges')
  .description('Calculate weekly badges')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show badge details')
  .action(async (options) => {
    const job = new BadgeCalculationJob();
    await job.execute(options);
  });

program
  .command('reset-bankrolls')
  .description('Reset weekly bankrolls (use with caution!)')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show detailed output')
  .option('--force', 'Skip confirmation')
  .action(async (options) => {
    if (!options.dryRun && !options.force) {
      console.log('⚠️  WARNING: This will reset ALL user bankrolls to $1,000 + referral bonuses!');
      console.log('Are you sure you want to continue? Type "yes" to confirm:');

      const response = await new Promise<string>((resolve) => {
        process.stdin.once('data', (data) => {
          resolve(data.toString().trim());
        });
      });

      if (response !== 'yes') {
        console.log('❌ Cancelled');
        return;
      }
    }

    const job = new BankrollResetJob();
    await job.execute(options);
  });

program
  .command('settle-games')
  .description('Settle completed games')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show detailed output')
  .option('--limit <number>', 'Limit number of games to process', parseInt)
  .action(async (options) => {
    const job = new GameSettlementJob();
    await job.execute(options);
  });

program
  .command('stats')
  .description('Calculate user statistics')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show detailed output')
  .option('--limit <number>', 'Limit number of users to process', parseInt)
  .action(async (options) => {
    const job = new StatsRollupJob();
    await job.execute(options);
  });

program
  .command('cleanup')
  .description('Clean orphaned records and maintain database')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show detailed output')
  .action(async (options) => {
    const job = new CleanupJob();
    await job.execute(options);
  });

program
  .command('media-cleanup')
  .description('Clean orphaned media files')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show detailed output')
  .action(async (options) => {
    const job = new MediaCleanupJob();
    await job.execute(options);
  });

// Schedule command to show when jobs run
program
  .command('schedule')
  .description('Show job schedules')
  .action(() => {
    const jobs = [
      { name: 'Content Expiration', schedule: 'Every hour', command: 'expire' },
      { name: 'Badge Calculation', schedule: 'Every hour', command: 'badges' },
      { name: 'Bankroll Reset', schedule: 'Monday midnight', command: 'reset-bankrolls' },
      { name: 'Game Settlement', schedule: 'Every 30 minutes', command: 'settle-games' },
      { name: 'Stats Rollup', schedule: 'Every hour', command: 'stats' },
      { name: 'Database Cleanup', schedule: 'Daily at 3 AM', command: 'cleanup' },
      { name: 'Media Cleanup', schedule: 'Daily at 4 AM', command: 'media-cleanup' },
    ];

    console.log('\n📅 Job Schedule:\n');
    console.table(jobs);
    console.log('\nRun individual jobs with: bun run jobs <command>');
    console.log('Add --dry-run to preview without making changes\n');
  });

// Help command
program
  .command('help')
  .description('Show help information')
  .action(() => {
    program.help();
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.help();
}
