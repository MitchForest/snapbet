#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Get Supabase URL and service key from environment
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  if (!supabaseUrl) console.error('  - EXPO_PUBLIC_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_KEY');
  console.error('\nPlease check your .env file');
  process.exit(1);
}

// Create Supabase client with service key for admin operations
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
  full: args.includes('--full'),
  mockOnly: args.includes('--mock-only'),
  betsOnly: args.includes('--bets-only'),
  force: args.includes('--force'),
  dryRun: args.includes('--dry-run'),
};

// Validation
if ([flags.full, flags.mockOnly, flags.betsOnly].filter(Boolean).length > 1) {
  console.error('❌ Please specify only one reset type: --full, --mock-only, or --bets-only');
  process.exit(1);
}

if (!flags.full && !flags.mockOnly && !flags.betsOnly) {
  console.log('Database Setup & Reset Script');
  console.log('============================\n');
  console.log('Usage: bun run scripts/setup-db.ts [options]\n');
  console.log('Options:');
  console.log('  --full        Full database reset (DANGEROUS!)');
  console.log('  --mock-only   Reset only mock user data');
  console.log('  --bets-only   Reset only bets and games');
  console.log('  --force       Skip confirmation prompts');
  console.log('  --dry-run     Show what would be deleted without executing\n');
  console.log('Examples:');
  console.log('  bun run scripts/setup-db.ts --mock-only');
  console.log('  bun run scripts/setup-db.ts --full --force');
  console.log('  bun run scripts/setup-db.ts --bets-only --dry-run');
  process.exit(0);
}

// Confirmation prompt
async function confirmAction(message: string): Promise<boolean> {
  if (flags.force) return true;

  console.log(`\n⚠️  ${message}`);
  console.log('Type "yes" to continue, or anything else to cancel:');

  const response = await new Promise<string>((resolve) => {
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });

  return response.toLowerCase() === 'yes';
}

// Count records in tables
async function countRecords() {
  const counts = {
    users: 0,
    mockUsers: 0,
    bets: 0,
    games: 0,
    posts: 0,
    follows: 0,
  };

  // Count users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  counts.users = totalUsers || 0;

  // Count mock users
  const { count: mockUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('is_mock', true);
  counts.mockUsers = mockUsers || 0;

  // Count bets
  const { count: bets } = await supabase.from('bets').select('*', { count: 'exact', head: true });
  counts.bets = bets || 0;

  // Count games
  const { count: games } = await supabase.from('games').select('*', { count: 'exact', head: true });
  counts.games = games || 0;

  // Count posts
  const { count: posts } = await supabase.from('posts').select('*', { count: 'exact', head: true });
  counts.posts = posts || 0;

  // Count follows
  const { count: follows } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true });
  counts.follows = follows || 0;

  return counts;
}

// Reset functions
async function resetMockData() {
  console.log('\n🧹 Resetting mock user data...');

  if (flags.dryRun) {
    const counts = await countRecords();
    console.log('\n📊 Dry run - would delete:');
    console.log(`  - ${counts.mockUsers} mock users (and their associated data)`);
    return;
  }

  // Delete mock users (cascades to related tables)
  const { error, count } = await supabase.from('users').delete().eq('is_mock', true);

  if (error) {
    console.error('❌ Error deleting mock users:', error);
    return;
  }

  console.log(`✅ Deleted ${count} mock users and their associated data`);
}

async function resetBetsAndGames() {
  console.log('\n🧹 Resetting bets and games...');

  if (flags.dryRun) {
    const counts = await countRecords();
    console.log('\n📊 Dry run - would delete:');
    console.log(`  - ${counts.bets} bets`);
    console.log(`  - ${counts.games} games`);
    return;
  }

  // Delete all bets
  const { error: betsError, count: betsCount } = await supabase
    .from('bets')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (betsError) {
    console.error('❌ Error deleting bets:', betsError);
    return;
  }

  // Delete all games
  const { error: gamesError, count: gamesCount } = await supabase
    .from('games')
    .delete()
    .gte('id', ''); // Delete all (matches any non-empty string)

  if (gamesError) {
    console.error('❌ Error deleting games:', gamesError);
    return;
  }

  console.log(`✅ Deleted ${betsCount} bets`);
  console.log(`✅ Deleted ${gamesCount} games`);
}

async function resetFullDatabase() {
  console.log('\n🧹 Performing FULL database reset...');

  if (flags.dryRun) {
    const counts = await countRecords();
    console.log('\n📊 Dry run - would delete:');
    console.log(`  - ${counts.users} users (${counts.mockUsers} mock)`);
    console.log(`  - ${counts.bets} bets`);
    console.log(`  - ${counts.games} games`);
    console.log(`  - ${counts.posts} posts`);
    console.log(`  - ${counts.follows} follow relationships`);
    console.log('  - All other related data');
    return;
  }

  // Delete in order to respect foreign key constraints
  const deletions = [
    { table: 'pick_actions', name: 'pick actions' },
    { table: 'reactions', name: 'reactions' },
    { table: 'story_views', name: 'story views' },
    { table: 'message_reads', name: 'message reads' },
    { table: 'messages', name: 'messages' },
    { table: 'chat_members', name: 'chat members' },
    { table: 'chats', name: 'chats' },
    { table: 'posts', name: 'posts' },
    { table: 'stories', name: 'stories' },
    { table: 'bets', name: 'bets' },
    { table: 'games', name: 'games' },
    { table: 'follows', name: 'follows' },
    { table: 'notifications', name: 'notifications' },
    { table: 'bankrolls', name: 'bankrolls' },
    { table: 'users', name: 'users' },
  ];

  for (const { table, name } of deletions) {
    const { error, count } = await supabase
      .from(table as keyof Database['public']['Tables'])
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      console.error(`❌ Error deleting ${name}:`, error);
      continue;
    }

    console.log(`✅ Deleted ${count || 0} ${name}`);
  }
}

// Main execution
async function main() {
  console.log('🗄️  SnapFade Database Setup\n');

  // Show current state
  const counts = await countRecords();
  console.log('📊 Current database state:');
  console.log(`  - ${counts.users} total users (${counts.mockUsers} mock)`);
  console.log(`  - ${counts.bets} bets`);
  console.log(`  - ${counts.games} games`);
  console.log(`  - ${counts.posts} posts`);
  console.log(`  - ${counts.follows} follow relationships`);

  // Execute based on flags
  if (flags.full) {
    const confirmed = await confirmAction(
      'This will DELETE ALL DATA in the database. Are you sure?'
    );
    if (!confirmed) {
      console.log('❌ Operation cancelled');
      process.exit(0);
    }
    await resetFullDatabase();
  } else if (flags.mockOnly) {
    const confirmed = await confirmAction(
      'This will delete all mock users and their data. Continue?'
    );
    if (!confirmed) {
      console.log('❌ Operation cancelled');
      process.exit(0);
    }
    await resetMockData();
  } else if (flags.betsOnly) {
    const confirmed = await confirmAction('This will delete all bets and games. Continue?');
    if (!confirmed) {
      console.log('❌ Operation cancelled');
      process.exit(0);
    }
    await resetBetsAndGames();
  }

  if (!flags.dryRun) {
    console.log('\n✅ Database reset completed!');
    console.log('💡 Run "bun run scripts/seed-mock-data.ts" to add mock data');
  }
}

// Run the script
main()
  .catch(console.error)
  .finally(() => process.exit(0));
