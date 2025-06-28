#!/usr/bin/env bun

/**
 * Main setup orchestrator - creates a complete mock environment
 *
 * Usage: bun run scripts/mock/orchestrators/setup.ts
 */

import { supabase } from '../../supabase-client';
import { generateMockUsers } from '../generators/users';
import { createStoriesForMockUsers, createPostsForMockUsers } from '../generators/posts';
import { createEngagementForPosts, createTrendingPicks } from '../generators/engagement';
import {
  createBetsForBadges,
  createVariedBets,
  createFadeGodBets,
  createRisingStarBets,
  createSuccessfulFadeBets,
  createHotBettorBets,
} from '../generators/bets';
import { createMessaging } from '../generators/messaging';
import { createNotificationsForUser } from '../generators/notifications';
import { MOCK_CONFIG } from '../config';
import { generateMockGames } from '../data/games';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type Game = Tables['games']['Row'];

async function createHistoricalContent(mockUsers: User[], games: Game[]) {
  console.log('\n📚 Creating historical content for RAG processing...');

  const historicalPosts = [];
  const historicalBets = [];
  const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);

  // Create historical posts (content type)
  for (const user of mockUsers.slice(0, 10)) {
    // 2-3 posts per user
    const postCount = Math.floor(Math.random() * 2) + 2;

    for (let i = 0; i < postCount; i++) {
      const createdAt = new Date(twentyFiveHoursAgo.getTime() - i * 60 * 60 * 1000);

      historicalPosts.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        caption: `Historical post ${i + 1} from ${user.username} - This content will be archived for RAG processing`,
        created_at: createdAt.toISOString(),
        expires_at: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        media_type: 'photo' as const,
        media_url: 'https://picsum.photos/400/400',
        post_type: 'content' as const,
      });
    }
  }

  // Create historical bets
  for (const user of mockUsers.slice(0, 15)) {
    // 3-5 bets per user
    const betCount = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < betCount; i++) {
      const game = games[Math.floor(Math.random() * games.length)];
      const createdAt = new Date(twentyFiveHoursAgo.getTime() - i * 2 * 60 * 60 * 1000);
      const isWin = Math.random() > 0.5;

      historicalBets.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        game_id: game.id,
        bet_type: Math.random() > 0.5 ? ('spread' as const) : ('total' as const),
        bet_details: {
          team: Math.random() > 0.5 ? game.home_team : game.away_team,
          line: Math.random() > 0.5 ? -3.5 : 3.5,
        },
        odds: -110,
        stake: Math.floor(Math.random() * 5000) + 1000,
        potential_win: Math.floor((Math.floor(Math.random() * 5000) + 1000) * 0.91),
        actual_win: isWin ? Math.floor((Math.floor(Math.random() * 5000) + 1000) * 1.91) : 0,
        status: (isWin ? 'won' : 'lost') as 'won' | 'lost',
        created_at: createdAt.toISOString(),
        settled_at: new Date(createdAt.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  // Insert historical content
  if (historicalPosts.length > 0) {
    const { error } = await supabase.from('posts').insert(historicalPosts);
    if (error) {
      console.error('Error creating historical posts:', error);
    } else {
      console.log(`  ✅ Created ${historicalPosts.length} historical posts`);
    }
  }

  if (historicalBets.length > 0) {
    const { error } = await supabase.from('bets').insert(historicalBets);
    if (error) {
      console.error('Error creating historical bets:', error);
    } else {
      console.log(`  ✅ Created ${historicalBets.length} historical bets`);
    }
  }
}

async function runProductionJobs() {
  console.log('\n🔧 Running production jobs to process historical content...');

  try {
    const { execSync } = await import('child_process');

    // Run content expiration to archive old content
    console.log('  📦 Running content expiration job...');
    execSync('bun run scripts/jobs/content-expiration.ts', { stdio: 'inherit' });

    // Run embedding generation on archived content
    console.log('  🤖 Running embedding generation job...');
    execSync('bun run scripts/jobs/embedding-generation.ts', { stdio: 'inherit' });

    console.log('  ✅ Production jobs completed successfully');
  } catch (error) {
    console.error('Error running production jobs:', error);
    console.log('  ⚠️  Continuing without job processing - some features may not work fully');
  }
}

async function createFollowRelationships(userId: string, mockUsers: User[]) {
  console.log('\n👥 Creating follow relationships...');

  const follows = [];

  // Main user follows mock users
  const usersToFollow = mockUsers
    .sort(() => Math.random() - 0.5)
    .slice(0, MOCK_CONFIG.users.userFollowsMocks);

  for (const mockUser of usersToFollow) {
    follows.push({
      follower_id: userId,
      following_id: mockUser.id,
    });
  }

  // Mock users follow main user
  const mockFollowers = mockUsers
    .sort(() => Math.random() - 0.5)
    .slice(0, MOCK_CONFIG.users.followsFromMocks);

  for (const mockUser of mockFollowers) {
    follows.push({
      follower_id: mockUser.id,
      following_id: userId,
    });
  }

  // Some mock users follow each other
  for (let i = 0; i < mockUsers.length; i++) {
    const follower = mockUsers[i];
    const toFollow = mockUsers
      .filter((u) => u.id !== follower.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 5) + 2);

    for (const following of toFollow) {
      follows.push({
        follower_id: follower.id,
        following_id: following.id,
      });
    }
  }

  // Insert all follows
  const { error } = await supabase.from('follows').insert(follows);
  if (error) {
    console.error('Error creating follows:', error);
  } else {
    console.log(`  ✅ Created ${follows.length} follow relationships`);
    console.log(`  ✅ You follow ${usersToFollow.length} mock users`);
    console.log(`  ✅ ${mockFollowers.length} mock users follow you`);
  }
}

async function createFadeActions(
  userId: string,
  mockUsers: User[],
  posts: Tables['posts']['Row'][]
) {
  console.log('\n🎪 Creating fade actions for fade gods...');

  // Find pick posts from fade-worthy users (square-bob, public-pete)
  const fadeWorthyUsers = mockUsers.filter(
    (u) => u.mock_personality_id === 'square-bob' || u.mock_personality_id === 'public-pete'
  );
  const fadeWorthyUserIds = fadeWorthyUsers.map((u) => u.id);

  const pickPosts = posts.filter(
    (p) => p.post_type === 'pick' && fadeWorthyUserIds.includes(p.user_id)
  );

  if (pickPosts.length === 0) {
    console.log('  ⚠️  No pick posts from fade-worthy users found');
    return;
  }

  // Get existing pick_actions to avoid duplicates
  const postIds = pickPosts.map((p) => p.id);
  const { data: existingActions } = await supabase
    .from('pick_actions')
    .select('post_id, user_id')
    .in('post_id', postIds);

  const existingActionsSet = new Set(
    (existingActions || []).map((a) => `${a.post_id}-${a.user_id}`)
  );

  const pickActions = [];

  // Have some users fade these picks
  const fadingUsers = mockUsers.filter((u) => !fadeWorthyUserIds.includes(u.id)).slice(0, 10); // First 10 non-fade-worthy users

  for (const post of pickPosts) {
    // 3-5 users fade each pick
    const faderCount = Math.floor(Math.random() * 3) + 3;
    const faders = fadingUsers.sort(() => Math.random() - 0.5).slice(0, faderCount);

    for (const fader of faders) {
      // Skip if this user already has an action on this post
      if (existingActionsSet.has(`${post.id}-${fader.id}`)) {
        continue;
      }

      pickActions.push({
        post_id: post.id,
        user_id: fader.id,
        action_type: 'fade' as const,
      });
    }
  }

  if (pickActions.length > 0) {
    const { error } = await supabase.from('pick_actions').insert(pickActions);
    if (error) {
      console.error('Error creating fade actions:', error);
    } else {
      console.log(`  ✅ Created ${pickActions.length} fade actions`);
    }
  }
}

export async function setupMockData(userId: string) {
  console.log('🚀 Starting unified mock data setup...\n');

  try {
    // 1. Check for games and create if needed
    // eslint-disable-next-line prefer-const
    let { data: games, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .order('commence_time', { ascending: false })
      .limit(50);

    if (gamesError) {
      console.error('Error fetching games:', gamesError);
      return;
    }

    // If no games exist, create them
    if (!games || games.length === 0) {
      console.log('🎮 No games found, creating mock games...');
      const mockGames = generateMockGames(7); // Generate games for next 7 days

      const { data: insertedGames, error: insertError } = await supabase
        .from('games')
        .insert(mockGames)
        .select();

      if (insertError) {
        console.error('Error creating games:', insertError);
        return;
      }

      games = insertedGames || [];
      console.log(`  ✅ Created ${games.length} games`);
    }

    console.log(`📊 Found ${games.length} games\n`);

    // 2. Generate mock users
    const mockUsers = await generateMockUsers();
    if (mockUsers.length === 0) {
      console.error('Failed to create mock users');
      return;
    }

    // 3. Phase 1: Create historical content for RAG processing
    await createHistoricalContent(mockUsers, games);

    // 4. Run production jobs to archive and embed historical content
    await runProductionJobs();

    // 5. Phase 2: Create fresh content
    console.log('\n🚀 Creating fresh content...');

    // 6. Create follow relationships
    await createFollowRelationships(userId, mockUsers);

    // 7. Create stories
    await createStoriesForMockUsers(mockUsers);

    // 8. Create badge-worthy betting patterns
    const badgeBets = await createBetsForBadges(mockUsers, games);

    // 9. Create rising star bets for new users
    const risingStarBets = await createRisingStarBets(mockUsers, games);

    // 10. Create successful fade bets for fade god badge
    await createSuccessfulFadeBets(mockUsers, games);

    // 11. Create hot bettor patterns
    const hotBettorBets = await createHotBettorBets(mockUsers, games);

    // 12. Create fade god patterns (users with bad records to fade)
    const fadeGodBets = await createFadeGodBets(mockUsers, games);

    // 13. Create varied betting activity
    const { settledBets } = await createVariedBets(
      mockUsers.slice(MOCK_CONFIG.badges.totalPersonas),
      games
    );

    // 14. Create posts (including outcome posts)
    const allSettledBets = [
      ...badgeBets,
      ...fadeGodBets,
      ...settledBets,
      ...risingStarBets,
      ...hotBettorBets,
    ];
    const posts = await createPostsForMockUsers(userId, mockUsers, games, allSettledBets);

    // 14a. Ensure fade-worthy users create pick posts
    const fadeWorthyUsers = mockUsers.filter(
      (u) => u.mock_personality_id === 'square-bob' || u.mock_personality_id === 'public-pete'
    );

    if (fadeWorthyUsers.length > 0) {
      console.log('📝 Creating pick posts for fade-worthy users...');
      const fadeWorthyPosts = [];

      for (const user of fadeWorthyUsers) {
        // Create 2-3 pick posts per fade-worthy user
        const postCount = Math.floor(Math.random() * 2) + 2;

        for (let i = 0; i < postCount; i++) {
          const game = games[Math.floor(Math.random() * games.length)];
          const betType = 'spread' as const;
          const bet = {
            id: crypto.randomUUID(),
            user_id: user.id,
            game_id: game.id,
            bet_type: betType,
            bet_details: { team: game.home_team, line: -7.5 }, // Bad line
            odds: -110,
            stake: 2000,
            potential_win: 1818,
            status: 'pending' as const,
            created_at: new Date(Date.now() - (i + 1) * 4 * 60 * 60 * 1000).toISOString(),
          };

          await supabase.from('bets').insert(bet);

          fadeWorthyPosts.push({
            id: crypto.randomUUID(),
            user_id: user.id,
            caption: `🔒 ${game.home_team} -7.5\n\nThis line is a GIFT! Hammer it! 🔨`,
            created_at: bet.created_at,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            media_type: 'photo' as const,
            media_url: 'https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif',
            post_type: 'pick' as const,
            bet_id: bet.id,
          });
        }
      }

      if (fadeWorthyPosts.length > 0) {
        const { data: insertedPosts } = await supabase
          .from('posts')
          .insert(fadeWorthyPosts)
          .select();
        if (insertedPosts) {
          posts.push(...insertedPosts);
          console.log(`  ✅ Created ${fadeWorthyPosts.length} pick posts for fading`);
        }
      }
    }

    // 15. Create engagement
    if (posts.length > 0) {
      await createEngagementForPosts(posts, mockUsers);
      await createTrendingPicks(posts, mockUsers);
      await createFadeActions(userId, mockUsers, posts);
    }

    // 16. Create messaging
    await createMessaging(userId, mockUsers);

    // 17. Create notifications for the main user
    await createNotificationsForUser(userId, mockUsers);

    // 18. Run badge calculation job
    console.log('\n🏆 Running badge calculation...');

    // First, update all bankrolls based on actual bets
    console.log('💰 Updating bankrolls based on bets...');
    const { data: allBets } = await supabase
      .from('bets')
      .select('user_id, status, stake, actual_win')
      .in('status', ['won', 'lost']);

    if (allBets) {
      const bankrollUpdates = new Map<
        string,
        { wins: number; losses: number; profit: number; wagered: number }
      >();

      allBets.forEach((bet) => {
        if (!bankrollUpdates.has(bet.user_id)) {
          bankrollUpdates.set(bet.user_id, { wins: 0, losses: 0, profit: 0, wagered: 0 });
        }

        const stats = bankrollUpdates.get(bet.user_id)!;
        stats.wagered += bet.stake;

        if (bet.status === 'won') {
          stats.wins++;
          stats.profit += (bet.actual_win || 0) - bet.stake;
        } else {
          stats.losses++;
          stats.profit -= bet.stake;
        }
      });

      // Update bankrolls
      for (const [userId, stats] of bankrollUpdates) {
        await supabase
          .from('bankrolls')
          .update({
            win_count: stats.wins,
            loss_count: stats.losses,
            balance: 100000 + stats.profit,
            total_wagered: stats.wagered,
            total_won: stats.profit > 0 ? stats.profit : 0,
          })
          .eq('user_id', userId);
      }

      console.log(`  ✅ Updated bankrolls for ${bankrollUpdates.size} users`);
    }

    try {
      // Run the badge calculation script directly
      const { execSync } = await import('child_process');
      execSync('bun run scripts/jobs/badge-calculation.ts', { stdio: 'inherit' });
      console.log('  ✅ Badges calculated successfully');
    } catch (badgeError) {
      console.error('Error calculating badges:', badgeError);
    }

    // 19. Ensure badge users are searchable
    console.log('\n🔍 Making badge users searchable...');

    // Check if we have users that meet the search criteria
    const { data: searchableRisingStars } = await supabase
      .from('users')
      .select('id, username, bankrolls!inner(win_count, loss_count)')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .is('is_mock', true);

    const risingStarsWithGoodRecord = (searchableRisingStars || []).filter((user) => {
      const total = (user.bankrolls?.win_count || 0) + (user.bankrolls?.loss_count || 0);
      const winRate = total > 0 ? (user.bankrolls?.win_count || 0) / total : 0;
      return total >= 3 && winRate >= 0.5;
    });

    console.log(`  ✅ Found ${risingStarsWithGoodRecord.length} rising stars with good records`);

    // Check for fade material (bad record users)
    const { data: fadeMaterialUsers } = await supabase
      .from('users')
      .select('id, username, bankrolls!inner(win_count, loss_count)')
      .is('is_mock', true);

    const usersWithBadRecord = (fadeMaterialUsers || []).filter((user) => {
      const total = (user.bankrolls?.win_count || 0) + (user.bankrolls?.loss_count || 0);
      const winRate = total > 0 ? (user.bankrolls?.win_count || 0) / total : 0;
      return total >= 10 && winRate < 0.4;
    });

    console.log(`  ✅ Found ${usersWithBadRecord.length} users with bad records (fade material)`);

    // If we don't have enough fade material, create some bad bets for square-bob/public-pete users
    if (usersWithBadRecord.length < 2) {
      console.log('  📝 Creating additional losses for fade material users...');

      const fadeTargets = mockUsers
        .filter(
          (u) => u.mock_personality_id === 'square-bob' || u.mock_personality_id === 'public-pete'
        )
        .slice(0, 2);

      const badBets = [];
      for (const user of fadeTargets) {
        // Create 15 losses and 5 wins (25% win rate)
        for (let i = 0; i < 20; i++) {
          const game = games[i % games.length];
          const isWin = i < 5; // First 5 are wins, rest are losses

          badBets.push({
            id: crypto.randomUUID(),
            user_id: user.id,
            game_id: game.id,
            bet_type: 'spread' as const,
            bet_details: { team: game.home_team, line: -10.5 },
            stake: 2000,
            odds: -110,
            potential_win: 1818,
            actual_win: isWin ? 3818 : 0,
            status: (isWin ? 'won' : 'lost') as 'won' | 'lost',
            created_at: new Date(Date.now() - (i + 1) * 3 * 60 * 60 * 1000).toISOString(),
            settled_at: new Date(Date.now() - i * 3 * 60 * 60 * 1000).toISOString(),
          });
        }
      }

      if (badBets.length > 0) {
        await supabase.from('bets').insert(badBets);

        // Update bankrolls for these users
        for (const user of fadeTargets) {
          await supabase
            .from('bankrolls')
            .update({
              win_count: 5,
              loss_count: 15,
              balance: 100000 - 15 * 2000 + 5 * 1818, // Lost money overall
            })
            .eq('user_id', user.id);
        }

        console.log(`  ✅ Created fade material for ${fadeTargets.length} users`);
      }
    }

    console.log('\n✨ Mock data setup complete!');
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

// Run if called directly
const isMainModule = process.argv[1] === import.meta.url.replace('file://', '');
if (isMainModule) {
  // Get username from command line
  const args = process.argv.slice(2);
  const usernameArg = args.find((arg) => arg.startsWith('--username='));
  const username = usernameArg ? usernameArg.split('=')[1] : null;

  if (!username) {
    console.error(
      '❌ Username required. Use: bun run scripts/mock/orchestrators/setup.ts --username=YOUR_USERNAME'
    );
    process.exit(1);
  }

  // Get user by username
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (userError || !user) {
    console.error(`❌ User "${username}" not found. Please create an account first.`);
    process.exit(1);
  }

  console.log(`👤 Setting up mock data for user: ${username}\n`);
  await setupMockData(user.id);
}
