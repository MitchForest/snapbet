#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database-helpers';
import { postTemplates, messageTemplates } from './templates';

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

type Tables = Database['public']['Tables'];
type Post = Tables['posts']['Insert'];
type Bet = Tables['bets']['Insert'];
type User = Tables['users']['Row'] & { mock_personality_id: string };

// Enhanced configuration
const ENHANCED_CONFIG = {
  posts: {
    activePicks: 30, // Active bet posts
    settledPicks: 25, // Settled bet posts with outcomes
    reactions: 20, // Pure reaction/discussion posts
    celebrations: 15, // Win celebration posts
    commiserations: 10, // Loss posts
  },
  bets: {
    stakes: {
      small: [100, 200, 300, 500], // Conservative bets
      medium: [1000, 1500, 2000, 2500], // Standard bets
      large: [5000, 7500, 10000], // Big bets
      yolo: [15000, 20000, 25000], // YOLO bets
    },
    distribution: {
      small: 0.3, // 30% small bets
      medium: 0.5, // 50% medium bets
      large: 0.15, // 15% large bets
      yolo: 0.05, // 5% YOLO bets
    },
  },
  chats: {
    groups: [
      // Original groups
      'NBA Degens 🏀',
      'Saturday Squad 🏈',
      'Degen Support Group 🫂',
      // New groups
      'Parlay Gang 🎰',
      'Sharp Bettors 📊',
      'Live Betting Crew ⚡',
      'Fade Brigade 🔄',
      'Morning Locks 🌅',
    ],
    directChats: 12, // Increase from 5 to 12
  },
  engagement: {
    reactionsPerPost: { min: 5, max: 25 },
    commentsPerPost: { min: 2, max: 8 },
    tailsPerPick: { min: 3, max: 20 },
  },
};

// Get a random stake based on distribution
function getRandomStake(): number {
  const rand = Math.random();
  let category: keyof typeof ENHANCED_CONFIG.bets.stakes;

  if (rand < ENHANCED_CONFIG.bets.distribution.small) {
    category = 'small';
  } else if (
    rand <
    ENHANCED_CONFIG.bets.distribution.small + ENHANCED_CONFIG.bets.distribution.medium
  ) {
    category = 'medium';
  } else if (
    rand <
    ENHANCED_CONFIG.bets.distribution.small +
      ENHANCED_CONFIG.bets.distribution.medium +
      ENHANCED_CONFIG.bets.distribution.large
  ) {
    category = 'large';
  } else {
    category = 'yolo';
  }

  const stakes = ENHANCED_CONFIG.bets.stakes[category];
  return stakes[Math.floor(Math.random() * stakes.length)];
}

// Calculate potential win based on odds
function calculatePotentialWin(stake: number, odds: number): number {
  if (odds > 0) {
    return Math.floor((stake * odds) / 100);
  } else {
    return Math.floor((stake * 100) / Math.abs(odds));
  }
}

// Get random odds
function getRandomOdds(): number {
  const commonOdds = [
    -110, -105, -115, -120, -130, -140, -150, 100, 110, 120, 130, 140, 150, 160, 170, 180, 200,
  ];
  return commonOdds[Math.floor(Math.random() * commonOdds.length)];
}

// Get random template
function getRandomTemplate(templates: string[]): string {
  return templates[Math.floor(Math.random() * templates.length)];
}

// Fill template with values
function fillTemplate(template: string, values: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  return result;
}

async function enhanceContent() {
  console.log('🚀 Enhancing mock content with more variety...\n');

  // Get mock users and games
  const { data: mockUsers } = await supabase.from('users').select('*').eq('is_mock', true);

  const { data: games } = await supabase
    .from('games')
    .select('*')
    .or('status.eq.scheduled,status.eq.completed')
    .order('commence_time', { ascending: false })
    .limit(50);

  if (!mockUsers || !games) {
    console.error('❌ Failed to fetch mock users or games');
    return;
  }

  console.log(`📊 Found ${mockUsers.length} mock users and ${games.length} games\n`);

  const completedGames = games.filter((g) => g.status === 'completed');
  const upcomingGames = games.filter((g) => g.status === 'scheduled');

  // Get the main user
  const { data: mainUser } = await supabase
    .from('users')
    .select('id')
    .eq('is_mock', false)
    .limit(1)
    .single();

  if (!mainUser) {
    console.error('❌ No real user found');
    return;
  }

  // Create various types of posts
  const posts: Post[] = [];
  const bets: Bet[] = [];
  const reactions: Array<{
    post_id: string;
    user_id: string;
    emoji: string;
  }> = [];
  const comments: Array<{
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
  }> = [];
  const pickActions: Array<{
    post_id: string;
    user_id: string;
    action_type: 'tail' | 'fade';
  }> = [];

  // 1. Create active pick posts (pending bets)
  console.log('🎲 Creating active pick posts...');
  for (let i = 0; i < ENHANCED_CONFIG.posts.activePicks; i++) {
    const user = mockUsers[i % mockUsers.length] as User;
    const game = upcomingGames[i % upcomingGames.length];
    if (!game) continue;

    const betId = crypto.randomUUID();
    const postId = crypto.randomUUID();
    const betType = ['spread', 'moneyline', 'total'][Math.floor(Math.random() * 3)] as
      | 'spread'
      | 'moneyline'
      | 'total';
    const team = Math.random() > 0.5 ? game.home_team : game.away_team;
    const stake = getRandomStake();
    const odds = getRandomOdds();

    const betDetails: {
      team?: string;
      spread?: string;
      total_type?: 'over' | 'under';
      line?: number;
    } = {
      team,
    };
    let templateKey = 'normal';

    if (betType === 'spread') {
      betDetails.spread = (Math.random() * 14 - 7).toFixed(1);
      templateKey = Math.random() > 0.5 ? 'normal' : 'confident';
    } else if (betType === 'total') {
      betDetails.total_type = Math.random() > 0.5 ? 'over' : 'under';
      betDetails.line = Math.floor(Math.random() * 40 + 200);
      templateKey = 'analytical';
    }

    // Create bet
    bets.push({
      id: betId,
      user_id: user.id,
      game_id: game.id,
      bet_type: betType,
      bet_details: betDetails,
      stake,
      odds,
      potential_win: calculatePotentialWin(stake, odds),
      status: 'pending',
      created_at: new Date(Date.now() - i * 30 * 60 * 1000).toISOString(),
    });

    // Create post
    const pickShareTemplates = postTemplates['pick-share'];
    const template = getRandomTemplate(
      pickShareTemplates[templateKey as keyof typeof pickShareTemplates] ||
        pickShareTemplates.normal
    );
    posts.push({
      id: postId,
      user_id: user.id,
      post_type: 'pick',
      bet_id: betId,
      caption: fillTemplate(template, {
        team,
        spread: betDetails.spread || 'ML',
        odds: odds.toString(),
        stake: stake.toString(),
        type: betType,
        line: betDetails.line?.toString() || betDetails.spread || 'ML',
      }),
      media_url: `https://images.unsplash.com/photo-${1504450758481 + i}-e1b6e0c2b8a2?w=800&h=800&fit=crop`,
      media_type: 'photo',
      created_at: new Date(Date.now() - i * 30 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    // Add engagement
    const tailCount = Math.floor(Math.random() * 15) + 5;
    for (let j = 0; j < tailCount; j++) {
      const tailer = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      if (tailer.id !== user.id) {
        pickActions.push({
          post_id: postId,
          user_id: tailer.id,
          action_type: Math.random() > 0.8 ? 'fade' : 'tail',
        });
      }
    }
  }

  // 2. Create settled pick posts with outcomes
  console.log('🏆 Creating settled picks with outcome posts...');
  for (let i = 0; i < ENHANCED_CONFIG.posts.settledPicks; i++) {
    const user = mockUsers[i % mockUsers.length] as User;
    const game = completedGames[i % completedGames.length];
    if (!game) continue;

    const betId = crypto.randomUUID();
    const postId = crypto.randomUUID();
    const outcomePostId = crypto.randomUUID();
    const isWin = Math.random() > 0.45; // 55% win rate
    const betType = ['spread', 'moneyline'][Math.floor(Math.random() * 2)] as
      | 'spread'
      | 'moneyline';
    const team = Math.random() > 0.5 ? game.home_team : game.away_team;
    const stake = getRandomStake();
    const odds = getRandomOdds();
    const potentialWin = calculatePotentialWin(stake, odds);

    // Create settled bet
    bets.push({
      id: betId,
      user_id: user.id,
      game_id: game.id,
      bet_type: betType,
      bet_details: { team },
      stake,
      odds,
      potential_win: potentialWin,
      actual_win: isWin ? stake + potentialWin : 0,
      status: isWin ? 'won' : 'lost',
      settled_at: new Date(Date.now() - (i + 1) * 2 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - (i + 2) * 2 * 60 * 60 * 1000).toISOString(),
    });

    // Create original pick post
    posts.push({
      id: postId,
      user_id: user.id,
      post_type: 'pick',
      bet_id: betId,
      caption: `${team} ${betType === 'spread' ? '+3.5' : 'ML'} 🔒`,
      media_url: `https://images.unsplash.com/photo-${1518611012939 + i}-f6e18c0c2b8a2?w=800&h=800&fit=crop`,
      media_type: 'photo',
      created_at: new Date(Date.now() - (i + 2) * 2 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    // Create outcome post
    const outcomeTemplates = isWin
      ? postTemplates['outcome-positive'].normal
      : postTemplates['outcome-negative'].normal;

    posts.push({
      id: outcomePostId,
      user_id: user.id,
      post_type: 'outcome',
      bet_id: betId,
      caption: fillTemplate(getRandomTemplate(outcomeTemplates), {
        team,
        amount: potentialWin.toString(),
        profit: potentialWin.toString(),
        score: `${game.home_score}-${game.away_score}`,
      }),
      media_url: `https://images.unsplash.com/photo-${1574629867962 + i}-e1b6e0c2b8a2?w=800&h=800&fit=crop`,
      media_type: 'photo',
      created_at: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    // Add reactions to outcome post
    const reactionCount = isWin
      ? Math.floor(Math.random() * 20) + 10
      : Math.floor(Math.random() * 10) + 5;
    for (let j = 0; j < reactionCount; j++) {
      const reactor = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      reactions.push({
        post_id: outcomePostId,
        user_id: reactor.id,
        emoji: isWin
          ? ['🔥', '💰', '🎯', '👏'][Math.floor(Math.random() * 4)]
          : ['😢', '💔', '😤', '🤝'][Math.floor(Math.random() * 4)],
      });
    }
  }

  // 3. Create pure reaction/discussion posts
  console.log('💬 Creating reaction and discussion posts...');
  for (let i = 0; i < ENHANCED_CONFIG.posts.reactions; i++) {
    const user = mockUsers[i % mockUsers.length] as User;
    const postId = crypto.randomUUID();
    const templates = postTemplates['reaction'];
    const mood = ['exciting', 'frustrated', 'analytical'][
      Math.floor(Math.random() * 3)
    ] as keyof typeof templates;

    posts.push({
      id: postId,
      user_id: user.id,
      post_type: 'content',
      caption: getRandomTemplate(templates[mood]),
      media_url: `https://images.unsplash.com/photo-${1546519638 + i}-e1b6e0c2b8a2?w=800&h=800&fit=crop`,
      media_type: 'photo',
      created_at: new Date(Date.now() - i * 45 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    // Add comments
    const commentCount = Math.floor(Math.random() * 5) + 3;
    for (let j = 0; j < commentCount; j++) {
      const commenter = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      comments.push({
        post_id: postId,
        user_id: commenter.id,
        content: getRandomTemplate(messageTemplates['degen'].reaction),
        created_at: new Date(Date.now() - (i * 45 - j * 5) * 60 * 1000).toISOString(),
      });
    }
  }

  // Insert all the data
  console.log('\n📤 Inserting enhanced content...');

  if (bets.length > 0) {
    const { error } = await supabase.from('bets').insert(bets);
    if (error) console.error('Error inserting bets:', error);
    else console.log(`  ✅ Created ${bets.length} bets`);
  }

  if (posts.length > 0) {
    const { error } = await supabase.from('posts').insert(posts);
    if (error) console.error('Error inserting posts:', error);
    else console.log(`  ✅ Created ${posts.length} posts`);
  }

  if (reactions.length > 0) {
    const { error } = await supabase.from('reactions').insert(reactions);
    if (error) console.error('Error inserting reactions:', error);
    else console.log(`  ✅ Created ${reactions.length} reactions`);
  }

  if (comments.length > 0) {
    const { error } = await supabase.from('comments').insert(comments);
    if (error) console.error('Error inserting comments:', error);
    else console.log(`  ✅ Created ${comments.length} comments`);
  }

  if (pickActions.length > 0) {
    const { error } = await supabase.from('pick_actions').insert(pickActions);
    if (error) console.error('Error inserting pick actions:', error);
    else console.log(`  ✅ Created ${pickActions.length} pick actions`);
  }

  // Create additional group chats
  console.log('\n💬 Creating additional group chats...');
  for (const chatName of ENHANCED_CONFIG.chats.groups.slice(3)) {
    // Skip first 3 (already exist)
    const { data: chat, error } = await supabase
      .from('chats')
      .insert({
        name: chatName,
        chat_type: 'group',
        created_by: mockUsers[0].id,
      })
      .select()
      .single();

    if (error || !chat) continue;

    // Add members
    const memberCount = Math.floor(Math.random() * 10) + 10;
    const members = [mainUser.id, ...mockUsers.slice(0, memberCount).map((u) => u.id)];

    for (const memberId of members) {
      await supabase.from('chat_members').insert({
        chat_id: chat.id,
        user_id: memberId,
        role: memberId === mockUsers[0].id ? 'admin' : 'member',
      });
    }

    // Add messages
    const messages = [];
    for (let i = 0; i < 20; i++) {
      const sender = members[Math.floor(Math.random() * members.length)];
      messages.push({
        chat_id: chat.id,
        sender_id: sender,
        content: getRandomTemplate(messageTemplates['sharp-bettor'].discussion),
        created_at: new Date(Date.now() - (20 - i) * 10 * 60 * 1000).toISOString(),
      });
    }

    await supabase.from('messages').insert(messages);
    console.log(`  ✅ Created group: ${chatName}`);
  }

  // Create more DM chats
  console.log('\n📱 Creating additional direct messages...');
  const dmCount = ENHANCED_CONFIG.chats.directChats - 5; // Subtract existing
  for (let i = 0; i < dmCount; i++) {
    const partner = mockUsers[i + 5]; // Skip first 5 (already have DMs)

    const { data: chat, error } = await supabase
      .from('chats')
      .insert({
        chat_type: 'dm',
        created_by: mainUser.id,
      })
      .select()
      .single();

    if (error || !chat) continue;

    // Add members
    await supabase.from('chat_members').insert([
      { chat_id: chat.id, user_id: mainUser.id, role: 'member' },
      { chat_id: chat.id, user_id: partner.id, role: 'member' },
    ]);

    // Add conversation
    const messages = [];
    for (let j = 0; j < 10; j++) {
      const isFromPartner = Math.random() > 0.4;
      messages.push({
        chat_id: chat.id,
        sender_id: isFromPartner ? partner.id : mainUser.id,
        content: getRandomTemplate(messageTemplates['degen'].greeting),
        created_at: new Date(Date.now() - (10 - j) * 60 * 60 * 1000).toISOString(),
      });
    }

    await supabase.from('messages').insert(messages);
  }

  console.log('\n✨ Enhanced content creation complete!');
  console.log('\n📊 Summary:');
  console.log(`  • ${ENHANCED_CONFIG.posts.activePicks} active pick posts`);
  console.log(`  • ${ENHANCED_CONFIG.posts.settledPicks} settled picks with outcomes`);
  console.log(`  • ${ENHANCED_CONFIG.posts.reactions} reaction/discussion posts`);
  console.log(`  • ${ENHANCED_CONFIG.chats.groups.length} total group chats`);
  console.log(`  • ${ENHANCED_CONFIG.chats.directChats} total DM conversations`);
  console.log(`  • Varied bet sizes from $100 to $25,000`);
  console.log(`  • Mix of wins and losses with outcome posts`);
}

enhanceContent().catch(console.error);
