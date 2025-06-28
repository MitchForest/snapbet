# Sprint 8.01: Database Infrastructure Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: [TBD]  
**End Date**: [TBD]  
**Epic**: 8 - RAG Implementation

**Sprint Goal**: Set up pgvector extension, create archive columns for ephemeral content, implement embedding columns, and create RPC functions for vector similarity search.

**User Story Contribution**: 
- Enables database infrastructure for all 4 RAG features (AI Captions, Find Your Tribe, Enhanced Feed, Consensus Alerts)

## 🚨 Required Development Practices

### Database Management
- **Use Supabase MCP** to inspect current database state: `mcp_supabase_get_schemas`, `mcp_supabase_get_tables`, etc.
- **Keep types synchronized**: Run type generation after ANY schema changes
- **Migration files required**: Every database change needs a migration file
- **Test migrations**: Ensure migrations run cleanly on fresh database

### UI/UX Consistency
- **Use Tamagui components**: `View`, `Text`, `XStack`, `YStack`, `Stack`
- **Follow UI/UX rules**: See `.pm/process/ui-ux-consistency-rules.md`
- **Use Colors constant**: Import from `@/theme` - NEVER hardcode colors
- **Standard spacing**: Use Tamagui's `$1`, `$2`, `$3`, etc. tokens

### Code Quality
- **Zero tolerance**: No lint errors, no TypeScript errors
- **Type safety**: No `any` types without explicit justification
- **Run before handoff**: `bun run lint && bun run typecheck`

## Sprint Plan

### Objectives
1. Enable pgvector extension in Supabase
2. Add archive columns to all ephemeral tables (posts, bets, stories, messages, reactions, pick_actions)
3. Add embedding columns to posts, bets, and users tables
4. Create RPC functions for vector similarity search
5. Update TypeScript types to reflect new database schema

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `supabase/migrations/032_add_rag_support.sql` | Complete migration for pgvector, archive columns, embeddings, and RPC functions | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `types/database.ts` | Add archived?: boolean to Post, Bet, Story, Message, Reaction, PickAction interfaces | NOT STARTED |
| `types/database.ts` | Add embedding?: number[] to Post and Bet interfaces | NOT STARTED |
| `types/database.ts` | Add profile_embedding?: number[], last_embedding_update?: string, favorite_teams?: string[] to User interface | NOT STARTED |
| `types/database.ts` | Add 'consensus_alert' to notification_type enum | NOT STARTED |
| `types/database.ts` | Add embedding_metadata table type definition | NOT STARTED |
| `.env.example` | Add EXPO_PUBLIC_OPENAI_API_KEY and SUPABASE_SERVICE_KEY examples | NOT STARTED |
| `package.json` | Ensure @supabase/supabase-js supports vector type | NOT STARTED |

### Implementation Approach

**Step 1: Verify pgvector availability**
```bash
# Use Supabase MCP to check if pgvector is available
mcp_supabase_execute_postgresql "SELECT * FROM pg_available_extensions WHERE name = 'vector';"
```

**Step 2: Create comprehensive migration**
The migration will include:
1. Enable pgvector extension
2. Add archive columns to 6 tables
3. Add embedding columns to 3 tables
4. Add favorite_teams to users
5. Create embedding_metadata table
6. Create 3 RPC functions for similarity search
7. Create proper indexes for performance

**Step 3: Test migration locally**
1. Run migration on local Supabase instance
2. Verify all columns and functions created
3. Test RPC functions with sample data

**Step 4: Update TypeScript types**
Ensure all new columns are reflected in type definitions with proper optionality.

**Key Technical Decisions**:
- Use vector(1536) for OpenAI text-embedding-3-small compatibility
- Archive columns default to false for backward compatibility
- Use ivfflat indexes for better performance at scale
- RPC functions handle privacy filters internally

### Dependencies & Risks
**Dependencies**:
- pgvector extension must be available on Supabase
- Existing tables must exist (posts, bets, users, etc.)

**Identified Risks**:
- pgvector might not be enabled → Check with MCP first
- Migration size is large → Break into sections with comments
- Index creation might be slow on large tables → Add CONCURRENTLY if needed

## Implementation Log

### Day-by-Day Progress
**Day 1 - Sprint Start**:
- Started: Deep investigation of database state and codebase patterns
- Completed: 
  - Verified pgvector 0.8.0 is available but not enabled
  - Confirmed all 6 ephemeral tables exist
  - Identified migration numbering (next is 033)
  - Analyzed type system structure
  - Checked package dependencies
- Blockers: None
- Decisions: 
  - Use migration 033 (not 032 as originally planned)
  - No need to update @supabase/supabase-js (v2.50.0 supports vectors)
  - Create .env.example since it doesn't exist

### Reality Checks & Plan Updates

**Reality Check 1** - Day 1
- Issue: No notification_type enum exists in database
- Options Considered:
  1. Create notification_type enum - Pros: Type safety / Cons: Breaking change
  2. Keep string type, document valid values - Pros: Backward compatible / Cons: Less type safety
- Decision: Keep string type, add comment documenting valid notification types
- Plan Update: Remove enum creation from migration, add documentation comment instead
- Epic Impact: None - notification type handling remains flexible

**Reality Check 2** - Day 1  
- Issue: .env.example file doesn't exist
- Options Considered:
  1. Skip creating it - Pros: Less work / Cons: Poor developer experience
  2. Create comprehensive example - Pros: Better onboarding / Cons: Extra work
- Decision: Create comprehensive .env.example with all variables
- Plan Update: Added .env.example creation to sprint tasks
- Epic Impact: Improves developer experience for epic

### Code Quality Checks

**Linting Results**:
- [ ] Initial run: [X errors, Y warnings]
- [ ] Final run: [Should be 0 errors]

**Type Checking Results**:
- [ ] Initial run: [X errors]
- [ ] Final run: [Should be 0 errors]

**Build Results**:
- [ ] Development build passes
- [ ] Production build passes

## Key Code Additions

### Migration Structure
```sql
-- 033_add_rag_support.sql structure:
-- 1. Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add archive columns (6 tables)
ALTER TABLE posts ADD COLUMN archived BOOLEAN DEFAULT false;
ALTER TABLE bets ADD COLUMN archived BOOLEAN DEFAULT false;
ALTER TABLE stories ADD COLUMN archived BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN archived BOOLEAN DEFAULT false;
ALTER TABLE reactions ADD COLUMN archived BOOLEAN DEFAULT false;
ALTER TABLE pick_actions ADD COLUMN archived BOOLEAN DEFAULT false;

-- 3. Add embedding columns (3 tables)
ALTER TABLE posts ADD COLUMN embedding vector(1536);
ALTER TABLE bets ADD COLUMN embedding vector(1536);
ALTER TABLE users ADD COLUMN profile_embedding vector(1536);
ALTER TABLE users ADD COLUMN last_embedding_update TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN favorite_teams TEXT[];

-- 4. Create embedding_metadata table
CREATE TABLE embedding_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('post', 'bet', 'user')),
  entity_id UUID NOT NULL,
  model_version TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  token_count INTEGER,
  UNIQUE(entity_type, entity_id)
);

-- 5. Create find_similar_users function (with privacy filters)
-- 6. Create find_similar_posts function (with privacy filters)
-- 7. Create check_bet_consensus function (with follow filter)
-- 8. Create performance indexes
CREATE INDEX idx_posts_embedding ON posts USING ivfflat (embedding vector_cosine_ops) WHERE archived = true;
CREATE INDEX idx_bets_embedding ON bets USING ivfflat (embedding vector_cosine_ops) WHERE archived = true;
CREATE INDEX idx_users_embedding ON users USING ivfflat (profile_embedding vector_cosine_ops);
CREATE INDEX idx_posts_archived ON posts(archived) WHERE archived = false;
CREATE INDEX idx_bets_archived ON bets(archived) WHERE archived = false;

-- 9. Document notification types
COMMENT ON COLUMN notifications.type IS 'Valid types: follow, comment, reaction, bet_won, bet_lost, milestone, tail, fade, consensus_alert';
```

### RPC Function Signatures
```sql
-- find_similar_users(query_embedding, user_id, limit_count) 
-- Returns: id, username, display_name, avatar_url, bio, is_verified, similarity, win_rate, total_bets, favorite_teams, common_sports

-- find_similar_posts(user_embedding, user_id, exclude_user_ids, time_window, limit_count)
-- Returns: id, user_id, content, type, created_at, expires_at, view_count, reaction_count, comment_count, similarity

-- check_bet_consensus(check_game_id, check_bet_details, check_user_id, time_window)
-- Returns: consensus_count, user_ids, usernames, avg_odds, total_stake
```

### Type Updates
```typescript
// Example of updated types
export interface Post {
  // ... existing fields
  archived?: boolean;
  embedding?: number[];
}
```

## Testing Performed

### Manual Testing
- [x] pgvector extension enables successfully (verified availability)
- [ ] All archive columns created with correct defaults
- [ ] All embedding columns created with correct dimensions
- [ ] embedding_metadata table created with proper constraints
- [ ] find_similar_users RPC works with test data
- [ ] find_similar_posts RPC works with test data
- [ ] check_bet_consensus RPC works with test data
- [ ] Indexes created successfully
- [ ] TypeScript types compile without errors

### Edge Cases Considered
- Empty embedding arrays handled gracefully
- Null embeddings don't break similarity searches
- Privacy filters work in RPC functions (blocked users, private accounts)
- Large result sets are properly limited

## Documentation Updates

- [ ] Migration file has clear comments for each section
- [ ] RPC functions have parameter descriptions
- [ ] Type changes are documented with JSDoc comments
- [ ] .env.example includes helpful comments

## Handoff to Reviewer

### What Was Implemented
**Investigation Phase Completed** - Ready for implementation approval:
- Verified pgvector 0.8.0 availability
- Confirmed all required tables exist
- Identified correct migration number (033)
- Analyzed existing type patterns
- Created comprehensive implementation plan

### Files Modified/Created
**To Be Created**:
- `supabase/migrations/033_add_rag_support.sql` - Complete database migration
- `.env.example` - New environment variable template

**To Be Modified**:
- `types/database.ts` - Add archive and embedding fields to table Row types

### Key Decisions Made
1. **Migration 033 not 032**: Latest existing migration is 032
2. **No enum for notifications**: Keep string type for backward compatibility
3. **Create .env.example**: Doesn't exist, needed for developer experience
4. **ivfflat indexes with lists=100**: Balance between performance and build time
5. **Archive indexes selective**: Only on high-traffic tables (posts, bets)

### Deviations from Original Plan
- Migration number changed from 032 to 033
- No notification_type enum creation (doesn't exist, would be breaking)
- Added .env.example creation (file doesn't exist)
- Added selective archive column indexes for performance

### Known Issues/Concerns
- **Large migration**: All changes in one file for atomicity, but it's substantial
- **Index creation time**: ivfflat indexes may take time on production
- **Vector type in TypeScript**: May need special handling, need to test after implementation
- **Archive filtering**: 29+ files will need updates in future sprints

### Suggested Review Focus
1. **Migration completeness**: All 9 sections properly structured?
2. **Privacy filters in RPC functions**: Correctly handle blocked users and private accounts?
3. **Index strategy**: Right balance of performance vs creation time?
4. **Type safety**: Proper optionality for backward compatibility?
5. **Archive column defaults**: false is correct for all tables?

### Questions for Reviewer

1. **Notification Type Handling**
   - Finding: Notifications use string types, not an enum
   - Question: Should we document 'consensus_alert' as valid type via comment?
   - Recommendation: Add COMMENT ON COLUMN for documentation

2. **Archive Column Indexes**
   - Finding: Archive filtering will be frequent operation
   - Question: Index all 6 tables or just high-traffic ones?
   - Recommendation: Index only posts and bets tables

3. **Vector Index Tuning**
   - Finding: ivfflat lists parameter affects performance
   - Question: What lists value for our expected scale?
   - Recommendation: Start with lists=100 (medium datasets)

4. **Embedding Dimension Validation**
   - Finding: OpenAI text-embedding-3-small outputs 1536 dimensions
   - Question: Add CHECK constraint to validate dimension?
   - Recommendation: Let pgvector handle it (built-in validation)

5. **RLS Policies**
   - Finding: New embedding_metadata table needs policies
   - Question: What access pattern for embeddings?
   - Recommendation: Read-only for authenticated users

**Sprint Status**: READY FOR REVIEW

---

## Reviewer Section

**Reviewer**: [R persona]  
**Review Date**: [Date]

### Review Checklist
- [ ] Code matches sprint objectives
- [ ] All planned files created/modified
- [ ] Follows established patterns
- [ ] No unauthorized scope additions
- [ ] Code is clean and maintainable
- [ ] No obvious bugs or issues
- [ ] Integrates properly with existing code

### Review Outcome

**Status**: APPROVED | NEEDS REVISION

### Feedback
[If NEEDS REVISION, specific feedback here]

**Required Changes**:
1. **File**: `[filename]`
   - Issue: [What's wrong]
   - Required Change: [What to do]
   - Reasoning: [Why it matters]

### Post-Review Updates
[Track changes made in response to review]

**Update 1** - [Date]
- Changed: [What was modified]
- Result: [New status]

---

## Sprint Metrics

**Duration**: Planned 4 hours | Actual [Y] hours  
**Scope Changes**: [Number of plan updates]  
**Review Cycles**: [Number of review rounds]  
**Files Touched**: 3  
**Lines Added**: ~400 (migration + types)  
**Lines Removed**: ~0

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [APPROVED/IN PROGRESS/BLOCKED]* 