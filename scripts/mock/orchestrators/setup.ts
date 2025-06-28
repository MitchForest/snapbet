#!/usr/bin/env bun

/**
 * Main setup orchestrator - creates a complete mock environment
 *
 * Usage: bun run scripts/mock/orchestrators/setup.ts
 */

import { supabase } from '../../supabase-client';
import { generateMockUsers } from '../generators/users';
import { createStoriesForMockUsers, createPostsForMockUsers } from '../generators/posts';
import { createEngagementForPosts } from '../generators/engagement';
import { createBetsForBadges, createVariedBets, createFadeGodBets } from '../generators/bets';
import { createMessaging } from '../generators/messaging';
import { createNotificationsForUser } from '../generators/notifications';
import { MOCK_CONFIG } from '../config';
import { generateMockGames } from '../data/games';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];

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

  const pickActions = [];

  // Have some users fade these picks
  const fadingUsers = mockUsers.filter((u) => !fadeWorthyUserIds.includes(u.id)).slice(0, 10); // First 10 non-fade-worthy users

  for (const post of pickPosts) {
    // 3-5 users fade each pick
    const faderCount = Math.floor(Math.random() * 3) + 3;
    const faders = fadingUsers.sort(() => Math.random() - 0.5).slice(0, faderCount);

    for (const fader of faders) {
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

    // 3. Create follow relationships
    await createFollowRelationships(userId, mockUsers);

    // 4. Create stories
    await createStoriesForMockUsers(mockUsers);

    // 5. Create badge-worthy betting patterns
    const badgeBets = await createBetsForBadges(mockUsers, games);

    // 6. Create fade god patterns
    const fadeGodBets = await createFadeGodBets(mockUsers, games);

    // 7. Create varied betting activity
    const { settledBets } = await createVariedBets(
      mockUsers.slice(MOCK_CONFIG.badges.totalPersonas),
      games
    );

    // 8. Create posts (including outcome posts)
    const allSettledBets = [...badgeBets, ...fadeGodBets, ...settledBets];
    const posts = await createPostsForMockUsers(userId, mockUsers, games, allSettledBets);

    // 9. Create engagement
    if (posts.length > 0) {
      await createEngagementForPosts(posts, mockUsers);
      await createFadeActions(userId, mockUsers, posts);
    }

    // 10. Create messaging
    await createMessaging(userId, mockUsers);

    // 11. Create notifications for the main user
    await createNotificationsForUser(userId, mockUsers);

    // 12. Run badge calculation job
    console.log('\n🏆 Running badge calculation...');
    try {
      // Run the badge calculation script directly
      const { execSync } = await import('child_process');
      execSync('bun run scripts/jobs/badge-calculation.ts', { stdio: 'inherit' });
      console.log('  ✅ Badges calculated successfully');
    } catch (badgeError) {
      console.error('Error calculating badges:', badgeError);
    }

    // 13. Ensure badge users are searchable
    console.log('\n🔍 Making badge users searchable...');
    // The badge calculation should have already assigned badges, but let's verify
    const { data: badgeUsers } = await supabase
      .from('user_badges')
      .select('user_id, badge_type')
      .in('badge_type', ['fade_god', 'rising_star']);
    
    if (badgeUsers && badgeUsers.length > 0) {
      console.log(`  ✅ Found ${badgeUsers.length} users with fade_god or rising_star badges`);
    } else {
      console.log('  ⚠️  No fade_god or rising_star badges found');
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
