#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js';

// Use the same env vars as the app
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  console.error('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗');
  process.exit(1);
}

console.log('🔍 Testing Supabase connection with app credentials\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  // Test 1: Simple query
  console.log('📊 Test 1: Simple users query');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, username')
    .limit(5);

  if (usersError) {
    console.error('❌ Error:', usersError);
  } else {
    console.log(`✅ Found ${users?.length || 0} users`);
  }

  // Test 2: Check bets table
  console.log('\n📊 Test 2: Check bets table');
  const { data: bets, error: betsError } = await supabase
    .from('bets')
    .select('id, status, settled_at')
    .not('settled_at', 'is', null)
    .limit(5);

  if (betsError) {
    console.error('❌ Error:', betsError);
  } else {
    console.log(`✅ Found ${bets?.length || 0} settled bets`);
  }

  // Test 3: Test the exact hot bettors query structure
  console.log('\n📊 Test 3: Hot bettors query structure');
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)); // Monday
  weekStart.setHours(0, 0, 0, 0);

  const { data: hotBetData, error: hotBetError } = await supabase
    .from('bets')
    .select(
      `
      id,
      user_id,
      status,
      settled_at,
      users!inner (
        id,
        username,
        display_name,
        avatar_url,
        bio,
        favorite_team,
        created_at
      )
    `
    )
    .gte('settled_at', weekStart.toISOString())
    .in('status', ['won', 'lost'])
    .not('settled_at', 'is', null)
    .limit(10);

  if (hotBetError) {
    console.error('❌ Hot bettors query error:', hotBetError);
  } else {
    console.log(`✅ Hot bettors query returned ${hotBetData?.length || 0} records`);
    if (hotBetData && hotBetData.length > 0) {
      console.log('   First record structure:', JSON.stringify(hotBetData[0], null, 2));
    }
  }
}

testConnection().catch(console.error);
