-- Migration: Add badge system tables and stats metadata
-- Sprint: 02.03 - Team Selection & Follow Initialization
-- Date: 2024-12-20

-- Add stats_metadata field to bankrolls for badge tracking
ALTER TABLE bankrolls 
ADD COLUMN IF NOT EXISTS stats_metadata JSONB DEFAULT '{}';

-- Create badge tracking tables
CREATE TABLE IF NOT EXISTS user_badges (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  lost_at TIMESTAMPTZ, -- NULL if currently active
  PRIMARY KEY (user_id, badge_id, earned_at)
);

CREATE TABLE IF NOT EXISTS user_stats_display (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  primary_stat TEXT NOT NULL DEFAULT 'record',
  show_badge BOOLEAN DEFAULT true,
  selected_badge TEXT, -- NULL means auto-select highest priority
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_badges_active 
  ON user_badges(user_id) 
  WHERE lost_at IS NULL;

-- Add follower count view for badge calculation
CREATE OR REPLACE VIEW user_follower_counts AS
SELECT 
  following_id as user_id,
  COUNT(*) as follower_count
FROM follows
GROUP BY following_id;

-- Add update trigger for user_stats_display
CREATE TRIGGER update_user_stats_display_updated_at 
BEFORE UPDATE ON user_stats_display
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for new tables
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats_display ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_badges
CREATE POLICY user_badges_select ON user_badges FOR SELECT TO authenticated
  USING (true); -- Anyone can see badges

CREATE POLICY user_badges_insert ON user_badges FOR INSERT TO authenticated
  WITH CHECK (false); -- Only system can insert badges

CREATE POLICY user_badges_update ON user_badges FOR UPDATE TO authenticated
  USING (false); -- Only system can update badges

-- RLS Policies for user_stats_display
CREATE POLICY user_stats_display_select ON user_stats_display FOR SELECT TO authenticated
  USING (true); -- Anyone can see stats display preferences

CREATE POLICY user_stats_display_insert ON user_stats_display FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()); -- Users can only insert their own

CREATE POLICY user_stats_display_update ON user_stats_display FOR UPDATE TO authenticated
  USING (user_id = auth.uid()); -- Users can only update their own

-- Comment on the stats_metadata structure
COMMENT ON COLUMN bankrolls.stats_metadata IS 'JSON structure: {
  perfect_days: string[],
  team_bet_counts: Record<string, number>,
  fade_profit_generated: number,
  daily_records: Record<string, { wins: number, losses: number, date: string }>,
  current_streak: number,
  best_streak: number,
  last_bet_date?: string
}'; 