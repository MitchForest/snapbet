-- Migration 035: Remove ALL team preference columns for pure behavioral AI
-- This migration removes both favorite_team and favorite_teams columns
-- to ensure team preferences are discovered dynamically from user behavior

ALTER TABLE users DROP COLUMN IF EXISTS favorite_team;
ALTER TABLE users DROP COLUMN IF EXISTS favorite_teams;

-- Add index for faster embedding queries if not exists
CREATE INDEX IF NOT EXISTS idx_users_last_embedding_update 
ON users(last_embedding_update) 
WHERE profile_embedding IS NOT NULL; 