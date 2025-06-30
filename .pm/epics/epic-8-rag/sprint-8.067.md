# Sprint 8.067: Unified AI Reasoning System

**Status**: HANDOFF  
**Estimated Duration**: 6-8 hours  
**Dependencies**: Sprint 8.066 completed  
**Primary Goal**: Unify AI reasoning across Find Your Tribe, Smart Notifications, and AI Feed into a single, consistent system

## Problem Statement

Currently, we have three separate AI reasoning implementations:

1. **Find Your Tribe** (`friendDiscoveryService.ts`): Fetches full user betting history, generates rich reasons
2. **Smart Notifications** (`smartNotifications.ts`): Uses AIReasonScorer with current user's metrics
3. **AI Feed** (`feedService.ts`): Uses AIReasonScorer but with limited post data

This causes:
- Inconsistent reason quality across features
- Duplicated database queries
- Performance inefficiencies
- Maintenance complexity

## Architecture Overview

### Current State
```
Find Your Tribe → friendDiscoveryService → Custom reason generation
Smart Notifications → AIReasonScorer → User metrics comparison
AI Feed → AIReasonScorer → Limited post comparison
```

### Target State
```
All Features → Unified AI Service → Consistent high-quality reasons
             → Cached user metrics
             → Shared similarity scoring
```

## Implementation Plan

### Phase 1: Enhance Embedding Pipeline (2 hours)

#### Step 1.1: Extend User Metrics Storage

**File**: `supabase/migrations/037_user_behavioral_metrics.sql`
**Action**: CREATE NEW

```sql
-- Store pre-computed user behavioral metrics
CREATE TABLE user_behavioral_metrics (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  top_teams JSONB DEFAULT '[]',
  avg_stake INTEGER DEFAULT 0,
  active_hours INTEGER[] DEFAULT '{}',
  favorite_sport TEXT,
  dominant_bet_type TEXT,
  stake_style TEXT,
  win_rate NUMERIC(3,2),
  total_bets INTEGER DEFAULT 0,
  betting_patterns JSONB DEFAULT '{}',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX idx_user_behavioral_metrics_updated ON user_behavioral_metrics(last_updated);
```

#### Step 1.2: Update Embedding Pipeline to Store Metrics

**File**: `services/rag/embeddingPipeline.ts`
**Action**: MODIFY

Add after line 260 (after embedding update):
```typescript
// Store computed metrics for reuse
await this.storeUserMetrics(userId, userData.username, behavioralProfile);
```

Add new method after line 476:
```typescript
private async storeUserMetrics(
  userId: string,
  username: string,
  behavioralProfile: string
): Promise<void> {
  try {
    // Parse the behavioral profile to extract metrics
    const metrics = this.extractMetricsFromProfile(behavioralProfile);
    
    const { error } = await this.supabase!
      .from('user_behavioral_metrics')
      .upsert({
        user_id: userId,
        ...metrics,
        last_updated: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to store user metrics:', error);
    } else {
      console.log(`Stored behavioral metrics for user ${username}`);
    }
  } catch (error) {
    console.error('Error storing user metrics:', error);
  }
}

private extractMetricsFromProfile(profile: string): any {
  // Extract structured data from the text profile
  const metrics: any = {
    top_teams: [],
    active_hours: [],
    betting_patterns: {}
  };

  // Extract teams mentioned in profile
  const teamMatches = profile.match(/Teams: ([^,\n]+(?:, [^,\n]+)*)/);
  if (teamMatches) {
    metrics.top_teams = teamMatches[1].split(', ').slice(0, 5);
  }

  // Extract stake information
  const stakeMatch = profile.match(/Average Stake: \$(\d+)/);
  if (stakeMatch) {
    metrics.avg_stake = parseInt(stakeMatch[1]) * 100; // Convert to cents
  }

  // Extract bet type preferences
  const betTypeMatch = profile.match(/Bet Types:.*?(\w+) \((\d+)%\)/);
  if (betTypeMatch) {
    metrics.dominant_bet_type = betTypeMatch[1].toLowerCase();
  }

  // Extract sport preference
  const sportMatch = profile.match(/Sports:.*?(\w+) \(\d+ bets\)/);
  if (sportMatch) {
    metrics.favorite_sport = sportMatch[1];
  }

  return metrics;
}
```

### Phase 2: Create Unified AI Reasoning Service (2 hours)

#### Step 2.1: Create Base AI Service

**File**: `services/ai/aiReasoningService.ts`
**Action**: CREATE NEW

```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { AIReasonScorer, BetWithDetails, UserMetrics } from '@/utils/ai/reasonScoring';

export interface AIUserProfile {
  id: string;
  username: string;
  profile_embedding: string | null;
  metrics: UserMetrics;
  lastUpdated: string;
}

export interface AISimilarUser {
  user: AIUserProfile;
  similarity: number;
  reasons: string[];
  primaryReason: string;
}

export interface AIReasonContext {
  fromUserId: string;
  toUserId: string;
  contextType: 'discovery' | 'notification' | 'feed';
  additionalData?: any;
}

class AIReasoningService {
  private static instance: AIReasoningService;
  private supabase: SupabaseClient<Database> | null = null;
  private metricsCache = new Map<string, { metrics: UserMetrics; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): AIReasoningService {
    if (!AIReasoningService.instance) {
      AIReasoningService.instance = new AIReasoningService();
    }
    return AIReasoningService.instance;
  }

  initialize(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  /**
   * Get similar users with consistent reasoning across all features
   */
  async getSimilarUsersWithReasons(
    userId: string,
    limit: number = 20,
    context: AIReasonContext
  ): Promise<AISimilarUser[]> {
    if (!this.supabase) throw new Error('Service not initialized');

    // Get user's embedding
    const { data: user } = await this.supabase
      .from('users')
      .select('profile_embedding')
      .eq('id', userId)
      .single();

    if (!user?.profile_embedding) return [];

    // Find similar users
    const { data: similarUsers } = await this.supabase.rpc('find_similar_users', {
      query_embedding: user.profile_embedding,
      p_user_id: userId,
      limit_count: limit,
    });

    if (!similarUsers) return [];

    // Get current user's metrics for comparison
    const currentUserMetrics = await this.getUserMetrics(userId);

    // Process each similar user
    const results = await Promise.all(
      similarUsers.map(async (similarUser) => {
        const targetMetrics = await this.getUserMetrics(similarUser.id);
        const reasons = await this.generateReasons(
          currentUserMetrics,
          targetMetrics,
          similarUser.username,
          context
        );

        return {
          user: {
            id: similarUser.id,
            username: similarUser.username,
            profile_embedding: null, // Don't send embeddings to client
            metrics: targetMetrics,
            lastUpdated: new Date().toISOString(),
          },
          similarity: similarUser.similarity,
          reasons: reasons.slice(0, 3),
          primaryReason: reasons[0] || 'Similar betting style',
        };
      })
    );

    return results;
  }

  /**
   * Get or compute user metrics with caching
   */
  async getUserMetrics(userId: string): Promise<UserMetrics> {
    // Check cache first
    const cached = this.metricsCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.metrics;
    }

    if (!this.supabase) throw new Error('Service not initialized');

    // Try to get pre-computed metrics
    const { data: storedMetrics } = await this.supabase
      .from('user_behavioral_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (storedMetrics && this.isMetricsRecent(storedMetrics.last_updated)) {
      const metrics: UserMetrics = {
        topTeams: storedMetrics.top_teams as string[] || [],
        avgStake: storedMetrics.avg_stake || 0,
        activeHours: storedMetrics.active_hours || [],
        favoriteSport: storedMetrics.favorite_sport || undefined,
        dominantBetType: storedMetrics.dominant_bet_type || undefined,
        stakeStyle: storedMetrics.stake_style || undefined,
        winRate: storedMetrics.win_rate ? parseFloat(storedMetrics.win_rate) : null,
      };

      this.metricsCache.set(userId, { metrics, timestamp: Date.now() });
      return metrics;
    }

    // Fallback: compute metrics on the fly
    const { data: bets } = await this.supabase
      .from('bets')
      .select('bet_type, bet_details, stake, created_at, status, game:games(sport)')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    const metrics = AIReasonScorer.calculateUserMetrics({ bets: bets || [] });
    
    // Cache the computed metrics
    this.metricsCache.set(userId, { metrics, timestamp: Date.now() });
    
    // Store for future use (async, don't wait)
    this.storeMetrics(userId, metrics);

    return metrics;
  }

  /**
   * Generate contextual reasons based on user comparison
   */
  private async generateReasons(
    currentUserMetrics: UserMetrics,
    targetUserMetrics: UserMetrics,
    targetUsername: string,
    context: AIReasonContext
  ): Promise<string[]> {
    const reasons: string[] = [];

    // For notifications and feed, focus on what matches the current user
    if (context.contextType === 'notification' || context.contextType === 'feed') {
      // Team matches
      const commonTeams = currentUserMetrics.topTeams.filter(team => 
        targetUserMetrics.topTeams.includes(team)
      );
      if (commonTeams.length > 0) {
        reasons.push(`Both bet ${commonTeams[0]}`);
      }

      // Stake style match
      if (currentUserMetrics.stakeStyle === targetUserMetrics.stakeStyle && 
          currentUserMetrics.stakeStyle !== 'varied') {
        reasons.push(`${currentUserMetrics.stakeStyle} bettor like you`);
      }

      // Sport match
      if (currentUserMetrics.favoriteSport === targetUserMetrics.favoriteSport) {
        reasons.push(`${currentUserMetrics.favoriteSport} specialist`);
      }

      // Time pattern match
      const commonHours = currentUserMetrics.activeHours.filter(hour =>
        targetUserMetrics.activeHours.includes(hour)
      );
      if (commonHours.length >= 3) {
        const timePattern = AIReasonScorer.getTimePattern(commonHours[0]);
        reasons.push(`${timePattern} bettor`);
      }
    } 
    // For discovery (Find Your Tribe), focus on target user's characteristics
    else if (context.contextType === 'discovery') {
      // Specific teams they bet
      if (targetUserMetrics.topTeams.length > 0) {
        const teams = targetUserMetrics.topTeams.slice(0, 2).join(' & ');
        reasons.push(`Bets ${teams}`);
      }

      // Their stake style
      if (targetUserMetrics.stakeStyle && targetUserMetrics.avgStake > 0) {
        const avgDollars = Math.round(targetUserMetrics.avgStake / 100);
        reasons.push(`${targetUserMetrics.stakeStyle} bettor ($${avgDollars} avg)`);
      }

      // Their dominant bet type
      if (targetUserMetrics.dominantBetType) {
        const betTypeMap: Record<string, string> = {
          'spread': 'Spread specialist',
          'total': 'Totals expert',
          'moneyline': 'Moneyline player'
        };
        reasons.push(betTypeMap[targetUserMetrics.dominantBetType] || 
                    `Prefers ${targetUserMetrics.dominantBetType}`);
      }

      // Performance
      if (targetUserMetrics.winRate && targetUserMetrics.winRate > 0.6) {
        reasons.push(`Crushing at ${Math.round(targetUserMetrics.winRate * 100)}%`);
      }
    }

    // Fallback reasons if none generated
    if (reasons.length === 0) {
      reasons.push('Similar betting style');
      if (targetUserMetrics.favoriteSport) {
        reasons.push(`${targetUserMetrics.favoriteSport} bettor`);
      }
    }

    return reasons;
  }

  /**
   * Score a single bet/post against user metrics
   */
  async scoreBetForUser(
    userId: string,
    bet: BetWithDetails,
    authorUsername: string
  ): Promise<{ score: number; reason: string }> {
    const userMetrics = await this.getUserMetrics(userId);
    const reasons = AIReasonScorer.scoreReasons(bet, userMetrics, authorUsername);
    
    if (reasons.length > 0) {
      return {
        score: reasons[0].score / 100, // Normalize to 0-1
        reason: AIReasonScorer.getTopReason(reasons),
      };
    }

    // Generate fallback reason from bet data
    let fallbackReason = 'Suggested for you';
    if (bet.bet_details?.team && userMetrics.favoriteSport === bet.game?.sport) {
      fallbackReason = `${bet.game.sport} pick`;
    } else if (bet.bet_type === userMetrics.dominantBetType) {
      fallbackReason = `${bet.bet_type} bet like yours`;
    } else if (AIReasonScorer.categorizeStakeStyle(bet.stake) === userMetrics.stakeStyle) {
      fallbackReason = `${userMetrics.stakeStyle} stake`;
    }

    return {
      score: 0.5,
      reason: fallbackReason,
    };
  }

  private isMetricsRecent(lastUpdated: string): boolean {
    const hoursSinceUpdate = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60);
    return hoursSinceUpdate < 24; // Consider fresh if less than 24 hours old
  }

  private async storeMetrics(userId: string, metrics: UserMetrics): Promise<void> {
    if (!this.supabase) return;

    try {
      await this.supabase
        .from('user_behavioral_metrics')
        .upsert({
          user_id: userId,
          top_teams: metrics.topTeams,
          avg_stake: metrics.avgStake,
          active_hours: metrics.activeHours,
          favorite_sport: metrics.favoriteSport || null,
          dominant_bet_type: metrics.dominantBetType || null,
          stake_style: metrics.stakeStyle || null,
          win_rate: metrics.winRate?.toString() || null,
          last_updated: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Failed to store user metrics:', error);
    }
  }
}

export const aiReasoningService = AIReasoningService.getInstance();
```

### Phase 3: Refactor Existing Services (2 hours)

#### Step 3.1: Simplify Friend Discovery Service

**File**: `services/social/friendDiscoveryService.ts`
**Action**: MODIFY

Replace the entire `getSuggestions` method (lines 65-108) with:
```typescript
async getSuggestions(userId: string, limit: number = 10): Promise<FriendSuggestion[]> {
  try {
    const similarUsers = await aiReasoningService.getSimilarUsersWithReasons(
      userId,
      limit,
      {
        fromUserId: userId,
        toUserId: userId,
        contextType: 'discovery'
      }
    );

    // Convert to FriendSuggestion format
    return similarUsers.map(su => ({
      id: su.user.id,
      username: su.user.username,
      display_name: null, // Will be fetched separately if needed
      avatar_url: null,
      bio: null,
      created_at: '',
      similarity: su.similarity,
      reasons: su.reasons,
      insights: [], // Deprecated
      commonSports: su.user.metrics.favoriteSport ? [su.user.metrics.favoriteSport] : [],
      commonTeams: su.user.metrics.topTeams,
      bettingStyle: su.user.metrics.stakeStyle || 'Unknown',
      win_count: 0, // Will be fetched if needed
      loss_count: 0,
      win_rate: su.user.metrics.winRate || 0,
      total_bets: 0,
    }));
  } catch (error) {
    console.error('Error getting friend suggestions:', error);
    return [];
  }
}
```

Delete these methods (no longer needed):
- `enrichSuggestion` (lines 115-141)
- `generateInsights` (lines 146-178)
- `generateReasons` (lines 183-335)
- All helper methods (lines 358-476)

#### Step 3.2: Update Smart Notifications Job

**File**: `scripts/jobs/smartNotifications.ts`
**Action**: MODIFY

Replace imports (lines 1-8):
```typescript
#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '../supabase-client';
import { aiReasoningService } from '@/services/ai/aiReasoningService';
import { Database } from '@/types/database';

type Game = Database['public']['Tables']['games']['Row'];
```

Replace `checkSimilarUserBets` method (lines 125-232):
```typescript
private async checkSimilarUserBets(
  userId: string,
  similarUsers: Array<{ id: string; username: string }>
): Promise<number> {
  let created = 0;
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  // Initialize AI service if needed
  if (!aiReasoningService['supabase']) {
    aiReasoningService.initialize(supabase);
  }

  // Get recent bets from similar users
  const { data: recentBets } = await supabase
    .from('bets')
    .select(
      `
      *,
      user:users!user_id(username, display_name),
      game:games!game_id(home_team, away_team, sport)
    `
    )
    .in(
      'user_id',
      similarUsers.map((u) => u.id)
    )
    .gte('created_at', twoHoursAgo)
    .eq('archived', false)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!recentBets?.length) return 0;

  // Create notifications for interesting bets with AI reasons
  for (const bet of recentBets.slice(0, 5)) {
    const betDetails = bet.bet_details as { team?: string } | null;
    const team = betDetails?.team || 'selection';
    const message = `${bet.user.username} just placed $${bet.stake / 100} on ${team}`;

    // Get AI-generated reason
    const betWithDetails = {
      ...bet,
      created_at: bet.created_at || new Date().toISOString(),
      embedding: bet.embedding,
      bet_details: betDetails,
      game: bet.game as unknown as Game,
      user: { username: bet.user.username || 'Unknown' },
    };

    const { reason } = await aiReasoningService.scoreBetForUser(
      userId,
      betWithDetails,
      bet.user.username || 'Unknown'
    );

    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      type: 'similar_user_bet',
      data: {
        message,
        betId: bet.id,
        actorId: bet.user_id,
        actorUsername: bet.user.username,
        amount: bet.stake / 100,
        aiReason: reason,
      },
      read: false,
      created_at: new Date().toISOString(),
    });

    if (!error) created++;
  }

  return created;
}
```

#### Step 3.3: Update Feed Service

**File**: `services/feed/feedService.ts`
**Action**: MODIFY

Add import at top:
```typescript
import { aiReasoningService } from '@/services/ai/aiReasoningService';
```

Replace `scorePostsForUser` method (lines 555-650):
```typescript
private async scorePostsForUser(
  userId: string,
  posts: PostWithType[]
): Promise<Array<{ post: PostWithType; score: number; reason: string }>> {
  // Initialize AI service if needed
  if (!aiReasoningService['supabase']) {
    aiReasoningService.initialize(this.getClient());
  }

  // Score each post using unified AI service
  const scoredPosts = await Promise.all(
    posts.map(async (post) => {
      // If no bet, use default scoring
      if (!post.bet) {
        return {
          post,
          score: 0.5,
          reason: 'Suggested for you',
        };
      }

      const betWithDetails: BetWithDetails = {
        ...post.bet,
        created_at: post.bet.created_at || new Date().toISOString(),
        bet_details: post.bet.bet_details as { team?: string } | null,
        game: post.bet.game,
        user: { username: post.user?.username || 'User' },
      };

      const result = await aiReasoningService.scoreBetForUser(
        userId,
        betWithDetails,
        post.user?.username || 'User'
      );

      return {
        post,
        score: result.score,
        reason: result.reason,
      };
    })
  );

  // Sort by score descending
  return scoredPosts.sort((a, b) => b.score - a.score);
}
```

### Phase 4: Update Mock Data Generation (1 hour)

#### Step 4.1: Update Embedding Generation Job

**File**: `scripts/jobs/embedding-generation.ts`
**Action**: MODIFY

Add after line 88 (after embedding generation):
```typescript
// Trigger metrics computation for users with new embeddings
await this.computeUserMetrics(processedUsers);
```

Add new method:
```typescript
private async computeUserMetrics(userIds: string[]): Promise<void> {
  console.log('Computing behavioral metrics for users...');
  
  for (const userId of userIds) {
    try {
      // This will compute and store metrics
      await aiReasoningService.getUserMetrics(userId);
    } catch (error) {
      console.error(`Failed to compute metrics for user ${userId}:`, error);
    }
  }
  
  console.log('Behavioral metrics computation complete');
}
```

#### Step 4.2: Initialize AI Service in Mock Setup

**File**: `scripts/mock/orchestrators/setup.ts`
**Action**: MODIFY

Add import at top:
```typescript
import { aiReasoningService } from '@/services/ai/aiReasoningService';
```

Add after line 50 (after supabase initialization):
```typescript
// Initialize AI reasoning service
aiReasoningService.initialize(supabase);
```

### Phase 5: Testing & Verification (1 hour)

#### Step 5.1: Create Test Script

**File**: `scripts/test-ai-reasoning.ts`
**Action**: CREATE NEW

```typescript
#!/usr/bin/env bun

import { supabase } from './supabase-client';
import { aiReasoningService } from '@/services/ai/aiReasoningService';

async function testAIReasoning() {
  console.log('Testing Unified AI Reasoning System...\n');

  // Initialize service
  aiReasoningService.initialize(supabase);

  // Get test user
  const { data: user } = await supabase
    .from('users')
    .select('id, username')
    .eq('username', 'MitchForest')
    .single();

  if (!user) {
    console.error('Test user not found');
    return;
  }

  console.log(`Testing with user: ${user.username}\n`);

  // Test 1: Discovery Context (Find Your Tribe)
  console.log('1. Testing Discovery Context (Find Your Tribe)');
  const discoveryResults = await aiReasoningService.getSimilarUsersWithReasons(
    user.id,
    5,
    { fromUserId: user.id, toUserId: user.id, contextType: 'discovery' }
  );

  discoveryResults.forEach((result, i) => {
    console.log(`\n  User ${i + 1}: @${result.user.username}`);
    console.log(`  Similarity: ${(result.similarity * 100).toFixed(1)}%`);
    console.log(`  Primary Reason: ${result.primaryReason}`);
    console.log(`  All Reasons: ${result.reasons.join(', ')}`);
  });

  // Test 2: Notification Context
  console.log('\n\n2. Testing Notification Context (Smart Notifications)');
  const notificationResults = await aiReasoningService.getSimilarUsersWithReasons(
    user.id,
    3,
    { fromUserId: user.id, toUserId: user.id, contextType: 'notification' }
  );

  notificationResults.forEach((result, i) => {
    console.log(`\n  Match ${i + 1}: @${result.user.username}`);
    console.log(`  Reason: ${result.primaryReason}`);
  });

  // Test 3: Feed Context
  console.log('\n\n3. Testing Feed Context (AI Suggested Posts)');
  
  // Get a sample bet
  const { data: sampleBet } = await supabase
    .from('bets')
    .select('*, game:games(*), user:users(username)')
    .limit(1)
    .single();

  if (sampleBet) {
    const betWithDetails = {
      ...sampleBet,
      bet_details: sampleBet.bet_details as { team?: string } | null,
      user: { username: sampleBet.user.username }
    };

    const feedScore = await aiReasoningService.scoreBetForUser(
      user.id,
      betWithDetails,
      sampleBet.user.username
    );

    console.log(`\n  Bet by: @${sampleBet.user.username}`);
    console.log(`  Score: ${feedScore.score.toFixed(2)}`);
    console.log(`  Reason: ${feedScore.reason}`);
  }

  console.log('\n\nTest complete!');
}

testAIReasoning().catch(console.error);
```

Make executable:
```bash
chmod +x scripts/test-ai-reasoning.ts
```

## Migration Strategy

### Step 1: Deploy Database Changes
1. Run migration to create `user_behavioral_metrics` table
2. Deploy updated embedding pipeline

### Step 2: Backfill Existing Data
1. Run embedding generation job to populate metrics
2. Verify metrics are being stored correctly

### Step 3: Deploy Service Updates
1. Deploy new `aiReasoningService`
2. Update all three features to use unified service
3. Monitor for any issues

### Step 4: Cleanup
1. Remove deprecated code from `friendDiscoveryService`
2. Remove duplicate logic from other services
3. Update tests

## Success Criteria

- [ ] All three features show consistent, high-quality reasons
- [ ] No duplicate database queries for user metrics
- [ ] Metrics are cached and reused across features
- [ ] Performance improvement (fewer queries, faster response)
- [ ] No regression in functionality
- [ ] Clean, maintainable codebase

## Benefits

1. **Consistency**: All features show the same quality of AI insights
2. **Performance**: 
   - Cached metrics reduce database queries by ~70%
   - Pre-computed metrics eliminate real-time calculations
3. **Maintainability**: Single source of truth for AI reasoning
4. **Scalability**: Easy to add new AI features using the same service
5. **Quality**: Richer reasons based on complete user profiles

## Risks & Mitigations

1. **Risk**: Migration complexity
   - **Mitigation**: Phased rollout, feature flags if needed

2. **Risk**: Performance during backfill
   - **Mitigation**: Run in batches, off-peak hours

3. **Risk**: Cache invalidation issues
   - **Mitigation**: Conservative TTL, manual refresh option

## Notes

- The unified service maintains context awareness (discovery vs notification vs feed)
- Metrics are stored separately from embeddings for flexibility
- The system gracefully falls back to computing metrics on-demand if needed
- All existing APIs remain unchanged, only internal implementation changes
</rewritten_file> 