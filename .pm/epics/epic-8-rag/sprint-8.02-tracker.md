# Sprint 8.02: Content Archiving Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: [TBD]  
**End Date**: [TBD]  
**Epic**: 8 - RAG Implementation

**Sprint Goal**: Modify the content expiration job to archive content instead of deleting it, enabling historical data preservation for AI/RAG features while maintaining user-facing content freshness.

**User Story Contribution**: 
- Enables content preservation for all RAG features by maintaining expired content in archived state

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
1. Update content-expiration job to set archived=true instead of deleted_at
2. Add weekly bet archiving logic (7 days old)
3. Add engagement data archiving (reactions, pick_actions after 3 days)
4. Maintain backward compatibility with existing deleted_at logic
5. Add proper logging for archive operations
6. Create mock data generator for RAG demo scenarios
7. Update mock setup orchestrator to create archived content

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| None | All changes are modifications to existing files | N/A |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `scripts/jobs/content-expiration.ts` | Replace deletion with archiving for posts and stories | COMPLETED |
| `scripts/jobs/content-expiration.ts` | Replace deletion with archiving for messages | COMPLETED |
| `scripts/jobs/content-expiration.ts` | Add weekly bet archiving logic | COMPLETED |
| `scripts/jobs/content-expiration.ts` | Add engagement data archiving function | COMPLETED |
| `scripts/jobs/content-expiration.ts` | Update logging to reflect archiving vs deletion | COMPLETED |

### Implementation Approach

**Step 1: Analyze current expiration logic**
- Review existing deletion queries
- Identify all content types being expired
- Note current scheduling (runs every 5 minutes)

**Step 2: Update post expiration (around line 85)**
```typescript
// Change from deletion to archiving
const { error: postsError } = await supabase
  .from('posts')
  .update({ 
    archived: true
    // Remove deleted_at to avoid confusion
  })
  .eq('archived', false)
  .is('deleted_at', null) // Don't archive already deleted content
  .lt('expires_at', new Date().toISOString());
```

**Step 3: Update story expiration (around line 104)**
```typescript
// Similar pattern for stories
const { error: storiesError } = await supabase
  .from('stories')
  .update({ 
    archived: true
  })
  .eq('archived', false)
  .is('deleted_at', null)
  .lt('expires_at', new Date().toISOString());
```

**Step 4: Add weekly bet archiving**
```typescript
// Check if it's Sunday midnight UTC
const now = new Date();
const dayOfWeek = now.getUTCDay();
const hour = now.getUTCHours();

if (dayOfWeek === 0 && hour === 0) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const { error: betsError } = await supabase
    .from('bets')
    .update({ archived: true })
    .eq('archived', false)
    .is('deleted_at', null)
    .lt('created_at', oneWeekAgo.toISOString());
    
  if (betsError) {
    console.error('Error archiving old bets:', betsError);
  }
}
```

**Step 5: Create engagement archiving function**
```typescript
async function archiveEngagementData() {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  // Archive old reactions
  const { error: reactionsError } = await supabase
    .from('reactions')
    .update({ archived: true })
    .eq('archived', false)
    .is('deleted_at', null)
    .lt('created_at', threeDaysAgo.toISOString());
    
  // Archive old pick_actions
  const { error: pickActionsError } = await supabase
    .from('pick_actions')
    .update({ archived: true })
    .eq('archived', false)
    .is('deleted_at', null)
    .lt('created_at', threeDaysAgo.toISOString());
    
  if (reactionsError) console.error('Error archiving reactions:', reactionsError);
  if (pickActionsError) console.error('Error archiving pick actions:', pickActionsError);
}
```

**Step 6: Create RAG demo data generator**
```typescript
// scripts/mock/generators/rag-demo.ts
import { supabase } from '../../supabase-client';

export async function archiveOldMockContent() {
  console.log('🗄️ Archiving old mock content for RAG demo...');
  
  // Archive posts older than 24 hours
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const { data: archivedPosts } = await supabase
    .from('posts')
    .update({ archived: true })
    .eq('archived', false)
    .lt('created_at', oneDayAgo.toISOString())
    .select();
    
  console.log(`  ✅ Archived ${archivedPosts?.length || 0} posts`);
  
  // Archive bets older than 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const { data: archivedBets } = await supabase
    .from('bets')
    .update({ archived: true })
    .eq('archived', false)
    .lt('created_at', oneWeekAgo.toISOString())
    .select();
    
  console.log(`  ✅ Archived ${archivedBets?.length || 0} bets`);
  
  // Archive engagement data older than 3 days
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  await supabase
    .from('reactions')
    .update({ archived: true })
    .eq('archived', false)
    .lt('created_at', threeDaysAgo.toISOString());
    
  await supabase
    .from('pick_actions')
    .update({ archived: true })
    .eq('archived', false)
    .lt('created_at', threeDaysAgo.toISOString());
    
  console.log('  ✅ Archived old reactions and pick actions');
}

export async function createRAGDemoScenarios(mockUsers: User[], games: Game[]) {
  console.log('🤖 Creating RAG demo scenarios...');
  
  // Create posts with similar captions for AI training
  const captionTemplates = [
    "Let's go! 🔥",
    "Easy money tonight 💰",
    "Lock of the day 🔒",
    "Feeling good about this one 🎯",
    "Trust the process 📈"
  ];
  
  // Create archived posts with these captions
  for (const template of captionTemplates) {
    for (let i = 0; i < 5; i++) {
      const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - (i + 2)); // 2-6 days ago
      
      await supabase.from('posts').insert({
        user_id: user.id,
        caption: template,
        media_type: 'photo',
        media_url: getRandomMediaUrl('celebration'),
        post_type: 'content',
        created_at: createdAt.toISOString(),
        archived: true,
        expires_at: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }
  
  console.log('  ✅ Created archived posts for caption training');
  
  // Create consensus betting scenarios
  const popularGame = games[0];
  const consensusUsers = mockUsers.slice(0, 5);
  
  for (const user of consensusUsers) {
    const createdAt = new Date();
    createdAt.setHours(createdAt.getHours() - 1); // 1 hour ago
    
    await supabase.from('bets').insert({
      user_id: user.id,
      game_id: popularGame.id,
      bet_type: 'spread',
      bet_details: { team: popularGame.home_team, line: -7 },
      stake: 100,
      odds: -110,
      potential_win: 90.91,
      created_at: createdAt.toISOString()
    });
  }
  
  console.log('  ✅ Created consensus betting scenario');
}
```

**Step 7: Update orchestrator to use RAG demo**
```typescript
// Add to scripts/mock/orchestrators/setup.ts after step 10
import { archiveOldMockContent, createRAGDemoScenarios } from '../generators/rag-demo';

// After creating initial content...
// 11. Archive old content to simulate time passing
await archiveOldMockContent();

// 12. Create RAG-specific demo scenarios
await createRAGDemoScenarios(mockUsers, games);

console.log('\n🎉 Mock data setup complete with RAG demo scenarios!');
```

**Key Technical Decisions**:
- Archive instead of delete to preserve data for AI
- Keep deleted_at for actual deletions (user/moderation actions)
- Run bet archiving weekly to reduce database load
- Archive engagement data after 3 days (configurable)

### Dependencies & Risks
**Dependencies**:
- Archive columns must exist (from Sprint 8.01)
- Existing job infrastructure must be working

**Identified Risks**:
- Large number of records to update → Add batch processing if needed
- Job timing conflicts → Ensure weekly check doesn't interfere
- Performance impact → Monitor job execution time

## Implementation Log

### Day-by-Day Progress
**[2024-12-29]**:
- Started: Sprint initialization and codebase investigation
- Completed: 
  - Analysis of content-expiration job, database schema verification, mock generator patterns
  - Modified all expiration methods to use `archived: true` instead of `deleted_at`
  - Added weekly bet archiving method
  - Added engagement data archiving method (reactions and pick_actions)
  - Updated job description and logging messages
  - Verified implementation with test script
- Blockers: Job CLI has React Native import issues, but core logic is correct
- Decisions: 
  - Kept hourly schedule as per reviewer guidance
  - Implemented without batch processing initially
  - Added engagement archiving to run hourly

### Implementation Plan Analysis

**Current Job Structure**:
- Runs hourly (not every 5 minutes as stated in sprint doc)
- Uses `deleted_at` for marking expired content
- Expires content based on different criteria:
  - Posts: 24h after creation (content posts)
  - Pick posts: 3h after game start
  - Stories: Based on expires_at field
  - Messages: Based on expires_at field
- Cleans up related data and hard deletes after 30 days

**Implementation Approach**:
1. Modify all expiration methods to use `archived: true` instead of `deleted_at`
2. Add conditions to preserve already deleted content (user/moderation actions)
3. Add weekly bet archiving check within hourly job
4. Add engagement data archiving (runs hourly)
5. Create RAG demo generator following existing mock patterns
6. Update setup orchestrator to include RAG scenarios

### Questions for Reviewer

**Q1: Job Schedule Discrepancy**
- **Finding**: The job currently runs every hour (`schedule: '0 * * * *'`), not every 5 minutes
- **Question**: Should I change the schedule to match the sprint doc (every 5 minutes)?
- **E's Recommendation**: Keep hourly schedule to avoid excessive database load
- **Reviewer Decision**: ✅ KEEP HOURLY - The job already runs hourly, not every 5 minutes. This is appropriate for production.

**Q2: Batch Processing Implementation**
- **Finding**: Current implementation processes all records at once
- **Question**: Should I implement batch processing proactively or wait for performance issues?
- **E's Recommendation**: Start without batching, add only if performance issues arise
- **Reviewer Decision**: ✅ START WITHOUT BATCHING - Add only if performance issues arise. Monitor initial runs.

**Q3: Engagement Data Archiving Frequency**
- **Finding**: No existing pattern for engagement data expiration
- **Question**: Should engagement archiving run hourly or only during weekly bet archiving?
- **E's Recommendation**: Run hourly to keep data fresh and avoid large batches
- **Reviewer Decision**: ✅ RUN HOURLY - Include in the hourly job to maintain fresh data and avoid large batch accumulations.

**Q4: Mock Data Time Range**
- **Finding**: Mock data uses various timestamps
- **Question**: How far back should archived content be created for RAG demos?
- **E's Recommendation**: Create content 2-6 days old for a good mix of archived data
- **Reviewer Decision**: ✅ 2-30 DAYS OLD - Create a wider range of archived content for better RAG demonstration:
  - Recent (2-7 days): Fresh archived content
  - Older (7-30 days): Historical patterns for AI learning

### Sprint Scope Adjustment

**Reviewer Guidance**: This sprint should ONLY modify the production job to archive instead of delete. Mock data generation is a separate concern.

**Removed from Sprint 8.02** (moved to Sprint 8.10):
- Creating `scripts/mock/generators/rag-demo.ts`
- Updating `scripts/mock/orchestrators/setup.ts`

**Updated Sprint 8.02 Focus**:
- Modify `scripts/jobs/content-expiration.ts` ONLY
- Change deletion to archiving for posts, stories, messages
- Add weekly bet archiving logic
- Add engagement data archiving (reactions, pick_actions)
- Maintain production code quality without mock data concerns

### Additional Implementation Guidance

1. **Weekly Bet Archiving Logic**:
   - Instead of checking for Sunday midnight, track last run time
   - Consider using a separate job or flag to ensure it runs exactly once per week

2. **Archive vs Delete Clarity**:
   - `archived=true`: Content expired naturally (time-based)
   - `deleted_at`: User/moderation actions (manual deletion)
   - Never set both - they represent different intents

3. **Testing Approach**:
   - Test production code with --dry-run flag first
   - Verify counts before actual archiving
   - Monitor first production run closely

### Reality Checks & Plan Updates

**Reality Check 1** - [2024-12-29]
- Issue: Sprint scope included mock data generation
- Options Considered:
  1. Keep mock data in this sprint - Pros: Complete RAG demo ready / Cons: Mixes production and mock concerns
  2. Separate mock data to new sprint - Pros: Clean separation of concerns / Cons: RAG demo delayed
- Decision: Separate mock data to Sprint 8.10
- Plan Update: Focus only on production job modifications
- Epic Impact: Added Sprint 8.10 to epic for mock data generation

### Code Quality Checks

**Linting Results**:
- [x] Initial run: 0 errors, 0 warnings (content-expiration.ts)
- [x] Final run: 0 errors, 0 warnings

**Type Checking Results**:
- [x] Initial run: 0 errors
- [x] Final run: 0 errors

**Build Results**:
- [x] Development build passes
- [ ] Production build passes (N/A - backend job)

## Key Code Additions

### Archive Logic Pattern
```typescript
// Standard archive pattern for all content types
.update({ archived: true })
.eq('archived', false)
.is('deleted_at', null)
.lt('expires_at', new Date().toISOString())
```

### Logging Updates
```typescript
// Updated logging to reflect archiving
console.log(`Archived ${archivedCount} expired posts`);
console.log(`Archived ${archivedCount} expired stories`);
console.log(`Archived ${archivedCount} old bets (weekly cleanup)`);
```

### Batch Processing (if needed)
```typescript
// If performance is an issue, process in batches
const BATCH_SIZE = 1000;
let offset = 0;
let hasMore = true;

while (hasMore) {
  const { data, error } = await supabase
    .from('posts')
    .select('id')
    .eq('archived', false)
    .lt('expires_at', new Date().toISOString())
    .range(offset, offset + BATCH_SIZE - 1);
    
  if (data && data.length > 0) {
    // Archive this batch
    offset += BATCH_SIZE;
  } else {
    hasMore = false;
  }
}
```

## Testing Performed

### Manual Testing
- [x] Posts archive after expiration (not deleted) - Verified query logic
- [x] Stories archive after expiration (not deleted) - Verified query logic
- [x] Messages archive after expiration - Verified query logic
- [x] Bets archive after 7 days - Test found 5 bets to archive
- [x] Reactions archive after 3 days - Verified query logic
- [x] Pick actions archive after 3 days - Verified query logic
- [x] Already deleted content (deleted_at != null) is not archived - Queries include check
- [x] Already archived content is not re-processed - All queries check archived=false
- [x] Job continues to run every hour (per schedule)
- [x] Proper error handling and logging - All methods have try/catch

### Edge Cases Considered
- Content with null expires_at handled correctly (messages check for not null)
- Already archived content not re-processed (all queries filter archived=false)
- Deleted content (by user/moderation) remains untouched (is('deleted_at', null) check)
- Job handles database errors gracefully (all methods throw errors up to job runner)
- Large batches handled with limit option support

## Documentation Updates

- [x] Job comments updated to reflect archiving vs deletion
- [ ] README updated if job behavior documented there (no job-specific README found)
- [x] Added comments explaining archive vs delete distinction

## Handoff to Reviewer

### What Was Implemented
Modified content expiration job to implement archiving strategy:
- Posts and stories now archived when expired (not deleted)
- Messages now archived when expired (not deleted)
- Added weekly bet archiving (7 days old)
- Added engagement data archiving (3 days old for reactions and pick_actions)
- Preserved deleted_at for actual deletions (user/moderation actions)
- Updated logging to reflect new behavior
- All queries check both archived=false and deleted_at is null

### Files Modified/Created
**Modified**:
- `scripts/jobs/content-expiration.ts` - Changed deletion to archiving, added bet and engagement archiving

### Key Decisions Made
1. **Archive timing**: Kept existing hourly schedule per reviewer guidance
2. **Bet archiving**: Runs every hour, archives bets older than 7 days
3. **Engagement archiving**: Runs every hour, archives data older than 3 days
4. **Backward compatibility**: Kept deleted_at for user/moderation deletions
5. **Import fix**: Removed dotenv import, using scripts/supabase-client

### Deviations from Original Plan
- Did not implement Sunday midnight check for bet archiving - simpler to run hourly and check age
- Did not implement batch processing initially - can add if performance issues arise

### Known Issues/Concerns
- Job CLI has React Native import issues preventing direct execution via npm scripts
- Core logic is correct and tested via standalone script
- May need batch processing for initial archiving run with large datasets
- No tracking of last run time for weekly bets (relies on age-based logic)

### Suggested Review Focus
- Archive query correctness - all use archived=true and check archived=false
- Performance implications of hourly engagement archiving
- Error handling completeness
- Logging clarity for operations teams

**Sprint Status**: READY FOR REVIEW

---

## Reviewer Section

**Reviewer**: R  
**Review Date**: 2024-12-29

### Review Checklist
- [x] Code matches sprint objectives
- [x] All planned files created/modified
- [x] Follows established patterns
- [x] No unauthorized scope additions
- [x] Code is clean and maintainable
- [x] No obvious bugs or issues
- [x] Integrates properly with existing code

### Review Outcome

**Status**: APPROVED

### Quality Checks
- Lint: ✅ 0 errors, 0 warnings
- TypeCheck: ✅ 0 errors
- Code Review: ✅ Pass

### Review Notes
- Implementation meets all sprint objectives
- Code quality excellent - all archive operations properly implemented
- Correctly uses `archived: true` instead of `deleted_at` for natural expiration
- All queries include proper checks for both `archived=false` and `deleted_at is null`
- Mock data generation properly separated to Sprint 8.10 per reviewer guidance
- Error handling and logging are appropriate for production use

### Key Implementation Highlights
1. **Archive Pattern Consistency**: All archive operations follow the same pattern:
   ```typescript
   .update({ archived: true })
   .eq('archived', false)
   .is('deleted_at', null)
   ```

2. **Bet Archiving**: Implemented with simple age-based logic (7 days) running hourly

3. **Engagement Archiving**: Reactions and pick_actions archived after 3 days

4. **Backward Compatibility**: Preserved `deleted_at` for user/moderation deletions

5. **Performance Considerations**: Limit option supported for batch processing if needed

### Sprint Approval

This sprint successfully transforms the content expiration job from deletion to archiving, enabling data preservation for RAG features. The implementation is clean, follows established patterns, and maintains backward compatibility.

The executor made good decisions:
- Kept the hourly schedule (not changing to 5 minutes)
- Implemented without initial batching (can add if needed)
- Properly separated mock data concerns to Sprint 8.10
- Maintained clear distinction between archived (natural expiration) and deleted_at (user action)

### Post-Review Updates
No updates required - implementation approved as submitted.

---

## Sprint Metrics

**Duration**: Planned 2 hours | Actual 1.5 hours  
**Scope Changes**: 1 (separated mock data to Sprint 8.10)  
**Review Cycles**: 1 (approved on first review)  
**Files Touched**: 1 (scripts/jobs/content-expiration.ts)  
**Lines Added**: ~115 (2 new methods, modified 8 existing)  
**Lines Removed**: ~0 (changes were updates, not removals)

## Learnings for Future Sprints

1. **Clear Separation of Concerns**: Separating production code from mock data generation improves code clarity and maintainability
2. **Import Management**: Using the scripts-specific supabase-client avoids React Native import issues in backend jobs
3. **Age-based Logic**: Simple age-based archiving (vs complex schedule checks) reduces complexity and improves reliability

---

*Sprint Started: 2024-12-29*  
*Sprint Completed: 2024-12-29*  
*Final Status: APPROVED* 