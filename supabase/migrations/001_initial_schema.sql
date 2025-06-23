-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Create custom types
CREATE TYPE oauth_provider AS ENUM ('google', 'twitter');
CREATE TYPE bet_type AS ENUM ('spread', 'total', 'moneyline');
CREATE TYPE bet_status AS ENUM ('pending', 'won', 'lost', 'push', 'cancelled');
CREATE TYPE game_status AS ENUM ('scheduled', 'live', 'completed', 'cancelled');
CREATE TYPE media_type AS ENUM ('photo', 'video');
CREATE TYPE story_type AS ENUM ('manual', 'auto_milestone', 'auto_recap');
CREATE TYPE chat_type AS ENUM ('dm', 'group');
CREATE TYPE chat_role AS ENUM ('admin', 'member');
CREATE TYPE pick_action AS ENUM ('tail', 'fade');

-- Users table
CREATE TABLE users (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- OAuth Information
  email TEXT UNIQUE NOT NULL,
  oauth_provider oauth_provider NOT NULL,
  oauth_id TEXT NOT NULL,
  
  -- Profile Information
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT CHECK (char_length(bio) <= 140),
  favorite_team TEXT,
  
  -- Mock user fields (from mock.md)
  is_mock BOOLEAN DEFAULT FALSE,
  mock_personality_id TEXT,
  mock_behavior_seed INTEGER,
  
  -- Settings
  notification_settings JSONB DEFAULT '{"tails": true, "messages": true, "wins": true}'::jsonb,
  privacy_settings JSONB DEFAULT '{"public_picks": true, "show_bankroll": true}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT users_username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$'),
  CONSTRAINT users_oauth_unique UNIQUE (oauth_provider, oauth_id)
);

-- Indexes for users
CREATE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created ON users(created_at DESC);
CREATE INDEX idx_users_is_mock ON users(is_mock);
CREATE INDEX idx_users_personality ON users(mock_personality_id) WHERE is_mock = TRUE;

-- Bankrolls table
CREATE TABLE bankrolls (
  -- Primary Key (1:1 with users)
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Balance Information
  balance INTEGER NOT NULL DEFAULT 100000 CHECK (balance >= 0), -- In cents ($1000.00)
  total_wagered INTEGER NOT NULL DEFAULT 0 CHECK (total_wagered >= 0),
  total_won INTEGER NOT NULL DEFAULT 0 CHECK (total_won >= 0),
  
  -- Statistics
  win_count INTEGER NOT NULL DEFAULT 0 CHECK (win_count >= 0),
  loss_count INTEGER NOT NULL DEFAULT 0 CHECK (loss_count >= 0),
  push_count INTEGER NOT NULL DEFAULT 0 CHECK (push_count >= 0),
  biggest_win INTEGER DEFAULT 0,
  biggest_loss INTEGER DEFAULT 0,
  season_high INTEGER DEFAULT 100000,
  season_low INTEGER DEFAULT 100000,
  
  -- Metadata
  last_reset TIMESTAMPTZ DEFAULT NOW(),
  reset_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for bankrolls
CREATE INDEX idx_bankrolls_balance ON bankrolls(balance);
CREATE INDEX idx_bankrolls_updated ON bankrolls(updated_at DESC);

-- Games table
CREATE TABLE games (
  -- Primary Key
  id TEXT PRIMARY KEY, -- From external API
  
  -- Game Information
  sport TEXT NOT NULL,
  sport_title TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  commence_time TIMESTAMPTZ NOT NULL,
  
  -- Odds Data (snapshot from API)
  odds_data JSONB,
  
  -- Results
  home_score INTEGER,
  away_score INTEGER,
  status game_status DEFAULT 'scheduled',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT games_scores_check CHECK (
    (status = 'completed' AND home_score IS NOT NULL AND away_score IS NOT NULL) OR
    (status != 'completed' AND home_score IS NULL AND away_score IS NULL)
  )
);

-- Indexes for games
CREATE INDEX idx_games_sport_time ON games(sport, commence_time);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_teams ON games(home_team, away_team);

-- Bets table
CREATE TABLE bets (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL REFERENCES games(id),
  
  -- Bet Details
  bet_type bet_type NOT NULL,
  bet_details JSONB NOT NULL,
  
  -- Financial
  stake INTEGER NOT NULL CHECK (stake >= 500), -- Min $5.00
  odds INTEGER NOT NULL,
  potential_win INTEGER NOT NULL,
  actual_win INTEGER,
  
  -- Status
  status bet_status NOT NULL DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  settled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- Game start time
  
  -- Metadata
  is_tail BOOLEAN DEFAULT FALSE,
  is_fade BOOLEAN DEFAULT FALSE,
  original_pick_id UUID, -- References the pick that was tailed/faded
  
  -- Constraints
  CONSTRAINT bets_settled_check CHECK (
    (status = 'pending' AND settled_at IS NULL AND actual_win IS NULL) OR
    (status != 'pending' AND settled_at IS NOT NULL)
  )
);

-- Indexes for bets
CREATE INDEX idx_bets_user_status ON bets(user_id, status);
CREATE INDEX idx_bets_game ON bets(game_id);
CREATE INDEX idx_bets_created ON bets(created_at DESC);
CREATE INDEX idx_bets_pending ON bets(status) WHERE status = 'pending';
CREATE INDEX idx_bets_expires ON bets(expires_at) WHERE status = 'pending';

-- Posts table
CREATE TABLE posts (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bet_id UUID REFERENCES bets(id) ON DELETE SET NULL,
  
  -- Content
  media_url TEXT NOT NULL,
  media_type media_type NOT NULL,
  thumbnail_url TEXT, -- For videos
  caption TEXT CHECK (char_length(caption) <= 280),
  
  -- Engagement Metrics
  tail_count INTEGER DEFAULT 0 CHECK (tail_count >= 0),
  fade_count INTEGER DEFAULT 0 CHECK (fade_count >= 0),
  reaction_count INTEGER DEFAULT 0 CHECK (reaction_count >= 0),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT posts_expiration_check CHECK (expires_at > created_at)
);

-- Indexes for posts
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_expires ON posts(expires_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_bet ON posts(bet_id) WHERE bet_id IS NOT NULL;
CREATE INDEX idx_posts_feed ON posts(created_at DESC) WHERE deleted_at IS NULL AND expires_at > NOW();

-- Stories table
CREATE TABLE stories (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  media_url TEXT NOT NULL,
  media_type media_type NOT NULL,
  caption TEXT CHECK (char_length(caption) <= 280),
  
  -- Story Type
  story_type story_type DEFAULT 'manual',
  metadata JSONB, -- For auto-generated stories
  
  -- Engagement
  view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  deleted_at TIMESTAMPTZ
);

-- Indexes for stories
CREATE INDEX idx_stories_user ON stories(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_stories_expires ON stories(expires_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_stories_active ON stories(user_id, created_at DESC) 
  WHERE deleted_at IS NULL AND expires_at > NOW();

-- Reactions table
CREATE TABLE reactions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Reaction
  emoji TEXT NOT NULL CHECK (emoji IN ('🔥', '💯', '😬', '💰', '🎯', '🤝')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(post_id, user_id, emoji)
);

-- Indexes for reactions
CREATE INDEX idx_reactions_post ON reactions(post_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);

-- Story views table
CREATE TABLE story_views (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Timestamps
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(story_id, viewer_id)
);

-- Indexes for story views
CREATE INDEX idx_story_views_story ON story_views(story_id);
CREATE INDEX idx_story_views_viewer ON story_views(viewer_id);

-- Follows table
CREATE TABLE follows (
  -- Composite Primary Key
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT follows_no_self_follow CHECK (follower_id != following_id)
);

-- Indexes for follows
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_follows_created ON follows(created_at DESC);

-- Pick actions table
CREATE TABLE pick_actions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resulting_bet_id UUID REFERENCES bets(id) ON DELETE SET NULL,
  
  -- Action Details
  action_type pick_action NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(post_id, user_id) -- One action per user per post
);

-- Indexes for pick actions
CREATE INDEX idx_pick_actions_post ON pick_actions(post_id);
CREATE INDEX idx_pick_actions_user ON pick_actions(user_id);
CREATE INDEX idx_pick_actions_type ON pick_actions(action_type);
CREATE INDEX idx_pick_actions_bet ON pick_actions(resulting_bet_id);

-- Chats table
CREATE TABLE chats (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Chat Details
  chat_type chat_type NOT NULL,
  name TEXT CHECK (
    (chat_type = 'dm' AND name IS NULL) OR
    (chat_type = 'group' AND name IS NOT NULL AND char_length(name) <= 50)
  ),
  avatar_url TEXT,
  
  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  
  -- Settings
  settings JSONB DEFAULT '{}'::jsonb
);

-- Indexes for chats
CREATE INDEX idx_chats_type ON chats(chat_type);
CREATE INDEX idx_chats_last_message ON chats(last_message_at DESC NULLS LAST);

-- Chat members table
CREATE TABLE chat_members (
  -- Composite Primary Key
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Member Details
  role chat_role DEFAULT 'member',
  
  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  
  -- Constraints
  PRIMARY KEY (chat_id, user_id)
);

-- Indexes for chat members
CREATE INDEX idx_chat_members_user ON chat_members(user_id);
CREATE INDEX idx_chat_members_chat ON chat_members(chat_id);

-- Messages table
CREATE TABLE messages (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  deleted_at TIMESTAMPTZ
);

-- Indexes for messages
CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_expires ON messages(expires_at) WHERE deleted_at IS NULL;

-- Message reads table
CREATE TABLE message_reads (
  -- Composite Primary Key
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Timestamps
  read_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  PRIMARY KEY (message_id, user_id)
);

-- Indexes for message reads
CREATE INDEX idx_message_reads_user ON message_reads(user_id);

-- Notifications table
CREATE TABLE notifications (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification Details
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  
  -- Status
  read BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT notifications_read_check CHECK (
    (read = FALSE AND read_at IS NULL) OR
    (read = TRUE AND read_at IS NOT NULL)
  )
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE read = FALSE;
CREATE INDEX idx_notifications_user_all ON notifications(user_id, created_at DESC);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update timestamp triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bankrolls_updated_at BEFORE UPDATE ON bankrolls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Additional triggers for engagement metrics
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.action_type = 'tail' THEN
      UPDATE posts SET tail_count = tail_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.action_type = 'fade' THEN
      UPDATE posts SET fade_count = fade_count + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.action_type = 'tail' THEN
      UPDATE posts SET tail_count = tail_count - 1 WHERE id = OLD.post_id;
    ELSIF OLD.action_type = 'fade' THEN
      UPDATE posts SET fade_count = fade_count - 1 WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_pick_counts
AFTER INSERT OR DELETE ON pick_actions
FOR EACH ROW EXECUTE FUNCTION update_post_counts();

-- Trigger for reaction counts
CREATE OR REPLACE FUNCTION update_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET reaction_count = reaction_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET reaction_count = reaction_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_reaction_count
AFTER INSERT OR DELETE ON reactions
FOR EACH ROW EXECUTE FUNCTION update_reaction_count();

-- Trigger for story view counts
CREATE OR REPLACE FUNCTION increment_story_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stories SET view_count = view_count + 1 WHERE id = NEW.story_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_story_view_count
AFTER INSERT ON story_views
FOR EACH ROW EXECUTE FUNCTION increment_story_views();

-- Trigger for chat last message
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats SET last_message_at = NEW.created_at WHERE id = NEW.chat_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_last_message_time
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_chat_last_message();

-- Trigger for bankroll high/low
CREATE OR REPLACE FUNCTION update_bankroll_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.balance > NEW.season_high THEN
    NEW.season_high = NEW.balance;
  END IF;
  IF NEW.balance < NEW.season_low THEN
    NEW.season_low = NEW.balance;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bankroll_high_low
BEFORE UPDATE OF balance ON bankrolls
FOR EACH ROW EXECUTE FUNCTION update_bankroll_stats();

-- Database Functions

-- Calculate payout for American odds
CREATE OR REPLACE FUNCTION calculate_payout(stake INTEGER, odds INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF odds > 0 THEN
    -- Positive odds: profit = stake * (odds/100)
    RETURN stake + (stake * odds / 100);
  ELSE
    -- Negative odds: profit = stake * (100/abs(odds))
    RETURN stake + (stake * 100 / ABS(odds));
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Place a bet
CREATE OR REPLACE FUNCTION place_bet(
  p_user_id UUID,
  p_game_id TEXT,
  p_bet_type bet_type,
  p_bet_details JSONB,
  p_stake INTEGER,
  p_odds INTEGER,
  p_expires_at TIMESTAMPTZ,
  p_is_tail BOOLEAN DEFAULT FALSE,
  p_is_fade BOOLEAN DEFAULT FALSE,
  p_original_pick_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_bet_id UUID;
  v_potential_win INTEGER;
  v_current_balance INTEGER;
BEGIN
  -- Check user has sufficient balance
  SELECT balance INTO v_current_balance FROM bankrolls WHERE user_id = p_user_id;
  
  IF v_current_balance < p_stake THEN
    RAISE EXCEPTION 'Insufficient balance. Current: %, Required: %', v_current_balance, p_stake;
  END IF;
  
  -- Calculate potential win
  v_potential_win = calculate_payout(p_stake, p_odds) - p_stake;
  
  -- Create bet
  INSERT INTO bets (
    user_id, game_id, bet_type, bet_details, stake, odds, 
    potential_win, expires_at, is_tail, is_fade, original_pick_id
  ) VALUES (
    p_user_id, p_game_id, p_bet_type, p_bet_details, p_stake, p_odds,
    v_potential_win, p_expires_at, p_is_tail, p_is_fade, p_original_pick_id
  ) RETURNING id INTO v_bet_id;
  
  -- Update bankroll
  UPDATE bankrolls 
  SET balance = balance - p_stake,
      total_wagered = total_wagered + p_stake
  WHERE user_id = p_user_id;
  
  RETURN v_bet_id;
END;
$$ LANGUAGE plpgsql;

-- Tail a pick (copy someone's bet)
CREATE OR REPLACE FUNCTION tail_pick(
  p_user_id UUID,
  p_post_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_original_bet bets%ROWTYPE;
  v_new_bet_id UUID;
  v_game games%ROWTYPE;
BEGIN
  -- Get original bet details
  SELECT b.* INTO v_original_bet
  FROM bets b
  JOIN posts p ON p.bet_id = b.id
  WHERE p.id = p_post_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No bet found for this post';
  END IF;
  
  -- Check if game has started
  SELECT * INTO v_game FROM games WHERE id = v_original_bet.game_id;
  IF v_game.commence_time <= NOW() THEN
    RAISE EXCEPTION 'Game has already started';
  END IF;
  
  -- Check if user already tailed/faded this pick
  IF EXISTS (
    SELECT 1 FROM pick_actions 
    WHERE post_id = p_post_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Already tailed or faded this pick';
  END IF;
  
  -- Place the tail bet
  v_new_bet_id = place_bet(
    p_user_id,
    v_original_bet.game_id,
    v_original_bet.bet_type,
    v_original_bet.bet_details,
    v_original_bet.stake,
    v_original_bet.odds,
    v_original_bet.expires_at,
    TRUE, -- is_tail
    FALSE, -- is_fade
    v_original_bet.id -- original_pick_id
  );
  
  -- Record the tail action
  INSERT INTO pick_actions (post_id, user_id, action_type, resulting_bet_id)
  VALUES (p_post_id, p_user_id, 'tail', v_new_bet_id);
  
  RETURN v_new_bet_id;
END;
$$ LANGUAGE plpgsql;

-- Fade a pick (bet opposite)
CREATE OR REPLACE FUNCTION fade_pick(
  p_user_id UUID,
  p_post_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_original_bet bets%ROWTYPE;
  v_new_bet_id UUID;
  v_fade_details JSONB;
  v_game games%ROWTYPE;
BEGIN
  -- Get original bet details
  SELECT b.* INTO v_original_bet
  FROM bets b
  JOIN posts p ON p.bet_id = b.id
  WHERE p.id = p_post_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No bet found for this post';
  END IF;
  
  -- Check if game has started
  SELECT * INTO v_game FROM games WHERE id = v_original_bet.game_id;
  IF v_game.commence_time <= NOW() THEN
    RAISE EXCEPTION 'Game has already started';
  END IF;
  
  -- Check if user already tailed/faded this pick
  IF EXISTS (
    SELECT 1 FROM pick_actions 
    WHERE post_id = p_post_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Already tailed or faded this pick';
  END IF;
  
  -- Calculate opposite bet details
  v_fade_details = v_original_bet.bet_details;
  
  CASE v_original_bet.bet_type
    WHEN 'spread' THEN
      -- Switch team
      IF v_fade_details->>'team' = v_game.home_team THEN
        v_fade_details = jsonb_set(v_fade_details, '{team}', to_jsonb(v_game.away_team));
      ELSE
        v_fade_details = jsonb_set(v_fade_details, '{team}', to_jsonb(v_game.home_team));
      END IF;
    WHEN 'total' THEN
      -- Switch over/under
      IF v_fade_details->>'total_type' = 'over' THEN
        v_fade_details = jsonb_set(v_fade_details, '{total_type}', '"under"');
      ELSE
        v_fade_details = jsonb_set(v_fade_details, '{total_type}', '"over"');
      END IF;
    WHEN 'moneyline' THEN
      -- Switch team
      IF v_fade_details->>'team' = v_game.home_team THEN
        v_fade_details = jsonb_set(v_fade_details, '{team}', to_jsonb(v_game.away_team));
      ELSE
        v_fade_details = jsonb_set(v_fade_details, '{team}', to_jsonb(v_game.home_team));
      END IF;
  END CASE;
  
  -- Place the fade bet
  v_new_bet_id = place_bet(
    p_user_id,
    v_original_bet.game_id,
    v_original_bet.bet_type,
    v_fade_details,
    v_original_bet.stake,
    v_original_bet.odds, -- Same odds for simplicity
    v_original_bet.expires_at,
    FALSE, -- is_tail
    TRUE, -- is_fade
    v_original_bet.id -- original_pick_id
  );
  
  -- Record the fade action
  INSERT INTO pick_actions (post_id, user_id, action_type, resulting_bet_id)
  VALUES (p_post_id, p_user_id, 'fade', v_new_bet_id);
  
  RETURN v_new_bet_id;
END;
$$ LANGUAGE plpgsql;

-- Settle bets for a completed game
CREATE OR REPLACE FUNCTION settle_game_bets(p_game_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_game games%ROWTYPE;
  v_bet bets%ROWTYPE;
  v_settled_count INTEGER := 0;
  v_home_spread NUMERIC;
  v_total_points INTEGER;
  v_bet_result bet_status;
  v_actual_win INTEGER;
BEGIN
  -- Get game details
  SELECT * INTO v_game FROM games WHERE id = p_game_id;
  
  IF v_game.status != 'completed' THEN
    RAISE EXCEPTION 'Game is not completed';
  END IF;
  
  -- Calculate spread and total
  v_home_spread = v_game.home_score - v_game.away_score;
  v_total_points = v_game.home_score + v_game.away_score;
  
  -- Process each pending bet
  FOR v_bet IN SELECT * FROM bets WHERE game_id = p_game_id AND status = 'pending' LOOP
    v_bet_result = 'pending';
    v_actual_win = 0;
    
    CASE v_bet.bet_type
      WHEN 'spread' THEN
        IF v_bet.bet_details->>'team' = v_game.home_team THEN
          -- Home team bet
          IF v_home_spread + (v_bet.bet_details->>'line')::NUMERIC > 0 THEN
            v_bet_result = 'won';
          ELSIF v_home_spread + (v_bet.bet_details->>'line')::NUMERIC = 0 THEN
            v_bet_result = 'push';
          ELSE
            v_bet_result = 'lost';
          END IF;
        ELSE
          -- Away team bet
          IF -v_home_spread + (v_bet.bet_details->>'line')::NUMERIC > 0 THEN
            v_bet_result = 'won';
          ELSIF -v_home_spread + (v_bet.bet_details->>'line')::NUMERIC = 0 THEN
            v_bet_result = 'push';
          ELSE
            v_bet_result = 'lost';
          END IF;
        END IF;
        
      WHEN 'total' THEN
        IF v_bet.bet_details->>'total_type' = 'over' THEN
          IF v_total_points > (v_bet.bet_details->>'line')::NUMERIC THEN
            v_bet_result = 'won';
          ELSIF v_total_points = (v_bet.bet_details->>'line')::NUMERIC THEN
            v_bet_result = 'push';
          ELSE
            v_bet_result = 'lost';
          END IF;
        ELSE -- under
          IF v_total_points < (v_bet.bet_details->>'line')::NUMERIC THEN
            v_bet_result = 'won';
          ELSIF v_total_points = (v_bet.bet_details->>'line')::NUMERIC THEN
            v_bet_result = 'push';
          ELSE
            v_bet_result = 'lost';
          END IF;
        END IF;
        
      WHEN 'moneyline' THEN
        IF v_bet.bet_details->>'team' = v_game.home_team THEN
          IF v_game.home_score > v_game.away_score THEN
            v_bet_result = 'won';
          ELSE
            v_bet_result = 'lost';
          END IF;
        ELSE
          IF v_game.away_score > v_game.home_score THEN
            v_bet_result = 'won';
          ELSE
            v_bet_result = 'lost';
          END IF;
        END IF;
    END CASE;
    
    -- Calculate actual win amount
    IF v_bet_result = 'won' THEN
      v_actual_win = v_bet.potential_win;
    ELSIF v_bet_result = 'push' THEN
      v_actual_win = 0;
    ELSE
      v_actual_win = -v_bet.stake;
    END IF;
    
    -- Update bet
    UPDATE bets 
    SET status = v_bet_result,
        actual_win = v_actual_win,
        settled_at = NOW()
    WHERE id = v_bet.id;
    
    -- Update bankroll
    IF v_bet_result = 'won' THEN
      UPDATE bankrolls
      SET balance = balance + v_bet.stake + v_bet.potential_win,
          total_won = total_won + v_bet.potential_win,
          win_count = win_count + 1,
          biggest_win = GREATEST(biggest_win, v_bet.potential_win)
      WHERE user_id = v_bet.user_id;
    ELSIF v_bet_result = 'push' THEN
      UPDATE bankrolls
      SET balance = balance + v_bet.stake,
          push_count = push_count + 1
      WHERE user_id = v_bet.user_id;
    ELSE -- lost
      UPDATE bankrolls
      SET loss_count = loss_count + 1,
          biggest_loss = GREATEST(biggest_loss, v_bet.stake)
      WHERE user_id = v_bet.user_id;
    END IF;
    
    v_settled_count = v_settled_count + 1;
  END LOOP;
  
  RETURN v_settled_count;
END;
$$ LANGUAGE plpgsql;

-- Reset bankroll to $1000
CREATE OR REPLACE FUNCTION reset_bankroll(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE bankrolls
  SET balance = 100000,
      total_wagered = 0,
      total_won = 0,
      win_count = 0,
      loss_count = 0,
      push_count = 0,
      biggest_win = 0,
      biggest_loss = 0,
      season_high = 100000,
      season_low = 100000,
      last_reset = NOW(),
      reset_count = reset_count + 1
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Get personalized feed
CREATE OR REPLACE FUNCTION get_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  media_url TEXT,
  media_type media_type,
  thumbnail_url TEXT,
  caption TEXT,
  tail_count INTEGER,
  fade_count INTEGER,
  reaction_count INTEGER,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  bet_id UUID,
  bet_type bet_type,
  bet_details JSONB,
  stake INTEGER,
  odds INTEGER,
  game_id TEXT,
  game_info JSONB,
  user_action pick_action,
  user_reaction TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as post_id,
    p.user_id,
    u.username,
    u.display_name,
    u.avatar_url,
    p.media_url,
    p.media_type,
    p.thumbnail_url,
    p.caption,
    p.tail_count,
    p.fade_count,
    p.reaction_count,
    p.created_at,
    p.expires_at,
    b.id as bet_id,
    b.bet_type,
    b.bet_details,
    b.stake,
    b.odds,
    b.game_id,
    jsonb_build_object(
      'sport', g.sport,
      'home_team', g.home_team,
      'away_team', g.away_team,
      'commence_time', g.commence_time,
      'status', g.status
    ) as game_info,
    pa.action_type as user_action,
    ARRAY(
      SELECT r.emoji 
      FROM reactions r 
      WHERE r.post_id = p.id AND r.user_id = p_user_id
    ) as user_reaction
  FROM posts p
  JOIN users u ON p.user_id = u.id
  LEFT JOIN bets b ON p.bet_id = b.id
  LEFT JOIN games g ON b.game_id = g.id
  LEFT JOIN pick_actions pa ON pa.post_id = p.id AND pa.user_id = p_user_id
  WHERE p.deleted_at IS NULL
    AND p.expires_at > NOW()
    AND (
      -- User's own posts
      p.user_id = p_user_id
      OR
      -- Posts from users they follow
      EXISTS (
        SELECT 1 FROM follows f 
        WHERE f.follower_id = p_user_id AND f.following_id = p.user_id
      )
      OR
      -- Public picks if privacy allows
      (u.privacy_settings->>'public_picks')::boolean = true
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bankrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE pick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY users_select ON users FOR SELECT TO authenticated
  USING (true); -- All authenticated users can view other users

CREATE POLICY users_update ON users FOR UPDATE TO authenticated
  USING (auth.uid() = id); -- Users can only update their own profile

CREATE POLICY users_insert ON users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id); -- Users can only insert their own profile

-- Bankrolls policies
CREATE POLICY bankrolls_select ON bankrolls FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR -- Own bankroll
    EXISTS ( -- Or if user allows public bankroll viewing
      SELECT 1 FROM users u 
      WHERE u.id = bankrolls.user_id 
      AND (u.privacy_settings->>'show_bankroll')::boolean = true
    )
  );

CREATE POLICY bankrolls_update ON bankrolls FOR UPDATE TO authenticated
  USING (user_id = auth.uid()); -- Only update own bankroll

CREATE POLICY bankrolls_insert ON bankrolls FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()); -- Only insert own bankroll

-- Bets policies
CREATE POLICY bets_select ON bets FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR -- Own bets
    EXISTS ( -- Or if attached to a visible post
      SELECT 1 FROM posts p 
      WHERE p.bet_id = bets.id 
      AND p.deleted_at IS NULL
    )
  );

CREATE POLICY bets_insert ON bets FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()); -- Only place own bets

CREATE POLICY bets_update ON bets FOR UPDATE TO authenticated
  USING (FALSE); -- Bets cannot be updated by users

-- Games policies
CREATE POLICY games_select ON games FOR SELECT TO authenticated
  USING (true); -- All users can view games

CREATE POLICY games_insert ON games FOR INSERT TO authenticated
  USING (FALSE); -- Only system can insert games

CREATE POLICY games_update ON games FOR UPDATE TO authenticated
  USING (FALSE); -- Only system can update games

-- Posts policies
CREATE POLICY posts_select ON posts FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL AND (
      user_id = auth.uid() OR -- Own posts
      EXISTS ( -- Following user
        SELECT 1 FROM follows f 
        WHERE f.follower_id = auth.uid() 
        AND f.following_id = posts.user_id
      ) OR
      EXISTS ( -- Public picks allowed
        SELECT 1 FROM users u 
        WHERE u.id = posts.user_id 
        AND (u.privacy_settings->>'public_picks')::boolean = true
      )
    )
  );

CREATE POLICY posts_insert ON posts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()); -- Only create own posts

CREATE POLICY posts_update ON posts FOR UPDATE TO authenticated
  USING (user_id = auth.uid()); -- Only update own posts

CREATE POLICY posts_delete ON posts FOR DELETE TO authenticated
  USING (user_id = auth.uid()); -- Only delete own posts

-- Stories policies
CREATE POLICY stories_select ON stories FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL AND (
      user_id = auth.uid() OR -- Own stories
      EXISTS ( -- Following user
        SELECT 1 FROM follows f 
        WHERE f.follower_id = auth.uid() 
        AND f.following_id = stories.user_id
      )
    )
  );

CREATE POLICY stories_insert ON stories FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY stories_delete ON stories FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Reactions policies
CREATE POLICY reactions_select ON reactions FOR SELECT TO authenticated
  USING (true); -- All can see reactions

CREATE POLICY reactions_insert ON reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY reactions_delete ON reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Story views policies
CREATE POLICY story_views_select ON story_views FOR SELECT TO authenticated
  USING (
    viewer_id = auth.uid() OR -- Own views
    EXISTS ( -- Or story owner
      SELECT 1 FROM stories s 
      WHERE s.id = story_views.story_id 
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY story_views_insert ON story_views FOR INSERT TO authenticated
  WITH CHECK (viewer_id = auth.uid());

-- Follows policies
CREATE POLICY follows_select ON follows FOR SELECT TO authenticated
  USING (true); -- All can see follow relationships

CREATE POLICY follows_insert ON follows FOR INSERT TO authenticated
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY follows_delete ON follows FOR DELETE TO authenticated
  USING (follower_id = auth.uid());

-- Pick actions policies
CREATE POLICY pick_actions_select ON pick_actions FOR SELECT TO authenticated
  USING (true); -- All can see pick actions

CREATE POLICY pick_actions_insert ON pick_actions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Chat policies
CREATE POLICY chats_select ON chats FOR SELECT TO authenticated
  USING (
    EXISTS ( -- User is a member
      SELECT 1 FROM chat_members cm 
      WHERE cm.chat_id = chats.id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY chats_insert ON chats FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY chats_update ON chats FOR UPDATE TO authenticated
  USING (
    EXISTS ( -- User is an admin member
      SELECT 1 FROM chat_members cm 
      WHERE cm.chat_id = chats.id 
      AND cm.user_id = auth.uid() 
      AND cm.role = 'admin'
    )
  );

-- Chat members policies
CREATE POLICY chat_members_select ON chat_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR -- Own membership
    EXISTS ( -- Or fellow member
      SELECT 1 FROM chat_members cm 
      WHERE cm.chat_id = chat_members.chat_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY chat_members_insert ON chat_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS ( -- User is admin of chat
      SELECT 1 FROM chat_members cm 
      WHERE cm.chat_id = chat_members.chat_id 
      AND cm.user_id = auth.uid() 
      AND cm.role = 'admin'
    ) OR
    (chat_members.user_id = auth.uid() AND chat_members.role = 'member') -- Adding self as member
  );

-- Messages policies
CREATE POLICY messages_select ON messages FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL AND
    EXISTS ( -- User is chat member
      SELECT 1 FROM chat_members cm 
      WHERE cm.chat_id = messages.chat_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY messages_insert ON messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS ( -- User is chat member
      SELECT 1 FROM chat_members cm 
      WHERE cm.chat_id = messages.chat_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY messages_delete ON messages FOR DELETE TO authenticated
  USING (sender_id = auth.uid());

-- Message reads policies
CREATE POLICY message_reads_select ON message_reads FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY message_reads_insert ON message_reads FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Notifications policies
CREATE POLICY notifications_select ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY notifications_update ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Storage bucket configuration (to be run after bucket creation)
-- These will be set up via Supabase dashboard or API 