#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { PersonalityType } from './data/mock-users';

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

// Caption templates by personality
const captionTemplates: Record<PersonalityType, string[]> = {
  [PersonalityType.SHARP_BETTOR]: [
    'Line value at {team} {line}. Books sleeping on this one.',
    'Taking {team} before the line moves. Trust the process.',
    '{team} matches up perfectly here. Love the spot.',
  ],
  [PersonalityType.SQUARE_BETTOR]: [
    '{team} is on fire! Taking them to cover easily! 🔥',
    'Primetime game = primetime bet! {team} ML all day!',
    "Everyone's on {team} for a reason. Let's ride! 🚀",
  ],
  [PersonalityType.FADE_MATERIAL]: [
    "My lock of the century: {team} {line} 🔒 (I'm 2-15 this week)",
    'Mortgage payment on {team}! What could go wrong? 😅',
    'If you want to win, take the opposite of this pick 🤡',
  ],
  [PersonalityType.PARLAY_DEGEN]: [
    'Just need {team} to hit for my 12-legger! $20 to win $8,543 🎰',
    'Adding {team} to make it a 10-leg parlay. Go big or go home!',
    'Why bet one game when you can bet ALL the games? 💎',
  ],
  [PersonalityType.CHALK_EATER]: [
    '{team} at {line}? Free money. Slow and steady wins.',
    'Only taking favorites. {team} ML is the safest bet today.',
    "I don't do risk. {team} -400 ML locked in.",
  ],
  [PersonalityType.DOG_LOVER]: [
    "{team} getting {line} points? I'll take that all day! 🐕",
    'Plus money on {team}? Count me in! Underdogs bark loudest.',
    'Everyone fading {team} = perfect spot to take them.',
  ],
  [PersonalityType.CONTRARIAN]: [
    '85% of money on the favorite? Taking {team} with the points.',
    'When everyone zigs, I zag. {team} +{line} locked.',
    'Fading the public as always. {team} is the play.',
  ],
  [PersonalityType.HOMER]: [
    '{team} by a million! This is our year! 💜💛',
    "Don't care about the spread, {team} ML every game!",
    "If you're not with {team}, you're against us!",
  ],
  [PersonalityType.LIVE_BETTOR]: [
    'Waiting for the game to start before placing anything.',
    'Live betting only. Need to see the flow first.',
    'Pre-game lines are for suckers. See you at halftime.',
  ],
  [PersonalityType.ENTERTAINMENT]: [
    'Throwing $20 on {team} because why not? 🎉',
    'Small bet on {team} to make the game more fun!',
    "Vibes say {team} covers. That's my analysis. ✨",
  ],
  [PersonalityType.TREND_FOLLOWER]: [
    "{team} has covered 5 straight. Trends continue until they don't!",
    'Hot teams stay hot. {team} is on a heater! 🔥',
    '{team} is 8-2 ATS last 10. Following the trend.',
  ],
  [PersonalityType.CASUAL]: [
    "Weekend bet: {team} {line}. Let's have some fun!",
    'Casual bet on {team} while watching with friends 🍺',
    'Small play on {team}. Just here for entertainment!',
  ],
};

// Generate a caption based on personality and bet
function generateCaption(personality: PersonalityType, team: string, line: string): string {
  const templates = captionTemplates[personality] || captionTemplates[PersonalityType.CASUAL];
  const template = templates[Math.floor(Math.random() * templates.length)];

  return template.replace('{team}', team).replace('{line}', line);
}

async function generateActivity() {
  console.log('🎬 Generating mock user activity...\n');

  try {
    // Get mock users
    const { data: mockUsers, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('is_mock', true);

    if (usersError || !mockUsers) {
      console.error('❌ Error fetching mock users:', usersError);
      return;
    }

    console.log(`Found ${mockUsers.length} mock users`);

    // Get recent games to bet on
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'scheduled')
      .order('commence_time', { ascending: true })
      .limit(10);

    if (gamesError || !games) {
      console.error('❌ Error fetching games:', gamesError);
      return;
    }

    console.log(`Found ${games.length} upcoming games`);

    // Generate 5-10 posts
    const postCount = Math.floor(Math.random() * 6) + 5;
    let postsCreated = 0;

    console.log(`\n📸 Creating ${postCount} posts...`);

    for (let i = 0; i < postCount; i++) {
      const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const game = games[Math.floor(Math.random() * games.length)];

      if (!user.mock_personality_id) continue;

      // Create a bet
      const betType = Math.random() > 0.7 ? 'moneyline' : 'spread';
      const team = Math.random() > 0.5 ? game.home_team : game.away_team;
      const line = betType === 'spread' ? (Math.random() * 10 - 5).toFixed(1) : 'ML';
      const stake = Math.floor(Math.random() * 5000) + 1000; // $10-$50

      const betDetails = {
        team: team,
        line: betType === 'spread' ? parseFloat(line) : undefined,
        odds: -110,
      };

      // Create the bet
      const { data: bet, error: betError } = await supabase
        .from('bets')
        .insert({
          user_id: user.id,
          game_id: game.id,
          bet_type: betType,
          bet_details: betDetails,
          stake: stake,
          odds: -110,
          potential_win: Math.floor((stake * 100) / 110),
          expires_at: game.commence_time,
        })
        .select()
        .single();

      if (betError || !bet) continue;

      // Create a post about the bet
      const caption = generateCaption(user.mock_personality_id as PersonalityType, team, line);

      const { error: postError } = await supabase.from('posts').insert({
        user_id: user.id,
        bet_id: bet.id,
        media_url: `mock://betslip/${bet.id}`,
        media_type: 'photo' as const,
        caption: caption,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      if (!postError) {
        postsCreated++;
        console.log(`  ✓ ${user.username}: "${caption}"`);
      }
    }

    console.log(`\n✅ Created ${postsCreated} posts`);

    // Create group chats
    console.log('\n💬 Creating group chats...');

    const groupChats = [
      { name: 'NBA Degens 🏀', memberCount: 10 },
      { name: 'Parlay Squad 🎰', memberCount: 6 },
      { name: 'Fade Kings 👑', memberCount: 5 },
    ];

    for (const groupConfig of groupChats) {
      // Create the chat
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          chat_type: 'group' as const,
          name: groupConfig.name,
          created_by: mockUsers[0].id,
        })
        .select()
        .single();

      if (chatError || !chat) continue;

      // Add members
      const members = mockUsers
        .sort(() => Math.random() - 0.5)
        .slice(0, groupConfig.memberCount)
        .map((user) => ({
          chat_id: chat.id,
          user_id: user.id,
          role: user.id === mockUsers[0].id ? ('admin' as const) : ('member' as const),
        }));

      await supabase.from('chat_members').insert(members);

      // Add a few messages
      const messageCount = Math.floor(Math.random() * 5) + 3;
      for (let i = 0; i < messageCount; i++) {
        const sender = members[Math.floor(Math.random() * members.length)];
        const messages = [
          "Who's tailing this pick? 👀",
          "I'm on a heater! 5-1 last two days 🔥",
          'Fade me if you want to win 😂',
          'Lakers ML is free money tonight',
          'Anyone else on the over?',
          'This line is moving fast',
          "Books know something we don't",
          'Parlays only today boys!',
        ];

        await supabase.from('messages').insert({
          chat_id: chat.id,
          sender_id: sender.user_id,
          content: messages[Math.floor(Math.random() * messages.length)],
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      console.log(`  ✓ Created "${groupConfig.name}" with ${groupConfig.memberCount} members`);
    }

    // Create some tail/fade actions
    console.log('\n👥 Creating tail/fade actions...');

    const { data: recentPosts } = await supabase
      .from('posts')
      .select('*, users!inner(*)')
      .eq('users.is_mock', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentPosts) {
      for (const post of recentPosts) {
        // 2-4 users will tail/fade each post
        const actionCount = Math.floor(Math.random() * 3) + 2;
        const actingUsers = mockUsers
          .filter((u) => u.id !== post.user_id)
          .sort(() => Math.random() - 0.5)
          .slice(0, actionCount);

        for (const user of actingUsers) {
          const action = Math.random() > 0.7 ? 'fade' : 'tail';

          await supabase.from('pick_actions').insert({
            post_id: post.id,
            user_id: user.id,
            action_type: action as Database['public']['Enums']['pick_action'],
          });
        }

        console.log(`  ✓ ${actionCount} users interacted with ${post.users?.username}'s post`);
      }
    }

    console.log('\n✅ Activity generation completed!');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
generateActivity();
