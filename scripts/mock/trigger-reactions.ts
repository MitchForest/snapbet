#!/usr/bin/env bun

/**
 * Trigger mock reactions to recent user activity
 * This simulates the community responding to your posts/bets
 */

import { supabase } from '@/services/supabase/client';
import {
  messageTemplates,
  getRandomTemplate,
  fillTemplate,
  getPersonalityFromBehavior,
} from './templates';
import type { Database } from '@/types/supabase-generated';

type Tables = Database['public']['Tables'];
type MockUser = Tables['users']['Row'] & { is_mock: true };

// Get current user's recent activity
async function getUserRecentActivity(userId: string) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Get recent posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', oneDayAgo)
    .order('created_at', { ascending: false });

  // Get recent bets
  const { data: bets } = await supabase
    .from('bets')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', oneDayAgo)
    .order('created_at', { ascending: false });

  return { posts: posts || [], bets: bets || [] };
}

// Generate reactions to a specific post
async function generatePostReactions(post: Tables['posts']['Row'], mockUsers: MockUser[]) {
  console.log(`\n📝 Generating reactions for your ${post.post_type} post...`);

  // Number of reactions based on post type
  const reactionCount =
    post.post_type === 'pick'
      ? 3 + Math.floor(Math.random() * 5)
      : 2 + Math.floor(Math.random() * 3);

  // Shuffle mock users
  const reactingUsers = mockUsers.sort(() => Math.random() - 0.5).slice(0, reactionCount);

  for (const user of reactingUsers) {
    const personality = getPersonalityFromBehavior(user.mock_personality_id || '');

    // 60% chance of reaction emoji
    if (Math.random() < 0.6) {
      const reactionMap: Record<string, string[]> = {
        'sharp-bettor': ['💯', '📊', '✅'],
        degen: ['🔥', '🚀', '💪'],
        'fade-material': ['😤', '🤡', '😂'],
        contrarian: ['🤔', '🎣', '📉'],
        homer: ['❤️', '💜', '🏆'],
        'live-bettor': ['👀', '📺', '⚡'],
        'parlay-degen': ['🎰', '🤞', '🌙'],
      };

      const emojis = reactionMap[personality] || reactionMap['degen'];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];

      await supabase.from('reactions').insert({
        post_id: post.id,
        user_id: user.id,
        emoji,
      });

      console.log(`  ${emoji} ${user.username} reacted`);
    }

    // 40% chance of comment
    if (Math.random() < 0.4) {
      const templates =
        messageTemplates[personality as keyof typeof messageTemplates] || messageTemplates['degen'];
      const comment =
        post.post_type === 'pick'
          ? getRandomTemplate(templates.discussion || templates.greeting)
          : getRandomTemplate(templates.reaction || templates.greeting);

      const filledComment = fillTemplate(comment, {
        team: 'your team',
        game: 'this game',
      });

      await supabase.from('comments').insert({
        post_id: post.id,
        user_id: user.id,
        content: filledComment,
      });

      console.log(`  💬 ${user.username}: "${filledComment}"`);
    }

    // For pick posts, 50% chance of tail/fade
    if (post.post_type === 'pick' && Math.random() < 0.5) {
      const fadePersonalities = ['contrarian', 'fade-material'];
      const shouldFade = fadePersonalities.includes(personality)
        ? Math.random() < 0.7
        : Math.random() < 0.3;
      const action = shouldFade ? 'fade' : 'tail';

      await supabase.from('pick_actions').insert({
        post_id: post.id,
        user_id: user.id,
        action_type: action as Database['public']['Enums']['pick_action'],
      });

      console.log(`  ${action === 'tail' ? '👥' : '🚫'} ${user.username} ${action}ed your pick`);
    }
  }
}

// Generate chat messages about user's activity
async function generateChatDiscussion(
  activity: { posts: Tables['posts']['Row'][]; bets: Tables['bets']['Row'][] },
  mockUsers: MockUser[]
) {
  if (activity.posts.length === 0 && activity.bets.length === 0) return;

  console.log('\n💬 Generating chat discussions about your activity...');

  // Find a relevant chat
  const { data: chats } = await supabase
    .from('chats')
    .select('id, name')
    .eq('chat_type', 'group')
    .limit(1);

  if (!chats || chats.length === 0) return;

  const chat = chats[0];
  const discussingUsers = mockUsers.sort(() => Math.random() - 0.5).slice(0, 3);

  for (const user of discussingUsers) {
    const personality = getPersonalityFromBehavior(user.mock_personality_id || '');
    const templates =
      messageTemplates[personality as keyof typeof messageTemplates] || messageTemplates['degen'];

    let message = '';
    if (activity.posts.some((p) => p.post_type === 'pick')) {
      message = getRandomTemplate([
        'Anyone tailing that new pick?',
        'Thoughts on the latest play?',
        'That pick looking good 👀',
        'Interesting angle on that bet',
      ]);
    } else {
      message = getRandomTemplate(templates.greeting);
    }

    await supabase.from('messages').insert({
      chat_id: chat.id,
      sender_id: user.id,
      content: message,
      message_type: 'text',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    console.log(`  💬 ${user.username} in "${chat.name}": "${message}"`);
  }
}

// Main trigger function
async function triggerReactions() {
  console.log('🎯 Triggering community reactions to your activity...\n');

  try {
    // Get current user
    const userId = process.argv.find((arg) => arg.startsWith('--user-id='))?.split('=')[1];
    if (!userId) {
      console.error('❌ Please provide user ID: --user-id=YOUR_USER_ID');
      process.exit(1);
    }

    // Get user's recent activity
    const activity = await getUserRecentActivity(userId);

    if (activity.posts.length === 0 && activity.bets.length === 0) {
      console.log('ℹ️  No recent activity found. Create some posts or bets first!');
      return;
    }

    console.log(`Found ${activity.posts.length} posts and ${activity.bets.length} bets`);

    // Get mock users
    const { data: mockUsers } = await supabase.from('users').select('*').eq('is_mock', true);

    if (!mockUsers || mockUsers.length === 0) {
      console.error('❌ No mock users found');
      process.exit(1);
    }

    // Generate reactions for each post
    for (const post of activity.posts) {
      await generatePostReactions(post, mockUsers as MockUser[]);
    }

    // Generate chat discussions
    await generateChatDiscussion(activity, mockUsers as MockUser[]);

    console.log('\n✅ Community reactions generated!');
  } catch (error) {
    console.error('❌ Error generating reactions:', error);
    process.exit(1);
  }
}

// Run the script
triggerReactions();
