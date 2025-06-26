-- Migration: Add story support to reactions table
-- This allows reactions on both posts and stories using the same table

-- Add story_id column to reactions table
ALTER TABLE reactions ADD COLUMN story_id UUID REFERENCES stories(id) ON DELETE CASCADE;

-- Create index for story reactions
CREATE INDEX idx_reactions_story ON reactions(story_id) WHERE story_id IS NOT NULL;

-- Drop existing constraint if it exists
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_content_check;

-- Add constraint to ensure either post_id OR story_id is set (not both, not neither)
ALTER TABLE reactions ADD CONSTRAINT reactions_content_check 
  CHECK ((post_id IS NOT NULL AND story_id IS NULL) OR (post_id IS NULL AND story_id IS NOT NULL));

-- Update the unique constraint to include story_id
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_user_id_post_id_key;
ALTER TABLE reactions ADD CONSTRAINT reactions_unique_per_content 
  UNIQUE NULLS NOT DISTINCT (user_id, post_id, story_id); 