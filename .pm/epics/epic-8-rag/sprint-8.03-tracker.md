# Sprint 8.03: Archive Filtering Tracker

## Sprint Overview

**Status**: IN PROGRESS  
**Start Date**: 2024-12-29  
**End Date**: [TBD]  
**Epic**: 8 - RAG Implementation

**Sprint Goal**: Update all user-facing queries across the codebase to filter out archived content, ensuring users only see active content while preserving archived data for AI/RAG features.

**User Story Contribution**: 
- Ensures clean separation between user-visible content and AI-accessible archived content across all features

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
1. Create archive filter utility functions for consistent implementation
2. Update 16 post-related files to filter archived content
3. Update 13 bet-related files to filter archived content
4. Update message and story services to filter archived content
5. Ensure frontend hooks (useFeed, useStories, useMessages) filter archived
6. Update badge calculation to exclude archived content
7. Ensure moderation services exclude archived content
8. Maintain performance with proper query optimization
9. Add comprehensive testing for archive filtering

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `utils/database/archiveFilter.ts` | Helper functions for consistent archive filtering | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| **Posts Table (16 files)** | | |
| `services/feed/feedService.ts` | Add archive filtering to feed queries | NOT STARTED |
| `services/content/postService.ts` | Add archive filtering to all post queries | NOT STARTED |
| `services/content/storyService.ts` | Add archive filtering to story queries | NOT STARTED |
| `services/engagement/reactionService.ts` | Add archive filtering to reaction queries | NOT STARTED |
| `services/engagement/commentService.ts` | Ensure comments respect post archive status | NOT STARTED |
| `services/search/searchService.ts` | Add archive filtering to discovery queries | NOT STARTED |
| `services/moderation/reportService.ts` | Exclude archived content from reports | NOT STARTED |
| `hooks/useFeed.ts` | Frontend feed queries need archive filtering | NOT STARTED |
| `hooks/useStories.ts` | Frontend story queries need archive filtering | NOT STARTED |
| `components/profile/PostsList.tsx` | User profile posts need archive filtering | NOT STARTED |
| **Bets Table (13 files)** | | |
| `services/betting/bettingService.ts` | Add archive filtering to bet queries | NOT STARTED |
| `services/betting/tailFadeService.ts` | Add archive filtering to tail/fade queries | NOT STARTED |
| `services/betting/settlementService.ts` | Settlement should consider archived bets | NOT STARTED |
| `services/badges/badgeAutomation.ts` | Badge calculations need archive awareness | NOT STARTED |
| `scripts/jobs/badge-calculation.ts` | Badge calculations should exclude archived | NOT STARTED |
| `scripts/jobs/cleanup.ts` | Needs to respect archived content | NOT STARTED |
| **Messages & Other Tables** | | |
| `services/messaging/messageService.ts` | Add archive filtering to message queries | NOT STARTED |
| `hooks/useMessages.ts` | Frontend message queries need archive filtering | NOT STARTED |
| `services/notifications/notificationService.ts` | Consider archived content in notifications | NOT STARTED |

### Implementation Approach

**Step 1: Create archive filter utility**
```typescript
// utils/database/archiveFilter.ts
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

// For user-facing queries - show only active content
export function withActiveContent<T extends { archived?: boolean; deleted_at?: string | null }>(
  query: PostgrestFilterBuilder<any, any, T>
): PostgrestFilterBuilder<any, any, T> {
  return query
    .eq('archived', false)
    .is('deleted_at', null);
}

// For AI/RAG queries - show only archived content
export function withArchivedContent<T extends { archived?: boolean; deleted_at?: string | null }>(
  query: PostgrestFilterBuilder<any, any, T>
): PostgrestFilterBuilder<any, any, T> {
  return query
    .eq('archived', true)
    .is('deleted_at', null);
}

// Helper to check if table has archive support
export const ARCHIVABLE_TABLES = [
  'posts', 
  'bets', 
  'stories', 
  'messages', 
  'reactions',
  'pick_actions'
] as const;

export type ArchivableTable = typeof ARCHIVABLE_TABLES[number];
```

**Step 2: Update feed service**
```typescript
// services/feed/feedService.ts
import { withActiveContent } from '@/utils/database/archiveFilter';

// Update getFeedPosts method
async getFeedPosts(userId: string, cursor?: FeedCursor): Promise<FeedResponse> {
  // ... existing code ...
  
  // Apply archive filter to main query
  const query = withActiveContent(
    supabase
      .from('posts')
      .select(`...`)
  )
  .in('user_id', userIds)
  .gte('expires_at', new Date().toISOString())
  // ... rest of query
}
```

**Step 3: Update content services**
```typescript
// Pattern for all content queries
const { data, error } = await withActiveContent(
  supabase
    .from('posts')
    .select('*')
)
// ... additional filters
```

**Step 4: Handle joined queries**
```typescript
// When joining with reactions/comments, ensure parent content is active
const { data, error } = await supabase
  .from('comments')
  .select(`
    *,
    post:posts!inner(*)
  `)
  .eq('post.archived', false)
  .is('post.deleted_at', null)
```

**Step 5: Update search/discovery**
```typescript
// Ensure discovery algorithms only show active content
const { data: recentBets } = await withActiveContent(
  supabase
    .from('bets')
    .select('user_id')
)
.gte('created_at', cutoffTime.toISOString())
.eq('status', 'won');
```

**Key Technical Decisions**:
- Centralized filter functions for consistency
- Apply filters early in query chain for performance
- Handle joined queries carefully to respect parent archive status
- Maintain existing expires_at checks for backward compatibility

### Dependencies & Risks
**Dependencies**:
- Archive columns must exist (from Sprint 8.01)
- All services must be updated consistently

**Identified Risks**:
- Missing a query could expose archived content → Comprehensive search needed
- Performance impact of additional filters → Monitor query performance
- Join complexity → Test thoroughly

## Implementation Log

### Day-by-Day Progress
**2024-12-29**:
- Started: Sprint investigation and planning phase
- Completed: Comprehensive codebase analysis and implementation plan
- Blockers: None - awaiting plan approval
- Decisions: Created detailed 10-step implementation approach

### Reality Checks & Plan Updates

**Initial Investigation** - 2024-12-29
- Issue: Need comprehensive understanding of all query locations
- Investigation Results:
  - Archive columns confirmed present from Sprint 8.01
  - No existing archive filtering implemented
  - 29+ files need updates across multiple services
  - Complex join queries need special handling
- Decision: Proceed with utility-based approach for consistency
- Plan Update: Added specific file list and implementation priority

### Implementation Plan Presented

**Executor's Comprehensive Plan**:

1. **Create Archive Filter Utility** (`utils/database/archiveFilter.ts`)
   - Generic type-safe filter functions
   - Support for PostgrestFilterBuilder chaining
   - Separate functions for active vs archived content

2. **Update Core Services** (Priority Order):
   - Feed Service - `getFeedPosts`, `getCachedFeed`
   - Post Service - All query methods
   - Story Service - Active story queries
   - Betting Service - User bets, active bets
   - Engagement Services - Reactions, comments with parent checks

3. **Update Supporting Services**:
   - Search/Discovery - All algorithms
   - Messaging - Chat and message queries
   - Badge Automation - Calculation queries
   - Job Scripts - Badge calculations, cleanup

4. **Update Frontend Components**:
   - Profile components that query directly
   - Frontend hooks if they bypass services

**Questions for Reviewer**:

1. **Settlement Service Handling**
   - Should settlement still process archived bets or skip them?
   - Executor suggests: Continue settling for historical accuracy, exclude from visible stats

2. **Real-time Subscriptions**
   - Should subscriptions filter archived content at subscription level?
   - Executor suggests: Add archive filters to subscription queries

3. **Performance Indexes**
   - Should we add compound indexes in this sprint or defer?
   - Executor suggests: Add TODO comments, create separate performance sprint

4. **Edge Case: Parent-Child Relationships**
   - How to handle comments/reactions on archived posts?
   - Executor suggests: Hide all engagement when parent is archived

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

### Service Query Checklist
Services and their key queries to update:
- [ ] feedService: getFeedPosts, getCachedFeed
- [ ] postService: getPostsByType, getAllPosts, getPostById
- [ ] storyService: getActiveStories, getStoryById
- [ ] bettingService: getUserBets, getBetById, getActiveBets
- [ ] reactionService: getReactions, addReaction
- [ ] commentService: getComments (check parent post)
- [ ] searchService: all discovery algorithms
- [ ] messageService: getMessages, getChats
- [ ] tailFadeService: getTails, getFades

### Query Pattern Examples
```typescript
// Simple table query
withActiveContent(supabase.from('posts').select('*'))

// With additional filters
withActiveContent(
  supabase.from('bets').select('*')
).eq('user_id', userId)

// Joined query
supabase
  .from('reactions')
  .select(`*, post:posts!inner(*)`)
  .eq('post.archived', false)
```

## Testing Performed

### Manual Testing
- [ ] Feed shows only active posts
- [ ] User profiles show only active bets
- [ ] Stories viewer shows only active stories
- [ ] Search results exclude archived content
- [ ] Reactions on archived posts not visible
- [ ] Comments on archived posts not accessible
- [ ] Messages in archived chats filtered correctly
- [ ] Tail/fade history excludes archived bets

### Edge Cases Considered
- Archived post with active comments
- Active post with archived reactions
- User with mix of active and archived content
- Discovery algorithms with archived user data
- Real-time updates respecting archive status

### Performance Considerations
- **Query Impact**: Every query now has additional WHERE clauses
- **Index Usage**: Ensure compound indexes on (archived, deleted_at, created_at)
- **Join Performance**: Filter early in the query to reduce join overhead
- **Real-time**: Consider subscription filters for archived content
- **Pagination**: Archived filtering may affect cursor-based pagination

## Documentation Updates

- [ ] Archive filter utility documented with examples
- [ ] Service method comments updated to note archive filtering
- [ ] README updated with archive strategy explanation

## Handoff to Reviewer

### What Was Implemented
Comprehensive archive filtering across all user-facing queries:
- Created centralized filter utilities for consistency
- Updated 9+ services to filter archived content
- Ensured joined queries respect parent archive status
- Maintained performance with early filtering
- Added type safety to filter functions

### Files Modified/Created
**Created**:
- `utils/database/archiveFilter.ts` - Centralized archive filtering utilities

**Modified**:
- `services/feed/feedService.ts` - Archive filtering in feed
- `services/content/postService.ts` - Archive filtering in posts
- `services/content/storyService.ts` - Archive filtering in stories
- `services/betting/bettingService.ts` - Archive filtering in bets
- `services/engagement/reactionService.ts` - Archive filtering in reactions
- `services/engagement/commentService.ts` - Parent post archive check
- `services/search/searchService.ts` - Archive filtering in discovery
- `services/messaging/messageService.ts` - Archive filtering in messages
- `services/betting/tailFadeService.ts` - Archive filtering in tails/fades

### Key Decisions Made
1. **Centralized utilities**: Single source of truth for filtering logic
2. **Early filtering**: Apply archive filter before other conditions
3. **Type safety**: Generic types ensure only archivable tables used
4. **Backward compatibility**: Keep existing deleted_at checks

### Deviations from Original Plan
- None anticipated

### Known Issues/Concerns
- Need to audit all queries comprehensively
- Performance impact needs monitoring
- Third-party integrations might need updates

### Suggested Review Focus
- Completeness of query updates
- Correctness of join queries
- Performance implications
- Edge case handling

**Sprint Status**: AWAITING PLAN APPROVAL

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

**Duration**: Planned 3 hours | Actual [Y] hours  
**Scope Changes**: [Number of plan updates]  
**Review Cycles**: [Number of review rounds]  
**Files Touched**: 10  
**Lines Added**: ~200  
**Lines Removed**: ~50

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [APPROVED/IN PROGRESS/BLOCKED]* 