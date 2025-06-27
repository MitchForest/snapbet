#!/usr/bin/env bun

/**
 * Cleanup orchestrator - removes all mock data
 *
 * Usage: bun run scripts/mock/orchestrators/cleanup.ts
 */

import { supabase } from '../../supabase-client';

async function cleanup() {
  console.log('🧹 Starting Mock Data Cleanup\n');
  console.log('This will remove:');
  console.log('  ❌ All mock user posts and stories');
  console.log('  ❌ All mock user messages');
  console.log('  ❌ All mock user bets');
  console.log('  ❌ All reactions and comments from mock users');
  console.log('  ❌ All follow relationships with mock users\n');

  const confirm = process.argv.includes('--confirm');
  if (!confirm) {
    console.log('⚠️  Add --confirm to proceed with cleanup');
    process.exit(0);
  }

  try {
    // Get all mock user IDs
    const { data: mockUsers, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('is_mock', true);

    if (userError || !mockUsers) {
      console.error('❌ Error fetching mock users:', userError);
      return;
    }

    const mockUserIds = mockUsers.map((u) => u.id);
    console.log(`Found ${mockUserIds.length} mock users to clean up\n`);

    // Delete in order to respect foreign key constraints
    const cleanupSteps = [
      {
        name: 'Reactions',
        table: 'reactions',
        column: 'user_id',
      },
      {
        name: 'Comments',
        table: 'comments',
        column: 'user_id',
      },
      {
        name: 'Pick Actions',
        table: 'pick_actions',
        column: 'user_id',
      },
      {
        name: 'Story Views',
        table: 'story_views',
        column: 'viewer_id',
      },
      {
        name: 'Messages',
        table: 'messages',
        column: 'sender_id',
      },
      {
        name: 'Posts',
        table: 'posts',
        column: 'user_id',
      },
      {
        name: 'Stories',
        table: 'stories',
        column: 'user_id',
      },
      {
        name: 'Bets',
        table: 'bets',
        column: 'user_id',
      },
      {
        name: 'Notifications',
        table: 'notifications',
        column: 'user_id',
      },
      {
        name: 'Follow Relationships',
        table: 'follows',
        column: 'follower_id',
      },
      {
        name: 'Follow Relationships (Following)',
        table: 'follows',
        column: 'following_id',
      },
      {
        name: 'Chat Memberships',
        table: 'chat_members',
        column: 'user_id',
      },
    ];

    for (const step of cleanupSteps) {
      console.log(`🗑️  Cleaning ${step.name}...`);
      // @ts-expect-error - dynamic table name
      const { error } = await supabase.from(step.table).delete().in(step.column, mockUserIds);

      if (error) {
        console.error(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Complete`);
      }
    }

    // Clean up empty group chats (where all members were mock users)
    console.log('\n🗑️  Cleaning empty group chats...');
    const { data: emptyChats } = await supabase
      .from('chats')
      .select('id')
      .eq('chat_type', 'group')
      .not('chat_members', 'inner', null);

    if (emptyChats) {
      for (const chat of emptyChats) {
        const { data: members } = await supabase
          .from('chat_members')
          .select('user_id')
          .eq('chat_id', chat.id);

        if (!members || members.length === 0) {
          await supabase.from('chats').delete().eq('id', chat.id);
        }
      }
    }

    console.log('\n✨ Mock data cleanup complete!');
    console.log('\nNote: Mock users themselves are preserved for future use.');
    console.log('To set up mock data again: bun run scripts/mock/orchestrators/setup.ts\n');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanup();
