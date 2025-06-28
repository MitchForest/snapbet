#!/usr/bin/env bun

import { supabase } from '../../supabase-client';
import type { Database } from '@/types/database';
import { MOCK_CONFIG, getRandomStake } from '../config';
import { generateBetDetails } from '../utils/helpers';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type Game = Tables['games']['Row'];
type MockUser = User & { mock_personality_id: string | null };
type BetType = 'spread' | 'moneyline' | 'total';

interface SettledBet {
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
}

export async function createBetsForBadges(mockUsers: MockUser[], games: Game[]) {
  console.log('🏆 Creating badge-worthy betting patterns...');

  const settledBets: SettledBet[] = [];
  const badgePersonas = MOCK_CONFIG.badges.personalities;

  // 1. Hot Streak Users - 3+ consecutive wins
  const hotStreakUsers = mockUsers.slice(0, badgePersonas.hot_streak);
  for (const user of hotStreakUsers) {
    const betSequence: Array<'won' | 'lost'> = [
      'won',
      'won',
      'won',
      'won',
      'won',
      'lost',
      'won',
      'won',
      'won',
    ];

    for (let i = 0; i < betSequence.length; i++) {
      const game = games[i % games.length];
      const hoursAgo = (betSequence.length - i) * 2;

      settledBets.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        game_id: game.id,
        bet_type: 'spread',
        bet_details: { team: game.home_team, line: -3.5 },
        stake: 1000,
        odds: -110,
        potential_win: 909,
        actual_win: betSequence[i] === 'won' ? 1909 : 0,
        status: betSequence[i],
        created_at: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
        settled_at: new Date(Date.now() - (hoursAgo - 1) * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  // 2. Profit King - Highest profit
  const profitKingUser = mockUsers[badgePersonas.hot_streak];
  for (let i = 0; i < 8; i++) {
    const game = games[i % games.length];
    const isWin = i < 6; // 75% win rate
    const stake = 5000;

    settledBets.push({
      id: crypto.randomUUID(),
      user_id: profitKingUser.id,
      game_id: game.id,
      bet_type: 'moneyline',
      bet_details: { team: game.away_team },
      stake: stake,
      odds: -110,
      potential_win: 4545,
      actual_win: isWin ? 9545 : 0,
      status: isWin ? 'won' : 'lost',
      created_at: new Date(Date.now() - (i + 1) * 8 * 60 * 60 * 1000).toISOString(),
      settled_at: new Date(Date.now() - i * 8 * 60 * 60 * 1000).toISOString(),
    });
  }

  // 3. Sharp - High win rate (60%+) with 10+ bets
  const sharpUsers = mockUsers.slice(
    badgePersonas.hot_streak + badgePersonas.profit_king,
    badgePersonas.hot_streak + badgePersonas.profit_king + badgePersonas.sharp
  );

  for (const user of sharpUsers) {
    for (let i = 0; i < 12; i++) {
      const game = games[i % games.length];
      const isWin = i < 9; // 75% win rate

      settledBets.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        game_id: game.id,
        bet_type: ['spread', 'total', 'moneyline'][i % 3] as BetType,
        bet_details: generateBetDetails(['spread', 'total', 'moneyline'][i % 3] as BetType, game),
        stake: 2000,
        odds: -110,
        potential_win: 1818,
        actual_win: isWin ? 3818 : 0,
        status: isWin ? 'won' : 'lost',
        created_at: new Date(Date.now() - (i + 1) * 6 * 60 * 60 * 1000).toISOString(),
        settled_at: new Date(Date.now() - i * 6 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  // 4. Most Active - 20+ bets
  const activeUsers = mockUsers.slice(
    badgePersonas.hot_streak + badgePersonas.profit_king + badgePersonas.sharp,
    badgePersonas.hot_streak +
      badgePersonas.profit_king +
      badgePersonas.sharp +
      badgePersonas.most_active
  );

  for (const user of activeUsers) {
    for (let i = 0; i < 25; i++) {
      const game = games[i % games.length];
      const isWin = Math.random() > 0.45; // 55% win rate
      const stake = getRandomStake();

      settledBets.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        game_id: game.id,
        bet_type: ['spread', 'total', 'moneyline'][i % 3] as BetType,
        bet_details: generateBetDetails(['spread', 'total', 'moneyline'][i % 3] as BetType, game),
        stake: stake,
        odds: -110,
        potential_win: Math.floor((stake * 100) / 110),
        actual_win: isWin ? stake + Math.floor((stake * 100) / 110) : 0,
        status: isWin ? 'won' : 'lost',
        created_at: new Date(Date.now() - (i + 1) * 3 * 60 * 60 * 1000).toISOString(),
        settled_at: new Date(Date.now() - i * 3 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  // Insert all bets
  if (settledBets.length > 0) {
    const { error } = await supabase.from('bets').insert(settledBets);
    if (error) {
      console.error('Error creating badge bets:', error);
    } else {
      console.log(`  ✅ Created ${settledBets.length} bets for badge qualification`);
    }
  }

  return settledBets;
}

export async function createVariedBets(mockUsers: MockUser[], games: Game[]) {
  console.log('💰 Creating varied betting activity...');

  const settledBets: SettledBet[] = [];
  const pendingBets: Array<{
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
    status: 'pending';
    created_at: string;
  }> = [];

  // Create a mix of settled and pending bets
  for (const user of mockUsers) {
    const betCount = Math.floor(Math.random() * 5) + 3; // 3-8 bets per user

    for (let i = 0; i < betCount; i++) {
      const game = games[Math.floor(Math.random() * games.length)];
      const betType = (['spread', 'moneyline', 'total'] as const)[Math.floor(Math.random() * 3)];
      const stake = getRandomStake();
      const odds = -110;
      const potentialWin = Math.floor((stake * 100) / 110);

      // 70% of bets are settled
      if (Math.random() < MOCK_CONFIG.betting.settlementRate && game.status === 'completed') {
        const isWin = Math.random() < MOCK_CONFIG.betting.winRate;

        settledBets.push({
          id: crypto.randomUUID(),
          user_id: user.id,
          game_id: game.id,
          bet_type: betType,
          bet_details: generateBetDetails(betType, game),
          stake,
          odds,
          potential_win: potentialWin,
          actual_win: isWin ? stake + potentialWin : 0,
          status: isWin ? 'won' : 'lost',
          created_at: new Date(Date.now() - (i + 1) * 12 * 60 * 60 * 1000).toISOString(),
          settled_at: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString(),
        });
      } else if (game.status === 'scheduled') {
        pendingBets.push({
          id: crypto.randomUUID(),
          user_id: user.id,
          game_id: game.id,
          bet_type: betType,
          bet_details: generateBetDetails(betType, game),
          stake,
          odds,
          potential_win: potentialWin,
          status: 'pending' as const,
          created_at: new Date(Date.now() - i * 6 * 60 * 60 * 1000).toISOString(),
        });
      }
    }
  }

  // Insert bets
  const allBets = [...settledBets, ...pendingBets];
  if (allBets.length > 0) {
    const { error } = await supabase.from('bets').insert(allBets);
    if (error) {
      console.error('Error creating varied bets:', error);
    } else {
      console.log(
        `  ✅ Created ${settledBets.length} settled bets and ${pendingBets.length} pending bets`
      );
    }
  }

  // Update bankrolls based on settled bets
  await updateBankrolls(settledBets);

  return { settledBets, pendingBets };
}

async function updateBankrolls(settledBets: SettledBet[]) {
  const userStats = new Map<
    string,
    { wins: number; losses: number; profit: number; totalWagered: number }
  >();

  for (const bet of settledBets) {
    if (!userStats.has(bet.user_id)) {
      userStats.set(bet.user_id, { wins: 0, losses: 0, profit: 0, totalWagered: 0 });
    }

    const stats = userStats.get(bet.user_id)!;
    stats.totalWagered += bet.stake;

    if (bet.status === 'won') {
      stats.wins++;
      stats.profit += bet.actual_win - bet.stake;
    } else {
      stats.losses++;
      stats.profit -= bet.stake;
    }
  }

  for (const [userId, stats] of userStats) {
    await supabase
      .from('bankrolls')
      .update({
        win_count: stats.wins,
        loss_count: stats.losses,
        balance: 100000 + stats.profit, // Start with $1,000 (100000 cents)
        total_wagered: stats.totalWagered,
        total_won: stats.profit > 0 ? stats.profit : 0,
      })
      .eq('user_id', userId);
  }

  console.log(`  ✅ Updated bankrolls for ${userStats.size} users`);
}

// Add function to create fade god patterns
export async function createFadeGodBets(mockUsers: MockUser[], games: Game[]) {
  console.log('🎪 Creating fade god betting patterns...');

  const settledBets: SettledBet[] = [];
  const fadeGodUsers = mockUsers.filter(
    (u) => u.mock_personality_id === 'square-bob' || u.mock_personality_id === 'public-pete'
  );

  // Fade gods need to lose consistently so others profit from fading
  for (const user of fadeGodUsers) {
    const betCount = 10; // Need enough bets to be worth fading

    for (let i = 0; i < betCount; i++) {
      const game = games[i % games.length];
      const isWin = i % 4 === 0; // 25% win rate - very fadeable
      const stake = 2000; // $20 bets

      settledBets.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        game_id: game.id,
        bet_type: 'spread',
        bet_details: { team: game.home_team, line: -7.5 }, // Taking bad lines
        stake: stake,
        odds: -110,
        potential_win: 1818,
        actual_win: isWin ? 3818 : 0,
        status: isWin ? 'won' : 'lost',
        created_at: new Date(Date.now() - (i + 1) * 8 * 60 * 60 * 1000).toISOString(),
        settled_at: new Date(Date.now() - i * 8 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  return settledBets;
}

// Add function to create rising star patterns
export async function createRisingStarBets(mockUsers: MockUser[], games: Game[]) {
  console.log('⭐ Creating rising star betting patterns...');

  const settledBets: SettledBet[] = [];

  // Find users created in last 3 days (rising stars)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const risingStarUsers = mockUsers.filter((user) => {
    const userCreatedAt = new Date(user.created_at || '');
    return userCreatedAt > threeDaysAgo;
  });

  console.log(`  📊 Found ${risingStarUsers.length} users created in last 3 days`);

  for (const user of risingStarUsers) {
    // Each rising star needs at least 5 bets
    for (let i = 0; i < 7; i++) {
      // Give them 7 bets to ensure they qualify
      const game = games[i % games.length];
      const isWin = Math.random() > 0.4; // 60% win rate - they're doing well!
      const stake = getRandomStake();

      settledBets.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        game_id: game.id,
        bet_type: ['spread', 'total', 'moneyline'][i % 3] as BetType,
        bet_details: generateBetDetails(['spread', 'total', 'moneyline'][i % 3] as BetType, game),
        stake: stake,
        odds: -110,
        potential_win: Math.floor((stake * 100) / 110),
        actual_win: isWin ? stake + Math.floor((stake * 100) / 110) : 0,
        status: isWin ? 'won' : 'lost',
        created_at: new Date(Date.now() - (i + 1) * 4 * 60 * 60 * 1000).toISOString(),
        settled_at: new Date(Date.now() - i * 4 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  if (settledBets.length > 0) {
    const { error } = await supabase.from('bets').insert(settledBets);
    if (error) {
      console.error('Error creating rising star bets:', error);
    } else {
      console.log(`  ✅ Created ${settledBets.length} bets for rising stars`);
    }
  }

  return settledBets;
}

// Add function to create actual fade bets for fade god badge
export async function createSuccessfulFadeBets(mockUsers: MockUser[], games: Game[]) {
  console.log('⚔️ Creating successful fade patterns...');

  const fadeBets: Array<SettledBet & { is_fade: boolean; original_pick_id: string }> = [];

  // Select 2 users to be fade gods (they successfully fade others)
  const fadeGodCandidates = mockUsers.slice(10, 12);

  for (const fadeGod of fadeGodCandidates) {
    // Each fade god needs 3+ successful fades
    for (let i = 0; i < 5; i++) {
      // Give them 5 successful fades
      const game = games[i % games.length];
      const originalBetId = crypto.randomUUID();

      fadeBets.push({
        id: crypto.randomUUID(),
        user_id: fadeGod.id,
        game_id: game.id,
        bet_type: 'spread',
        bet_details: { team: game.away_team, line: 7.5 }, // Opposite of what was faded
        stake: 2000,
        odds: -110,
        potential_win: 1818,
        actual_win: 3818, // They won by fading!
        status: 'won',
        is_fade: true,
        original_pick_id: originalBetId,
        created_at: new Date(Date.now() - (i + 1) * 6 * 60 * 60 * 1000).toISOString(),
        settled_at: new Date(Date.now() - i * 6 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  if (fadeBets.length > 0) {
    const { error } = await supabase.from('bets').insert(fadeBets);
    if (error) {
      console.error('Error creating fade bets:', error);
    } else {
      console.log(`  ✅ Created ${fadeBets.length} successful fade bets`);
    }
  }

  return fadeBets;
}

// Add function to create hot bettor patterns
export async function createHotBettorBets(mockUsers: MockUser[], games: Game[]) {
  console.log('🔥 Creating hot bettor patterns...');

  const settledBets: SettledBet[] = [];

  // Select users 5-8 to be hot bettors
  const hotBettorUsers = mockUsers.slice(5, 8);

  for (const user of hotBettorUsers) {
    // Each hot bettor needs 5+ bets with 60%+ win rate
    for (let i = 0; i < 8; i++) {
      // Give them 8 bets
      const game = games[i % games.length];
      const isWin = i < 6; // 75% win rate (6 wins out of 8)
      const stake = getRandomStake();

      settledBets.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        game_id: game.id,
        bet_type: ['spread', 'total', 'moneyline'][i % 3] as BetType,
        bet_details: generateBetDetails(['spread', 'total', 'moneyline'][i % 3] as BetType, game),
        stake: stake,
        odds: -110,
        potential_win: Math.floor((stake * 100) / 110),
        actual_win: isWin ? stake + Math.floor((stake * 100) / 110) : 0,
        status: isWin ? 'won' : 'lost',
        created_at: new Date(Date.now() - (i + 1) * 12 * 60 * 60 * 1000).toISOString(),
        settled_at: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  if (settledBets.length > 0) {
    const { error } = await supabase.from('bets').insert(settledBets);
    if (error) {
      console.error('Error creating hot bettor bets:', error);
    } else {
      console.log(`  ✅ Created ${settledBets.length} bets for hot bettors`);
    }
  }

  return settledBets;
}
