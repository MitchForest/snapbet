-- Rollback Migration: Remove RAG support
-- Sprint: 8.01 - Database Infrastructure
-- Date: 2024-12-29
-- Description: Rollback script to reverse all changes from 033_add_rag_support.sql

BEGIN;

-- =====================================================
-- Section 1: Drop indexes (reverse order)
-- =====================================================
DROP INDEX IF EXISTS idx_embedding_metadata_entity;
DROP INDEX IF EXISTS idx_stories_archived;
DROP INDEX IF EXISTS idx_bets_archived;
DROP INDEX IF EXISTS idx_posts_archived;
DROP INDEX IF EXISTS idx_users_embedding;
DROP INDEX IF EXISTS idx_bets_embedding;
DROP INDEX IF EXISTS idx_posts_embedding;

-- =====================================================
-- Section 2: Drop RPC functions
-- =====================================================
DROP FUNCTION IF EXISTS check_bet_consensus(uuid, jsonb, uuid, interval);
DROP FUNCTION IF EXISTS find_similar_posts(vector, uuid, uuid[], interval, int);
DROP FUNCTION IF EXISTS find_similar_users(vector, uuid, int);

-- =====================================================
-- Section 3: Drop policies and table
-- =====================================================
DROP POLICY IF EXISTS "Service role can manage embeddings" ON embedding_metadata;
DROP POLICY IF EXISTS "Users can view own embedding metadata" ON embedding_metadata;
DROP TABLE IF EXISTS embedding_metadata;

-- =====================================================
-- Section 4: Remove embedding columns
-- =====================================================
ALTER TABLE users DROP COLUMN IF EXISTS favorite_teams;
ALTER TABLE users DROP COLUMN IF EXISTS last_embedding_update;
ALTER TABLE users DROP COLUMN IF EXISTS profile_embedding;
ALTER TABLE bets DROP COLUMN IF EXISTS embedding;
ALTER TABLE posts DROP COLUMN IF EXISTS embedding;

-- =====================================================
-- Section 5: Remove archive columns
-- =====================================================
ALTER TABLE pick_actions DROP COLUMN IF EXISTS archived;
ALTER TABLE reactions DROP COLUMN IF EXISTS archived;
ALTER TABLE messages DROP COLUMN IF EXISTS archived;
ALTER TABLE stories DROP COLUMN IF EXISTS archived;
ALTER TABLE bets DROP COLUMN IF EXISTS archived;
ALTER TABLE posts DROP COLUMN IF EXISTS archived;

-- =====================================================
-- Section 6: Remove pgvector extension
-- =====================================================
-- Note: Only drop if no other tables are using vector type
DROP EXTENSION IF EXISTS vector CASCADE;

COMMIT;

-- Note: This rollback will permanently delete any embeddings that were generated.
-- Comments on columns are automatically removed when columns are dropped. 