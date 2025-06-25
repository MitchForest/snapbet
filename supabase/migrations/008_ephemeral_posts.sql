-- Migration: Make all posts ephemeral with different expiration times
-- This migration adds post_type and adjusts expiration logic

-- Add post_type column to posts table
ALTER TABLE posts 
ADD COLUMN post_type TEXT NOT NULL DEFAULT 'content' 
CHECK (post_type IN ('content', 'pick', 'outcome'));

-- Add effect_id column for emoji effects
ALTER TABLE posts 
ADD COLUMN effect_id TEXT;

-- Add comment_count column
ALTER TABLE posts 
ADD COLUMN comment_count INTEGER DEFAULT 0 CHECK (comment_count >= 0);

-- Add settled_bet_id for outcome posts
ALTER TABLE posts 
ADD COLUMN settled_bet_id UUID REFERENCES bets(id);

-- Add constraint to ensure proper bet associations
ALTER TABLE posts 
ADD CONSTRAINT posts_bet_requirement CHECK (
  (post_type = 'pick' AND bet_id IS NOT NULL) OR
  (post_type = 'outcome' AND settled_bet_id IS NOT NULL) OR
  (post_type = 'content' AND bet_id IS NULL AND settled_bet_id IS NULL)
);

-- Create comments table
CREATE TABLE comments (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL CHECK (char_length(content) <= 280),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Indexes for comments
CREATE INDEX idx_comments_post ON comments(post_id, created_at);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);

-- Trigger to update comment count
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts
    SET comment_count = comment_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts
    SET comment_count = GREATEST(comment_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_count_trigger
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- Update existing posts to have proper post_type
-- (In production, you'd need to analyze existing data to set correct types)
UPDATE posts 
SET post_type = CASE 
  WHEN bet_id IS NOT NULL THEN 'pick'
  ELSE 'content'
END;

-- Drop the default after migration
ALTER TABLE posts ALTER COLUMN post_type DROP DEFAULT;

-- Add new indexes for post types
CREATE INDEX idx_posts_type ON posts(post_type);
CREATE INDEX idx_posts_pick ON posts(post_type, created_at DESC) 
WHERE post_type = 'pick' AND deleted_at IS NULL;

-- Update the create_post function (defined in database.md)
-- This function handles the different expiration times based on post type 