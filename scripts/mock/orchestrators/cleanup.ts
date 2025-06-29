#!/usr/bin/env bun

/**
 * Cleanup orchestrator - removes ALL data for a fresh start
 *
 * Usage: bun run mock:cleanup
 *
 * This will completely reset the database to allow a fresh mock setup
 */

import { supabase } from '../../supabase-client';

async function cleanup() {
  console.log('🧹 Starting COMPLETE Data Cleanup\n');
  console.log('This will remove:');
  console.log('  ❌ ALL posts (including historical)');
  console.log('  ❌ ALL stories');
  console.log('  ❌ ALL games');
  console.log('  ❌ ALL bets');
  console.log('  ❌ ALL messages and chats');
  console.log('  ❌ ALL reactions and comments');
  console.log('  ❌ ALL notifications');
  console.log('  ❌ ALL follow relationships');
  console.log('  ❌ ALL pick actions');
  console.log('  ❌ ALL mock users');
  console.log('  ❌ ALL embeddings');
  console.log('  ❌ Reset all bankrolls to $1,000\n');

  const confirm = process.argv.includes('--confirm');
  if (!confirm) {
    console.log('⚠️  Add --confirm to proceed with cleanup');
    process.exit(0);
  }

  try {
    // Delete in order of dependencies
    console.log('🗑️  Deleting all reactions...');
    const { error: reactionsError } = await supabase
      .from('reactions')
      .delete()
      .gte('created_at', '1900-01-01');
    if (reactionsError) throw reactionsError;
    console.log('   ✅ Complete');

    console.log('🗑️  Deleting all comments...');
    const { error: commentsError } = await supabase
      .from('comments')
      .delete()
      .gte('created_at', '1900-01-01');
    if (commentsError) throw commentsError;
    console.log('   ✅ Complete');

    console.log('🗑️  Deleting all pick actions...');
    const { error: pickActionsError } = await supabase
      .from('pick_actions')
      .delete()
      .gte('created_at', '1900-01-01');
    if (pickActionsError) throw pickActionsError;
    console.log('   ✅ Complete');

    console.log('🗑️  Deleting all story views...');
    const { error: storyViewsError } = await supabase
      .from('story_views')
      .delete()
      .gte('viewed_at', '1900-01-01');
    if (storyViewsError) throw storyViewsError;
    console.log('   ✅ Complete');

    console.log('🗑️  Deleting all stories...');
    const { error: storiesError } = await supabase
      .from('stories')
      .delete()
      .gte('created_at', '1900-01-01');
    if (storiesError) throw storiesError;
    console.log('   ✅ Complete');

    console.log('🗑️  Deleting all posts (including archived)...');
    const { error: postsError } = await supabase
      .from('posts')
      .delete()
      .gte('created_at', '1900-01-01');
    if (postsError) throw postsError;
    console.log('   ✅ Complete');

    console.log('🗑️  Deleting all bets...');
    const { error: betsError } = await supabase
      .from('bets')
      .delete()
      .gte('created_at', '1900-01-01');
    if (betsError) throw betsError;
    console.log('   ✅ Complete');

    console.log('🗑️  Deleting all games...');
    const { error: gamesError } = await supabase
      .from('games')
      .delete()
      .gte('created_at', '1900-01-01');
    if (gamesError) throw gamesError;
    console.log('   ✅ Complete');

    console.log('🗑️  Deleting all messages...');
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .gte('created_at', '1900-01-01');
    if (messagesError) throw messagesError;
    console.log('   ✅ Complete');

    console.log('🗑️  Deleting all chat members...');
    const { error: chatMembersError } = await supabase
      .from('chat_members')
      .delete()
      .gte('joined_at', '1900-01-01');
    if (chatMembersError) throw chatMembersError;
    console.log('   ✅ Complete');

    console.log('🗑️  Deleting all chats...');
    const { error: chatsError } = await supabase
      .from('chats')
      .delete()
      .gte('created_at', '1900-01-01');
    if (chatsError) throw chatsError;
    console.log('   ✅ Complete');

    console.log('🗑️  Deleting all notifications...');
    const { error: notificationsError } = await supabase
      .from('notifications')
      .delete()
      .gte('created_at', '1900-01-01');
    if (notificationsError) throw notificationsError;
    console.log('   ✅ Complete');

    console.log('🗑️  Deleting all follow relationships...');
    const { error: followsError } = await supabase
      .from('follows')
      .delete()
      .gte('created_at', '1900-01-01');
    if (followsError) throw followsError;
    console.log('   ✅ Complete');

    console.log('🗑️  Deleting all user badges...');
    const { error: badgesError } = await supabase
      .from('user_badges')
      .delete()
      .gte('earned_at', '1900-01-01');
    if (badgesError) throw badgesError;
    console.log('   ✅ Complete');

    console.log('🗑️  Clearing all user embeddings...');
    const { error: embeddingsError } = await supabase
      .from('users')
      .update({
        profile_embedding: null,
        last_embedding_update: null,
      })
      .not('id', 'is', null); // Update all users
    if (embeddingsError) throw embeddingsError;
    console.log('   ✅ Complete');

    console.log('🗑️  Deleting all mock users...');
    const { error: mockUsersError } = await supabase.from('users').delete().eq('is_mock', true);
    if (mockUsersError) throw mockUsersError;
    console.log('   ✅ Complete');

    console.log('💰 Resetting all bankrolls to $1,000...');
    const { error: bankrollError } = await supabase
      .from('bankrolls')
      .update({
        balance: 100000,
        win_count: 0,
        loss_count: 0,
        total_wagered: 0,
        total_won: 0,
        stats_metadata: {},
      })
      .gte('created_at', '1900-01-01');
    if (bankrollError) throw bankrollError;
    console.log('   ✅ Complete');

    console.log('\n✨ Complete cleanup finished!');
    console.log('\nYour app now has:');
    console.log('  ✅ No posts or stories');
    console.log('  ✅ No games or bets');
    console.log('  ✅ No chats or messages');
    console.log('  ✅ No notifications');
    console.log('  ✅ No mock users');
    console.log('  ✅ No embeddings');
    console.log('  ✅ Fresh $1,000 bankroll');
    console.log('\nTo set up mock data: bun run mock:setup --username=YOUR_USERNAME\n');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanup();
