-- Migration: Weekly Badge System
-- Sprint: 03.00 - Profile & Badge Catchup
-- Date: 2025-01-26
-- Description: Implements 8 weekly badges with automatic Monday resets

-- Add columns to track weekly badges
ALTER TABLE user_badges 
ADD COLUMN week_start_date DATE,
ADD COLUMN weekly_reset_at TIMESTAMPTZ;

-- Create function to get the start of the current week (Monday)
CREATE OR REPLACE FUNCTION get_week_start(input_date TIMESTAMPTZ DEFAULT NOW())
RETURNS DATE AS $$
BEGIN
  -- Return the Monday of the week for the given date
  -- PostgreSQL: 1 = Monday, 7 = Sunday
  RETURN DATE_TRUNC('week', input_date)::DATE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to get the end of the current week (Sunday 23:59:59)
CREATE OR REPLACE FUNCTION get_week_end(input_date TIMESTAMPTZ DEFAULT NOW())
RETURNS TIMESTAMPTZ AS $$
BEGIN
  -- Return Sunday 23:59:59 of the week
  RETURN DATE_TRUNC('week', input_date) + INTERVAL '6 days 23 hours 59 minutes 59 seconds';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to calculate weekly stats for a user
CREATE OR REPLACE FUNCTION get_user_weekly_stats(
  p_user_id UUID,
  p_week_start DATE DEFAULT get_week_start()
)
RETURNS TABLE (
  user_id UUID,
  week_start DATE,
  total_bets INTEGER,
  wins INTEGER,
  losses INTEGER,
  win_rate NUMERIC,
  total_wagered INTEGER,
  total_won INTEGER,
  profit INTEGER,
  current_streak INTEGER,
  picks_posted INTEGER,
  days_since_last_post INTEGER,
  tail_profit_generated INTEGER,
  fade_profit_generated INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH weekly_bets AS (
    SELECT 
      b.*
    FROM bets b
    WHERE b.user_id = p_user_id
      AND b.created_at >= p_week_start
      AND b.created_at < p_week_start + INTERVAL '7 days'
  ),
  bet_stats AS (
    SELECT 
      COUNT(*) AS total_bets,
      COUNT(*) FILTER (WHERE status = 'won') AS wins,
      COUNT(*) FILTER (WHERE status = 'lost') AS losses,
      COALESCE(SUM(stake), 0) AS total_wagered,
      COALESCE(SUM(actual_win), 0) AS total_won,
      COALESCE(SUM(actual_win) - SUM(stake), 0) AS profit
    FROM weekly_bets
  ),
  streak_calc AS (
    -- Calculate current streak (consecutive wins from most recent bet)
    SELECT 
      COUNT(*) AS current_streak
    FROM (
      SELECT 
        status,
        ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
      FROM weekly_bets
      WHERE status IN ('won', 'lost')
    ) recent_bets
    WHERE status = 'won' 
      AND rn <= ALL (
        SELECT rn FROM (
          SELECT 
            status,
            ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
          FROM weekly_bets
          WHERE status IN ('won', 'lost')
        ) rb WHERE rb.status = 'lost'
      )
  ),
  post_stats AS (
    SELECT 
      COUNT(*) AS picks_posted,
      EXTRACT(DAY FROM NOW() - MAX(created_at))::INTEGER AS days_since_last
    FROM posts
    WHERE user_id = p_user_id
      AND post_type = 'pick'
      AND created_at >= p_week_start
  ),
  tail_fade_stats AS (
    -- Calculate profit generated from others tailing/fading
    SELECT 
      COALESCE(SUM(CASE 
        WHEN pa.action_type = 'tail' AND b.status = 'won' THEN b.actual_win - b.stake
        WHEN pa.action_type = 'tail' AND b.status = 'lost' THEN -b.stake
        ELSE 0
      END), 0) AS tail_profit,
      COALESCE(SUM(CASE 
        WHEN pa.action_type = 'fade' AND b.status = 'lost' THEN b.actual_win - b.stake
        WHEN pa.action_type = 'fade' AND b.status = 'won' THEN -b.stake
        ELSE 0
      END), 0) AS fade_profit
    FROM posts p
    JOIN pick_actions pa ON p.id = pa.post_id
    JOIN bets b ON pa.resulting_bet_id = b.id
    WHERE p.user_id = p_user_id
      AND p.created_at >= p_week_start
      AND b.status IN ('won', 'lost')
  )
  SELECT 
    p_user_id,
    p_week_start,
    bs.total_bets::INTEGER,
    bs.wins::INTEGER,
    bs.losses::INTEGER,
    CASE 
      WHEN bs.total_bets > 0 THEN ROUND(bs.wins::NUMERIC / NULLIF(bs.wins + bs.losses, 0) * 100, 2)
      ELSE 0
    END AS win_rate,
    bs.total_wagered::INTEGER,
    bs.total_won::INTEGER,
    bs.profit::INTEGER,
    COALESCE(sc.current_streak, 0)::INTEGER,
    COALESCE(ps.picks_posted, 0)::INTEGER,
    COALESCE(ps.days_since_last, 999)::INTEGER,
    COALESCE(tfs.tail_profit, 0)::INTEGER,
    COALESCE(tfs.fade_profit, 0)::INTEGER
  FROM bet_stats bs
  CROSS JOIN streak_calc sc
  CROSS JOIN post_stats ps
  CROSS JOIN tail_fade_stats tfs;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if user had perfect NFL Sunday
CREATE OR REPLACE FUNCTION check_perfect_nfl_sunday(
  p_user_id UUID,
  p_week_start DATE DEFAULT get_week_start()
)
RETURNS BOOLEAN AS $$
DECLARE
  sunday_date DATE;
  nfl_bet_count INTEGER;
  nfl_win_count INTEGER;
BEGIN
  -- Get the Sunday of the week
  sunday_date := p_week_start + INTERVAL '6 days';
  
  -- Count NFL bets and wins on Sunday
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE b.status = 'won')
  INTO nfl_bet_count, nfl_win_count
  FROM bets b
  JOIN games g ON b.game_id = g.id
  WHERE b.user_id = p_user_id
    AND g.sport = 'americanfootball_nfl'
    AND DATE(b.created_at) = sunday_date
    AND b.status IN ('won', 'lost');
  
  -- Perfect Sunday means at least 3 NFL bets and all won
  RETURN nfl_bet_count >= 3 AND nfl_bet_count = nfl_win_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get the weekly profit leader
CREATE OR REPLACE FUNCTION get_weekly_profit_leader(p_week_start DATE DEFAULT get_week_start())
RETURNS UUID AS $$
DECLARE
  leader_id UUID;
BEGIN
  SELECT user_id INTO leader_id
  FROM (
    SELECT 
      b.user_id,
      SUM(b.actual_win - b.stake) as weekly_profit
    FROM bets b
    WHERE b.created_at >= p_week_start
      AND b.created_at < p_week_start + INTERVAL '7 days'
      AND b.status IN ('won', 'lost')
    GROUP BY b.user_id
    ORDER BY weekly_profit DESC
    LIMIT 1
  ) profit_leaders;
  
  RETURN leader_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_badges_weekly 
  ON user_badges(user_id, week_start_date) 
  WHERE lost_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_bets_weekly_stats
  ON bets(user_id, created_at, status)
  WHERE status IN ('won', 'lost');

CREATE INDEX IF NOT EXISTS idx_posts_weekly_picks
  ON posts(user_id, created_at)
  WHERE post_type = 'pick';

-- Add comment explaining the weekly badge system
COMMENT ON COLUMN user_badges.week_start_date IS 'The Monday of the week when this badge was earned';
COMMENT ON COLUMN user_badges.weekly_reset_at IS 'Timestamp when this weekly badge will expire (following Monday at midnight)';

-- Function to reset all weekly badges (to be called every Monday)
CREATE OR REPLACE FUNCTION reset_weekly_badges()
RETURNS void AS $$
BEGIN
  -- Mark all active weekly badges as lost
  UPDATE user_badges
  SET lost_at = NOW()
  WHERE lost_at IS NULL
    AND week_start_date IS NOT NULL
    AND week_start_date < get_week_start();
  
  -- Log the reset
  RAISE NOTICE 'Weekly badges reset at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_week_start(TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION get_week_end(TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_weekly_stats(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION check_perfect_nfl_sunday(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_profit_leader(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_weekly_badges() TO service_role; 