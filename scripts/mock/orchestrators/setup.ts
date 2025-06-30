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
import {
  generateBehavioralProfile,
  getBetCountForPersonality,
  selectByDistribution,
  generateCaptionForStyle,
  getMediaForContext,
  UserBehavioralProfile,
} from '../generators/profiles';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type Game = Tables['games']['Row'];

async function createHistoricalContent(mockUsers: User[], games: Game[], mainUserId: string) {
  console.log('\n📚 Creating rich historical content for RAG processing...');

  // Generate behavioral profiles for all users
  const userProfiles = new Map<string, UserBehavioralProfile>();

  for (const user of mockUsers) {
    const profile = generateBehavioralProfile(user.mock_personality_id);
    userProfiles.set(user.id, profile);
  }

  const historicalPosts = [];
  const historicalBets = [];

  // Create rich betting history (100-200 bets per user based on personality)
  for (const user of mockUsers) {
    const profile = userProfiles.get(user.id)!;
    const betCount = getBetCountForPersonality(user.mock_personality_id);

    console.log(
      `  Creating ${betCount} historical bets for ${user.username} (${user.mock_personality_id})`
    );

    for (let i = 0; i < betCount; i++) {
      const dayOffset = Math.floor(i / 5); // Average 5 bets per day
      const hourOffset = profile.peakHours[i % profile.peakHours.length];
      const createdAt = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
      createdAt.setHours(hourOffset);

      // Filter games by user's favorite sports
      const relevantGames = games.filter((g) => profile.favoriteSports.includes(g.sport || 'NFL'));

      // Prefer games with favorite teams
      const favoriteTeamGames = relevantGames.filter(
        (g) =>
          profile.favoriteTeams.includes(g.home_team) || profile.favoriteTeams.includes(g.away_team)
      );

      const game =
        favoriteTeamGames.length > 0 && Math.random() < 0.7
          ? favoriteTeamGames[Math.floor(Math.random() * favoriteTeamGames.length)]
          : relevantGames[Math.floor(Math.random() * relevantGames.length)];

      if (!game) continue;

      // Determine bet type based on profile distribution
      const betType = selectByDistribution(profile.betTypeDistribution) as
        | 'spread'
        | 'total'
        | 'moneyline';

      // Calculate stake based on profile pattern
      const baseStake = 2000; // $20
      const variance = 0.8 + Math.random() * 0.4; // 80% to 120% variance
      const stake = Math.round(baseStake * profile.avgStakeMultiplier * variance);

      // Prefer betting on favorite teams
      const team = profile.favoriteTeams.includes(game.home_team)
        ? game.home_team
        : profile.favoriteTeams.includes(game.away_team)
          ? game.away_team
          : Math.random() > 0.5
            ? game.home_team
            : game.away_team;

      // Determine win/loss (sharps win more, squares win less)
      const winRate =
        user.mock_personality_id === 'sharp-steve'
          ? 0.65
          : user.mock_personality_id === 'square-bob'
            ? 0.35
            : user.mock_personality_id === 'public-pete'
              ? 0.4
              : 0.5;
      const isWin = Math.random() < winRate;

      historicalBets.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        game_id: game.id,
        bet_type: betType,
        bet_details: {
          team,
          line: betType === 'spread' ? (Math.random() > 0.5 ? -3.5 : 3.5) : undefined,
          total_type: betType === 'total' ? (Math.random() > 0.5 ? 'over' : 'under') : undefined,
        },
        odds: -110,
        stake,
        potential_win: Math.round(stake * 0.91),
        actual_win: isWin ? Math.round(stake * 1.91) : 0,
        status: (isWin ? 'won' : 'lost') as 'won' | 'lost',
        created_at: createdAt.toISOString(),
        settled_at: new Date(createdAt.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  // Create rich post history with consistent caption styles
  for (const user of mockUsers) {
    const profile = userProfiles.get(user.id)!;
    const postCount = Math.floor(profile.postFrequency * 4); // 4 weeks of posts
    const userBets = historicalBets.filter((b) => b.user_id === user.id);

    console.log(`  Creating ${postCount} historical posts for ${user.username}`);

    for (let i = 0; i < postCount; i++) {
      const dayOffset = Math.floor(i / (profile.postFrequency / 7)); // Spread across days
      const createdAt = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
      createdAt.setHours(profile.peakHours[i % profile.peakHours.length]);

      // Determine post type
      const rand = Math.random();
      const postType =
        rand < profile.pickShareRate
          ? 'pick'
          : rand < profile.pickShareRate + 0.3
            ? 'outcome'
            : 'content';

      if (postType === 'pick' && userBets.length > 0) {
        // Create pick post from a bet
        const bet = userBets[Math.floor(Math.random() * userBets.length)];
        const caption = generateCaptionForStyle(profile.captionStyle, bet.bet_details);
        const mediaUrl = getMediaForContext(
          profile.mediaPreferences,
          'pick',
          MOCK_CONFIG.content.stories.mediaUrls
        );

        historicalPosts.push({
          id: crypto.randomUUID(),
          user_id: user.id,
          caption,
          created_at: createdAt.toISOString(),
          expires_at: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          media_type: 'photo' as const,
          media_url: mediaUrl,
          post_type: 'pick' as const,
          bet_id: bet.id,
        });
      } else if (postType === 'outcome' && userBets.length > 0) {
        // Create outcome post from a settled bet (all historical bets are settled)
        if (userBets.length > 0) {
          const bet = userBets[Math.floor(Math.random() * userBets.length)];
          const isWin = bet.status === 'won';
          const caption = generateCaptionForStyle(profile.captionStyle, bet.bet_details, isWin);
          const mediaUrl = getMediaForContext(
            profile.mediaPreferences,
            isWin ? 'win' : 'loss',
            MOCK_CONFIG.content.stories.mediaUrls
          );

          historicalPosts.push({
            id: crypto.randomUUID(),
            user_id: user.id,
            caption,
            created_at: createdAt.toISOString(),
            expires_at: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            media_type: 'photo' as const,
            media_url: mediaUrl,
            post_type: 'outcome' as const,
            bet_id: bet.id,
          });
        }
      } else {
        // Create regular content post
        const captions = {
          analytical:
            'Line shopping is the difference between profit and loss. Always get the best number.',
          'emoji-heavy': "WHO ELSE IS READY FOR GAME DAY??? 🚀🚀🚀 LET'S EAT!!! 💰💰💰",
          emotional:
            "Nothing beats the feeling of hitting a last second cover! My heart can't take this!",
          minimal: 'Another day, another dollar.',
        };

        const caption = captions[profile.captionStyle] || captions.minimal;
        const mediaUrl = getMediaForContext(
          profile.mediaPreferences,
          'story',
          MOCK_CONFIG.content.stories.mediaUrls
        );

        historicalPosts.push({
          id: crypto.randomUUID(),
          user_id: user.id,
          caption,
          created_at: createdAt.toISOString(),
          expires_at: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          media_type: 'photo' as const,
          media_url: mediaUrl,
          post_type: 'content' as const,
        });
      }
    }
  }

  // Insert historical content
  if (historicalPosts.length > 0) {
    const { error } = await supabase.from('posts').insert(historicalPosts);
    if (error) {
      console.error('Error creating historical posts:', error);
    } else {
      console.log(
        `  ✅ Created ${historicalPosts.length} historical posts with behavioral patterns`
      );
    }
  }

  if (historicalBets.length > 0) {
    const { error } = await supabase.from('bets').insert(historicalBets);
    if (error) {
      console.error('Error creating historical bets:', error);
    } else {
      console.log(`  ✅ Created ${historicalBets.length} historical bets with consistent patterns`);
    }
  }

  // Create historical engagement patterns including main user
  await createHistoricalEngagement(historicalPosts, mockUsers, userProfiles, mainUserId);
}

async function createHistoricalEngagement(
  posts: Array<{
    id: string;
    user_id: string;
    post_type: string;
    [key: string]: unknown;
  }>,
  users: User[],
  profiles: Map<string, UserBehavioralProfile>,
  mainUserId?: string
) {
  console.log('  💬 Creating historical engagement patterns...');

  const reactions = [];
  const pickActions = [];
  const comments = [];

  for (const post of posts) {
    const postUser = users.find((u) => u.id === post.user_id);
    if (!postUser) continue;

    // Get users who would engage with this post
    const engagingUsers = users.filter((u) => {
      if (u.id === post.user_id) return false;
      const profile = profiles.get(u.id)!;

      // Users engage with their followed personality types
      return profile.followsPersonalities.includes(postUser.mock_personality_id || '');
    });

    // Add reactions based on engagement level
    for (const user of engagingUsers) {
      const profile = profiles.get(user.id)!;
      if (profile.engagementLevel === 'lurker') continue;

      const shouldReact = profile.engagementLevel === 'heavy' ? 0.8 : 0.4;
      if (Math.random() < shouldReact) {
        const emoji =
          profile.reactionPreferences[
            Math.floor(Math.random() * profile.reactionPreferences.length)
          ];
        reactions.push({
          post_id: post.id,
          user_id: user.id,
          emoji,
        });
      }
    }

    // Add main user engagement on some posts
    if (mainUserId && post.user_id !== mainUserId && Math.random() < 0.3) {
      reactions.push({
        post_id: post.id,
        user_id: mainUserId,
        emoji: ['🔥', '💰', '🎯', '💪'][Math.floor(Math.random() * 4)],
      });

      // Sometimes add comments too
      if (Math.random() < 0.2) {
        comments.push({
          id: crypto.randomUUID(),
          post_id: post.id,
          user_id: mainUserId,
          content: ['Great pick!', 'Tailing this one', 'Love the analysis', 'BOL!', "Let's ride!"][
            Math.floor(Math.random() * 5)
          ],
          created_at: new Date(
            new Date(post.created_at as string).getTime() + Math.random() * 60 * 60 * 1000
          ).toISOString(),
        });
      }
    }

    // Add pick actions for pick posts
    if (post.post_type === 'pick') {
      const pickUsers = engagingUsers.slice(0, 10); // Max 10 actions per pick

      for (const user of pickUsers) {
        const profile = profiles.get(user.id)!;
        const action = Math.random() < profile.tailVsFade ? 'tail' : 'fade';

        pickActions.push({
          post_id: post.id,
          user_id: user.id,
          action_type: action as 'tail' | 'fade',
        });
      }

      // Main user sometimes tails/fades picks
      if (mainUserId && post.user_id !== mainUserId && Math.random() < 0.25) {
        pickActions.push({
          post_id: post.id,
          user_id: mainUserId,
          action_type: Math.random() < 0.7 ? 'tail' : ('fade' as 'tail' | 'fade'),
        });
      }
    }
  }

  // Insert engagement data
  if (reactions.length > 0) {
    await supabase.from('reactions').insert(reactions);
    console.log(`    ✅ Created ${reactions.length} historical reactions`);
  }

  if (pickActions.length > 0) {
    await supabase.from('pick_actions').insert(pickActions);
    console.log(`    ✅ Created ${pickActions.length} historical pick actions`);
  }

  if (comments.length > 0) {
    await supabase.from('comments').insert(comments);
    console.log(`    ✅ Created ${comments.length} historical comments`);
  }
}

async function createMainUserHistoricalContent(userId: string, games: Game[], mockUsers: User[]) {
  console.log('\n🎯 Creating historical content for main user...');

  const historicalBets = [];
  const historicalPosts = [];
  const historicalStories = [];

  // Create 30-40 historical bets for main user
  const betCount = 35;
  console.log(`  Creating ${betCount} historical bets for main user...`);

  for (let i = 0; i < betCount; i++) {
    const dayOffset = Math.floor(Math.random() * 23) + 7; // 7-30 days ago
    const createdAt = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
    createdAt.setHours(Math.floor(Math.random() * 4) + 18); // Evening hours

    const game = games[Math.floor(Math.random() * games.length)];
    const betType = ['spread', 'total', 'moneyline'][Math.floor(Math.random() * 3)] as
      | 'spread'
      | 'total'
      | 'moneyline';
    const stake = [2500, 5000, 10000, 20000][Math.floor(Math.random() * 4)]; // $25-$200
    const isWin = Math.random() > 0.45; // 55% win rate

    historicalBets.push({
      id: crypto.randomUUID(),
      user_id: userId,
      game_id: game.id,
      bet_type: betType,
      bet_details:
        betType === 'spread'
          ? { team: game.home_team, line: -3.5 }
          : betType === 'total'
            ? { type: 'over', line: 215.5 }
            : { team: game.away_team },
      odds: -110,
      stake,
      potential_win: Math.floor(stake * 0.91),
      actual_win: isWin ? Math.floor(stake * 1.91) : 0,
      status: (isWin ? 'won' : 'lost') as 'won' | 'lost',
      created_at: createdAt.toISOString(),
      settled_at: new Date(createdAt.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    });
  }

  // Create 20-25 historical posts for main user
  const postCount = 23;
  console.log(`  Creating ${postCount} historical posts for main user...`);

  for (let i = 0; i < postCount; i++) {
    const dayOffset = Math.floor(Math.random() * 23) + 7; // 7-30 days ago
    const createdAt = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);

    const postType = Math.random() < 0.4 ? 'pick' : Math.random() < 0.7 ? 'outcome' : 'content';

    if (postType === 'pick' && historicalBets.length > 0) {
      const bet = historicalBets[Math.floor(Math.random() * historicalBets.length)];
      historicalPosts.push({
        id: crypto.randomUUID(),
        user_id: userId,
        caption: '🔥 Feeling good about this one! Lock it in 🔒',
        created_at: createdAt.toISOString(),
        expires_at: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        media_type: 'photo' as const,
        media_url: 'https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif',
        post_type: 'pick' as const,
        bet_id: bet.id,
      });
    } else if (postType === 'outcome' && historicalBets.length > 0) {
      const settledBets = historicalBets.filter((b) => b.status === 'won' || b.status === 'lost');
      if (settledBets.length > 0) {
        const settledBet = settledBets[Math.floor(Math.random() * settledBets.length)];
        const isWin = settledBet.status === 'won';
        historicalPosts.push({
          id: crypto.randomUUID(),
          user_id: userId,
          caption: isWin
            ? '💰 Another one in the books! +$' + settledBet.actual_win / 100
            : 'On to the next one 💪',
          created_at: new Date(
            new Date(settledBet.settled_at).getTime() + 30 * 60 * 1000
          ).toISOString(),
          expires_at: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          media_type: 'photo' as const,
          media_url: isWin
            ? 'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif'
            : 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif',
          post_type: 'outcome' as const,
          bet_id: settledBet.id,
        });
      }
    } else {
      historicalPosts.push({
        id: crypto.randomUUID(),
        user_id: userId,
        caption: "Ready for another great week of action! Who's with me? 🚀",
        created_at: createdAt.toISOString(),
        expires_at: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        media_type: 'photo' as const,
        media_url: 'https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif',
        post_type: 'content' as const,
      });
    }
  }

  // Create 15-20 historical stories for main user
  const storyCount = 18;
  console.log(`  Creating ${storyCount} historical stories for main user...`);

  for (let i = 0; i < storyCount; i++) {
    const dayOffset = Math.floor(Math.random() * 23) + 7; // 7-30 days ago
    const createdAt = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    const categories = Object.keys(
      MOCK_CONFIG.content.stories.mediaUrls
    ) as (keyof typeof MOCK_CONFIG.content.stories.mediaUrls)[];
    const category = categories[Math.floor(Math.random() * categories.length)];

    historicalStories.push({
      user_id: userId,
      media_url:
        MOCK_CONFIG.content.stories.mediaUrls[category][
          Math.floor(Math.random() * MOCK_CONFIG.content.stories.mediaUrls[category].length)
        ],
      media_type: 'photo' as const,
      caption: [
        'Check this out! 🔥',
        'Game day vibes 🏀',
        "Let's go! 💪",
        "Who's tailing? 👀",
        'Lock of the day 🔒',
      ][i % 5],
      created_at: createdAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    });
  }

  // Insert historical content
  if (historicalBets.length > 0) {
    const { error } = await supabase.from('bets').insert(historicalBets);
    if (error) {
      console.error('Error creating main user historical bets:', error);
    } else {
      console.log(`  ✅ Created ${historicalBets.length} historical bets for main user`);
    }
  }

  if (historicalPosts.length > 0) {
    const { error } = await supabase.from('posts').insert(historicalPosts);
    if (error) {
      console.error('Error creating main user historical posts:', error);
    } else {
      console.log(`  ✅ Created ${historicalPosts.length} historical posts for main user`);
    }
  }

  if (historicalStories.length > 0) {
    const { error } = await supabase.from('stories').insert(historicalStories);
    if (error) {
      console.error('Error creating main user historical stories:', error);
    } else {
      console.log(`  ✅ Created ${historicalStories.length} historical stories for main user`);
    }
  }

  // Create engagement on main user's historical posts
  if (historicalPosts.length > 0 && mockUsers.length > 0) {
    console.log('  💬 Creating engagement on main user historical posts...');

    const reactions = [];
    const comments = [];
    const pickActions = [];

    for (const post of historicalPosts) {
      // 2-5 reactions per post
      const reactionCount = Math.floor(Math.random() * 4) + 2;
      const reactingUsers = mockUsers.sort(() => Math.random() - 0.5).slice(0, reactionCount);

      for (const user of reactingUsers) {
        reactions.push({
          post_id: post.id,
          user_id: user.id,
          emoji: ['🔥', '💰', '🎯', '💪'][Math.floor(Math.random() * 4)],
        });
      }

      // 0-2 comments per post
      if (Math.random() < 0.5) {
        const commentCount = Math.floor(Math.random() * 2) + 1;
        const commentingUsers = mockUsers.sort(() => Math.random() - 0.5).slice(0, commentCount);

        for (const user of commentingUsers) {
          comments.push({
            id: crypto.randomUUID(),
            post_id: post.id,
            user_id: user.id,
            content: ['Great pick!', 'Tailing!', 'BOL!', 'Love it!'][Math.floor(Math.random() * 4)],
            created_at: new Date(
              new Date(post.created_at).getTime() + Math.random() * 60 * 60 * 1000
            ).toISOString(),
          });
        }
      }

      // Pick actions for pick posts
      if (post.post_type === 'pick') {
        const actionCount = Math.floor(Math.random() * 3) + 2;
        const actingUsers = mockUsers.sort(() => Math.random() - 0.5).slice(0, actionCount);

        for (const user of actingUsers) {
          pickActions.push({
            post_id: post.id,
            user_id: user.id,
            action_type: Math.random() < 0.8 ? 'tail' : ('fade' as 'tail' | 'fade'),
          });
        }
      }
    }

    // Insert engagement
    if (reactions.length > 0) {
      await supabase.from('reactions').insert(reactions);
      console.log(`    ✅ Created ${reactions.length} reactions`);
    }

    if (comments.length > 0) {
      await supabase.from('comments').insert(comments);
      console.log(`    ✅ Created ${comments.length} comments`);
    }

    if (pickActions.length > 0) {
      await supabase.from('pick_actions').insert(pickActions);
      console.log(`    ✅ Created ${pickActions.length} pick actions`);
    }
  }

  return { bets: historicalBets, posts: historicalPosts };
}

async function createHistoricalStories(users: User[], mainUserId: string) {
  console.log('\n📸 Creating historical stories...');

  const historicalStories = [];

  // Include main user in the users array for story creation
  const allUsers = [{ id: mainUserId, username: 'MainUser' } as User, ...users];

  // Create 5-10 historical stories per user
  for (const user of allUsers) {
    const storyCount = Math.floor(Math.random() * 6) + 5; // 5-10 stories

    for (let i = 0; i < storyCount; i++) {
      const dayOffset = Math.floor(Math.random() * 25) + 2; // 2-27 days ago
      const createdAt = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
      const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

      const categories = Object.keys(
        MOCK_CONFIG.content.stories.mediaUrls
      ) as (keyof typeof MOCK_CONFIG.content.stories.mediaUrls)[];
      const category = categories[Math.floor(Math.random() * categories.length)];

      historicalStories.push({
        user_id: user.id,
        media_url:
          MOCK_CONFIG.content.stories.mediaUrls[category][
            Math.floor(Math.random() * MOCK_CONFIG.content.stories.mediaUrls[category].length)
          ],
        media_type: 'photo' as const,
        caption: [
          'Check this out! 🔥',
          'Game day vibes 🏀',
          "Let's go! 💪",
          "Who's tailing? 👀",
          'Lock of the day 🔒',
        ][i % 5],
        created_at: createdAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      });
    }
  }

  if (historicalStories.length > 0) {
    const { error } = await supabase.from('stories').insert(historicalStories);
    if (error) {
      console.error('Error creating historical stories:', error);
    } else {
      console.log(
        `  ✅ Created ${historicalStories.length} historical stories for ${allUsers.length} users (including main user)`
      );
    }
  }
}

async function createHistoricalMessages(userId: string, mockUsers: User[]) {
  console.log('\n💬 Creating historical messages...');

  const messages = [];
  const chats = [];

  // Create 3-5 historical chats
  const chatCount = Math.floor(Math.random() * 3) + 3;
  const chatUsers = mockUsers.sort(() => Math.random() - 0.5).slice(0, chatCount);

  for (const chatUser of chatUsers) {
    const chatId = crypto.randomUUID();
    const dayOffset = Math.floor(Math.random() * 20) + 10; // 10-30 days ago
    const createdAt = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);

    chats.push({
      id: chatId,
      chat_type: 'dm' as const,
      created_at: createdAt.toISOString(),
      created_by: userId,
    });

    // Create 20-30 messages per chat
    const messageCount = Math.floor(Math.random() * 11) + 20;

    for (let i = 0; i < messageCount; i++) {
      const isFromMainUser = Math.random() > 0.5;
      const messageCreatedAt = new Date(createdAt.getTime() + i * 60 * 60 * 1000); // Spread over hours

      messages.push({
        id: crypto.randomUUID(),
        chat_id: chatId,
        sender_id: isFromMainUser ? userId : chatUser.id,
        content: isFromMainUser
          ? [
              'What do you think about the game tonight?',
              "I'm leaning towards the over",
              'Good call on that last pick!',
              'You seeing any value today?',
            ][i % 4]
          : [
              'I like the home team to cover',
              'That line seems too high',
              'Thanks! Got lucky on that one',
              'Check out the Lakers game',
            ][i % 4],
        created_at: messageCreatedAt.toISOString(),
      });
    }
  }

  if (chats.length > 0) {
    const { error: chatError } = await supabase.from('chats').insert(chats);
    if (chatError) {
      console.error('Error creating historical chats:', chatError);
    } else {
      // Add chat members
      const chatMembers = [];
      for (let i = 0; i < chats.length; i++) {
        chatMembers.push(
          { chat_id: chats[i].id, user_id: userId },
          { chat_id: chats[i].id, user_id: chatUsers[i].id }
        );
      }
      await supabase.from('chat_members').insert(chatMembers);
    }
  }

  if (messages.length > 0) {
    const { error: messageError } = await supabase.from('messages').insert(messages);
    if (messageError) {
      console.error('Error creating historical messages:', messageError);
    } else {
      console.log(`  ✅ Created ${messages.length} historical messages in ${chats.length} chats`);
    }
  }
}

async function runProductionJobs() {
  console.log('\n🏭 Running production jobs...');
  console.log('  📦 Archiving expired content...');
  const { execSync } = await import('child_process');
  execSync('bun run scripts/jobs/content-expiration.ts', { stdio: 'inherit' });

  console.log('  🤖 Generating embeddings for historical content...');
  execSync('bun run scripts/jobs/embedding-generation.ts --setup-mode', { stdio: 'inherit' });

  console.log('  ✅ Production jobs completed');
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

async function createEngagementOnMainUserContent(mainUserId: string, mockUsers: User[]) {
  console.log('\n💬 Creating engagement on main user content...');

  // Get main user's posts
  const { data: mainUserPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', mainUserId)
    .eq('archived', false);

  if (!mainUserPosts || mainUserPosts.length === 0) return;

  const reactions = [];
  const comments = [];
  const pickActions = [];

  for (const post of mainUserPosts) {
    // 3-8 reactions per post
    const reactionCount = Math.floor(Math.random() * 6) + 3;
    const reactingUsers = mockUsers.sort(() => Math.random() - 0.5).slice(0, reactionCount);

    for (const user of reactingUsers) {
      reactions.push({
        post_id: post.id,
        user_id: user.id,
        emoji: ['🔥', '💰', '🎯', '💪', '🚀', '👏'][Math.floor(Math.random() * 6)],
      });
    }

    // 1-3 comments per post
    const commentCount = Math.floor(Math.random() * 3) + 1;
    const commentingUsers = mockUsers.sort(() => Math.random() - 0.5).slice(0, commentCount);

    for (const user of commentingUsers) {
      comments.push({
        id: crypto.randomUUID(),
        post_id: post.id,
        user_id: user.id,
        content: [
          'Great analysis!',
          'Tailing this!',
          'Love this pick',
          "Let's ride together!",
          'BOL!',
          "I'm on this too",
          'Solid reasoning',
        ][Math.floor(Math.random() * 7)],
        created_at: new Date(
          post.created_at
            ? new Date(post.created_at).getTime() + Math.random() * 2 * 60 * 60 * 1000
            : Date.now()
        ).toISOString(),
      });
    }

    // Pick actions if it's a pick post
    if (post.post_type === 'pick') {
      const actionCount = Math.floor(Math.random() * 5) + 3;
      const actingUsers = mockUsers.sort(() => Math.random() - 0.5).slice(0, actionCount);

      for (const user of actingUsers) {
        pickActions.push({
          post_id: post.id,
          user_id: user.id,
          action_type: Math.random() < 0.8 ? 'tail' : ('fade' as 'tail' | 'fade'),
        });
      }
    }
  }

  // Insert engagement
  if (reactions.length > 0) {
    await supabase.from('reactions').insert(reactions);
    console.log(`  ✅ Created ${reactions.length} reactions on main user posts`);
  }

  if (comments.length > 0) {
    await supabase.from('comments').insert(comments);
    console.log(`  ✅ Created ${comments.length} comments on main user posts`);
  }

  if (pickActions.length > 0) {
    await supabase.from('pick_actions').insert(pickActions);
    console.log(`  ✅ Created ${pickActions.length} pick actions on main user picks`);
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
    await createHistoricalContent(mockUsers, games, userId);

    // 3a. Create historical content for main user
    await createMainUserHistoricalContent(userId, games, mockUsers);

    // 3b. Create historical stories for all users
    await createHistoricalStories(mockUsers, userId);

    // 3c. Create historical messages
    await createHistoricalMessages(userId, mockUsers);

    // 4. Run production jobs to archive and embed historical content
    await runProductionJobs();

    // 5. Phase 2: Create fresh content
    console.log('\n🚀 Creating fresh content...');

    // 6. Create follow relationships
    await createFollowRelationships(userId, mockUsers);

    // 7. Create stories
    const allUsersForStories = [{ id: userId, username: 'MainUser' } as User, ...mockUsers];
    await createStoriesForMockUsers(allUsersForStories);

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

    // 15a. Create engagement on main user's fresh content
    await createEngagementOnMainUserContent(userId, mockUsers);

    // 16. Create messaging
    await createMessaging(userId, mockUsers);

    // 17. Create notifications for the main user
    await createNotificationsForUser(userId, mockUsers, [], []);

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

    // 20. Verify RAG suggestions are working
    await verifyRAGSuggestions(userId);

    // 21. FINAL EMBEDDING GENERATION - Run again to ensure ALL users have embeddings
    console.log('\n🤖 Running final embedding generation to ensure completeness...');
    try {
      const { execSync } = await import('child_process');

      // First, ensure the main user's bankroll is updated
      const { data: mainUserBets } = await supabase
        .from('bets')
        .select('status, stake, actual_win')
        .eq('user_id', userId)
        .in('status', ['won', 'lost']);

      if (mainUserBets && mainUserBets.length > 0) {
        const wins = mainUserBets.filter((b) => b.status === 'won').length;
        const losses = mainUserBets.filter((b) => b.status === 'lost').length;
        const profit = mainUserBets.reduce((sum, bet) => {
          if (bet.status === 'won') {
            return sum + ((bet.actual_win || 0) - bet.stake);
          } else {
            return sum - bet.stake;
          }
        }, 0);

        await supabase
          .from('bankrolls')
          .update({
            win_count: wins,
            loss_count: losses,
            balance: 100000 + profit,
            total_wagered: mainUserBets.reduce((sum, bet) => sum + bet.stake, 0),
            total_won: profit > 0 ? profit : 0,
          })
          .eq('user_id', userId);

        console.log(`  ✅ Updated main user bankroll: ${wins}W-${losses}L`);
      }

      // Run embedding generation in setup mode to ensure all users are processed
      execSync('bun run scripts/jobs/embedding-generation.ts --setup-mode --limit=200', {
        stdio: 'inherit',
      });
      console.log('  ✅ Final embedding generation completed');

      // Verify embeddings were created
      const { data: usersWithEmbeddings } = await supabase
        .from('users')
        .select('id, username, profile_embedding')
        .not('profile_embedding', 'is', null);

      console.log(`  ✅ ${usersWithEmbeddings?.length || 0} users now have embeddings`);

      // Check if main user has embedding
      const mainUserHasEmbedding = usersWithEmbeddings?.some((u) => u.id === userId);
      if (!mainUserHasEmbedding) {
        console.log('  ⚠️  Main user still missing embedding - running targeted generation');

        // Get main user's username
        const { data: mainUser } = await supabase
          .from('users')
          .select('username')
          .eq('id', userId)
          .single();

        if (mainUser?.username) {
          execSync(
            `bun run scripts/jobs/embedding-generation.ts --setup-mode --user=${mainUser.username}`,
            { stdio: 'inherit' }
          );
        } else {
          console.log('  ❌ Could not find main user username');
        }
      } else {
        console.log('  ✅ Main user has embedding');
      }
    } catch (error) {
      console.error('Error in final embedding generation:', error);
      console.log(
        '  ⚠️  You may need to run: bun run scripts/jobs/embedding-generation.ts --setup-mode'
      );
    }

    // 22. Run smart notifications job to generate AI-powered notifications
    console.log('\n🔔 Running smart notifications job...');
    try {
      const { execSync } = await import('child_process');
      execSync('bun run scripts/jobs/smartNotifications.ts', { stdio: 'inherit' });
      console.log('  ✅ Smart notifications generated');
    } catch (error) {
      console.error('  ⚠️  Smart notifications job failed:', error);
    }

    console.log('\n✨ Mock data setup complete!');
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

async function verifyRAGSuggestions(userId: string) {
  console.log('\n🔍 Verifying AI features...');

  try {
    // 1. Check user embedding
    const { data: currentUser } = await supabase
      .from('users')
      .select('profile_embedding')
      .eq('id', userId)
      .single();

    if (!currentUser?.profile_embedding) {
      console.log('  ❌ Main user has no embedding');
      return;
    }
    console.log('  ✅ Main user has embedding');

    // 2. Test Find Your Tribe
    const { data: similarUsers, error } = await supabase.rpc('find_similar_users', {
      query_embedding: currentUser.profile_embedding,
      p_user_id: userId,
      limit_count: 5,
    });

    if (error) {
      console.log('  ❌ Find Your Tribe error:', error.message);
    } else {
      console.log(`  ✅ Find Your Tribe: ${similarUsers?.length || 0} similar users found`);
      if (similarUsers && similarUsers.length > 0) {
        console.log('    Sample matches:');
        similarUsers
          .slice(0, 3)
          .forEach((user: { username: string; similarity: number }, i: number) => {
            console.log(
              `      ${i + 1}. ${user.username} (${(user.similarity * 100).toFixed(1)}% match)`
            );
          });
      }
    }

    // 3. Check smart notifications
    const { data: smartNotifs } = await supabase
      .from('notifications')
      .select('type, created_at')
      .eq('user_id', userId)
      .in('type', ['similar_user_bet', 'behavioral_consensus', 'smart_alert'])
      .order('created_at', { ascending: false })
      .limit(5);

    console.log(`  ✅ Smart Notifications: ${smartNotifs?.length || 0} AI notifications`);
    if (smartNotifs && smartNotifs.length > 0) {
      console.log('    Recent notifications:');
      smartNotifs.forEach((notif: { type: string; created_at: string | null }) => {
        const time = notif.created_at
          ? new Date(notif.created_at).toLocaleTimeString()
          : 'unknown time';
        console.log(`      - ${notif.type} at ${time}`);
      });
    }

    // 4. Check feed prerequisites
    const { data: followingCheck } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    console.log(`  ✅ Following ${followingCheck?.length || 0} users (needed for hybrid feed)`);

    // 5. Check for discoverable posts
    const { data: recentPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('archived', false)
      .is('deleted_at', null)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(10);

    console.log(`  ✅ Recent posts available: ${recentPosts?.length || 0} (for discovery feed)`);

    console.log('\n  ✨ AI features verification complete!');
  } catch (error) {
    console.error('  ❌ Verification failed:', error);
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
