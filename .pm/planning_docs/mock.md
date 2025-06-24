# SnapBet Mock Data Strategy

## Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [Mock User System](#mock-user-system)
3. [Game & Odds Generation](#game--odds-generation)
4. [Betting Patterns & Settlement](#betting-patterns--settlement)
5. [Content Generation Strategy](#content-generation-strategy)
6. [Real-time Activity Simulation](#real-time-activity-simulation)
7. [Integration with Real Users](#integration-with-real-users)
8. [Seeding Scripts](#seeding-scripts)
9. [Demo Scenarios](#demo-scenarios)
10. [Performance & Scale](#performance--scale)

## Overview & Architecture

### Design Principles

1. **Realism First**: Mock data should be indistinguishable from real data
2. **Personality-Driven**: Each mock user has consistent behavior patterns
3. **Time-Based**: Activity follows realistic daily/weekly patterns
4. **Seamless Integration**: Real users interact naturally with mock content
5. **Demo-Ready**: Support specific scenarios for demonstrations

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Mock Data System                      │
├─────────────────────────────────────────────────────────┤
│  Data Generators           │  Activity Simulators       │
│  ├── User Generator       │  ├── Post Scheduler       │
│  ├── Game Generator       │  ├── Bet Placement Bot    │
│  ├── Odds Generator       │  ├── Social Interaction   │
│  ├── Content Generator    │  └── Settlement Engine    │
│  └── Personality Engine   │                            │
├─────────────────────────────────────────────────────────┤
│                  Storage Layer                           │
│  ├── Mock Users (marked with is_mock flag)             │
│  ├── Mock Games (realistic schedule)                    │
│  └── Mixed Feed (real + mock content)                  │
└─────────────────────────────────────────────────────────┘
```

### Mock Data Identification

```typescript
// All mock entities have identifying flags
interface MockEntity {
  is_mock: boolean;
  mock_personality_id?: string;
  mock_behavior_seed?: number;
}

// Real users can interact with mock content
// Mock users can interact with real content
// System knows which is which for analytics
```

## Mock User System

### User Personality Archetypes

```typescript
enum PersonalityType {
  SHARP_BETTOR = 'sharp_bettor',      // High win rate, careful picks
  SQUARE_BETTOR = 'square_bettor',    // Bets favorites, public picks
  FADE_MATERIAL = 'fade_material',    // Consistently wrong
  CHALK_EATER = 'chalk_eater',        // Only heavy favorites
  DOG_LOVER = 'dog_lover',            // Loves underdogs
  PARLAY_DEGEN = 'parlay_degen',      // Always parlays
  HOMER = 'homer',                    // Only bets their team
  TREND_FOLLOWER = 'trend_follower',  // Follows hot/cold streaks
  CONTRARIAN = 'contrarian',          // Fades the public
  ENTERTAINMENT = 'entertainment'      // Fun personality, break-even
}

interface MockUserPersonality {
  id: string;
  type: PersonalityType;
  favorite_teams: string[];
  betting_style: {
    preferred_bet_types: ('spread' | 'total' | 'moneyline')[];
    average_stake: number;
    stake_variance: number;
    risk_tolerance: number; // 0-1
    win_rate_target: number;
  };
  posting_style: {
    post_frequency: number; // posts per day
    caption_style: 'analytical' | 'emotional' | 'meme' | 'basic';
    emoji_usage: 'heavy' | 'moderate' | 'minimal';
    confidence_expression: 'loud' | 'measured' | 'quiet';
  };
  social_behavior: {
    tail_tendency: number; // 0-1
    fade_tendency: number; // 0-1
    reaction_frequency: number;
    group_chat_activity: 'active' | 'moderate' | 'lurker';
  };
}
```

### Mock User Generation

```typescript
const mockUserTemplates: MockUserTemplate[] = [
  {
    username: 'SharpShooter23',
    personality: PersonalityType.SHARP_BETTOR,
    bio: 'Former sportsbook employee. Dogs and unders. 📊',
    avatar: '🎯',
    stats_preset: {
      win_rate: 0.58,
      roi: 0.15,
      average_odds: -115
    }
  },
  {
    username: 'LakeShowMike',
    personality: PersonalityType.HOMER,
    bio: 'Lakers in 5. Every series. Every time. 💜💛',
    avatar: '🏀',
    favorite_teams: ['LAL'],
    stats_preset: {
      win_rate: 0.48,
      roi: -0.05,
      team_bet_percentage: 0.85
    }
  },
  {
    username: 'FadeMeMolly',
    personality: PersonalityType.FADE_MATERIAL,
    bio: 'I\'m so bad it\'s good. Seriously, fade me 🤡',
    avatar: '🎪',
    stats_preset: {
      win_rate: 0.38,
      roi: -0.22,
      fade_profit_for_others: 0.18
    }
  },
  {
    username: 'ParlayPrincess',
    personality: PersonalityType.PARLAY_DEGEN,
    bio: 'Why win $100 when you could win $10,000? 🚀',
    avatar: '👑',
    stats_preset: {
      win_rate: 0.12,
      roi: -0.35,
      average_parlay_legs: 5
    }
  },
  {
    username: 'DogPoundDave',
    personality: PersonalityType.DOG_LOVER,
    bio: 'Plus money or no money 🐕',
    avatar: '🐶',
    stats_preset: {
      win_rate: 0.44,
      roi: 0.08,
      average_odds: 180
    }
  },
  {
    username: 'PublicFader88',
    personality: PersonalityType.CONTRARIAN,
    bio: 'If everyone\'s on it, I\'m fading it 🔄',
    avatar: '🔄',
    stats_preset: {
      win_rate: 0.53,
      roi: 0.07,
      fade_public_percentage: 0.80
    }
  },
  {
    username: 'ChalkChomper',
    personality: PersonalityType.CHALK_EATER,
    bio: 'Favorites only. Slow and steady 🏔️',
    avatar: '✅',
    stats_preset: {
      win_rate: 0.65,
      roi: -0.03,
      average_odds: -250
    }
  },
  {
    username: 'TrendyTaylor',
    personality: PersonalityType.TREND_FOLLOWER,
    bio: 'Hot teams stay hot 🔥 Cold teams stay cold 🧊',
    avatar: '📈',
    stats_preset: {
      win_rate: 0.51,
      roi: 0.02
    }
  },
  // ... generate 30+ unique personalities
];
```

### Behavioral Patterns

```typescript
class MockUserBehavior {
  constructor(
    private personality: MockUserPersonality,
    private seed: number // For consistent randomness
  ) {}
  
  // Betting decisions based on personality
  shouldBetGame(game: Game, publicBettingPercentage: number): boolean {
    switch (this.personality.type) {
      case PersonalityType.CONTRARIAN:
        // More likely to bet when public is heavy on one side
        return publicBettingPercentage > 70 || publicBettingPercentage < 30;
        
      case PersonalityType.HOMER:
        // Only bets games with their team
        return game.teams.some(team => 
          this.personality.favorite_teams.includes(team)
        );
        
      case PersonalityType.SHARP_BETTOR:
        // Selective, looks for value
        return this.findValue(game) && Math.random() < 0.3;
        
      default:
        return Math.random() < 0.5;
    }
  }
  
  // Pick selection based on personality
  selectBet(game: Game): BetSelection {
    const betType = this.selectBetType();
    const side = this.selectSide(game, betType);
    const stake = this.calculateStake();
    
    return { betType, side, stake };
  }
  
  // Caption generation based on style
  generateCaption(bet: Bet, confidence: number): string {
    const style = this.personality.posting_style.caption_style;
    
    switch (style) {
      case 'analytical':
        return this.analyticalCaption(bet, confidence);
      case 'emotional':
        return this.emotionalCaption(bet, confidence);
      case 'meme':
        return this.memeCaption(bet);
      default:
        return this.basicCaption(bet);
    }
  }
}
```

## Game & Odds Generation

### Realistic Game Scheduling

```typescript
interface GameSchedulePattern {
  sport: 'nfl' | 'nba';
  dayOfWeek: number[]; // 0-6
  typicalStartTimes: string[]; // ['13:00', '16:25', '20:20']
  gamesPerDay: { min: number; max: number };
  seasonMonths: number[]; // 1-12
}

const schedulePatterns: GameSchedulePattern[] = [
  {
    sport: 'nfl',
    dayOfWeek: [0, 1, 4], // Sun, Mon, Thu
    typicalStartTimes: ['13:00', '16:05', '16:25', '20:20'],
    gamesPerDay: { min: 1, max: 16 },
    seasonMonths: [9, 10, 11, 12, 1]
  },
  {
    sport: 'nba',
    dayOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day
    typicalStartTimes: ['19:00', '19:30', '20:00', '22:00', '22:30'],
    gamesPerDay: { min: 3, max: 15 },
    seasonMonths: [10, 11, 12, 1, 2, 3, 4, 5, 6]
  }
];

function generateGamesForDate(date: Date): Game[] {
  const games: Game[] = [];
  const dayOfWeek = date.getDay();
  
  // Generate NFL games
  if (schedulePatterns.nfl.dayOfWeek.includes(dayOfWeek)) {
    const nflGames = generateNFLGames(date);
    games.push(...nflGames);
  }
  
  // Generate NBA games
  const nbaGameCount = randomBetween(
    schedulePatterns.nba.gamesPerDay.min,
    schedulePatterns.nba.gamesPerDay.max
  );
  
  const nbaGames = generateNBAGames(date, nbaGameCount);
  games.push(...nbaGames);
  
  return games;
}
```

### Odds Generation with Realism

```typescript
class OddsGenerator {
  // Generate correlated odds across bet types
  generateGameOdds(
    homeTeam: Team,
    awayTeam: Team,
    powerRating: number // Home team advantage
  ): GameOdds {
    // Start with moneyline based on power rating
    const homeML = this.powerRatingToMoneyline(powerRating);
    const awayML = this.calculateOppositeML(homeML);
    
    // Derive spread from moneyline
    const spread = this.moneylineToSpread(homeML);
    
    // Generate total based on team styles
    const total = this.generateTotal(homeTeam, awayTeam);
    
    // Add realistic juice variations
    const spreadJuice = this.generateJuice();
    const totalJuice = this.generateJuice();
    
    return {
      moneyline: {
        home: homeML,
        away: awayML
      },
      spread: {
        line: spread,
        homeOdds: spreadJuice.home,
        awayOdds: spreadJuice.away
      },
      total: {
        line: total,
        overOdds: totalJuice.over,
        underOdds: totalJuice.under
      }
    };
  }
  
  // Realistic line movements
  simulateLineMovement(
    initialOdds: GameOdds,
    publicBettingPercentage: number,
    sharpAction: 'home' | 'away' | null
  ): GameOdds {
    let odds = { ...initialOdds };
    
    // Public money moves lines slightly
    if (publicBettingPercentage > 75) {
      odds.spread.line -= 0.5; // Move against public
    } else if (publicBettingPercentage < 25) {
      odds.spread.line += 0.5;
    }
    
    // Sharp money moves lines more
    if (sharpAction === 'home') {
      odds.spread.line -= 1;
      odds.moneyline.home -= 10;
      odds.moneyline.away += 10;
    }
    
    return odds;
  }
  
  private generateJuice(): { home: number; away: number; over: number; under: number } {
    // Standard juice with small variations
    const base = -110;
    const variation = randomBetween(-5, 5);
    
    return {
      home: base + variation,
      away: base - variation,
      over: base + randomBetween(-3, 3),
      under: base + randomBetween(-3, 3)
    };
  }
}
```

### Dynamic Game Data

```typescript
interface MockGame {
  id: string;
  sport: 'nfl' | 'nba';
  home_team: string;
  away_team: string;
  commence_time: Date;
  odds_history: OddsSnapshot[];
  public_betting: {
    spread: { home: number; away: number };
    total: { over: number; under: number };
    moneyline: { home: number; away: number };
  };
  injuries: string[];
  weather?: WeatherCondition; // NFL only
  narrative: string; // Story line for the game
}

// Generate compelling narratives
const gameNarratives = [
  'Revenge game after last year\'s playoff loss',
  'Division rivals with playoff implications',
  'Star player returning from injury',
  'Historic rivalry renewed',
  'David vs Goliath matchup',
  'Battle of MVP candidates',
  'Coaching chess match',
  'Must-win for playoff hopes'
];
```

## Betting Patterns & Settlement

### Realistic Betting Distribution

```typescript
class BettingPatternSimulator {
  // Simulate public betting percentages
  generatePublicBetting(game: MockGame): PublicBetting {
    const favoriteML = Math.min(game.odds.moneyline.home, game.odds.moneyline.away);
    const isFavoriteHome = game.odds.moneyline.home === favoriteML;
    
    // Public tends to bet favorites and overs
    const favoriteBias = 0.65 + Math.random() * 0.15; // 65-80% on favorites
    const overBias = 0.55 + Math.random() * 0.10; // 55-65% on overs
    
    return {
      spread: {
        home: isFavoriteHome ? favoriteBias : 1 - favoriteBias,
        away: isFavoriteHome ? 1 - favoriteBias : favoriteBias
      },
      total: {
        over: overBias,
        under: 1 - overBias
      },
      moneyline: {
        home: isFavoriteHome ? favoriteBias + 0.05 : 1 - favoriteBias - 0.05,
        away: isFavoriteHome ? 1 - favoriteBias - 0.05 : favoriteBias + 0.05
      }
    };
  }
  
  // Generate bets based on personality and game
  generateMockUserBets(
    users: MockUser[],
    games: MockGame[],
    currentTime: Date
  ): MockBet[] {
    const bets: MockBet[] = [];
    
    for (const user of users) {
      const behavior = new MockUserBehavior(user.personality, user.seed);
      
      for (const game of games) {
        // Only bet upcoming games
        if (game.commence_time < currentTime) continue;
        
        // Check if user would bet this game
        if (behavior.shouldBetGame(game, game.public_betting)) {
          const betSelection = behavior.selectBet(game);
          const bet = this.createBet(user, game, betSelection);
          bets.push(bet);
          
          // Some users post their picks
          if (Math.random() < user.personality.posting_style.post_frequency) {
            this.createPickPost(user, bet, behavior);
          }
        }
      }
    }
    
    return bets;
  }
}
```

### Game Settlement Engine

```typescript
class SettlementEngine {
  // Generate realistic scores
  generateFinalScore(
    game: MockGame,
    powerRating: number
  ): { home: number; away: number } {
    switch (game.sport) {
      case 'nfl':
        return this.generateNFLScore(powerRating);
      case 'nba':
        return this.generateNBAScore(powerRating);
    }
  }
  
  private generateNFLScore(powerRating: number): Score {
    // Common NFL scores
    const commonScores = [
      [24, 21], [27, 24], [31, 28], [20, 17], 
      [23, 20], [34, 31], [17, 14], [28, 24]
    ];
    
    // Pick base score
    const [winScore, loseScore] = randomChoice(commonScores);
    
    // Determine winner based on power rating
    const homeWins = Math.random() < (0.5 + powerRating * 0.1);
    
    return {
      home: homeWins ? winScore : loseScore,
      away: homeWins ? loseScore : winScore
    };
  }
  
  private generateNBAScore(powerRating: number): Score {
    // NBA scores typically 90-130
    const baseScore = 105;
    const variance = 15;
    
    const homeBase = baseScore + (powerRating * 5);
    const awayBase = baseScore - (powerRating * 5);
    
    return {
      home: Math.round(homeBase + (Math.random() - 0.5) * variance),
      away: Math.round(awayBase + (Math.random() - 0.5) * variance)
    };
  }
  
  // Settle bets with personality impact
  settleBetsWithPersonality(
    game: MockGame,
    finalScore: Score,
    bets: MockBet[]
  ): SettlementResult[] {
    const results: SettlementResult[] = [];
    
    for (const bet of bets) {
      const result = this.determineBetResult(bet, finalScore);
      
      // Apply personality-based win rates
      const adjustedResult = this.adjustForPersonality(
        result,
        bet.user.personality,
        bet.user.current_win_rate
      );
      
      results.push({
        bet_id: bet.id,
        result: adjustedResult,
        payout: this.calculatePayout(bet, adjustedResult)
      });
    }
    
    return results;
  }
  
  // Ensure personalities maintain target win rates over time
  private adjustForPersonality(
    actualResult: 'won' | 'lost' | 'push',
    personality: PersonalityType,
    currentWinRate: number
  ): 'won' | 'lost' | 'push' {
    const targetWinRate = getTargetWinRate(personality);
    
    // If user is significantly below target, maybe give them a win
    if (currentWinRate < targetWinRate - 0.1 && actualResult === 'lost') {
      if (Math.random() < 0.3) return 'won'; // 30% chance to flip
    }
    
    // If user is significantly above target, maybe give them a loss
    if (currentWinRate > targetWinRate + 0.1 && actualResult === 'won') {
      if (Math.random() < 0.3) return 'lost'; // 30% chance to flip
    }
    
    return actualResult;
  }
}
```

## Content Generation Strategy

### Post Content Templates

```typescript
interface ContentTemplate {
  personality: PersonalityType;
  situation: 'pre_bet' | 'post_win' | 'post_loss' | 'analysis' | 'reaction';
  templates: string[];
  mediaType: 'photo' | 'video';
  overlays: string[];
}

const contentTemplates: ContentTemplate[] = [
  {
    personality: PersonalityType.SHARP_BETTOR,
    situation: 'pre_bet',
    templates: [
      'Line value at {team} {line}. Public on the other side.',
      'Books haven\'t adjusted for {injury}. Taking {team}.',
      '{team} matches up perfectly here. Love the spot.'
    ],
    mediaType: 'photo',
    overlays: ['stats', 'line_movement']
  },
  {
    personality: PersonalityType.HOMER,
    situation: 'pre_bet',
    templates: [
      '{my_team} by a million! LFG! 🚀',
      'Mortgage on {my_team} tonight 🏠',
      'If you\'re not with {my_team}, you\'re against us!'
    ],
    mediaType: 'photo',
    overlays: ['team_logo', 'fire_effect']
  },
  {
    personality: PersonalityType.FADE_MATERIAL,
    situation: 'post_loss',
    templates: [
      'I\'m so bad at this 😭 Fade me please',
      'Another L. You\'re welcome faders 🤡',
      '0-5 this week. I\'m literally free money'
    ],
    mediaType: 'video',
    overlays: ['sad_effect', 'loss_counter']
  },
  {
    personality: PersonalityType.PARLAY_DEGEN,
    situation: 'pre_bet',
    templates: [
      '12-leg parlay locked in! $10 to win $8,457 🎰',
      'Why bet one game when you can bet ALL the games?',
      'This is the one boys! Retirement parlay 💰'
    ],
    mediaType: 'photo',
    overlays: ['parlay_slip', 'money_effect']
  }
];

// Generate captions with variables
function generateCaption(
  template: string,
  context: BetContext
): string {
  return template
    .replace('{team}', context.team)
    .replace('{line}', context.line)
    .replace('{my_team}', context.favoriteTeam)
    .replace('{injury}', context.injuryNews)
    .replace('{odds}', context.odds);
}
```

### Media Generation

```typescript
class MockMediaGenerator {
  // Generate realistic bet slip photos
  generateBetSlipImage(bet: MockBet): string {
    // In real implementation, this would create actual images
    // For MVP, use pre-generated images with overlays
    
    const templates = [
      'bet_slip_template_1.jpg',
      'bet_slip_template_2.jpg',
      'bet_slip_template_3.jpg'
    ];
    
    const template = randomChoice(templates);
    
    // Apply overlays
    const overlays = {
      team: bet.team,
      line: bet.line,
      stake: bet.stake,
      toWin: bet.potentialWin
    };
    
    return `mock://betslip/${template}?${queryString(overlays)}`;
  }
  
  // Generate reaction videos
  generateReactionVideo(
    personality: PersonalityType,
    result: 'win' | 'loss'
  ): string {
    const videoTemplates = {
      [PersonalityType.ENTERTAINMENT]: {
        win: ['celebration_dance.mp4', 'money_counting.mp4'],
        loss: ['fake_cry.mp4', 'throw_phone.mp4']
      },
      [PersonalityType.SHARP_BETTOR]: {
        win: ['calm_fistpump.mp4', 'modest_smile.mp4'],
        loss: ['head_shake.mp4', 'review_stats.mp4']
      }
    };
    
    const videos = videoTemplates[personality]?.[result] || ['generic_reaction.mp4'];
    return `mock://video/${randomChoice(videos)}`;
  }
}
```

### Story Generation

```typescript
class StoryGenerator {
  generateDailyStories(users: MockUser[]): Story[] {
    const stories: Story[] = [];
    
    for (const user of users) {
      // Story probability based on personality
      const storyChance = user.personality.posting_style.post_frequency * 0.5;
      
      if (Math.random() < storyChance) {
        const storyType = this.selectStoryType(user);
        const story = this.generateStory(user, storyType);
        stories.push(story);
      }
    }
    
    return stories;
  }
  
  private selectStoryType(user: MockUser): StoryType {
    const recentPerformance = user.getRecentPerformance();
    
    if (recentPerformance.streak >= 3) {
      return 'hot_streak';
    } else if (recentPerformance.bigWin) {
      return 'big_win';
    } else if (user.hasUpcomingBets()) {
      return 'preview';
    } else {
      return 'daily_vibe';
    }
  }
  
  private generateStory(user: MockUser, type: StoryType): Story {
    const templates = {
      hot_streak: [
        '🔥 {streak} in a row! Who\'s tailing?',
        'Heater mode: {wins}-{losses} this week 📈'
      ],
      big_win: [
        'CASHED OUT! +${amount} 💰',
        'Told y\'all! Easy money 🤑'
      ],
      preview: [
        'Tonight\'s locks loaded 🔒',
        'Feeling good about this card 📝'
      ],
      daily_vibe: [
        'Let\'s get this bread 🍞',
        'Bounce back day 💪'
      ]
    };
    
    return {
      user_id: user.id,
      type,
      media: this.generateStoryMedia(type),
      caption: this.fillTemplate(randomChoice(templates[type]), user),
      expires_at: addHours(new Date(), 24)
    };
  }
}
```

## Real-time Activity Simulation

### Activity Scheduler

```typescript
class ActivityScheduler {
  private queue: ScheduledActivity[] = [];
  
  // Initialize daily activities
  scheduleDailyActivities(users: MockUser[], games: Game[]) {
    // Morning activities (8-10 AM)
    this.scheduleMorningPosts(users);
    
    // Pre-game activities (2-3 hours before games)
    games.forEach(game => {
      this.schedulePreGameActivity(users, game);
    });
    
    // Live game reactions
    games.forEach(game => {
      this.scheduleLiveReactions(users, game);
    });
    
    // Post-game activities
    games.forEach(game => {
      this.schedulePostGameActivity(users, game);
    });
    
    // Random social interactions throughout day
    this.scheduleSocialInteractions(users);
  }
  
  private scheduleMorningPosts(users: MockUser[]) {
    const morningUsers = users.filter(u => 
      u.personality.posting_style.post_frequency > 0.5
    );
    
    morningUsers.forEach(user => {
      const postTime = randomTime(8, 10); // 8-10 AM
      
      this.queue.push({
        time: postTime,
        action: () => this.createMorningPost(user)
      });
    });
  }
  
  private schedulePreGameActivity(users: MockUser[], game: Game) {
    const interestedUsers = users.filter(u =>
      this.isInterestedInGame(u, game)
    );
    
    // 2-3 hours before game
    const activityWindow = subHours(game.commence_time, randomBetween(2, 3));
    
    interestedUsers.forEach(user => {
      this.queue.push({
        time: activityWindow,
        action: () => this.createPreGameContent(user, game)
      });
    });
  }
  
  // Simulate live reactions during games
  private scheduleLiveReactions(users: MockUser[], game: Game) {
    const watchingUsers = users.filter(u => u.hasBetOn(game));
    
    // Schedule 3-5 reactions during game
    const reactionCount = randomBetween(3, 5);
    
    for (let i = 0; i < reactionCount; i++) {
      const reactionTime = addMinutes(
        game.commence_time,
        randomBetween(0, 180) // During 3-hour game window
      );
      
      const user = randomChoice(watchingUsers);
      
      this.queue.push({
        time: reactionTime,
        action: () => this.createLiveReaction(user, game)
      });
    }
  }
}
```

### Social Interaction Simulator

```typescript
class SocialInteractionSimulator {
  // Simulate tailing/fading behavior
  simulateTailFadeActivity(
    post: PickPost,
    users: MockUser[]
  ): TailFadeActivity[] {
    const activities: TailFadeActivity[] = [];
    
    // Filter to users who would see this post
    const viewers = users.filter(u => u.follows(post.user_id));
    
    for (const viewer of viewers) {
      const behavior = new MockUserBehavior(viewer.personality, viewer.seed);
      
      // Decide if they would tail/fade
      const decision = behavior.decideTailFade(post, viewer.getBankroll());
      
      if (decision !== 'ignore') {
        activities.push({
          user_id: viewer.id,
          post_id: post.id,
          action: decision,
          timestamp: addMinutes(post.created_at, randomBetween(1, 30))
        });
      }
    }
    
    return activities;
  }
  
  // Simulate group chat activity
  simulateGroupChatActivity(
    chat: GroupChat,
    users: MockUser[],
    context: GameContext
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];
    const activeUsers = users.filter(u => 
      chat.members.includes(u.id) &&
      u.personality.social_behavior.group_chat_activity !== 'lurker'
    );
    
    // Pre-game discussion
    if (context.phase === 'pregame') {
      activeUsers.forEach(user => {
        if (Math.random() < 0.3) {
          messages.push(this.generatePreGameMessage(user, context));
        }
      });
    }
    
    // Live game reactions
    if (context.phase === 'live') {
      const messageCount = randomBetween(5, 15);
      
      for (let i = 0; i < messageCount; i++) {
        const user = randomChoice(activeUsers);
        messages.push(this.generateLiveMessage(user, context));
      }
    }
    
    return messages;
  }
}
```

## Integration with Real Users

### Mixed Feed Strategy

```typescript
class FeedIntegrationManager {
  // Merge real and mock content seamlessly
  async buildIntegratedFeed(
    userId: string,
    limit: number = 20
  ): Promise<FeedPost[]> {
    // Get user's following list
    const following = await this.getFollowing(userId);
    
    // Separate real and mock follows
    const realFollows = following.filter(f => !f.is_mock);
    const mockFollows = following.filter(f => f.is_mock);
    
    // Fetch content from both
    const [realPosts, mockPosts] = await Promise.all([
      this.fetchRealPosts(realFollows, limit * 0.7), // 70% weight to real
      this.fetchMockPosts(mockFollows, limit * 0.3)  // 30% weight to mock
    ]);
    
    // Merge and sort by time
    const merged = [...realPosts, ...mockPosts]
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, limit);
    
    // Add interaction opportunities
    return this.enhanceWithInteractions(merged, userId);
  }
  
  // Ensure mock users interact with real content
  async processMockInteractions(post: Post) {
    if (post.user.is_mock) return; // Skip mock posts
    
    // Get mock users who follow this real user
    const mockFollowers = await this.getMockFollowers(post.user_id);
    
    // Simulate natural interaction delay
    setTimeout(() => {
      mockFollowers.forEach(mockUser => {
        const behavior = new MockUserBehavior(mockUser.personality, mockUser.seed);
        
        // Tail/fade decision
        if (post.bet_id && Math.random() < 0.2) {
          const action = behavior.decideTailFade(post);
          if (action !== 'ignore') {
            this.createMockInteraction(mockUser, post, action);
          }
        }
        
        // Reactions
        if (Math.random() < mockUser.personality.social_behavior.reaction_frequency) {
          this.addMockReaction(mockUser, post);
        }
      });
    }, randomBetween(30000, 300000)); // 30s to 5min delay
  }
}
```

### Real User Onboarding

```typescript
class OnboardingIntegration {
  // Suggest mock users to follow
  async getSuggestedFollows(
    user: User,
    favoriteTeam: string
  ): Promise<SuggestedUser[]> {
    const suggestions: SuggestedUser[] = [];
    
    // Add some mock users who like the same team
    const teamFans = mockUsers.filter(m => 
      m.favorite_teams.includes(favoriteTeam)
    );
    suggestions.push(...randomSample(teamFans, 3));
    
    // Add high-performing mock users
    const topPerformers = mockUsers
      .filter(m => m.personality.type === PersonalityType.SHARP_BETTOR)
      .sort((a, b) => b.stats.roi - a.stats.roi)
      .slice(0, 3);
    suggestions.push(...topPerformers);
    
    // Add entertainment value
    const funUsers = mockUsers.filter(m => 
      [PersonalityType.ENTERTAINMENT, PersonalityType.FADE_MATERIAL]
        .includes(m.personality.type)
    );
    suggestions.push(...randomSample(funUsers, 2));
    
    // Mix with real users if available
    const realSuggestions = await this.getRealUserSuggestions(user);
    
    return shuffle([...suggestions, ...realSuggestions]).slice(0, 10);
  }
}
```

## Seeding Scripts

### Initial Database Seed

```typescript
// scripts/seed-mock-data.ts
async function seedMockData() {
  console.log('🌱 Seeding mock data...');
  
  // 1. Create mock users
  console.log('Creating mock users...');
  const mockUsers = await createMockUsers(30);
  
  // 2. Create follow relationships
  console.log('Creating social graph...');
  await createFollowRelationships(mockUsers);
  
  // 3. Generate historical data
  console.log('Generating 30 days of historical data...');
  await generateHistoricalData(mockUsers, 30);
  
  // 4. Create active games
  console.log('Creating today\'s games...');
  const games = await createTodaysGames();
  
  // 5. Place some bets
  console.log('Placing mock bets...');
  await placeMockBets(mockUsers, games);
  
  // 6. Create some posts
  console.log('Creating initial content...');
  await createInitialContent(mockUsers);
  
  // 7. Start activity simulator
  console.log('Starting activity simulator...');
  await startActivitySimulator(mockUsers);
  
  console.log('✅ Mock data seeded successfully!');
}

// Historical data generation
async function generateHistoricalData(users: MockUser[], days: number) {
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  
  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    // Generate games for this date
    const games = generateGamesForDate(date);
    
    // Generate bets
    const bets = generateMockUserBets(users, games, date);
    
    // Settle games if they're complete
    if (date < subDays(endDate, 1)) {
      await settleGames(games, bets);
    }
    
    // Generate posts/content
    await generateDailyContent(users, games, date);
    
    // Update user stats
    await updateUserStats(users);
  }
}
```

### Continuous Activity Script

```typescript
// scripts/run-activity-simulator.ts
class ContinuousActivitySimulator {
  private scheduler: ActivityScheduler;
  private running = true;
  
  async start() {
    console.log('🤖 Starting continuous activity simulator...');
    
    while (this.running) {
      try {
        // Get current time window
        const now = new Date();
        const upcoming = addMinutes(now, 5);
        
        // Get scheduled activities for next 5 minutes
        const activities = await this.scheduler.getActivitiesInWindow(now, upcoming);
        
        // Execute each activity with some randomness
        for (const activity of activities) {
          const delay = randomBetween(0, 300000); // 0-5min spread
          
          setTimeout(() => {
            this.executeActivity(activity);
          }, delay);
        }
        
        // Check for games starting soon
        await this.checkUpcomingGames();
        
        // Sleep for 5 minutes
        await sleep(300000);
        
      } catch (error) {
        console.error('Activity simulator error:', error);
        await sleep(60000); // Retry in 1 minute
      }
    }
  }
  
  private async executeActivity(activity: ScheduledActivity) {
    try {
      await activity.execute();
      console.log(`✓ Executed: ${activity.type} for ${activity.user.username}`);
    } catch (error) {
      console.error(`✗ Failed: ${activity.type}`, error);
    }
  }
}
```

## Demo Scenarios

### Scripted Demo Flow

```typescript
class DemoScenarioManager {
  // Create specific scenarios for demos
  async setupDemoScenario(scenario: DemoScenario) {
    switch (scenario) {
      case 'big_win':
        return this.setupBigWinScenario();
      case 'fade_success':
        return this.setupFadeSuccessScenario();
      case 'hot_streak':
        return this.setupHotStreakScenario();
      case 'group_excitement':
        return this.setupGroupExcitementScenario();
    }
  }
  
  private async setupBigWinScenario() {
    // Create a user with a pending parlay
    const parlayUser = mockUsers.find(u => 
      u.personality.type === PersonalityType.PARLAY_DEGEN
    );
    
    // Create a 5-leg parlay with 4 legs already won
    const parlay = await this.createNearWinParlay(parlayUser);
    
    // Schedule the final leg to win in 5 minutes
    this.scheduleGameResult(parlay.finalLeg.game_id, {
      home: 110,
      away: 105
    }, addMinutes(new Date(), 5));
    
    // Schedule celebration post
    this.schedulePost(parlayUser, {
      type: 'big_win_celebration',
      delay: addMinutes(new Date(), 6)
    });
    
    return {
      message: 'Big win scenario ready. Parlay will hit in 5 minutes.',
      user: parlayUser.username
    };
  }
  
  private async setupFadeSuccessScenario() {
    // Use our fade material user
    const fadeUser = mockUsers.find(u => u.username === 'FadeMeMolly');
    
    // Create a bad pick
    const badPick = await this.createBadPick(fadeUser);
    
    // Have several users fade it
    const faders = randomSample(mockUsers, 5);
    for (const fader of faders) {
      await this.createFadeAction(fader, badPick);
    }
    
    // Schedule the pick to lose
    this.scheduleGameResult(badPick.game_id, {
      result: 'opposite_of_pick'
    }, addMinutes(new Date(), 10));
    
    return {
      message: 'Fade scenario ready. Pick will lose in 10 minutes.',
      post_id: badPick.id
    };
  }
}
```

### Demo Control Panel

```typescript
// Admin functions for live demos
class DemoControlPanel {
  // Trigger specific events on demand
  async triggerEvent(event: DemoEvent) {
    switch (event.type) {
      case 'hot_user_post':
        const hotUser = this.getHotUser();
        await this.createImmediatePost(hotUser, {
          caption: 'Another one! 🔥 Lakers -5.5',
          confidence: 'high'
        });
        break;
        
      case 'group_activity':
        const group = this.getMostActiveGroup();
        await this.triggerGroupDiscussion(group, {
          topic: 'tonight_games',
          intensity: 'high'
        });
        break;
        
      case 'settle_all_bets':
        await this.settleAllPendingBets({
          favorMockUsers: true, // Ensure good win rate
          createCelebrationPosts: true
        });
        break;
    }
  }
  
  // Adjust activity levels
  async setActivityLevel(level: 'low' | 'normal' | 'high') {
    const multipliers = {
      low: 0.3,
      normal: 1.0,
      high: 2.5
    };
    
    await this.updateSimulatorSettings({
      activityMultiplier: multipliers[level],
      postFrequencyMultiplier: multipliers[level],
      socialInteractionMultiplier: multipliers[level]
    });
  }
}
```

## Performance & Scale

### Optimization Strategies

```typescript
class MockDataOptimizer {
  // Batch operations for efficiency
  async batchCreatePosts(posts: PostInput[]): Promise<void> {
    const chunks = chunk(posts, 100); // Process 100 at a time
    
    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(post => this.createPost(post))
      );
      
      // Small delay to prevent overwhelming
      await sleep(100);
    }
  }
  
  // Cache frequently accessed mock data
  private cache = new Map<string, any>();
  
  async getMockUser(id: string): Promise<MockUser> {
    if (this.cache.has(`user:${id}`)) {
      return this.cache.get(`user:${id}`);
    }
    
    const user = await fetchMockUser(id);
    this.cache.set(`user:${id}`, user);
    
    // Expire cache after 5 minutes
    setTimeout(() => {
      this.cache.delete(`user:${id}`);
    }, 300000);
    
    return user;
  }
  
  // Cleanup old mock data
  async cleanupExpiredMockData() {
    // Remove expired posts
    await supabase
      .from('posts')
      .delete()
      .eq('is_mock', true)
      .lt('expires_at', new Date().toISOString());
    
    // Archive old mock bets
    const archiveDate = subDays(new Date(), 30);
    await this.archiveMockBets(archiveDate);
  }
}
```

### Monitoring Mock Data

```typescript
class MockDataMonitor {
  // Track mock data health
  async getHealthMetrics(): Promise<MockDataHealth> {
    const metrics = await Promise.all([
      this.getActiveUserCount(),
      this.getPostRate(),
      this.getBetDistribution(),
      this.getInteractionRate()
    ]);
    
    return {
      activeMockUsers: metrics[0],
      postsPerHour: metrics[1],
      betTypeDistribution: metrics[2],
      realUserInteractionRate: metrics[3],
      status: this.calculateHealthStatus(metrics)
    };
  }
  
  // Ensure realistic distributions
  async validateMockData() {
    const validations = [
      this.validateWinRates(),
      this.validateBettingPatterns(),
      this.validateSocialGraph(),
      this.validateContentQuality()
    ];
    
    const results = await Promise.all(validations);
    
    return {
      valid: results.every(r => r.valid),
      issues: results.filter(r => !r.valid).map(r => r.issue)
    };
  }
}
```

---

This comprehensive Mock Data Strategy provides everything needed to create a believable, engaging demo environment that seamlessly integrates with real users while maintaining realistic betting patterns and social interactions.