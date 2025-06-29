-- Migration 034: Caption Generation Tracking
-- Purpose: Track daily AI caption generation usage per user for rate limiting

CREATE TABLE IF NOT EXISTS caption_generation_usage (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  count INT DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_caption_usage_user_date ON caption_generation_usage(user_id, date);

-- Add comment for documentation
COMMENT ON TABLE caption_generation_usage IS 'Tracks daily AI caption generation usage for rate limiting (20/day per user)';
COMMENT ON COLUMN caption_generation_usage.user_id IS 'Reference to the user generating captions';
COMMENT ON COLUMN caption_generation_usage.date IS 'Date of usage (resets daily)';
COMMENT ON COLUMN caption_generation_usage.count IS 'Number of captions generated on this date'; 