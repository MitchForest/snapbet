# Sprint 06.08: Mock Ecosystem & Demo Tools Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: [Date]  
**End Date**: [Date]  
**Epic**: Epic 6 - Messaging System & Automation

**Sprint Goal**: Create a living mock ecosystem with personality-driven users, realistic activity patterns, and demo orchestration tools for showcasing the platform.

**User Story Contribution**: 
- Creates immediate community feel for new users
- Enables compelling demo recordings with realistic activity
- Showcases all platform features through mock interactions

## 🚨 Required Development Practices

### Database Management
- **Use Supabase MCP** to inspect current database state: `mcp_supabase_get_schemas`, `mcp_supabase_get_tables`, etc.
- **Keep types synchronized**: Run type generation after ANY schema changes
- **Migration files required**: Every database change needs a migration file
- **Test migrations**: Ensure migrations run cleanly on fresh database

### UI/UX Consistency
- **Use Tamagui components**: `View`, `Text`, `XStack`, `YStack`, `Stack`
- **Follow UI/UX rules**: See `.pm/process/ui-ux-consistency-rules.md`
- **Use Colors constant**: Import from `@/theme` - NEVER hardcode colors
- **Standard spacing**: Use Tamagui's `$1`, `$2`, `$3`, etc. tokens

### Code Quality
- **Zero tolerance**: No lint errors, no TypeScript errors
- **Type safety**: No `any` types without explicit justification
- **Run before handoff**: `bun run lint && bun run typecheck`

## Sprint Plan

### Objectives
1. Create personality-driven mock user system
2. Build activity generation for all features
3. Implement realistic timing and patterns
4. Create demo scenario orchestrator
5. Build timeline simulation tools
6. Add conversation generators
7. Create betting pattern simulators
8. Build demo preparation commands

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `scripts/mock/types.ts` | Mock ecosystem types | NOT STARTED |
| `scripts/mock/personalities.ts` | User personality definitions | NOT STARTED |
| `scripts/mock/users/generator.ts` | Mock user generator | NOT STARTED |
| `scripts/mock/users/profiles.ts` | Profile data generator | NOT STARTED |
| `scripts/mock/activity/posts.ts` | Post generation | NOT STARTED |
| `scripts/mock/activity/bets.ts` | Betting activity | NOT STARTED |
| `scripts/mock/activity/social.ts` | Social interactions | NOT STARTED |
| `scripts/mock/activity/messages.ts` | Messaging activity | NOT STARTED |
| `scripts/mock/conversations/generator.ts` | Chat generators | NOT STARTED |
| `scripts/mock/orchestrator.ts` | Demo orchestrator | NOT STARTED |
| `scripts/mock/scenarios.ts` | Demo scenarios | NOT STARTED |
| `scripts/mock/timeline.ts` | Timeline simulator | NOT STARTED |
| `scripts/mock/cli.ts` | Mock CLI interface | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `package.json` | Add mock script commands | NOT STARTED |
| `scripts/data/mock-users.ts` | Enhance with personalities | NOT STARTED |
| `scripts/data/mock-games.ts` | Add more variety | NOT STARTED |

### Implementation Approach

**1. Personality System**:
```typescript
// scripts/mock/personalities.ts
export interface UserPersonality {
  id: string;
  name: string;
  traits: {
    riskTolerance: 'conservative' | 'moderate' | 'aggressive' | 'degen';
    bettingStyle: 'sharp' | 'square' | 'contrarian' | 'follower';
    socialActivity: 'lurker' | 'casual' | 'active' | 'influencer';
    postingStyle: 'memes' | 'analysis' | 'reactions' | 'mixed';
    activeHours: [number, number]; // Start and end hour
    favoriteTeams: string[];
    fadeTendency: number; // 0-1, likelihood to fade
  };
  behaviors: {
    postsPerDay: [number, number]; // Min, max
    betsPerDay: [number, number];
    messagesPerDay: [number, number];
    reactionRate: number; // 0-1
    commentRate: number; // 0-1
    tailRate: number; // 0-1 when seeing picks
  };
}

export const personalities: UserPersonality[] = [
  {
    id: 'degen-mike',
    name: 'Degen Mike',
    traits: {
      riskTolerance: 'degen',
      bettingStyle: 'square',
      socialActivity: 'active',
      postingStyle: 'reactions',
      activeHours: [20, 2], // 8pm - 2am
      favoriteTeams: ['Lakers', 'Cowboys'],
      fadeTendency: 0.1,
    },
    behaviors: {
      postsPerDay: [5, 15],
      betsPerDay: [10, 25],
      messagesPerDay: [20, 50],
      reactionRate: 0.9,
      commentRate: 0.7,
      tailRate: 0.8,
    },
  },
  {
    id: 'sharp-sarah',
    name: 'Sharp Sarah',
    traits: {
      riskTolerance: 'moderate',
      bettingStyle: 'sharp',
      socialActivity: 'casual',
      postingStyle: 'analysis',
      activeHours: [6, 10], // 6am - 10am
      favoriteTeams: ['Heat', 'Ravens'],
      fadeTendency: 0.3,
    },
    behaviors: {
      postsPerDay: [2, 5],
      betsPerDay: [3, 8],
      messagesPerDay: [5, 15],
      reactionRate: 0.4,
      commentRate: 0.3,
      tailRate: 0.2,
    },
  },
  {
    id: 'fade-god-frank',
    name: 'Fade God Frank',
    traits: {
      riskTolerance: 'aggressive',
      bettingStyle: 'contrarian',
      socialActivity: 'influencer',
      postingStyle: 'mixed',
      activeHours: [16, 23], // 4pm - 11pm
      favoriteTeams: ['Knicks', 'Jets'], // Long-suffering fan
      fadeTendency: 0.9,
    },
    behaviors: {
      postsPerDay: [10, 20],
      betsPerDay: [5, 15],
      messagesPerDay: [30, 60],
      reactionRate: 0.6,
      commentRate: 0.8,
      tailRate: 0.05, // Almost always fades
    },
  },
  // ... 20+ more personalities
];
```

**2. Activity Generation**:
```typescript
// scripts/mock/activity/posts.ts
export class MockPostGenerator {
  constructor(
    private user: MockUser,
    private personality: UserPersonality
  ) {}
  
  async generateDailyPosts(date: Date = new Date()): Promise<void> {
    const postCount = this.randomBetween(...this.personality.behaviors.postsPerDay);
    
    for (let i = 0; i < postCount; i++) {
      const postTime = this.getRandomTimeInActiveHours(date);
      const postType = this.selectPostType();
      
      await this.createPost(postType, postTime);
      
      // Space out posts
      await sleep(randomBetween(30 * 60 * 1000, 2 * 60 * 60 * 1000)); // 30min - 2hr
    }
  }
  
  private selectPostType(): 'content' | 'pick' | 'outcome' {
    // Based on personality and recent activity
    const hasBetsToShare = await this.hasUnsettledBets();
    const hasOutcomesToShare = await this.hasUnsharedOutcomes();
    
    if (hasOutcomesToShare && Math.random() < 0.7) {
      return 'outcome';
    }
    
    if (hasBetsToShare && Math.random() < 0.5) {
      return 'pick';
    }
    
    return 'content';
  }
  
  private async createPost(type: PostType, timestamp: Date) {
    switch (type) {
      case 'content':
        return this.createContentPost(timestamp);
      case 'pick':
        return this.createPickPost(timestamp);
      case 'outcome':
        return this.createOutcomePost(timestamp);
    }
  }
  
  private async createContentPost(timestamp: Date) {
    const templates = this.getContentTemplates();
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    const post = {
      user_id: this.user.id,
      type: 'content',
      caption: this.generateCaption(template),
      media_url: await this.selectMockMedia('reaction'),
      effect_id: this.selectEffect(),
      created_at: timestamp,
      expires_at: new Date(timestamp.getTime() + 24 * 60 * 60 * 1000),
    };
    
    await supabase.from('posts').insert(post);
  }
  
  private getContentTemplates(): string[] {
    switch (this.personality.traits.postingStyle) {
      case 'memes':
        return [
          "When you're up 5 units but your last leg is looking shaky 😅",
          "POV: You said you were done betting for the day 🤡",
          "The degen in me: *sees -110 odds* 'That's basically free money'",
        ];
      case 'analysis':
        return [
          "Lakers shooting 38% from 3 over last 5 games. Fade the over on threes tonight.",
          "Weather looking rough in Buffalo. Under might be the play 🌨️",
          "Line movement on this game is suspicious. Vegas knows something.",
        ];
      case 'reactions':
        return [
          "LETS GOOOOO!!! 🔥🔥🔥",
          "Why do I do this to myself 😭",
          "Never betting the [team] again I swear",
        ];
      default:
        return [...]; // Mix of all
    }
  }
}
```

**3. Conversation Generator**:
```typescript
// scripts/mock/conversations/generator.ts
export class ConversationGenerator {
  async generateGroupChat(
    participants: MockUser[],
    topic: 'game-discussion' | 'bad-beat' | 'celebration' | 'general'
  ): Promise<void> {
    const chat = await this.createGroupChat(participants, topic);
    const messages = this.generateConversationFlow(participants, topic);
    
    for (const message of messages) {
      await this.sendMessage(chat.id, message);
      await sleep(randomBetween(1000, 30000)); // 1-30 seconds
    }
  }
  
  private generateConversationFlow(
    participants: MockUser[],
    topic: string
  ): ConversationMessage[] {
    const flows = {
      'game-discussion': [
        { role: 'initiator', text: "Anyone watching the {team} game?" },
        { role: 'responder', text: "Yeah, thinking about the over" },
        { role: 'contrarian', text: "Nah under all day, {reason}" },
        { role: 'follower', text: "I'll tail whoever has been hot 🔥" },
        { role: 'initiator', text: "I'm on {team} -5.5" },
        { role: 'responder', text: "Same here LFG!" },
      ],
      'bad-beat': [
        { role: 'victim', text: "I can't believe that just happened..." },
        { role: 'sympathizer', text: "Bro what??? I saw that" },
        { role: 'victim', text: "Up 20 with 3 minutes left 😭" },
        { role: 'comedian', text: "First time? 😂" },
        { role: 'sympathizer', text: "That's brutal man" },
      ],
      // ... other flows
    };
    
    return this.personalizeFlow(flows[topic], participants);
  }
}
```

**4. Demo Orchestrator**:
```typescript
// scripts/mock/orchestrator.ts
export class DemoOrchestrator {
  constructor(private options: OrchestratorOptions = {}) {}
  
  async prepareDemo(scenario: DemoScenario): Promise<void> {
    console.log(`🎬 Preparing ${scenario} demo...`);
    
    switch (scenario) {
      case 'new-user-experience':
        await this.setupNewUserExperience();
        break;
      case 'saturday-football':
        await this.setupSaturdayFootball();
        break;
      case 'nba-primetime':
        await this.setupNBAPrimetime();
        break;
      case 'social-engagement':
        await this.setupSocialEngagement();
        break;
      case 'power-user':
        await this.setupPowerUser();
        break;
    }
    
    console.log('✅ Demo ready!');
  }
  
  private async setupNewUserExperience() {
    // Clear existing activity for clean slate
    await this.clearRecentActivity();
    
    // Create fresh activity from last hour
    const mockUsers = await this.getMockUsers();
    
    // Generate recent posts
    for (const user of mockUsers.slice(0, 10)) {
      await this.generateRecentPost(user);
    }
    
    // Create some trending bets
    await this.createTrendingBets();
    
    // Generate welcome messages
    await this.queueWelcomeMessages();
  }
  
  private async setupSaturdayFootball() {
    const gameTime = this.getNextSaturday();
    const mockUsers = await this.getMockUsers();
    
    // Pre-game activity (2 hours before)
    await this.simulateTimeRange(
      new Date(gameTime.getTime() - 2 * 60 * 60 * 1000),
      gameTime,
      async (currentTime) => {
        // Betting activity ramps up
        const activeUsers = this.getActiveUsersForTime(mockUsers, currentTime);
        
        for (const user of activeUsers) {
          if (Math.random() < 0.3) {
            await this.generateBet(user, 'NFL', currentTime);
          }
          if (Math.random() < 0.2) {
            await this.generatePickPost(user, currentTime);
          }
        }
      }
    );
    
    // During games
    await this.simulateLiveGameActivity(gameTime);
  }
  
  async runLiveDemo(scenario: DemoScenario): Promise<void> {
    console.log(`🎬 Running live ${scenario} demo...`);
    
    const activities = this.getScenarioActivities(scenario);
    
    for (const activity of activities) {
      await this.executeActivity(activity);
      await sleep(activity.delay || 5000);
    }
  }
  
  private getScenarioActivities(scenario: DemoScenario): Activity[] {
    const scenarios = {
      'onboarding-flow': [
        { type: 'user-joins', delay: 2000 },
        { type: 'welcome-message', delay: 3000 },
        { type: 'first-follow', delay: 2000 },
        { type: 'see-pick-post', delay: 3000 },
        { type: 'tail-bet', delay: 5000 },
      ],
      'social-buzz': [
        { type: 'hot-pick-posted', delay: 1000 },
        { type: 'multiple-tails', count: 5, delay: 2000 },
        { type: 'comments-flow', delay: 3000 },
        { type: 'group-chat-activity', delay: 2000 },
      ],
      // ... more scenarios
    };
    
    return scenarios[scenario] || [];
  }
}
```

**5. Timeline Simulator**:
```typescript
// scripts/mock/timeline.ts
export class TimelineSimulator {
  async simulateWeek(startDate: Date = new Date()): Promise<void> {
    console.log('📅 Simulating full week of activity...');
    
    const mockUsers = await this.getAllMockUsers();
    
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() - (6 - day));
      
      console.log(`  Day ${day + 1}: ${currentDate.toDateString()}`);
      
      // Reset daily patterns
      await this.resetDailyPatterns(mockUsers, currentDate);
      
      // Generate day's activity
      await this.simulateDay(mockUsers, currentDate);
      
      // End of day cleanup
      await this.endOfDayProcessing(currentDate);
    }
    
    console.log('✅ Week simulation complete!');
  }
  
  private async simulateDay(users: MockUser[], date: Date) {
    // Morning (6am - 12pm)
    await this.simulateMorning(users, date);
    
    // Afternoon (12pm - 6pm)
    await this.simulateAfternoon(users, date);
    
    // Evening (6pm - 12am)
    await this.simulateEvening(users, date);
    
    // Late night (12am - 6am)
    await this.simulateLateNight(users, date);
  }
  
  private async simulateMorning(users: MockUser[], date: Date) {
    const morningUsers = users.filter(u => 
      u.personality.traits.activeHours[0] <= 12
    );
    
    for (const user of morningUsers) {
      // Check overnight results
      if (Math.random() < 0.7) {
        await this.checkAndShareOutcomes(user, date);
      }
      
      // Morning bets (early games)
      if (Math.random() < 0.3) {
        await this.placeMorningBets(user, date);
      }
      
      // Social activity
      await this.generateSocialActivity(user, date, 'morning');
    }
  }
}
```

**6. CLI Interface**:
```typescript
// scripts/mock/cli.ts
#!/usr/bin/env bun

import { Command } from 'commander';
import { DemoOrchestrator } from './orchestrator';
import { TimelineSimulator } from './timeline';
import { MockUserGenerator } from './users/generator';

const program = new Command();

program
  .name('mock')
  .description('SnapBet mock ecosystem tools')
  .version('1.0.0');

// Generate mock users
program
  .command('generate-users')
  .description('Generate mock users with personalities')
  .option('-c, --count <number>', 'Number of users', '50')
  .option('--clear', 'Clear existing mock users first')
  .action(async (options) => {
    if (options.clear) {
      await clearMockUsers();
    }
    
    const generator = new MockUserGenerator();
    await generator.generateUsers(parseInt(options.count));
    
    console.log(`✅ Generated ${options.count} mock users`);
  });

// Prepare demo scenarios
program
  .command('prepare <scenario>')
  .description('Prepare a demo scenario')
  .option('--fresh', 'Start with fresh data')
  .action(async (scenario, options) => {
    const orchestrator = new DemoOrchestrator();
    
    if (options.fresh) {
      await orchestrator.clearRecentActivity();
    }
    
    await orchestrator.prepareDemo(scenario);
  });

// Run live demo
program
  .command('live <scenario>')
  .description('Run a live demo with real-time activity')
  .option('--speed <number>', 'Speed multiplier', '1')
  .action(async (scenario, options) => {
    const orchestrator = new DemoOrchestrator({
      speed: parseFloat(options.speed),
    });
    
    await orchestrator.runLiveDemo(scenario);
  });

// Simulate timeline
program
  .command('simulate-week')
  .description('Simulate a full week of activity')
  .option('--start <date>', 'Start date (YYYY-MM-DD)')
  .action(async (options) => {
    const simulator = new TimelineSimulator();
    const startDate = options.start 
      ? new Date(options.start) 
      : new Date();
    
    await simulator.simulateWeek(startDate);
  });

// Quick activity
program
  .command('activity <type>')
  .description('Generate quick activity')
  .option('-u, --users <number>', 'Number of users', '5')
  .action(async (type, options) => {
    switch (type) {
      case 'posts':
        await generateQuickPosts(options.users);
        break;
      case 'bets':
        await generateQuickBets(options.users);
        break;
      case 'social':
        await generateQuickSocial(options.users);
        break;
      case 'messages':
        await generateQuickMessages(options.users);
        break;
    }
  });

// List scenarios
program
  .command('scenarios')
  .description('List available demo scenarios')
  .action(() => {
    const scenarios = [
      { id: 'new-user-experience', description: 'Fresh user onboarding' },
      { id: 'saturday-football', description: 'College football Saturday' },
      { id: 'nba-primetime', description: 'NBA evening games' },
      { id: 'social-engagement', description: 'Active social features' },
      { id: 'power-user', description: 'Experienced user with history' },
      { id: 'bad-beat-support', description: 'Community consoling bad beat' },
      { id: 'hot-streak', description: 'User on winning streak' },
    ];
    
    console.table(scenarios);
  });

program.parse();
```

**Key Technical Decisions**:
- Personality-driven behavior for realism
- Time-based activity patterns
- Scenario-based demo preparation
- Live activity generation for recordings
- Conversation flow templates
- Realistic timing and delays

### Dependencies & Risks
**Dependencies**:
- Existing mock data files
- Service layer for data creation
- Real game/odds data

**Identified Risks**:
- Too much activity overwhelming
- Unrealistic patterns detected
- Performance with many mock users
- Timing coordination complexity

**Mitigation**:
- Configurable activity levels
- Personality variety
- Batch operations
- Activity throttling

## Implementation Log

### Day-by-Day Progress
**[Date]**:
- Started: [What was begun]
- Completed: [What was finished]
- Blockers: [Any issues]
- Decisions: [Any changes to plan]

### Reality Checks & Plan Updates

**Reality Check 1** - [Date]
- Issue: [What wasn't working]
- Options Considered:
  1. [Option 1] - Pros/Cons
  2. [Option 2] - Pros/Cons
- Decision: [What was chosen]
- Plan Update: [How sprint plan changed]
- Epic Impact: [Any epic updates needed]

### Code Quality Checks

**Linting Results**:
- [ ] Initial run: [X errors, Y warnings]
- [ ] Final run: [Should be 0 errors]

**Type Checking Results**:
- [ ] Initial run: [X errors]
- [ ] Final run: [Should be 0 errors]

**Build Results**:
- [ ] Development build passes
- [ ] Production build passes

## Key Code Additions

### Mock User Personalities Database
```typescript
// Example personality-driven behaviors
const behaviorTemplates = {
  'degen': {
    bettingPatterns: ['parlays', 'live-bets', 'player-props'],
    reactionStyle: ['fire-emojis', 'all-caps', 'multiple-messages'],
    riskProfile: { minOdds: -200, maxOdds: +1000, avgBetSize: 0.2 }, // 20% of bankroll
  },
  'sharp': {
    bettingPatterns: ['straight-bets', 'line-shopping', 'early-bets'],
    reactionStyle: ['analytical', 'stats-based', 'calm'],
    riskProfile: { minOdds: -150, maxOdds: +150, avgBetSize: 0.05 }, // 5% of bankroll
  },
  'social': {
    bettingPatterns: ['tail-heavy', 'group-consensus', 'fun-bets'],
    reactionStyle: ['supportive', 'engaging', 'emoji-heavy'],
    riskProfile: { minOdds: -110, maxOdds: +200, avgBetSize: 0.1 }, // 10% of bankroll
  },
};
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| N/A | Local execution only | CLI args | Generated data | WORKING |

### State Management
- Mock user state in database
- Activity tracking for realism
- Conversation state for continuity
- No UI state needed

## Testing Performed

### Manual Testing
- [ ] User generation creates diverse personalities
- [ ] Activity patterns match personalities
- [ ] Conversations flow naturally
- [ ] Timing feels realistic
- [ ] Demo scenarios prepare correctly
- [ ] Live demos run smoothly
- [ ] Week simulation completes
- [ ] Activity levels appropriate
- [ ] Social interactions believable
- [ ] Betting patterns realistic

### Edge Cases Considered
- Personality conflicts in groups
- Activity clustering prevention
- Conversation dead ends
- Unrealistic win rates
- Time zone considerations
- Weekend vs weekday patterns

## Documentation Updates

- [ ] Personality type documentation
- [ ] Scenario descriptions
- [ ] CLI usage examples
- [ ] Demo recording guide
- [ ] Activity pattern docs

## Handoff to Reviewer

### What Was Implemented
[Clear summary of all work completed]

### Files Modified/Created
**Created**:
- `scripts/mock/types.ts` - Type definitions
- `scripts/mock/personalities.ts` - Personality system
- `scripts/mock/users/generator.ts` - User generation
- `scripts/mock/users/profiles.ts` - Profile creation
- `scripts/mock/activity/posts.ts` - Post generation
- `scripts/mock/activity/bets.ts` - Betting activity
- `scripts/mock/activity/social.ts` - Social activity
- `scripts/mock/activity/messages.ts` - Messaging
- `scripts/mock/conversations/generator.ts` - Chats
- `scripts/mock/orchestrator.ts` - Demo control
- `scripts/mock/scenarios.ts` - Scenarios
- `scripts/mock/timeline.ts` - Time simulation
- `scripts/mock/cli.ts` - CLI interface

**Modified**:
- `package.json` - Mock scripts
- `scripts/data/mock-users.ts` - Enhanced
- `scripts/data/mock-games.ts` - More variety

### Key Decisions Made
1. **Personality-driven**: Each user has consistent behavior
2. **Time-based patterns**: Activity varies by time of day
3. **Scenario system**: Pre-built demo setups
4. **Live generation**: Real-time activity for recordings
5. **Conversation flows**: Template-based natural chats

### Deviations from Original Plan
- Added personality system for realism
- Enhanced conversation generation
- Added timeline simulation
- More scenario variety

### Known Issues/Concerns
- Performance with 50+ active mock users
- Conversation variety might feel repetitive
- Activity timing needs fine-tuning
- Some personalities might be too extreme

### Suggested Review Focus
- Personality trait balance
- Activity generation realism
- Conversation flow naturalness
- Demo scenario completeness
- Performance optimization

**Sprint Status**: READY FOR REVIEW

---

## Reviewer Section

**Reviewer**: [R persona]  
**Review Date**: [Date]

### Review Checklist
- [ ] Code matches sprint objectives
- [ ] All planned files created/modified
- [ ] Follows established patterns
- [ ] No unauthorized scope additions
- [ ] Code is clean and maintainable
- [ ] No obvious bugs or issues
- [ ] Integrates properly with existing code
- [ ] Mock activity feels realistic
- [ ] Personalities are diverse
- [ ] Demo scenarios work well

### Review Outcome

**Status**: APPROVED | NEEDS REVISION

### Feedback
[If NEEDS REVISION, specific feedback here]

**Required Changes**:
1. **File**: `[filename]`
   - Issue: [What's wrong]
   - Required Change: [What to do]
   - Reasoning: [Why it matters]

### Post-Review Updates
[Track changes made in response to review]

**Update 1** - [Date]
- Changed: [What was modified]
- Result: [New status]

---

## Sprint Metrics

**Duration**: Planned 2.5 hours | Actual [Y] hours  
**Scope Changes**: [Number of plan updates]  
**Review Cycles**: [Number of review rounds]  
**Files Touched**: 16  
**Lines Added**: ~[Estimate]  
**Lines Removed**: ~[Estimate]

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [APPROVED/IN PROGRESS/BLOCKED]* 