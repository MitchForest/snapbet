import { supabase } from '../services/supabase/client';
import type { Database } from '../types/supabase';

async function testConnection() {
  console.log('🔄 Testing Supabase connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Connection failed:', countError.message);
      return;
    }

    console.log('✅ Connected to Supabase successfully!');
    console.log(`   Users table exists with ${count || 0} records\n`);

    // Test 2: Check tables exist
    console.log('2️⃣ Checking database tables...');
    const tables = [
      'users',
      'bankrolls',
      'games',
      'bets',
      'posts',
      'stories',
      'reactions',
      'story_views',
      'follows',
      'pick_actions',
      'chats',
      'chat_members',
      'messages',
      'message_reads',
      'notifications',
    ] as const satisfies readonly (keyof Database['public']['Tables'])[];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`   ❌ ${table}: Not found or error`);
      } else {
        console.log(`   ✅ ${table}: OK`);
      }
    }

    // Test 3: Check functions
    console.log('\n3️⃣ Checking database functions...');

    // Note: Function testing would require actual function calls with parameters
    console.log('   ℹ️  Database functions cannot be tested directly via this script');
    console.log('   Please test functions manually in Supabase SQL editor\n');

    // Test 4: Check RLS is enabled
    console.log('4️⃣ Checking Row Level Security...');
    console.log('   ℹ️  RLS status cannot be checked via client');
    console.log('   Please verify RLS is enabled in Supabase dashboard\n');

    console.log('🎉 Connection test completed!');
    console.log('\nNext steps:');
    console.log('1. Run migrations in Supabase dashboard');
    console.log(
      '2. Generate TypeScript types: supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts'
    );
    console.log('3. Test authentication flow');
    console.log('4. Seed mock data');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testConnection();
