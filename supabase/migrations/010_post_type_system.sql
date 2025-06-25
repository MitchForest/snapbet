-- Migration: Add post type system and comments table
-- Description: Implements infrastructure for three post types (content, pick, outcome) and comments

-- Add missing columns to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS post_type text DEFAULT 'content' CHECK (post_type IN ('content', 'pick', 'outcome')),
ADD COLUMN IF NOT EXISTS effect_id text,
ADD COLUMN IF NOT EXISTS comment_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS settled_bet_id uuid REFERENCES bets(id);

-- Create indexes for post queries
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_settled_bet_id ON posts(settled_bet_id);
CREATE INDEX IF NOT EXISTS idx_posts_effect_id ON posts(effect_id);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Add indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments(deleted_at) WHERE deleted_at IS NULL;

-- Add story_content_type to stories table
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS story_content_type text DEFAULT 'content' CHECK (story_content_type IN ('content', 'pick', 'outcome'));

-- Update existing posts to have 'content' type (safe operation)
UPDATE posts SET post_type = 'content' WHERE post_type IS NULL;

-- Enable RLS on comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for comments
CREATE POLICY "Users can view all comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Create a helper function to increment counters (used for comment_count)
CREATE OR REPLACE FUNCTION increment_counter(
  table_name text,
  column_name text,
  row_id uuid
) RETURNS void AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I SET %I = COALESCE(%I, 0) + 1 WHERE id = $1',
    table_name,
    column_name,
    column_name
  ) USING row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update comment count when comments are added/removed
CREATE OR REPLACE FUNCTION update_post_comment_count() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = COALESCE(comment_count, 0) + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0) WHERE id = OLD.post_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle soft deletes
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      -- Comment was soft deleted
      UPDATE posts SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0) WHERE id = NEW.post_id;
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      -- Comment was restored
      UPDATE posts SET comment_count = COALESCE(comment_count, 0) + 1 WHERE id = NEW.post_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment count updates
DROP TRIGGER IF EXISTS update_post_comment_count_trigger ON comments;
CREATE TRIGGER update_post_comment_count_trigger
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comment_count();

-- Add comment to track migration
COMMENT ON COLUMN posts.post_type IS 'Type of post: content (default), pick (bet share), or outcome (result share)';
COMMENT ON COLUMN posts.effect_id IS 'ID of the emoji effect applied to this post';
COMMENT ON COLUMN posts.comment_count IS 'Cached count of comments on this post';
COMMENT ON COLUMN posts.settled_bet_id IS 'Reference to settled bet for outcome posts';
COMMENT ON TABLE comments IS 'User comments on posts';
COMMENT ON COLUMN stories.story_content_type IS 'Type of story content: content, pick, or outcome'; 