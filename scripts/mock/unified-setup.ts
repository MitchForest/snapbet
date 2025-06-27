#!/usr/bin/env bun

/**
 * Unified mock ecosystem setup for development and demos
 * Creates a complete, interactive environment with a single command
 */

import { supabase } from '../supabase-client';
import {
  messageTemplates,
  postTemplates,
  getRandomTemplate,
  fillTemplate,
  getPersonalityFromBehavior,
  mockMediaUrls,
} from './templates';
import type { Database } from '../../types/supabase';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type MockUser = User & { mock_personality_id: string };
type Game = Tables['games']['Row'];
type Post = Tables['posts']['Insert'];
type Reaction = Tables['reactions']['Insert'];
type Comment = Tables['comments']['Insert'];
type PickAction = Tables['pick_actions']['Insert'];

// Configuration
const CONFIG = {
  posts: {
    recent: 20, // Recent posts in last 2 hours
    picks: 10, // Pick posts with bets
    stories: 15, // Active stories
  },
  social: {
    followsFromMocks: 15, // Mock users following the user
    userFollowsMocks: 25, // User follows these mock users
  },
  engagement: {
    reactionsPerPost: { min: 3, max: 8 },
    commentsPerPost: { min: 1, max: 4 },
    tailsPerPick: { min: 2, max: 5 },
  },
  chats: {
    groups: ['NBA Degens 🏀', 'Saturday Squad 🏈', 'Degen Support Group 🫂'],
    directChats: 5, // Number of 1-on-1 chats
  },
  notifications: {
    recent: 10, // Recent notifications
  },
};

// Allowed emojis based on the constraint
const ALLOWED_EMOJIS = ['🔥', '💰', '💯', '🎯'];

// Get user by username
async function getUserByUsername(username: string): Promise<User | null> {
  console.log(`🔍 Looking up user: ${username}`);

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    console.error(`❌ Error looking up user:`, error.message);

    // Try to list some available usernames
    const { data: users } = await supabase
      .from('users')
      .select('username')
      .eq('is_mock', false)
      .limit(5);

    if (users && users.length > 0) {
      console.log('\n📋 Available non-mock usernames:');
      users.forEach((u) => console.log(`   - ${u.username}`));
    }

    return null;
  }

  if (!user) {
    console.error(`❌ User with username "${username}" not found`);

    // Try to list some available usernames
    const { data: users } = await supabase
      .from('users')
      .select('username')
      .eq('is_mock', false)
      .limit(5);

    if (users && users.length > 0) {
      console.log('\n📋 Available non-mock usernames:');
      users.forEach((u) => console.log(`   - ${u.username}`));
    }

    return null;
  }

  return user;
}

// Get all mock users
async function getMockUsers(): Promise<MockUser[]> {
  const { data: mockUsers, error } = await supabase.from('users').select('*').eq('is_mock', true);

  if (error || !mockUsers || mockUsers.length === 0) {
    throw new Error('No mock users found. Please run: bun run scripts/seed-mock-users.ts');
  }

  return mockUsers as MockUser[];
}

// Get upcoming games
async function getUpcomingGames(): Promise<Game[]> {
  const { data: games, error } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'scheduled')
    .order('commence_time', { ascending: true })
    .limit(20);

  if (error || !games || games.length === 0) {
    throw new Error('No upcoming games found. Please run: bun run scripts/add-games.ts');
  }

  return games;
}

// Create follow relationships
async function createFollowRelationships(userId: string, mockUsers: MockUser[]) {
  console.log('👥 Creating follow relationships...');

  // Select random mock users to follow the input user
  const mockFollowers = mockUsers
    .sort(() => Math.random() - 0.5)
    .slice(0, CONFIG.social.followsFromMocks);

  // Select mock users for the input user to follow
  const userFollows = mockUsers
    .sort(() => Math.random() - 0.5)
    .slice(0, CONFIG.social.userFollowsMocks);

  const relationships = [];

  // Mock users follow the input user
  for (const mockUser of mockFollowers) {
    relationships.push({
      follower_id: mockUser.id,
      following_id: userId,
    });
  }

  // Input user follows mock users
  for (const mockUser of userFollows) {
    relationships.push({
      follower_id: userId,
      following_id: mockUser.id,
    });
  }

  // Insert all relationships, ignoring duplicates
  for (const rel of relationships) {
    await supabase.from('follows').upsert(rel, {
      onConflict: 'follower_id,following_id',
    });
  }

  console.log(
    `  ✅ Created ${mockFollowers.length} followers and following ${userFollows.length} users`
  );
}

// Create stories from mock users
async function createStories(mockUsers: MockUser[]) {
  console.log('📸 Creating stories...');

  const storyUsers = mockUsers.sort(() => Math.random() - 0.5).slice(0, CONFIG.posts.stories);

  const stories = [];

  for (const user of storyUsers) {
    const personality = getPersonalityFromBehavior(user.mock_personality_id);
    const storyType = Math.random() > 0.5 ? 'photo' : 'video';

    // Story content based on personality
    let content = '';
    let mediaUrl = '';

    if (Math.random() > 0.6) {
      // Betting-related story
      const templates = postTemplates['pick-share'].confident;
      content = fillTemplate(getRandomTemplate(templates), {
        team: 'Lakers',
        spread: '-5.5',
        odds: '-110',
        type: 'spread',
        line: '-5.5',
      });
      mediaUrl = mockMediaUrls.reaction[0];
    } else {
      // General story
      const templates = messageTemplates[personality as keyof typeof messageTemplates];
      content = getRandomTemplate(templates?.greeting || ['Game day! 🏀']);
      mediaUrl = mockMediaUrls.reaction[Math.floor(Math.random() * mockMediaUrls.reaction.length)];
    }

    stories.push({
      user_id: user.id,
      media_url: mediaUrl,
      media_type: storyType as 'photo' | 'video',
      caption: content,
      created_at: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString(), // Random time in last 2 hours
    });
  }

  const { error } = await supabase.from('stories').insert(stories);
  if (error) console.error('Error creating stories:', error);
  else console.log(`  ✅ Created ${stories.length} stories`);
}

// Create posts with engagement
async function createPostsWithEngagement(userId: string, mockUsers: MockUser[], games: Game[]) {
  console.log('📝 Creating posts with engagement...');

  const posts: Post[] = [];
  const bets = [];
  const reactions: Reaction[] = [];
  const comments: Comment[] = [];
  const pickActions: PickAction[] = [];

  // First, create historical winning bets for "Hot Bettors"
  console.log('  🔥 Creating hot bettor history...');
  const hotBettors = mockUsers
    .filter((u) => ['sharp-bettor', 'live-bettor'].includes(u.mock_personality_id || ''))
    .slice(0, 5);

  // Calculate current week boundaries
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, so it's 6 days since Monday
  const mondayStart = new Date(now);
  mondayStart.setDate(now.getDate() - daysSinceMonday);
  mondayStart.setHours(0, 0, 0, 0);

  console.log(`  📅 Current week: Monday ${mondayStart.toISOString()} to now ${now.toISOString()}`);
  console.log(`  📅 Days since Monday: ${daysSinceMonday}`);

  for (const hotUser of hotBettors) {
    // Create 5-8 bets settled THIS WEEK with 70%+ win rate
    const betCount = Math.floor(Math.random() * 4) + 5;
    const winCount = Math.floor(betCount * (0.7 + Math.random() * 0.2));

    for (let i = 0; i < betCount; i++) {
      const game = games[Math.floor(Math.random() * games.length)];
      const isWin = i < winCount;
      const betId = crypto.randomUUID();

      // Ensure bets are settled within current week (since Monday)
      // Distribute evenly across the days we've had so far this week
      const maxDaysAgo = Math.min(daysSinceMonday, 6); // Cap at 6 days to stay within week
      const daysAgo = Math.random() * maxDaysAgo;
      const hoursAgo = daysAgo * 24 + Math.floor(Math.random() * 12); // Add some hour variation

      const settledAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      const createdAt = new Date(settledAt.getTime() - 2 * 60 * 60 * 1000); // Created 2 hours before settled

      bets.push({
        id: betId,
        user_id: hotUser.id,
        game_id: game.id,
        bet_type: ['spread', 'moneyline', 'total'][Math.floor(Math.random() * 3)] as
          | 'spread'
          | 'moneyline'
          | 'total',
        bet_details: { team: game.home_team },
        stake: 2000,
        odds: -110,
        potential_win: 1818,
        actual_win: isWin ? 3818 : 0,
        status: isWin ? ('won' as const) : ('lost' as const),
        settled_at: settledAt.toISOString(),
        created_at: createdAt.toISOString(),
      });
    }
  }

  // Create additional hot bettors to ensure we have enough
  console.log('  🔥 Creating additional hot bettors...');
  const additionalHotBettors = mockUsers
    .filter((u) => ['contrarian', 'sharp-bettor'].includes(u.mock_personality_id || ''))
    .slice(5, 10); // Get 5 more users

  for (const hotUser of additionalHotBettors) {
    // Create exactly 5-6 bets this week with high win rate
    const betCount = Math.floor(Math.random() * 2) + 5;
    const winCount = Math.floor(betCount * (0.75 + Math.random() * 0.15));

    for (let i = 0; i < betCount; i++) {
      const game = games[Math.floor(Math.random() * games.length)];
      const isWin = i < winCount;
      const betId = crypto.randomUUID();

      // All bets settled within current week
      const maxDaysAgo = Math.min(daysSinceMonday, 6);
      const daysAgo = Math.random() * maxDaysAgo;
      const hoursAgo = daysAgo * 24 + Math.floor(Math.random() * 6);

      const settledAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      const createdAt = new Date(settledAt.getTime() - 3 * 60 * 60 * 1000);

      bets.push({
        id: betId,
        user_id: hotUser.id,
        game_id: game.id,
        bet_type: ['spread', 'moneyline'][Math.floor(Math.random() * 2)] as 'spread' | 'moneyline',
        bet_details: { team: game.home_team },
        stake: 1500,
        odds: -110,
        potential_win: 1364,
        actual_win: isWin ? 2864 : 0,
        status: isWin ? ('won' as const) : ('lost' as const),
        settled_at: settledAt.toISOString(),
        created_at: createdAt.toISOString(),
      });
    }
  }

  // Create "Fade Gods" - users with losing records
  console.log('  🎪 Creating fade god history...');
  const fadeGods = mockUsers.filter((u) => u.mock_personality_id === 'fade-material').slice(0, 3);

  for (const fadeGod of fadeGods) {
    // Create 10-15 bets with mostly losses (< 40% win rate)
    const betCount = Math.floor(Math.random() * 6) + 10; // 10-15 bets
    const winCount = Math.floor(betCount * (0.2 + Math.random() * 0.15)); // 20-35% win rate

    for (let i = 0; i < betCount; i++) {
      const game = games[Math.floor(Math.random() * games.length)];
      const isWin = i < winCount;
      const betId = crypto.randomUUID();
      const daysAgo = Math.floor(Math.random() * 14) + 1; // Spread over 2 weeks

      bets.push({
        id: betId,
        user_id: fadeGod.id,
        game_id: game.id,
        bet_type: 'moneyline' as const,
        bet_details: { team: game.away_team },
        stake: 3000,
        odds: -110,
        potential_win: 2727,
        actual_win: isWin ? 5727 : 0,
        status: isWin ? ('won' as const) : ('lost' as const),
        settled_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - (daysAgo + 1) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  // Create "Rising Stars" - new mock users created in last 7 days with good records
  console.log('  ⭐ Creating rising stars...');
  const risingStars = mockUsers
    .filter((u) => ['sharp-bettor', 'contrarian'].includes(u.mock_personality_id || ''))
    .slice(5, 8); // Get 3 users not already used

  // Update their created_at to be recent
  for (const star of risingStars) {
    const daysAgo = Math.floor(Math.random() * 5) + 2; // 2-6 days ago
    await supabase
      .from('users')
      .update({
        created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', star.id);

    // Give them a good record (4-5 bets, 75%+ win rate)
    const betCount = Math.floor(Math.random() * 2) + 4;
    const winCount = Math.floor(betCount * (0.75 + Math.random() * 0.15));

    for (let i = 0; i < betCount; i++) {
      const game = games[Math.floor(Math.random() * games.length)];
      const isWin = i < winCount;
      const betId = crypto.randomUUID();

      bets.push({
        id: betId,
        user_id: star.id,
        game_id: game.id,
        bet_type: 'moneyline' as const,
        bet_details: { team: isWin ? game.home_team : game.away_team },
        stake: 1500,
        odds: -110,
        potential_win: 1364,
        actual_win: isWin ? 2864 : 0,
        status: isWin ? ('won' as const) : ('lost' as const),
        settled_at: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - (i + 2) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  // Update bankroll stats for all these users
  console.log('  💰 Updating bankroll stats...');

  // Get all unique user IDs from bets
  const uniqueUserIds = [...new Set(bets.map((b) => b.user_id))];

  for (const userId of uniqueUserIds) {
    const userBets = bets.filter((b) => b.user_id === userId);
    const wins = userBets.filter((b) => b.status === 'won').length;
    const losses = userBets.filter((b) => b.status === 'lost').length;
    const totalWagered = userBets.reduce((sum, b) => sum + b.stake, 0);
    const totalWon = userBets.reduce((sum, b) => sum + (b.actual_win || 0), 0);

    await supabase
      .from('bankrolls')
      .update({
        win_count: wins,
        loss_count: losses,
        total_wagered: totalWagered,
        total_won: totalWon,
        balance: 10000 + totalWon - totalWagered,
      })
      .eq('user_id', userId);
  }

  // Create recent posts with higher engagement for trending
  console.log('  📈 Creating trending posts...');
  for (let i = 0; i < CONFIG.posts.recent; i++) {
    const user = mockUsers[i % mockUsers.length];
    const postTime = new Date(Date.now() - i * 6 * 60 * 1000); // Space out by 6 minutes
    const game = games[i % games.length]; // Rotate through available games

    const isPickPost = i < CONFIG.posts.picks;

    const postData: Post = {
      id: crypto.randomUUID(),
      user_id: user.id,
      created_at: new Date().toISOString(),
      expires_at: new Date(postTime.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      media_type: 'photo',
      media_url: '',
      post_type: 'content',
    };

    if (isPickPost && game) {
      // Create a bet first
      const betId = crypto.randomUUID();
      const betType = Math.random() > 0.5 ? 'spread' : 'moneyline';
      const team = Math.random() > 0.5 ? game.home_team : game.away_team;
      const spread = betType === 'spread' ? (Math.random() * 10 - 5).toFixed(1) : undefined;

      bets.push({
        id: betId,
        user_id: user.id,
        game_id: game.id,
        bet_type: betType as 'spread' | 'moneyline',
        bet_details: {
          team: team,
          ...(spread && { spread: parseFloat(spread) }),
        },
        stake: Math.floor(Math.random() * 5000) + 1000,
        odds: -110,
        potential_win: 909,
        status: 'pending' as const,
        created_at: postTime.toISOString(),
      });

      const template = getRandomTemplate(postTemplates['pick-share'].normal);
      postData.caption = fillTemplate(template, {
        team: team,
        spread: spread || 'ML',
        odds: '-110',
        type: betType,
        line: spread || 'ML',
      });
      postData.post_type = 'pick';
      postData.bet_id = betId;
    } else {
      // Regular post
      const templates = postTemplates['reaction'].exciting;
      postData.caption = getRandomTemplate(templates);
      postData.post_type = 'content';
    }

    postData.media_url = mockMediaUrls.reaction[i % mockMediaUrls.reaction.length];
    postData.media_type = 'photo';

    posts.push(postData);

    // Generate engagement for this post
    const reactionCount =
      Math.floor(
        Math.random() *
          (CONFIG.engagement.reactionsPerPost.max - CONFIG.engagement.reactionsPerPost.min)
      ) + CONFIG.engagement.reactionsPerPost.min;

    const commentCount =
      Math.floor(
        Math.random() *
          (CONFIG.engagement.commentsPerPost.max - CONFIG.engagement.commentsPerPost.min)
      ) + CONFIG.engagement.commentsPerPost.min;

    // Add reactions
    const reactingUsers = mockUsers
      .filter((u) => u.id !== user.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, reactionCount);

    for (const reactor of reactingUsers) {
      reactions.push({
        post_id: postData.id!,
        user_id: reactor.id,
        emoji: ALLOWED_EMOJIS[Math.floor(Math.random() * ALLOWED_EMOJIS.length)],
      });
    }

    // Add comments
    const commentingUsers = mockUsers
      .filter((u) => u.id !== user.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, commentCount);

    for (const commenter of commentingUsers) {
      const commenterPersonality = getPersonalityFromBehavior(commenter.mock_personality_id);
      const templates =
        messageTemplates[commenterPersonality as keyof typeof messageTemplates] ||
        messageTemplates['degen'];

      comments.push({
        post_id: postData.id!,
        user_id: commenter.id,
        content: getRandomTemplate(templates.reaction || templates.greeting),
        created_at: new Date(postTime.getTime() + Math.random() * 30 * 60 * 1000).toISOString(),
      });
    }

    // Add pick actions for pick posts - more tails for trending
    if (isPickPost) {
      const isTrending = i < 3; // First 3 picks are trending
      const tailCount = isTrending
        ? Math.floor(Math.random() * 10) + 15 // 15-25 tails for trending
        : Math.floor(
            Math.random() *
              (CONFIG.engagement.tailsPerPick.max - CONFIG.engagement.tailsPerPick.min)
          ) + CONFIG.engagement.tailsPerPick.min;

      const tailingUsers = mockUsers
        .filter((u) => u.id !== user.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, tailCount);

      for (const tailer of tailingUsers) {
        const action = Math.random() > 0.7 ? 'fade' : 'tail';
        pickActions.push({
          post_id: postData.id!,
          user_id: tailer.id,
          action_type: action as 'tail' | 'fade',
        });
      }
    }
  }

  // Insert all data
  if (bets.length > 0) {
    const { error } = await supabase.from('bets').insert(bets);
    if (error) console.error('Error creating bets:', error);
  }

  const { error: postError } = await supabase.from('posts').insert(posts);
  if (postError) console.error('Error creating posts:', postError);
  else console.log(`  ✅ Created ${posts.length} posts`);

  const { error: reactionError } = await supabase.from('reactions').insert(reactions);
  if (reactionError) console.error('Error creating reactions:', reactionError);

  const { error: commentError } = await supabase.from('comments').insert(comments);
  if (commentError) console.error('Error creating comments:', commentError);

  if (pickActions.length > 0) {
    const { error: pickError } = await supabase.from('pick_actions').insert(pickActions);
    if (pickError) console.error('Error creating pick actions:', pickError);
  }

  console.log(`  ✅ Added ${reactions.length} reactions, ${comments.length} comments`);
  console.log(
    `  ✅ Created ${hotBettors.length + additionalHotBettors.length} hot bettors, ${fadeGods.length} fade gods, and ${risingStars.length} rising stars`
  );
}

// Create group chats and add user
async function createGroupChats(userId: string, mockUsers: MockUser[]) {
  console.log('💬 Creating group chats...');

  for (const chatName of CONFIG.chats.groups) {
    // Check if chat exists
    let { data: chat } = await supabase
      .from('chats')
      .select('*')
      .eq('name', chatName)
      .eq('chat_type', 'group')
      .single();

    if (!chat) {
      // Create chat
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
          name: chatName,
          chat_type: 'group',
          created_by: mockUsers[0].id,
        })
        .select()
        .single();

      if (error || !newChat) continue;
      chat = newChat;
    }

    // Add members
    const memberCount = Math.floor(Math.random() * 8) + 8; // 8-15 members
    const members = [userId, ...mockUsers.slice(0, memberCount).map((u) => u.id)];

    for (const memberId of members) {
      await supabase.from('chat_members').upsert(
        {
          chat_id: chat.id,
          user_id: memberId,
          role: memberId === mockUsers[0].id ? 'admin' : 'member',
        },
        { onConflict: 'chat_id,user_id' }
      );
    }

    // Add recent messages
    const messageCount = Math.floor(Math.random() * 15) + 10;
    const messages = [];

    for (let i = 0; i < messageCount; i++) {
      const sender = members[Math.floor(Math.random() * members.length)];
      const senderUser = sender === userId ? null : mockUsers.find((u) => u.id === sender);

      if (!senderUser && sender === userId) continue; // Skip user's messages for now

      const personality = senderUser
        ? getPersonalityFromBehavior(senderUser.mock_personality_id)
        : 'degen';

      const templates =
        messageTemplates[personality as keyof typeof messageTemplates] || messageTemplates['degen'];

      const content = fillTemplate(getRandomTemplate(templates.discussion || templates.greeting), {
        team: 'Lakers',
        game: 'Lakers vs Celtics',
      });

      messages.push({
        chat_id: chat.id,
        sender_id: sender,
        content,
        created_at: new Date(Date.now() - (messageCount - i) * 5 * 60 * 1000).toISOString(),
      });
    }

    const { error: msgError } = await supabase.from('messages').insert(messages);
    if (msgError) console.error('Error creating messages:', msgError);

    console.log(`  ✅ Created/updated "${chatName}" with ${members.length} members`);
  }
}

// Create direct message chats
async function createDirectChats(userId: string, mockUsers: MockUser[]) {
  console.log('📱 Creating direct message chats...');

  const dmPartners = mockUsers.sort(() => Math.random() - 0.5).slice(0, CONFIG.chats.directChats);

  for (const partner of dmPartners) {
    // Create or get DM chat
    const { data: existingChat } = await supabase
      .from('chats')
      .select('*, chat_members!inner(*)')
      .eq('chat_type', 'dm')
      .eq('chat_members.user_id', userId);

    let chat;
    if (!existingChat || existingChat.length === 0) {
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
          chat_type: 'dm',
          created_by: userId,
        })
        .select()
        .single();

      if (error || !newChat) continue;
      chat = newChat;

      // Add both members
      await supabase.from('chat_members').insert([
        { chat_id: chat.id, user_id: userId, role: 'member' },
        { chat_id: chat.id, user_id: partner.id, role: 'member' },
      ]);
    }

    // Add some messages
    const messageCount = Math.floor(Math.random() * 8) + 3;
    const messages = [];
    const chatId = chat?.id || (existingChat && existingChat[0].id);

    if (!chatId) continue; // Skip if no chat ID

    for (let i = 0; i < messageCount; i++) {
      const isFromPartner = Math.random() > 0.3;
      const personality = getPersonalityFromBehavior(partner.mock_personality_id);
      const templates =
        messageTemplates[personality as keyof typeof messageTemplates] || messageTemplates['degen'];

      messages.push({
        chat_id: chatId,
        sender_id: isFromPartner ? partner.id : userId,
        content: getRandomTemplate(templates.greeting),
        created_at: new Date(Date.now() - (messageCount - i) * 60 * 60 * 1000).toISOString(),
      });
    }

    if (messages.length > 0) {
      const { error: msgError } = await supabase.from('messages').insert(messages);
      if (msgError) console.error('Error creating DM messages:', msgError);
    }
  }

  console.log(`  ✅ Created ${dmPartners.length} direct message conversations`);
}

// Create notifications
async function createNotifications(userId: string, mockUsers: MockUser[]) {
  console.log('🔔 Creating notifications...');

  const notifications = [];
  const now = Date.now();

  // Follow notifications
  const recentFollowers = mockUsers.slice(0, 5);
  for (let i = 0; i < recentFollowers.length; i++) {
    notifications.push({
      user_id: userId,
      type: 'follow',
      data: {
        followerId: recentFollowers[i].id,
        followerUsername: recentFollowers[i].username,
      },
      created_at: new Date(now - i * 30 * 60 * 1000).toISOString(), // Space out by 30 mins
    });
  }

  // Reaction notification (using milestone type as a workaround)
  notifications.push({
    user_id: userId,
    type: 'milestone',
    data: {
      badgeId: 'reactions',
      badgeName: 'Popular Post',
      achievement: '5 people reacted to your post',
    },
    created_at: new Date(now - 60 * 60 * 1000).toISOString(),
  });

  // Tail notification
  const mockPostId = crypto.randomUUID();
  notifications.push({
    user_id: userId,
    type: 'tail',
    data: {
      actorId: mockUsers[0].id,
      actorUsername: mockUsers[0].username,
      postId: mockPostId,
      betId: crypto.randomUUID(),
      amount: 100,
    },
    created_at: new Date(now - 90 * 60 * 1000).toISOString(),
  });

  // Message notification
  notifications.push({
    user_id: userId,
    type: 'message',
    data: {
      chatId: crypto.randomUUID(),
      senderId: mockUsers[1].id,
      senderUsername: mockUsers[1].username,
      preview: 'You have 3 new messages in NBA Degens 🏀',
    },
    created_at: new Date(now - 45 * 60 * 1000).toISOString(),
  });

  const { error } = await supabase.from('notifications').insert(notifications);
  if (error) console.error('Error creating notifications:', error);
  else console.log(`  ✅ Created ${notifications.length} notifications`);
}

// Main setup function
async function setupMockEcosystem() {
  console.log('🎬 Setting up complete mock ecosystem...\n');

  // Get username from command line
  const usernameArg = process.argv.find((arg) => arg.startsWith('--username='));
  const skipUserArg = process.argv.includes('--skip-user');

  if (!usernameArg && !skipUserArg) {
    console.error('❌ Please provide username: --username=YOUR_USERNAME');
    console.error('   Or use --skip-user to create mock content without a real user');
    console.error('\nExample: bun run scripts/mock/unified-setup.ts --username=mitchforest');
    console.error('         bun run scripts/mock/unified-setup.ts --skip-user');
    process.exit(1);
  }

  try {
    let userId: string;

    if (skipUserArg) {
      console.log('⚠️  Running in skip-user mode - creating mock content only\n');
      // Use the first mock user as a placeholder
      const { data: firstMockUser } = await supabase
        .from('users')
        .select('id')
        .eq('is_mock', true)
        .limit(1)
        .single();

      if (!firstMockUser) {
        console.error(
          '❌ No mock users found. Please run: bun run scripts/mock/generators/users.ts'
        );
        process.exit(1);
      }

      userId = firstMockUser.id;
    } else {
      const username = usernameArg!.split('=')[1];

      // Get user
      const user = await getUserByUsername(username);
      if (!user) {
        console.log('\n🔧 Would you like to create this user? Run:');
        console.log(`   bun run scripts/mock/unified-setup.ts --skip-user`);
        console.log('   to create mock content without a specific user\n');
        process.exit(1);
      }

      console.log(`✅ Found user: ${username} (${user.id})\n`);
      userId = user.id;
    }

    // Get mock users
    const mockUsers = await getMockUsers();
    console.log(`✅ Found ${mockUsers.length} mock users\n`);

    // Get games
    const games = await getUpcomingGames();
    console.log(`✅ Found ${games.length} upcoming games\n`);

    // Create all content and relationships
    if (!skipUserArg) {
      await createFollowRelationships(userId, mockUsers);
      await createNotifications(userId, mockUsers);
    }

    await createStories(mockUsers);
    await createPostsWithEngagement(userId, mockUsers, games);
    await createGroupChats(userId, mockUsers);

    if (!skipUserArg) {
      await createDirectChats(userId, mockUsers);
    }

    console.log('\n✅ Mock ecosystem setup complete!');
    console.log('\n📋 What was created:');
    if (!skipUserArg) {
      console.log(`  • ${CONFIG.social.followsFromMocks} mock users following you`);
      console.log(`  • You following ${CONFIG.social.userFollowsMocks} mock users`);
    }
    console.log(`  • ${CONFIG.posts.stories} active stories`);
    console.log(`  • ${CONFIG.posts.recent} recent posts with reactions and comments`);
    console.log(`  • ${CONFIG.posts.picks} pick posts with tail/fade actions`);
    console.log(`  • ${CONFIG.chats.groups.length} group chats with active conversations`);
    if (!skipUserArg) {
      console.log(`  • ${CONFIG.chats.directChats} direct message conversations`);
      console.log(`  • ${CONFIG.notifications.recent} recent notifications`);
    }
    console.log('\n🚀 Your app should now have a vibrant, interactive community!');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupMockEcosystem();
