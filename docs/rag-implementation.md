# SnapBet RAG Implementation Guide

## Overview

This guide provides a step-by-step implementation plan for adding RAG (Retrieval-Augmented Generation) capabilities to SnapBet. The implementation focuses on four key features that enhance user experience while maintaining the app's ephemeral nature:

1. **AI Caption Generator** - Generate engaging captions for posts and stories
2. **Find Your Tribe** - Discover similar bettors through AI-powered recommendations
3. **Enhanced Feed** - Mix following content (70%) with AI-discovered content (30%)
4. **Consensus Alerts** - Smart notifications when multiple followed users bet similarly

The core principle: Archive content instead of deleting it, making it invisible to users but available for AI analysis. This preserves the ephemeral UX while enabling powerful AI features.

## ⚠️ Important Disclaimer

This implementation plan is based on the PRD and roadmap documents provided. Since I don't have access to your actual codebase, file paths and specific implementation details may differ. Use this as a guide and adapt based on your actual code structure.

---

## Prerequisites

- Supabase project with pgvector extension enabled
- OpenAI API key
- Existing SnapBet codebase with authentication and basic features working

---

## Phase 1: Database Infrastructure (Day 1)

### Step 1.1: Enable pgvector Extension

```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### Step 1.2: Add Archive Columns to Ephemeral Tables

```sql
-- Add archived flag to all ephemeral content tables
ALTER TABLE posts ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE bets ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE reactions ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Add embedding columns for AI features
ALTER TABLE posts ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE bets ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_embedding vector(1536);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_embedding_update TIMESTAMP;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_archived ON posts(archived);
CREATE INDEX IF NOT EXISTS idx_posts_embedding ON posts USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_bets_archived ON bets(archived);
CREATE INDEX IF NOT EXISTS idx_users_embedding ON users USING ivfflat (profile_embedding vector_cosine_ops);
```

### Step 1.3: Create Vector Search Functions

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
    b.win_rate,
    b.total_bets
  FROM users u
  LEFT JOIN bankrolls b ON b.user_id = u.id
  WHERE u.id != user_id
    AND u.profile_embedding IS NOT NULL
    AND u.is_private = false  -- Only show public profiles
  ORDER BY u.profile_embedding <=> query_embedding
  LIMIT limit_count;
END;
$$;

-- Function to find similar posts (for enhanced feed)
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
  type text,
  created_at timestamp with time zone,
  reactions_count int,
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
    p.type,
    p.created_at,
    p.reactions_count,
    1 - (p.embedding <=> user_embedding) as similarity
  FROM posts p
  WHERE p.archived = false
    AND p.user_id != ALL(exclude_user_ids)
    AND p.embedding IS NOT NULL
    AND p.created_at > NOW() - INTERVAL '24 hours'
  ORDER BY p.embedding <=> user_embedding
  LIMIT limit_count;
END;
$$;

-- Function to check consensus bets
CREATE OR REPLACE FUNCTION check_bet_consensus(
  game_id uuid,
  team text,
  bet_type text,
  user_id uuid,
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
  WHERE b.game_id = game_id
    AND b.team = team
    AND b.bet_type = bet_type
    AND b.user_id != user_id
    AND b.created_at > NOW() - time_window
    AND b.archived = false
  GROUP BY b.game_id, b.team, b.bet_type
  HAVING COUNT(*) >= 3;  -- Minimum 3 bets for consensus
END;
$$;
```

### Step 1.4: Update Archive Job (Replace Deletion)

Create a new edge function or update existing cleanup job:

```typescript
// supabase/functions/archive-content/index.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async () => {
  // Archive posts older than 24 hours
  await supabase
    .from('posts')
    .update({ archived: true })
    .eq('archived', false)
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  // Archive stories older than 24 hours
  await supabase
    .from('stories')
    .update({ archived: true })
    .eq('archived', false)
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  // Archive week-old bets on Sunday night
  if (new Date().getDay() === 0) {
    await supabase
      .from('bets')
      .update({ archived: true })
      .eq('archived', false)
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  }

  return new Response('Content archived successfully', { status: 200 })
})
```

---

## Phase 2: Update App Queries (Day 2)

### Step 2.1: Create Archive Filter Utility

```typescript
// utils/supabase/archiveFilter.ts
import { SupabaseClient } from '@supabase/supabase-js'

export function withArchiveFilter<T>(
  query: any,
  tableName: string
): any {
  const archivableTables = ['posts', 'bets', 'stories', 'messages', 'reactions']
  
  if (archivableTables.includes(tableName)) {
    return query.eq('archived', false)
  }
  
  return query
}

// Usage example:
// const posts = await withArchiveFilter(
//   supabase.from('posts').select('*'),
//   'posts'
// )
```

### Step 2.2: Update All User-Facing Queries

Key files to update (add `.eq('archived', false)` to queries):

1. **Feed Service**
   - `/services/feed/feedService.ts`
   - Add archive filter to all post queries

2. **Betting Service**
   - `/services/betting/bettingService.ts`
   - Filter out archived bets from user views

3. **Post Service**
   - `/services/post/postService.ts`
   - Hide archived posts from all queries

4. **Story Service**
   - `/services/story/storyService.ts`
   - Filter archived stories

5. **Profile Components**
   - Update bet history queries
   - Update post grid queries

Example update:
```typescript
// Before
const posts = await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false })

// After
const posts = await supabase
  .from('posts')
  .select('*')
  .eq('archived', false)  // Add this line
  .order('created_at', { ascending: false })
```

---

## Phase 3: RAG Infrastructure (Day 3)

### Step 3.1: Install Dependencies

```bash
npm install openai
npm install @supabase/supabase-js
```

### Step 3.2: Create RAG Service

```typescript
// services/rag/ragService.ts
import { OpenAI } from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
})

const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export class RAGService {
  // Generate embedding for any text
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      })
      return response.data[0].embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      throw error
    }
  }

  // Generate caption with GPT
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
      })
      
      return response.choices[0].message.content || ''
    } catch (error) {
      console.error('Error generating caption:', error)
      throw error
    }
  }
}

export const ragService = new RAGService()
```

### Step 3.3: Create Embedding Pipeline

```typescript
// services/rag/embeddingPipeline.ts
import { ragService } from './ragService'
import { supabase } from '@/utils/supabase/client'

export class EmbeddingPipeline {
  // Embed a post when created
  async embedPost(postId: string, caption: string, type: string) {
    try {
      const text = `${caption} ${type}`
      const embedding = await ragService.generateEmbedding(text)
      
      // Use service role client for embedding updates
      await supabaseAdmin
        .from('posts')
        .update({ embedding })
        .eq('id', postId)
    } catch (error) {
      console.error('Error embedding post:', error)
      // Don't throw - embedding failures shouldn't break post creation
    }
  }

  // Embed a bet when created
  async embedBet(betId: string, bet: any) {
    try {
      const text = `${bet.sport} ${bet.team} ${bet.bet_type} at ${bet.odds} odds`
      const embedding = await ragService.generateEmbedding(text)
      
      await supabaseAdmin
        .from('bets')
        .update({ embedding })
        .eq('id', betId)
    } catch (error) {
      console.error('Error embedding bet:', error)
    }
  }

  // Update user profile embedding
  async updateUserProfile(userId: string) {
    try {
      // Get user's recent activity
      const [bets, stats] = await Promise.all([
        supabase
          .from('bets')
          .select('sport, bet_type, team')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('bankrolls')
          .select('win_rate, total_bets')
          .eq('user_id', userId)
          .single()
      ])

      if (!bets.data || bets.data.length === 0) return

      // Create profile text
      const sports = [...new Set(bets.data.map(b => b.sport))]
      const betTypes = [...new Set(bets.data.map(b => b.bet_type))]
      const teams = [...new Set(bets.data.map(b => b.team))].slice(0, 5)
      
      const profileText = `
        Sports: ${sports.join(', ')}
        Bet types: ${betTypes.join(', ')}
        Teams: ${teams.join(', ')}
        Win rate: ${stats.data?.win_rate || 0}%
        Total bets: ${stats.data?.total_bets || 0}
      `

      const embedding = await ragService.generateEmbedding(profileText)
      
      await supabaseAdmin
        .from('users')
        .update({ 
          profile_embedding: embedding,
          last_embedding_update: new Date().toISOString()
        })
        .eq('id', userId)
    } catch (error) {
      console.error('Error updating user profile:', error)
    }
  }
}

export const embeddingPipeline = new EmbeddingPipeline()
```

---

## Phase 4: Feature Implementation (Days 4-5)

### Feature 1: AI Caption Generator

#### Step 4.1.1: Create Caption Generation Hook

```typescript
// hooks/useAICaption.ts
import { useState } from 'react'
import { ragService } from '@/services/rag/ragService'
import { supabase } from '@/utils/supabase/client'

export function useAICaption() {
  const [caption, setCaption] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCaption = async (bet?: any) => {
    setGenerating(true)
    setError(null)
    
    try {
      let context = ''
      
      if (bet) {
        // For pick posts - include bet details
        context = `Generate a caption for this bet: ${bet.team} ${bet.bet_type} at ${bet.odds} odds in ${bet.sport}`
        
        // Get similar successful bets for context
        const recentWins = await supabase
          .from('bets')
          .select('caption')
          .eq('status', 'won')
          .eq('sport', bet.sport)
          .limit(5)
        
        if (recentWins.data && recentWins.data.length > 0) {
          context += `\n\nSuccessful bet captions: ${recentWins.data.map(b => b.caption).join(', ')}`
        }
      } else {
        // For regular posts - be creative
        context = 'Generate a fun, engaging caption for a sports betting social post'
      }
      
      const generated = await ragService.generateCaption(context)
      setCaption(generated)
    } catch (err) {
      setError('Failed to generate caption')
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  return { caption, generating, error, generateCaption, setCaption }
}
```

#### Step 4.1.2: Update Create Post UI

```typescript
// app/(drawer)/(tabs)/create/index.tsx (or your create post component)
import { useAICaption } from '@/hooks/useAICaption'
import { TouchableOpacity, Text, TextInput, View, ActivityIndicator } from 'react-native'

export default function CreatePost() {
  const { caption: aiCaption, generating, generateCaption, setCaption } = useAICaption()
  const [caption, setLocalCaption] = useState('')
  
  // Use AI caption if available, otherwise use local caption
  const finalCaption = aiCaption || caption
  
  return (
    <View>
      {/* Your existing media capture UI */}
      
      <View style={styles.captionContainer}>
        <TextInput
          value={finalCaption}
          onChangeText={(text) => {
            setLocalCaption(text)
            setCaption('') // Clear AI caption if user types
          }}
          placeholder="Add a caption..."
          style={styles.captionInput}
          multiline
          maxLength={280}
        />
        
        <TouchableOpacity 
          onPress={() => generateCaption(currentBet)}
          disabled={generating}
          style={styles.aiButton}
        >
          {generating ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={styles.aiButtonText}>🤖</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Rest of your create post UI */}
    </View>
  )
}
```

#### Step 4.1.3: Embed Posts After Creation

```typescript
// services/post/postService.ts
import { embeddingPipeline } from '../rag/embeddingPipeline'

export async function createPost(data: PostData) {
  // Create the post
  const { data: post, error } = await supabase
    .from('posts')
    .insert(data)
    .select()
    .single()
    
  if (error) throw error
  
  // Generate embedding asynchronously
  embeddingPipeline.embedPost(post.id, post.caption, post.type)
    .catch(console.error) // Don't block on embedding errors
  
  return post
}
```

### Feature 2: Find Your Tribe

#### Step 4.2.1: Create Friend Discovery Service

```typescript
// services/rag/friendDiscoveryService.ts
import { supabase } from '@/utils/supabase/client'
import { embeddingPipeline } from './embeddingPipeline'

export class FriendDiscoveryService {
  async findSimilarUsers(userId: string) {
    // Ensure user has current embedding
    const { data: user } = await supabase
      .from('users')
      .select('profile_embedding, last_embedding_update')
      .eq('id', userId)
      .single()

    // Update if needed (older than 24 hours)
    if (!user?.profile_embedding || 
        !user.last_embedding_update ||
        new Date(user.last_embedding_update) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      await embeddingPipeline.updateUserProfile(userId)
      
      // Refetch
      const { data: updated } = await supabase
        .from('users')
        .select('profile_embedding')
        .eq('id', userId)
        .single()
        
      if (updated) user.profile_embedding = updated.profile_embedding
    }

    if (!user?.profile_embedding) return []

    // Find similar users using RPC
    const { data: similar, error } = await supabase
      .rpc('find_similar_users', {
        query_embedding: user.profile_embedding,
        user_id: userId,
        limit_count: 20
      })

    if (error || !similar) return []

    // Generate match reasons for each user
    const recommendations = await Promise.all(
      similar.map(async (match: any) => {
        const reasons = await this.generateMatchReasons(userId, match)
        return {
          ...match,
          reasons
        }
      })
    )

    return recommendations
  }

  private async generateMatchReasons(userId: string, match: any) {
    const reasons = []

    // Similar win rate
    if (match.win_rate) {
      const { data: currentUser } = await supabase
        .from('bankrolls')
        .select('win_rate')
        .eq('user_id', userId)
        .single()
      
      if (currentUser && Math.abs(currentUser.win_rate - match.win_rate) < 5) {
        reasons.push(`${match.win_rate}% win rate like you`)
      }
    }

    // Check common sports
    const { data: userBets } = await supabase
      .from('bets')
      .select('sport')
      .eq('user_id', userId)
      .eq('archived', false)
      .limit(20)

    const { data: matchBets } = await supabase
      .from('bets')
      .select('sport')
      .eq('user_id', match.id)
      .eq('archived', false)
      .limit(20)

    if (userBets && matchBets) {
      const userSports = [...new Set(userBets.map(b => b.sport))]
      const matchSports = [...new Set(matchBets.map(b => b.sport))]
      const common = userSports.filter(s => matchSports.includes(s))
      
      if (common.length > 0) {
        reasons.push(`Also bets ${common[0]}`)
      }
    }

    // Same favorite team
    if (match.favorite_team) {
      const { data: user } = await supabase
        .from('users')
        .select('favorite_team')
        .eq('id', userId)
        .single()
      
      if (user?.favorite_team === match.favorite_team) {
        reasons.push(`${match.favorite_team} fan`)
      }
    }

    return reasons.slice(0, 2) // Max 2 reasons
  }
}

export const friendDiscoveryService = new FriendDiscoveryService()
```

#### Step 4.2.2: Create Find Your Tribe Hook

```typescript
// hooks/useFriendDiscovery.ts
import { useState, useEffect } from 'react'
import { friendDiscoveryService } from '@/services/rag/friendDiscoveryService'

export function useFriendDiscovery() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRecommendations = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const recs = await friendDiscoveryService.findSimilarUsers(currentUser.id)
      setRecommendations(recs)
    } catch (err) {
      setError('Failed to load recommendations')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecommendations()
  }, [])

  return { recommendations, loading, error, refresh: loadRecommendations }
}
```

#### Step 4.2.3: Add to Search/Explore Page

```typescript
// app/(drawer)/(tabs)/search/index.tsx
import { useFriendDiscovery } from '@/hooks/useFriendDiscovery'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { UserCard } from '@/components/UserCard'

export default function SearchExplore() {
  const { recommendations, loading, refresh } = useFriendDiscovery()
  
  return (
    <ScrollView>
      {/* Existing search UI */}
      
      {/* Find Your Tribe Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎯 Find Your Tribe</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={styles.refreshButton}>Refresh</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {loading ? (
            <LoadingCards />
          ) : (
            recommendations.map((rec) => (
              <TribeUserCard
                key={rec.id}
                user={rec}
                similarity={Math.round(rec.similarity * 100)}
                reasons={rec.reasons}
              />
            ))
          )}
        </ScrollView>
      </View>
      
      {/* Rest of explore content */}
    </ScrollView>
  )
}

// Component for tribe recommendations
function TribeUserCard({ user, similarity, reasons }) {
  return (
    <View style={styles.tribeCard}>
      <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
      <Text style={styles.username}>{user.username}</Text>
      <Text style={styles.similarity}>{similarity}% match</Text>
      
      {reasons.map((reason, i) => (
        <Text key={i} style={styles.reason}>• {reason}</Text>
      ))}
      
      <FollowButton userId={user.id} style={styles.followButton} />
    </View>
  )
}
```

### Feature 3: Enhanced Feed (70/30 Mix)

#### Step 4.3.1: Create Smart Feed Service

```typescript
// services/rag/smartFeedService.ts
import { supabase } from '@/utils/supabase/client'

export class SmartFeedService {
  async getHybridFeed(userId: string, page: number = 0) {
    const pageSize = 20
    const followingRatio = 0.7
    const discoveryRatio = 0.3
    
    // Get user's following list
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)
    
    const followingIds = following?.map(f => f.following_id) || []
    
    // Get user's embedding for discovery
    const { data: user } = await supabase
      .from('users')
      .select('profile_embedding')
      .eq('id', userId)
      .single()
    
    // Calculate splits
    const followingCount = Math.floor(pageSize * followingRatio)
    const discoveryCount = Math.ceil(pageSize * discoveryRatio)
    
    // Get following posts
    const { data: followingPosts } = await supabase
      .from('posts')
      .select(`
        *,
        users!inner(id, username, display_name, avatar_url),
        bets(*)
      `)
      .in('user_id', [...followingIds, userId])
      .eq('archived', false)
      .order('created_at', { ascending: false })
      .range(page * followingCount, (page + 1) * followingCount - 1)
    
    // Get discovery posts if user has embedding
    let discoveryPosts = []
    if (user?.profile_embedding && followingIds.length > 0) {
      const { data: discovered } = await supabase
        .rpc('find_similar_posts', {
          user_embedding: user.profile_embedding,
          exclude_user_ids: [...followingIds, userId],
          limit_count: discoveryCount
        })
      
      if (discovered) {
        // Fetch full post data with relations
        const postIds = discovered.map(p => p.id)
        const { data: fullPosts } = await supabase
          .from('posts')
          .select(`
            *,
            users!inner(id, username, display_name, avatar_url),
            bets(*)
          `)
          .in('id', postIds)
        
        discoveryPosts = fullPosts || []
      }
    }
    
    // Mix posts (simple interleaving)
    const mixed = this.mixPosts(followingPosts || [], discoveryPosts, followingRatio)
    
    return {
      posts: mixed,
      hasMore: followingPosts?.length === followingCount
    }
  }
  
  private mixPosts(following: any[], discovery: any[], ratio: number) {
    const mixed = []
    let followingIndex = 0
    let discoveryIndex = 0
    
    while (followingIndex < following.length || discoveryIndex < discovery.length) {
      // Add following posts based on ratio
      const followingToAdd = Math.ceil(ratio * 3)
      for (let i = 0; i < followingToAdd && followingIndex < following.length; i++) {
        mixed.push({ ...following[followingIndex], isDiscovery: false })
        followingIndex++
      }
      
      // Add discovery post
      if (discoveryIndex < discovery.length) {
        mixed.push({ ...discovery[discoveryIndex], isDiscovery: true })
        discoveryIndex++
      }
    }
    
    return mixed
  }
}

export const smartFeedService = new SmartFeedService()
```

#### Step 4.3.2: Update Feed Component

```typescript
// components/feed/FeedList.tsx
import { smartFeedService } from '@/services/rag/smartFeedService'
import { PostCard } from './PostCard'

export function FeedList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  
  const loadFeed = async (pageNum: number = 0) => {
    try {
      const { posts: newPosts } = await smartFeedService.getHybridFeed(
        currentUser.id, 
        pageNum
      )
      
      if (pageNum === 0) {
        setPosts(newPosts)
      } else {
        setPosts(prev => [...prev, ...newPosts])
      }
    } catch (error) {
      console.error('Error loading feed:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadFeed(0)
  }, [])
  
  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => (
        <PostCard 
          post={item} 
          showFollowButton={item.isDiscovery}
          discoveryBadge={item.isDiscovery}
        />
      )}
      onEndReached={() => loadFeed(page + 1)}
      onEndReachedThreshold={0.5}
      refreshing={loading}
      onRefresh={() => loadFeed(0)}
    />
  )
}
```

#### Step 4.3.3: Update Post Card for Discovery Posts

```typescript
// components/feed/PostCard.tsx
export function PostCard({ post, showFollowButton, discoveryBadge }) {
  const [isFollowing, setIsFollowing] = useState(false)
  
  // Check if following (only for discovery posts)
  useEffect(() => {
    if (showFollowButton) {
      checkFollowing(post.user_id).then(setIsFollowing)
    }
  }, [post.user_id, showFollowButton])
  
  return (
    <View style={styles.card}>
      {/* User header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfo}>
          <Image source={{ uri: post.users.avatar_url }} style={styles.avatar} />
          <Text style={styles.username}>{post.users.username}</Text>
        </TouchableOpacity>
        
        {showFollowButton && !isFollowing && (
          <FollowButton 
            userId={post.user_id} 
            size="small"
            onFollow={() => setIsFollowing(true)}
          />
        )}
      </View>
      
      {discoveryBadge && (
        <View style={styles.discoveryBadge}>
          <Text style={styles.badgeText}>✨ Suggested</Text>
        </View>
      )}
      
      {/* Rest of post content */}
    </View>
  )
}
```

### Feature 4: Consensus Alerts

#### Step 4.4.1: Create Consensus Detection Service

```typescript
// services/rag/consensusService.ts
import { supabase } from '@/utils/supabase/client'

export class ConsensusService {
  async checkBetConsensus(bet: any, userId: string) {
    // Get user's following list
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)
    
    const followingIds = following?.map(f => f.following_id) || []
    
    if (followingIds.length === 0) return null
    
    // Check for consensus among followed users
    const { data: consensus } = await supabase
      .rpc('check_bet_consensus', {
        game_id: bet.game_id,
        team: bet.team,
        bet_type: bet.bet_type,
        user_id: userId,
        time_window: '1 hour'
      })
    
    if (!consensus?.[0] || consensus[0].bet_count < 3) return null
    
    // Get usernames of consensus bettors
    const consensusUserIds = consensus[0].user_ids.filter(id => 
      followingIds.includes(id)
    )
    
    if (consensusUserIds.length < 3) return null
    
    const { data: users } = await supabase
      .from('users')
      .select('username')
      .in('id', consensusUserIds)
      .limit(5)
    
    return {
      count: consensusUserIds.length,
      usernames: users?.map(u => u.username) || [],
      bet: {
        team: bet.team,
        type: bet.bet_type,
        odds: bet.odds
      }
    }
  }
  
  async createConsensusNotification(consensus: any, userId: string) {
    const userList = consensus.usernames.slice(0, 3).join(', ')
    const others = consensus.count > 3 ? ` and ${consensus.count - 3} others` : ''
    
    const message = `🔥 ${userList}${others} all took ${consensus.bet.team} ${consensus.bet.type}`
    
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'consensus_alert',
        message,
        data: consensus,
        created_at: new Date().toISOString()
      })
  }
}

export const consensusService = new ConsensusService()
```

#### Step 4.4.2: Add Consensus Check to Bet Placement

```typescript
// services/betting/bettingService.ts
import { consensusService } from '../rag/consensusService'

export async function placeBet(betData: any) {
  // Place the bet
  const { data: bet, error } = await supabase
    .from('bets')
    .insert(betData)
    .select()
    .single()
    
  if (error) throw error
  
  // Check for consensus asynchronously
  consensusService.checkBetConsensus(bet, bet.user_id)
    .then(consensus => {
      if (consensus) {
        // Get followers who might be interested
        return supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', bet.user_id)
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
                )
              }
            })
        })
      }
    })
    .catch(console.error)
  
  // Embed the bet
  embeddingPipeline.embedBet(bet.id, bet).catch(console.error)
  
  return bet
}
```

#### Step 4.4.3: Update Notification Display

```typescript
// components/notifications/NotificationItem.tsx
export function NotificationItem({ notification }) {
  if (notification.type === 'consensus_alert') {
    return (
      <TouchableOpacity style={styles.consensusNotification}>
        <View style={styles.iconContainer}>
          <Text style={styles.fireEmoji}>🔥</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.message}>{notification.message}</Text>
          
          {notification.data && (
            <TouchableOpacity style={styles.tailButton}>
              <Text style={styles.tailText}>
                Tail {notification.data.bet.team} {notification.data.bet.type}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.time}>
          {formatRelativeTime(notification.created_at)}
        </Text>
      </TouchableOpacity>
    )
  }
  
  // Handle other notification types
  return <RegularNotification notification={notification} />
}
```

---

## Phase 5: Profile Embedding Updates (Day 6)

### Step 5.1: Create Profile Update Job

```typescript
// supabase/functions/update-user-profiles/index.ts
import { createClient } from '@supabase/supabase-js'
import { embeddingPipeline } from './embeddingPipeline'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async () => {
  // Get users who need profile updates
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .or(`last_embedding_update.is.null,last_embedding_update.lt.${oneHourAgo}`)
    .limit(50)
  
  if (!users) return new Response('No users to update', { status: 200 })
  
  // Update each user's profile
  for (const user of users) {
    try {
      await embeddingPipeline.updateUserProfile(user.id)
      await new Promise(resolve => setTimeout(resolve, 100)) // Rate limit
    } catch (error) {
      console.error(`Failed to update user ${user.id}:`, error)
    }
  }
  
  return new Response(`Updated ${users.length} profiles`, { status: 200 })
})
```

### Step 5.2: Trigger Profile Updates on Activity

```typescript
// hooks/useBets.ts or wherever bets are placed
export function usePlaceBet() {
  const placeBet = async (betData: any) => {
    const bet = await bettingService.placeBet(betData)
    
    // Trigger profile update after placing bet
    setTimeout(() => {
      embeddingPipeline.updateUserProfile(currentUser.id)
        .catch(console.error)
    }, 5000) // Delay to avoid rate limits
    
    return bet
  }
  
  return { placeBet }
}
```

---

## Testing & Deployment

### Testing Checklist

1. **Database**
   - [ ] Verify pgvector extension is enabled
   - [ ] Test archive job (posts should be archived, not deleted)
   - [ ] Verify RPC functions return expected data

2. **Archive Filtering**
   - [ ] Feed only shows non-archived posts
   - [ ] Bet history only shows current week
   - [ ] Stories expire after 24 hours

3. **AI Features**
   - [ ] Caption generation produces relevant text
   - [ ] Find Your Tribe shows similar users
   - [ ] Enhanced feed mixes content properly
   - [ ] Consensus alerts trigger correctly

4. **Performance**
   - [ ] Embedding generation doesn't block UI
   - [ ] Feed loads smoothly with mixed content
   - [ ] Search/discover loads recommendations quickly

### Environment Variables

```bash
# .env.local or your environment file
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
EXPO_PUBLIC_SUPABASE_URL=https://...
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Deployment Steps

1. **Database Migration**
   - Run all SQL from Phase 1 in Supabase SQL Editor
   - Deploy edge functions for archiving and profile updates

2. **Update Codebase**
   - Add archive filtering to all queries
   - Deploy RAG services and hooks
   - Update UI components

3. **Schedule Jobs**
   - Archive content: Every hour
   - Update profiles: Every hour
   - Weekly resets: Sunday midnight

4. **Monitor**
   - OpenAI API usage and costs
   - Embedding generation success rate
   - User engagement with AI features

---

## Cost Optimization

- Use `text-embedding-3-small` model (cheaper, good quality)
- Batch embedding requests when possible
- Cache user profile embeddings for 24 hours
- Only embed posts with captions (skip empty ones)
- Monitor and set spending limits in OpenAI dashboard

---

## Future Enhancements

1. **Smarter Consensus Detection**
   - Detect inverse consensus (everyone fading)
   - Track consensus success rates
   - Notify when consensus bets settle

2. **Advanced Friend Discovery**
   - "Users who bet like you also follow..."
   - Team-specific tribes
   - Betting style clusters (conservative vs degen)

3. **Caption Learning**
   - Learn from user's editing patterns
   - A/B test generated vs manual captions
   - Personalize tone based on user history

4. **Feed Optimization**
   - Track engagement with discovery posts
   - Adjust 70/30 ratio based on user behavior
   - Time-based feed ranking (primetime games)

---

This implementation plan provides a complete roadmap for adding RAG capabilities to SnapBet while maintaining the ephemeral user experience. Remember to adapt file paths and implementation details based on your actual codebase structure.