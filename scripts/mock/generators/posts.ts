#!/usr/bin/env bun

import { supabase } from '../../supabase-client';
import type { Database } from '@/types/database';
import { MOCK_CONFIG, getRandomStake, getRandomMediaUrl } from '../config';
import { postTemplates, getRandomTemplate, fillTemplate, mockMediaUrls } from '../templates';
import { generateBetDetails } from '../utils/helpers';

type Tables = Database['public']['Tables'];
type Post = Tables['posts']['Insert'];
type User = Tables['users']['Row'];
type Game = Tables['games']['Row'];

export async function createStoriesForMockUsers(mockUsers: User[]) {
  console.log('📸 Creating stories...');

  const stories = [];
  const storyUsers = mockUsers
    .sort(() => Math.random() - 0.5)
    .slice(0, MOCK_CONFIG.content.stories.count);

  // Use all available categories for better variety
  const allCategories = Object.keys(
    MOCK_CONFIG.content.stories.mediaUrls
  ) as (keyof typeof MOCK_CONFIG.content.stories.mediaUrls)[];

  for (let i = 0; i < storyUsers.length; i++) {
    const user = storyUsers[i];
    // Create 1-3 stories per user
    const storyCount = Math.floor(Math.random() * 3) + 1;

    for (let j = 0; j < storyCount; j++) {
      const mediaCategory = allCategories[(i + j) % allCategories.length];

      stories.push({
        user_id: user.id,
        media_url: getRandomMediaUrl(mediaCategory),
        media_type: 'photo' as const,
        caption: j === 0 ? 'Check this out! 🔥' : j === 1 ? 'Game day vibes 🏀' : "Let's go! 💪",
        created_at: new Date(
          Date.now() - (j * 2 + Math.random() * 4) * 60 * 60 * 1000
        ).toISOString(),
        expires_at: new Date(Date.now() + (20 - j * 2) * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  const { error } = await supabase.from('stories').insert(stories);
  if (error) {
    console.error('Error creating stories:', error);
    return [];
  }

  console.log(`  ✅ Created ${stories.length} stories for ${storyUsers.length} users`);
  return stories;
}

export async function createPostsForMockUsers(
  userId: string,
  mockUsers: User[],
  games: Game[],
  bets: Array<{
    id: string;
    user_id: string;
    game_id: string;
    status: string;
    stake: number;
    actual_win: number;
    settled_at: string | null;
  }>
) {
  console.log('📝 Creating posts...');

  const posts: Post[] = [];
  const upcomingGames = games.filter((g) => g.status === 'scheduled');

  // 1. Create user's posts
  for (let i = 0; i < MOCK_CONFIG.content.posts.userPosts; i++) {
    if (i < MOCK_CONFIG.content.posts.userPosts && games.length > 0) {
      // Create a pick post
      const game = games[Math.floor(Math.random() * games.length)];
      const betType = (['spread', 'moneyline', 'total'] as const)[Math.floor(Math.random() * 3)];
      const betDetails = generateBetDetails(betType, game);
      const stake = getRandomStake();

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
        created_at: new Date(Date.now() - i * 30 * 60 * 1000).toISOString(),
      };

      // Insert bet first
      await supabase.from('bets').insert(bet);

      posts.push({
        id: crypto.randomUUID(),
        user_id: userId,
        caption: `🔒 ${game.home_team} vs ${game.away_team}\n\n${
          betType === 'spread'
            ? `${betDetails.team} ${betDetails.line}`
            : betType === 'total'
              ? `${betDetails.total_type} ${betDetails.line}`
              : `${betDetails.team} ML`
        }\n\nLet's ride 🚀`,
        created_at: bet.created_at,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        media_type: 'photo',
        media_url:
          mockMediaUrls.thinking[Math.floor(Math.random() * mockMediaUrls.thinking.length)],
        post_type: 'pick',
        bet_id: bet.id,
      });
    } else {
      // Regular post - use various categories
      const categories = ['positive', 'celebration', 'wild'] as const;
      const category = categories[Math.floor(Math.random() * categories.length)];
      posts.push({
        id: crypto.randomUUID(),
        user_id: userId,
        caption: getRandomTemplate(postTemplates.reaction.exciting),
        created_at: new Date(Date.now() - i * 45 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        media_type: 'photo',
        media_url:
          mockMediaUrls[category][Math.floor(Math.random() * mockMediaUrls[category].length)],
        post_type: 'content',
      });
    }
  }

  // 2. Create mock users' posts
  const postingUsers = mockUsers.slice(0, MOCK_CONFIG.content.posts.regular);

  for (let i = 0; i < postingUsers.length; i++) {
    const user = postingUsers[i];
    const isPick = i < MOCK_CONFIG.content.posts.picks;

    if (isPick && upcomingGames.length > 0) {
      // Create pick post
      const game = upcomingGames[i % upcomingGames.length];
      const betType = (['spread', 'moneyline', 'total'] as const)[Math.floor(Math.random() * 3)];
      const betDetails = generateBetDetails(betType, game);
      const stake = getRandomStake();

      // Make first 10 pick posts within last 6 hours for trending
      const hoursAgo = i < 10 ? Math.random() * 6 : (i + 1) * 2;

      const bet = {
        id: crypto.randomUUID(),
        user_id: user.id,
        game_id: game.id,
        bet_type: betType,
        bet_details: betDetails,
        odds: -110,
        stake,
        potential_win: Math.floor((stake * 100) / 110),
        status: 'pending' as const,
        created_at: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
      };

      await supabase.from('bets').insert(bet);

      const templates = postTemplates['pick-share'];
      const templateKey =
        betType === 'total' ? 'normal' : Math.random() > 0.5 ? 'confident' : 'normal';

      posts.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        caption: fillTemplate(getRandomTemplate(templates[templateKey as keyof typeof templates]), {
          team: betDetails.team || game.home_team,
          spread: betDetails.line?.toString() || 'ML',
          odds: '-110',
          stake: (stake / 100).toString(),
          type: betType,
          line: betDetails.line?.toString() || 'ML',
        }),
        created_at: bet.created_at,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        media_type: 'photo',
        media_url: getRandomMediaUrl('thinking'),
        post_type: 'pick',
        bet_id: bet.id,
      });
    } else {
      // Regular post
      const mood = (['exciting', 'frustrating', 'analysis'] as const)[
        Math.floor(Math.random() * 3)
      ];

      // Map moods to appropriate media categories
      const moodToCategory = {
        exciting: ['positive', 'celebration', 'wild'],
        frustrating: ['frustration'],
        analysis: ['thinking'],
      };

      const categories = moodToCategory[mood];
      const category = categories[
        Math.floor(Math.random() * categories.length)
      ] as keyof typeof mockMediaUrls;

      posts.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        caption: getRandomTemplate(postTemplates.reaction[mood]),
        created_at: new Date(Date.now() - i * 30 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        media_type: 'photo',
        media_url:
          mockMediaUrls[category][Math.floor(Math.random() * mockMediaUrls[category].length)],
        post_type: 'content',
      });
    }
  }

  // 3. Create outcome posts for settled bets
  const settledBets = bets.filter((b) => b.settled_at);
  const outcomeCount = Math.min(settledBets.length, MOCK_CONFIG.content.posts.outcomes);

  for (let i = 0; i < outcomeCount; i++) {
    const bet = settledBets[i];
    const user = mockUsers.find((u) => u.id === bet.user_id);
    const game = games.find((g) => g.id === bet.game_id);

    if (!user || !game) continue;

    const isWin = bet.status === 'won';
    const templates = isWin
      ? postTemplates['outcome-positive'].normal
      : postTemplates['outcome-negative'].normal;

    posts.push({
      id: crypto.randomUUID(),
      user_id: user.id,
      caption: fillTemplate(getRandomTemplate(templates), {
        team: game.home_team,
        amount: (bet.actual_win / 100).toString(),
        profit: ((bet.actual_win - bet.stake) / 100).toString(),
        score: `${game.home_score || 0}-${game.away_score || 0}`,
      }),
      created_at: new Date(new Date(bet.settled_at!).getTime() + 10 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      media_type: 'photo',
      media_url:
        mockMediaUrls[isWin ? 'celebration' : 'frustration'][
          Math.floor(Math.random() * mockMediaUrls[isWin ? 'celebration' : 'frustration'].length)
        ],
      post_type: 'outcome',
      settled_bet_id: bet.id,
    });
  }

  const { data: insertedPosts, error } = await supabase.from('posts').insert(posts).select();
  if (error) {
    console.error('Error creating posts:', error);
    return [];
  }

  console.log(
    `  ✅ Created ${posts.length} posts (${MOCK_CONFIG.content.posts.userPosts} from user)`
  );
  return insertedPosts || [];
}
