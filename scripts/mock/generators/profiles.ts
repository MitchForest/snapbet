#!/usr/bin/env bun

/**
 * Behavioral Profile System for Mock Users
 *
 * This system enhances the existing mock data generation by adding
 * consistent behavioral patterns while preserving all existing functionality
 * including badge earning, varied content, and realistic interactions.
 */

export interface UserBehavioralProfile {
  // Betting patterns
  favoriteSports: string[];
  favoriteTeams: string[];
  betTypeDistribution: {
    spread: number;
    total: number;
    moneyline: number;
    parlay: number;
  };
  stakePattern: 'conservative' | 'moderate' | 'aggressive' | 'variable';
  avgStakeMultiplier: number; // 0.5x to 3x of base
  peakHours: number[]; // Hours when most active

  // Social patterns
  followsPersonalities: string[]; // Types of users they follow
  engagementLevel: 'heavy' | 'moderate' | 'lurker';
  reactionPreferences: string[]; // Preferred emojis from ALLOWED_EMOJIS
  tailVsFade: number; // 0-1, 0 = always fade, 1 = always tail

  // Content patterns
  captionStyle: 'minimal' | 'analytical' | 'emotional' | 'emoji-heavy';
  postFrequency: number; // Posts per week
  pickShareRate: number; // % of bets shared as picks
  mediaPreferences: string[]; // Types of gifs/media they prefer
}

/**
 * Generate behavioral profile based on personality type
 * These profiles create natural clustering for RAG while maintaining
 * the ability to earn badges and create varied content
 */
export function generateBehavioralProfile(personality: string | null): UserBehavioralProfile {
  switch (personality) {
    case 'sharp-steve':
      return {
        favoriteSports: ['NBA', 'NFL'],
        favoriteTeams: ['Lakers', 'Heat', 'Chiefs', '49ers', 'Celtics'],
        betTypeDistribution: { spread: 70, total: 20, moneyline: 10, parlay: 0 },
        stakePattern: 'moderate',
        avgStakeMultiplier: 0.8, // Reduced from 1.5 - sharps bet smaller
        peakHours: [19, 20, 21], // Evening analysis time
        followsPersonalities: ['sharp-steve', 'fade-frank'],
        engagementLevel: 'moderate',
        reactionPreferences: ['💯', '🔥'],
        tailVsFade: 0.7, // Mostly tails other sharps
        captionStyle: 'analytical',
        postFrequency: 7,
        pickShareRate: 0.4,
        mediaPreferences: ['thinking', 'positive'],
      };

    case 'degen-dave':
      return {
        favoriteSports: ['NBA', 'NFL', 'NHL', 'MLB'],
        favoriteTeams: [], // Bets everything
        betTypeDistribution: { spread: 20, total: 20, moneyline: 10, parlay: 50 },
        stakePattern: 'aggressive',
        avgStakeMultiplier: 2.5,
        peakHours: [22, 23, 0, 1], // Late night degen hours
        followsPersonalities: ['degen-dave', 'casual-carl'],
        engagementLevel: 'heavy',
        reactionPreferences: ['🚀', '💀', '😭'],
        tailVsFade: 0.5, // Random
        captionStyle: 'emoji-heavy',
        postFrequency: 15,
        pickShareRate: 0.8,
        mediaPreferences: ['wild', 'celebration', 'frustration'],
      };

    case 'square-bob':
      return {
        favoriteSports: ['NFL', 'NBA'],
        favoriteTeams: ['Cowboys', 'Lakers', 'Yankees', 'Patriots'], // Public teams
        betTypeDistribution: { spread: 80, total: 15, moneyline: 5, parlay: 0 },
        stakePattern: 'conservative',
        avgStakeMultiplier: 0.8,
        peakHours: [12, 13, 14], // Lunch break betting
        followsPersonalities: ['square-bob', 'public-pete'],
        engagementLevel: 'moderate',
        reactionPreferences: ['🔥', '😂'],
        tailVsFade: 0.9, // Always tails public
        captionStyle: 'emotional',
        postFrequency: 5,
        pickShareRate: 0.6,
        mediaPreferences: ['celebration', 'frustration'],
      };

    case 'public-pete':
      return {
        favoriteSports: ['NFL', 'NBA', 'MLB'],
        favoriteTeams: ['Chiefs', 'Warriors', 'Dodgers'], // Popular winners
        betTypeDistribution: { spread: 70, total: 20, moneyline: 10, parlay: 0 },
        stakePattern: 'moderate',
        avgStakeMultiplier: 1.0,
        peakHours: [18, 19, 20], // Prime time
        followsPersonalities: ['public-pete', 'square-bob', 'casual-carl'],
        engagementLevel: 'heavy',
        reactionPreferences: ['🔥', '💯', '😂'],
        tailVsFade: 0.8,
        captionStyle: 'emotional',
        postFrequency: 10,
        pickShareRate: 0.7,
        mediaPreferences: ['celebration', 'positive'],
      };

    case 'casual-carl':
      return {
        favoriteSports: ['NFL', 'NBA'],
        favoriteTeams: ['Bills', 'Suns', 'Knicks'], // Fun teams
        betTypeDistribution: { spread: 50, total: 30, moneyline: 15, parlay: 5 },
        stakePattern: 'conservative',
        avgStakeMultiplier: 0.3, // Very small bets for casual players
        peakHours: [20, 21, 22], // Evening casual time
        followsPersonalities: ['casual-carl', 'public-pete'],
        engagementLevel: 'moderate',
        reactionPreferences: ['😂', '🔥', '💀'],
        tailVsFade: 0.6,
        captionStyle: 'minimal',
        postFrequency: 3,
        pickShareRate: 0.3,
        mediaPreferences: ['positive', 'celebration'],
      };

    case 'fade-frank':
      return {
        favoriteSports: ['NBA', 'NFL', 'MLB'],
        favoriteTeams: [], // No loyalty, just fades
        betTypeDistribution: { spread: 60, total: 30, moneyline: 10, parlay: 0 },
        stakePattern: 'moderate',
        avgStakeMultiplier: 1.2,
        peakHours: [16, 17, 18], // Analyzes before primetime
        followsPersonalities: ['sharp-steve', 'fade-frank'],
        engagementLevel: 'moderate',
        reactionPreferences: ['😂', '💀', '💯'],
        tailVsFade: 0.2, // Mostly fades
        captionStyle: 'analytical',
        postFrequency: 8,
        pickShareRate: 0.5,
        mediaPreferences: ['thinking', 'frustration'],
      };

    default:
      // Default profile for users without specific personality
      return {
        favoriteSports: ['NFL', 'NBA'],
        favoriteTeams: ['Chiefs', 'Lakers', 'Warriors'],
        betTypeDistribution: { spread: 60, total: 25, moneyline: 10, parlay: 5 },
        stakePattern: 'moderate',
        avgStakeMultiplier: 1.0,
        peakHours: [19, 20, 21],
        followsPersonalities: ['casual-carl', 'public-pete'],
        engagementLevel: 'moderate',
        reactionPreferences: ['🔥', '💯'],
        tailVsFade: 0.7,
        captionStyle: 'minimal',
        postFrequency: 5,
        pickShareRate: 0.4,
        mediaPreferences: ['positive', 'celebration'],
      };
  }
}

/**
 * Get bet count for personality type
 * This ensures users generate enough bets for badges while maintaining personality
 */
export function getBetCountForPersonality(personality: string | null): number {
  switch (personality) {
    case 'sharp-steve':
      return 50; // Reduced from 150
    case 'degen-dave':
      return 50; // Reduced from 200
    case 'fade-frank':
      return 40; // Reduced from 120
    case 'square-bob':
      return 30; // Reduced from 80
    case 'public-pete':
      return 35; // Reduced from 100
    case 'casual-carl':
      return 20; // Reduced from 50
    default:
      return 30; // Reduced from 75
  }
}

/**
 * Select option based on distribution percentages
 */
export function selectByDistribution(distribution: Record<string, number>): string {
  const rand = Math.random() * 100;
  let cumulative = 0;

  for (const [key, percentage] of Object.entries(distribution)) {
    cumulative += percentage;
    if (rand <= cumulative) {
      return key;
    }
  }

  // Fallback to first key
  return Object.keys(distribution)[0];
}

/**
 * Get teams for a sport based on real teams
 */
export function getTeamsForSport(sport: string): string[] {
  switch (sport) {
    case 'NBA':
      return [
        'Lakers',
        'Warriors',
        'Celtics',
        'Heat',
        'Nets',
        'Suns',
        'Bucks',
        'Nuggets',
        '76ers',
        'Clippers',
      ];
    case 'NFL':
      return [
        'Chiefs',
        'Bills',
        'Cowboys',
        '49ers',
        'Eagles',
        'Packers',
        'Ravens',
        'Bengals',
        'Dolphins',
        'Lions',
      ];
    case 'MLB':
      return [
        'Yankees',
        'Dodgers',
        'Astros',
        'Braves',
        'Mets',
        'Padres',
        'Rangers',
        'Orioles',
        'Rays',
        'Twins',
      ];
    case 'NHL':
      return [
        'Avalanche',
        'Panthers',
        'Lightning',
        'Rangers',
        'Oilers',
        'Golden Knights',
        'Bruins',
        'Maple Leafs',
      ];
    default:
      return [];
  }
}

/**
 * Generate consistent caption based on style
 */
export function generateCaptionForStyle(
  style: string,
  betDetails: { team?: string; line?: number; total_type?: string },
  isWin?: boolean
): string {
  switch (style) {
    case 'analytical':
      if (isWin !== undefined) {
        return isWin
          ? `✅ ${betDetails.team} covered as expected. Line movement was the tell.`
          : `❌ Tough loss on ${betDetails.team}. Still like the process.`;
      }
      return `${betDetails.team} ${betDetails.line || ''} is the play. Numbers don't lie 📊`;

    case 'emoji-heavy':
      if (isWin !== undefined) {
        return isWin
          ? `${betDetails.team} HITS!!! 🚀🚀🚀 LFG!!! 💰💰💰`
          : `${betDetails.team} 💀💀💀 Pain... onto the next 😤`;
      }
      return `${betDetails.team} TO THE MOON 🚀🚀🚀 WHO'S WITH ME??? 🔥🔥🔥`;

    case 'emotional':
      if (isWin !== undefined) {
        return isWin
          ? `YESSSS! ${betDetails.team} never doubted them for a second! 🔥`
          : `Can't believe ${betDetails.team} let me down like that 😭`;
      }
      return `I'm feeling ${betDetails.team} tonight! This is the one! 💪`;

    case 'minimal':
    default:
      if (isWin !== undefined) {
        return isWin ? `${betDetails.team} ✅` : `${betDetails.team} ❌`;
      }
      return `${betDetails.team} ${betDetails.line || ''}`;
  }
}

/**
 * Get media URL based on preferences and context
 */
export function getMediaForContext(
  mediaPreferences: string[],
  context: 'pick' | 'win' | 'loss' | 'story',
  mediaUrls: Record<string, string[]>
): string {
  let category: string;

  switch (context) {
    case 'pick':
      category = mediaPreferences.includes('thinking') ? 'thinking' : 'positive';
      break;
    case 'win':
      category = mediaPreferences.includes('celebration') ? 'celebration' : 'positive';
      break;
    case 'loss':
      category = mediaPreferences.includes('frustration') ? 'frustration' : 'positive';
      break;
    case 'story':
    default:
      category = mediaPreferences[0] || 'positive';
  }

  const urls = mediaUrls[category] || mediaUrls.positive;
  return urls[Math.floor(Math.random() * urls.length)];
}
