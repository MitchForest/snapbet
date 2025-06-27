#!/usr/bin/env bun

/**
 * Seeds mock users into the database with avatar URLs
 */

import { supabase } from '../../supabase-client';
import { MOCK_USERS } from '../data/users';

async function seedMockUsers() {
  console.log('🌱 Seeding mock users with avatars...');

  try {
    // Insert or update mock users
    for (const mockUser of MOCK_USERS) {
      // First, create/update the user
      const { error: userError } = await supabase.from('users').upsert(
        {
          id: mockUser.id,
          username: mockUser.username,
          display_name: mockUser.full_name,
          avatar_url: mockUser.avatar_url,
          bio: mockUser.bio,
          is_private: mockUser.is_private,
          is_mock: true,
          mock_personality_id: mockUser.personality,
          email: `${mockUser.username}@mock.snapbet.ai`,
          oauth_provider: 'google',
          oauth_id: `mock-${mockUser.id}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
        }
      );

      if (userError) {
        console.error(`❌ Error seeding user ${mockUser.username}:`, userError);
        continue;
      }

      // Then create/update their bankroll
      const { error: bankrollError } = await supabase.from('bankrolls').upsert(
        {
          user_id: mockUser.id,
          balance: mockUser.bankroll * 100, // Convert to cents
          season_high: mockUser.bankroll * 100,
          season_low: mockUser.bankroll * 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );

      if (bankrollError) {
        console.error(`❌ Error creating bankroll for ${mockUser.username}:`, bankrollError);
      } else {
        console.log(
          `✅ Seeded user: @${mockUser.username} with avatar and $${mockUser.bankroll} bankroll`
        );
      }
    }

    console.log(`\n✨ Successfully seeded ${MOCK_USERS.length} mock users with avatars!`);
  } catch (error) {
    console.error('❌ Error seeding mock users:', error);
    process.exit(1);
  }
}

// Run the seeder
seedMockUsers();
