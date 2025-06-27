#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js';
import { startOfWeek } from 'date-fns';

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugHotBettors() {
  console.log('🔍 Debugging Hot Bettors Query\n');

  // Get current week start
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  console.log('📅 Week start (Monday):', weekStart.toISOString());
  console.log('📅 Current time:', new Date().toISOString());
  console.log('');

  // 1. Check total bets this week
  const { data: weekBets, error: weekError } = await supabase
    .from('bets')
    .select('id, user_id, status, settled_at')
    .gte('settled_at', weekStart.toISOString())
    .in('status', ['won', 'lost'])
    .not('settled_at', 'is', null);

  if (weekError) {
    console.error('❌ Error fetching week bets:', weekError);
  } else {
    console.log(`📊 Total settled bets this week: ${weekBets?.length || 0}`);

    if (weekBets && weekBets.length > 0) {
      // Group by user
      const userStats = new Map<string, { wins: number; losses: number; total: number }>();

      weekBets.forEach((bet) => {
        if (!userStats.has(bet.user_id)) {
          userStats.set(bet.user_id, { wins: 0, losses: 0, total: 0 });
        }
        const stats = userStats.get(bet.user_id)!;
        stats.total++;
        if (bet.status === 'won') {
          stats.wins++;
        } else {
          stats.losses++;
        }
      });

      console.log(`👥 Unique users with bets: ${userStats.size}`);
      console.log('\n🏆 Users with 5+ bets this week:');

      const qualifiedUsers = Array.from(userStats.entries())
        .filter(([_, stats]) => stats.total >= 5)
        .sort((a, b) => b[1].total - a[1].total);

      for (const [userId, stats] of qualifiedUsers) {
        const winRate = stats.wins / stats.total;
        console.log(
          `   User ${userId.substring(0, 8)}... - ${stats.total} bets, ${stats.wins}W/${stats.losses}L (${(winRate * 100).toFixed(1)}%)`
        );
      }
    }
  }

  console.log('\n');

  // 2. Check what the actual query returns
  console.log('🔍 Testing the actual hot bettor query...');

  const { data: betsData, error: betsError } = await supabase
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
    .not('settled_at', 'is', null);

  if (betsError) {
    console.error('❌ Error in hot bettor query:', betsError);
  } else {
    console.log(`✅ Query returned ${betsData?.length || 0} bet records`);

    if (betsData && betsData.length > 0) {
      // Group by user
      const userMap = new Map<
        string,
        {
          user: {
            id: string;
            username: string | null;
            display_name: string | null;
            avatar_url: string | null;
            bio: string | null;
            favorite_team: string | null;
            created_at: string | null;
          };
          wins: number;
          losses: number;
          total: number;
        }
      >();

      betsData.forEach((bet) => {
        if (!userMap.has(bet.user_id)) {
          const user = Array.isArray(bet.users) ? bet.users[0] : bet.users;
          userMap.set(bet.user_id, {
            user: {
              id: user.id,
              username: user.username,
              display_name: user.display_name,
              avatar_url: user.avatar_url,
              bio: user.bio,
              favorite_team: user.favorite_team,
              created_at: user.created_at,
            },
            wins: 0,
            losses: 0,
            total: 0,
          });
        }

        const userData = userMap.get(bet.user_id)!;
        userData.total++;
        if (bet.status === 'won') {
          userData.wins++;
        } else {
          userData.losses++;
        }
      });

      console.log(`\n🔥 Potential Hot Bettors (5+ bets, 60%+ win rate):`);

      const hotBettors = Array.from(userMap.values())
        .filter((data) => data.total >= 5)
        .map((data) => ({
          ...data,
          winRate: data.wins / data.total,
        }))
        .filter((data) => data.winRate >= 0.6)
        .sort((a, b) => b.winRate - a.winRate);

      if (hotBettors.length === 0) {
        console.log('   ❌ No users meet the criteria!');
      } else {
        hotBettors.forEach((bettor) => {
          console.log(
            `   ✅ @${bettor.user.username} - ${bettor.total} bets, ${(bettor.winRate * 100).toFixed(1)}% win rate`
          );
        });
      }
    }
  }

  console.log('\n');

  // 3. Check last 7 days as fallback
  console.log('🔍 Checking last 7 days (fallback mode)...');

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: fallbackData, error: fallbackError } = await supabase
    .from('bets')
    .select('id, user_id, status, settled_at')
    .gte('settled_at', sevenDaysAgo.toISOString())
    .in('status', ['won', 'lost'])
    .not('settled_at', 'is', null);

  if (fallbackError) {
    console.error('❌ Error in fallback query:', fallbackError);
  } else {
    console.log(`📊 Total settled bets in last 7 days: ${fallbackData?.length || 0}`);
  }

  console.log('\n');

  // 4. Check mock users
  console.log('🔍 Checking mock users...');

  const { data: mockUsers, error: mockError } = await supabase
    .from('users')
    .select('id, username, mock_personality_id')
    .not('mock_personality_id', 'is', null)
    .in('mock_personality_id', ['sharp-bettor', 'live-bettor', 'contrarian']);

  if (mockError) {
    console.error('❌ Error fetching mock users:', mockError);
  } else {
    console.log(`👥 Found ${mockUsers?.length || 0} mock users that should be hot bettors`);
    if (mockUsers && mockUsers.length > 0) {
      console.log('   Mock users:');
      mockUsers.slice(0, 5).forEach((user) => {
        console.log(`   - @${user.username} (${user.mock_personality_id})`);
      });
    }
  }
}

debugHotBettors().catch(console.error);
