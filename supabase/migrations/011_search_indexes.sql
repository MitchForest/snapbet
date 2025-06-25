-- Add indexes for search performance
CREATE INDEX IF NOT EXISTS idx_users_display_name_lower 
  ON users (LOWER(display_name));

-- Index for username search (already exists but let's ensure it's there)
CREATE INDEX IF NOT EXISTS idx_users_username_lower 
  ON users (LOWER(username));

-- Index for hot bettors query
CREATE INDEX IF NOT EXISTS idx_bets_settled_at_status 
  ON bets (settled_at, status) 
  WHERE settled_at IS NOT NULL;

-- Index for trending picks
CREATE INDEX IF NOT EXISTS idx_posts_created_at_type_tails 
  ON posts (created_at, post_type, tail_count) 
  WHERE post_type = 'pick' AND tail_count > 0;

-- Index for user creation date (rising stars)
CREATE INDEX IF NOT EXISTS idx_users_created_at 
  ON users (created_at);

-- Index for bankroll stats
CREATE INDEX IF NOT EXISTS idx_bankrolls_user_id 
  ON bankrolls (user_id);

-- Optimized index for hot bettors query (users with bets in last 7 days)
CREATE INDEX IF NOT EXISTS idx_bets_user_created_week 
  ON bets (user_id, created_at) 
  WHERE created_at > NOW() - INTERVAL '7 days';

-- Database function for optimized hot bettors query
CREATE OR REPLACE FUNCTION get_hot_bettors(limit_count INT DEFAULT 10)
RETURNS TABLE(
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  favorite_team TEXT,
  created_at TIMESTAMPTZ,
  weekly_wins INT,
  weekly_losses INT,
  weekly_bets INT,
  win_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH weekly_stats AS (
    SELECT 
      b.user_id,
      COUNT(CASE WHEN b.status = 'won' THEN 1 END) AS wins,
      COUNT(CASE WHEN b.status = 'lost' THEN 1 END) AS losses,
      COUNT(*) AS total_bets
    FROM bets b
    WHERE b.settled_at >= date_trunc('week', NOW())
      AND b.status IN ('won', 'lost')
    GROUP BY b.user_id
    HAVING COUNT(*) >= 5  -- MIN_BETS_FOR_HOT
  )
  SELECT 
    u.id,
    u.username,
    u.display_name,
    u.avatar_url,
    u.bio,
    u.favorite_team,
    u.created_at,
    ws.wins::INT,
    ws.losses::INT,
    ws.total_bets::INT,
    ROUND((ws.wins::NUMERIC / ws.total_bets::NUMERIC), 3) AS win_rate
  FROM users u
  INNER JOIN weekly_stats ws ON u.id = ws.user_id
  WHERE u.deleted_at IS NULL
  ORDER BY win_rate DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql; 