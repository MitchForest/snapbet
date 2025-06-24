# SnapBet Database Design Document

## Table of Contents
1. [Database Overview](#database-overview)
2. [Schema Design Philosophy](#schema-design-philosophy)
3. [Core Tables](#core-tables)
4. [Relationship Tables](#relationship-tables)
5. [Materialized Views](#materialized-views)
6. [Indexes Strategy](#indexes-strategy)
7. [Row Level Security (RLS)](#row-level-security-rls)
8. [Database Functions](#database-functions)
9. [Triggers](#triggers)
10. [Data Types & Constraints](#data-types--constraints)
11. [Performance Optimization](#performance-optimization)
12. [Data Retention & Cleanup](#data-retention--cleanup)
13. [Migration Strategy](#migration-strategy)
14. [Backup & Recovery](#backup--recovery)
15. [Query Patterns](#query-patterns)

## Database Overview

### Technology Stack
- **Database**: PostgreSQL 15
- **Hosting**: Supabase Cloud
- **Extensions**:
  - `uuid-ossp` - UUID generation
  - `pgcrypto` - Encryption functions
  - `pg_cron` - Scheduled jobs
  - `pgvector` - Vector embeddings (Phase 2)
  - `pg_stat_statements` - Query performance

### Database Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│                  (React Native + Expo)                   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      PostgREST API                       │
│                 (Auto-generated REST API)                │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Row Level Security (RLS)                │
│              (User-based access control)                 │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    PostgreSQL Core                       │
├─────────────────────────┬───────────────────────────────┤
│      User Data         │        Betting Data           │
│  ├── users            │    ├── bets                   │
│  ├── bankrolls        │    ├── games                  │
│  ├── follows          │    └── pick_actions           │
│  └── user_settings    │                                │
├─────────────────────────┼───────────────────────────────┤
│     Social Data        │      Messaging Data           │
│  ├── posts            │    ├── chats                  │
│  ├── stories          │    ├── chat_members           │
│  ├── reactions        │    ├── messages               │
│  └── story_views      │    └── message_reads          │
└─────────────────────────┴───────────────────────────────┘
```

## Schema Design Philosophy

### Design Principles
1. **Normalization**: 3NF for transactional data, denormalized for analytics
2. **Soft Deletes**: Use `deleted_at` timestamps for recoverable data
3. **UUID Keys**: All primary keys use UUIDs for distributed systems
4. **Audit Fields**: Every table has `created_at`, `updated_at`
5. **JSONB for Flexibility**: Variable data stored as JSONB
6. **Constraints**: Enforce business rules at database level
7. **Performance First**: Indexes for all foreign keys and query patterns

### Naming Conventions
- **Tables**: Plural, snake_case (e.g., `users`, `pick_actions`)
- **Columns**: Snake_case (e.g., `user_id`, `created_at`)
- **Indexes**: `idx_tablename_columns` (e.g., `idx_posts_user_created`)
- **Constraints**: `tablename_columnname_constraint` (e.g., `users_username_unique`)
- **Functions**: Snake_case verbs (e.g., `calculate_roi`, `settle_bet`)

## Core Tables

### users
Primary user account information from OAuth providers.

```sql
CREATE TABLE users (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- OAuth Information
  email TEXT UNIQUE NOT NULL,
  oauth_provider TEXT NOT NULL CHECK (oauth_provider IN ('google', 'twitter')),
  oauth_id TEXT NOT NULL,
  
  -- Profile Information
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT CHECK (char_length(bio) <= 140),
  favorite_team TEXT,
  
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

-- Indexes
CREATE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created ON users(created_at DESC);
```

### bankrolls
Tracks user's mock money balance and betting statistics.

```sql
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

-- Indexes
CREATE INDEX idx_bankrolls_balance ON bankrolls(balance);
CREATE INDEX idx_bankrolls_updated ON bankrolls(updated_at DESC);
```

### bets
Individual bets placed by users.

```sql
CREATE TABLE bets (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  
  -- Bet Details
  bet_type TEXT NOT NULL CHECK (bet_type IN ('spread', 'total', 'moneyline')),
  bet_details JSONB NOT NULL,
  /* bet_details structure:
  {
    "team": "LAL",        // For spread/moneyline
    "line": -5.5,         // For spread
    "total_type": "over", // For totals
    "odds": -110
  }
  */
  
  -- Financial
  stake INTEGER NOT NULL CHECK (stake >= 500), -- Min $5.00
  odds INTEGER NOT NULL,
  potential_win INTEGER NOT NULL,
  actual_win INTEGER,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'push', 'cancelled')),
  
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

-- Indexes
CREATE INDEX idx_bets_user_status ON bets(user_id, status);
CREATE INDEX idx_bets_game ON bets(game_id);
CREATE INDEX idx_bets_created ON bets(created_at DESC);
CREATE INDEX idx_bets_pending ON bets(status) WHERE status = 'pending';
CREATE INDEX idx_bets_expires ON bets(expires_at) WHERE status = 'pending';
```

### games
Cached game and odds information.

```sql
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
  /* odds_data structure:
  {
    "bookmakers": [{
      "key": "draftkings",
      "markets": {
        "h2h": { "home": -150, "away": +130 },
        "spreads": { "line": -5.5, "home": -110, "away": -110 },
        "totals": { "line": 220.5, "over": -110, "under": -110 }
      }
    }]
  }
  */
  
  -- Results
  home_score INTEGER,
  away_score INTEGER,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT games_scores_check CHECK (
    (status = 'completed' AND home_score IS NOT NULL AND away_score IS NOT NULL) OR
    (status != 'completed' AND home_score IS NULL AND away_score IS NULL)
  )
);

-- Indexes
CREATE INDEX idx_games_sport_time ON games(sport, commence_time);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_teams ON games(home_team, away_team);
```

### posts
Social media posts with optional bet attachments.

```sql
CREATE TABLE posts (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bet_id UUID REFERENCES bets(id) ON DELETE SET NULL,
  
  -- Content
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
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

-- Indexes
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_expires ON posts(expires_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_bet ON posts(bet_id) WHERE bet_id IS NOT NULL;
CREATE INDEX idx_posts_feed ON posts(created_at DESC) WHERE deleted_at IS NULL AND expires_at > NOW();
```

### stories
24-hour ephemeral content.

```sql
CREATE TABLE stories (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  caption TEXT CHECK (char_length(caption) <= 280),
  
  -- Story Type
  story_type TEXT DEFAULT 'manual' CHECK (story_type IN ('manual', 'auto_milestone', 'auto_recap')),
  metadata JSONB, -- For auto-generated stories
  
  -- Engagement
  view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_stories_user ON stories(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_stories_expires ON stories(expires_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_stories_active ON stories(user_id, created_at DESC) 
  WHERE deleted_at IS NULL AND expires_at > NOW();
```

## Relationship Tables

### follows
User follow relationships.

```sql
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

-- Indexes
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_follows_created ON follows(created_at DESC);
```

### pick_actions
Tracks tail/fade actions on posts.

```sql
CREATE TABLE pick_actions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resulting_bet_id UUID REFERENCES bets(id) ON DELETE SET NULL,
  
  -- Action Details
  action_type TEXT NOT NULL CHECK (action_type IN ('tail', 'fade')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(post_id, user_id) -- One action per user per post
);

-- Indexes
CREATE INDEX idx_pick_actions_post ON pick_actions(post_id);
CREATE INDEX idx_pick_actions_user ON pick_actions(user_id);
CREATE INDEX idx_pick_actions_type ON pick_actions(action_type);
CREATE INDEX idx_pick_actions_bet ON pick_actions(resulting_bet_id);
```

### reactions
Emoji reactions to posts.

```sql
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

-- Indexes
CREATE INDEX idx_reactions_post ON reactions(post_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);
```

### story_views
Tracks who viewed stories.

```sql
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

-- Indexes
CREATE INDEX idx_story_views_story ON story_views(story_id);
CREATE INDEX idx_story_views_viewer ON story_views(viewer_id);
```

### chats
Chat rooms for DMs and group messages.

```sql
CREATE TABLE chats (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Chat Details
  chat_type TEXT NOT NULL CHECK (chat_type IN ('dm', 'group')),
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

-- Indexes
CREATE INDEX idx_chats_type ON chats(chat_type);
CREATE INDEX idx_chats_last_message ON chats(last_message_at DESC NULLS LAST);
```

### chat_members
Members of each chat.

```sql
CREATE TABLE chat_members (
  -- Composite Primary Key
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Member Details
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  
  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  
  -- Constraints
  PRIMARY KEY (chat_id, user_id)
);

-- Indexes
CREATE INDEX idx_chat_members_user ON chat_members(user_id);
CREATE INDEX idx_chat_members_chat ON chat_members(chat_id);
```

### messages
Individual messages in chats.

```sql
CREATE TABLE messages (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content (at least one must be non-null)
  content TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('photo', 'video', NULL)),
  bet_id UUID REFERENCES bets(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT messages_content_check CHECK (
    content IS NOT NULL OR 
    media_url IS NOT NULL OR 
    bet_id IS NOT NULL
  )
);

-- Indexes
CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_expires ON messages(expires_at) WHERE deleted_at IS NULL;
```

### message_reads
Read receipts for messages.

```sql
CREATE TABLE message_reads (
  -- Composite Primary Key
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Timestamps
  read_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  PRIMARY KEY (message_id, user_id)
);

-- Indexes
CREATE INDEX idx_message_reads_user ON message_reads(user_id);
CREATE INDEX idx_message_reads_message ON message_reads(message_id);
```

### notifications
User notifications.

```sql
CREATE TABLE notifications (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification Details
  type TEXT NOT NULL CHECK (type IN (
    'tail', 'fade', 'bet_won', 'bet_lost', 'tail_won', 'tail_lost',
    'fade_won', 'fade_lost', 'follow', 'message', 'mention', 'milestone'
  )),
  data JSONB NOT NULL,
  /* data structure varies by type:
  {
    "actor_id": "uuid",
    "actor_username": "mikebets",
    "post_id": "uuid",
    "amount": 50,
    "message": "Someone tailed your pick"
  }
  */
  
  -- Status
  read BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC) 
  WHERE read = FALSE;
CREATE INDEX idx_notifications_user_all ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
```

## Materialized Views

### user_stats
Pre-calculated user statistics for performance.

```sql
CREATE MATERIALIZED VIEW user_stats AS
SELECT 
  u.id as user_id,
  u.username,
  
  -- Betting Stats
  COUNT(DISTINCT b.id) as total_bets,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'won') as wins,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'lost') as losses,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'push') as pushes,
  
  -- Financial Stats
  COALESCE(SUM(b.stake) FILTER (WHERE b.status IN ('won', 'lost')), 0) as total_wagered,
  COALESCE(SUM(b.actual_win) FILTER (WHERE b.status = 'won'), 0) - 
    COALESCE(SUM(b.stake) FILTER (WHERE b.status = 'lost'), 0) as profit,
  
  -- ROI Calculation
  CASE 
    WHEN COALESCE(SUM(b.stake) FILTER (WHERE b.status IN ('won', 'lost')), 0) > 0
    THEN (COALESCE(SUM(b.actual_win) FILTER (WHERE b.status = 'won'), 0) - 
          COALESCE(SUM(b.stake) FILTER (WHERE b.status = 'lost'), 0))::DECIMAL / 
          COALESCE(SUM(b.stake) FILTER (WHERE b.status IN ('won', 'lost')), 1) * 100
    ELSE 0
  END as roi_percentage,
  
  -- Win Rate
  CASE 
    WHEN COUNT(DISTINCT b.id) FILTER (WHERE b.status IN ('won', 'lost')) > 0
    THEN COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'won')::DECIMAL / 
         COUNT(DISTINCT b.id) FILTER (WHERE b.status IN ('won', 'lost')) * 100
    ELSE 0
  END as win_rate,
  
  -- Social Stats
  COUNT(DISTINCT pa.id) FILTER (WHERE pa.action_type = 'tail') as tails_placed,
  COUNT(DISTINCT pa.id) FILTER (WHERE pa.action_type = 'fade') as fades_placed,
  COUNT(DISTINCT pa2.id) FILTER (WHERE pa2.action_type = 'tail') as times_tailed,
  COUNT(DISTINCT pa2.id) FILTER (WHERE pa2.action_type = 'fade') as times_faded,
  
  -- Follower Counts
  COUNT(DISTINCT f1.follower_id) as follower_count,
  COUNT(DISTINCT f2.following_id) as following_count,
  
  -- Last Updated
  NOW() as calculated_at
  
FROM users u
LEFT JOIN bets b ON u.id = b.user_id
LEFT JOIN pick_actions pa ON u.id = pa.user_id
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN pick_actions pa2 ON p.id = pa2.post_id
LEFT JOIN follows f1 ON u.id = f1.following_id
LEFT JOIN follows f2 ON u.id = f2.follower_id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.username;

-- Indexes
CREATE UNIQUE INDEX idx_user_stats_user ON user_stats(user_id);
CREATE INDEX idx_user_stats_profit ON user_stats(profit DESC);
CREATE INDEX idx_user_stats_roi ON user_stats(roi_percentage DESC);
CREATE INDEX idx_user_stats_wins ON user_stats(wins DESC);
```

### daily_leaderboard
Daily performance rankings.

```sql
CREATE MATERIALIZED VIEW daily_leaderboard AS
WITH daily_stats AS (
  SELECT 
    b.user_id,
    DATE(b.settled_at) as bet_date,
    COUNT(*) as bets_placed,
    COUNT(*) FILTER (WHERE b.status = 'won') as wins,
    COUNT(*) FILTER (WHERE b.status = 'lost') as losses,
    SUM(b.actual_win) FILTER (WHERE b.status = 'won') - 
      SUM(b.stake) FILTER (WHERE b.status = 'lost') as daily_profit
  FROM bets b
  WHERE b.settled_at IS NOT NULL
    AND b.settled_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY b.user_id, DATE(b.settled_at)
)
SELECT 
  ds.bet_date,
  ds.user_id,
  u.username,
  u.avatar_url,
  ds.bets_placed,
  ds.wins,
  ds.losses,
  ds.daily_profit,
  RANK() OVER (PARTITION BY ds.bet_date ORDER BY ds.daily_profit DESC) as rank
FROM daily_stats ds
JOIN users u ON ds.user_id = u.id
WHERE ds.bets_placed >= 3; -- Minimum bets for leaderboard

-- Indexes
CREATE INDEX idx_daily_leaderboard_date ON daily_leaderboard(bet_date DESC);
CREATE INDEX idx_daily_leaderboard_user ON daily_leaderboard(user_id);
```

## Indexes Strategy

### Query Pattern Indexes
```sql
-- Feed Query Pattern
CREATE INDEX idx_feed_query ON posts(created_at DESC) 
WHERE deleted_at IS NULL AND expires_at > NOW();

-- Following Feed Pattern
CREATE INDEX idx_following_posts ON posts(user_id, created_at DESC) 
WHERE deleted_at IS NULL;

-- Active Bets Pattern
CREATE INDEX idx_active_bets ON bets(user_id, status, created_at DESC) 
WHERE status = 'pending';

-- Chat Messages Pattern
CREATE INDEX idx_chat_messages ON messages(chat_id, created_at DESC) 
WHERE deleted_at IS NULL;

-- Unread Notifications Pattern
CREATE INDEX idx_unread_notifications ON notifications(user_id, created_at DESC) 
WHERE read = FALSE;

-- User Search Pattern
CREATE INDEX idx_user_search ON users USING GIN(username gin_trgm_ops);

-- Game Lookup Pattern
CREATE INDEX idx_game_lookup ON games(sport, commence_time) 
WHERE status = 'scheduled';
```

### Performance Indexes
```sql
-- Foreign Key Indexes (automatically created by PostgreSQL 14+)
-- But explicitly defined for clarity

-- Covering Indexes for Common Queries
CREATE INDEX idx_posts_feed_covering ON posts(created_at DESC) 
INCLUDE (user_id, media_url, caption, tail_count, fade_count)
WHERE deleted_at IS NULL AND expires_at > NOW();

CREATE INDEX idx_bets_user_covering ON bets(user_id, status) 
INCLUDE (stake, potential_win, created_at)
WHERE status = 'pending';

-- Partial Indexes for Filtered Queries
CREATE INDEX idx_stories_active_partial ON stories(user_id)
WHERE deleted_at IS NULL AND expires_at > NOW();

CREATE INDEX idx_messages_unread_partial ON messages(chat_id)
WHERE deleted_at IS NULL AND expires_at > NOW();
```

## Row Level Security (RLS)

### Enable RLS on all tables
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bankrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE pick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

### User Policies
```sql
-- Users can view any profile
CREATE POLICY "Users viewable by all" ON users
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users cannot delete profiles (soft delete only)
CREATE POLICY "No user deletion" ON users
  FOR DELETE USING (false);
```

### Bankroll Policies
```sql
-- Users can only view their own bankroll
CREATE POLICY "Own bankroll only" ON bankrolls
  FOR SELECT USING (user_id = auth.uid());

-- System can update bankrolls (via functions)
CREATE POLICY "System bankroll updates" ON bankrolls
  FOR UPDATE USING (true)
  WITH CHECK (true);
```

### Bet Policies
```sql
-- Users can view their own bets
CREATE POLICY "Own bets viewable" ON bets
  FOR SELECT USING (user_id = auth.uid());

-- Users can view bets attached to visible posts
CREATE POLICY "Public pick bets viewable" ON bets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts p
      WHERE p.bet_id = bets.id
      AND p.deleted_at IS NULL
      AND (
        p.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM follows f
          WHERE f.follower_id = auth.uid()
          AND f.following_id = p.user_id
        )
      )
    )
  );

-- Users can only create their own bets
CREATE POLICY "Create own bets" ON bets
  FOR INSERT WITH CHECK (user_id = auth.uid());
```

### Post Policies
```sql
-- Users can see posts from people they follow + their own
CREATE POLICY "View followee posts" ON posts
  FOR SELECT USING (
    deleted_at IS NULL AND (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM follows f
        WHERE f.follower_id = auth.uid()
        AND f.following_id = posts.user_id
      )
    )
  );

-- Users can create their own posts
CREATE POLICY "Create own posts" ON posts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can delete their own posts
CREATE POLICY "Delete own posts" ON posts
  FOR UPDATE USING (user_id = auth.uid());
```

### Message Policies
```sql
-- Users can view messages in their chats
CREATE POLICY "View messages in member chats" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_members cm
      WHERE cm.chat_id = messages.chat_id
      AND cm.user_id = auth.uid()
    )
  );

-- Users can send messages to their chats
CREATE POLICY "Send messages to member chats" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_members cm
      WHERE cm.chat_id = messages.chat_id
      AND cm.user_id = auth.uid()
    )
  );
```

## Database Functions

### place_bet
Handles bet placement with bankroll management.

```sql
CREATE OR REPLACE FUNCTION place_bet(
  p_user_id UUID,
  p_game_id TEXT,
  p_bet_type TEXT,
  p_bet_details JSONB,
  p_stake INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_bankroll RECORD;
  v_bet RECORD;
  v_odds INTEGER;
  v_potential_win INTEGER;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Start transaction
  LOCK TABLE bankrolls IN ROW EXCLUSIVE MODE;
  
  -- Get current bankroll
  SELECT * INTO v_bankroll 
  FROM bankrolls 
  WHERE user_id = p_user_id 
  FOR UPDATE;
  
  -- Check sufficient funds
  IF v_bankroll.balance < p_stake THEN
    RAISE EXCEPTION 'Insufficient funds: % < %', v_bankroll.balance, p_stake;
  END IF;
  
  -- Get game expiration
  SELECT commence_time INTO v_expires_at
  FROM games
  WHERE id = p_game_id;
  
  IF v_expires_at < NOW() THEN
    RAISE EXCEPTION 'Game has already started';
  END IF;
  
  -- Calculate potential win
  v_odds := (p_bet_details->>'odds')::INTEGER;
  v_potential_win := calculate_payout(p_stake, v_odds);
  
  -- Deduct from bankroll
  UPDATE bankrolls
  SET 
    balance = balance - p_stake,
    total_wagered = total_wagered + p_stake,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Create bet
  INSERT INTO bets (
    user_id,
    game_id,
    bet_type,
    bet_details,
    stake,
    odds,
    potential_win,
    expires_at
  ) VALUES (
    p_user_id,
    p_game_id,
    p_bet_type,
    p_bet_details,
    p_stake,
    v_odds,
    v_potential_win,
    v_expires_at
  )
  RETURNING * INTO v_bet;
  
  -- Return result
  RETURN jsonb_build_object(
    'bet', row_to_json(v_bet),
    'bankroll', jsonb_build_object(
      'previous', v_bankroll.balance + p_stake,
      'current', v_bankroll.balance
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### tail_pick
Creates a tail bet copying the original pick.

```sql
CREATE OR REPLACE FUNCTION tail_pick(
  p_post_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_original_bet RECORD;
  v_new_bet RECORD;
  v_action RECORD;
  v_pick_owner UUID;
BEGIN
  -- Get original bet details
  SELECT b.*, p.user_id as pick_owner
  INTO v_original_bet, v_pick_owner
  FROM posts p
  JOIN bets b ON p.bet_id = b.id
  WHERE p.id = p_post_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pick not found';
  END IF;
  
  -- Check if already tailed/faded
  IF EXISTS (
    SELECT 1 FROM pick_actions
    WHERE post_id = p_post_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Already tailed or faded this pick';
  END IF;
  
  -- Check if game started
  IF v_original_bet.expires_at < NOW() THEN
    RAISE EXCEPTION 'Game has already started';
  END IF;
  
  -- Create tail bet (same parameters)
  SELECT * INTO v_new_bet
  FROM place_bet(
    p_user_id,
    v_original_bet.game_id,
    v_original_bet.bet_type,
    v_original_bet.bet_details,
    v_original_bet.stake
  );
  
  -- Update bet metadata
  UPDATE bets 
  SET 
    is_tail = TRUE,
    original_pick_id = p_post_id
  WHERE id = (v_new_bet->>'bet')::JSON->>'id';
  
  -- Create pick action
  INSERT INTO pick_actions (
    post_id,
    user_id,
    action_type,
    resulting_bet_id
  ) VALUES (
    p_post_id,
    p_user_id,
    'tail',
    (v_new_bet->>'bet')::JSON->>'id'
  )
  RETURNING * INTO v_action;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, data)
  VALUES (
    v_pick_owner,
    'tail',
    jsonb_build_object(
      'actor_id', p_user_id,
      'post_id', p_post_id,
      'bet_amount', v_original_bet.stake
    )
  );
  
  RETURN jsonb_build_object(
    'action', row_to_json(v_action),
    'bet', v_new_bet->>'bet'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### fade_pick
Creates an opposite bet to fade the original pick.

```sql
CREATE OR REPLACE FUNCTION fade_pick(
  p_post_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_original_bet RECORD;
  v_fade_details JSONB;
  v_new_bet RECORD;
  v_action RECORD;
BEGIN
  -- Get original bet
  SELECT b.*
  INTO v_original_bet
  FROM posts p
  JOIN bets b ON p.bet_id = b.id
  WHERE p.id = p_post_id;
  
  -- Calculate opposite bet
  CASE v_original_bet.bet_type
    WHEN 'spread' THEN
      -- Opposite team, opposite line
      v_fade_details := jsonb_build_object(
        'team', CASE 
          WHEN v_original_bet.bet_details->>'team' = 
               (SELECT home_team FROM games WHERE id = v_original_bet.game_id)
          THEN (SELECT away_team FROM games WHERE id = v_original_bet.game_id)
          ELSE (SELECT home_team FROM games WHERE id = v_original_bet.game_id)
        END,
        'line', -(v_original_bet.bet_details->>'line')::NUMERIC,
        'odds', v_original_bet.bet_details->>'odds'
      );
      
    WHEN 'total' THEN
      -- Opposite over/under
      v_fade_details := jsonb_build_object(
        'total_type', CASE v_original_bet.bet_details->>'total_type'
          WHEN 'over' THEN 'under'
          ELSE 'over'
        END,
        'line', v_original_bet.bet_details->>'line',
        'odds', v_original_bet.bet_details->>'odds'
      );
      
    WHEN 'moneyline' THEN
      -- Opposite team with current ML odds
      v_fade_details := jsonb_build_object(
        'team', CASE 
          WHEN v_original_bet.bet_details->>'team' = 
               (SELECT home_team FROM games WHERE id = v_original_bet.game_id)
          THEN (SELECT away_team FROM games WHERE id = v_original_bet.game_id)
          ELSE (SELECT home_team FROM games WHERE id = v_original_bet.game_id)
        END,
        'odds', get_current_ml_odds(
          v_original_bet.game_id,
          CASE 
            WHEN v_original_bet.bet_details->>'team' = 
                 (SELECT home_team FROM games WHERE id = v_original_bet.game_id)
            THEN 'away'
            ELSE 'home'
          END
        )
      );
  END CASE;
  
  -- Place fade bet
  SELECT * INTO v_new_bet
  FROM place_bet(
    p_user_id,
    v_original_bet.game_id,
    v_original_bet.bet_type,
    v_fade_details,
    v_original_bet.stake
  );
  
  -- Update bet metadata
  UPDATE bets 
  SET 
    is_fade = TRUE,
    original_pick_id = p_post_id
  WHERE id = (v_new_bet->>'bet')::JSON->>'id';
  
  -- Create pick action
  INSERT INTO pick_actions (
    post_id,
    user_id,
    action_type,
    resulting_bet_id
  ) VALUES (
    p_post_id,
    p_user_id,
    'fade',
    (v_new_bet->>'bet')::JSON->>'id'
  )
  RETURNING * INTO v_action;
  
  RETURN jsonb_build_object(
    'action', row_to_json(v_action),
    'bet', v_new_bet->>'bet'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### settle_game_bets
Settles all bets for a completed game.

```sql
CREATE OR REPLACE FUNCTION settle_game_bets(
  p_game_id TEXT,
  p_home_score INTEGER,
  p_away_score INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_bet RECORD;
  v_game RECORD;
  v_result TEXT;
  v_actual_win INTEGER;
  v_settled_count INTEGER := 0;
  v_total_paid INTEGER := 0;
BEGIN
  -- Update game with scores
  UPDATE games
  SET 
    home_score = p_home_score,
    away_score = p_away_score,
    status = 'completed',
    last_updated = NOW()
  WHERE id = p_game_id
  RETURNING * INTO v_game;
  
  -- Process each pending bet
  FOR v_bet IN 
    SELECT * FROM bets 
    WHERE game_id = p_game_id 
    AND status = 'pending'
  LOOP
    -- Calculate result based on bet type
    v_result := calculate_bet_result(
      v_bet.bet_type,
      v_bet.bet_details,
      v_game.home_team,
      v_game.away_team,
      p_home_score,
      p_away_score
    );
    
    -- Calculate actual win
    v_actual_win := CASE v_result
      WHEN 'won' THEN v_bet.potential_win
      WHEN 'push' THEN 0
      ELSE -v_bet.stake
    END;
    
    -- Update bet
    UPDATE bets
    SET 
      status = v_result,
      actual_win = v_actual_win,
      settled_at = NOW()
    WHERE id = v_bet.id;
    
    -- Update bankroll
    IF v_result = 'won' THEN
      UPDATE bankrolls
      SET 
        balance = balance + v_bet.stake + v_bet.potential_win,
        total_won = total_won + v_bet.potential_win,
        win_count = win_count + 1,
        updated_at = NOW()
      WHERE user_id = v_bet.user_id;
      
      v_total_paid := v_total_paid + v_bet.stake + v_bet.potential_win;
      
    ELSIF v_result = 'push' THEN
      UPDATE bankrolls
      SET 
        balance = balance + v_bet.stake,
        push_count = push_count + 1,
        updated_at = NOW()
      WHERE user_id = v_bet.user_id;
      
      v_total_paid := v_total_paid + v_bet.stake;
      
    ELSE -- lost
      UPDATE bankrolls
      SET 
        loss_count = loss_count + 1,
        updated_at = NOW()
      WHERE user_id = v_bet.user_id;
    END IF;
    
    -- Create notification
    INSERT INTO notifications (user_id, type, data)
    VALUES (
      v_bet.user_id,
      CASE v_result 
        WHEN 'won' THEN 'bet_won'
        WHEN 'lost' THEN 'bet_lost'
        ELSE 'bet_push'
      END,
      jsonb_build_object(
        'bet_id', v_bet.id,
        'game_id', p_game_id,
        'amount', ABS(v_actual_win),
        'home_team', v_game.home_team,
        'away_team', v_game.away_team,
        'home_score', p_home_score,
        'away_score', p_away_score
      )
    );
    
    v_settled_count := v_settled_count + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'settled_count', v_settled_count,
    'total_paid_out', v_total_paid,
    'game', row_to_json(v_game)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### calculate_payout
Calculates potential payout from American odds.

```sql
CREATE OR REPLACE FUNCTION calculate_payout(
  p_stake INTEGER,
  p_odds INTEGER
) RETURNS INTEGER AS $$
BEGIN
  IF p_odds > 0 THEN
    -- Positive odds: stake * (odds/100)
    RETURN ROUND(p_stake * (p_odds::DECIMAL / 100));
  ELSE
    -- Negative odds: stake / (odds/-100)
    RETURN ROUND(p_stake / (ABS(p_odds)::DECIMAL / 100));
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### reset_bankroll
Resets user's bankroll to starting amount.

```sql
CREATE OR REPLACE FUNCTION reset_bankroll(
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_old_balance INTEGER;
  v_reset_count INTEGER;
BEGIN
  -- Get current state
  SELECT balance, reset_count 
  INTO v_old_balance, v_reset_count
  FROM bankrolls
  WHERE user_id = p_user_id;
  
  -- Reset bankroll
  UPDATE bankrolls
  SET 
    balance = 100000, -- $1000.00
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
    reset_count = reset_count + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Cancel pending bets
  UPDATE bets
  SET 
    status = 'cancelled',
    settled_at = NOW()
  WHERE user_id = p_user_id 
  AND status = 'pending';
  
  RETURN jsonb_build_object(
    'old_balance', v_old_balance,
    'new_balance', 100000,
    'reset_count', v_reset_count + 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### get_feed
Retrieves personalized feed for user.

```sql
CREATE OR REPLACE FUNCTION get_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  post_id UUID,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  media_url TEXT,
  media_type TEXT,
  caption TEXT,
  bet_id UUID,
  bet_details JSONB,
  tail_count INTEGER,
  fade_count INTEGER,
  user_action TEXT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as post_id,
    p.user_id,
    u.username,
    u.avatar_url,
    p.media_url,
    p.media_type,
    p.caption,
    p.bet_id,
    CASE 
      WHEN b.id IS NOT NULL THEN
        jsonb_build_object(
          'bet_type', b.bet_type,
          'bet_details', b.bet_details,
          'stake', b.stake,
          'odds', b.odds
        )
      ELSE NULL
    END as bet_details,
    p.tail_count,
    p.fade_count,
    pa.action_type as user_action,
    p.created_at,
    p.expires_at
  FROM posts p
  JOIN users u ON p.user_id = u.id
  LEFT JOIN bets b ON p.bet_id = b.id
  LEFT JOIN pick_actions pa ON p.id = pa.post_id AND pa.user_id = p_user_id
  WHERE p.deleted_at IS NULL
    AND p.expires_at > NOW()
    AND (
      p.user_id = p_user_id OR
      p.user_id IN (
        SELECT following_id 
        FROM follows 
        WHERE follower_id = p_user_id
      )
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;
```

## Triggers

### Update timestamps trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bankrolls_updated_at BEFORE UPDATE ON bankrolls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ... (apply to all relevant tables)
```

### Update pick counts trigger
```sql
CREATE OR REPLACE FUNCTION update_pick_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts
    SET 
      tail_count = CASE 
        WHEN NEW.action_type = 'tail' 
        THEN tail_count + 1 
        ELSE tail_count 
      END,
      fade_count = CASE 
        WHEN NEW.action_type = 'fade' 
        THEN fade_count + 1 
        ELSE fade_count 
      END
    WHERE id = NEW.post_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts
    SET 
      tail_count = CASE 
        WHEN OLD.action_type = 'tail' 
        THEN GREATEST(tail_count - 1, 0)
        ELSE tail_count 
      END,
      fade_count = CASE 
        WHEN OLD.action_type = 'fade' 
        THEN GREATEST(fade_count - 1, 0)
        ELSE fade_count 
      END
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pick_counts_trigger
AFTER INSERT OR DELETE ON pick_actions
FOR EACH ROW EXECUTE FUNCTION update_pick_counts();
```

### Update reaction counts trigger
```sql
CREATE OR REPLACE FUNCTION update_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts
    SET reaction_count = reaction_count + 1
    WHERE id = NEW.post_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts
    SET reaction_count = GREATEST(reaction_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reaction_count_trigger
AFTER INSERT OR DELETE ON reactions
FOR EACH ROW EXECUTE FUNCTION update_reaction_count();
```

### Update chat last message trigger
```sql
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats
  SET last_message_at = NEW.created_at
  WHERE id = NEW.chat_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_last_message_trigger
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_chat_last_message();
```

### Update bankroll high/low trigger
```sql
CREATE OR REPLACE FUNCTION update_bankroll_extremes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.balance > NEW.season_high THEN
    NEW.season_high := NEW.balance;
  END IF;
  
  IF NEW.balance < NEW.season_low THEN
    NEW.season_low := NEW.balance;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bankroll_extremes_trigger
BEFORE UPDATE OF balance ON bankrolls
FOR EACH ROW EXECUTE FUNCTION update_bankroll_extremes();
```

## Data Types & Constraints

### Custom Types
```sql
-- Status enums
CREATE TYPE bet_status AS ENUM ('pending', 'won', 'lost', 'push', 'cancelled');
CREATE TYPE game_status AS ENUM ('scheduled', 'live', 'completed', 'cancelled');
CREATE TYPE notification_type AS ENUM (
  'tail', 'fade', 'bet_won', 'bet_lost', 'tail_won', 'tail_lost',
  'fade_won', 'fade_lost', 'follow', 'message', 'mention', 'milestone'
);

-- Bet types
CREATE TYPE bet_type AS ENUM ('spread', 'total', 'moneyline');
CREATE TYPE action_type AS ENUM ('tail', 'fade');
CREATE TYPE chat_type AS ENUM ('dm', 'group');
CREATE TYPE media_type AS ENUM ('photo', 'video');
```

### Check Constraints
```sql
-- Ensure positive amounts
ALTER TABLE bankrolls ADD CONSTRAINT positive_balance 
  CHECK (balance >= 0);

ALTER TABLE bets ADD CONSTRAINT positive_stake 
  CHECK (stake > 0);

-- Ensure valid odds
ALTER TABLE bets ADD CONSTRAINT valid_odds 
  CHECK (odds != 0 AND odds >= -10000 AND odds <= 10000);

-- Ensure expiration after creation
ALTER TABLE posts ADD CONSTRAINT valid_expiration 
  CHECK (expires_at > created_at);

ALTER TABLE stories ADD CONSTRAINT valid_story_expiration 
  CHECK (expires_at > created_at);

-- Ensure valid usernames
ALTER TABLE users ADD CONSTRAINT valid_username 
  CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$');

-- Ensure valid team codes
ALTER TABLE users ADD CONSTRAINT valid_team 
  CHECK (favorite_team ~ '^[A-Z]{2,3}$' OR favorite_team IS NULL);
```

### Domain Constraints
```sql
-- Create domains for reusable constraints
CREATE DOMAIN username_domain AS TEXT
  CHECK (VALUE ~ '^[a-zA-Z0-9_]{3,20}$');

CREATE DOMAIN email_domain AS TEXT
  CHECK (VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

CREATE DOMAIN positive_integer AS INTEGER
  CHECK (VALUE > 0);

CREATE DOMAIN percentage AS DECIMAL
  CHECK (VALUE >= 0 AND VALUE <= 100);
```

## Performance Optimization

### Query Optimization
```sql
-- Analyze query performance
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Most expensive queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  stddev_time,
  rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;

-- Table statistics
ANALYZE users;
ANALYZE bets;
ANALYZE posts;
-- ... analyze all tables

-- Vacuum settings for high-update tables
ALTER TABLE bankrolls SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE bets SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE posts SET (autovacuum_vacuum_scale_factor = 0.1);
```

### Partitioning Strategy
```sql
-- Partition bets by month for better performance
CREATE TABLE bets_2024_06 PARTITION OF bets
  FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');

CREATE TABLE bets_2024_07 PARTITION OF bets
  FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');

-- Partition posts by week
CREATE TABLE posts_2024_w25 PARTITION OF posts
  FOR VALUES FROM ('2024-06-17') TO ('2024-06-24');

-- Automate partition creation
CREATE OR REPLACE FUNCTION create_monthly_partitions()
RETURNS void AS $$
DECLARE
  start_date DATE;
  end_date DATE;
  partition_name TEXT;
BEGIN
  start_date := DATE_TRUNC('month', CURRENT_DATE);
  end_date := start_date + INTERVAL '1 month';
  
  -- Create next 3 months of partitions
  FOR i IN 0..2 LOOP
    partition_name := 'bets_' || TO_CHAR(start_date, 'YYYY_MM');
    
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I PARTITION OF bets
       FOR VALUES FROM (%L) TO (%L)',
      partition_name,
      start_date,
      end_date
    );
    
    start_date := end_date;
    end_date := start_date + INTERVAL '1 month';
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### Connection Pooling
```sql
-- Recommended connection settings
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- Connection pool settings (in application)
-- Min: 10, Max: 50, Idle timeout: 30s
```

## Data Retention & Cleanup

### Scheduled cleanup jobs
```sql
-- Install pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Cleanup expired posts
SELECT cron.schedule(
  'cleanup-expired-posts',
  '0 * * * *', -- Every hour
  $$
  UPDATE posts 
  SET deleted_at = NOW() 
  WHERE expires_at < NOW() 
  AND deleted_at IS NULL;
  
  DELETE FROM posts 
  WHERE deleted_at < NOW() - INTERVAL '7 days';
  $$
);

-- Cleanup expired stories
SELECT cron.schedule(
  'cleanup-expired-stories',
  '0 * * * *', -- Every hour
  $$
  DELETE FROM stories 
  WHERE expires_at < NOW() - INTERVAL '48 hours';
  $$
);

-- Cleanup expired messages
SELECT cron.schedule(
  'cleanup-expired-messages',
  '0 */6 * * *', -- Every 6 hours
  $$
  UPDATE messages 
  SET deleted_at = NOW() 
  WHERE expires_at < NOW() 
  AND deleted_at IS NULL;
  
  DELETE FROM messages 
  WHERE deleted_at < NOW() - INTERVAL '7 days';
  $$
);

-- Cleanup old notifications
SELECT cron.schedule(
  'cleanup-old-notifications',
  '0 0 * * *', -- Daily
  $$
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '30 days';
  $$
);

-- Refresh materialized views
SELECT cron.schedule(
  'refresh-user-stats',
  '*/10 * * * *', -- Every 10 minutes
  $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats;
  $$
);

SELECT cron.schedule(
  'refresh-daily-leaderboard',
  '0 */1 * * *', -- Every hour
  $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_leaderboard;
  $$
);
```

### Archival strategy
```sql
-- Archive old bets
CREATE TABLE bets_archive (
  LIKE bets INCLUDING ALL
);

-- Archive function
CREATE OR REPLACE FUNCTION archive_old_bets()
RETURNS void AS $$
BEGIN
  -- Move settled bets older than 6 months to archive
  INSERT INTO bets_archive
  SELECT * FROM bets
  WHERE settled_at < NOW() - INTERVAL '6 months';
  
  DELETE FROM bets
  WHERE settled_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- Schedule monthly archival
SELECT cron.schedule(
  'archive-old-bets',
  '0 0 1 * *', -- First day of month
  'SELECT archive_old_bets();'
);
```

## Migration Strategy

### Initial schema migration
```sql
-- migrations/001_initial_schema.sql
BEGIN;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create all tables
-- ... (all CREATE TABLE statements)

-- Create all indexes
-- ... (all CREATE INDEX statements)

-- Enable RLS
-- ... (all RLS policies)

-- Create functions
-- ... (all functions)

-- Create triggers
-- ... (all triggers)

-- Initial data
INSERT INTO users (id, email, username, oauth_provider, oauth_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'system@snapbet.com', 'system', 'google', 'system');

COMMIT;
```

### Rollback strategy
```sql
-- migrations/001_rollback.sql
BEGIN;

-- Drop in reverse order of dependencies
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS message_reads CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_members CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS story_views CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS pick_actions CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS bets CASCADE;
DROP TABLE IF EXISTS bankrolls CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS place_bet CASCADE;
DROP FUNCTION IF EXISTS tail_pick CASCADE;
DROP FUNCTION IF EXISTS fade_pick CASCADE;
DROP FUNCTION IF EXISTS settle_game_bets CASCADE;
DROP FUNCTION IF EXISTS calculate_payout CASCADE;
DROP FUNCTION IF EXISTS reset_bankroll CASCADE;
DROP FUNCTION IF EXISTS get_feed CASCADE;

-- Drop materialized views
DROP MATERIALIZED VIEW IF EXISTS user_stats CASCADE;
DROP MATERIALIZED VIEW IF EXISTS daily_leaderboard CASCADE;

-- Drop extensions
DROP EXTENSION IF EXISTS pg_cron CASCADE;
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
DROP EXTENSION IF EXISTS pgcrypto CASCADE;
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

COMMIT;