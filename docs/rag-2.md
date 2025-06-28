# SnapBet RAG Implementation Plan v2

## Overview

This implementation plan is specifically adapted for the SnapBet codebase after analyzing the existing architecture. It integrates RAG capabilities while leveraging the current service structure, job system, and UI components.

## Key Differences from Original Plan

1. **Leverage Existing Job System**: Modify `/scripts/jobs/content-expiration.ts` instead of creating new cleanup jobs
2. **Extend Current Services**: Add RAG features to existing services rather than creating parallel systems
3. **Integrate with Discovery**: Add "Find Your Tribe" to existing discovery algorithms
4. **Use Existing Types**: Extend current TypeScript interfaces instead of creating new ones
5. **Mock System Integration**: Extend the sophisticated mock system for testing RAG features

## Important: Archive vs Delete Strategy

This implementation uses a **hybrid approach** for content lifecycle:

- **`archived = true`**: Content that has expired (24hr for posts/stories, 7 days for bets) but is kept for AI/RAG features
- **`deleted_at != null`**: Content that was actually deleted (by user, moderation, or reports) and should NEVER be used

This separation ensures:
1. Clear semantics between "expired but useful" vs "deleted and gone"
2. Ability to hard-delete harmful/reported content
3. Better query performance with targeted indexes
4. Easier to explain to team members

User-facing queries: `.eq('archived', false).is('deleted_at', null)`  
AI/RAG queries: `.eq('archived', true).is('deleted_at', null)`

## Key Adjustments for SnapBet Codebase

This plan has been specifically adjusted for the actual SnapBet database structure:

1. **Bet Structure**: 
   - Bets use `bet_details` (JSON) containing `{team, line, total_type}`
   - Sport information is on the `games` table, not `bets`
   - Uses `stake` instead of `amount`

2. **Missing Columns**:
   - Added `favorite_teams` to users table
   - All embedding columns are new additions

3. **Environment Variables**:
   - Use `SUPABASE_SERVICE_KEY` (not `SUPABASE_SERVICE_ROLE_KEY`)
   - Add `EXPO_PUBLIC_OPENAI_API_KEY` to your .env

4. **Notifications**:
   - Direct database insert instead of non-existent service method
   - Consensus notifications use proper bet structure

5. **Type Safety**:
   - All queries updated to match actual database schema
   - Proper joins to access game information from bets

---

## Phase 1: Database Infrastructure (Day 1)

### Step 1.1: Create Migration File

Create `/supabase/migrations/032_add_rag_support.sql`:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add missing columns first
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_teams TEXT[];

-- Add archive columns to ephemeral tables
-- Note: 'archived' is for ephemeral content (24hr expiry), 'deleted_at' is for actual deletions (user/moderation)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE bets ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE reactions ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE pick_actions ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Add embedding columns
ALTER TABLE posts ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE bets ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_embedding vector(1536);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_embedding_update TIMESTAMP;

-- Create indexes for performance
-- Active content (visible to users)
CREATE INDEX IF NOT EXISTS idx_posts_active ON posts(created_at) WHERE deleted_at IS NULL AND NOT archived;
CREATE INDEX IF NOT EXISTS idx_bets_active ON bets(created_at) WHERE deleted_at IS NULL AND NOT archived;

-- Archived content (for AI/RAG)
CREATE INDEX IF NOT EXISTS idx_posts_archived_embedding ON posts USING ivfflat (embedding vector_cosine_ops) WHERE archived AND deleted_at IS NULL AND embedding IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bets_archived_embedding ON bets USING ivfflat (embedding vector_cosine_ops) WHERE archived AND deleted_at IS NULL AND embedding IS NOT NULL;

-- User embeddings
CREATE INDEX IF NOT EXISTS idx_users_embedding ON users USING ivfflat (profile_embedding vector_cosine_ops) WHERE profile_embedding IS NOT NULL;

-- Store embedding metadata
CREATE TABLE IF NOT EXISTS embedding_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'post', 'bet', 'user'
  entity_id UUID NOT NULL,
  model_version TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  token_count INTEGER,
  UNIQUE(entity_type, entity_id)
);
```

### Step 1.2: Create Vector Search Functions

Add to the same migration file:

```sql
-- Function to find similar users (for Find Your Tribe)
CREATE OR REPLACE FUNCTION find_similar_users(
  query_embedding vector(1536),
  user_id uuid,
  limit_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  bio text,
  is_verified boolean,
  similarity float,
  win_rate numeric,
  total_bets integer,
  favorite_teams text[],
  common_sports text[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH user_sports AS (
    SELECT 
      b.user_id,
      array_agg(DISTINCT g.sport) as sports
    FROM bets b
    INNER JOIN games g ON g.id = b.game_id
    WHERE b.archived = false
      AND b.created_at > NOW() - INTERVAL '30 days'
    GROUP BY b.user_id
  ),
  current_user_sports AS (
    SELECT array_agg(DISTINCT g.sport) as sports
    FROM bets b
    INNER JOIN games g ON g.id = b.game_id
    WHERE b.user_id = find_similar_users.user_id
      AND b.archived = false
      AND b.created_at > NOW() - INTERVAL '30 days'
  )
  SELECT 
    u.id,
    u.username,
    u.display_name,
    u.avatar_url,
    u.bio,
    u.is_verified,
    1 - (u.profile_embedding <=> query_embedding) as similarity,
    b.win_rate,
    b.total_bets,
    u.favorite_teams,
    array(
      SELECT unnest(us.sports) 
      INTERSECT 
      SELECT unnest(cus.sports)
    ) as common_sports
  FROM users u
  LEFT JOIN bankrolls b ON b.user_id = u.id
  LEFT JOIN user_sports us ON us.user_id = u.id
  CROSS JOIN current_user_sports cus
  WHERE u.id != find_similar_users.user_id
    AND u.profile_embedding IS NOT NULL
    AND u.is_private = false
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users 
      WHERE (blocker_id = find_similar_users.user_id AND blocked_id = u.id)
         OR (blocker_id = u.id AND blocked_id = find_similar_users.user_id)
    )
  ORDER BY u.profile_embedding <=> query_embedding
  LIMIT limit_count;
END;
$$;

-- Function to find similar posts (for enhanced feed)
CREATE OR REPLACE FUNCTION find_similar_posts(
  user_embedding vector(1536),
  user_id uuid,
  exclude_user_ids uuid[],
  time_window interval DEFAULT '24 hours',
  limit_count int DEFAULT 30
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  content jsonb,
  type text,
  created_at timestamp with time zone,
  expires_at timestamp with time zone,
  view_count integer,
  reaction_count integer,
  comment_count integer,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.content,
    p.type,
    p.created_at,
    p.expires_at,
    p.view_count,
    p.reaction_count,
    p.comment_count,
    1 - (p.embedding <=> user_embedding) as similarity
  FROM posts p
  INNER JOIN users u ON u.id = p.user_id
  WHERE p.archived = true  -- Look for archived content with embeddings
    AND p.deleted_at IS NULL  -- But not actually deleted content
    AND p.user_id != find_similar_posts.user_id
    AND (exclude_user_ids IS NULL OR p.user_id != ALL(exclude_user_ids))
    AND p.embedding IS NOT NULL
    AND p.created_at > NOW() - time_window
    AND u.is_private = false
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users 
      WHERE blocker_id = find_similar_posts.user_id 
        AND blocked_id = p.user_id
    )
  ORDER BY p.embedding <=> user_embedding
  LIMIT limit_count;
END;
$$;

-- Function to check consensus bets
CREATE OR REPLACE FUNCTION check_bet_consensus(
  check_game_id uuid,
  check_bet_details jsonb,
  check_user_id uuid,
  time_window interval DEFAULT '1 hour'
)
RETURNS TABLE (
  consensus_count integer,
  user_ids uuid[],
  usernames text[],
  avg_odds numeric,
  total_stake numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH consensus_bets AS (
    SELECT 
      b.user_id,
      u.username,
      b.odds,
      b.stake
    FROM bets b
    INNER JOIN users u ON u.id = b.user_id
    INNER JOIN follows f ON f.following_id = b.user_id
    WHERE b.game_id = check_game_id
      AND b.bet_details = check_bet_details
      AND b.user_id != check_user_id
      AND b.created_at > NOW() - time_window
      AND b.archived = false
      AND b.deleted_at IS NULL
      AND f.follower_id = check_user_id
  )
  SELECT 
    COUNT(*)::integer as consensus_count,
    array_agg(user_id) as user_ids,
    array_agg(username) as usernames,
    AVG(odds) as avg_odds,
    SUM(stake) as total_stake
  FROM consensus_bets
  HAVING COUNT(*) >= 3;  -- Minimum 3 followed users for consensus
END;
$$;
```

### Step 1.3: Update TypeScript Types

Update `/types/database.ts` to include new columns:

```typescript
// Add to existing interfaces
export interface Post {
  // ... existing fields
  archived?: boolean;
  embedding?: number[];
}

export interface Bet {
  // ... existing fields
  archived?: boolean;
  embedding?: number[];
}

export interface User {
  // ... existing fields
  profile_embedding?: number[];
  last_embedding_update?: string;
}
```

---

## Phase 2: Modify Content Expiration Job (Day 2)

### Step 2.1: Update Content Expiration Job

Modify `/scripts/jobs/content-expiration.ts`:

```typescript
// Replace deletion logic with archiving
// Around line 85 - Update posts expiration
const { error: postsError } = await supabase
  .from('posts')
  .update({ 
    archived: true,
    deleted_at: new Date().toISOString() // Keep for backwards compatibility
  })
  .eq('archived', false)
  .lt('expires_at', new Date().toISOString());

// Around line 104 - Update stories expiration  
const { error: storiesError } = await supabase
  .from('stories')
  .update({ 
    archived: true,
    deleted_at: new Date().toISOString()
  })
  .eq('archived', false)
  .lt('expires_at', new Date().toISOString());

// Around line 169 - Update weekly bet archiving
if (dayOfWeek === 0 && hour === 0) { // Sunday midnight
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const { error: betsError } = await supabase
    .from('bets')
    .update({ archived: true })
    .eq('archived', false)
    .lt('created_at', oneWeekAgo.toISOString());
}

// Add new function to archive old reactions and pick_actions
async function archiveEngagementData() {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  await supabase
    .from('reactions')
    .update({ archived: true })
    .eq('archived', false)
    .lt('created_at', threeDaysAgo.toISOString());
    
  await supabase
    .from('pick_actions')
    .update({ archived: true })
    .eq('archived', false)
    .lt('created_at', threeDaysAgo.toISOString());
}
```

---

## Phase 3: Update User-Facing Queries (Day 2)

### Step 3.1: Create Archive Filter Utility

Create `/utils/database/archiveFilter.ts`:

```typescript
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

// For user-facing queries - show only active content
export function withActiveContent<T extends { archived?: boolean; deleted_at?: string | null }>(
  query: PostgrestFilterBuilder<any, any, T>
): PostgrestFilterBuilder<any, any, T> {
  return query
    .eq('archived', false)
    .is('deleted_at', null);
}

// For AI/RAG queries - show only archived content
export function withArchivedContent<T extends { archived?: boolean; deleted_at?: string | null }>(
  query: PostgrestFilterBuilder<any, any, T>
): PostgrestFilterBuilder<any, any, T> {
  return query
    .eq('archived', true)
    .is('deleted_at', null);
}

// Helper to check if table has archive support
export const ARCHIVABLE_TABLES = [
  'posts', 
  'bets', 
  'stories', 
  'messages', 
  'reactions',
  'pick_actions'
] as const;

export type ArchivableTable = typeof ARCHIVABLE_TABLES[number];
```

### Step 3.2: Update Feed Service

Modify `/services/feed/feedService.ts`:

```typescript
// Add import
import { withActiveContent } from '@/utils/database/archiveFilter';

// Update getFeedPosts method (around line 38)
async getFeedPosts(userId: string, cursor?: string, limit: number = 20) {
  // ... existing code ...
  
  // Update the main query (around line 77)
  let query = withActiveContent(
    supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified,
          is_private
        ),
        bets!posts_bet_id_fkey (*),
        reactions (*)
      `)
  )
  .in('user_id', [...followingIds, userId])
  .order('created_at', { ascending: false })
  .limit(limit);
  
  // ... rest of method
}
```

### Step 3.3: Update Search Service

Modify `/services/search/searchService.ts`:

```typescript
// Update all discovery queries to filter archived content
// For example, in getHotBettors (around line 120)
const { data: recentBets } = await withActiveContent(
  supabase
    .from('bets')
    .select('user_id')
)
.gte('created_at', cutoffTime.toISOString())
.eq('status', 'won');
```

### Step 3.4: Update Other Services

Apply similar archive filtering to:
- `/services/content/postService.ts`
- `/services/content/storyService.ts`
- `/services/betting/bettingService.ts`
- `/services/social/reactionService.ts`

---

## Phase 4: Create RAG Service Layer (Day 3)

### Step 4.1: Install Dependencies

```bash
bun add openai
```

### Step 4.2: Create RAG Service

Create `/services/rag/ragService.ts`:

```typescript
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export class RAGService {
  private static instance: RAGService;
  
  static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  // Generate embedding for any text
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000), // Limit input length
      });
      
      // Track token usage
      await supabaseAdmin
        .from('embedding_metadata')
        .insert({
          model_version: 'text-embedding-3-small',
          token_count: response.usage?.total_tokens
        });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  // Generate caption using previous captions as context
  async generateCaption(
    userId: string,
    context: {
      bet?: any;
      postType: 'pick' | 'story' | 'post';
      previousCaptions?: string[];
    }
  ): Promise<string> {
    try {
      // Get user's recent successful captions for context
      const { data: recentPosts } = await supabaseAdmin
        .from('posts')
        .select('content')
        .eq('user_id', userId)
        .eq('archived', false)
        .not('content->caption', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);
      
      const userStyle = recentPosts?.map(p => p.content.caption).filter(Boolean) || [];
      
      let systemPrompt = `You are a witty sports betting caption writer. 
        Style: Short, punchy, confident. Use relevant emojis sparingly. 
        Max 100 characters. No hashtags.`;
      
      if (userStyle.length > 0) {
        systemPrompt += `\n\nUser's caption style examples: ${userStyle.slice(0, 5).join(', ')}`;
      }
      
      let userPrompt = '';
      if (context.bet && context.postType === 'pick') {
        const team = context.bet.bet_details?.team || '';
        const betType = context.bet.bet_type;
        const line = context.bet.bet_details?.line || '';
        userPrompt = `Write a caption for this bet: ${team} ${betType} ${line} at ${context.bet.odds} odds`;
      } else {
        userPrompt = 'Write a fun sports betting caption for a social post';
      }
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 50,
        temperature: 0.8,
      });
      
      return response.choices[0].message.content?.trim() || '';
    } catch (error) {
      console.error('Error generating caption:', error);
      throw error;
    }
  }

  // Batch generate embeddings (for efficiency)
  async batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts.map(t => t.slice(0, 8000)),
      });
      
      return response.data.map(d => d.embedding);
    } catch (error) {
      console.error('Error generating batch embeddings:', error);
      throw error;
    }
  }
}

export const ragService = RAGService.getInstance();
```

### Step 4.3: Create Embedding Pipeline

Create `/services/rag/embeddingPipeline.ts`:

```typescript
import { ragService } from './ragService';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export class EmbeddingPipeline {
  private static instance: EmbeddingPipeline;
  
  static getInstance(): EmbeddingPipeline {
    if (!EmbeddingPipeline.instance) {
      EmbeddingPipeline.instance = new EmbeddingPipeline();
    }
    return EmbeddingPipeline.instance;
  }

  // Embed a post when created
  async embedPost(postId: string, post: any) {
    try {
      // Build text representation
      const caption = post.content?.caption || '';
      const betDetails = post.bet ? 
        `${post.bet.sport} ${post.bet.team} ${post.bet.bet_type}` : '';
      const text = `${caption} ${betDetails}`.trim();
      
      if (!text) return; // Skip empty posts
      
      const embedding = await ragService.generateEmbedding(text);
      
      await supabaseAdmin
        .from('posts')
        .update({ embedding })
        .eq('id', postId);
        
      await supabaseAdmin
        .from('embedding_metadata')
        .upsert({
          entity_type: 'post',
          entity_id: postId,
          model_version: 'text-embedding-3-small',
          generated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error embedding post:', error);
      // Don't throw - embedding failures shouldn't break post creation
    }
  }

  // Embed a bet when created
  async embedBet(betId: string, bet: any) {
    try {
      // Get game details for sport
      const { data: game } = await supabaseAdmin
        .from('games')
        .select('sport, home_team, away_team')
        .eq('id', bet.game_id)
        .single();
      
      const team = bet.bet_details?.team || '';
      const betType = bet.bet_type;
      const line = bet.bet_details?.line || '';
      
      const text = `${game?.sport || ''} ${team} ${betType} ${line} at ${bet.odds} odds`;
      const embedding = await ragService.generateEmbedding(text);
      
      await supabaseAdmin
        .from('bets')
        .update({ embedding })
        .eq('id', betId);
        
      await supabaseAdmin
        .from('embedding_metadata')
        .upsert({
          entity_type: 'bet',
          entity_id: betId,
          model_version: 'text-embedding-3-small',
          generated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error embedding bet:', error);
    }
  }

  // Update user profile embedding based on betting history
  async updateUserProfile(userId: string) {
    try {
      // Get user's recent activity
      const [betsResult, bankrollResult, userResult] = await Promise.all([
        supabaseAdmin
          .from('bets')
          .select(`
            bet_type, 
            bet_details,
            status,
            game:games!inner(sport, home_team, away_team)
          `)
          .eq('user_id', userId)
          .eq('archived', false)
          .order('created_at', { ascending: false })
          .limit(100),
        supabaseAdmin
          .from('bankrolls')
          .select('total_wagered, total_won')
          .eq('user_id', userId)
          .single(),
        supabaseAdmin
          .from('users')
          .select('bio, favorite_teams')
          .eq('id', userId)
          .single()
      ]);

      if (!betsResult.data || betsResult.data.length < 5) {
        return; // Not enough data
      }

      // Analyze betting patterns
      const sports = [...new Set(betsResult.data.map(b => b.game?.sport).filter(Boolean))];
      const betTypes = [...new Set(betsResult.data.map(b => b.bet_type))];
      const teams = [...new Set(betsResult.data.map(b => b.bet_details?.team).filter(Boolean))].slice(0, 10);
      const totalWagered = bankrollResult.data?.total_wagered || 0;
      const totalWon = bankrollResult.data?.total_won || 0;
      const winRate = totalWagered > 0 ? Math.round((totalWon / totalWagered) * 100) : 0;
      
      // Count bet type frequencies
      const betTypeFreq = betsResult.data.reduce((acc, bet) => {
        acc[bet.bet_type] = (acc[bet.bet_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const favoriteType = Object.entries(betTypeFreq)
        .sort(([,a], [,b]) => b - a)[0]?.[0];
      
      // Build profile text
      const profileText = `
        Sports: ${sports.join(', ')}
        Favorite bet type: ${favoriteType}
        Common bet types: ${betTypes.join(', ')}
        Teams: ${teams.join(', ')}
        Win rate: ${winRate}%
        Total wagered: ${totalWagered}
        Total won: ${totalWon}
        Bio: ${userResult.data?.bio || ''}
        Favorite teams: ${userResult.data?.favorite_teams?.join(', ') || ''}
        Betting style: ${winRate > 60 ? 'Sharp' : winRate > 50 ? 'Solid' : 'Risk-taker'}
      `;

      const embedding = await ragService.generateEmbedding(profileText);
      
      await supabaseAdmin
        .from('users')
        .update({ 
          profile_embedding: embedding,
          last_embedding_update: new Date().toISOString()
        })
        .eq('id', userId);
        
      await supabaseAdmin
        .from('embedding_metadata')
        .upsert({
          entity_type: 'user',
          entity_id: userId,
          model_version: 'text-embedding-3-small',
          generated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }

  // Batch update user profiles (for job runner)
  async batchUpdateUserProfiles(userIds: string[]) {
    for (const userId of userIds) {
      await this.updateUserProfile(userId);
      // Rate limit to avoid overwhelming OpenAI
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

export const embeddingPipeline = EmbeddingPipeline.getInstance();
```

---

## Phase 5: Implement AI Caption Generator (Day 4)

### Step 5.1: Create AI Caption Hook

Create `/hooks/useAICaption.ts`:

```typescript
import { useState, useCallback } from 'react';
import { ragService } from '@/services/rag/ragService';
import { useAuth } from '@/contexts/AuthContext';

interface UseAICaptionOptions {
  bet?: any;
  postType: 'pick' | 'story' | 'post';
}

export function useAICaption(options: UseAICaptionOptions) {
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCaption = useCallback(async () => {
    if (!user) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const generated = await ragService.generateCaption(user.id, {
        bet: options.bet,
        postType: options.postType,
      });
      
      setCaption(generated);
    } catch (err) {
      setError('Failed to generate caption');
      console.error('Caption generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [user, options.bet, options.postType]);

  const clearCaption = useCallback(() => {
    setCaption('');
    setError(null);
  }, []);

  return {
    caption,
    isGenerating,
    error,
    generateCaption,
    clearCaption,
    setCaption
  };
}
```

### Step 5.2: Update Caption Input Component

Create `/components/creation/AICaptionButton.tsx`:

```typescript
import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

interface AICaptionButtonProps {
  onPress: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function AICaptionButton({ onPress, isGenerating, disabled }: AICaptionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || isGenerating}
    >
      {isGenerating ? (
        <ActivityIndicator size="small" color={colors.white} />
      ) : (
        <Ionicons name="sparkles" size={20} color={colors.white} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});
```

### Step 5.3: Integrate with Post Creation

Update the caption input in your post creation flow to include the AI button:

```typescript
// In your post creation component
import { useAICaption } from '@/hooks/useAICaption';
import { AICaptionButton } from '@/components/creation/AICaptionButton';

// Inside component
const { caption: aiCaption, generateCaption, isGenerating } = useAICaption({
  bet: selectedBet,
  postType: 'pick'
});

// In the render
<View style={styles.captionContainer}>
  <TextInput
    value={caption || aiCaption}
    onChangeText={setCaption}
    placeholder="Add a caption..."
    multiline
    maxLength={280}
    style={styles.captionInput}
  />
  <AICaptionButton
    onPress={generateCaption}
    isGenerating={isGenerating}
  />
</View>
```

### Step 5.4: Update Post Service

Modify `/services/content/postService.ts` to generate embeddings:

```typescript
import { embeddingPipeline } from '../rag/embeddingPipeline';

// Update createPost method (around line 35)
async createPost(data: CreatePostData): Promise<Post> {
  const { data: post, error } = await supabase
    .from('posts')
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  // Generate embedding asynchronously
  embeddingPipeline.embedPost(post.id, post).catch(error => {
    console.error('Failed to generate post embedding:', error);
  });

  return post;
}
```

---

## Phase 6: Implement Find Your Tribe (Day 4)

### Step 6.1: Create Friend Discovery Service

Create `/services/rag/friendDiscoveryService.ts`:

```typescript
import { supabase } from '@/utils/supabase/client';
import { embeddingPipeline } from './embeddingPipeline';

export class FriendDiscoveryService {
  private static instance: FriendDiscoveryService;
  
  static getInstance(): FriendDiscoveryService {
    if (!FriendDiscoveryService.instance) {
      FriendDiscoveryService.instance = new FriendDiscoveryService();
    }
    return FriendDiscoveryService.instance;
  }

  async findSimilarUsers(userId: string, limit: number = 20) {
    // Ensure user has current embedding
    const { data: user } = await supabase
      .from('users')
      .select('profile_embedding, last_embedding_update')
      .eq('id', userId)
      .single();

    // Update if needed (older than 24 hours)
    const needsUpdate = !user?.profile_embedding || 
      !user.last_embedding_update ||
      new Date(user.last_embedding_update) < new Date(Date.now() - 24 * 60 * 60 * 1000);
      
    if (needsUpdate) {
      await embeddingPipeline.updateUserProfile(userId);
      
      // Refetch
      const { data: updated } = await supabase
        .from('users')
        .select('profile_embedding')
        .eq('id', userId)
        .single();
        
      if (updated) user.profile_embedding = updated.profile_embedding;
    }

    if (!user?.profile_embedding) return [];

    // Find similar users using RPC
    const { data: similar, error } = await supabase
      .rpc('find_similar_users', {
        query_embedding: user.profile_embedding,
        user_id: userId,
        limit_count: limit
      });

    if (error || !similar) return [];

    // Generate match reasons
    const recommendations = await Promise.all(
      similar.map(async (match: any) => {
        const reasons = this.generateMatchReasons(match);
        return {
          ...match,
          matchReasons: reasons,
          matchPercentage: Math.round(match.similarity * 100)
        };
      })
    );

    return recommendations;
  }

  private generateMatchReasons(match: any): string[] {
    const reasons: string[] = [];

    // Similar win rate
    if (match.win_rate !== null) {
      reasons.push(`${match.win_rate}% win rate`);
    }

    // Common sports
    if (match.common_sports?.length > 0) {
      const sports = match.common_sports.slice(0, 2).join(' & ');
      reasons.push(`Also bets ${sports}`);
    }

    // Same favorite team
    if (match.favorite_teams?.length > 0) {
      reasons.push(`${match.favorite_teams[0]} fan`);
    }

    // Verification status
    if (match.is_verified) {
      reasons.push('Verified bettor');
    }

    return reasons.slice(0, 2); // Max 2 reasons
  }
}

export const friendDiscoveryService = FriendDiscoveryService.getInstance();
```

### Step 6.2: Add to Search Service

Update `/services/search/searchService.ts`:

```typescript
import { friendDiscoveryService } from '../rag/friendDiscoveryService';

// Add new discovery algorithm (around line 454)
const discoveryAlgorithms = {
  hot: getHotBettors,
  trending: getTrendingPickUsers,
  fade: getFadeMaterial,
  rising: getRisingStars,
  similar: getSimilarBettors, // New RAG-powered algorithm
};

// Add the new function
async function getSimilarBettors(userId: string): Promise<DiscoveryUser[]> {
  try {
    const similar = await friendDiscoveryService.findSimilarUsers(userId, 15);
    
    return similar.map(user => ({
      ...user,
      algorithm: 'similar' as const,
      algorithmDisplay: 'Find Your Tribe',
      algorithmEmoji: '🎯',
      description: user.matchReasons.join(' • '),
      metric: `${user.matchPercentage}% match`,
    }));
  } catch (error) {
    console.error('Error getting similar bettors:', error);
    return [];
  }
}
```

### Step 6.3: Update Search UI

The search page already renders discovery sections, so the new algorithm will automatically appear. You might want to add a special card design for "Find Your Tribe" users.

---

## Phase 7: Implement Enhanced Feed (70/30 Mix) (Day 5)

### Step 7.1: Create Smart Feed Service

Create `/services/rag/smartFeedService.ts`:

```typescript
import { supabase } from '@/utils/supabase/client';
import { Post } from '@/types/content';

export class SmartFeedService {
  private static instance: SmartFeedService;
  
  static getInstance(): SmartFeedService {
    if (!SmartFeedService.instance) {
      SmartFeedService.instance = new SmartFeedService();
    }
    return SmartFeedService.instance;
  }

  async getHybridFeed(
    userId: string, 
    followingIds: string[],
    cursor?: string,
    limit: number = 20
  ): Promise<{
    posts: Post[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const followingRatio = 0.7;
    const discoveryRatio = 0.3;
    
    // Calculate splits
    const followingCount = Math.ceil(limit * followingRatio);
    const discoveryCount = Math.floor(limit * discoveryRatio);
    
    // Get user's embedding for discovery
    const { data: user } = await supabase
      .from('users')
      .select('profile_embedding')
      .eq('id', userId)
      .single();
    
    // Get following posts
    const followingPostsPromise = this.getFollowingPosts(
      userId,
      followingIds,
      cursor,
      followingCount
    );
    
    // Get discovery posts if user has embedding
    const discoveryPostsPromise = user?.profile_embedding
      ? this.getDiscoveryPosts(
          userId,
          user.profile_embedding,
          followingIds,
          discoveryCount
        )
      : Promise.resolve([]);
    
    // Fetch both in parallel
    const [followingPosts, discoveryPosts] = await Promise.all([
      followingPostsPromise,
      discoveryPostsPromise
    ]);
    
    // Mix posts
    const mixedPosts = this.mixPosts(
      followingPosts,
      discoveryPosts,
      followingRatio
    );
    
    return {
      posts: mixedPosts,
      nextCursor: followingPosts[followingPosts.length - 1]?.id,
      hasMore: followingPosts.length === followingCount
    };
  }

  private async getFollowingPosts(
    userId: string,
    followingIds: string[],
    cursor?: string,
    limit: number
  ): Promise<Post[]> {
    let query = supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        ),
        bets!posts_bet_id_fkey (*),
        reactions (*)
      `)
      .in('user_id', [...followingIds, userId])
      .eq('archived', false)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (cursor) {
      query = query.lt('id', cursor);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data || [];
  }

  private async getDiscoveryPosts(
    userId: string,
    userEmbedding: number[],
    excludeUserIds: string[],
    limit: number
  ): Promise<Post[]> {
    const { data: postIds } = await supabase
      .rpc('find_similar_posts', {
        user_embedding: userEmbedding,
        user_id: userId,
        exclude_user_ids: [...excludeUserIds, userId],
        time_window: '24 hours',
        limit_count: limit
      });
    
    if (!postIds || postIds.length === 0) return [];
    
    // Fetch full post data
    const { data: posts } = await supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        ),
        bets!posts_bet_id_fkey (*),
        reactions (*)
      `)
      .in('id', postIds.map(p => p.id));
    
    return posts?.map(post => ({
      ...post,
      isDiscovery: true,
      similarity: postIds.find(p => p.id === post.id)?.similarity
    })) || [];
  }

  private mixPosts(
    following: Post[],
    discovery: Post[],
    ratio: number
  ): Post[] {
    const mixed: Post[] = [];
    let followingIndex = 0;
    let discoveryIndex = 0;
    
    // Use a pattern like: FFF-D-FFF-D (3 following, 1 discovery)
    const pattern = Math.round(1 / (1 - ratio));
    
    while (followingIndex < following.length || discoveryIndex < discovery.length) {
      // Add following posts
      for (let i = 0; i < pattern && followingIndex < following.length; i++) {
        mixed.push(following[followingIndex]);
        followingIndex++;
      }
      
      // Add discovery post
      if (discoveryIndex < discovery.length) {
        mixed.push(discovery[discoveryIndex]);
        discoveryIndex++;
      }
    }
    
    return mixed;
  }
}

export const smartFeedService = SmartFeedService.getInstance();
```

### Step 7.2: Update Feed Service

Modify `/services/feed/feedService.ts`:

```typescript
import { smartFeedService } from '../rag/smartFeedService';

// Add a flag to enable/disable smart feed
const ENABLE_SMART_FEED = true;

// Update getFeedPosts method
async getFeedPosts(userId: string, cursor?: string, limit: number = 20) {
  // ... existing code to get followingIds ...

  // Use smart feed if enabled and user has enough following
  if (ENABLE_SMART_FEED && followingIds.length >= 5) {
    return smartFeedService.getHybridFeed(
      userId,
      followingIds,
      cursor,
      limit
    );
  }

  // Otherwise use traditional feed
  // ... existing implementation ...
}
```

### Step 7.3: Update Feed UI for Discovery Posts

Update your post card component to show discovery indicators:

```typescript
// Add to PostCard component
{post.isDiscovery && (
  <View style={styles.discoveryBadge}>
    <Text style={styles.discoveryText}>✨ Suggested</Text>
  </View>
)}

// Add follow button for discovery posts
{post.isDiscovery && !isFollowing && (
  <FollowButton 
    userId={post.user_id}
    size="small"
    style={styles.inlineFollow}
  />
)}
```

---

## Phase 8: Implement Consensus Alerts (Day 5)

### Step 8.1: Create Consensus Service

Create `/services/rag/consensusService.ts`:

```typescript
import { supabase } from '@/utils/supabase/client';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export class ConsensusService {
  private static instance: ConsensusService;
  
  static getInstance(): ConsensusService {
    if (!ConsensusService.instance) {
      ConsensusService.instance = new ConsensusService();
    }
    return ConsensusService.instance;
  }

  async checkAndNotifyConsensus(bet: any, userId: string) {
    try {
      // Check for consensus
      const { data: consensus } = await supabase
        .rpc('check_bet_consensus', {
          check_game_id: bet.game_id,
          check_bet_details: bet.bet_details,
          check_user_id: userId,
          time_window: '1 hour'
        });

      if (!consensus || consensus.length === 0) return;

      const result = consensus[0];
      if (result.consensus_count < 3) return;

      // Create notification
      await this.createConsensusNotification(userId, result, bet);

      // Check for followers who might be interested
      const { data: followers } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId);

      if (followers) {
        // Check consensus for each follower
        for (const { follower_id } of followers) {
          await this.checkFollowerConsensus(follower_id, bet);
        }
      }
    } catch (error) {
      console.error('Error checking consensus:', error);
    }
  }

  private async checkFollowerConsensus(followerId: string, bet: any) {
    const { data: consensus } = await supabase
      .rpc('check_bet_consensus', {
        check_game_id: bet.game_id,
        check_bet_details: bet.bet_details,
        check_user_id: followerId,
        time_window: '2 hours'
      });

    if (consensus?.[0]?.consensus_count >= 3) {
      await this.createConsensusNotification(followerId, consensus[0], bet);
    }
  }

  private async createConsensusNotification(
    userId: string,
    consensus: any,
    bet: any
  ) {
    const userList = consensus.usernames.slice(0, 3).join(', ');
    const others = consensus.consensus_count > 3 
      ? ` and ${consensus.consensus_count - 3} others` 
      : '';
    
    const team = bet.bet_details?.team || '';
    const betType = bet.bet_type;
    const message = `🔥 ${userList}${others} all took ${team} ${betType}`;
    
    // Create notification directly in database
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'consensus',
        data: {
          title: 'Consensus Alert',
          body: message,
          bet_id: bet.id,
          game_id: bet.game_id,
          team: team,
          bet_type: betType,
          avg_odds: consensus.avg_odds,
          total_stake: consensus.total_stake,
          user_ids: consensus.user_ids
        }
      });
  }
}

export const consensusService = ConsensusService.getInstance();
```

### Step 8.2: Update Betting Service

Modify `/services/betting/bettingService.ts`:

```typescript
import { consensusService } from '../rag/consensusService';
import { embeddingPipeline } from '../rag/embeddingPipeline';

// Update placeBet method
async placeBet(betData: PlaceBetData): Promise<Bet> {
  // ... existing bet placement logic ...
  
  const { data: bet, error } = await supabase
    .from('bets')
    .insert(betData)
    .select()
    .single();

  if (error) throw error;

  // Async tasks after bet placement
  Promise.all([
    // Generate embedding
    embeddingPipeline.embedBet(bet.id, bet),
    // Check for consensus
    consensusService.checkAndNotifyConsensus(bet, bet.user_id)
  ]).catch(console.error);

  return bet;
}
```

### Step 8.3: Update Notification Types

Add consensus to notification types in your database or type definitions:

```typescript
// In your notification types
export type NotificationType = 
  | 'follow'
  | 'bet_outcome' 
  | 'message'
  | 'consensus' // Add this
  | 'mention';
```

---

## Phase 9: Create Mock Data Updates (Day 6)

### Step 9.1: Update Mock Generators

Create `/scripts/mock/generators/embeddings.ts`:

```typescript
import { ragService } from '@/services/rag/ragService';
import { supabase } from '@/utils/supabase/client';

export async function generateMockEmbeddings() {
  console.log('Generating embeddings for mock data...');

  // Get recent posts without embeddings
  const { data: posts } = await supabase
    .from('posts')
    .select('id, content, user_id')
    .is('embedding', null)
    .eq('archived', false)
    .limit(50);

  if (posts) {
    for (const post of posts) {
      const text = post.content?.caption || '';
      if (text) {
        try {
          const embedding = await ragService.generateEmbedding(text);
          await supabase
            .from('posts')
            .update({ embedding })
            .eq('id', post.id);
        } catch (error) {
          console.error(`Failed to embed post ${post.id}:`, error);
        }
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  // Update user profiles
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .is('profile_embedding', null)
    .limit(20);

  if (users) {
    for (const user of users) {
      try {
        await embeddingPipeline.updateUserProfile(user.id);
      } catch (error) {
        console.error(`Failed to embed user ${user.id}:`, error);
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('Mock embeddings generated');
}
```

### Step 9.2: Add to Mock Setup

Update `/scripts/mock/orchestrators/setup.ts`:

```typescript
import { generateMockEmbeddings } from '../generators/embeddings';

// Add to the setup flow
export async function setupMockData(username: string) {
  // ... existing setup ...

  // Generate embeddings for RAG features
  if (process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
    await generateMockEmbeddings();
  }

  console.log('Mock data setup complete');
}
```

---

## Phase 10: Add Profile Update Job (Day 6)

### Step 10.1: Create Profile Update Job

Create `/scripts/jobs/profile-embeddings.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { embeddingPipeline } from '@/services/rag/embeddingPipeline';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function updateProfileEmbeddings() {
  console.log('Starting profile embedding updates...');

  try {
    // Get users who need updates
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .or(`last_embedding_update.is.null,last_embedding_update.lt.${oneHourAgo}`)
      .limit(50);

    if (error) throw error;
    if (!users || users.length === 0) {
      console.log('No profiles need updating');
      return;
    }

    console.log(`Updating ${users.length} user profiles...`);
    await embeddingPipeline.batchUpdateUserProfiles(users.map(u => u.id));

    console.log('Profile embeddings updated successfully');
  } catch (error) {
    console.error('Error updating profile embeddings:', error);
    throw error;
  }
}
```

### Step 10.2: Add to Job Runner

Update `/scripts/jobs/runner.ts`:

```typescript
import { updateProfileEmbeddings } from './profile-embeddings';

// Add to job configurations
const jobs = [
  // ... existing jobs ...
  {
    name: 'profile-embeddings',
    schedule: '0 * * * *', // Every hour
    handler: updateProfileEmbeddings,
  },
];
```

---

## Environment Variables

Add to your `.env` files:

```bash
# Development (.env.local)
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
SUPABASE_SERVICE_KEY=eyJ...

# Production
# Same variables but with production values
```

---

## Testing Strategy

### 1. Database Migration Testing
```bash
# Run migration in development
supabase db push

# Verify tables and functions
supabase db inspect
```

### 2. Archive Testing
- Create test content
- Wait for expiration
- Verify content is archived (not visible in UI)
- Verify content still exists in database with `archived = true`

### 3. RAG Feature Testing
- **Caption Generation**: Create posts and test AI suggestions
- **Find Your Tribe**: Check similarity matches make sense
- **Enhanced Feed**: Verify 70/30 mix and discovery posts
- **Consensus Alerts**: Place similar bets with test accounts

### 4. Performance Testing
- Monitor embedding generation time
- Check feed load performance with mixed content
- Verify vector search query performance

---

## Rollout Strategy

### Phase 1: Infrastructure (Week 1)
1. Deploy database changes
2. Update content expiration job
3. Start generating embeddings for new content

### Phase 2: Read Features (Week 2)
1. Enable Find Your Tribe in search
2. Test with small user group
3. Monitor performance and accuracy

### Phase 3: Creation Features (Week 3)
1. Enable AI caption generation
2. A/B test adoption rates
3. Gather user feedback

### Phase 4: Feed Enhancement (Week 4)
1. Enable smart feed for 10% of users
2. Monitor engagement metrics
3. Gradually increase rollout

### Phase 5: Notifications (Week 5)
1. Enable consensus alerts
2. Monitor notification volume
3. Tune thresholds based on feedback

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Embedding Generation**
   - Success rate
   - Average generation time
   - OpenAI API costs

2. **Feature Adoption**
   - AI caption usage rate
   - Find Your Tribe follow rate
   - Discovery post engagement

3. **Performance**
   - Feed load times
   - Vector search query times
   - Database storage growth

4. **User Satisfaction**
   - Caption quality ratings
   - Friend recommendation accuracy
   - Consensus alert usefulness

---

## Cost Management

### OpenAI Usage Optimization

1. **Batch Processing**: Group embedding requests
2. **Caching**: Cache user profile embeddings for 24 hours
3. **Selective Embedding**: Only embed posts with content
4. **Model Selection**: Use `text-embedding-3-small` for cost efficiency

### Expected Costs

- Embeddings: ~$0.02 per 1000 posts
- Caption Generation: ~$0.002 per caption
- Estimated monthly: $50-200 depending on usage

---

## Future Enhancements

1. **Personalized Feed Ratios**: Adjust 70/30 mix per user preference
2. **Betting Style Clusters**: Group users by risk tolerance
3. **Smart Notifications**: Learn which consensus alerts users value
4. **Caption A/B Testing**: Test AI vs human captions
5. **Temporal Patterns**: Consider time of day in recommendations

---

This implementation plan provides a complete, production-ready approach to adding RAG capabilities to SnapBet while maintaining the existing architecture and user experience.