#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase-generated';

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Helper functions
function getRandomStake(): number {
  const stakes = [100, 200, 500, 1000, 2000, 5000, 10000, 25000];
  return stakes[Math.floor(Math.random() * stakes.length)] * 100; // Convert to cents
}

function getRandomOdds(): number {
  const odds = [-110, -105, -115, -120, -130, -150, 100, 110, 120, 130, 150, 180, 200];
  return odds[Math.floor(Math.random() * odds.length)];
}

function calculatePotentialWin(stake: number, odds: number): number {
  if (odds > 0) {
    return Math.floor((stake * odds) / 100);
  } else {
    return Math.floor((stake * 100) / Math.abs(odds));
  }
}

async function addVariedContent() {
  console.log('🚀 Adding varied content to mock ecosystem...\n');

  // Get mock users
  const { data: mockUsers } = await supabase.from('users').select('*').eq('is_mock', true);

  if (!mockUsers || mockUsers.length === 0) {
    console.error('❌ No mock users found');
    return;
  }

  // Get real user
  const { data: realUser } = await supabase
    .from('users')
    .select('*')
    .eq('is_mock', false)
    .limit(1)
    .single();

  if (!realUser) {
    console.error('❌ No real user found');
    return;
  }

  // Get games
  const { data: games } = await supabase
    .from('games')
    .select('*')
    .order('commence_time', { ascending: false })
    .limit(100);

  if (!games) {
    console.error('❌ No games found');
    return;
  }

  const completedGames = games.filter((g) => g.status === 'completed');
  const upcomingGames = games.filter((g) => g.status === 'scheduled');

  console.log(
    `📊 Found ${mockUsers.length} mock users, ${completedGames.length} completed games, ${upcomingGames.length} upcoming games\n`
  );

  // 1. Create active pick posts with varied stakes
  console.log('🎯 Creating active pick posts with varied stakes...');
  const activePicks = [];
  const activeBets = [];

  for (let i = 0; i < 40; i++) {
    const user = mockUsers[i % mockUsers.length];
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

    let betDetails: { team?: string; line?: number; total_type?: 'over' | 'under' } = { team };
    let caption = '';

    if (betType === 'spread') {
      const spread = (Math.random() * 14 - 7).toFixed(1);
      betDetails.line = parseFloat(spread);
      caption = `${team} ${parseFloat(spread) > 0 ? '+' : ''}${spread} 🔒\n\n$${(stake / 100).toFixed(0)} to win $${(calculatePotentialWin(stake, odds) / 100).toFixed(0)}`;
    } else if (betType === 'total') {
      const totalType = Math.random() > 0.5 ? 'over' : 'under';
      const line = Math.floor(Math.random() * 40 + 200);
      betDetails = { total_type: totalType, line };
      caption = `${totalType.toUpperCase()} ${line} 📊\n\n${game.away_team} @ ${game.home_team}`;
    } else {
      caption = `${team} ML 💰\n\nRiding with them tonight!`;
    }

    // Create bet
    activeBets.push({
      id: betId,
      user_id: user.id,
      game_id: game.id,
      bet_type: betType,
      bet_details: betDetails,
      stake,
      odds,
      potential_win: calculatePotentialWin(stake, odds),
      status: 'pending' as const,
      created_at: new Date(Date.now() - i * 30 * 60 * 1000).toISOString(),
    });

    // Create pick post
    activePicks.push({
      id: postId,
      user_id: user.id,
      post_type: 'pick' as const,
      bet_id: betId,
      caption,
      media_url: `https://images.unsplash.com/photo-${1504450758481 + i}-e1b6e0c2b8a2?w=800&h=800&fit=crop`,
      media_type: 'photo' as const,
      tail_count: Math.floor(Math.random() * 20),
      fade_count: Math.floor(Math.random() * 5),
      reaction_count: Math.floor(Math.random() * 30),
      comment_count: Math.floor(Math.random() * 10),
      created_at: new Date(Date.now() - i * 30 * 60 * 1000).toISOString(),
      expires_at: game.commence_time,
    });
  }

  // 2. Create settled bets with outcome posts
  console.log('🏆 Creating settled bets with outcome posts...');
  const settledBets = [];
  const outcomePosts = [];

  for (let i = 0; i < 30; i++) {
    const user = mockUsers[i % mockUsers.length];
    const game = completedGames[i % completedGames.length];
    if (!game || !game.home_score || !game.away_score) continue;

    const betId = crypto.randomUUID();
    const outcomePostId = crypto.randomUUID();
    const isWin = Math.random() > 0.4; // 60% win rate
    const betType = ['spread', 'moneyline'][Math.floor(Math.random() * 2)] as
      | 'spread'
      | 'moneyline';
    const team = Math.random() > 0.5 ? game.home_team : game.away_team;
    const stake = getRandomStake();
    const odds = getRandomOdds();
    const potentialWin = calculatePotentialWin(stake, odds);

    // Create settled bet
    settledBets.push({
      id: betId,
      user_id: user.id,
      game_id: game.id,
      bet_type: betType,
      bet_details: { team },
      stake,
      odds,
      potential_win: potentialWin,
      actual_win: isWin ? potentialWin : -stake,
      status: (isWin ? 'won' : 'lost') as 'won' | 'lost',
      settled_at: new Date(Date.now() - (i + 1) * 2 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - (i + 24) * 60 * 60 * 1000).toISOString(),
    });

    // Create outcome post
    const winCaption = [
      `CASH IT 💰💰💰\n\n+$${(potentialWin / 100).toFixed(0)} profit!`,
      `Never a doubt! ✅\n\n${team} covers easily`,
      `WE EATING TONIGHT 🍽️\n\n${isWin ? 'Won' : 'Lost'} $${(potentialWin / 100).toFixed(0)}`,
      `BOOM 💥\n\nAnother one in the books!`,
    ];

    const lossCaption = [
      `Tough beat 💔\n\n${team} couldn't get it done`,
      `On to the next one 💪\n\n-$${(stake / 100).toFixed(0)}`,
      `Bad beat... ${game.home_team} ${game.home_score}, ${game.away_team} ${game.away_score}`,
      `Can't win em all 🤷‍♂️`,
    ];

    outcomePosts.push({
      id: outcomePostId,
      user_id: user.id,
      post_type: 'outcome' as const,
      bet_id: betId,
      caption: isWin
        ? winCaption[Math.floor(Math.random() * winCaption.length)]
        : lossCaption[Math.floor(Math.random() * lossCaption.length)],
      media_url: `https://images.unsplash.com/photo-${1574629867962 + i}-e1b6e0c2b8a2?w=800&h=800&fit=crop`,
      media_type: 'photo' as const,
      reaction_count: isWin
        ? Math.floor(Math.random() * 50) + 20
        : Math.floor(Math.random() * 20) + 5,
      comment_count: Math.floor(Math.random() * 15),
      created_at: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  // 3. Create more group chats
  console.log('💬 Creating additional group chats...');
  const newGroupChats = [
    { name: 'Parlay Gang 🎰', description: 'Big parlays only' },
    { name: 'Sharp Bettors 📊', description: 'Data-driven picks' },
    { name: 'Live Betting Crew ⚡', description: 'In-game action' },
    { name: 'Fade Brigade 🔄', description: 'Fading the public' },
    { name: 'Morning Locks 🌅', description: 'Early bird bets' },
    { name: 'Under Club 📉', description: 'Under gang unite' },
    { name: 'Dog Pound 🐕', description: 'Underdog hunters' },
  ];

  for (const chatInfo of newGroupChats) {
    // Check if already exists
    const { data: existing } = await supabase
      .from('chats')
      .select('id')
      .eq('name', chatInfo.name)
      .single();

    if (existing) continue;

    const { data: chat, error } = await supabase
      .from('chats')
      .insert({
        name: chatInfo.name,
        chat_type: 'group',
        created_by: mockUsers[0].id,
      })
      .select()
      .single();

    if (error || !chat) continue;

    // Add members including real user
    const memberCount = Math.floor(Math.random() * 15) + 10;
    const members = [realUser.id, ...mockUsers.slice(0, memberCount).map((u) => u.id)];

    for (const memberId of members) {
      await supabase.from('chat_members').insert({
        chat_id: chat.id,
        user_id: memberId,
        role: memberId === mockUsers[0].id ? 'admin' : 'member',
      });
    }

    // Add messages
    const messages = [];
    const messageTemplates = [
      'Anyone tailing the {team} pick?',
      'This line is moving fast',
      '{team} ML looking good',
      'Refs are trash tonight',
      'Who else is sweating this game?',
      'LFG!!! We hit!',
      'One more leg on my parlay',
      'Books know something we dont',
    ];

    for (let i = 0; i < 25; i++) {
      const sender = members[Math.floor(Math.random() * members.length)];
      const template = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
      const team = ['Lakers', 'Celtics', 'Chiefs', 'Bills', 'Yankees', 'Dodgers'][
        Math.floor(Math.random() * 6)
      ];

      messages.push({
        chat_id: chat.id,
        sender_id: sender,
        content: template.replace('{team}', team),
        created_at: new Date(Date.now() - (25 - i) * 15 * 60 * 1000).toISOString(),
      });
    }

    await supabase.from('messages').insert(messages);
    console.log(`  ✅ Created group: ${chatInfo.name}`);
  }

  // 4. Create more DM conversations
  console.log('📱 Creating additional DM conversations...');
  const dmUsers = mockUsers.slice(5, 20); // Get 15 users for DMs

  for (const dmUser of dmUsers) {
    const { data: chat, error } = await supabase
      .from('chats')
      .insert({
        chat_type: 'dm',
        created_by: realUser.id,
      })
      .select()
      .single();

    if (error || !chat) continue;

    // Add members
    await supabase.from('chat_members').insert([
      { chat_id: chat.id, user_id: realUser.id, role: 'member' },
      { chat_id: chat.id, user_id: dmUser.id, role: 'member' },
    ]);

    // Add conversation
    const dmTemplates = [
      'You tailing anything tonight?',
      'That was a bad beat bro',
      'Check out my last pick',
      'Books are trapping today',
      'Good hit yesterday!',
      'What you think about {team}?',
      'Im on {team} ML',
      'Fade or tail?',
    ];

    const messages = [];
    for (let i = 0; i < 15; i++) {
      const isFromDmUser = Math.random() > 0.4;
      const template = dmTemplates[Math.floor(Math.random() * dmTemplates.length)];
      const team = ['Lakers', 'Celtics', 'Chiefs', 'Bills'][Math.floor(Math.random() * 4)];

      messages.push({
        chat_id: chat.id,
        sender_id: isFromDmUser ? dmUser.id : realUser.id,
        content: template.replace('{team}', team),
        created_at: new Date(Date.now() - (15 - i) * 60 * 60 * 1000).toISOString(),
      });
    }

    await supabase.from('messages').insert(messages);
  }

  // Insert all the data
  console.log('\n📤 Inserting all content...');

  if (activeBets.length > 0) {
    const { error } = await supabase.from('bets').insert(activeBets);
    if (error) console.error('Error inserting active bets:', error);
    else console.log(`  ✅ Created ${activeBets.length} active bets`);
  }

  if (activePicks.length > 0) {
    const { error } = await supabase.from('posts').insert(activePicks);
    if (error) console.error('Error inserting pick posts:', error);
    else console.log(`  ✅ Created ${activePicks.length} pick posts`);
  }

  if (settledBets.length > 0) {
    const { error } = await supabase.from('bets').insert(settledBets);
    if (error) console.error('Error inserting settled bets:', error);
    else console.log(`  ✅ Created ${settledBets.length} settled bets`);
  }

  if (outcomePosts.length > 0) {
    const { error } = await supabase.from('posts').insert(outcomePosts);
    if (error) console.error('Error inserting outcome posts:', error);
    else console.log(`  ✅ Created ${outcomePosts.length} outcome posts`);
  }

  // Update bankrolls for users with settled bets
  console.log('\n💰 Updating bankrolls...');
  const userBetTotals = new Map();

  for (const bet of settledBets) {
    if (!userBetTotals.has(bet.user_id)) {
      userBetTotals.set(bet.user_id, { wins: 0, losses: 0, profit: 0 });
    }
    const totals = userBetTotals.get(bet.user_id);
    if (bet.status === 'won') {
      totals.wins++;
      totals.profit += bet.actual_win;
    } else {
      totals.losses++;
      totals.profit += bet.actual_win; // negative for losses
    }
  }

  for (const [userId, totals] of userBetTotals) {
    await supabase
      .from('bankrolls')
      .update({
        win_count: totals.wins,
        loss_count: totals.losses,
        balance: 1000000 + totals.profit, // Start with $10,000
      })
      .eq('user_id', userId);
  }

  console.log('\n✨ Content variety enhancement complete!');
  console.log('\n📊 Summary:');
  console.log(`  • ${activePicks.length} active pick posts with varied stakes ($1 to $250)`);
  console.log(`  • ${outcomePosts.length} outcome posts (wins and losses)`);
  console.log(`  • ${newGroupChats.length} new group chats`);
  console.log(`  • ${dmUsers.length} new DM conversations`);
  console.log(`  • Updated bankrolls based on bet outcomes`);
}

addVariedContent().catch(console.error);
