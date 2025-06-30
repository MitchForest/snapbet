#!/usr/bin/env bun

/**
 * Seeds mock users into the database with avatar URLs
 */

import { supabase } from '../../supabase-client';
import type { Database } from '@/types/database';
import { MOCK_CONFIG } from '../config';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];

const personalities = Object.keys(MOCK_CONFIG.users.personalities);

// More realistic username variations
const usernameVariations = {
  'sharp-steve': [
    'LineHunter23',
    'ValueVault',
    'SharpEdge88',
    'MetricsMike',
    'DataDriven7',
    'EdgeFinder',
    'CLVKing',
    'NumbersCrunch',
    'WiseGuy22',
    'ProAngle',
    'SmartMoney91',
    'Analytics101',
    'StatSharp',
    'ValueSeeker',
    'LineShopper',
  ],
  'casual-carl': [
    'GameDayGary',
    'WeekendWarrior',
    'SundaySpecial',
    'CouchCoach22',
    'FanFirst',
    'JustForFun88',
    'BeerAndBets',
    'CasualFan23',
    'RecRoom',
    'ChillBettor',
    'EasyGoing77',
    'RelaxedRick',
    'NoStress',
    'FunMoney',
    'WeekendOnly',
  ],
  'square-bob': [
    'PublicJoe',
    'FaveOnly',
    'ChalkEater',
    'MainstreamMike',
    'TVBets',
    'ESPNFollower',
    'TrendRider',
    'PopularPick',
    'MajorityMan',
    'ConsensusKid',
    'SquarePlay',
    'BasicBob22',
    'FollowCrowd',
    'SafePicks',
    'NoRisk88',
  ],
  'public-pete': [
    'BigNameBets',
    'FamousOnly',
    'StarPlayer',
    'PrimetimePete',
    'NationalTV',
    'MainEvent',
    'Spotlight77',
    'CenterStage',
    'BigGameOnly',
    'Headlines',
    'MediaBets',
    'TrendingNow',
    'PopularVote',
    'MainStream23',
    'PublicSide',
  ],
  'degen-dave': [
    'AllGasNoBrakes',
    'ParlayPrince',
    'YoloYeti',
    'SendItSaturday',
    'MortgageMike',
    'FullSend',
    'NoLimits',
    'MaxBet247',
    'DegenHours',
    'RiskItAll',
    'ChaosMode',
    'WildCard88',
    'AllIn24_7',
    'BankrollBuster',
    'SweatKing',
  ],
  'fade-frank': [
    'FadeThePublic',
    'AgainstGrain',
    'ReverseLine',
    'ContrarianKing',
    'OppositeDay',
    'FadeMachine',
    'GoingLeft',
    'ZigWhenZag',
    'Contrarian23',
    'FadeGod',
    'ReverseIt',
    'NotWithCrowd',
    'OtherSide',
    'MinorityReport',
    'FadeFactory',
  ],
};

export async function generateMockUsers(): Promise<User[]> {
  console.log('👥 Creating mock users...');

  // Check if mock users already exist
  const { data: existingUsers, error: checkError } = await supabase
    .from('users')
    .select('*')
    .eq('is_mock', true)
    .limit(MOCK_CONFIG.users.count);

  if (checkError) {
    console.error('Error checking for existing users:', checkError);
    return [];
  }

  if (existingUsers && existingUsers.length === MOCK_CONFIG.users.count) {
    console.log(`  ⚠️  Found all ${existingUsers.length} mock users, using existing...`);
    return existingUsers;
  }

  // Create new mock users
  const mockUsersToCreate = [];

  // Track used usernames to avoid duplicates
  const usedUsernames = new Set<string>();

  // Distribute personalities across users
  const personalityDistribution = [
    // First 5 users: Rising stars (new users created in last 3 days)
    ...Array(5).fill('casual-carl'),
    // Next 3 users: Hot bettors
    ...Array(3).fill('sharp-steve'),
    // Next 2 users: Fade-worthy users
    'square-bob',
    'public-pete',
    // Next 2 users: Fade gods (they fade others)
    'sharp-steve',
    'sharp-steve',
    // Fill the rest with varied personalities
    ...Array(MOCK_CONFIG.users.count - 14) // Dynamic calculation: 50 - 14 = 36
      .fill(null)
      .map(() => personalities[Math.floor(Math.random() * personalities.length)]),
  ];

  for (let i = 0; i < MOCK_CONFIG.users.count; i++) {
    // Add safety check in case distribution is shorter than expected
    const personalityIndex =
      i < personalityDistribution.length ? i : personalityDistribution.length - 1;
    const personality = personalityDistribution[
      personalityIndex
    ] as keyof typeof MOCK_CONFIG.users.personalities;
    const personalityData = MOCK_CONFIG.users.personalities[personality];

    // Fallback in case personality is not found
    if (!personalityData) {
      console.error(`Personality data not found for: ${personality}`);
      continue;
    }

    // Get username from variations pool
    const availableUsernames = usernameVariations[personality] || [];
    let username: string;

    // Try to get an unused username from the pool
    const unusedUsernames = availableUsernames.filter((name) => !usedUsernames.has(name));

    if (unusedUsernames.length > 0) {
      // Pick a random unused username
      username = unusedUsernames[Math.floor(Math.random() * unusedUsernames.length)];
    } else {
      // Fallback: if all usernames are used, create a variation
      const baseUsername =
        availableUsernames[Math.floor(Math.random() * availableUsernames.length)] ||
        personalityData.usernamePrefix;
      username = `${baseUsername}_${Math.floor(Math.random() * 999)}`;
    }

    usedUsernames.add(username);

    // First 5 users created in last 3 days for rising star
    // Next 5 users created in last week
    // Rest created over last month
    let createdAt: Date;
    if (i < 5) {
      // Rising stars - created 1-3 days ago
      const daysAgo = Math.random() * 2 + 1; // 1-3 days
      createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    } else if (i < 10) {
      // Recent users - created 4-7 days ago
      const daysAgo = Math.random() * 3 + 4; // 4-7 days
      createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    } else {
      // Older users - created 8-30 days ago
      const daysAgo = Math.random() * 22 + 8; // 8-30 days
      createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    }

    // Create more natural display names
    const displayNameVariations = {
      'sharp-steve': ['The Sharp', 'Pro Bettor', 'Line Master', 'Value Hunter', 'Edge Seeker'],
      'casual-carl': [
        'Weekend Warrior',
        'Just For Fun',
        'Game Day Fan',
        'Casual Bettor',
        'Sunday Player',
      ],
      'square-bob': [
        'Public Player',
        'Favorite Bettor',
        'Chalk Lover',
        'Safe Picks',
        'TV Follower',
      ],
      'public-pete': [
        'Big Game Bettor',
        'Prime Time',
        'Main Event',
        'Popular Side',
        'Consensus Player',
      ],
      'degen-dave': ['Full Degen', 'All In', 'No Limits', 'Risk Taker', 'Parlay King'],
      'fade-frank': ['The Fader', 'Contrarian', 'Against Grain', 'Fade Master', 'Other Side'],
    };

    const displayNames = displayNameVariations[personality] || [personalityData.displayName];
    const displayName = displayNames[Math.floor(Math.random() * displayNames.length)];

    mockUsersToCreate.push({
      id: crypto.randomUUID(),
      username,
      email: `${username}@snapbet.mock`,
      display_name: displayName,
      bio: personalityData.bio,
      avatar_url: `${personalityData.avatar}&seed=${username}`, // Use username as seed for unique avatars
      is_mock: true,
      mock_personality_id: personality,
      oauth_id: `mock_${username}`,
      oauth_provider: 'google' as const,
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
    });
  }

  // Insert all mock users
  const { data: insertedUsers, error: insertError } = await supabase
    .from('users')
    .insert(mockUsersToCreate)
    .select();

  if (insertError) {
    console.error('Error creating mock users:', insertError);
    return [];
  }

  console.log(`  ✅ Created ${insertedUsers?.length || 0} mock users`);

  // Create bankrolls for all mock users
  if (insertedUsers && insertedUsers.length > 0) {
    const bankrolls = insertedUsers.map((user) => ({
      user_id: user.id,
      balance: 100000, // $1,000 starting balance
      win_count: 0,
      loss_count: 0,
      total_wagered: 0,
      total_won: 0,
    }));

    const { error: bankrollError } = await supabase.from('bankrolls').insert(bankrolls);
    if (bankrollError) {
      console.error('Error creating bankrolls:', bankrollError);
    }
  }

  return insertedUsers || [];
}

// Run the seeder
generateMockUsers();
