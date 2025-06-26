-- Migration: Add content moderation system
-- Sprint: 04.07 - Content Moderation
-- Date: 2025-01-10

-- Create blocked_users table
CREATE TABLE blocked_users (
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(blocker_id, blocked_id)
);

CREATE INDEX idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON blocked_users(blocked_id);

-- Create reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'story', 'user', 'comment')),
  content_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'harassment', 'other')),
  additional_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  action_taken TEXT CHECK (action_taken IN ('dismissed', 'content_removed', 'user_warned', 'user_banned'))
);

CREATE INDEX idx_reports_content ON reports(content_type, content_id);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_unreviewed ON reports(created_at DESC) WHERE reviewed_at IS NULL;

-- Add unique constraint to prevent duplicate reports
CREATE UNIQUE INDEX idx_reports_unique_per_user ON reports(reporter_id, content_type, content_id);

-- Add report_count to posts table
ALTER TABLE posts ADD COLUMN report_count INTEGER DEFAULT 0;
ALTER TABLE stories ADD COLUMN report_count INTEGER DEFAULT 0;
ALTER TABLE comments ADD COLUMN report_count INTEGER DEFAULT 0;

-- Function to check if users are blocked (bidirectional)
CREATE OR REPLACE FUNCTION users_blocked(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_users 
    WHERE (blocker_id = user1_id AND blocked_id = user2_id)
       OR (blocker_id = user2_id AND blocked_id = user1_id)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get all blocked user IDs for a user (for bulk filtering)
CREATE OR REPLACE FUNCTION get_blocked_user_ids(p_user_id UUID)
RETURNS TABLE(blocked_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT b.blocked_id 
  FROM blocked_users b 
  WHERE b.blocker_id = p_user_id
  UNION
  SELECT b.blocker_id 
  FROM blocked_users b 
  WHERE b.blocked_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update report counts (counts unique reporters)
CREATE OR REPLACE FUNCTION increment_report_count()
RETURNS TRIGGER AS $$
DECLARE
  v_unique_reporters INTEGER;
BEGIN
  -- Count unique reporters for this content
  SELECT COUNT(DISTINCT reporter_id) INTO v_unique_reporters
  FROM reports
  WHERE content_type = NEW.content_type 
    AND content_id = NEW.content_id;
  
  -- Update the appropriate table with unique reporter count
  CASE NEW.content_type
    WHEN 'post' THEN
      UPDATE posts SET report_count = v_unique_reporters WHERE id = NEW.content_id;
    WHEN 'story' THEN
      UPDATE stories SET report_count = v_unique_reporters WHERE id = NEW.content_id;
    WHEN 'comment' THEN
      UPDATE comments SET report_count = v_unique_reporters WHERE id = NEW.content_id;
  END CASE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_report_count
AFTER INSERT ON reports
FOR EACH ROW EXECUTE FUNCTION increment_report_count();

-- Also trigger on delete to handle report removals
CREATE OR REPLACE FUNCTION decrement_report_count()
RETURNS TRIGGER AS $$
DECLARE
  v_unique_reporters INTEGER;
BEGIN
  -- Recount unique reporters after deletion
  SELECT COUNT(DISTINCT reporter_id) INTO v_unique_reporters
  FROM reports
  WHERE content_type = OLD.content_type 
    AND content_id = OLD.content_id;
  
  -- Update the appropriate table
  CASE OLD.content_type
    WHEN 'post' THEN
      UPDATE posts SET report_count = v_unique_reporters WHERE id = OLD.content_id;
    WHEN 'story' THEN
      UPDATE stories SET report_count = v_unique_reporters WHERE id = OLD.content_id;
    WHEN 'comment' THEN
      UPDATE comments SET report_count = v_unique_reporters WHERE id = OLD.content_id;
  END CASE;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_report_count
AFTER DELETE ON reports
FOR EACH ROW EXECUTE FUNCTION decrement_report_count();

-- Enable RLS
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blocked_users
-- Users can only view their own blocks
CREATE POLICY "Users can view their blocks" ON blocked_users
  FOR SELECT USING (auth.uid() = blocker_id);

-- Users can create blocks
CREATE POLICY "Users can create blocks" ON blocked_users
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

-- Users can remove their own blocks
CREATE POLICY "Users can remove blocks" ON blocked_users
  FOR DELETE USING (auth.uid() = blocker_id);

-- RLS Policies for reports
-- Users can create reports (but not for their own content)
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (
    auth.uid() = reporter_id AND
    NOT (
      (content_type = 'user' AND content_id = auth.uid()) OR
      (content_type IN ('post', 'story', 'comment') AND EXISTS (
        SELECT 1 FROM posts WHERE id = content_id AND user_id = auth.uid()
        UNION
        SELECT 1 FROM stories WHERE id = content_id AND user_id = auth.uid()
        UNION
        SELECT 1 FROM comments WHERE id = content_id AND user_id = auth.uid()
      ))
    )
  );

-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role full access" ON reports
  FOR ALL TO service_role USING (true);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION users_blocked(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_blocked_user_ids(UUID) TO authenticated;

-- Add indexes for performance on content filtering
CREATE INDEX idx_posts_report_count ON posts(report_count) WHERE report_count > 0;
CREATE INDEX idx_stories_report_count ON stories(report_count) WHERE report_count > 0;
CREATE INDEX idx_comments_report_count ON comments(report_count) WHERE report_count > 0;

-- Comment on tables
COMMENT ON TABLE blocked_users IS 'Stores bidirectional user blocks for content moderation';
COMMENT ON TABLE reports IS 'Stores user reports for content moderation with auto-hide at 3 unique reports';
COMMENT ON COLUMN reports.action_taken IS 'Admin action taken on the report: dismissed, content_removed, user_warned, user_banned'; 