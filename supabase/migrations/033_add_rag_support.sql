-- Migration: Add RAG (Retrieval-Augmented Generation) support
-- Sprint: 8.01 - Database Infrastructure
-- Date: 2024-12-29
-- Description: Enable pgvector, add archive columns, embedding storage, and vector search functions

BEGIN;

-- =====================================================
-- Section 1: Enable pgvector extension
-- =====================================================
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- Section 2: Add archive columns for ephemeral content
-- =====================================================
-- Archive columns default to false for backward compatibility
ALTER TABLE posts ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE bets ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE reactions ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE pick_actions ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Checkpoint after archive columns
SAVEPOINT archive_columns_done;

-- =====================================================
-- Section 3: Add embedding columns
-- =====================================================
-- Embeddings for content similarity search
ALTER TABLE posts ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE bets ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- User profile embeddings for Find Your Tribe feature
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_embedding vector(1536);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_embedding_update TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_teams TEXT[];

-- Checkpoint after embedding columns
SAVEPOINT embedding_columns_done;

-- =====================================================
-- Section 4: Create embedding metadata table
-- =====================================================
CREATE TABLE IF NOT EXISTS embedding_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('post', 'bet', 'user')),
  entity_id UUID NOT NULL,
  model_version TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  token_count INTEGER,
  UNIQUE(entity_type, entity_id)
);

-- Enable RLS on embedding_metadata
ALTER TABLE embedding_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies for embedding_metadata
CREATE POLICY "Users can view own embedding metadata" 
ON embedding_metadata
FOR SELECT USING (
  auth.uid() = entity_id AND entity_type = 'user'
);

CREATE POLICY "Service role can manage embeddings" 
ON embedding_metadata
FOR ALL USING (
  auth.jwt()->>'role' = 'service_role'
);

-- Checkpoint after metadata table
SAVEPOINT metadata_table_done;

-- =====================================================
-- Section 5: Create vector search RPC functions
-- =====================================================

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
    COALESCE(u.is_verified, false) as is_verified,
    1 - (u.profile_embedding <=> query_embedding) as similarity,
    CASE 
      WHEN b.win_count + b.loss_count > 0 
      THEN ROUND((b.win_count::numeric / (b.win_count + b.loss_count)) * 100, 2)
      ELSE 0
    END as win_rate,
    b.win_count + b.loss_count as total_bets,
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
  content text,
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
    p.caption as content,
    p.post_type as type,
    p.created_at,
    p.expires_at,
    0 as view_count,  -- posts don't have view_count
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

-- Checkpoint after functions
SAVEPOINT functions_done;

-- =====================================================
-- Section 6: Create performance indexes
-- =====================================================

-- Vector similarity search indexes (using ivfflat)
CREATE INDEX IF NOT EXISTS idx_posts_embedding 
ON posts USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100)
WHERE archived = true;

CREATE INDEX IF NOT EXISTS idx_bets_embedding 
ON bets USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100) 
WHERE archived = true;

CREATE INDEX IF NOT EXISTS idx_users_embedding 
ON users USING ivfflat (profile_embedding vector_cosine_ops)
WITH (lists = 100);

-- Archive filtering indexes for high-traffic tables
CREATE INDEX IF NOT EXISTS idx_posts_archived 
ON posts(archived) 
WHERE archived = false;

CREATE INDEX IF NOT EXISTS idx_bets_archived 
ON bets(archived) 
WHERE archived = false;

CREATE INDEX IF NOT EXISTS idx_stories_archived 
ON stories(archived) 
WHERE archived = false;

-- Embedding metadata indexes
CREATE INDEX IF NOT EXISTS idx_embedding_metadata_entity 
ON embedding_metadata(entity_type, entity_id);

-- Checkpoint after indexes
SAVEPOINT indexes_done;

-- =====================================================
-- Section 7: Add documentation
-- =====================================================

-- Document notification types
COMMENT ON COLUMN notifications.type IS 'Valid types: follow, comment, reaction, bet_won, bet_lost, milestone, tail, fade, consensus_alert';

-- Document embedding metadata structure
COMMENT ON TABLE embedding_metadata IS 'Tracks embedding generation for posts, bets, and user profiles. Used for AI features and similarity search.';

-- Document archive columns
COMMENT ON COLUMN posts.archived IS 'True when post has expired but is kept for AI training/similarity search';
COMMENT ON COLUMN bets.archived IS 'True for bets older than 1 week, kept for historical analysis';
COMMENT ON COLUMN stories.archived IS 'True when story has expired, kept for user history';

-- Document vector columns
COMMENT ON COLUMN posts.embedding IS 'OpenAI text-embedding-3-small vector for similarity search';
COMMENT ON COLUMN users.profile_embedding IS 'Aggregated embedding from user activity for Find Your Tribe feature';

COMMIT; 