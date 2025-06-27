#!/usr/bin/env bun

import { supabase } from '@/services/supabase/client';
import { clearRecentActivity } from './activity-generator';
import {
  messageTemplates,
  postTemplates,
  conversationStarters,
  getRandomTemplate,
  fillTemplate,
  getPersonalityFromBehavior,
  mockMediaUrls,
} from './templates';
import type { Database } from '@/types/supabase-generated';

type Tables = Database['public']['Tables'];
type MockUser = Tables['users']['Row'] & { is_mock: true };

// Generate recent posts for new user experience
async function generateRecentPosts(count: number = 5) {
  const { data: mockUsers } = await supabase
    .from('users')
    .select('*')
    .eq('is_mock', true)
    .limit(count * 2); // Get more users for variety

  if (!mockUsers) return;

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  for (let i = 0; i < Math.min(count, mockUsers.length); i++) {
    const user = mockUsers[i];

    // Create post with timestamp in last hour
    const postTime = new Date(oneHourAgo.getTime() + i * 10 * 60 * 1000); // Space out by 10 mins

    // Mix of pick and reaction posts
    const isPickPost = i % 2 === 0;

    if (isPickPost) {
      // Create a mock bet first
      const { data: bet } = await supabase
        .from('bets')
        .insert({
          user_id: user.id,
          game_id: '401234567', // Mock game ID
          bet_type: 'spread' as const,
          bet_details: { team: 'Lakers', spread: -5.5 },
          stake: 100,
          odds: -110,
          potential_win: 90.91,
          status: 'pending' as const,
          created_at: postTime.toISOString(),
        })
        .select()
        .single();

      if (bet) {
        const template = getRandomTemplate(postTemplates['pick-share'].confident);
        const caption = fillTemplate(template, {
          team: 'Lakers',
          spread: '-5.5',
          odds: '-110',
          type: 'spread',
          line: '-5.5',
        });

        await supabase.from('posts').insert({
          user_id: user.id,
          caption,
          media_url: mockMediaUrls.reaction[0],
          media_type: 'photo' as const,
          post_type: 'pick',
          bet_id: bet.id,
          created_at: postTime.toISOString(),
          expires_at: new Date(postTime.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    } else {
      // Reaction post
      const templates = postTemplates['reaction'].exciting;
      const caption = getRandomTemplate(templates);

      await supabase.from('posts').insert({
        user_id: user.id,
        caption,
        media_url:
          mockMediaUrls.reaction[Math.floor(Math.random() * mockMediaUrls.reaction.length)],
        media_type: 'photo' as const,
        post_type: 'content',
        created_at: postTime.toISOString(),
        expires_at: new Date(postTime.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  console.log(`📝 Generated ${count} recent posts`);
}

// Generate an active group chat
async function generateActiveChat() {
  // Find or create a demo group chat
  const chatName = 'NBA Degens 🏀';

  let { data: chat } = await supabase
    .from('chats')
    .select('*')
    .eq('chat_type', 'group')
    .eq('name', chatName)
    .single();

  if (!chat) {
    // Create the chat
    const { data: newChat } = await supabase
      .from('chats')
      .insert({
        chat_type: 'group' as const,
        name: chatName,
        created_by: null,
      })
      .select()
      .single();

    chat = newChat;
  }

  if (!chat) return;

  // Add mock users to chat if not already members
  const { data: mockUsers } = await supabase.from('users').select('*').eq('is_mock', true).limit(5);

  if (!mockUsers) return;

  for (const user of mockUsers) {
    await supabase.from('chat_members').upsert({
      chat_id: chat.id,
      user_id: user.id,
      role: 'member' as const,
    });
  }

  // Generate recent messages
  await generateChatMessages(chat, 10, mockUsers as MockUser[]);

  console.log(`💬 Generated active chat: ${chatName}`);
}

// Generate chat messages
async function generateChatMessages(
  chat: Tables['chats']['Row'],
  count: number = 20,
  users?: MockUser[]
) {
  if (!users) {
    // Get chat members
    const { data: members } = await supabase
      .from('chat_members')
      .select('user:users(*)')
      .eq('chat_id', chat.id);

    users = (members?.map((m) => m.user).filter((u) => u?.is_mock) as MockUser[]) || [];
  }

  if (users.length === 0) return;

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  // Start a conversation
  const starter = getRandomTemplate(conversationStarters['game-discussion']);
  const firstMessage = fillTemplate(starter, {
    team: 'Lakers',
    opponent: 'Celtics',
  });

  await supabase.from('messages').insert({
    chat_id: chat.id,
    sender_id: users[0].id,
    content: firstMessage,
    message_type: 'text',
    created_at: fiveMinutesAgo.toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Generate follow-up messages
  for (let i = 1; i < Math.min(count, users.length * 3); i++) {
    const user = users[i % users.length];
    const personality = getPersonalityFromBehavior(user.mock_personality_id || '');
    const templates =
      messageTemplates[personality as keyof typeof messageTemplates] || messageTemplates['degen'];

    const messageTime = new Date(fiveMinutesAgo.getTime() + i * 20 * 1000); // 20 seconds apart
    const template = getRandomTemplate(templates.discussion || templates.greeting);
    const content = fillTemplate(template, {
      team: 'Lakers',
      game: 'Lakers vs Celtics',
    });

    await supabase.from('messages').insert({
      chat_id: chat.id,
      sender_id: user.id,
      content,
      message_type: 'text',
      created_at: messageTime.toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  console.log(`💬 Generated ${count} messages in chat`);
}

// Generate betting rush for game day
async function generateBettingRush(sport: 'NFL' | 'NBA', userCount: number = 10) {
  const { data: mockUsers } = await supabase
    .from('users')
    .select('*')
    .eq('is_mock', true)
    .limit(userCount);

  if (!mockUsers) return;

  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  for (let i = 0; i < mockUsers.length; i++) {
    const user = mockUsers[i];
    const betTime = new Date(thirtyMinutesAgo.getTime() + i * 3 * 60 * 1000); // 3 mins apart

    // Create a bet
    await supabase.from('bets').insert({
      user_id: user.id,
      game_id: sport === 'NFL' ? '401234567' : '401234568',
      bet_type: ['spread', 'total', 'moneyline'][i % 3] as Database['public']['Enums']['bet_type'],
      bet_details: {
        team: ['Chiefs', 'Bills', 'Cowboys', 'Eagles'][i % 4],
        spread: [-3.5, -7, +3.5, +7][i % 4],
      },
      stake: [50, 100, 200][i % 3],
      odds: [-110, -105, -115][i % 3],
      potential_win: 90.91,
      status: 'pending' as const,
      created_at: betTime.toISOString(),
    });
  }

  console.log(`🎲 Generated ${userCount} ${sport} bets`);
}

// Generate pick posts
async function generatePickPosts(count: number = 5) {
  const { data: recentBets } = await supabase
    .from('bets')
    .select('*, user:users(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(count);

  if (!recentBets) return;

  for (const bet of recentBets) {
    if (!bet.user?.is_mock) continue;

    const template = getRandomTemplate(postTemplates['pick-share'].normal);
    const caption = fillTemplate(template, {
      team: (bet.bet_details as { team?: string; spread?: number }).team || 'Lakers',
      spread: `${((bet.bet_details as { spread?: number }).spread || 0) > 0 ? '+' : ''}${(bet.bet_details as { spread?: number }).spread || 0}`,
      odds: `${bet.odds > 0 ? '+' : ''}${bet.odds}`,
      type: bet.bet_type,
      line: (bet.bet_details as { spread?: number }).spread?.toString() || '-5.5',
      confidence: 'medium',
    });

    await supabase.from('posts').insert({
      user_id: bet.user_id,
      caption,
      media_url: mockMediaUrls.reaction[0],
      media_type: 'photo' as const,
      post_type: 'pick',
      bet_id: bet.id,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  console.log(`📊 Generated ${count} pick posts`);
}

// Generate group discussion
async function generateGroupDiscussion(topic: 'game-day' | 'bad-beat' | 'celebration') {
  const chatName = topic === 'game-day' ? 'Saturday Squad 🏈' : 'Degen Support Group 🫂';

  // Create or find chat
  let { data: chat } = await supabase
    .from('chats')
    .select('*')
    .eq('chat_type', 'group')
    .eq('name', chatName)
    .single();

  if (!chat) {
    const { data: newChat } = await supabase
      .from('chats')
      .insert({
        chat_type: 'group' as const,
        name: chatName,
        created_by: null,
      })
      .select()
      .single();

    chat = newChat;
  }

  if (!chat) return;

  // Add users and generate themed messages
  const { data: mockUsers } = await supabase.from('users').select('*').eq('is_mock', true).limit(8);

  if (!mockUsers) return;

  for (const user of mockUsers) {
    await supabase.from('chat_members').upsert({
      chat_id: chat.id,
      user_id: user.id,
      role: 'member' as const,
    });
  }

  await generateChatMessages(chat, 15, mockUsers as MockUser[]);

  console.log(`💬 Generated ${topic} discussion in ${chatName}`);
}

// Main demo preparation function
export async function prepareDemo(scenario: 'new-user' | 'saturday-football' | 'active-chat') {
  console.log(`🎬 Preparing ${scenario} demo...`);

  switch (scenario) {
    case 'new-user':
      // Clear old activity, generate fresh content
      await clearRecentActivity(24);
      await generateRecentPosts(5);
      await generateActiveChat();
      break;

    case 'saturday-football':
      // Pre-game betting rush
      await clearRecentActivity(3); // Keep some older content
      await generateBettingRush('NFL', 10);
      await generatePickPosts(5);
      await generateGroupDiscussion('game-day');
      break;

    case 'active-chat': {
      // Recent chat activity
      const { data: chat } = await supabase
        .from('chats')
        .select('*')
        .eq('name', 'NBA Degens 🏀')
        .single();

      if (chat) {
        await generateChatMessages(chat, 20);
      } else {
        await generateActiveChat();
      }
      break;
    }
  }

  console.log(`✅ ${scenario} demo ready!`);
}

// CLI execution
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const scenario = process.argv[2] as 'new-user' | 'saturday-football' | 'active-chat';

  if (!scenario || !['new-user', 'saturday-football', 'active-chat'].includes(scenario)) {
    console.error(
      'Usage: bun run scripts/mock/demo-scenarios.ts <new-user|saturday-football|active-chat>'
    );
    process.exit(1);
  }

  await prepareDemo(scenario);
}
