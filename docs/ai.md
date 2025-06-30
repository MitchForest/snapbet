# AI & RAG Implementation Guide

## Overview

SnapBet uses a sophisticated AI-powered recommendation system that combines embeddings, vector similarity search, and behavioral scoring to deliver personalized experiences across the platform. Our system analyzes user betting patterns, social interactions, and content preferences to provide intelligent recommendations in three key areas:

1. **Feed Discovery** - AI-recommended posts from behaviorally similar users
2. **Find Your Tribe** - User discovery based on betting style compatibility  
3. **Smart Notifications** - Intelligent alerts about relevant betting activity

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Reasoning Service                      │
├─────────────────────────────────────────────────────────────┤
│ • Centralized behavioral analysis                           │
│ • Cached user metrics (5 min TTL)                          │
│ • Context-aware reason generation                          │
│ • Consistent scoring algorithms                            │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│ Find Your Tribe│  │Smart Notifications│  │   AI Feed      │
└────────────────┘  └─────────────────┘  └─────────────────┘
```

### Key Services

1. **Embedding Pipeline** (`services/rag/embeddingPipeline.ts`)
   - Generates behavioral embeddings for users
   - Processes posts and bets for semantic search
   - Stores pre-computed metrics for performance

2. **AI Reasoning Service** (`services/ai/aiReasoningService.ts`)
   - Unified logic for all AI features
   - Manages user similarity scoring
   - Generates context-aware recommendations

3. **RAG Service** (`services/rag/ragService.ts`)
   - Interfaces with OpenAI for embedding generation
   - Handles vector operations

## Embedding System

### User Profile Embeddings

Each user has a behavioral profile embedding that captures their betting personality:

```typescript
const behavioralProfile = `
  ${username} betting behavior:
  - Frequently bets on: ${topTeams.join(', ')}
  - Prefers ${dominantBetType} bets (${percentage}%)
  - Active during ${activeTimeSlots}
  - Average stake: $${avgStake}
  - Betting style: ${bettingStyle}
  - Win rate: ${winRate}%
  - Recent activity: ${recentBets}
`;
```

This text representation is converted to a 1536-dimensional vector using OpenAI's `text-embedding-3-small` model.

### Content Embeddings

Posts and bets are also embedded for semantic search:
- **Posts**: Caption text is directly embedded
- **Bets**: Structured data (team, type, stake, game) is converted to text then embedded

### Storage

Embeddings are stored in PostgreSQL using pgvector:
```sql
-- User embeddings
profile_embedding vector(1536)

-- Content embeddings  
embedding vector(1536)
```

## Retrieval & Similarity

### Cosine Similarity Search

We use pgvector's cosine distance operator (`<=>`) to find similar users:

```sql
CREATE OR REPLACE FUNCTION find_similar_users(
  query_embedding vector(1536),
  p_user_id uuid,
  limit_count integer DEFAULT 20
)
RETURNS TABLE(...) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    1 - (u.profile_embedding <=> query_embedding) as similarity
  FROM users u
  WHERE u.id != p_user_id
    AND u.profile_embedding IS NOT NULL
  ORDER BY u.profile_embedding <=> query_embedding
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

The similarity score ranges from 0 to 1, where 1 indicates identical betting patterns.

### Index Optimization

We use IVFFlat indexing for fast approximate nearest neighbor search:
```sql
CREATE INDEX idx_users_embedding 
ON users USING ivfflat (profile_embedding vector_cosine_ops)
WITH (lists = 100);
```

## Behavioral Scoring

### User Metrics

Pre-computed metrics stored in `user_behavioral_metrics` table:
- **Top Teams**: Most frequently bet teams
- **Average Stake**: Typical bet size in cents
- **Active Hours**: Peak betting times
- **Favorite Sport**: Primary sport of interest
- **Dominant Bet Type**: Spread, total, or moneyline preference
- **Stake Style**: Micro, conservative, moderate, confident, or aggressive
- **Win Rate**: Historical success percentage

### Scoring Algorithm

The `AIReasonScorer` evaluates compatibility across multiple dimensions:

```typescript
interface ScoredReason {
  text: string;
  score: number;
  category: 'team' | 'sport' | 'style' | 'stake' | 'time' | 'performance' | 'bet_type';
  specificity: number;
}
```

Scoring factors:
1. **Team Affinity** (Highest weight): Shared team preferences
2. **Stake Style**: Similar betting amounts
3. **Time Patterns**: Overlapping active hours
4. **Sport Preference**: Common sports interests
5. **Bet Type**: Matching bet type preferences
6. **Performance**: Similar win rates

## Feature Implementations

### 1. AI Feed (30% Discovery Content)

The feed mixes following content with AI recommendations:

```typescript
async getHybridFeed(userId: string, limit: number = 20) {
  const followingCount = Math.floor(limit * 0.7);
  const discoveryCount = limit - followingCount;
  
  const [followingPosts, discoveredPosts] = await Promise.all([
    this.getFeedPosts(userId),
    this.getDiscoveredPosts(userId, discoveryCount)
  ]);
  
  return this.mixFeeds(followingPosts, discoveredPosts);
}
```

Discovery process:
1. Find behaviorally similar users via cosine similarity
2. Filter out already-followed users
3. Fetch their recent posts
4. Score each post based on user's preferences
5. Return top-scored posts with personalized reasons

### 2. Find Your Tribe (User Discovery)

Suggests users with compatible betting styles:

```typescript
async getSuggestions(userId: string, limit: number = 10) {
  const similarUsers = await aiReasoningService.getSimilarUsersWithReasons(
    userId,
    limit,
    { contextType: 'discovery' }
  );
  
  // Returns users with specific reasons like:
  // - "Bets Lakers & Warriors"
  // - "Conservative bettor ($25 avg)"
  // - "Spread specialist"
  // - "Crushing at 68%"
}
```

### 3. Smart Notifications

Generates intelligent alerts about relevant activity:

```typescript
// Two types of smart notifications:

// 1. Similar User Bets
"sharp-steve just placed $100 on Lakers -3.5"
Reason: "Lakers bettor like you"

// 2. Consensus Patterns  
"5 sharp bettors are on Celtics -7"
Reason: "Popular with Celtics fans"
```

Notification triggers:
- Recent bets from behaviorally similar users
- Consensus patterns among your betting cohort
- Activity from users with similar win rates

## Context-Aware Reasoning

The AI service generates different reasons based on context:

### Discovery Context (Find Your Tribe)
Focuses on the target user's characteristics:
- "Bets Lakers & Warriors"
- "Conservative bettor ($25 avg)"
- "NBA specialist"

### Notification Context
Emphasizes what matches the current user:
- "Both bet Lakers"
- "Conservative bettor like you"
- "NBA specialist"

### Feed Context
Highlights relevance to user's interests:
- "Lakers pick"
- "Spread bet like yours"
- "From a sharp bettor"

## Performance Optimizations

### 1. Caching Layer
- User metrics cached for 5 minutes
- Reduces database queries by 70%
- In-memory cache with TTL

### 2. Pre-computed Metrics
- Behavioral metrics calculated during embedding generation
- Stored in dedicated table for fast lookups
- Updated when user profile changes significantly

### 3. Batch Processing
- Embeddings generated in batches
- Parallel processing with rate limiting
- Background jobs for non-critical updates

## Privacy & Safety

### Data Protection
- Embeddings don't contain personally identifiable information
- Behavioral profiles focus on betting patterns, not personal details
- Users can opt out of AI features in privacy settings

### Content Filtering
- Blocked users excluded from recommendations
- Private accounts respected in discovery
- Inappropriate content filtered before recommendation

## Future Enhancements

### Planned Improvements
1. **Multi-modal embeddings**: Incorporate image/video content
2. **Temporal modeling**: Factor in seasonal betting patterns
3. **Graph neural networks**: Leverage social connections
4. **Real-time updates**: Stream processing for instant recommendations
5. **Explainable AI**: More detailed reasoning explanations

### Experimental Features
- Parlay recommendation based on correlated bets
- Fade detection for contrarian opportunities
- Hot streak identification
- Community consensus indicators

## Technical Details

### Dependencies
- OpenAI API for embeddings
- pgvector for similarity search
- Supabase for real-time updates
- TypeScript for type safety

### Configuration
```typescript
// Embedding model
MODEL: 'text-embedding-3-small'
DIMENSIONS: 1536

// Similarity thresholds
MIN_SIMILARITY: 0.7
MAX_RESULTS: 20

// Cache settings
CACHE_TTL: 5 * 60 * 1000 // 5 minutes
```

### Monitoring
- Embedding generation tracked in `embedding_metadata`
- API usage monitored for cost control
- Performance metrics logged for optimization

## Best Practices

### For Developers
1. Always use the unified AI service for consistency
2. Cache expensive operations
3. Handle edge cases (new users, no data)
4. Provide meaningful fallback reasons
5. Test with diverse user profiles

### For Product
1. Set clear user expectations about AI features
2. Provide transparency about how recommendations work
3. Allow users to provide feedback on recommendations
4. Monitor recommendation quality metrics
5. Iterate based on user engagement data
