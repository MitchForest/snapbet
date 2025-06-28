# Epic 8: RAG Implementation Tracker

## Epic Overview

**Status**: NOT STARTED  
**Start Date**: [TBD]  
**Target End Date**: [TBD]  
**Actual End Date**: [TBD]

**Epic Goal**: Implement AI-powered features including caption generation, smart friend discovery, enhanced feed mixing, and consensus betting alerts using OpenAI embeddings and vector similarity search.

**User Stories Addressed**:
- Story 1: AI Caption Generation - Users can generate engaging captions with one tap
- Story 2: Find Your Tribe - Users discover similar bettors based on betting patterns
- Story 3: Enhanced Feed - Users see 70% following content + 30% AI-discovered posts
- Story 4: Consensus Alerts - Users get notified when multiple friends make similar bets

**PRD Reference**: `docs/rag-2.md` - Complete RAG implementation specification

## Sprint Breakdown

| Sprint # | Sprint Name | Status | Start Date | End Date | Key Deliverable |
|----------|-------------|--------|------------|----------|-----------------|
| 8.01 | Database Infrastructure | COMPLETED | 2024-12-29 | 2024-12-29 | pgvector setup, archive columns, RPC functions |
| 8.02 | Content Archiving | NOT STARTED | - | - | Modify content-expiration job to archive |
| 8.03 | Archive Filtering | NOT STARTED | - | - | Update all queries to filter archived content |
| 8.04 | RAG Service Layer | NOT STARTED | - | - | OpenAI integration and embedding pipeline |
| 8.05 | AI Caption Generation | NOT STARTED | - | - | Caption UI and generation service |
| 8.06 | Find Your Tribe | NOT STARTED | - | - | Similar user discovery in search |
| 8.07 | Enhanced Feed | NOT STARTED | - | - | 70/30 smart feed mixing |
| 8.08 | Consensus Alerts | NOT STARTED | - | - | Betting consensus notifications |
| 8.09 | Mock Data & Demo | NOT STARTED | - | - | Complete RAG demo with archived content and scenarios |

**Statuses**: NOT STARTED | IN PROGRESS | IN REVIEW | APPROVED | BLOCKED

## Architecture & Design Decisions

### High-Level Architecture for This Epic
- **Service Layer**: New `services/rag/` directory with specialized AI services
- **Database Layer**: pgvector extension for similarity search, embedding storage
- **Integration Points**: Hooks into existing post creation, feed, search, and betting flows
- **No Module System**: Following existing service-based architecture pattern

### Key Design Decisions
1. **Service Architecture vs Modules**: Use existing service pattern, not module system
   - Alternatives considered: Module-based architecture
   - Rationale: Consistency with existing codebase structure
   - Trade-offs: Less isolation but better integration

2. **Embedding Strategy**: Generate on content creation vs historical backfill
   - Alternatives considered: Batch backfill all historical content
   - Rationale: Start fresh to control costs and complexity
   - Trade-offs: No AI features for old content initially

3. **Archive Approach**: Hybrid approach with both `archived` and `deleted_at`
   - Alternatives considered: Use only `deleted_at` for everything
   - Rationale: Clear semantics between expired content (archived) vs deleted content
   - Trade-offs: Additional column but clearer intent and better performance

4. **Feed Mixing**: Simple injection pattern vs complex scoring
   - Alternatives considered: ML-based ranking algorithm
   - Rationale: Predictable behavior, easier to tune
   - Trade-offs: Less sophisticated but more maintainable

5. **Consensus Detection**: Database query vs real-time stream processing
   - Alternatives considered: Redis streams for real-time
   - Rationale: Simpler implementation, good enough for MVP
   - Trade-offs: Slight delay in notifications

6. **AI Visual Indicators**: Unified badge component with sparkle icon
   - Alternatives considered: Different icons per feature, no indicators
   - Rationale: Consistent branding, user awareness of AI features
   - Trade-offs: Additional UI element but clear feature attribution

### Dependencies
**External Dependencies**:
- `openai`: ^4.0.0 - For embeddings and chat completions
- `pgvector`: PostgreSQL extension - For vector similarity search

**Internal Dependencies**:
- Requires: Existing Supabase setup, post/bet/user tables, notification system
- Provides: AI capabilities for future features, embedding infrastructure

## Implementation Notes

### File Structure for Epic
```
services/rag/
├── ragService.ts              # Core AI/OpenAI integration
├── embeddingPipeline.ts       # Embedding generation pipeline
├── friendDiscoveryService.ts  # Find Your Tribe logic
├── smartFeedService.ts        # Enhanced feed mixing
└── consensusService.ts        # Consensus detection

components/
├── common/
│   └── AIBadge.tsx            # Unified AI indicator component
├── creation/
│   └── AICaptionButton.tsx    # Uses AIBadge with "Generate" text
├── search/
│   └── SimilarUserCard.tsx    # Shows AIBadge with match percentage
├── feed/
│   └── DiscoveryBadge.tsx     # Shows AIBadge with "Suggested" text

hooks/
└── useAICaption.ts

utils/database/
└── archiveFilter.ts
```

### API Endpoints Added
| Method | Path | Purpose | Sprint |
|--------|------|---------|--------|
| RPC | find_similar_users | Vector similarity search for users | 8.01 |
| RPC | find_similar_posts | Vector similarity search for posts | 8.01 |
| RPC | check_bet_consensus | Find matching bets from followed users | 8.01 |

### Data Model Changes
```sql
-- Archive columns (for ephemeral content)
ALTER TABLE posts ADD COLUMN archived BOOLEAN DEFAULT false;
ALTER TABLE bets ADD COLUMN archived BOOLEAN DEFAULT false;
ALTER TABLE stories ADD COLUMN archived BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN archived BOOLEAN DEFAULT false;
ALTER TABLE reactions ADD COLUMN archived BOOLEAN DEFAULT false;
ALTER TABLE pick_actions ADD COLUMN archived BOOLEAN DEFAULT false;

-- Embedding columns
ALTER TABLE posts ADD COLUMN embedding vector(1536);
ALTER TABLE bets ADD COLUMN embedding vector(1536);
ALTER TABLE users ADD COLUMN profile_embedding vector(1536);
ALTER TABLE users ADD COLUMN last_embedding_update TIMESTAMP;
ALTER TABLE users ADD COLUMN favorite_teams TEXT[];

-- New table for tracking embeddings
CREATE TABLE embedding_metadata (
  id UUID PRIMARY KEY,
  entity_type TEXT,
  entity_id UUID,
  model_version TEXT,
  generated_at TIMESTAMP,
  token_count INTEGER
);
```

### Key Functions/Components Created
- `ragService.generateCaption()` - AI caption generation - Sprint 8.05
- `ragService.generateEmbedding()` - Embedding generation - Sprint 8.04
- `embeddingPipeline.embedPost()` - Post embedding pipeline - Sprint 8.04
- `embeddingPipeline.embedBet()` - Bet embedding pipeline - Sprint 8.04
- `embeddingPipeline.updateUserProfile()` - User profile embeddings - Sprint 8.04
- `friendDiscoveryService.findSimilarUsers()` - User discovery - Sprint 8.06
- `smartFeedService.getHybridFeed()` - 70/30 feed mixing - Sprint 8.07
- `consensusService.checkAndNotifyConsensus()` - Consensus detection - Sprint 8.08
- `AIBadge` - Unified AI indicator component - Sprint 8.04
- `AICaptionButton` - AI caption button with sparkle icon - Sprint 8.05
- `SimilarUserCard` - User card with AI match percentage - Sprint 8.06
- `DiscoveryBadge` - AI suggested post indicator - Sprint 8.07
- `useAICaption` - Hook for caption generation - Sprint 8.05
- `withActiveContent()` - Filter helper for active content - Sprint 8.03
- `withArchivedContent()` - Filter helper for archived content - Sprint 8.03

## Sprint Execution Log

### Sprint 8.01: Database Infrastructure
**Status**: COMPLETED  
**Duration**: 2 hours (planned 4 hours)  
**Completed**: 2024-12-29  
**Summary**: Successfully implemented complete database infrastructure for RAG features including pgvector extension, archive columns on all ephemeral tables, embedding columns for AI features, and RPC functions for vector similarity search.

**Key Accomplishments**:
- Enabled pgvector 0.8.0 extension in Supabase
- Added archive columns to all 6 ephemeral tables (posts, bets, stories, messages, reactions, pick_actions)
- Added embedding columns to posts, bets, and users tables
- Created embedding_metadata table for tracking
- Implemented 3 RPC functions with privacy filters (find_similar_users, find_similar_posts, check_bet_consensus)
- Created performance indexes using ivfflat
- Regenerated TypeScript types with 0 errors

**Key Decisions**: 
- Used migration 033 (not 032) based on existing migrations
- Kept notification types as strings with documentation (no enum) for backward compatibility
- Added indexes for posts, bets, AND stories (high-traffic tables)
- Used ivfflat with lists=100 for balanced performance
- Skip .env.example creation due to file restrictions

**Technical Notes**:
- pgvector 0.8.0 available but required manual enablement
- Supabase MCP transactions handled automatically (no BEGIN/COMMIT)
- Type generation requires formatting fixes with `lint --fix`
- Cascading type changes required updates to 3 components

**Issues Encountered**: 
- Type generation formatting issues (resolved with lint --fix)
- Three components needed updates for new optional fields (resolved)
- No notification_type enum exists (kept as string type with documentation)

**Review Outcome**: APPROVED (2024-12-29)
- All quality checks passing (0 lint errors, 0 type errors)
- Database migration verified via MCP
- RPC functions tested and working
- TypeScript types properly aligned

### Sprint 8.02: Content Archiving
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

### Sprint 8.03: Archive Filtering
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

### Sprint 8.04: RAG Service Layer
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

### Sprint 8.05: AI Caption Generation
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

### Sprint 8.06: Find Your Tribe
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

### Sprint 8.07: Enhanced Feed
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

### Sprint 8.08: Consensus Alerts
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

### Sprint 8.09: Mock Data & Demo
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

## Testing & Quality

### Testing Approach
- Unit tests for all service methods
- Integration tests for RPC functions
- Manual testing of all UI features
- Performance testing for vector searches
- Mock data generation for testing RAG features
- Comprehensive demo scenarios including:
  - Archived content with embeddings for AI caption learning
  - Similar users with matching betting patterns
  - Consensus betting scenarios (multiple users same bet)
  - Mix of old archived and new active content for 70/30 feed

### Known Issues
| Issue | Severity | Sprint | Status | Resolution |
|-------|----------|--------|--------|------------|
| [TBD] | - | - | - | - |

## Refactoring Completed

### Code Improvements
- [To be documented as completed]

### Performance Optimizations
- [To be documented as completed]

## Learnings & Gotchas

### What Worked Well
- Supabase MCP integration for database operations
- ivfflat indexes with lists=100 provide good balance
- Type generation with Supabase CLI is reliable
- Archive approach provides clear semantics

### Challenges Faced
- Type generation formatting requires manual fix
- Component updates needed for new optional fields
- Transaction handling differs in Supabase MCP

### Gotchas for Future Development
- **OpenAI Rate Limits**: Need to implement retry logic and queuing for high volume
- **Vector Index Performance**: May need to tune HNSW parameters for large datasets
- **Privacy Considerations**: Always filter embeddings by blocked users and private accounts
- **Async Processing**: Embeddings must not block UI - always process in background
- **Bet Structure**: Remember bets use `bet_details` JSON and sports come from games table
- **Environment Variables**: Use `SUPABASE_SERVICE_KEY` not `SUPABASE_SERVICE_ROLE_KEY`
- **Notification Creation**: Direct database insert, no service method exists
- **Archive Filtering**: 29+ files need archive filtering - use utility functions for consistency
- **Type Updates**: Vector type may need special handling in TypeScript
- **Existing Discovery**: Hook into existing discovery system, don't replace it
- **Feed Integration**: Feed service returns only following posts currently - needs complete rewrite
- **Camera Flow**: AI caption must integrate into existing camera/preview flow
- **Supabase MCP Transactions**: Cannot use BEGIN/COMMIT - system handles transactions automatically
- **Type Generation**: Always run `lint --fix` after generating types
- **Component Updates**: New database fields may require updates to existing components

## Build Testing & Verification

### Epic-End Build Process (MANDATORY)

Before marking an epic as complete, the following build verification MUST be performed:

1. **Clean all caches:**
   ```bash
   rm -rf .expo node_modules/.cache .tamagui ios/build android/build
   ```

2. **Force clean prebuild for both platforms:**
   ```bash
   bun expo prebuild --platform ios --clean
   bun expo prebuild --platform android --clean
   ```

3. **Run full quality checks:**
   ```bash
   bun run lint      # MUST return 0 errors, 0 warnings
   bun run typecheck # MUST return 0 errors
   ```

4. **Test builds on both platforms:**
   ```bash
   # iOS
   bun expo run:ios
   
   # Android
   bun expo run:android
   ```

5. **Verification checklist:**
   - [ ] App launches without crashes on iOS
   - [ ] App launches without crashes on Android
   - [ ] All epic features work on both platforms
   - [ ] No console errors during runtime
   - [ ] Camera/permissions work (if applicable)
   - [ ] Navigation works properly
   - [ ] Screenshots taken of working app

### Build Issues Resolution
If any build issues are encountered:
1. Create a fix-build sprint immediately
2. Document all errors and resolutions
3. Update dependencies if needed
4. Re-run the entire verification process

**NO EPIC CAN BE MARKED COMPLETE WITHOUT SUCCESSFUL BUILDS ON BOTH PLATFORMS**

## Epic Completion Checklist

- [x] Sprint 8.01 completed and approved
- [ ] All planned sprints completed and approved (1/9 complete)
- [ ] User stories for this epic fully addressed
- [ ] Code refactored and cleaned up
- [ ] Documentation updated
- [ ] No critical bugs remaining
- [ ] Performance acceptable
- [ ] Integration with other epics tested
- [ ] Epic summary added to project tracker

### Progress Summary
- **Sprints Completed**: 1/9 (11%)
- **Epic Status**: On Track
- **Next Sprint**: 8.02 - Content Archiving

## Epic Summary for Project Tracker

**[To be completed at epic end]**

**Delivered Features**:
- AI Caption Generation with style learning
- Find Your Tribe discovery algorithm
- Enhanced Feed with 70/30 smart mixing
- Consensus Betting Alerts

**Key Architectural Decisions**:
- pgvector for similarity search instead of external service
- Service-based architecture following existing patterns
- Async embedding generation to avoid blocking UI
- Simple feed mixing algorithm for predictability

**Critical Learnings**:
- [To be documented]

**Technical Debt Created**:
- Historical content lacks embeddings (can backfill later)
- Simple feed mixing could be enhanced with ML
- Rate limiting is basic, might need queue system at scale
- No hooks for discovery/feed features (integrated directly in services)

---

*Epic Started: [TBD]*  
*Epic Completed: [TBD]*  
*Total Duration: [TBD]* 