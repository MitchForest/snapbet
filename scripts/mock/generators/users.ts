#!/usr/bin/env bun

/**
 * Seeds mock users into the database with avatar URLs
 */

import { supabase } from '../../supabase-client';
import type { Database } from '@/types/database';
import { MOCK_CONFIG } from '../config';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];

const personalities = Object.keys(MOCK_CONFIG.users.personalities);

export async function generateMockUsers(): Promise<User[]> {
  console.log('👥 Creating mock users...');

  // Check if mock users already exist
  const { data: existingUsers, error: checkError } = await supabase
    .from('users')
    .select('*')
    .eq('is_mock', true)
    .limit(MOCK_CONFIG.users.count);

  if (checkError) {
    console.error('Error checking for existing users:', checkError);
    return [];
  }

  if (existingUsers && existingUsers.length === MOCK_CONFIG.users.count) {
    console.log(`  ⚠️  Found all ${existingUsers.length} mock users, using existing...`);
    return existingUsers;
  }

  // Create new mock users
  const mockUsersToCreate = [];

  // Distribute personalities across users
  const personalityDistribution = [
    // First 5 users: Rising stars (new users created in last 3 days)
    ...Array(5).fill('casual-carl'),
    // Next 3 users: Hot bettors
    ...Array(3).fill('sharp-steve'),
    // Next 2 users: Fade-worthy users
    'square-bob',
    'public-pete',
    // Next 2 users: Fade gods (they fade others)
    'sharp-steve',
    'sharp-steve',
    // Fill the rest with varied personalities
    ...Array(MOCK_CONFIG.users.count - 14) // Dynamic calculation: 50 - 14 = 36
      .fill(null)
      .map(() => personalities[Math.floor(Math.random() * personalities.length)]),
  ];

  for (let i = 0; i < MOCK_CONFIG.users.count; i++) {
    // Add safety check in case distribution is shorter than expected
    const personalityIndex =
      i < personalityDistribution.length ? i : personalityDistribution.length - 1;
    const personality = personalityDistribution[
      personalityIndex
    ] as keyof typeof MOCK_CONFIG.users.personalities;
    const personalityData = MOCK_CONFIG.users.personalities[personality];

    // Fallback in case personality is not found
    if (!personalityData) {
      console.error(`Personality data not found for: ${personality}`);
      continue;
    }

    // First 5 users created in last 3 days for rising star
    // Next 5 users created in last week
    // Rest created over last month
    let createdAt: Date;
    if (i < 5) {
      // Rising stars - created 1-3 days ago
      const daysAgo = Math.random() * 2 + 1; // 1-3 days
      createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    } else if (i < 10) {
      // Recent users - created 4-7 days ago
      const daysAgo = Math.random() * 3 + 4; // 4-7 days
      createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    } else {
      // Older users - created 8-30 days ago
      const daysAgo = Math.random() * 22 + 8; // 8-30 days
      createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    }

    const username = `${personalityData.usernamePrefix}${i + 1}`;

    mockUsersToCreate.push({
      id: crypto.randomUUID(),
      username,
      email: `${username}@snapbet.mock`,
      display_name: `${personalityData.displayName} ${i + 1}`,
      bio: personalityData.bio,
      avatar_url: personalityData.avatar,
      is_mock: true,
      mock_personality_id: personality,
      oauth_id: `mock_${username}`,
      oauth_provider: 'google' as const,
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
    });
  }

  // Insert all mock users
  const { data: insertedUsers, error: insertError } = await supabase
    .from('users')
    .insert(mockUsersToCreate)
    .select();

  if (insertError) {
    console.error('Error creating mock users:', insertError);
    return [];
  }

  console.log(`  ✅ Created ${insertedUsers?.length || 0} mock users`);

  // Create bankrolls for all mock users
  if (insertedUsers && insertedUsers.length > 0) {
    const bankrolls = insertedUsers.map((user) => ({
      user_id: user.id,
      balance: 100000, // $1,000 starting balance
      win_count: 0,
      loss_count: 0,
      total_wagered: 0,
      total_won: 0,
    }));

    const { error: bankrollError } = await supabase.from('bankrolls').insert(bankrolls);
    if (bankrollError) {
      console.error('Error creating bankrolls:', bankrollError);
    }
  }

  return insertedUsers || [];
}

// Run the seeder
generateMockUsers();
