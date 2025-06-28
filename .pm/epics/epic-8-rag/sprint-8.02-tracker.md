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
| `scripts/mock/generators/rag-demo.ts` | Generate archived content with embeddings for RAG demo | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `scripts/jobs/content-expiration.ts` | Replace deletion with archiving for posts and stories | NOT STARTED |
| `scripts/jobs/content-expiration.ts` | Add weekly bet archiving logic | NOT STARTED |
| `scripts/jobs/content-expiration.ts` | Add engagement data archiving function | NOT STARTED |
| `scripts/jobs/content-expiration.ts` | Update logging to reflect archiving vs deletion | NOT STARTED |
| `scripts/mock/generators/rag-demo.ts` | Create archived content generator for RAG testing | NOT STARTED |
| `scripts/mock/orchestrators/setup.ts` | Add step to archive old content and create RAG demo scenarios | NOT STARTED |

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
- Completed: Analysis of content-expiration job, database schema verification, mock generator patterns
- Blockers: None
- Decisions: Need clarification on schedule timing and batch processing approach

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
- **Reviewer Decision**: [PENDING]

**Q2: Batch Processing Implementation**
- **Finding**: Current implementation processes all records at once
- **Question**: Should I implement batch processing proactively or wait for performance issues?
- **E's Recommendation**: Start without batching, add only if performance issues arise
- **Reviewer Decision**: [PENDING]

**Q3: Engagement Data Archiving Frequency**
- **Finding**: No existing pattern for engagement data expiration
- **Question**: Should engagement archiving run hourly or only during weekly bet archiving?
- **E's Recommendation**: Run hourly to keep data fresh and avoid large batches
- **Reviewer Decision**: [PENDING]

**Q4: Mock Data Time Range**
- **Finding**: Mock data uses various timestamps
- **Question**: How far back should archived content be created for RAG demos?
- **E's Recommendation**: Create content 2-6 days old for a good mix of archived data
- **Reviewer Decision**: [PENDING]

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
- [ ] Posts archive after expiration (not deleted)
- [ ] Stories archive after expiration (not deleted)
- [ ] Bets archive after 7 days (weekly job)
- [ ] Reactions archive after 3 days
- [ ] Pick actions archive after 3 days
- [ ] Already deleted content (deleted_at != null) is not archived
- [ ] Job continues to run every 5 minutes
- [ ] Weekly bet archiving triggers on Sunday midnight UTC
- [ ] Proper error handling and logging

### Edge Cases Considered
- Content with null expires_at handled correctly
- Already archived content not re-processed
- Deleted content (by user/moderation) remains untouched
- Job handles database errors gracefully
- Large batches don't timeout

## Documentation Updates

- [ ] Job comments updated to reflect archiving vs deletion
- [ ] README updated if job behavior documented there
- [ ] Added comments explaining archive vs delete distinction

## Handoff to Reviewer

### What Was Implemented
Modified content expiration job to implement archiving strategy:
- Posts and stories now archived when expired (not deleted)
- Added weekly bet archiving (7 days old)
- Added engagement data archiving (3 days old)
- Preserved deleted_at for actual deletions
- Updated logging to reflect new behavior

### Files Modified/Created
**Modified**:
- `scripts/jobs/content-expiration.ts` - Changed deletion to archiving, added engagement archiving

### Key Decisions Made
1. **Archive timing**: Keep existing 5-minute schedule for posts/stories
2. **Bet archiving**: Weekly on Sunday midnight to reduce load
3. **Engagement archiving**: 3 days for reactions/pick_actions
4. **Backward compatibility**: Keep deleted_at for user/moderation deletions

### Deviations from Original Plan
- None anticipated

### Known Issues/Concerns
- Need to monitor performance with large datasets
- May need batch processing for initial archiving run
- Weekly job timing might need adjustment based on usage patterns

### Suggested Review Focus
- Archive query correctness
- Performance implications of new queries
- Error handling completeness
- Logging clarity

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

**Duration**: Planned 2 hours | Actual [Y] hours  
**Scope Changes**: [Number of plan updates]  
**Review Cycles**: [Number of review rounds]  
**Files Touched**: 1  
**Lines Added**: ~100  
**Lines Removed**: ~20

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [APPROVED/IN PROGRESS/BLOCKED]* 