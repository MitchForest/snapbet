# SnapBet RAG Implementation Plan - Adapted to Current Codebase

## Overview

This implementation plan adapts the RAG capabilities to SnapBet's actual codebase structure. The key insight is that we'll use the existing `deleted_at` soft deletion system instead of adding new `archived` columns. This minimizes changes while enabling powerful AI features.

### Core Principle
- Content marked with `deleted_at` = hidden from users (ephemeral UX)
- Content with `deleted_at` = available for AI embeddings (RAG backend)
- Never hard delete content (modify existing cleanup job)

### Four Key Features
1. **AI Caption Generator** - Generate captions based on user's past captions
2. **Find Your Tribe** - AI-powered friend recommendations in search/explore
3. **Enhanced Feed** - 70% following + 30% AI-discovered content
4. **Consensus Alerts** - Smart notifications when friends bet similarly

---

## Phase 1: Database Infrastructure

### Step 1.1: Create Migration for pgvector and Embeddings

Create `supabase/migrations/030_add_rag_support.sql`:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding columns to existing tables
ALTER TABLE posts ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE bets ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_embedding vector(1536);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_embedding_update TIMESTAMP;

-- Create indexes for vector similarity search
CREATE INDEX IF NOT EXISTS idx_posts_embedding ON posts USING ivfflat (embedding vector_cosine_ops) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bets_embedding ON bets USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_users_embedding ON users USING ivfflat (profile_embedding vector_cosine_ops);

-- Create vector search functions
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
  favorite_team text,
  similarity float,
  win_rate float,
  total_bets int
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.display_name,
    u.avatar_url,
    u.favorite_team,
    1 - (u.profile_embedding <=> query_embedding) as similarity,
    COALESCE(b.win_rate, 0) as win_rate,
    COALESCE(b.total_bets, 0) as total_bets
  FROM users u
  LEFT JOIN bankrolls b ON b.user_id = u.id
  WHERE u.id != user_id
    AND u.profile_embedding IS NOT NULL
    AND u.deleted_at IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users 
      WHERE (blocker_id = user_id AND blocked_id = u.id)
         OR (blocker_id = u.id AND blocked_id = user_id)
    )
  ORDER BY u.profile_embedding <=> query_embedding
  LIMIT limit_count;
END;
$$;

CREATE OR REPLACE FUNCTION find_similar_posts(
  user_embedding vector(1536),
  exclude_user_ids uuid[],
  limit_count int DEFAULT 30
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  caption text,
  media_url text,
  post_type text,
  created_at timestamp with time zone,
  reaction_count int,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.caption,
    p.media_url,
    p.post_type,
    p.created_at,
    p.reaction_count,
    1 - (p.embedding <=> user_embedding) as similarity
  FROM posts p
  WHERE p.deleted_at IS NULL  -- Only active posts for feed
    AND p.user_id != ALL(exclude_user_ids)
    AND p.embedding IS NOT NULL
    AND p.expires_at > NOW()
  ORDER BY p.embedding <=> user_embedding
  LIMIT limit_count;
END;
$$;

CREATE OR REPLACE FUNCTION check_bet_consensus(
  p_game_id text,
  p_team text,
  p_bet_type bet_type,
  p_user_id uuid,
  time_window interval DEFAULT '1 hour'
)
RETURNS TABLE (
  bet_count int,
  user_ids uuid[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::int as bet_count,
    ARRAY_AGG(b.user_id) as user_ids
  FROM bets b
  WHERE b.game_id = p_game_id
    AND (b.bet_details->>'team')::text = p_team
    AND b.bet_type = p_bet_type
    AND b.user_id != p_user_id
    AND b.created_at > NOW() - time_window
    AND b.user_id IN (
      SELECT following_id FROM follows WHERE follower_id = p_user_id
    )
  GROUP BY b.game_id, b.bet_type
  HAVING COUNT(*) >= 3;
END;
$$;
```

### Step 1.2: Modify Content Expiration Job

Update `scripts/jobs/content-expiration.ts` to remove hard deletion:

```typescript
// Comment out or remove the hardDeleteOldContent method call
async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
  // ... existing expiration logic ...

  // REMOVED: Hard delete old content
  // const hardDeleted = await this.hardDeleteOldContent(options);
  
  return {
    success: true,
    message: `Expired ${totalAffected} items, cleaned ${cleanedComments + cleanedPickActions + cleanedStoryViews} related records`,
    affected: totalAffected,
    details,
  };
}
```

---

## Phase 2: RAG Infrastructure

### Step 2.1: Install OpenAI SDK

```bash
bun add openai
```

### Step 2.2: Create RAG Service Layer

Create `services/rag/ragService.ts`:

```typescript
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

export class RAGService {
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  async generateCaption(context: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a witty sports betting caption writer. Create short, engaging captions that are fun and confident. Use emojis sparingly. Keep it under 100 characters.'
          },
          {
            role: 'user',
            content: context
          }
        ],
        max_tokens: 50,
        temperature: 0.8,
      });
      
      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating caption:', error);
      throw error;
    }
  }
}

export const ragService = new RAGService();
```

### Step 2.3: Create Embedding Pipeline Service

Create `services/rag/embeddingPipeline.ts`:

```typescript
import { ragService } from './ragService';
import { supabase } from '@/services/supabase/client';
import { createClient } from '@supabase/supabase-js';

// Admin client for embedding updates
const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class EmbeddingPipeline {
  async embedPost(postId: string, caption: string, postType: string) {
    try {
      if (!caption || caption.trim().length === 0) return;
      
      const text = `${caption} ${postType}`;
      const embedding = await ragService.generateEmbedding(text);
      
      await supabaseAdmin
        .from('posts')
        .update({ embedding })
        .eq('id', postId);
    } catch (error) {
      console.error('Error embedding post:', error);
    }
  }

  async embedBet(betId: string, bet: any) {
    try {
      const team = bet.bet_details?.team || '';
      const betType = bet.bet_type || '';
      const odds = bet.odds || 0;
      const sport = bet.game?.sport || 'sports';
      
      const text = `${sport} ${team} ${betType} at ${odds} odds`;
      const embedding = await ragService.generateEmbedding(text);
      
      await supabaseAdmin
        .from('bets')
        .update({ embedding })
        .eq('id', betId);
    } catch (error) {
      console.error('Error embedding bet:', error);
    }
  }

  async updateUserProfile(userId: string) {
    try {
      // Get user's recent betting activity
      const { data: bets } = await supabase
        .from('bets')
        .select('bet_type, bet_details, games!inner(sport)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!bets || bets.length === 0) return;

      // Get user's stats
      const { data: stats } = await supabase
        .from('bankrolls')
        .select('win_rate, total_bets')
        .eq('user_id', userId)
        .single();

      // Extract patterns
      const sports = [...new Set(bets.map(b => b.games?.sport))].filter(Boolean);
      const betTypes = [...new Set(bets.map(b => b.bet_type))];
      const teams = [...new Set(bets.map(b => b.bet_details?.team))].filter(Boolean).slice(0, 5);
      
      const profileText = `
        Sports: ${sports.join(', ')}
        Bet types: ${betTypes.join(', ')}
        Teams: ${teams.join(', ')}
        Win rate: ${stats?.win_rate || 0}%
        Total bets: ${stats?.total_bets || 0}
      `;

      const embedding = await ragService.generateEmbedding(profileText);
      
      await supabaseAdmin
        .from('users')
        .update({ 
          profile_embedding: embedding,
          last_embedding_update: new Date().toISOString()
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }
}

export const embeddingPipeline = new EmbeddingPipeline();
```

---

## Phase 3: Production Jobs

### Step 3.1: Create Embedding Generation Job

Create `scripts/jobs/embedding-generation.ts`:

```typescript
import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '@/services/supabase/client';
import { embeddingPipeline } from '@/services/rag/embeddingPipeline';

export class EmbeddingGenerationJob extends BaseJob {
  constructor() {
    super({
      name: 'embedding-generation',
      description: 'Generate embeddings for new posts and bets',
      schedule: '*/5 * * * *', // Every 5 minutes
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    let totalProcessed = 0;
    const details: Record<string, number> = {};

    // Process new posts without embeddings
    const processedPosts = await this.processNewPosts(options);
    totalProcessed += processedPosts;
    details.posts = processedPosts;

    // Process new bets without embeddings
    const processedBets = await this.processNewBets(options);
    totalProcessed += processedBets;
    details.bets = processedBets;

    return {
      success: true,
      message: `Generated embeddings for ${totalProcessed} items`,
      affected: totalProcessed,
      details,
    };
  }

  private async processNewPosts(options: JobOptions): Promise<number> {
    const { data: posts } = await supabase
      .from('posts')
      .select('id, caption, post_type')
      .is('embedding', null)
      .not('caption', 'is', null)
      .limit(options.limit || 100);

    if (!posts || posts.length === 0) return 0;

    if (options.dryRun) {
      this.log(`Would process ${posts.length} posts`);
      return posts.length;
    }

    for (const post of posts) {
      await embeddingPipeline.embedPost(post.id, post.caption, post.post_type);
      await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit
    }

    this.log(`Processed ${posts.length} posts`);
    return posts.length;
  }

  private async processNewBets(options: JobOptions): Promise<number> {
    const { data: bets } = await supabase
      .from('bets')
      .select('id, bet_type, bet_details, odds, games!inner(sport)')
      .is('embedding', null)
      .limit(options.limit || 100);

    if (!bets || bets.length === 0) return 0;

    if (options.dryRun) {
      this.log(`Would process ${bets.length} bets`);
      return bets.length;
    }

    for (const bet of bets) {
      await embeddingPipeline.embedBet(bet.id, bet);
      await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit
    }

    this.log(`Processed ${bets.length} bets`);
    return bets.length;
  }
}
```

### Step 3.2: Create Profile Embedding Job

Create `scripts/jobs/profile-embedding.ts`:

```typescript
import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '@/services/supabase/client';
import { embeddingPipeline } from '@/services/rag/embeddingPipeline';

export class ProfileEmbeddingJob extends BaseJob {
  constructor() {
    super({
      name: 'profile-embedding',
      description: 'Update user profile embeddings based on activity',
      schedule: '0 * * * *', // Every hour
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    // Get users who need profile updates
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .or(`last_embedding_update.is.null,last_embedding_update.lt.${oneHourAgo}`)
      .limit(options.limit || 50);

    if (!users || users.length === 0) {
      return {
        success: true,
        message: 'No users need profile updates',
        affected: 0,
      };
    }

    if (options.dryRun) {
      this.log(`Would update ${users.length} user profiles`);
      return {
        success: true,
        message: `Would update ${users.length} profiles`,
        affected: users.length,
      };
    }

    let processed = 0;
    for (const user of users) {
      try {
        await embeddingPipeline.updateUserProfile(user.id);
        processed++;
        await new Promise(resolve => setTimeout(resolve, 200)); // Rate limit
      } catch (error) {
        this.log(`Failed to update profile for user ${user.id}: ${error}`);
      }
    }

    return {
      success: true,
      message: `Updated ${processed} user profiles`,
      affected: processed,
    };
  }
}
```

### Step 3.3: Update Job Runner

Add new jobs to `scripts/jobs/runner.ts`:

```typescript
import { EmbeddingGenerationJob } from './embedding-generation';
import { ProfileEmbeddingJob } from './profile-embedding';

// Add to job registry
const jobs = {
  // ... existing jobs ...
  'embedding-generation': new EmbeddingGenerationJob(),
  'profile-embedding': new ProfileEmbeddingJob(),
};
```

---

## Phase 4: Feature Implementation

### Feature 1: AI Caption Generator

#### Step 4.1: Create AI Caption Hook

Create `hooks/useAICaption.ts`:

```typescript
import { useState } from 'react';
import { ragService } from '@/services/rag/ragService';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export function useAICaption() {
  const user = useAuthStore((state) => state.user);
  const [caption, setCaption] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCaption = async (bet?: any) => {
    if (!user?.id) return;
    
    setGenerating(true);
    setError(null);
    
    try {
      let context = '';
      
      if (bet) {
        // For pick posts - include bet details
        const team = bet.bet_details?.team || bet.team || '';
        const betType = bet.bet_type || '';
        const odds = bet.odds || 0;
        const sport = bet.sport || '';
        
        context = `Generate a caption for this bet: ${team} ${betType} at ${odds} odds in ${sport}`;
        
        // Get user's recent successful captions
        const { data: recentPosts } = await supabase
          .from('posts')
          .select('caption')
          .eq('user_id', user.id)
          .eq('post_type', 'pick')
          .not('caption', 'is', null)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (recentPosts && recentPosts.length > 0) {
          context += `\n\nMy recent captions: ${recentPosts.map(p => p.caption).join(', ')}`;
        }
      } else {
        // For regular posts - use user's past captions
        const { data: recentPosts } = await supabase
          .from('posts')
          .select('caption')
          .eq('user_id', user.id)
          .not('caption', 'is', null)
          .order('reaction_count', { ascending: false })
          .limit(10);
        
        if (recentPosts && recentPosts.length > 0) {
          context = `Generate a caption similar in style to these: ${recentPosts.map(p => p.caption).join(', ')}`;
        } else {
          context = 'Generate a fun, engaging caption for a sports betting social post';
        }
      }
      
      const generated = await ragService.generateCaption(context);
      setCaption(generated);
    } catch (err) {
      setError('Failed to generate caption');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return { caption, generating, error, generateCaption, setCaption };
}
```

#### Step 4.2: Update Caption Input Component

Update `components/creation/CaptionInput.tsx`:

```typescript
import React from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Colors } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface CaptionInputProps {
  value: string;
  onChange: (text: string) => void;
  maxLength?: number;
  placeholder?: string;
  onGenerateAI?: () => void;
  isGeneratingAI?: boolean;
}

export function CaptionInput({
  value,
  onChange,
  maxLength = 280,
  placeholder = 'Add a caption...',
  onGenerateAI,
  isGeneratingAI = false,
}: CaptionInputProps) {
  const charCount = value.length;
  const showCounter = charCount > 200;

  const getCounterColor = () => {
    if (charCount >= 280) return Colors.error;
    if (charCount >= 250) return Colors.warning;
    return Colors.text.secondary;
  };

  const handleAIPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onGenerateAI?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.secondary}
          value={value}
          onChangeText={onChange}
          multiline
          maxLength={maxLength}
          textAlignVertical="top"
        />
        {onGenerateAI && (
          <Pressable
            onPress={handleAIPress}
            disabled={isGeneratingAI}
            style={[styles.aiButton, isGeneratingAI && styles.aiButtonDisabled]}
          >
            {isGeneratingAI ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <MaterialIcons name="auto-awesome" size={20} color={Colors.primary} />
            )}
          </Pressable>
        )}
      </View>
      {showCounter && (
        <Text style={[styles.counter, { color: getCounterColor() }]}>
          {charCount}/{maxLength}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 16,
    minHeight: 60,
    paddingRight: 60, // Space for counter and AI button
  },
  aiButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  aiButtonDisabled: {
    opacity: 0.5,
  },
  counter: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    fontSize: 12,
    fontWeight: '500',
  },
});
```

#### Step 4.3: Integrate with Media Preview

Update `components/camera/MediaPreview.tsx` to use AI caption:

```typescript
// Add to imports
import { useAICaption } from '@/hooks/useAICaption';

// Inside MediaPreview component
const { 
  caption: aiCaption, 
  generating: generatingCaption, 
  generateCaption 
} = useAICaption();

// Update caption state to use AI caption if available
useEffect(() => {
  if (aiCaption) {
    setCaption(aiCaption);
  }
}, [aiCaption]);

// In the JSX, update CaptionInput usage:
<CaptionInput 
  value={caption} 
  onChange={setCaption}
  maxLength={280}
  onGenerateAI={() => generateCaption(pendingBet)}
  isGeneratingAI={generatingCaption}
/>
```

### Feature 2: Find Your Tribe

#### Step 4.1: Create Friend Discovery Service

Create `services/rag/friendDiscoveryService.ts`:

```typescript
import { supabase } from '@/services/supabase/client';
import { embeddingPipeline } from './embeddingPipeline';
import { UserWithStats } from '@/services/search/searchService';

export interface SimilarUser extends UserWithStats {
  similarity: number;
  reasons: string[];
}

export class FriendDiscoveryService {
  async findSimilarUsers(userId: string): Promise<SimilarUser[]> {
    // Ensure user has current embedding
    const { data: user } = await supabase
      .from('users')
      .select('profile_embedding, last_embedding_update')
      .eq('id', userId)
      .single();

    // Update if needed (older than 24 hours)
    if (!user?.profile_embedding || 
        !user.last_embedding_update ||
        new Date(user.last_embedding_update) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
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
        limit_count: 20
      });

    if (error || !similar) return [];

    // Generate match reasons for each user
    const recommendations = await Promise.all(
      similar.map(async (match: any) => {
        const reasons = await this.generateMatchReasons(userId, match);
        return {
          ...match,
          similarity: match.similarity,
          reasons,
          // Add fields expected by UserWithStats
          win_count: Math.round((match.win_rate / 100) * match.total_bets),
          loss_count: match.total_bets - Math.round((match.win_rate / 100) * match.total_bets),
          bio: null,
          created_at: '',
        };
      })
    );

    return recommendations;
  }

  private async generateMatchReasons(userId: string, match: any): Promise<string[]> {
    const reasons = [];

    // Similar win rate
    if (match.win_rate) {
      const { data: currentUser } = await supabase
        .from('bankrolls')
        .select('win_rate')
        .eq('user_id', userId)
        .single();
      
      if (currentUser && Math.abs(currentUser.win_rate - match.win_rate) < 5) {
        reasons.push(`${match.win_rate}% win rate like you`);
      }
    }

    // Check common sports
    const { data: userBets } = await supabase
      .from('bets')
      .select('games!inner(sport)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    const { data: matchBets } = await supabase
      .from('bets')
      .select('games!inner(sport)')
      .eq('user_id', match.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (userBets && matchBets) {
      const userSports = [...new Set(userBets.map(b => b.games?.sport))];
      const matchSports = [...new Set(matchBets.map(b => b.games?.sport))];
      const common = userSports.filter(s => matchSports.includes(s));
      
      if (common.length > 0) {
        reasons.push(`Also bets ${common[0]}`);
      }
    }

    // Same favorite team
    if (match.favorite_team) {
      const { data: user } = await supabase
        .from('users')
        .select('favorite_team')
        .eq('id', userId)
        .single();
      
      if (user?.favorite_team === match.favorite_team) {
        reasons.push(`${match.favorite_team} fan`);
      }
    }

    // High similarity score
    if (match.similarity > 0.8) {
      reasons.push('Very similar betting style');
    }

    return reasons.slice(0, 2); // Max 2 reasons
  }
}

export const friendDiscoveryService = new FriendDiscoveryService();
```

#### Step 4.2: Create Find Your Tribe Hook

Create `hooks/useFriendDiscovery.ts`:

```typescript
import { useState, useEffect } from 'react';
import { friendDiscoveryService, SimilarUser } from '@/services/rag/friendDiscoveryService';
import { useAuthStore } from '@/stores/authStore';

export function useFriendDiscovery() {
  const user = useAuthStore((state) => state.user);
  const [recommendations, setRecommendations] = useState<SimilarUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const recs = await friendDiscoveryService.findSimilarUsers(user.id);
      setRecommendations(recs);
    } catch (err) {
      setError('Failed to load recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [user?.id]);

  return { recommendations, loading, error, refresh: loadRecommendations };
}
```

#### Step 4.3: Add to Search/Explore Page

Update `app/(drawer)/(tabs)/search.tsx` to add Find Your Tribe section:

```typescript
// Add to imports
import { useFriendDiscovery } from '@/hooks/useFriendDiscovery';

// Inside SearchScreenContent component, after hooks
const {
  recommendations,
  loading: tribeLoading,
  error: tribeError,
  refresh: refreshTribe,
} = useFriendDiscovery();

// Add to renderDiscoverySections, after RecentSearches:
<DiscoverySection
  title="Find Your Tribe"
  subtitle="AI-powered matches"
  emoji="🎯"
  users={recommendations}
  isLoading={tribeLoading}
  error={tribeError}
  emptyMessage="Building your recommendations..."
  followingStatus={allFollowingStatus}
  onFollowChange={handleFollowChange}
  onRefresh={refreshTribe}
/>
```

### Feature 3: Enhanced Feed (70/30 Mix)

#### Step 4.1: Create Smart Feed Service

Create `services/rag/smartFeedService.ts`:

```typescript
import { supabase } from '@/services/supabase/client';
import { PostWithType } from '@/types/content';
import { FeedResponse } from '@/services/feed/feedService';

export class SmartFeedService {
  async getHybridFeed(
    userId: string, 
    followingIds: string[],
    cursor?: { timestamp: string; id: string }
  ): Promise<FeedResponse> {
    const pageSize = 20;
    const followingRatio = 0.7;
    const discoveryRatio = 0.3;
    
    // Get user's embedding for discovery
    const { data: user } = await supabase
      .from('users')
      .select('profile_embedding')
      .eq('id', userId)
      .single();
    
    // Calculate splits
    const followingCount = Math.floor(pageSize * followingRatio);
    const discoveryCount = Math.ceil(pageSize * discoveryRatio);
    
    // Get following posts (existing logic)
    let followingQuery = supabase
      .from('posts')
      .select(`
        *,
        user:users!user_id (
          id,
          username,
          display_name,
          avatar_url
        ),
        bet:bets!bet_id (*),
        settled_bet:bets!settled_bet_id (*)
      `)
      .in('user_id', [...followingIds, userId])
      .is('deleted_at', null)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(followingCount);

    if (cursor) {
      followingQuery = followingQuery
        .lt('created_at', cursor.timestamp)
        .not('id', 'eq', cursor.id);
    }

    const { data: followingPosts } = await followingQuery;
    
    // Get discovery posts if user has embedding
    let discoveryPosts: any[] = [];
    if (user?.profile_embedding && followingIds.length > 0) {
      const { data: discovered } = await supabase
        .rpc('find_similar_posts', {
          user_embedding: user.profile_embedding,
          exclude_user_ids: [...followingIds, userId],
          limit_count: discoveryCount
        });
      
      if (discovered) {
        // Fetch full post data with relations
        const postIds = discovered.map((p: any) => p.id);
        const { data: fullPosts } = await supabase
          .from('posts')
          .select(`
            *,
            user:users!user_id (
              id,
              username,
              display_name,
              avatar_url
            ),
            bet:bets!bet_id (*),
            settled_bet:bets!settled_bet_id (*)
          `)
          .in('id', postIds);
        
        discoveryPosts = (fullPosts || []).map(post => ({
          ...post,
          isDiscovery: true
        }));
      }
    }
    
    // Mix posts
    const mixed = this.mixPosts(
      followingPosts || [], 
      discoveryPosts, 
      followingRatio
    );
    
    // Determine if there's more
    const hasMore = (followingPosts?.length || 0) === followingCount;
    
    // Get next cursor from last post
    const nextCursor = mixed.length > 0 ? {
      timestamp: mixed[mixed.length - 1].created_at,
      id: mixed[mixed.length - 1].id,
    } : null;
    
    return {
      posts: mixed as PostWithType[],
      nextCursor,
      hasMore
    };
  }
  
  private mixPosts(following: any[], discovery: any[], ratio: number): any[] {
    const mixed = [];
    let followingIndex = 0;
    let discoveryIndex = 0;
    
    while (followingIndex < following.length || discoveryIndex < discovery.length) {
      // Add following posts based on ratio
      const followingToAdd = Math.ceil(ratio * 3);
      for (let i = 0; i < followingToAdd && followingIndex < following.length; i++) {
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

export const smartFeedService = new SmartFeedService();
```

#### Step 4.2: Update Feed Service

Modify `services/feed/feedService.ts` to use smart feed:

```typescript
// Add import
import { smartFeedService } from '../rag/smartFeedService';

// Update getFeedPosts method
async getFeedPosts(userId: string, cursor?: FeedCursor): Promise<FeedResponse> {
  try {
    // Get following IDs
    const followingIds = await getFollowingIds();

    // Include self in feed
    const userIds = [...followingIds, userId];

    // If no follows, return empty
    if (userIds.length === 0) {
      return { posts: [], nextCursor: null, hasMore: false };
    }

    // Use smart feed service for hybrid feed
    const response = await smartFeedService.getHybridFeed(userId, followingIds, cursor);
    
    // Cache first page
    if (!cursor) {
      this.cacheFeed(response.posts);
    }

    return response;
  } catch (error) {
    console.error('Error fetching feed:', error);
    throw error;
  }
}
```

#### Step 4.3: Update Post Card for Discovery

Update `components/content/PostCard.tsx` to show discovery indicator:

```typescript
// Add to PostCard props
interface PostCardProps {
  post: PostWithType & { isDiscovery?: boolean };
  // ... other props
}

// In the component, add discovery badge after user info:
{post.isDiscovery && (
  <View style={styles.discoveryBadge}>
    <Text style={styles.discoveryText}>✨ Suggested</Text>
  </View>
)}

// Add styles
discoveryBadge: {
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: Colors.primary + '20',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
},
discoveryText: {
  fontSize: 11,
  color: Colors.primary,
  fontWeight: '600',
},
```

### Feature 4: Consensus Alerts

#### Step 4.1: Create Consensus Service

Create `services/rag/consensusService.ts`:

```typescript
import { supabase } from '@/services/supabase/client';

export interface ConsensusData {
  count: number;
  usernames: string[];
  bet: {
    team: string;
    type: string;
    odds: number;
  };
}

export class ConsensusService {
  async checkBetConsensus(bet: any, userId: string): Promise<ConsensusData | null> {
    // Get user's following list
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    
    const followingIds = following?.map(f => f.following_id) || [];
    
    if (followingIds.length === 0) return null;
    
    // Check for consensus among followed users
    const { data: consensus } = await supabase
      .rpc('check_bet_consensus', {
        p_game_id: bet.game_id,
        p_team: bet.bet_details?.team || '',
        p_bet_type: bet.bet_type,
        p_user_id: userId,
        time_window: '1 hour'
      });
    
    if (!consensus?.[0] || consensus[0].bet_count < 3) return null;
    
    // Get usernames of consensus bettors
    const consensusUserIds = consensus[0].user_ids;
    
    const { data: users } = await supabase
      .from('users')
      .select('username')
      .in('id', consensusUserIds)
      .limit(5);
    
    return {
      count: consensusUserIds.length,
      usernames: users?.map(u => u.username) || [],
      bet: {
        team: bet.bet_details?.team || '',
        type: bet.bet_type,
        odds: bet.odds
      }
    };
  }
  
  async createConsensusNotification(consensus: ConsensusData, userId: string) {
    const userList = consensus.usernames.slice(0, 3).join(', ');
    const others = consensus.count > 3 ? ` and ${consensus.count - 3} others` : '';
    
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'consensus_alert' as any, // Cast to bypass enum check
        read: false,
        data: {
          message: `🔥 ${userList}${others} all took ${consensus.bet.team} ${consensus.bet.type}`,
          actorUsername: userList,
          consensus: consensus
        }
      });
  }
}

export const consensusService = new ConsensusService();
```

#### Step 4.2: Add Consensus Check to Betting

Update `services/betting/bettingService.ts`:

```typescript
// Add import
import { consensusService } from '../rag/consensusService';
import { embeddingPipeline } from '../rag/embeddingPipeline';

// In createBet method, after bet creation:
// Check for consensus asynchronously
consensusService.checkBetConsensus(bet, userId)
  .then(consensus => {
    if (consensus) {
      // Get followers who might be interested
      return supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId);
    }
  })
  .then(followers => {
    if (followers?.data) {
      // Create notifications for followers
      followers.data.forEach(({ follower_id }) => {
        consensusService.checkBetConsensus(bet, follower_id)
          .then(followerConsensus => {
            if (followerConsensus && followerConsensus.count >= 3) {
              consensusService.createConsensusNotification(
                followerConsensus, 
                follower_id
              );
            }
          });
      });
    }
  })
  .catch(console.error);

// Embed the bet
embeddingPipeline.embedBet(bet.id, bet).catch(console.error);
```

#### Step 4.3: Update Notification Display

Update `components/notifications/NotificationItem.tsx`:

```typescript
// In getNotificationText method, add case for consensus:
case 'consensus_alert':
  return {
    title: 'Consensus Alert 🔥',
    body: data.message || 'Multiple friends placed similar bets',
  };

// In handlePress method, add navigation for consensus:
case 'consensus_alert':
  // Navigate to games tab to see the bet
  router.push('/(drawer)/(tabs)/games');
  break;

// Update the icon display for consensus alerts:
case 'consensus_alert':
  return '🔥';
```

---

## Phase 5: Mock Data Integration

### Step 5.1: Update Mock Setup

Update `scripts/mock/unified-setup.ts` to generate embeddings:

```typescript
// Add to imports
import { embeddingPipeline } from '@/services/rag/embeddingPipeline';

// After creating posts in createPosts function:
// Generate embeddings for all posts
console.log('🤖 Generating embeddings for posts...');
for (const post of createdPosts) {
  if (post.caption) {
    await embeddingPipeline.embedPost(post.id, post.caption, post.post_type);
    await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit
  }
}

// After creating bets:
// Generate embeddings for all bets
console.log('🤖 Generating embeddings for bets...');
for (const bet of allBets) {
  await embeddingPipeline.embedBet(bet.id, bet);
  await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit
}

// After creating users:
// Generate profile embeddings
console.log('🤖 Generating user profile embeddings...');
for (const user of mockUsers) {
  await embeddingPipeline.updateUserProfile(user.id);
  await new Promise(resolve => setTimeout(resolve, 200)); // Rate limit
}
```

---

## Testing & Deployment

### Testing Checklist

1. **Database**
   - [ ] pgvector extension enabled
   - [ ] Migration applied successfully
   - [ ] RPC functions work correctly
   - [ ] Content no longer hard deleted after 30 days

2. **Embeddings**
   - [ ] New posts get embeddings
   - [ ] New bets get embeddings
   - [ ] User profiles update hourly
   - [ ] Mock data has embeddings

3. **AI Features**
   - [ ] Caption generation works
   - [ ] Find Your Tribe shows recommendations
   - [ ] Feed mixes following + discovery posts
   - [ ] Consensus alerts trigger

4. **Performance**
   - [ ] Embedding generation doesn't block UI
   - [ ] Vector searches are fast
   - [ ] Feed loads smoothly

### Environment Variables

Add to `.env.local`:
```bash
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Deployment Steps

1. **Database Migration**
   ```bash
   supabase migration up
   ```

2. **Deploy Jobs**
   ```bash
   bun run scripts/jobs/cli.ts run embedding-generation
   bun run scripts/jobs/cli.ts run profile-embedding
   ```

3. **Schedule Jobs**
   - Embedding generation: Every 5 minutes
   - Profile updates: Every hour
   - Disable hard deletion in content-expiration

4. **Monitor**
   - OpenAI API usage
   - Embedding generation success rate
   - User engagement with AI features

---

## Cost Optimization

- Use `text-embedding-3-small` (5x cheaper than ada-002)
- Batch embedding requests
- Cache user profile embeddings for 24 hours
- Only embed posts with captions
- Rate limit API calls

---

## Future Enhancements

1. **Personalized Notifications**
   - "Users like you are betting on..."
   - Trend alerts based on embedding clusters

2. **Smart Bet Suggestions**
   - Suggest bets based on similar users' success
   - Warn when betting against consensus

3. **Content Recommendations**
   - Suggest who to follow based on content similarity
   - Recommend bet amounts based on similar users

4. **Advanced Analytics**
   - Betting style clusters
   - Success pattern analysis
   - Optimal betting times

This implementation maintains the ephemeral UX while building a powerful AI layer underneath. Users see content disappear as expected, but the AI learns from everything to enhance their experience. 