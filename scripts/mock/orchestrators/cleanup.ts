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
  console.log('  ❌ All follow relationships with mock users');
  console.log('  ❌ All messages in chats with mock users');
  console.log('  ❌ All broken/empty chats\n');

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

    // First, get all chats that have mock users as members
    console.log('🗑️  Finding chats with mock users...');
    const { data: chatsWithMockUsers } = await supabase
      .from('chat_members')
      .select('chat_id')
      .in('user_id', mockUserIds);

    const chatIdsToClean = [...new Set(chatsWithMockUsers?.map((c) => c.chat_id) || [])];
    console.log(`   Found ${chatIdsToClean.length} chats with mock users`);

    // Delete all messages in these chats
    if (chatIdsToClean.length > 0) {
      console.log('🗑️  Cleaning messages in chats with mock users...');
      const { error: msgError } = await supabase
        .from('messages')
        .delete()
        .in('chat_id', chatIdsToClean);

      if (msgError) {
        console.error(`   ❌ Error: ${msgError.message}`);
      } else {
        console.log(`   ✅ Complete`);
      }
    }

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
        name: 'Messages from mock users',
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

    // Clean up broken chats (DMs with != 2 members or groups with < 2 members)
    console.log('\n🗑️  Cleaning broken chats...');

    // Get all chats with their member counts
    const { data: allChats } = await supabase.from('chats').select(`
        id,
        chat_type,
        chat_members!inner(user_id)
      `);

    if (allChats) {
      const brokenChats = allChats.filter((chat) => {
        const memberCount = chat.chat_members?.length || 0;
        return (
          (chat.chat_type === 'dm' && memberCount !== 2) ||
          (chat.chat_type === 'group' && memberCount < 2)
        );
      });

      if (brokenChats.length > 0) {
        const brokenChatIds = brokenChats.map((c) => c.id);

        // Delete messages first
        await supabase.from('messages').delete().in('chat_id', brokenChatIds);

        // Delete the chats (cascade will handle members)
        const { error } = await supabase.from('chats').delete().in('id', brokenChatIds);

        if (error) {
          console.error(`   ❌ Error deleting broken chats: ${error.message}`);
        } else {
          console.log(`   ✅ Deleted ${brokenChats.length} broken chats`);
        }
      } else {
        console.log('   ✅ No broken chats found');
      }
    }

    // Clean up empty chats where all members were removed
    console.log('\n🗑️  Cleaning empty chats...');
    const { data: emptyChats } = await supabase.from('chats').select(`
        id,
        chat_members(user_id)
      `);

    if (emptyChats) {
      const trulyEmptyChats = emptyChats.filter(
        (chat) => !chat.chat_members || chat.chat_members.length === 0
      );

      if (trulyEmptyChats.length > 0) {
        const emptyChatIds = trulyEmptyChats.map((c) => c.id);
        await supabase.from('chats').delete().in('id', emptyChatIds);
        console.log(`   ✅ Deleted ${trulyEmptyChats.length} empty chats`);
      } else {
        console.log('   ✅ No empty chats found');
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
