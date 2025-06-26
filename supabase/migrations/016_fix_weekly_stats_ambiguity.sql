-- Migration: Fix ambiguous user_id in get_user_weekly_stats function
-- Date: 2025-01-26
-- Description: Fixes the ambiguous column reference error in weekly stats calculation

-- Drop and recreate the function with proper table aliases
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
    FROM posts p
    WHERE p.user_id = p_user_id
      AND p.post_type = 'pick'
      AND p.created_at >= p_week_start
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_weekly_stats(UUID, DATE) TO authenticated; 