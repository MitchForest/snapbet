#!/usr/bin/env bun

/**
 * Main setup orchestrator - creates a complete mock environment
 *
 * Usage: bun run scripts/mock/orchestrators/setup.ts
 */

import { execSync } from 'child_process';

const STEPS = [
  {
    name: 'Seed Mock Users',
    command: 'bun run scripts/mock/generators/users.ts',
    description: 'Creating 30 mock users with avatars and personalities',
  },
  {
    name: 'Add Games',
    command: 'bun run scripts/add-games.ts',
    description: 'Adding real games from odds API',
  },
  {
    name: 'Setup Mock Environment',
    command: 'bun run scripts/mock/unified-setup.ts --username=mitchforest',
    description: 'Creating posts, stories, chats, follows, and activity',
  },
];

async function runSetup() {
  console.log('🚀 Starting Snapbet Mock Environment Setup\n');
  console.log('This will create:');
  console.log('  ✅ 30 mock users with profile pictures');
  console.log('  ✅ Real games to bet on');
  console.log('  ✅ Active stories and posts');
  console.log('  ✅ Group chats and conversations');
  console.log('  ✅ Betting activity and social engagement\n');

  // Get username from command line args
  const args = process.argv.slice(2);
  const usernameArg = args.find((arg) => arg.startsWith('--username='));

  if (usernameArg) {
    // Update the unified setup command with the provided username
    STEPS[2].command = `bun run scripts/mock/unified-setup.ts ${usernameArg}`;
  } else {
    console.log('⚠️  No username provided, using default: mitchforest');
    console.log(
      '   To use your username: bun run scripts/mock/orchestrators/setup.ts --username=YOUR_USERNAME\n'
    );
  }

  for (const step of STEPS) {
    console.log(`\n📋 ${step.name}`);
    console.log(`   ${step.description}`);

    try {
      execSync(step.command, { stdio: 'inherit' });
      console.log(`   ✅ Complete!`);
    } catch (error) {
      console.error(`   ❌ Failed: ${error}`);
      process.exit(1);
    }
  }

  console.log('\n\n🎉 Mock environment setup complete!');
  console.log('\nYou can now:');
  console.log('  1. Open the app and see a populated feed');
  console.log('  2. Check stories from mock users');
  console.log('  3. View group chats and messages');
  console.log('  4. Make bets on real games');
  console.log('  5. Interact with mock user content\n');
  console.log('To add more activity later: bun run scripts/mock/orchestrators/settle.ts');
  console.log('To clean everything up: bun run scripts/mock/orchestrators/cleanup.ts\n');
}

runSetup();
