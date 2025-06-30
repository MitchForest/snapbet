-- Store pre-computed user behavioral metrics
CREATE TABLE user_behavioral_metrics (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  top_teams JSONB DEFAULT '[]',
  avg_stake INTEGER DEFAULT 0,
  active_hours INTEGER[] DEFAULT '{}',
  favorite_sport TEXT,
  dominant_bet_type TEXT,
  stake_style TEXT,
  win_rate NUMERIC(3,2),
  total_bets INTEGER DEFAULT 0,
  betting_patterns JSONB DEFAULT '{}',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX idx_user_behavioral_metrics_updated ON user_behavioral_metrics(last_updated); 