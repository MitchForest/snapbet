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
**[Date]**:
- Started: [What was begun]
- Completed: [What was finished]
- Blockers: [Any issues]
- Decisions: [Any changes to plan]

### Reality Checks & Plan Updates

**Reality Check 1** - [Date]
- Issue: [What wasn't working]
- Options Considered:
  1. [Option 1] - Pros/Cons
  2. [Option 2] - Pros/Cons
- Decision: [What was chosen]
- Plan Update: [How sprint plan changed]
- Epic Impact: [Any epic updates needed]

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
-- 032_add_rag_support.sql structure:
-- 1. Enable pgvector
-- 2. Add archive columns (6 tables)
-- 3. Add embedding columns (3 tables)
-- 4. Add favorite_teams to users
-- 5. Create embedding_metadata table
-- 6. Create find_similar_users function
-- 7. Create find_similar_posts function
-- 8. Create check_bet_consensus function
-- 9. Create performance indexes
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
- [ ] pgvector extension enables successfully
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
Complete database infrastructure for RAG features including:
- pgvector extension for similarity search
- Archive columns for content lifecycle management
- Embedding storage for AI features
- RPC functions for vector operations
- Performance indexes for scalability

### Files Modified/Created
**Created**:
- `supabase/migrations/032_add_rag_support.sql` - Complete database migration

**Modified**:
- `types/database.ts` - Added archive and embedding fields to interfaces
- `.env.example` - Added new environment variables

### Key Decisions Made
1. **Archive columns on 6 tables**: Comprehensive coverage of all ephemeral content
2. **vector(1536) dimensions**: Matches OpenAI's text-embedding-3-small output
3. **RPC functions include privacy**: Built-in filtering for blocked users and private accounts
4. **ivfflat indexes**: Better performance for approximate nearest neighbor searches

### Deviations from Original Plan
- None anticipated

### Known Issues/Concerns
- Migration is large but necessary for atomic changes
- Index creation might take time on production database
- Need to verify pgvector version supports all features

### Suggested Review Focus
- Migration SQL syntax and completeness
- RPC function logic for privacy and performance
- TypeScript type accuracy
- Index strategy for large-scale performance

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