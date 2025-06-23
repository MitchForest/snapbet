# Sprint 01.01: Database & Backend Setup

## Sprint Overview

**Epic**: 01 - Foundation & Infrastructure  
**Sprint**: 01.01  
**Name**: Database & Backend Setup  
**Status**: NOT STARTED  
**Estimated Duration**: 3.5 hours  
**Actual Duration**: -  

## Sprint Objectives

- Create and configure Supabase project
- Deploy complete database schema from database.md
- Set up Row Level Security policies
- Configure storage buckets for media
- Create Supabase client service
- Design mock odds data structure

## Required Documentation

- **[Database Design](.pm/docs/database.md)** - Complete schema, RLS policies, functions
- **[Mock Data Strategy](.pm/docs/mock.md)** - Mock user columns and data structure

## Success Criteria

- [ ] All database tables created successfully
- [ ] RLS policies prevent unauthorized access
- [ ] Can upload/retrieve from storage buckets
- [ ] TypeScript types match database schema
- [ ] Mock odds structure defined and documented
- [ ] Database functions are working

## Tasks

### 1. Create Supabase Project (15 minutes for account setup)
- [ ] Sign up/login to Supabase
- [ ] Create new project "snapfade"
- [ ] Note project URL and anon key
- [ ] Update `.env` with credentials
- [ ] Familiarize with Supabase dashboard

### 2. Deploy Core Tables
- [ ] Create migration file `001_initial_schema.sql`
- [ ] **Reference [database.md Core Tables section](.pm/docs/database.md#core-tables)** for exact schema
- [ ] Deploy user tables:
  - [ ] users (with is_mock, mock_personality_id, mock_behavior_seed columns per [mock.md](.pm/docs/mock.md#mock-data-identification))
  - [ ] bankrolls
- [ ] Deploy betting tables:
  - [ ] bets
  - [ ] games
  - [ ] pick_actions
- [ ] Deploy social tables:
  - [ ] posts
  - [ ] stories
  - [ ] reactions
  - [ ] story_views
  - [ ] follows
- [ ] Deploy messaging tables:
  - [ ] chats
  - [ ] chat_members
  - [ ] messages
  - [ ] message_reads
- [ ] Deploy system tables:
  - [ ] notifications

### 3. Set Up Row Level Security
- [ ] Enable RLS on all tables
- [ ] **Reference [database.md RLS section](.pm/docs/database.md#row-level-security-rls)** for exact policies
- [ ] Create user policies (view any, update own)
- [ ] Create bankroll policies (view own only)
- [ ] Create bet policies (view own + public picks)
- [ ] Create post policies (view following + own)
- [ ] Create message policies (view/send in member chats)
- [ ] Test RLS with different user contexts

### 4. Create Database Functions
- [ ] **Reference [database.md Functions section](.pm/docs/database.md#database-functions)** for implementations
- [ ] `place_bet` - Handle bet placement with bankroll
- [ ] `tail_pick` - Create tail bet copying original
- [ ] `fade_pick` - Create opposite bet
- [ ] `settle_game_bets` - Settle all bets for a game
- [ ] `calculate_payout` - American odds calculation
- [ ] `reset_bankroll` - Reset to $1,000
- [ ] `get_feed` - Personalized feed query

### 5. Configure Storage Buckets
- [ ] Create `avatars` bucket (public read)
- [ ] Create `posts` bucket (authenticated read)
- [ ] Create `stories` bucket (authenticated read)
- [ ] Set up storage policies
- [ ] Test file upload/download

### 6. Set Up Supabase Client Service
- [ ] Create `services/supabase/client.ts`
- [ ] Configure Supabase client
- [ ] Create error handling helpers:
  ```typescript
  // services/supabase/helpers.ts
  export class SupabaseError extends Error {
    constructor(message: string, public code?: string) {
      super(message)
    }
  }
  
  export async function handleSupabaseError<T>(
    promise: Promise<PostgrestResponse<T>>
  ): Promise<T> {
    const { data, error } = await promise
    if (error) throw new SupabaseError(error.message, error.code)
    return data as T
  }
  ```
- [ ] Generate TypeScript types from schema:
  ```bash
  bunx supabase gen types typescript --project-id [id] > types/supabase.ts
  ```
- [ ] Create test connection script:
  ```typescript
  // scripts/test-connection.ts
  import { supabase } from '@/services/supabase'
  
  async function testConnection() {
    try {
      const { count } = await supabase.from('users').select('*', { count: 'exact', head: true })
      console.log('✅ Connected to Supabase. Users table exists.')
    } catch (error) {
      console.error('❌ Connection failed:', error)
    }
  }
  ```

### 7. Design Mock Odds Structure
- [ ] Define structure following The Odds API:
  ```typescript
  interface MockOdds {
    id: string;
    sport_key: string;
    sport_title: string;
    commence_time: string;
    home_team: string;
    away_team: string;
    bookmakers: {
      key: string;
      title: string;
      markets: {
        h2h?: { home: number; away: number };
        spreads?: { 
          points: number;
          home: number;
          away: number;
        };
        totals?: {
          points: number;
          over: number;
          under: number;
        };
      };
    }[];
  }
  ```
- [ ] Document in `types/odds.ts`

### 8. Create Triggers
- [ ] Update timestamps trigger
- [ ] Update pick counts trigger
- [ ] Update reaction counts trigger
- [ ] Update chat last message trigger
- [ ] Update bankroll high/low trigger

### 9. Create Mock Data Indexes
- [ ] Create indexes for mock data queries:
  ```sql
  CREATE INDEX idx_users_is_mock ON users(is_mock);
  CREATE INDEX idx_users_personality ON users(mock_personality_id) WHERE is_mock = TRUE;
  ```

### 10. Create Initial Seed Data
- [ ] Create `supabase/seed.sql` with system user:
  ```sql
  -- System user for testing
  INSERT INTO users (id, email, username, oauth_provider, oauth_id) 
  VALUES (
    '00000000-0000-0000-0000-000000000001',
    'system@snapfade.com',
    'system',
    'google',
    'system'
  );
  ```
- [ ] Create RLS testing documentation in `docs/RLS-TESTING.md`

### 11. Verify Everything
- [ ] Run test queries for each table
- [ ] Test all database functions
- [ ] Verify RLS policies work correctly
- [ ] Test storage upload/download
- [ ] Ensure TypeScript types are accurate
- [ ] Run connection test script: `bun run test:connection`

## Technical Decisions

### Database Extensions
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For search
```

### Key Constraints
- Usernames must be unique and match pattern `^[a-zA-Z0-9_]{3,20}$`
- Minimum bet stake: $5.00 (500 cents)
- Bankroll starts at $1,000.00 (100000 cents)
- Posts expire after 24 hours or at game time
- Messages disappear after 24 hours

### Storage Structure
```
avatars/
  {user_id}/avatar.jpg
posts/
  {post_id}/media.{jpg|mp4}
  {post_id}/thumbnail.jpg
stories/
  {story_id}/media.{jpg|mp4}
```

## Known Issues & Blockers

- None identified yet

## Notes

- All monetary values stored in cents (integer)
- Using JSONB for flexible bet details
- Soft deletes with `deleted_at` for posts/messages
- Hard deletes for expired stories

## Handoff to Reviewer

**Status**: NOT STARTED

### What Was Implemented
[To be completed at sprint end]

### Files Modified/Created
[To be completed at sprint end]

### Key Decisions Made
[To be completed at sprint end]

### Testing Performed
[To be completed at sprint end]

---

*Sprint Started: -*  
*Sprint Completed: -* 