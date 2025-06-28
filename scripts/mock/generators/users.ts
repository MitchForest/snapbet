#!/usr/bin/env bun

/**
 * Seeds mock users into the database with avatar URLs
 */

import { supabase } from '../../supabase-client';
import type { Database } from '@/types/database';
import { mockUsers } from '../data/users';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];

export async function generateMockUsers(): Promise<User[]> {
  console.log('👥 Creating mock users...');

  // Check if users already exist
  const { data: existingUsers } = await supabase
    .from('users')
    .select('*')
    .in(
      'username',
      mockUsers.map((u) => u.username)
    );

  if (existingUsers && existingUsers.length === mockUsers.length) {
    console.log(`  ⚠️  Found all ${existingUsers.length} mock users, using existing...`);
    return existingUsers;
  }

  // Delete any partial existing users to start fresh
  if (existingUsers && existingUsers.length > 0) {
    console.log(
      `  ⚠️  Found ${existingUsers.length} existing mock users, removing to start fresh...`
    );
    const existingIds = existingUsers.map((u) => u.id);
    await supabase.from('users').delete().in('id', existingIds);
  }

  // Create users
  const usersToCreate = mockUsers.map((user, index) => {
    // Make some users very recent for "rising stars"
    let createdAt: Date;
    if (index < 5) {
      // First 5 users created in last 3 days
      createdAt = new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000);
    } else if (index < 10) {
      // Next 5 users created in last week
      createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    } else {
      // Rest created over last month
      createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    }

    return {
      id: crypto.randomUUID(),
      username: user.username,
      display_name: user.display_name,
      email: `${user.username}@snapbet-mock.com`,
      avatar_url: user.avatar_url,
      bio: user.bio,
      favorite_team: user.favorite_team,
      is_private: false,
      is_mock: true, // Important: mark as mock users
      mock_personality_id: user.personality,
      oauth_id: `mock_${user.username}`,
      oauth_provider: 'google' as const,
      created_at: createdAt.toISOString(),
    };
  });

  const { data: createdUsers, error } = await supabase.from('users').insert(usersToCreate).select();

  if (error) {
    console.error('Error creating mock users:', error);
    return [];
  }

  // Initialize bankrolls
  if (createdUsers) {
    const bankrolls = createdUsers.map((user) => ({
      user_id: user.id,
      balance: 100000, // $1,000 (100000 cents)
      win_count: 0,
      loss_count: 0,
      total_wagered: 0,
      total_won: 0,
    }));

    await supabase.from('bankrolls').insert(bankrolls);
  }

  console.log(`  ✅ Created ${createdUsers?.length || 0} mock users`);
  return createdUsers || [];
}

// Run the seeder
generateMockUsers();
