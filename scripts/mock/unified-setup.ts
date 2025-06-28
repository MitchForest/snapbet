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
    followsFromMocks: 15, // Mock users following the input user
    userFollowsMocks: 25, // Input user following mock users
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
const ALLOWED_EMOJIS = ['🔥', '💰', '😂', '😭', '💯', '🎯'];

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

// Helper function to generate proper bet details based on bet type
function generateBetDetails(betType: 'spread' | 'moneyline' | 'total', game: Game) {
  switch (betType) {
    case 'spread': {
      const favoriteTeam = Math.random() > 0.5 ? game.home_team : game.away_team;
      const spread = Math.floor(Math.random() * 10) + 1; // 1-10 point spread
      return {
        team: favoriteTeam,
        line: spread * (Math.random() > 0.5 ? 1 : -1),
      };
    }
    case 'total': {
      const totalLine = 200 + Math.floor(Math.random() * 50); // 200-250 range
      return {
        total_type: (Math.random() > 0.5 ? 'over' : 'under') as 'over' | 'under',
        line: totalLine,
      };
    }
    case 'moneyline':
      return {
        team: Math.random() > 0.5 ? game.home_team : game.away_team,
      };
  }
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

// Helper function to get the start of the week (Monday)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

// Helper function to get days since Monday
function getDaysSinceMonday(): number {
  const now = new Date();
  const dayOfWeek = now.getDay();
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, so it's 6 days since Monday
}

// Helper function for story captions
function getRandomStoryCaption(): string {
  const captions = [
    'Game time 🏀',
    'Locked in 🔒',
    'Trust the process 📈',
    'Books are scared 😤',
    'Feeling good about tonight 🔥',
    'Line movement 👀',
    "Who's tailing? 🚀",
    'Another day, another play 💰',
    "Let's ride 🎯",
    'Fade or tail? 🤔',
  ];
  return captions[Math.floor(Math.random() * captions.length)];
}

// Create stories
async function createStories(mockUsers: MockUser[]) {
  console.log('📸 Creating stories...');

  const stories = [];
  const activeUsers = mockUsers.slice(0, CONFIG.posts.stories);

  for (const user of activeUsers) {
    // Randomly select a GIF category for each story
    const categories = ['thinking', 'positive', 'celebration', 'frustration', 'all'];
    const category = categories[Math.floor(Math.random() * categories.length)];

    let mediaUrl = '';
    if (category === 'all') {
      // Pick from all available GIFs
      const allGifs = [
        ...mockMediaUrls.thinking,
        ...mockMediaUrls.positive,
        ...mockMediaUrls.celebration,
        ...mockMediaUrls.frustration,
      ];
      mediaUrl = allGifs[Math.floor(Math.random() * allGifs.length)];
    } else {
      mediaUrl =
        mockMediaUrls[category as keyof typeof mockMediaUrls][
          Math.floor(Math.random() * mockMediaUrls[category as keyof typeof mockMediaUrls].length)
        ];
    }

    stories.push({
      user_id: user.id,
      media_url: mediaUrl, // Always include a GIF
      media_type: 'photo' as const, // GIFs are treated as photos
      caption: Math.random() > 0.5 ? getRandomStoryCaption() : null,
      created_at: new Date(Date.now() - Math.random() * 20 * 60 * 60 * 1000).toISOString(), // Within last 20 hours
      expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
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

  // First, create some posts from the main user with GIFs
  const userPostCount = 3;
  for (let i = 0; i < userPostCount; i++) {
    const postType = ['regular', 'pick'][Math.floor(Math.random() * 2)] as 'regular' | 'pick';
    const game = games[Math.floor(Math.random() * games.length)];

    if (postType === 'pick') {
      // Create a bet for the pick
      const betType = (['spread', 'moneyline', 'total'] as const)[Math.floor(Math.random() * 3)];
      const betDetails = generateBetDetails(betType, game);
      const stake = [500, 750, 1000][Math.floor(Math.random() * 3)];

      const bet = {
        id: crypto.randomUUID(),
        user_id: userId,
        game_id: game.id,
        bet_type: betType,
        bet_details: betDetails,
        odds: -110,
        stake,
        potential_win: Math.floor((stake * 100) / 110),
        status: 'pending' as const,
        created_at: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString(),
      };

      bets.push(bet);

      // Create pick post with thinking GIF
      posts.push({
        id: crypto.randomUUID(),
        user_id: userId,
        caption: `🔒 ${game.home_team} vs ${game.away_team}\n\n${betType === 'spread' ? `${betDetails.team} ${betDetails.line}` : betType === 'total' ? `${betDetails.total_type} ${betDetails.line}` : `${betDetails.team} ML`}\n\nLet's ride 🚀`,
        created_at: bet.created_at,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        media_type: 'photo',
        media_url:
          mockMediaUrls.thinking[Math.floor(Math.random() * mockMediaUrls.thinking.length)],
        post_type: 'pick',
        bet_id: bet.id,
      });
    } else {
      // Regular post with random GIF
      const gifCategories = ['positive', 'celebration', 'frustration', 'thinking'];
      const category = gifCategories[Math.floor(Math.random() * gifCategories.length)];

      posts.push({
        id: crypto.randomUUID(),
        user_id: userId,
        caption: [
          'Books are scared today 😤',
          'Another day, another dub 💰',
          'Trust the process 📈',
          'Who else is feeling good about tonight? 🔥',
          'Line movement tells the story 👀',
        ][Math.floor(Math.random() * 5)],
        created_at: new Date(Date.now() - i * 3 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        media_type: 'photo',
        media_url:
          mockMediaUrls[category as keyof typeof mockMediaUrls][
            Math.floor(Math.random() * mockMediaUrls[category as keyof typeof mockMediaUrls].length)
          ],
        post_type: 'content',
      });
    }
  }

  // Create historical winning bets for "Hot Bettors"
  console.log('  🔥 Creating hot bettor history...');
  const hotBettors = mockUsers.slice(0, 5);
  const currentWeekStart = getWeekStart(new Date());
  console.log(
    `  📅 Current week: ${currentWeekStart.toISOString()} to now ${new Date().toISOString()}`
  );
  console.log(`  📅 Days since Monday: ${getDaysSinceMonday()}`);

  // Create settled bets type
  type SettledBet = {
    id: string;
    user_id: string;
    game_id: string;
    bet_type: 'spread' | 'moneyline' | 'total';
    bet_details: {
      team?: string;
      line?: number;
      total_type?: 'over' | 'under';
    };
    stake: number;
    odds: number;
    potential_win: number;
    actual_win: number;
    status: 'won' | 'lost';
    settled_at: string;
    created_at: string;
  };

  const settledBets: SettledBet[] = [];

  for (const bettor of hotBettors) {
    // Create 4-6 winning bets this week
    const winCount = Math.floor(Math.random() * 3) + 4;
    for (let i = 0; i < winCount; i++) {
      const game = games[Math.floor(Math.random() * games.length)];
      const daysAgo = Math.floor(Math.random() * getDaysSinceMonday());
      const stake = Math.floor(Math.random() * 2000) + 500;
      settledBets.push({
        id: crypto.randomUUID(),
        user_id: bettor.id,
        game_id: game.id,
        bet_type: 'spread' as const,
        bet_details: generateBetDetails('spread', game),
        stake: stake,
        odds: -110,
        potential_win: Math.floor((stake * 100) / 110),
        actual_win: stake + Math.floor((stake * 100) / 110),
        status: 'won' as const,
        settled_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - (daysAgo + 1) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Add 1-2 losses for realism
    const lossCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < lossCount; i++) {
      const game = games[Math.floor(Math.random() * games.length)];
      const daysAgo = Math.floor(Math.random() * getDaysSinceMonday());
      const stake = Math.floor(Math.random() * 1000) + 500; // 500-1500
      settledBets.push({
        id: crypto.randomUUID(),
        user_id: bettor.id,
        game_id: game.id,
        bet_type: 'moneyline' as const,
        bet_details: generateBetDetails('moneyline', game),
        stake: stake,
        odds: -110,
        potential_win: Math.floor((stake * 100) / 110),
        actual_win: 0,
        status: 'lost' as const,
        settled_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - (daysAgo + 1) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  // Add to main bets array
  bets.push(...settledBets);

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
      const stake = 1500;
      const betId = crypto.randomUUID();

      // All bets settled within current week
      const maxDaysAgo = Math.min(getDaysSinceMonday(), 6);
      const daysAgo = Math.random() * maxDaysAgo;
      const hoursAgo = daysAgo * 24 + Math.floor(Math.random() * 6);

      const settledAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
      const createdAt = new Date(settledAt.getTime() - 3 * 60 * 60 * 1000);

      const betType = ['spread', 'moneyline'][Math.floor(Math.random() * 2)] as
        | 'spread'
        | 'moneyline';

      bets.push({
        id: betId,
        user_id: hotUser.id,
        game_id: game.id,
        bet_type: betType,
        bet_details: generateBetDetails(betType, game),
        stake: stake,
        odds: -110,
        potential_win: Math.floor((stake * 100) / 110),
        actual_win: isWin ? stake + Math.floor((stake * 100) / 110) : 0,
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
      const stake = 3000;
      const betId = crypto.randomUUID();
      const daysAgo = Math.floor(Math.random() * 14) + 1; // Spread over 2 weeks

      bets.push({
        id: betId,
        user_id: fadeGod.id,
        game_id: game.id,
        bet_type: 'total' as const,
        bet_details: generateBetDetails('total', game),
        stake: stake,
        odds: -110,
        potential_win: Math.floor((stake * 100) / 110),
        actual_win: isWin ? stake + Math.floor((stake * 100) / 110) : 0,
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
      const stake = 1500;
      const betId = crypto.randomUUID();

      bets.push({
        id: betId,
        user_id: star.id,
        game_id: game.id,
        bet_type: 'moneyline' as const,
        bet_details: generateBetDetails('moneyline', game),
        stake: stake,
        odds: -110,
        potential_win: Math.floor((stake * 100) / 110),
        actual_win: isWin ? stake + Math.floor((stake * 100) / 110) : 0,
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
    const totalWon = userBets.reduce((sum, b) => sum + ('actual_win' in b ? b.actual_win : 0), 0);

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
    // Make sure posts are recent (within last 24 hours for trending picks)
    const hoursAgo = Math.floor(Math.random() * 20) + 1; // 1-20 hours ago
    const postTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    const game = games[i % games.length]; // Rotate through available games

    const isPickPost = i < CONFIG.posts.picks;

    const postData: Post = {
      id: crypto.randomUUID(),
      user_id: user.id,
      created_at: postTime.toISOString(),
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
      const stake = Math.floor(Math.random() * 5000) + 1000;

      bets.push({
        id: betId,
        user_id: user.id,
        game_id: game.id,
        bet_type: betType as 'spread' | 'moneyline',
        bet_details: generateBetDetails(betType, game),
        stake: stake,
        odds: -110,
        potential_win: Math.floor((stake * 100) / 110),
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

    // Randomly select media URL from different categories based on post type
    if (isPickPost) {
      // For pick posts, use thinking or positive GIFs
      const categories = [mockMediaUrls.thinking, mockMediaUrls.positive];
      const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
      postData.media_url = selectedCategory[Math.floor(Math.random() * selectedCategory.length)];
    } else {
      // For regular posts, use various reaction types
      const allMediaUrls = [
        ...mockMediaUrls.celebration,
        ...mockMediaUrls.positive,
        ...mockMediaUrls.frustration,
        ...mockMediaUrls.thinking,
        ...mockMediaUrls.wild,
        ...mockMediaUrls.reaction,
      ];
      postData.media_url = allMediaUrls[Math.floor(Math.random() * allMediaUrls.length)];
    }
    postData.media_type = 'photo';

    posts.push(postData);
  }

  // Insert all data - IMPORTANT: Insert posts BEFORE pick_actions for triggers to work
  if (bets.length > 0) {
    const { error } = await supabase.from('bets').insert(bets);
    if (error) console.error('Error creating bets:', error);
  }

  if (posts.length > 0) {
    const { data: insertedPosts, error } = await supabase.from('posts').insert(posts).select();
    if (error) {
      console.error('Error creating posts:', error);
    } else if (insertedPosts) {
      // Create pick actions for trending picks using actual post IDs
      const pickPosts = insertedPosts.filter((p) => p.post_type === 'pick').slice(0, 10); // Top 10 pick posts

      for (const pickPost of pickPosts) {
        // Create 2-5 tail/fade actions per pick
        const actionCount = Math.floor(Math.random() * 4) + 2;
        const tailingUsers = mockUsers
          .filter((u) => u.id !== pickPost.user_id)
          .sort(() => Math.random() - 0.5)
          .slice(0, actionCount);

        for (const tailer of tailingUsers) {
          // 70% chance to tail, 30% to fade
          const isTail = Math.random() > 0.3;
          pickActions.push({
            post_id: pickPost.id,
            user_id: tailer.id,
            action_type: isTail ? 'tail' : 'fade',
          });
        }
      }

      // Insert pick actions AFTER posts are created
      if (pickActions.length > 0) {
        console.log(`  📊 Attempting to create ${pickActions.length} pick actions...`);
        const { data: pickData, error: pickError } = await supabase
          .from('pick_actions')
          .insert(pickActions)
          .select();
        if (pickError) {
          console.error('❌ Error creating pick actions:', pickError);
          console.error('Sample pick action:', JSON.stringify(pickActions[0], null, 2));
        } else {
          console.log(`  ✅ Successfully created ${pickData?.length || 0} pick actions`);
        }
      }
    }
  }

  // Create reactions and comments
  for (const post of posts) {
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
      .filter((u) => u.id !== post.user_id)
      .sort(() => Math.random() - 0.5)
      .slice(0, reactionCount);

    for (const reactor of reactingUsers) {
      reactions.push({
        post_id: post.id!,
        user_id: reactor.id,
        emoji: ALLOWED_EMOJIS[Math.floor(Math.random() * ALLOWED_EMOJIS.length)],
      });
    }

    // Add comments
    const commentingUsers = mockUsers
      .filter((u) => u.id !== post.user_id)
      .sort(() => Math.random() - 0.5)
      .slice(0, commentCount);

    for (const commenter of commentingUsers) {
      const personality = getPersonalityFromBehavior(commenter.mock_personality_id || '');
      const templates = messageTemplates[personality as keyof typeof messageTemplates];
      const content = getRandomTemplate(templates?.reaction || ["Let's go!"]);

      comments.push({
        post_id: post.id!,
        user_id: commenter.id,
        content: content,
      });
    }
  }

  const { error: reactionError } = await supabase.from('reactions').insert(reactions);
  if (reactionError) console.error('Error creating reactions:', reactionError);

  const { error: commentError } = await supabase.from('comments').insert(comments);
  if (commentError) console.error('Error creating comments:', commentError);

  console.log(`  ✅ Added ${reactions.length} reactions, ${comments.length} comments`);
  console.log(`  ✅ Created ${pickActions.length} pick actions (tails/fades)`);
  console.log(
    `  ✅ Created ${hotBettors.length + additionalHotBettors.length} hot bettors, ${fadeGods.length} fade gods, and ${risingStars.length} rising stars`
  );

  // Create outcome posts for some settled bets from followed users
  console.log('  🎯 Creating outcome posts for settled bets...');
  const outcomePostsToCreate = 8; // Create 8 outcome posts
  const selectedBets = settledBets.slice(0, outcomePostsToCreate);

  for (const bet of selectedBets) {
    const user = mockUsers.find((u) => u.id === bet.user_id);
    if (!user) continue;

    const game = games.find((g) => g.id === bet.game_id);
    if (!game) continue;

    const isWin = bet.status === 'won';
    const personality = getPersonalityFromBehavior(user.mock_personality_id);

    // Choose appropriate template based on win/loss and personality
    let caption = '';
    if (isWin) {
      if (personality === 'sharp-bettor') {
        caption = `📊 +${bet.actual_win} | ${game.home_team} vs ${game.away_team}\n\nAnother one in the books. Process over results.`;
      } else if (personality === 'degen') {
        caption = `LFG!!! 🚀🚀🚀 CASHED +${bet.actual_win}!!!\n\n${game.home_team} vs ${game.away_team} NEVER IN DOUBT!!!`;
      } else {
        caption = `✅ Winner! +${bet.actual_win}\n\n${game.home_team} vs ${game.away_team}`;
      }
    } else {
      if (personality === 'sharp-bettor') {
        caption = `❌ -${bet.stake} | ${game.home_team} vs ${game.away_team}\n\nVariance. On to the next.`;
      } else if (personality === 'degen') {
        caption = `Pain. -${bet.stake} 😭\n\n${game.home_team} vs ${game.away_team} absolutely robbed me`;
      } else {
        caption = `❌ Loss -${bet.stake}\n\n${game.home_team} vs ${game.away_team}`;
      }
    }

    const outcomePost: Post = {
      id: crypto.randomUUID(),
      user_id: user.id,
      caption,
      created_at: new Date(new Date(bet.settled_at).getTime() + 10 * 60 * 1000).toISOString(), // 10 mins after settlement
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      media_type: 'photo',
      media_url: isWin
        ? mockMediaUrls.celebration[Math.floor(Math.random() * mockMediaUrls.celebration.length)]
        : mockMediaUrls.frustration[Math.floor(Math.random() * mockMediaUrls.frustration.length)],
      post_type: 'outcome',
      settled_bet_id: bet.id,
    };

    posts.push(outcomePost);

    // Add some reactions to outcome posts
    const reactionCount = Math.floor(Math.random() * 5) + 3;
    const reactingUsers = mockUsers
      .filter((u) => u.id !== user.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, reactionCount);

    for (const reactor of reactingUsers) {
      reactions.push({
        post_id: outcomePost.id!,
        user_id: reactor.id,
        emoji: isWin ? '🔥' : '😭',
      });
    }
  }

  // Re-insert posts with outcome posts included
  await supabase
    .from('posts')
    .delete()
    .in(
      'id',
      posts.map((p) => p.id!)
    );
  const { error: finalPostError } = await supabase.from('posts').insert(posts);
  if (finalPostError) console.error('Error creating posts with outcomes:', finalPostError);
  else
    console.log(
      `  ✅ Created ${posts.length} total posts including ${outcomePostsToCreate} outcome posts`
    );

  // Re-insert reactions for outcome posts
  await supabase
    .from('reactions')
    .delete()
    .in(
      'post_id',
      posts.map((p) => p.id!)
    );
  const { error: finalReactionError } = await supabase.from('reactions').insert(reactions);
  if (finalReactionError) console.error('Error creating reactions:', finalReactionError);
}

// Create group chats and add user
async function createGroupChats(userId: string, mockUsers: MockUser[]) {
  console.log('💬 Creating group chats...');

  // First, clean up any existing group chats with these names to avoid duplicates
  for (const chatName of CONFIG.chats.groups) {
    const { data: existingChats } = await supabase
      .from('chats')
      .select('id')
      .eq('name', chatName)
      .eq('chat_type', 'group');

    if (existingChats && existingChats.length > 1) {
      // Keep only the first one, delete the rest
      const chatsToDelete = existingChats.slice(1).map((c) => c.id);
      await supabase.from('chats').delete().in('id', chatsToDelete);
    }
  }

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

    // Prepare all members to add at once
    const memberCount = Math.floor(Math.random() * 8) + 8; // 8-15 members
    const selectedMockUsers = mockUsers.slice(0, memberCount);
    const allMemberIds = [userId, ...selectedMockUsers.map((u) => u.id)];

    // Add all members in a single batch to avoid system messages
    const membersToInsert = allMemberIds.map((memberId) => ({
      chat_id: chat.id,
      user_id: memberId,
      role: (memberId === mockUsers[0].id ? 'admin' : 'member') as 'admin' | 'member',
    }));

    await supabase.from('chat_members').upsert(membersToInsert, {
      onConflict: 'chat_id,user_id',
      ignoreDuplicates: true,
    });

    // Add recent messages AFTER all members are added
    const messageCount = Math.floor(Math.random() * 20) + 15; // 15-35 messages
    const messages = [];

    // Start messages 30 minutes after chat creation to ensure system messages appear first
    const chatCreatedAt = chat.created_at || new Date().toISOString();
    const firstMessageTime = new Date(chatCreatedAt).getTime() + 30 * 60 * 1000; // 30 minutes after chat creation

    for (let i = 0; i < messageCount; i++) {
      // Mix of user and mock user messages (30% chance for user messages)
      const isUserMessage = Math.random() < 0.3;
      const sender = isUserMessage
        ? userId
        : allMemberIds[Math.floor(Math.random() * allMemberIds.length)];

      // Skip if it's the user but we're randomly selecting from all members
      if (sender === userId && !isUserMessage) continue;

      const senderUser = sender === userId ? null : mockUsers.find((u) => u.id === sender);

      let content = '';
      if (sender === userId) {
        // User messages
        const userTemplates = [
          'Anyone tailing tonight?',
          'What do you guys think about the Lakers game?',
          "I'm on the over",
          'Locked in 🔒',
          'Who else is on this?',
          'Books are scared of this line',
          'Slam it',
          'This line is moving fast',
          'Got it at -3.5',
          'LFG!! 🚀',
        ];
        content = userTemplates[Math.floor(Math.random() * userTemplates.length)];
      } else {
        // Mock user messages
        const personality = senderUser
          ? getPersonalityFromBehavior(senderUser.mock_personality_id)
          : 'degen';

        const templates =
          messageTemplates[personality as keyof typeof messageTemplates] ||
          messageTemplates['degen'];

        content = fillTemplate(getRandomTemplate(templates.discussion || templates.greeting), {
          team: 'Lakers',
          game: 'Lakers vs Celtics',
        });
      }

      messages.push({
        chat_id: chat.id,
        sender_id: sender,
        content,
        created_at: new Date(firstMessageTime + i * 5 * 60 * 1000).toISOString(), // Space messages 5 minutes apart
      });
    }

    const { error: msgError } = await supabase.from('messages').insert(messages);
    if (msgError) console.error('Error creating messages:', msgError);

    console.log(`  ✅ Created/updated "${chatName}" with ${allMemberIds.length} members`);
  }
}

// Create direct message chats
async function createDirectChats(userId: string, mockUsers: MockUser[]) {
  console.log('📱 Creating direct message chats...');

  const dmPartners = mockUsers.sort(() => Math.random() - 0.5).slice(0, CONFIG.chats.directChats);
  let createdCount = 0;
  let skippedCount = 0;

  for (const partner of dmPartners) {
    try {
      // Check if DM already exists between these two users
      const { data: partnerChats } = await supabase
        .from('chat_members')
        .select('chat_id')
        .eq('user_id', partner.id);

      let chatId = null;

      if (partnerChats && partnerChats.length > 0) {
        // Check each chat to see if it's a DM with the user
        for (const pc of partnerChats) {
          // Check if this is a DM chat
          const { data: chatInfo } = await supabase
            .from('chats')
            .select('id, chat_type')
            .eq('id', pc.chat_id)
            .eq('chat_type', 'dm')
            .single();

          if (chatInfo) {
            // Check if the user is also in this chat
            const { data: userInChat } = await supabase
              .from('chat_members')
              .select('chat_id')
              .eq('chat_id', pc.chat_id)
              .eq('user_id', userId)
              .single();

            if (userInChat) {
              chatId = pc.chat_id;
              skippedCount++;
              break;
            }
          }
        }
      }

      if (!chatId) {
        // Create new DM chat with both members in a transaction-like approach
        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert({
            chat_type: 'dm',
            created_by: userId,
          })
          .select()
          .single();

        if (chatError || !newChat) {
          console.error('Error creating DM chat:', chatError);
          continue;
        }

        // Add BOTH members immediately
        const membersToAdd = [
          { chat_id: newChat.id, user_id: userId, role: 'member' as const },
          { chat_id: newChat.id, user_id: partner.id, role: 'member' as const },
        ];

        const { error: memberError } = await supabase.from('chat_members').insert(membersToAdd);

        if (memberError) {
          console.error('Error adding DM members:', memberError);
          // Clean up the chat since member addition failed
          await supabase.from('chats').delete().eq('id', newChat.id);
          continue;
        }

        chatId = newChat.id;

        // Add some messages with varied conversation flow
        const messageCount = Math.floor(Math.random() * 10) + 5; // 5-15 messages
        const messages = [];

        // Create a more natural conversation flow
        let lastSender = Math.random() > 0.5 ? partner.id : userId;

        for (let i = 0; i < messageCount; i++) {
          // 70% chance to continue with same sender (more natural conversation flow)
          if (Math.random() > 0.7) {
            lastSender = lastSender === partner.id ? userId : partner.id;
          }

          let content = '';
          if (lastSender === userId) {
            // User messages in DMs
            const userDmTemplates = [
              'You see that line move?',
              'What you got tonight?',
              'Nice hit yesterday 💰',
              'Brutal beat on that last one',
              'You tailing or fading?',
              'Check my last pick',
              'Books got this wrong',
              "I'm hammering this",
              'Lock of the day incoming',
              'Trust the process',
            ];
            content = userDmTemplates[Math.floor(Math.random() * userDmTemplates.length)];
          } else {
            // Partner messages
            const personality = getPersonalityFromBehavior(partner.mock_personality_id);
            const templates =
              messageTemplates[personality as keyof typeof messageTemplates] ||
              messageTemplates['degen'];

            // Vary message types based on position in conversation
            if (i === 0) {
              content = getRandomTemplate(templates.greeting);
            } else if (i === messageCount - 1) {
              content = getRandomTemplate(templates.reaction || templates.discussion);
            } else {
              content = getRandomTemplate(templates.discussion || templates.reaction);
            }
          }

          messages.push({
            chat_id: chatId,
            sender_id: lastSender,
            content,
            created_at: new Date(Date.now() - (messageCount - i) * 60 * 60 * 1000).toISOString(),
          });
        }

        if (messages.length > 0) {
          const { error: msgError } = await supabase.from('messages').insert(messages);
          if (msgError) {
            console.error('Error creating DM messages:', msgError);
          } else {
            createdCount++;
          }
        }
      }
    } catch (error) {
      console.error(`Error processing DM with ${partner.username}:`, error);
    }
  }

  console.log(
    `  ✅ Created ${createdCount} new DM conversations (${skippedCount} already existed)`
  );
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
  const tailActor = mockUsers[Math.floor(Math.random() * 5)];
  notifications.push({
    user_id: userId,
    type: 'tail',
    data: {
      actorId: tailActor.id,
      actorUsername: tailActor.username,
      postId: mockPostId,
      betId: crypto.randomUUID(),
      amount: 100,
      title: `${tailActor.username} tailed your pick`,
    },
    created_at: new Date(now - 90 * 60 * 1000).toISOString(),
  });

  // Message notification
  const messageChat = CONFIG.chats.groups[Math.floor(Math.random() * CONFIG.chats.groups.length)];
  notifications.push({
    user_id: userId,
    type: 'message',
    data: {
      chatId: crypto.randomUUID(),
      senderId: mockUsers[1].id,
      senderUsername: mockUsers[1].username,
      preview: `You have 3 new messages in ${messageChat}`,
      title: `New messages in ${messageChat}`,
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
