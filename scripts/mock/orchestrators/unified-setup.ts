#!/usr/bin/env bun

/**
 * Unified Setup Script
 * This script now delegates to the modular setup orchestrator
 */

import { supabase } from '../../supabase-client';
import { setupMockData } from './setup';

async function main() {
  // Get username from command line
  const args = process.argv.slice(2);
  const usernameArg = args.find((arg) => arg.startsWith('--username='));
  const username = usernameArg ? usernameArg.split('=')[1] : null;

  if (!username) {
    console.error(
      '❌ Username required. Use: bun run scripts/mock/unified-setup.ts --username=YOUR_USERNAME'
    );
    process.exit(1);
  }

  // Get user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (userError || !user) {
    console.error(`❌ User "${username}" not found. Please create an account first.`);
    process.exit(1);
  }

  console.log(`👤 Setting up mock data for user: ${username}\n`);

  // Run the modular setup
  await setupMockData(user.id);
}

main().catch(console.error);
