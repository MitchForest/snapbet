# Sprint 8.07: Comprehensive Demo & Polish

**Status**: NOT STARTED  
**Estimated Duration**: 2-3 hours  
**Dependencies**: Sprints 8.05-8.06 completed  
**Primary Goal**: Create polished demo with all AI features integrated into existing UI

## Sprint Overview

This final sprint creates a comprehensive demo showcasing AI integration:
1. All AI features appear IN existing UI (not separate sections)
2. Visual indicators (AIBadge) clearly mark AI-powered content
3. Two-phase mock data creates rich behavioral patterns
4. Enhanced orchestrator demonstrates all features

**KEY DEMO POINTS**:
- Find Your Tribe appears in Search tab with existing discovery sections
- AI posts appear naturally in the main feed (30%)
- AI notifications appear in regular notification list
- All AI content has subtle visual indicators
- NO separate AI screens or sections

## Detailed Implementation Steps

### Part 1: Enhance Mock Orchestrator for RAG Demo (1.5 hours)

#### Step 1.1: Update Unified Setup Orchestrator

**File**: Update `scripts/mock/orchestrators/unified-setup.ts`

Enhance the existing orchestrator to showcase all RAG features:

```typescript
// Add to existing unified-setup.ts
import { execSync } from 'child_process';
import { 
  generateMockUsers,
  generateMockGames,
  generateMockPosts,
  generateMockBets,
  generateMockMessages,
  generateMockNotifications,
  generateMockFollowers,
  generateMockReactions,
  generateMockComments
} from '../generators';
import { createBehavioralPatterns } from './behavioral-patterns';

// Enhanced setup with RAG features
export async function setupWithRAGFeatures(options: SetupOptions) {
  console.log(`🚀 Setting up SnapBet with RAG features for user: ${options.username}`);
  console.log('This will create rich behavioral patterns for AI discovery\n');
  
  try {
    // Verify target user exists
    const { data: targetUser, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', targetUsername)
      .single();
      
    if (error || !targetUser) {
      console.error(`Error: User ${targetUsername} not found. Please sign up first.`);
      process.exit(1);
    }
    
    const targetUserId = targetUser.id;
    
    // PHASE 1: Historical Behavioral Content (will be archived)
    console.log('\n📅 PHASE 1: Creating historical behavioral patterns...');
    console.log('This creates rich user histories that AI will learn from\n');
    
    // 1.1: Create mock users with behavioral diversity
    console.log('Creating 30 diverse mock users...');
    const mockUsers = await generateMockUsers({ 
      count: 30,
      includeBehavioralMetadata: true 
    });
    
    // 1.2: Create historical games (2 weeks old)
    console.log('Creating historical games...');
    const historicalGames = await createMockGames({ 
      weeksAgo: 2,
      count: 50, // More games for richer patterns
      sports: ['NBA', 'NFL', 'MLB']
    });
    
    // 1.3: Create BEHAVIORAL betting patterns
    console.log('Creating rich betting histories with natural patterns...');
    await generateMockBets({
      users: mockUsers,
      games: historicalGames,
      includeBehavioralPatterns: true,
      patterns: [
        { type: 'team_loyalty', teams: ['Lakers', 'Warriors'], users: 5 },
        { type: 'bet_type_preference', betTypes: ['total'], selection: 'under', users: 5 },
        { type: 'time_based', timeSlots: [19, 20, 21], users: 5 }, // Primetime
        { type: 'high_stakes', minBet: 150, users: 5 },
        { type: 'weekend_only', days: [0, 6], users: 5 }
      ]
    });
    
    // 1.4: Create social graphs based on behavior
    console.log('Creating behavioral follow patterns...');
    await createBehavioralFollowGraph(mockUsers);
    
    // 1.5: Create posts that reflect betting behavior
    console.log('Creating posts that match user behavior...');
    await createBehavioralPosts({
      users: mockUsers,
      count: 300, // More posts for better patterns
      dateRange: { start: -14, end: -7 }
    });
    
    // 1.6: Create engagement patterns
    console.log('Creating reactions and tails based on similarity...');
    await createBehavioralEngagement({
      users: mockUsers,
      // Users with similar betting patterns engage with each other more
    });
    
    // 1.7: Run archival process
    console.log('\n🗄️  Archiving old content...');
    execSync('bun run scripts/jobs/content-expiration.ts', { stdio: 'inherit' });
    
    // 1.8: Generate BEHAVIORAL embeddings for archived content
    console.log('\n🧠 Generating behavioral AI embeddings...');
    console.log('AI learns from actual user actions, not stated preferences');
    
    // Run embedding generation for all content types
    console.log('- Generating embeddings for users, posts, and bets...');
    execSync('bun run scripts/jobs/embedding-generation.ts --type=all --force', { 
      stdio: 'inherit' 
    });
    
    // PHASE 2: Fresh Active Content
    console.log('\n🌟 PHASE 2: Creating fresh active content...');
    console.log('This is what users will see in the app\n');
    
    // 2.1: Create current week games
    console.log('Creating this week\'s games...');
    const currentGames = await createMockGames({ 
      weeksAgo: 0,
      count: 15,
      includeInProgress: true 
    });
    
    // 2.2: Create fresh bets (with consensus opportunities)
    console.log('Creating current betting activity...');
    const freshBets = await createMockBets({
      users: mockUsers,
      games: currentGames,
      count: 100,
      dateRange: { start: -2, end: 0 }, // Last 2 days
      includeConsensus: true // Creates groups betting same things
    });
    
    // 2.3: Create fresh posts
    console.log('Creating fresh social content...');
    await createMockPosts({
      users: mockUsers,
      count: 80,
      types: ['post', 'pick', 'outcome'],
      dateRange: { start: -1, end: 0 }, // Last 24 hours
      includeStories: true
    });
    
    // 2.4: Create discovery content
    console.log('Creating AI discovery content...');
    await createDiscoveryContent({
      targetUserId,
      mockUsers
    });
    
    // 2.5: Create messages and group chats
    console.log('Creating messages and group chats...');
    await createMockMessages({
      users: [...mockUsers, { id: targetUserId }],
      dmCount: 20,
      groupCount: 5,
      includePickShares: true
    });
    
    // 2.6: Create reactions and comments
    console.log('Creating social engagement...');
    await createMockReactions({ count: 300 });
    await createMockComments({ count: 150 });
    
    // 2.7: Calculate current badges
    console.log('Calculating weekly badges...');
    execSync('bun run scripts/jobs/calculate-badges.ts', { stdio: 'inherit' });
    
    // 2.8: Create notifications (including consensus alerts)
    console.log('Creating notifications...');
    await createMockNotifications({
      userId: targetUserId,
      includeConsensus: true,
      count: 15
    });
    
    // 2.9: Run smart notification job for fresh data
    console.log('Running smart notification generation...');
    execSync('bun run scripts/jobs/smart-notifications.ts', { stdio: 'inherit' });
    
    // PHASE 3: Verify Behavioral AI Features
    console.log('\n✅ PHASE 3: Verifying behavioral AI features...');
    
    const verification = await verifyBehavioralAI(targetUserId);
    
    console.log('\n📊 Behavioral AI Summary:');
    console.log(`✓ Users with behavioral embeddings: ${verification.profileEmbeddings}`);
    console.log(`✓ Average bets per user: ${verification.avgBetsPerUser}`);
    console.log(`✓ Behavioral clusters detected: ${verification.behavioralClusters}`);
    console.log(`✓ Similar users by behavior: ${verification.similarUsers}`);
    console.log(`✓ Discovery content from similar users: ${verification.discoveryPosts}`);
    console.log(`✓ Behavioral consensus patterns: ${verification.consensusPatterns}`);
    
    console.log('\n🎉 Behavioral mock data setup complete!');
    console.log('\n🚀 What the AI learned from user behavior:');
    console.log('1. Find Your Tribe → Shows users with similar betting patterns');
    console.log('2. Enhanced Feed → 30% content from behaviorally similar users');
    console.log('3. Smart Notifications → Alerts about bets from similar users');
    console.log('4. Consensus Alerts → When similar users make the same bet');
    console.log('5. Discovery reasons → Based on actual behavior, not keywords');
    
    console.log(`\n✨ The AI has learned from behavioral patterns.`);
    console.log(`Login as @${targetUsername} to see personalized AI features!`);
    
  } catch (error) {
    console.error('\n❌ Error setting up mock data:', error);
    process.exit(1);
  }
}

async function createFollowRelationships(targetUserId: string, mockUsers: any[]) {
  // Target user follows 15 mock users
  const followCount = 15;
  const usersToFollow = mockUsers.slice(0, followCount);
  
  for (const user of usersToFollow) {
    await supabase.from('followers').insert({
      follower_id: targetUserId,
      following_id: user.id
    });
  }
  
  // Some mock users follow each other (for consensus)
  // Create clusters of users who follow each other
  const clusters = [
    mockUsers.slice(0, 5),   // Lakers fans cluster
    mockUsers.slice(5, 10),  // NFL degens cluster
    mockUsers.slice(10, 15), // Sharp bettors cluster
  ];
  
  for (const cluster of clusters) {
    for (let i = 0; i < cluster.length; i++) {
      for (let j = i + 1; j < cluster.length; j++) {
        // Mutual follows within cluster
        await supabase.from('followers').insert([
          { follower_id: cluster[i].id, following_id: cluster[j].id },
          { follower_id: cluster[j].id, following_id: cluster[i].id }
        ]);
      }
    }
  }
}

async function verifyBehavioralAI(userId: string) {
  // Count behavioral embeddings
  const { count: profileEmbeddings } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .not('profile_embedding', 'is', null);
    
  // Calculate average bets per user (shows behavioral richness)
  const { data: betCounts } = await supabase
    .from('users')
    .select(`
      id,
      bets(count)
    `)
    .like('username', 'mock_%');
    
  const totalBets = betCounts?.reduce((sum, u) => sum + (u.bets?.[0]?.count || 0), 0) || 0;
  const avgBetsPerUser = Math.round(totalBets / (betCounts?.length || 1));
    
  // Test behavioral similarity
  const { data: similarUsers } = await supabase
    .rpc('find_similar_users', {
      query_user_id: userId,
      match_threshold: 0.7,
      limit_count: 10
    });
    
  // Detect behavioral clusters
  const clusters = await detectBehavioralClusters(similarUsers || []);
    
  // Test discovery from similar users
  const { data: similarUserIds } = await supabase
    .rpc('find_similar_users', {
      query_user_id: userId,
      match_threshold: 0.65,
      limit_count: 20
    });
    
  const { count: discoveryPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .in('user_id', similarUserIds?.map(u => u.id) || [])
    .eq('archived', false);
    
  // Count behavioral consensus patterns
  const { data: recentBets } = await supabase
    .from('bets')
    .select('game_id, bet_type, bet_details')
    .gte('created_at', new Date(Date.now() - 3600000).toISOString())
    .eq('archived', false);
    
  const consensusPatterns = findConsensusPatterns(recentBets || []);
    
  return {
    profileEmbeddings: profileEmbeddings || 0,
    avgBetsPerUser,
    behavioralClusters: clusters.length,
    similarUsers: similarUsers?.length || 0,
    discoveryPosts: discoveryPosts || 0,
    consensusPatterns: consensusPatterns.length
  };
}

async function detectBehavioralClusters(users: any[]): Promise<any[]> {
  // Simple clustering based on similarity scores
  const clusters: any[] = [];
  const threshold = 0.8;
  
  users.forEach(user => {
    if (user.similarity_score > threshold) {
      // Find or create cluster
      let added = false;
      for (const cluster of clusters) {
        if (cluster.some(u => u.similarity_score > threshold)) {
          cluster.push(user);
          added = true;
          break;
        }
      }
      if (!added) {
        clusters.push([user]);
      }
    }
  });
  
  return clusters;
}

function findConsensusPatterns(bets: any[]): any[] {
  const patterns = new Map<string, number>();
  
  bets.forEach(bet => {
    const key = `${bet.game_id}-${bet.bet_type}-${bet.bet_details?.team || ''}`;
    patterns.set(key, (patterns.get(key) || 0) + 1);
  });
  
  return Array.from(patterns.entries())
    .filter(([_, count]) => count >= 3)
    .map(([pattern, count]) => ({ pattern, count }));
}

// Export enhanced setup function
export { setupWithRAGFeatures };
```

#### Step 1.2: Create Behavioral Pattern Helper

**File**: Create `scripts/mock/orchestrators/behavioral-patterns.ts`

```typescript
import { supabase } from '@/scripts/supabase-client';

export async function createBehavioralPatterns(users: any[]) {
  console.log('Creating natural behavioral clusters...');
  
  // Define behavioral archetypes
  const archetypes = [
    {
      name: 'NBA_UNDERS',
      filter: (username: string) => username.includes('sharp') || username.includes('analyst'),
      behavior: {
        sports: ['NBA'],
        betTypes: ['total'],
        preferences: { selection: 'under' },
        timing: 'evening'
      }
    },
    {
      name: 'NFL_WEEKEND',
      filter: (username: string) => username.includes('weekend') || username.includes('sunday'),
      behavior: {
        sports: ['NFL'],
        betTypes: ['spread', 'moneyline'],
        timing: 'weekend',
        stakes: 'high'
      }
    },
    {
      name: 'LATE_NIGHT',
      filter: (username: string) => username.includes('degen') || username.includes('late'),
      behavior: {
        timing: 'late_night',
        postFrequency: 'high',
        betFrequency: 'high'
      }
    }
  ];
  
  // Apply behaviors naturally through actions
  for (const archetype of archetypes) {
    const matchingUsers = users.filter(u => archetype.filter(u.username));
    console.log(`- Creating ${archetype.name} pattern for ${matchingUsers.length} users`);
    
    // Behaviors will emerge from their betting and posting patterns
    // No need to store preferences - AI will discover them!
  }
}
```

### Part 2: Performance Optimization (1 hour)

#### Step 2.1: Add Database Indexes

**File**: Create new migration `supabase/migrations/036_rag_performance_indexes.sql`

**Note**: Using 036 since 034 and 035 already exist

```sql
-- Performance indexes for RAG features
-- These were deferred from Sprint 8.03

-- Archive filtering indexes
CREATE INDEX idx_posts_archived_created ON posts(archived, created_at DESC) 
WHERE archived = false AND deleted_at IS NULL;

CREATE INDEX idx_bets_archived_created ON bets(archived, created_at DESC)
WHERE archived = false AND deleted_at IS NULL;

CREATE INDEX idx_stories_archived_created ON stories(archived, created_at DESC)
WHERE archived = false AND deleted_at IS NULL;

-- Embedding search optimization
-- Already created in Sprint 8.01 but verify they exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_embedding') THEN
    CREATE INDEX idx_users_embedding ON users USING ivfflat (profile_embedding vector_cosine_ops) WITH (lists = 100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_embedding') THEN
    CREATE INDEX idx_posts_embedding ON posts USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bets_embedding') THEN
    CREATE INDEX idx_bets_embedding ON bets USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
  END IF;
END $$;

-- Consensus detection optimization
CREATE INDEX idx_bets_consensus ON bets(bet_type, created_at DESC)
WHERE archived = false AND status = 'pending';

-- Feed optimization
CREATE INDEX idx_posts_user_archived ON posts(user_id, archived, created_at DESC)
WHERE archived = false AND deleted_at IS NULL;

-- Notification lookup
CREATE INDEX idx_notifications_user_type ON notifications(user_id, type, created_at DESC);

-- Analytics for performance monitoring
CREATE TABLE IF NOT EXISTS rag_performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type TEXT NOT NULL, -- 'feed_load', 'discovery_query', 'consensus_check'
  duration_ms INTEGER NOT NULL,
  user_id UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to log performance
CREATE OR REPLACE FUNCTION log_rag_performance(
  p_metric_type TEXT,
  p_duration_ms INTEGER,
  p_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO rag_performance_metrics (metric_type, duration_ms, user_id, metadata)
  VALUES (p_metric_type, p_duration_ms, p_user_id, p_metadata);
END;
$$ LANGUAGE plpgsql;
```

#### Step 2.2: Optimize Smart Feed Service

**File**: Update `services/rag/smartFeedService.ts`

Add caching and performance monitoring:

```typescript
// Add at top of SmartFeedService class
private feedCache = new Map<string, { data: FeedPost[], timestamp: number }>();
private CACHE_TTL = 60000; // 1 minute

async getHybridFeed(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<FeedPost[]> {
  const startTime = Date.now();
  
  try {
    // Check cache for offset 0 (first page)
    if (offset === 0) {
      const cached = this.feedCache.get(userId);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data.slice(0, limit);
      }
    }
    
    // ... existing implementation ...
    
    // Cache first page
    if (offset === 0) {
      this.feedCache.set(userId, {
        data: mixedFeed,
        timestamp: Date.now()
      });
    }
    
    // Log performance
    const duration = Date.now() - startTime;
    await supabase.rpc('log_rag_performance', {
      p_metric_type: 'feed_load',
      p_duration_ms: duration,
      p_user_id: userId,
      p_metadata: { limit, offset, cache_hit: false }
    });
    
    return mixedFeed.slice(offset, offset + limit);
  } catch (error) {
    // ... existing error handling ...
  }
}
```

### Part 3: Documentation & Demo Guide (30 minutes)

#### Step 3.1: Update README with RAG Features

**File**: Update `README.md` to include RAG setup

Add section for RAG features:

```markdown
## RAG Features Demo

To see all AI features in action:

```bash
# Run the unified setup with your username
bun run scripts/mock/orchestrators/unified-setup.ts --username=YOUR_USERNAME

# This creates:
# - 30 mock users with behavioral patterns
# - Rich betting history demonstrating preferences
# - Posts and engagement showing natural clusters
# - All embeddings for AI discovery
```

### What You'll See:

1. **Find Your Tribe** - In Search tab, see users with similar betting behavior
2. **Smart Feed** - 30% of posts from behaviorally similar users you don't follow
3. **Smart Notifications** - Alerts when similar users make consensus bets

All features use behavioral AI - no stored preferences!
```

#### Step 3.2: Create Behavioral AI Architecture Doc

**File**: Create `docs/BEHAVIORAL_AI_ARCHITECTURE.md`

```markdown
# SnapBet Behavioral AI Demo Guide

## Overview
This document explains how SnapBet's behavioral AI system works. The AI learns from USER BEHAVIOR, not stored preferences. All user preferences are discovered dynamically from embeddings.

## Key Concept: Behavioral AI
- AI learns from what users DO, not what they SAY they like
- No "favorite teams" or "preferences" - just actions
- Patterns emerge naturally from betting history, social graph, and engagement

## Architecture Overview

### Core Principles
1. **No stored preferences** - removed favorite_teams column
2. **Behavioral embeddings** - 1536-dimensional vectors from user actions
3. **Dynamic discovery** - preferences inferred from embeddings at query time
4. **Integrated UI** - AI features enhance existing screens

## Behavioral AI Features

### 1. Find Your Tribe (AI User Discovery)
**Location**: Search Tab → Integrated with existing discovery sections

**Integration**:
- Uses existing DiscoverySection and UserSearchCard components
- Has "Find Your Tribe" title with AIBadge indicator
- Shows behaviorally similar users

**What You'll See**:
- User cards with match percentage (e.g., "87% match")
- Behavioral reasons: "Both actively bet NBA unders"
- "Similar betting amounts (~$75)"
- "Both bet primarily on primetime games"

**Visual Indicators**:
- Small AIBadge next to section title
- Match percentage on each user card
- Behavioral insights below username

**Try This**:
1. Open Explore tab - Find Your Tribe is at the TOP
2. Each similar user has clear match % and reason
3. Tap to view their profile and see the behavioral similarities

### 2. Enhanced Feed (AI Content Mixed In)
**Location**: Home Feed (your main feed)

**Integration**:
- AI posts appear IN your regular feed (not separate)
- 70% from people you follow, 30% AI-discovered
- Look exactly like regular posts except for small badge

**Visual Indicators**:
- Small DiscoveryBadge in top-right corner of AI posts
- Shows reason like "Similar betting style" or "NBA fan"
- Badge is subtle - doesn't interfere with post content

**What You'll See**:
- Every 3-4 posts, one will have a discovery badge
- Posts from users you DON'T follow but bet like you
- Natural mix - you might not notice unless looking for badges

**Try This**:
1. Scroll your feed slowly
2. Count posts with DiscoveryBadge (should be ~30%)
3. Tap on discovered posts - see why AI suggested them
4. Notice they're from users with similar betting patterns

### 3. Smart Notifications (AI Alerts Mixed In)
**Location**: Notifications Screen (your regular notifications)

**Integration**:
- AI notifications appear IN your regular notification list
- Mixed chronologically with all other notifications
- Look identical except for small AI badge

**Visual Indicators**:
- Small AIBadge next to notification title
- Otherwise identical to regular notifications
- No separate section or filtering

**Types You'll See Mixed In**:
1. **Similar User Bets**: "🎯 Users who bet like you are taking Lakers -5.5" [AI]
2. **Behavioral Consensus**: "🤝 3 similar bettors all took the under" [AI]
3. **Regular Notifications**: "Your bet on Warriors won!" (no badge)

**Try This**:
1. Open Notifications - AI ones are mixed in naturally
2. Look for small AI badges next to some titles
3. They're sorted by time, not separated
4. Tap them like any other notification

### 4. Behavioral Patterns in Mock Data

The AI discovers these patterns from actions:

**Pattern 1: Lakers Under Specialists**
- Users: sarah_sharp, emma_analyst, alex_stats
- AI Discovered: Frequently bet Lakers games + prefer totals
- No "favorite_teams" field needed!

**Pattern 2: Weekend Warriors**
- Users: tyler_weekend, jake_sunday, mike_nfl
- AI Discovered: Bet primarily on Sundays with higher stakes
- Temporal pattern detected from timestamps

**Pattern 3: Late Night Degens**
- Users: chris_degen, ryan_late, david_night
- AI Discovered: Active 10pm-2am, post about late bets
- Behavioral timing pattern

**Pattern 4: Conservative Unders**
- Users: lisa_under, tom_totals, amy_unders
- AI Discovered: 80%+ bets are on totals, specifically unders
- Bet type preference emerged from history

## Testing Behavioral AI

### Experiment 1: Follow Similar Users
1. Go to Find Your Tribe
2. Follow 2-3 high-match users
3. Refresh your feed
4. Notice how discovery content improves

### Experiment 2: Make Similar Bets
1. Check what your behavioral cohort is betting
2. Make a similar bet
3. Watch for consensus notifications
4. See how the AI recognizes patterns

### Experiment 3: Engage with Discovery
1. React to discovered posts
2. Tail bets from similar users
3. Watch your recommendations evolve
4. AI learns from your engagement!

## How Behavioral Embeddings Work

```
User Actions → Behavioral Profile → Embedding → Similarity Search → Discovery
```

### Detailed Algorithm Explanation:

#### 1. Profile Embedding Generation:
```typescript
// What goes into each user's behavioral profile:
const behavioralProfile = `
  BETTING PATTERNS:
  - Teams bet on: [extracted from bet history, e.g., "Lakers 15 times, Warriors 8 times"]
  - Sports distribution: [e.g., "70% NBA, 20% NFL, 10% MLB"]
  - Bet types: [e.g., "60% totals, 30% spreads, 10% moneyline"]
  - Average stake: $75
  - Typical timing: [e.g., "80% evening games, primetime preference"]
  - Win rate: 55%
  
  SOCIAL BEHAVIOR:
  - Follows: [list of who they follow]
  - Engagement: [who they interact with most]
  - Tailing patterns: [who they tail/fade]
  
  CONTENT PATTERNS:
  - Post frequency and timing
  - Caption style examples
  - Reaction patterns
`;

// This text → OpenAI Embedding → 1536-dimensional vector
```

#### 2. Find Your Tribe Algorithm:
```typescript
// Step 1: Get user's embedding
const userEmbedding = await getUserEmbedding(userId);

// Step 2: Vector similarity search (using pgvector)
const similarUsers = await supabase.rpc('find_similar_users', {
  query_embedding: userEmbedding,
  threshold: 0.7  // Cosine similarity threshold
});

// Step 3: AI interprets WHY they're similar
for (const similarUser of similarUsers) {
  const reasons = analyzeCommonPatterns(userData, similarUserData);
  // Returns: "Both bet Lakers games frequently" (discovered, not stored!)
}
```

#### 3. Feed Discovery Algorithm:
```typescript
// Step 1: Find behaviorally similar users
const similarUsers = await findSimilarUsers(userId);

// Step 2: Get their recent posts
const candidatePosts = await getRecentPosts(similarUsers);

// Step 3: Score each post for relevance
for (const post of candidatePosts) {
  let score = baseScore;
  if (userBetsOnSameTeams) score += 0.3;
  if (similarBetTypes) score += 0.2;
  if (similarTimePatterns) score += 0.1;
  // etc...
}

// Step 4: Mix top-scoring posts into feed (30%)
```

#### 4. Smart Notification Algorithm:
```typescript
// Runs every 5 minutes
// Step 1: Get user's behavioral cohort
const behavioralCohort = await findSimilarUsers(userId, limit: 30);

// Step 2: Check their recent activity
const recentBets = await getRecentBets(behavioralCohort);

// Step 3: Detect patterns worth notifying
- Consensus: 3+ similar users bet same thing
- High value: Similar user makes unusual bet
- Trending: Multiple similar users on same game
```

### Key Point: Everything is Discovered
- No stored "favorite_teams" - discovered from bet history
- No "risk_tolerance" - discovered from stake patterns
- No "preferred_sports" - discovered from betting distribution
- AI finds these patterns dynamically from the embedding

## Performance Verification

Check the behavioral richness:
```sql
-- Average bets per user (should be 15+)
SELECT AVG(bet_count) FROM (
  SELECT COUNT(*) as bet_count 
  FROM bets 
  GROUP BY user_id
) counts;

-- Behavioral clusters
SELECT COUNT(DISTINCT user_id) as cluster_size
FROM bets
WHERE bet_type = 'total'
AND bet_details->>'selection' = 'under';
```

## Integration Summary

### Where to Find AI Features:
1. **Explore Tab**: "Find Your Tribe" at the TOP
2. **Home Feed**: AI posts mixed in (look for DiscoveryBadge)
3. **Notifications**: AI alerts mixed in (look for AIBadge)

### Visual Indicators:
- **AIBadge**: Small sparkle icon on AI content
- **Match %**: On similar user cards
- **Discovery reason**: Brief text explaining why

### Key Points:
- **NO separate AI screens** - everything is integrated
- **NO AI-only sections** - AI enhances existing features
- **Subtle indicators** - doesn't overwhelm the UI
- **Natural mixing** - AI content flows with regular content

## Key Takeaways

1. **Seamless Integration**: AI features enhance, not replace
2. **Behavioral Learning**: AI learns from actions, not preferences
3. **Visual Clarity**: Always know what's AI-powered
4. **Natural Discovery**: Find users who ACTUALLY bet like you
5. **Privacy First**: No need to set preferences or expose data

The future of social betting: AI that seamlessly enhances your experience by understanding behavior.

## Performance Metrics

Check the performance of RAG features:
```sql
-- In Supabase SQL editor
SELECT metric_type, AVG(duration_ms) as avg_ms, COUNT(*)
FROM rag_performance_metrics
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY metric_type;
```

Expected performance:
- Feed load: <500ms
- Discovery query: <200ms  
- Consensus check: <100ms

## Troubleshooting

**No AI suggestions in feed?**
- Check you're following at least 5 users
- Ensure embeddings were generated (check logs)

**No similar users showing?**
- Verify your profile has betting history
- Run: `bun run scripts/jobs/embedding-generation.ts --type users`

**No consensus alerts?**
- Create some bets matching mock user bets
- Run: `bun run scripts/jobs/smart-notifications.ts`

## Resetting Demo

To start fresh:
```bash
# Clean existing mock data
bun run scripts/mock/clean-mock-data.ts

# Run unified setup again
bun run scripts/mock/orchestrators/unified-setup.ts --username=YOUR_USERNAME
```
```

#### Step 3.3: Update Epic Tracker

**File**: Update `.pm/epics/epic-8-rag/epic-tracker.md`

Update the sprint statuses and add completion notes:

```markdown
| Sprint # | Sprint Name | Status | Start Date | End Date | Key Deliverable |
|----------|-------------|--------|------------|----------|-----------------|
| 8.01 | Database Infrastructure | COMPLETED | 2024-12-29 | 2024-12-29 | pgvector setup, archive columns, RPC functions |
| 8.02 | Content Archiving | COMPLETED | 2024-12-29 | 2024-12-29 | Modify content-expiration job to archive |
| 8.03 | Archive Filtering | COMPLETED | 2024-12-29 | 2024-12-29 | Update all queries to filter archived content |
| 8.04 | RAG Service Layer | COMPLETED | 2024-12-30 | 2024-12-30 | OpenAI integration and embedding pipeline |
| 8.05 | Infrastructure & Discovery | COMPLETED | [Date] | [Date] | Profile embeddings, Find Your Tribe in Search tab |
| 8.06 | Enhanced Feed & Smart Notifications | COMPLETED | [Date] | [Date] | 70/30 smart feed, behavioral alerts |
| 8.07 | Demo & Polish | COMPLETED | [Date] | [Date] | Enhanced orchestrator, performance optimization |

## Deferred Features
- **AI Caption Generation**: Deferred due to Edge Function infrastructure requirements. UI components created but require server deployment.

## Key Architecture Decisions
- **Removed favorite_teams column**: All preferences discovered from behavioral embeddings
- **Extended existing services**: Enhanced feedService and notificationService rather than creating new ones
- **Integrated UI**: All AI features appear within existing screens with visual indicators
```

### Part 4: Final Testing Checklist

#### Comprehensive Test Plan

1. **Clean Start Test**:
```bash
bun run mock:clean
bun run mock:setup --username:testuser
```

2. **Feature Verification**:
- [ ] Find Your Tribe shows 5+ similar users
- [ ] Each similar user has match % and reasons
- [ ] Feed shows ~70% following, ~30% discovered
- [ ] Discovery badges appear with reasons
- [ ] Consensus alerts in notifications
- [ ] All mock data scenarios visible

3. **Performance Verification**:
```sql
-- Check all indexes created
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('posts', 'bets', 'users')
AND indexname LIKE '%idx_%';

-- Verify embedding counts
SELECT 
  (SELECT COUNT(*) FROM users WHERE profile_embedding IS NOT NULL) as user_embeddings,
  (SELECT COUNT(*) FROM posts WHERE embedding IS NOT NULL) as post_embeddings,
  (SELECT COUNT(*) FROM bets WHERE embedding IS NOT NULL) as bet_embeddings;
```

4. **Production Job Verification**:
```bash
# Test each job works with mock data
bun run scripts/jobs/embedding-generation.ts --type users --limit 5
bun run scripts/jobs/consensus-detection.ts
bun run scripts/jobs/content-expiration.ts
```

## Success Criteria

1. **`bun run mock:setup --username:USERNAME` creates full RAG demo** in <3 minutes
2. **All RAG features visible and functional** in the app
3. **Performance optimizations in place** with <500ms feed loads
4. **Comprehensive documentation** for demo and testing
5. **All production jobs work** with both mock and real data

## Architecture Summary

The RAG implementation follows these principles:
1. **Production-first**: All features use production code paths
2. **Graceful degradation**: Features work without AI or fall back gracefully  
3. **Mock data realism**: Two-phase approach mimics real usage
4. **Performance conscious**: Caching, indexes, and monitoring
5. **Demo ready**: One command sets up everything

## Final Notes

This completes the RAG implementation with:
- **3 major features**: Find Your Tribe, Enhanced Feed, Consensus Alerts
- **Comprehensive mock data**: 30 users, hundreds of posts/bets, realistic scenarios
- **Production infrastructure**: Jobs, indexes, monitoring
- **Full documentation**: Demo guide and troubleshooting

The only deferred feature is real-time AI Caption Generation, which requires Edge Function deployment infrastructure not currently available.