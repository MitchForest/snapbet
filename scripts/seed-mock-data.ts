#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { mockUsers, PersonalityType } from './data/mock-users';
import { generateMockGames } from './data/mock-games';

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

// Helper to generate follow relationships
function generateFollowRelationships(
  userIds: string[]
): Array<{ follower_id: string; following_id: string }> {
  const relationships: Array<{ follower_id: string; following_id: string }> = [];

  // Sharp bettors get 15-20 followers
  const sharpIds = userIds.slice(0, 4);
  const otherIds = userIds.slice(4);

  sharpIds.forEach((sharpId) => {
    const followerCount = Math.floor(Math.random() * 6) + 15; // 15-20
    const followers = otherIds.sort(() => Math.random() - 0.5).slice(0, followerCount);

    followers.forEach((followerId) => {
      relationships.push({ follower_id: followerId, following_id: sharpId });
    });
  });

  // Fade material users surprisingly popular (10-15 followers)
  const fadeIds = userIds.slice(10, 15);
  fadeIds.forEach((fadeId) => {
    const followerCount = Math.floor(Math.random() * 6) + 10; // 10-15
    const followers = otherIds
      .filter((id) => !fadeIds.includes(id))
      .sort(() => Math.random() - 0.5)
      .slice(0, followerCount);

    followers.forEach((followerId) => {
      relationships.push({ follower_id: followerId, following_id: fadeId });
    });
  });

  // Average users get 5-10 followers
  const averageIds = userIds.slice(15);
  averageIds.forEach((avgId) => {
    const followerCount = Math.floor(Math.random() * 6) + 5; // 5-10
    const potentialFollowers = userIds.filter((id) => id !== avgId);
    const followers = potentialFollowers.sort(() => Math.random() - 0.5).slice(0, followerCount);

    followers.forEach((followerId) => {
      if (!relationships.some((r) => r.follower_id === followerId && r.following_id === avgId)) {
        relationships.push({ follower_id: followerId, following_id: avgId });
      }
    });
  });

  // Add some mutual follow relationships
  const mutualCount = 20;
  for (let i = 0; i < mutualCount; i++) {
    const user1 = userIds[Math.floor(Math.random() * userIds.length)];
    const user2 = userIds[Math.floor(Math.random() * userIds.length)];

    if (user1 !== user2) {
      // Check if relationship doesn't already exist
      if (!relationships.some((r) => r.follower_id === user1 && r.following_id === user2)) {
        relationships.push({ follower_id: user1, following_id: user2 });
      }
      if (!relationships.some((r) => r.follower_id === user2 && r.following_id === user1)) {
        relationships.push({ follower_id: user2, following_id: user1 });
      }
    }
  }

  return relationships;
}

async function seedMockData() {
  console.log('🌱 Starting mock data seeding...\n');

  try {
    // Step 1: Create mock users
    console.log('👥 Creating 30 mock users...');
    const userInserts = mockUsers.map((user) => ({
      username: user.username,
      email: user.email,
      oauth_provider: 'google' as const,
      oauth_id: `mock_${user.username}`,
      display_name: user.display_name,
      bio: user.bio,
      avatar_url: user.avatar,
      favorite_team: user.favorite_team || null,
      is_mock: true,
      mock_personality_id: user.personality,
      mock_behavior_seed: user.behavior_seed,
    }));

    const { data: createdUsers, error: usersError } = await supabase
      .from('users')
      .insert(userInserts)
      .select('id, username');

    if (usersError) {
      console.error('❌ Error creating users:', usersError);
      return;
    }

    console.log(`✅ Created ${createdUsers.length} mock users`);

    // Step 2: Create bankrolls for each user
    console.log('\n💰 Creating bankrolls...');
    const bankrollInserts = createdUsers.map((user) => ({
      user_id: user.id,
      balance: 100000, // $1,000.00 in cents
    }));

    const { error: bankrollsError } = await supabase.from('bankrolls').insert(bankrollInserts);

    if (bankrollsError) {
      console.error('❌ Error creating bankrolls:', bankrollsError);
      return;
    }

    console.log('✅ Created bankrolls for all users');

    // Step 3: Create follow relationships
    console.log('\n🤝 Creating follow relationships...');
    const userIds = createdUsers.map((u) => u.id);
    const followRelationships = generateFollowRelationships(userIds);

    const { error: followsError } = await supabase.from('follows').insert(followRelationships);

    if (followsError) {
      console.error('❌ Error creating follows:', followsError);
      return;
    }

    console.log(`✅ Created ${followRelationships.length} follow relationships`);

    // Step 4: Create mock games
    console.log('\n🏀 Creating mock NBA games...');
    const mockGames = generateMockGames(7);

    const { data: createdGames, error: gamesError } = await supabase
      .from('games')
      .insert(mockGames)
      .select('id, home_team, away_team, commence_time, status');

    if (gamesError) {
      console.error('❌ Error creating games:', gamesError);
      return;
    }

    console.log(`✅ Created ${createdGames.length} games`);

    // Step 5: Create some initial bets for completed games
    console.log('\n🎲 Creating historical bets...');
    const completedGames = createdGames.filter((g) => g.status === 'completed');
    let betCount = 0;

    for (const game of completedGames) {
      // Select 5-10 random users to have bet on this game
      const bettingUsers = createdUsers
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 6) + 5);

      for (const user of bettingUsers) {
        // Determine bet type based on personality
        const mockUser = mockUsers.find((m) => m.username === user.username)!;
        let betType: 'spread' | 'total' | 'moneyline' = 'spread';

        if (mockUser.personality === PersonalityType.CHALK_EATER) {
          betType = 'moneyline';
        } else if (mockUser.personality === PersonalityType.SQUARE_BETTOR && Math.random() > 0.5) {
          betType = 'total';
        }

        // Create bet details
        const stake = Math.floor(Math.random() * 5000) + 1000; // $10-$50
        const odds = -110;

        const betDetails = {
          team: Math.random() > 0.5 ? game.home_team : game.away_team,
          line: betType === 'spread' ? (Math.random() * 10 - 5).toFixed(1) : undefined,
          total_type: betType === 'total' ? (Math.random() > 0.5 ? 'over' : 'under') : undefined,
          odds: odds,
        };

        const { error: betError } = await supabase.from('bets').insert({
          user_id: user.id,
          game_id: game.id,
          bet_type: betType,
          bet_details: betDetails,
          stake: stake,
          odds: odds,
          potential_win: Math.floor((stake * 100) / 110),
          status: Math.random() > 0.45 ? 'won' : 'lost', // Slightly favor wins for testing
          actual_win: Math.random() > 0.45 ? Math.floor((stake * 100) / 110) : 0,
          settled_at: new Date().toISOString(),
          expires_at: game.commence_time,
        });

        if (!betError) {
          betCount++;
        }
      }
    }

    console.log(`✅ Created ${betCount} historical bets`);

    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log(`  ✓ ${createdUsers.length} mock users created`);
    console.log(`  ✓ ${createdUsers.length} bankrolls created ($1,000 each)`);
    console.log(`  ✓ ${followRelationships.length} follow relationships`);
    console.log(`  ✓ ${createdGames.length} games (${completedGames.length} completed)`);
    console.log(`  ✓ ${betCount} historical bets`);

    // Show personality distribution
    console.log('\n🎭 Personality Distribution:');
    const personalityCounts = mockUsers.reduce(
      (acc, user) => {
        acc[user.personality] = (acc[user.personality] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    Object.entries(personalityCounts).forEach(([personality, count]) => {
      console.log(`  ${personality}: ${count} users`);
    });

    console.log('\n✅ Mock data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the seeding
seedMockData();
