# SnapBet RAG Implementation Plan

## Overview
This document provides a complete, step-by-step implementation of RAG features for SnapBet while maintaining the ephemeral user experience. Instead of deleting data, we archive it and hide from users while keeping it available for AI.

---

## Phase 1: Database Updates (Day 1)

### 1.1 Add Archive Columns
```sql
-- Add archived flag to all ephemeral tables
ALTER TABLE posts ADD COLUMN archived BOOLEAN DEFAULT false;
ALTER TABLE bets ADD COLUMN archived BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN archived BOOLEAN DEFAULT false;
ALTER TABLE reactions ADD COLUMN archived BOOLEAN DEFAULT false;
ALTER TABLE stories ADD COLUMN archived BOOLEAN DEFAULT false;

-- Add embedding columns
ALTER TABLE posts ADD COLUMN embedding vector(1536);
ALTER TABLE bets ADD COLUMN embedding vector(1536);
ALTER TABLE users ADD COLUMN profile_embedding vector(1536);
ALTER TABLE users ADD COLUMN last_embedding_update TIMESTAMP;

-- Create indexes for performance
CREATE INDEX idx_posts_archived ON posts(archived);
CREATE INDEX idx_bets_archived ON bets(archived);
CREATE INDEX idx_messages_archived ON messages(archived);
```

### 1.2 Enable pgvector
```sql
-- Run in Supabase SQL editor
CREATE EXTENSION IF NOT EXISTS vector;

-- Create helper functions
CREATE OR REPLACE FUNCTION find_similar_users(
  query_embedding vector(1536),
  user_id uuid,
  limit_count int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  username text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    1 - (u.profile_embedding <=> query_embedding) as similarity
  FROM users u
  WHERE u.id != user_id
    AND u.profile_embedding IS NOT NULL
  ORDER BY u.profile_embedding <=> query_embedding
  LIMIT limit_count;
END;
$$;

-- Function to search similar content
CREATE OR REPLACE FUNCTION search_similar_content(
  query_embedding vector(1536),
  content_type text,
  limit_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF content_type = 'post' THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.caption as content,
      1 - (p.embedding <=> query_embedding) as similarity,
      jsonb_build_object(
        'reactions_count', p.reactions_count,
        'user_id', p.user_id,
        'created_at', p.created_at
      ) as metadata
    FROM posts p
    WHERE p.embedding IS NOT NULL
    ORDER BY p.embedding <=> query_embedding
    LIMIT limit_count;
  ELSIF content_type = 'bet' THEN
    RETURN QUERY
    SELECT 
      b.id,
      b.team || ' ' || b.bet_type || ' ' || b.odds as content,
      1 - (b.embedding <=> query_embedding) as similarity,
      jsonb_build_object(
        'sport', b.sport,
        'status', b.status,
        'stake', b.stake,
        'user_id', b.user_id
      ) as metadata
    FROM bets b
    WHERE b.embedding IS NOT NULL
    ORDER BY b.embedding <=> query_embedding
    LIMIT limit_count;
  END IF;
END;
$$;
```

### 1.3 Update Cleanup Jobs
```typescript
// scripts/jobs/archiveContent.ts
export async function archiveExpiredContent() {
  // Archive posts older than 24 hours
  await supabase
    .from('posts')
    .update({ archived: true })
    .eq('archived', false)
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  // Archive stories older than 24 hours
  await supabase
    .from('stories')
    .update({ archived: true })
    .eq('archived', false)
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  // Archive old week bets (on Sunday night)
  if (new Date().getDay() === 0) {
    await supabase
      .from('bets')
      .update({ archived: true })
      .eq('archived', false)
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
  }

  console.log('Content archived successfully');
}
```

---

## Phase 2: Update App Queries (Day 2)

### 2.1 Create Archived Filter Hook
```typescript
// hooks/useArchivedFilter.ts
export function useSupabaseWithArchiveFilter() {
  const supabase = useSupabase();
  
  return {
    from: (table: string) => {
      const query = supabase.from(table);
      
      // Tables that need archive filtering
      const archivableTables = ['posts', 'bets', 'messages', 'reactions', 'stories'];
      
      if (archivableTables.includes(table)) {
        return {
          ...query,
          select: (...args) => query.select(...args).eq('archived', false),
        };
      }
      
      return query;
    }
  };
}
```

### 2.2 Update All User-Facing Queries
```typescript
// Example updates throughout the codebase

// Before:
const posts = await supabase.from('posts').select('*');

// After:
const posts = await supabase.from('posts').select('*').eq('archived', false);

// Or using the hook:
const supabase = useSupabaseWithArchiveFilter();
const posts = await supabase.from('posts').select('*'); // Automatically filtered
```

### 2.3 Key Files to Update
- `/services/feed/feedService.ts` - Add `.eq('archived', false)` to all queries
- `/services/betting/bettingService.ts` - Filter archived bets
- `/services/post/postService.ts` - Hide archived posts
- `/hooks/useBets.ts` - Show only current week bets
- `/hooks/usePosts.ts` - Show only non-archived posts
- All components in `/components/feed/` - Ensure they use filtered data

---

## Phase 3: RAG Infrastructure Setup (Day 3)

### 3.1 Install Dependencies
```bash
npm install openai langchain @langchain/openai @langchain/community
npm install --save-dev @types/node dotenv
```

### 3.2 Create Base RAG Service
```typescript
// services/rag/ragService.ts
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role for embeddings
);

export class RAGService {
  // Generate embedding for any text
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }

  // Generate text with context
  async generateWithContext(prompt: string, context: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for a sports betting social app. Be concise and engaging.'
        },
        {
          role: 'user',
          content: `Context: ${context}\n\nTask: ${prompt}`
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });
    
    return response.choices[0].message.content || '';
  }

  // Search for similar embeddings
  async findSimilar(embedding: number[], table: string, limit: number = 10) {
    return await supabase.rpc(`search_similar_${table}`, {
      query_embedding: embedding,
      limit_count: limit
    });
  }
}

export const ragService = new RAGService();
```

### 3.3 Create Embedding Pipeline
```typescript
// services/rag/embeddingPipeline.ts
import { ragService } from './ragService';

export class EmbeddingPipeline {
  // Embed a bet when created
  async embedBet(bet: any) {
    const text = `${bet.sport} ${bet.team} ${bet.bet_type} at ${bet.odds} odds. ${bet.caption || ''}`;
    const embedding = await ragService.generateEmbedding(text);
    
    await supabase
      .from('bets')
      .update({ embedding })
      .eq('id', bet.id);
  }

  // Embed a post when created
  async embedPost(post: any) {
    const text = `${post.caption} ${post.type}`;
    const embedding = await ragService.generateEmbedding(text);
    
    await supabase
      .from('posts')
      .update({ embedding })
      .eq('id', post.id);
  }

  // Generate user profile embedding
  async embedUserProfile(userId: string) {
    // Get user's data (including archived)
    const [bets, posts, stats] = await Promise.all([
      supabase.from('bets').select('*').eq('user_id', userId).limit(50),
      supabase.from('posts').select('*').eq('user_id', userId).limit(20),
      supabase.from('bankrolls').select('*').eq('user_id', userId).single()
    ]);

    // Create profile text
    const sports = [...new Set(bets.data?.map(b => b.sport) || [])];
    const winRate = stats.data?.win_rate || 0;
    const betTypes = [...new Set(bets.data?.map(b => b.bet_type) || [])];
    
    const profileText = `
      Sports: ${sports.join(', ')}
      Win Rate: ${winRate}%
      Bet Types: ${betTypes.join(', ')}
      Total Bets: ${bets.data?.length || 0}
      Recent Activity: ${posts.data?.map(p => p.caption).slice(0, 3).join('. ')}
    `;

    const embedding = await ragService.generateEmbedding(profileText);
    
    await supabase
      .from('users')
      .update({ 
        profile_embedding: embedding,
        last_embedding_update: new Date()
      })
      .eq('id', userId);
  }

  // Batch embed existing data
  async embedExistingData() {
    // Embed posts without embeddings
    const posts = await supabase
      .from('posts')
      .select('*')
      .is('embedding', null)
      .limit(100);

    for (const post of posts.data || []) {
      await this.embedPost(post);
      await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit
    }

    // Embed bets without embeddings
    const bets = await supabase
      .from('bets')
      .select('*')
      .is('embedding', null)
      .limit(100);

    for (const bet of bets.data || []) {
      await this.embedBet(bet);
      await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit
    }

    // Update user profiles
    const users = await supabase
      .from('users')
      .select('id')
      .or('profile_embedding.is.null,last_embedding_update.lt.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    for (const user of users.data || []) {
      await this.embedUserProfile(user.id);
      await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit
    }
  }
}

export const embeddingPipeline = new EmbeddingPipeline();
```

### 3.4 Add Real-time Embedding Triggers
```typescript
// Add to your existing services

// services/post/postService.ts
import { embeddingPipeline } from '../rag/embeddingPipeline';

export async function createPost(data: any) {
  const post = await supabase.from('posts').insert(data).select().single();
  
  // Embed asynchronously
  embeddingPipeline.embedPost(post.data).catch(console.error);
  
  return post;
}

// services/betting/bettingService.ts
export async function placeBet(data: any) {
  const bet = await supabase.from('bets').insert(data).select().single();
  
  // Embed asynchronously
  embeddingPipeline.embedBet(bet.data).catch(console.error);
  
  return bet;
}
```

---

## Phase 4: RAG Feature Implementations (Days 4-8)

### 4.1 Smart Friend Discovery (Day 4)

```typescript
// services/rag/friendDiscoveryService.ts
import { ragService } from './ragService';

export class FriendDiscoveryService {
  async findSimilarUsers(userId: string) {
    // Ensure user has current embedding
    const user = await supabase
      .from('users')
      .select('profile_embedding, last_embedding_update')
      .eq('id', userId)
      .single();

    if (!user.data?.profile_embedding || 
        !user.data.last_embedding_update ||
        new Date(user.data.last_embedding_update) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      await embeddingPipeline.embedUserProfile(userId);
      const updated = await supabase
        .from('users')
        .select('profile_embedding')
        .eq('id', userId)
        .single();
      user.data.profile_embedding = updated.data.profile_embedding;
    }

    // Find similar users
    const similar = await supabase.rpc('find_similar_users', {
      query_embedding: user.data.profile_embedding,
      user_id: userId,
      limit_count: 30
    });

    // Get detailed info and generate reasons
    const recommendations = await Promise.all(
      similar.data.slice(0, 20).map(async (match) => {
        const [userData, stats, recentBets] = await Promise.all([
          supabase.from('users').select('*').eq('id', match.id).single(),
          supabase.from('bankrolls').select('*').eq('user_id', match.id).single(),
          supabase.from('bets').select('sport, count').eq('user_id', match.id).eq('archived', false)
        ]);

        // Generate match reasons
        const reasons = await this.generateMatchReasons(userId, match.id, stats.data);

        return {
          user: userData.data,
          similarity: match.similarity,
          stats: stats.data,
          reasons
        };
      })
    );

    return recommendations;
  }

  private async generateMatchReasons(userId: string, matchId: string, matchStats: any) {
    const reasons = [];

    // Get user's stats for comparison
    const userStats = await supabase
      .from('bankrolls')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Similar performance
    if (Math.abs(userStats.data.win_rate - matchStats.win_rate) < 5) {
      reasons.push(`Similar win rate (${matchStats.win_rate}%)`);
    }

    // Get common sports
    const [userBets, matchBets] = await Promise.all([
      supabase.from('bets').select('sport').eq('user_id', userId).eq('archived', false),
      supabase.from('bets').select('sport').eq('user_id', matchId).eq('archived', false)
    ]);

    const userSports = [...new Set(userBets.data?.map(b => b.sport) || [])];
    const matchSports = [...new Set(matchBets.data?.map(b => b.sport) || [])];
    const commonSports = userSports.filter(s => matchSports.includes(s));

    if (commonSports.length > 0) {
      reasons.push(`Both bet on ${commonSports.slice(0, 2).join(' and ')}`);
    }

    // Betting style
    if (userStats.data.total_bets > 20 && matchStats.total_bets > 20) {
      const userAvgStake = userStats.data.total_wagered / userStats.data.total_bets;
      const matchAvgStake = matchStats.total_wagered / matchStats.total_bets;
      
      if (Math.abs(userAvgStake - matchAvgStake) / userAvgStake < 0.3) {
        reasons.push('Similar betting style');
      }
    }

    return reasons;
  }
}

// Hook for UI
export function useFriendDiscovery() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const service = new FriendDiscoveryService();

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const recs = await service.findSimilarUsers(currentUser.id);
      setRecommendations(recs);
    } finally {
      setLoading(false);
    }
  };

  return { recommendations, loading, loadRecommendations };
}
```

### 4.2 AI Caption Generation (Day 5)

```typescript
// services/rag/captionService.ts
export class CaptionService {
  async generateCaption(bet: any, userId: string) {
    // Get similar successful bets
    const betText = `${bet.sport} ${bet.team} ${bet.bet_type} ${bet.odds}`;
    const betEmbedding = await ragService.generateEmbedding(betText);
    
    const similarBets = await supabase.rpc('search_similar_content', {
      query_embedding: betEmbedding,
      content_type: 'bet',
      limit_count: 10
    });

    // Get user's recent captions for style
    const recentPosts = await supabase
      .from('posts')
      .select('caption')
      .eq('user_id', userId)
      .eq('archived', false)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get high-performing captions
    const topCaptions = await supabase
      .from('posts')
      .select('caption, reactions_count')
      .gt('reactions_count', 10)
      .order('reactions_count', { ascending: false })
      .limit(10);

    // Build context
    const context = `
      Bet: ${bet.team} ${bet.bet_type} at ${bet.odds} odds
      Sport: ${bet.sport}
      
      User's recent captions:
      ${recentPosts.data?.map(p => p.caption).join('\n')}
      
      High-performing captions:
      ${topCaptions.data?.map(p => p.caption).join('\n')}
      
      Similar bet captions:
      ${similarBets.data?.map(b => b.content).join('\n')}
    `;

    const caption = await ragService.generateWithContext(
      'Generate a short, engaging caption for this bet. Match the user\'s style but make it unique. Keep it under 100 characters.',
      context
    );

    return caption;
  }
}

// Hook for UI
export function useAICaption() {
  const [caption, setCaption] = useState('');
  const [generating, setGenerating] = useState(false);
  const service = new CaptionService();

  const generateCaption = async (bet: any) => {
    setGenerating(true);
    try {
      const generated = await service.generateCaption(bet, currentUser.id);
      setCaption(generated);
    } finally {
      setGenerating(false);
    }
  };

  return { caption, generating, generateCaption };
}
```

### 4.3 Intelligent Notifications (Day 6)

```typescript
// services/rag/intelligentNotificationService.ts
export class IntelligentNotificationService {
  async processNotification(notification: any, userId: string) {
    // Score notification relevance
    const score = await this.scoreNotification(notification, userId);
    
    // Check for consensus
    if (notification.type === 'bet_placed') {
      const consensus = await this.checkConsensus(notification);
      if (consensus) {
        notification.consensus = consensus;
        notification.priority = 'high';
      }
    }

    // Personalize message
    const personalizedMessage = await this.personalizeMessage(notification, userId);
    
    return {
      ...notification,
      score,
      personalizedMessage,
      shouldSend: score > 0.5
    };
  }

  private async scoreNotification(notification: any, userId: string) {
    // Get user engagement history
    const engagementHistory = await supabase
      .from('notification_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    // Get user preferences
    const userProfile = await supabase
      .from('users')
      .select('profile_embedding')
      .eq('id', userId)
      .single();

    // Score based on type and user behavior
    let score = 0.5; // Base score

    // Boost score for types user engages with
    const engagedTypes = engagementHistory.data?.filter(e => e.clicked).map(e => e.type) || [];
    if (engagedTypes.includes(notification.type)) {
      score += 0.2;
    }

    // Boost for followed users
    if (notification.from_user_id) {
      const isFollowing = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', userId)
        .eq('following_id', notification.from_user_id)
        .single();
      
      if (isFollowing.data) {
        score += 0.3;
      }
    }

    return Math.min(score, 1);
  }

  private async checkConsensus(notification: any) {
    if (!notification.bet_id) return null;

    const bet = await supabase
      .from('bets')
      .select('*')
      .eq('id', notification.bet_id)
      .single();

    // Find similar recent bets
    const recentSimilar = await supabase
      .from('bets')
      .select('*')
      .eq('game_id', bet.data.game_id)
      .eq('team', bet.data.team)
      .eq('bet_type', bet.data.bet_type)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .neq('user_id', bet.data.user_id);

    if (recentSimilar.data.length >= 5) {
      return {
        count: recentSimilar.data.length,
        message: `${recentSimilar.data.length} bettors backing ${bet.data.team}`,
        confidence: recentSimilar.data.length / 10
      };
    }

    return null;
  }

  private async personalizeMessage(notification: any, userId: string) {
    const userContext = await supabase
      .from('users')
      .select('username, favorite_team')
      .eq('id', userId)
      .single();

    const context = `
      Notification type: ${notification.type}
      Original message: ${notification.message}
      User's favorite team: ${userContext.data?.favorite_team || 'None'}
      ${notification.consensus ? `Consensus: ${notification.consensus.message}` : ''}
    `;

    return await ragService.generateWithContext(
      'Rewrite this notification to be more engaging and personalized. Keep it under 100 characters.',
      context
    );
  }
}
```

### 4.4 Weekly AI Recaps (Day 7)

```typescript
// services/rag/weeklyRecapService.ts
export class WeeklyRecapService {
  async generateRecap(userId: string) {
    // Get week's data
    const [stats, bets, badges] = await Promise.all([
      supabase.from('weekly_stats').select('*').eq('user_id', userId).single(),
      supabase.from('bets').select('*').eq('user_id', userId).eq('archived', false),
      supabase.from('weekly_badges').select('*, badges(*)').eq('user_id', userId)
    ]);

    // Get patterns from all bets (including archived)
    const allBets = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    // Analyze patterns
    const patterns = this.analyzePatterns(allBets.data);

    // Get peer comparison
    const peerStats = await supabase
      .from('weekly_stats')
      .select('win_rate, profit')
      .neq('user_id', userId)
      .gte('total_bets', 5);

    const context = `
      This week's performance:
      - Record: ${stats.data.wins}-${stats.data.losses}
      - Profit: $${stats.data.profit}
      - Win Rate: ${stats.data.win_rate}%
      
      Badges earned: ${badges.data?.map(b => b.badges.name).join(', ') || 'None'}
      
      Best bets: ${bets.data?.filter(b => b.status === 'won').sort((a, b) => b.payout - a.payout).slice(0, 3).map(b => `${b.team} +$${b.payout}`).join(', ')}
      
      Historical patterns:
      - Best sport: ${patterns.bestSport}
      - Typical bet size: $${patterns.avgStake}
      - Best day: ${patterns.bestDay}
      
      Peer comparison:
      - Average win rate: ${peerStats.data?.reduce((acc, p) => acc + p.win_rate, 0) / peerStats.data?.length || 0}%
      - Your rank: ${this.calculateRank(stats.data.win_rate, peerStats.data)}
    `;

    const narrative = await ragService.generateWithContext(
      'Create an engaging, personalized weekly recap. Include 2-3 insights and suggestions for next week. Use emojis sparingly. Keep it under 200 words.',
      context
    );

    return {
      narrative,
      stats: stats.data,
      highlights: {
        bestBets: bets.data?.filter(b => b.status === 'won').sort((a, b) => b.payout - a.payout).slice(0, 3),
        badges: badges.data
      },
      insights: await this.generateInsights(patterns, stats.data)
    };
  }

  private analyzePatterns(bets: any[]) {
    const sportStats = {};
    const dayStats = {};
    
    bets.forEach(bet => {
      // Sport analysis
      if (!sportStats[bet.sport]) sportStats[bet.sport] = { wins: 0, total: 0 };
      sportStats[bet.sport].total++;
      if (bet.status === 'won') sportStats[bet.sport].wins++;
      
      // Day analysis
      const day = new Date(bet.created_at).getDay();
      if (!dayStats[day]) dayStats[day] = { wins: 0, total: 0 };
      dayStats[day].total++;
      if (bet.status === 'won') dayStats[day].wins++;
    });

    const bestSport = Object.entries(sportStats)
      .sort(([,a], [,b]) => (b.wins/b.total) - (a.wins/a.total))[0]?.[0];
    
    const bestDay = Object.entries(dayStats)
      .sort(([,a], [,b]) => (b.wins/b.total) - (a.wins/a.total))[0]?.[0];

    return {
      bestSport,
      bestDay: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][bestDay],
      avgStake: bets.reduce((acc, b) => acc + b.stake, 0) / bets.length
    };
  }

  private async generateInsights(patterns: any, stats: any) {
    const insights = [];

    if (patterns.bestSport && stats.wins > 5) {
      insights.push(`Focus on ${patterns.bestSport} - it's your strongest sport`);
    }

    if (patterns.bestDay) {
      insights.push(`You perform best on ${patterns.bestDay}s`);
    }

    if (stats.win_rate > 55) {
      insights.push('Your win rate is above average - consider increasing stakes');
    } else if (stats.win_rate < 45) {
      insights.push('Take smaller positions while you refine your strategy');
    }

    return insights;
  }
}
```

### 4.5 Betting Pattern Insights (Day 8)

```typescript
// services/rag/bettingInsightsService.ts
export class BettingInsightsService {
  async generateInsights(userId: string) {
    // Get all user's bets (including archived)
    const allBets = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Analyze different dimensions
    const insights = await Promise.all([
      this.analyzeTimePatterns(allBets.data),
      this.analyzeSportPerformance(allBets.data),
      this.analyzeBetTypes(allBets.data),
      this.analyzeStreaks(allBets.data),
      this.analyzeRiskManagement(allBets.data)
    ]);

    // Get similar successful users for strategy insights
    const userEmbedding = await supabase
      .from('users')
      .select('profile_embedding')
      .eq('id', userId)
      .single();

    const similarUsers = await supabase.rpc('find_similar_users', {
      query_embedding: userEmbedding.data.profile_embedding,
      user_id: userId,
      limit_count: 5
    });

    const strategyInsights = await this.getStrategyInsights(similarUsers.data, userId);

    return {
      timeInsights: insights[0],
      sportInsights: insights[1],
      betTypeInsights: insights[2],
      streakInsights: insights[3],
      riskInsights: insights[4],
      strategyInsights
    };
  }

  private async analyzeTimePatterns(bets: any[]) {
    const timeAnalysis = {
      byHour: {},
      byDay: {},
      byTimeToGame: {}
    };

    for (const bet of bets) {
      const date = new Date(bet.created_at);
      const hour = date.getHours();
      const day = date.getDay();
      
      if (!timeAnalysis.byHour[hour]) timeAnalysis.byHour[hour] = { wins: 0, total: 0 };
      if (!timeAnalysis.byDay[day]) timeAnalysis.byDay[day] = { wins: 0, total: 0 };
      
      timeAnalysis.byHour[hour].total++;
      timeAnalysis.byDay[day].total++;
      
      if (bet.status === 'won') {
        timeAnalysis.byHour[hour].wins++;
        timeAnalysis.byDay[day].wins++;
      }
    }

    // Find best times
    const bestHour = Object.entries(timeAnalysis.byHour)
      .filter(([,stats]) => stats.total > 5)
      .sort(([,a], [,b]) => (b.wins/b.total) - (a.wins/a.total))[0];
    
    const bestDay = Object.entries(timeAnalysis.byDay)
      .filter(([,stats]) => stats.total > 5)
      .sort(([,a], [,b]) => (b.wins/b.total) - (a.wins/a.total))[0];

    const context = `
      Best hour: ${bestHour ? `${bestHour[0]}:00 with ${Math.round(bestHour[1].wins/bestHour[1].total * 100)}% win rate` : 'Not enough data'}
      Best day: ${bestDay ? `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][bestDay[0]]} with ${Math.round(bestDay[1].wins/bestDay[1].total * 100)}% win rate` : 'Not enough data'}
    `;

    const insight = await ragService.generateWithContext(
      'Generate a brief insight about the best times to bet based on this data. Be specific and actionable.',
      context
    );

    return {
      type: 'timing',
      data: timeAnalysis,
      insight,
      bestHour: bestHour?.[0],
      bestDay: bestDay?.[0]
    };
  }

  private async analyzeSportPerformance(bets: any[]) {
    const sportStats = {};
    
    for (const bet of bets) {
      if (!sportStats[bet.sport]) {
        sportStats[bet.sport] = { 
          wins: 0, 
          total: 0, 
          profit: 0,
          avgOdds: 0
        };
      }
      
      sportStats[bet.sport].total++;
      sportStats[bet.sport].avgOdds += bet.odds;
      
      if (bet.status === 'won') {
        sportStats[bet.sport].wins++;
        sportStats[bet.sport].profit += bet.payout - bet.stake;
      } else if (bet.status === 'lost') {
        sportStats[bet.sport].profit -= bet.stake;
      }
    }

    // Calculate averages and ROI
    Object.keys(sportStats).forEach(sport => {
      sportStats[sport].avgOdds /= sportStats[sport].total;
      sportStats[sport].winRate = sportStats[sport].wins / sportStats[sport].total;
      sportStats[sport].roi = sportStats[sport].profit / (sportStats[sport].total * 50); // Assuming $50 avg bet
    });

    const rankedSports = Object.entries(sportStats)
      .filter(([,stats]) => stats.total > 10)
      .sort(([,a], [,b]) => b.roi - a.roi);

    return {
      type: 'sports',
      data: sportStats,
      topSport: rankedSports[0]?.[0],
      bottomSport: rankedSports[rankedSports.length - 1]?.[0],
      insight: `Focus on ${rankedSports[0]?.[0] || 'building more data'} (${Math.round(rankedSports[0]?.[1].winRate * 100)}% win rate). Avoid ${rankedSports[rankedSports.length - 1]?.[0] || 'none'}.`
    };
  }

  private async getStrategyInsights(similarUsers: any[], userId: string) {
    const insights = [];

    for (const similar of similarUsers.slice(0, 3)) {
      const theirStats = await supabase
        .from('bankrolls')
        .select('*')
        .eq('user_id', similar.id)
        .single();

      if (theirStats.data.win_rate > 55) {
        const theirBets = await supabase
          .from('bets')
          .select('bet_type, sport, count')
          .eq('user_id', similar.id)
          .eq('status', 'won')
          .limit(20);

        const commonBetType = this.mostCommon(theirBets.data.map(b => b.bet_type));
        insights.push(`Similar successful bettor focuses on ${commonBetType} bets`);
      }
    }

    return insights;
  }
}
```

### 4.6 Smart Feed Algorithm (Day 8)

```typescript
// services/rag/smartFeedService.ts
export class SmartFeedService {
  async rankFeedItems(userId: string, items: any[]) {
    // Get user embedding
    const user = await supabase
      .from('users')
      .select('profile_embedding')
      .eq('id', userId)
      .single();

    if (!user.data?.profile_embedding) {
      // Fallback to chronological
      return items;
    }

    // Score each item
    const scoredItems = await Promise.all(
      items.map(async (item) => {
        let score = 0;
        
        // 1. Content relevance (if item has embedding)
        if (item.embedding) {
          const similarity = this.cosineSimilarity(
            item.embedding,
            user.data.profile_embedding
          );
          score += similarity * 0.4;
        }

        // 2. Social signals
        if (item.user_id) {
          const isFollowing = await this.checkFollowing(userId, item.user_id);
          if (isFollowing) score += 0.2;
          
          const mutualFollows = await this.getMutualFollows(userId, item.user_id);
          score += Math.min(mutualFollows * 0.02, 0.1);
        }

        // 3. Engagement prediction
        const engagementScore = await this.predictEngagement(item, userId);
        score += engagementScore * 0.2;

        // 4. Recency
        const ageHours = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60);
        const recencyScore = Math.max(0, 1 - (ageHours / 24));
        score += recencyScore * 0.1;

        return { ...item, score };
      })
    );

    // Sort by score and apply diversity
    const sorted = scoredItems.sort((a, b) => b.score - a.score);
    return this.applyDiversity(sorted);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private async predictEngagement(item: any, userId: string) {
    // Simple engagement prediction based on past behavior
    const pastEngagement = await supabase
      .from('reactions')
      .select('count')
      .eq('user_id', userId)
      .eq('post_user_id', item.user_id);

    const engagementRate = pastEngagement.data[0]?.count || 0;
    return Math.min(engagementRate / 10, 1);
  }

  private applyDiversity(items: any[]) {
    const diverse = [];
    const seen = { users: new Set(), types: {} };

    for (const item of items) {
      // Limit items per user
      if (seen.users.has(item.user_id) && seen.users.size > 3) continue;
      
      // Limit items per type
      if ((seen.types[item.type] || 0) >= 3) continue;

      diverse.push(item);
      seen.users.add(item.user_id);
      seen.types[item.type] = (seen.types[item.type] || 0) + 1;

      if (diverse.length >= 50) break;
    }

    return diverse;
  }
}

// Update feed service
export async function getSmartFeed(userId: string) {
  // Get raw feed items
  const items = await supabase
    .from('posts')
    .select('*, users(*), bets(*)')
    .eq('archived', false)
    .order('created_at', { ascending: false })
    .limit(100);

  // Apply smart ranking
  const smartFeed = new SmartFeedService();
  return await smartFeed.rankFeedItems(userId, items.data);
}
```

---

## Phase 5: Integration & Testing (Day 9-10)

### 5.1 Add to Post Creation UI
```typescript
// app/(drawer)/(tabs)/create/index.tsx
import { useAICaption } from '@/services/rag/captionService';

export default function CreatePost() {
  const { caption: aiCaption, generating, generateCaption } = useAICaption();
  
  return (
    <View>
      <TextInput
        value={caption || aiCaption}
        onChangeText={setCaption}
        placeholder="Add a caption..."
      />
      
      <TouchableOpacity 
        onPress={() => generateCaption(currentBet)}
        disabled={generating}
      >
        <Text>{generating ? 'Generating...' : '✨ Generate Caption'}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 5.2 Add Friend Discovery Screen
```typescript
// app/(drawer)/(tabs)/discover/find-your-tribe.tsx
import { useFriendDiscovery } from '@/services/rag/friendDiscoveryService';

export default function FindYourTribe() {
  const { recommendations, loading, loadRecommendations } = useFriendDiscovery();
  
  useEffect(() => {
    loadRecommendations();
  }, []);
  
  return (
    <ScrollView>
      <Text style={styles.title}>Find Your Tribe</Text>
      <Text style={styles.subtitle}>AI-matched bettors like you</Text>
      
      {recommendations.map((rec) => (
        <View key={rec.user.id} style={styles.userCard}>
          <Image source={{ uri: rec.user.avatar_url }} style={styles.avatar} />
          
          <View style={styles.info}>
            <Text style={styles.username}>{rec.user.username}</Text>
            <Text style={styles.match}>{Math.round(rec.similarity * 100)}% match</Text>
            
            <View style={styles.reasons}>
              {rec.reasons.map((reason, i) => (
                <Text key={i} style={styles.reason}>• {reason}</Text>
              ))}
            </View>
          </View>
          
          <FollowButton userId={rec.user.id} />
        </View>
      ))}
    </ScrollView>
  );
}
```

### 5.3 Update Notification Service
```typescript
// services/notification/notificationService.ts
import { IntelligentNotificationService } from '../rag/intelligentNotificationService';

const intelligentNotifications = new IntelligentNotificationService();

export async function sendNotification(data: any) {
  // Process through AI
  const processed = await intelligentNotifications.processNotification(
    data,
    data.user_id
  );
  
  if (processed.shouldSend) {
    // Send with personalized message
    await supabase.from('notifications').insert({
      ...data,
      message: processed.personalizedMessage,
      score: processed.score,
      consensus: processed.consensus
    });
  }
}
```

### 5.4 Add Weekly Recap Component
```typescript
// components/WeeklyRecap.tsx
export function WeeklyRecap({ userId }: { userId: string }) {
  const [recap, setRecap] = useState(null);
  const recapService = new WeeklyRecapService();
  
  useEffect(() => {
    recapService.generateRecap(userId).then(setRecap);
  }, [userId]);
  
  if (!recap) return <LoadingSpinner />;
  
  return (
    <Card>
      <Badge>AI Generated</Badge>
      <Text style={styles.title}>Your Week in Review</Text>
      
      <Text style={styles.narrative}>{recap.narrative}</Text>
      
      <View style={styles.stats}>
        <Stat label="Record" value={`${recap.stats.wins}-${recap.stats.losses}`} />
        <Stat label="Profit" value={`$${recap.stats.profit}`} />
        <Stat label="Win Rate" value={`${recap.stats.win_rate}%`} />
      </View>
      
      {recap.highlights.badges?.length > 0 && (
        <BadgeList badges={recap.highlights.badges} />
      )}
      
      <View style={styles.insights}>
        {recap.insights.map((insight, i) => (
          <Text key={i} style={styles.insight}>💡 {insight}</Text>
        ))}
      </View>
    </Card>
  );
}
```

### 5.5 Create Embedding Job
```typescript
// scripts/jobs/embedContent.ts
import { embeddingPipeline } from '../../services/rag/embeddingPipeline';

export async function embedContent() {
  console.log('Starting embedding job...');
  
  try {
    await embeddingPipeline.embedExistingData();
    console.log('Embedding job completed');
  } catch (error) {
    console.error('Embedding job failed:', error);
  }
}

// Run daily or hourly depending on volume
```

---

## Deployment Checklist

1. **Environment Variables**
   ```bash
   OPENAI_API_KEY=sk-...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

2. **Database Migrations**
   - Run all SQL from Phase 1
   - Verify pgvector is enabled
   - Check indexes are created

3. **Initial Data Processing**
   - Run embedding job for existing data
   - Monitor API usage and costs
   - Verify embeddings are being stored

4. **Update Scheduled Jobs**
   - Change deletion jobs to archival
   - Add embedding generation job
   - Schedule profile updates

5. **Feature Flags (Optional)**
   ```typescript
   const FEATURES = {
     AI_CAPTIONS: true,
     SMART_FEED: false, // Enable gradually
     FRIEND_DISCOVERY: true,
     INTELLIGENT_NOTIFICATIONS: true,
     WEEKLY_RECAPS: true
   };
   ```

6. **Monitoring**
   - Track OpenAI API usage
   - Monitor embedding generation time
   - Check archive vs active data ratio
   - User engagement with AI features

---

## Cost Estimates

- **OpenAI Embeddings**: ~$0.02 per 1000 embeddings
- **OpenAI Chat**: ~$0.002 per caption/notification
- **Storage**: ~10% increase from embeddings
- **Estimated Monthly**: $50-200 depending on user volume

---

## Next Steps

1. Implement Phase 1-2 (Database + App Updates) - 2 days
2. Set up RAG infrastructure (Phase 3) - 1 day  
3. Implement 1-2 features to validate approach - 2-3 days
4. Roll out remaining features - 1 week
5. Optimize based on usage patterns

This plan gives you a complete RAG implementation while maintaining your ephemeral UX. The key is archiving instead of deleting, and keeping all AI processing separate from user-facing queries.