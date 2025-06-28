#!/usr/bin/env bun

/**
 * Mock progression orchestrator - settles games and generates new activity
 *
 * Usage: bun run scripts/mock/orchestrators/settle.ts
 */

import { supabase } from '../../supabase-client';
import { generateMockGames } from '../data/games';
import type { Json } from '../../../types/database';
import {
  messageTemplates,
  postTemplates,
  getRandomTemplate,
  fillTemplate,
  getPersonalityFromBehavior,
  mockMediaUrls,
} from '../templates';
import { BadgeCalculationJob } from '../../jobs/badge-calculation';
import { AVAILABLE_REACTIONS } from '@/utils/constants/reactions';

// Define bet details types
interface SpreadBetDetails {
  team: string;
  line: number;
  spread?: number;
}

interface MoneylineBetDetails {
  team: string;
}

interface TotalBetDetails {
  line: number;
  total_type: 'over' | 'under';
}

type BetDetails = SpreadBetDetails | MoneylineBetDetails | TotalBetDetails;

async function settleMockGames() {
  console.log('🎲 Settling mock games and generating outcomes...\n');

  try {
    // Get games that should be completed (started more than 3 hours ago)
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

    const { data: gamesToSettle, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'scheduled')
      .lt('commence_time', threeHoursAgo.toISOString())
      .limit(10);

    if (gamesError || !gamesToSettle || gamesToSettle.length === 0) {
      console.log('No games to settle');
      return;
    }

    console.log(`Found ${gamesToSettle.length} games to settle\n`);

    // Settle each game
    for (const game of gamesToSettle) {
      // Generate realistic scores based on sport
      let homeScore, awayScore;

      if (game.sport === 'basketball_nba') {
        const baseScore = 105 + Math.floor(Math.random() * 20);
        const spread = Math.floor(Math.random() * 20) - 10;
        homeScore = baseScore + Math.floor(spread / 2);
        awayScore = baseScore - Math.floor(spread / 2);
      } else {
        // NFL
        const possibleScores = [7, 10, 13, 14, 17, 20, 21, 23, 24, 27, 28, 31];
        homeScore = possibleScores[Math.floor(Math.random() * possibleScores.length)];
        awayScore = possibleScores[Math.floor(Math.random() * possibleScores.length)];
      }

      // Update game status
      const { error: updateError } = await supabase
        .from('games')
        .update({
          status: 'completed',
          home_score: homeScore,
          away_score: awayScore,
        })
        .eq('id', game.id);

      if (updateError) {
        console.error(`Error settling game ${game.id}:`, updateError);
        continue;
      }

      console.log(`✅ Settled: ${game.away_team} @ ${game.home_team} (${awayScore}-${homeScore})`);

      // Settle all bets for this game
      await settleBetsForGame(game.id, homeScore, awayScore);
    }

    // Generate outcome posts from mock users
    await generateOutcomePosts();

    // Add more new activity
    await generateProgressionActivity();

    // Calculate badges for users who placed bets
    await calculateBadgesForActiveUsers();
  } catch (error) {
    console.error('❌ Error in settlement:', error);
  }
}

async function settleBetsForGame(gameId: string, homeScore: number, awayScore: number) {
  // Get all pending bets for this game
  const { data: bets, error } = await supabase
    .from('bets')
    .select('*, games!inner(*)')
    .eq('game_id', gameId)
    .eq('status', 'pending');

  if (error || !bets) return;

  for (const bet of bets) {
    const game = bet.games;
    let won = false;

    // Type-safe bet details access
    const betDetails = bet.bet_details as Record<string, unknown>;
    if (!betDetails) continue;

    // Determine if bet won
    switch (bet.bet_type) {
      case 'moneyline': {
        const team = betDetails.team as string;
        won =
          (team === game.home_team && homeScore > awayScore) ||
          (team === game.away_team && awayScore > homeScore);
        break;
      }

      case 'spread': {
        const spreadTeam = betDetails.team as string;
        const spread = (betDetails.spread || betDetails.line) as number;
        if (spreadTeam === game.home_team) {
          won = homeScore + spread > awayScore;
        } else {
          won = awayScore + spread > homeScore;
        }
        break;
      }

      case 'total': {
        const totalPoints = homeScore + awayScore;
        const line = betDetails.line as number;
        won =
          (betDetails.total_type === 'over' && totalPoints > line) ||
          (betDetails.total_type === 'under' && totalPoints < line);
        break;
      }
    }

    // Update bet status
    const status = won ? 'won' : 'lost';
    const actualWin = won ? bet.potential_win : 0;

    await supabase
      .from('bets')
      .update({
        status,
        actual_win: actualWin,
        settled_at: new Date().toISOString(),
      })
      .eq('id', bet.id);

    // Update user's bankroll
    if (won) {
      // Update bankroll directly since RPC might not exist
      const { data: bankroll } = await supabase
        .from('bankrolls')
        .select('*')
        .eq('user_id', bet.user_id)
        .single();

      if (bankroll) {
        await supabase
          .from('bankrolls')
          .update({
            balance: bankroll.balance + actualWin + bet.stake,
            win_count: bankroll.win_count + 1,
            total_wagered: bankroll.total_wagered + bet.stake,
            total_won: bankroll.total_won + actualWin + bet.stake,
          })
          .eq('user_id', bet.user_id);
      }
    } else {
      // Update loss count
      const { data: bankroll } = await supabase
        .from('bankrolls')
        .select('*')
        .eq('user_id', bet.user_id)
        .single();

      if (bankroll) {
        await supabase
          .from('bankrolls')
          .update({
            loss_count: bankroll.loss_count + 1,
            total_wagered: bankroll.total_wagered + bet.stake,
          })
          .eq('user_id', bet.user_id);
      }
    }
  }
}

async function generateOutcomePosts() {
  console.log('\n📝 Generating outcome posts...');

  // Get recently settled bets from mock users
  const { data: settledBets, error } = await supabase
    .from('bets')
    .select('*, users!inner(*), games!inner(*)')
    .in('status', ['won', 'lost'])
    .eq('users.is_mock', true)
    .gte('settled_at', new Date(Date.now() - 30 * 60 * 1000).toISOString())
    .limit(10);

  if (error || !settledBets) return;

  const posts = [];

  for (const bet of settledBets) {
    const user = bet.users;
    const personality = getPersonalityFromBehavior(user.mock_personality_id || 'degen');
    const won = bet.status === 'won';

    // Generate outcome post based on personality and result
    let caption = '';
    let mediaUrl = '';

    // Type-safe bet details access
    const betDetails = bet.bet_details as Record<string, unknown>;

    if (won) {
      const templates =
        (postTemplates['outcome-positive'] as Record<string, string[]>)[personality] ||
        postTemplates['outcome-positive'].normal;
      caption = fillTemplate(getRandomTemplate(templates), {
        result: 'W',
        team: (betDetails?.team as string) || bet.games.home_team,
        profit: `+$${((bet.actual_win || 0) / 100).toFixed(0)}`,
        record: `${Math.floor(Math.random() * 10) + 5}-${Math.floor(Math.random() * 5)}`,
      });
      mediaUrl =
        mockMediaUrls.celebration[Math.floor(Math.random() * mockMediaUrls.celebration.length)];
    } else {
      const templates =
        (postTemplates['outcome-negative'] as Record<string, string[]>)[personality] ||
        postTemplates['outcome-negative'].normal;
      caption = fillTemplate(getRandomTemplate(templates), {
        result: 'L',
        team: (betDetails?.team as string) || bet.games.home_team,
        loss: `-$${(bet.stake / 100).toFixed(0)}`,
        excuse: getRandomTemplate(messageTemplates['fade-material'].excuse),
      });
      mediaUrl =
        mockMediaUrls.frustration[Math.floor(Math.random() * mockMediaUrls.frustration.length)];
    }

    posts.push({
      user_id: user.id,
      caption,
      media_url: mediaUrl,
      media_type: 'photo' as const,
      post_type: 'content' as const,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  if (posts.length > 0) {
    const { error: postError } = await supabase.from('posts').insert(posts);
    if (!postError) {
      console.log(`✅ Created ${posts.length} outcome posts`);
    }
  }
}

async function generateProgressionActivity() {
  console.log('\n🚀 Generating progression activity...');

  // Add new games
  console.log('🎮 Adding new games...');
  const newGames = generateMockGames(3);
  const { error: gameError } = await supabase.from('games').insert(newGames);
  if (!gameError) {
    console.log(`✅ Added ${newGames.length} new games`);
  }

  // Get mock users
  const { data: mockUsers } = await supabase.from('users').select('*').eq('is_mock', true);

  if (!mockUsers) return;

  // Generate new bets from hot mock users
  const hotUsers = mockUsers
    .filter((u) => ['sharp-bettor', 'live-bettor'].includes(u.mock_personality_id || ''))
    .slice(0, 5);

  console.log('\n💰 Generating new bets...');
  const newBets = [];
  const newPosts = [];

  for (const user of hotUsers) {
    const game = newGames[Math.floor(Math.random() * newGames.length)];
    const betType = ['spread', 'moneyline', 'total'][Math.floor(Math.random() * 3)] as
      | 'spread'
      | 'moneyline'
      | 'total';

    const betId = crypto.randomUUID();
    let betDetails: BetDetails;

    switch (betType) {
      case 'spread':
        betDetails = {
          team: Math.random() > 0.5 ? game.home_team : game.away_team,
          line: Math.random() > 0.5 ? -3.5 : 3.5,
        };
        break;
      case 'moneyline':
        betDetails = {
          team: Math.random() > 0.5 ? game.home_team : game.away_team,
        };
        break;
      case 'total':
        betDetails = {
          line: game.sport === 'basketball_nba' ? 220.5 : 45.5,
          total_type: Math.random() > 0.5 ? 'over' : 'under',
        };
        break;
    }

    newBets.push({
      id: betId,
      user_id: user.id,
      game_id: game.id,
      bet_type: betType,
      bet_details: betDetails as unknown as Json,
      stake: 2000 + Math.floor(Math.random() * 3000),
      odds: -110,
      potential_win: 1818,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    });

    // Create pick post
    const personality = getPersonalityFromBehavior(user.mock_personality_id || 'degen');
    const templates =
      (postTemplates['pick-share'] as Record<string, string[]>)[personality] ||
      postTemplates['pick-share'].normal;

    newPosts.push({
      user_id: user.id,
      bet_id: betId,
      caption: fillTemplate(getRandomTemplate(templates), {
        team: 'team' in betDetails ? betDetails.team : game.home_team,
        spread: String('line' in betDetails ? betDetails.line : 'ML'),
        odds: '-110',
        type: betType,
      }),
      media_url: mockMediaUrls.reaction[Math.floor(Math.random() * mockMediaUrls.reaction.length)],
      media_type: 'photo' as const,
      post_type: 'pick' as const,
      created_at: new Date().toISOString(),
      expires_at: game.commence_time,
    });
  }

  if (newBets.length > 0) {
    await supabase.from('bets').insert(newBets);
    await supabase.from('posts').insert(newPosts);
    console.log(`✅ Created ${newBets.length} new bets with pick posts`);
  }

  // Add more reactions and tails/fades
  await addProgressionEngagement();

  // New follows
  await addNewFollows();

  // More messages
  await addProgressionMessages();

  console.log('\n✨ Progression complete!');
}

async function addProgressionEngagement() {
  console.log('\n💬 Adding engagement to recent posts...');

  // Get recent posts
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (!recentPosts) return;

  // Get mock users for engagement
  const { data: mockUsers } = await supabase.from('users').select('*').eq('is_mock', true);

  if (!mockUsers) return;

  let tailsAdded = 0;
  let reactionsAdded = 0;

  for (const post of recentPosts) {
    // Add tails/fades to pick posts
    if (post.post_type === 'pick' && post.bet_id) {
      const tailCount = Math.floor(Math.random() * 5) + 2;
      const tailers = mockUsers
        .filter((u) => u.id !== post.user_id)
        .sort(() => Math.random() - 0.5)
        .slice(0, tailCount);

      for (const tailer of tailers) {
        const action = Math.random() > 0.8 ? 'fade' : 'tail';

        await supabase
          .from('pick_actions')
          .insert({
            post_id: post.id,
            user_id: tailer.id,
            action_type: action,
          })
          .select()
          .single();

        tailsAdded++;
      }
    }

    // Add reactions
    const reactionCount = Math.floor(Math.random() * 8) + 3;
    const reactors = mockUsers
      .filter((u) => u.id !== post.user_id)
      .sort(() => Math.random() - 0.5)
      .slice(0, reactionCount);

    for (const reactor of reactors) {
      await supabase.from('reactions').insert({
        post_id: post.id,
        user_id: reactor.id,
        emoji: AVAILABLE_REACTIONS[Math.floor(Math.random() * AVAILABLE_REACTIONS.length)],
      });
      reactionsAdded++;
    }
  }

  console.log(`✅ Added ${tailsAdded} tails/fades and ${reactionsAdded} reactions`);
}

async function addNewFollows() {
  console.log('\n👥 Adding new follow relationships...');

  // Get the main user
  const { data: mainUser } = await supabase
    .from('users')
    .select('*')
    .eq('username', 'mitchforest')
    .single();

  if (!mainUser) return;

  // Get mock users
  const { data: mockUsers } = await supabase.from('users').select('*').eq('is_mock', true);

  if (!mockUsers) return;

  // Add 3-5 new followers
  const newFollowerCount = Math.floor(Math.random() * 3) + 3;
  const newFollowers = mockUsers.sort(() => Math.random() - 0.5).slice(0, newFollowerCount);

  for (const follower of newFollowers) {
    await supabase.from('follows').upsert(
      {
        follower_id: follower.id,
        following_id: mainUser.id,
      },
      {
        onConflict: 'follower_id,following_id',
      }
    );
  }

  console.log(`✅ Added ${newFollowerCount} new followers`);
}

async function addProgressionMessages() {
  console.log('\n💬 Adding new messages...');

  // Get existing group chats
  const { data: groupChats } = await supabase.from('chats').select('*').eq('chat_type', 'group');

  if (!groupChats) return;

  // Get mock users
  const { data: mockUsers } = await supabase.from('users').select('*').eq('is_mock', true);

  if (!mockUsers) return;

  const messages = [];

  for (const chat of groupChats) {
    // Add 3-5 messages per chat
    const messageCount = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < messageCount; i++) {
      const sender = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const personality = getPersonalityFromBehavior(sender.mock_personality_id || 'degen');
      const templates =
        messageTemplates[personality as keyof typeof messageTemplates] || messageTemplates['degen'];

      messages.push({
        chat_id: chat.id,
        sender_id: sender.id,
        content: getRandomTemplate(templates.discussion || templates.greeting),
        created_at: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  if (messages.length > 0) {
    await supabase.from('messages').insert(messages);
    console.log(`✅ Added ${messages.length} new messages`);
  }
}

async function calculateBadgesForActiveUsers() {
  console.log('\n🏆 Calculating badges for active users...');

  try {
    // Run badge calculation job
    const badgeJob = new BadgeCalculationJob();
    const result = await badgeJob.execute({ verbose: false });

    if (result.success) {
      console.log(`✅ ${result.message}`);
    } else {
      console.error('❌ Badge calculation failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Error calculating badges:', error);
  }
}

// Run the settlement
settleMockGames();
