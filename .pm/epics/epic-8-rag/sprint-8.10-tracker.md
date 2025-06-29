# Sprint 8.10: RAG Mock Data Generation & Performance Optimization Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: [TBD]  
**End Date**: [TBD]  
**Epic**: 8 - RAG Implementation

**Sprint Goal**: Generate comprehensive mock data for demonstrating RAG features and implement deferred performance optimizations for archive filtering.

**User Story Contribution**: 
- Enables complete demonstration of all RAG features with realistic archived content
- Optimizes query performance for archive filtering across the application

## 🚨 Required Development Practices

### Database Management
- **Use Supabase MCP** to inspect current database state: `mcp_supabase_get_schemas`, `mcp_supabase_get_tables`, etc.
- **Keep types synchronized**: Run type generation after ANY schema changes
- **Migration files required**: Every database change needs a migration file
- **Test migrations**: Ensure migrations run cleanly on fresh database

### Code Quality
- **Zero tolerance**: No lint errors, no TypeScript errors
- **Type safety**: No `any` types without explicit justification
- **Run before handoff**: `bun run lint && bun run typecheck`

## Sprint Plan

### Objectives
1. Create mock data generators for archived content with embeddings
2. Generate realistic scenarios for AI caption learning
3. Create similar user patterns for Find Your Tribe feature
4. Generate consensus betting scenarios
5. Implement performance indexes for archive filtering
6. Add real-time subscription filtering for archived content
7. Create comprehensive demo scenarios

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `scripts/mock/generators/ragContent.ts` | Generate archived content with embeddings | NOT STARTED |
| `scripts/mock/generators/similarUsers.ts` | Create users with similar betting patterns | NOT STARTED |
| `scripts/mock/generators/consensusBets.ts` | Generate consensus betting scenarios | NOT STARTED |
| `supabase/migrations/034_archive_performance_indexes.sql` | Performance indexes for archive filtering | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `scripts/mock/orchestrators/setup.ts` | Add RAG mock data generation | NOT STARTED |
| `services/realtime/realtimeManager.ts` | Add archive filtering to subscriptions | NOT STARTED |
| `services/realtime/channelHelpers.ts` | Update channel filters for archived content | NOT STARTED |

### Deferred Items from Sprint 8.03

**1. Performance Indexes**
- **What**: Compound indexes on (archived, deleted_at, created_at) for high-traffic tables
- **Why Deferred**: Focus on functionality first, optimize after confirming query patterns
- **Implementation**: Create migration with strategic indexes

**2. Real-time Subscription Filtering**
- **What**: Add archive filters at subscription level for all real-time channels
- **Why Deferred**: Core filtering more critical, real-time is enhancement
- **Implementation**: Update subscription queries in realtimeManager

**3. Settlement Service Edge Cases**
- **What**: Determine final approach for archived bet settlement
- **Why Deferred**: Needs product decision on historical accuracy vs performance
- **Implementation**: Update settlementService based on decision

### Mock Data Requirements

**Archived Content with Embeddings**:
- 1000+ archived posts with caption embeddings
- Various caption styles (funny, serious, emoji-heavy, etc.)
- Different sports/betting contexts
- Timestamps spanning 30+ days
- Include archived stories, reactions, comments, and pick actions
- Add bet messages in chat history

**Similar User Patterns**:
- Groups of 3-5 users with similar betting patterns
- Shared favorite teams
- Similar bet amounts and frequencies
- Overlapping active times
- Historical betting records with embeddings

**Consensus Scenarios**:
- Multiple users betting same game/outcome within 1 hour
- Various group sizes (2-10 users)
- Different bet amounts but same picks
- Mix of followed and non-followed users
- Historical consensus patterns for learning

**Feed Testing Data**:
- 70% content from followed users (active)
- 30% slots for AI-discovered content
- Mix of bet types and post types
- Realistic engagement patterns
- Sufficient archived content with embeddings for discovery

**Missing Content Types to Add**:
- Story reactions and views
- Story captions
- Video content samples
- Bet-related messages in chats
- Auto milestone/recap stories
- Rich metadata usage

### Performance Optimization Plan

**Index Strategy**:
```sql
-- High-traffic table indexes
CREATE INDEX idx_posts_archive_filter ON posts(archived, deleted_at, created_at DESC) 
  WHERE archived = false AND deleted_at IS NULL;

CREATE INDEX idx_bets_archive_filter ON bets(archived, deleted_at, created_at DESC)
  WHERE archived = false AND deleted_at IS NULL;

CREATE INDEX idx_stories_archive_filter ON stories(archived, deleted_at, created_at DESC)
  WHERE archived = false AND deleted_at IS NULL;

-- Embedding search indexes (using ivfflat)
CREATE INDEX idx_posts_embedding ON posts USING ivfflat (embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL;

CREATE INDEX idx_users_embedding ON users USING ivfflat (profile_embedding vector_cosine_ops)
  WHERE profile_embedding IS NOT NULL;
```

**Real-time Optimization**:
- Add `.eq('archived', false)` to all subscription builders
- Update presence channels to exclude archived content
- Ensure broadcast filters respect archive status

### Dependencies & Risks
**Dependencies**:
- Archive filtering (Sprint 8.03) must be complete
- RAG service layer (Sprint 8.04) needed for embedding generation

**Identified Risks**:
- Large mock data volume could slow down development database
- Index creation might lock tables temporarily
- Real-time filtering could affect subscription performance

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

## Key Code Additions

### Mock Data Generator Structure
```typescript
// scripts/mock/generators/ragContent.ts
export async function generateArchivedContent() {
  // Generate posts with various caption styles
  // Set archived = true, add embeddings
  // Span across 30+ days
}

// scripts/mock/generators/similarUsers.ts
export async function generateSimilarUsers() {
  // Create user groups with matching patterns
  // Update profile_embeddings
  // Set favorite_teams
}

// scripts/mock/generators/consensusBets.ts
export async function generateConsensusBets() {
  // Create matching bets within time windows
  // Various group sizes
  // Mix of followed/unfollowed users
}
```

## Testing Performed

### Mock Data Validation
- [ ] Archived content has valid embeddings
- [ ] Similar users show in discovery
- [ ] Consensus alerts trigger correctly
- [ ] Feed mixing works with mock data

### Performance Testing
- [ ] Query times with new indexes
- [ ] Real-time subscription performance
- [ ] Archive filtering overhead measurement

## Documentation Updates

- [ ] Mock data generation documented
- [ ] Performance optimization rationale explained
- [ ] Demo scenarios documented

## Handoff to Reviewer

### What Was Implemented
[To be completed during implementation]

### Files Modified/Created
[To be completed during implementation]

### Key Decisions Made
[To be completed during implementation]

### Deviations from Original Plan
[To be completed during implementation]

### Known Issues/Concerns
[To be completed during implementation]

### Suggested Review Focus
- Mock data quality and realism
- Performance index effectiveness
- Real-time filtering implementation
- Demo scenario completeness

**Sprint Status**: NOT STARTED

---

## Reviewer Section

**Reviewer**: [R persona]  
**Review Date**: [Date]

### Review Checklist
- [ ] Mock data covers all RAG features
- [ ] Performance optimizations are effective
- [ ] Real-time filtering works correctly
- [ ] No regression in existing features
- [ ] Demo scenarios are compelling

### Review Outcome

**Status**: APPROVED | NEEDS REVISION

### Feedback
[If NEEDS REVISION, specific feedback here]

### Post-Review Updates
[Track changes made in response to review]

---

## Sprint Metrics

**Duration**: Planned 4 hours | Actual [Y] hours  
**Scope Changes**: [Number of plan updates]  
**Review Cycles**: [Number of review rounds]  
**Files Touched**: [Number]  
**Lines Added**: [Number]  
**Lines Removed**: [Number]

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [NOT STARTED]* 