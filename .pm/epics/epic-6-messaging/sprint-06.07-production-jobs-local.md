# Sprint 06.07: Production Jobs as Local Scripts Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: [Date]  
**End Date**: [Date]  
**Epic**: Epic 6 - Messaging System & Automation

**Sprint Goal**: Build all production automation jobs as local TypeScript scripts with clean interfaces, preparing for easy Edge Function migration while maintaining full control for demos.

**User Story Contribution**: 
- Enables platform automation for content expiration, badge calculations, and maintenance
- Provides manual control for demo recordings and testing
- Sets foundation for production cron jobs

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
1. Create structured job system with consistent interfaces
2. Build content expiration job (posts, stories, messages)
3. Implement weekly bankroll reset job
4. Create badge calculation job
5. Build game settlement job
6. Add stats rollup job
7. Create cleanup/maintenance jobs
8. Build CLI interface for manual execution

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `scripts/jobs/types.ts` | Common job interfaces | NOT STARTED |
| `scripts/jobs/content-expiration.ts` | Expire ephemeral content | NOT STARTED |
| `scripts/jobs/bankroll-reset.ts` | Weekly bankroll resets | NOT STARTED |
| `scripts/jobs/badge-calculation.ts` | Calculate weekly badges | NOT STARTED |
| `scripts/jobs/game-settlement.ts` | Settle completed games | NOT STARTED |
| `scripts/jobs/stats-rollup.ts` | Calculate user stats | NOT STARTED |
| `scripts/jobs/cleanup.ts` | Database maintenance | NOT STARTED |
| `scripts/jobs/media-cleanup.ts` | Orphaned media cleanup | NOT STARTED |
| `scripts/jobs/cli.ts` | CLI interface for jobs | NOT STARTED |
| `scripts/jobs/runner.ts` | Job execution framework | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `package.json` | Add job script commands | NOT STARTED |
| `services/badges/badgeService.ts` | Extract calculation logic | NOT STARTED |
| `services/content/postService.ts` | Add bulk expiration | NOT STARTED |
| `supabase/migrations/018_job_tracking.sql` | Job execution tracking | NOT STARTED |

### Implementation Approach

**1. Job System Framework**:
```typescript
// scripts/jobs/types.ts
export interface JobConfig {
  name: string;
  description: string;
  schedule?: string; // Cron expression for documentation
  timeout?: number; // Max execution time
}

export interface JobResult {
  success: boolean;
  message: string;
  affected: number;
  duration: number;
  details?: Record<string, any>;
}

export interface JobOptions {
  dryRun?: boolean;
  verbose?: boolean;
  limit?: number;
}

export abstract class BaseJob {
  constructor(protected config: JobConfig) {}
  
  async execute(options: JobOptions = {}): Promise<JobResult> {
    const start = Date.now();
    console.log(`🚀 Starting job: ${this.config.name}`);
    
    try {
      const result = await this.run(options);
      const duration = Date.now() - start;
      
      console.log(`✅ Completed: ${result.message} (${duration}ms)`);
      
      // Track execution
      if (!options.dryRun) {
        await this.trackExecution({ ...result, duration });
      }
      
      return { ...result, duration };
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`❌ Failed: ${error.message}`);
      
      return {
        success: false,
        message: error.message,
        affected: 0,
        duration,
      };
    }
  }
  
  abstract run(options: JobOptions): Promise<Omit<JobResult, 'duration'>>;
  
  private async trackExecution(result: JobResult) {
    await supabase.from('job_executions').insert({
      job_name: this.config.name,
      success: result.success,
      message: result.message,
      affected_count: result.affected,
      duration_ms: result.duration,
      details: result.details,
    });
  }
}
```

**2. Content Expiration Job**:
```typescript
// scripts/jobs/content-expiration.ts
export class ContentExpirationJob extends BaseJob {
  constructor() {
    super({
      name: 'content-expiration',
      description: 'Expire posts, stories, and messages based on their expiration times',
      schedule: '0 * * * *', // Every hour
    });
  }
  
  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    let totalAffected = 0;
    
    // 1. Expire posts (24h after creation)
    const expiredPosts = await this.expirePosts(options);
    totalAffected += expiredPosts;
    
    // 2. Expire pick posts (3h after game start)
    const expiredPicks = await this.expirePickPosts(options);
    totalAffected += expiredPicks;
    
    // 3. Expire messages (based on chat settings)
    const expiredMessages = await this.expireMessages(options);
    totalAffected += expiredMessages;
    
    // 4. Hard delete old soft-deleted content
    const hardDeleted = await this.hardDeleteOldContent(options);
    
    return {
      success: true,
      message: `Expired ${totalAffected} items, hard deleted ${hardDeleted} items`,
      affected: totalAffected,
      details: {
        posts: expiredPosts,
        picks: expiredPicks,
        messages: expiredMessages,
        hardDeleted,
      },
    };
  }
  
  private async expirePosts(options: JobOptions): Promise<number> {
    const query = supabase
      .from('posts')
      .update({ deleted_at: new Date().toISOString() })
      .is('deleted_at', null)
      .lt('expires_at', new Date().toISOString());
    
    if (options.limit) {
      query.limit(options.limit);
    }
    
    if (options.dryRun) {
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .lt('expires_at', new Date().toISOString());
      
      console.log(`Would expire ${count} posts`);
      return count || 0;
    }
    
    const { data, error } = await query.select();
    if (error) throw error;
    
    return data?.length || 0;
  }
  
  // Similar methods for picks, messages, hard delete...
}

// CLI execution
if (import.meta.main) {
  const job = new ContentExpirationJob();
  await job.execute({
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
  });
}
```

**3. Weekly Bankroll Reset**:
```typescript
// scripts/jobs/bankroll-reset.ts
export class BankrollResetJob extends BaseJob {
  constructor() {
    super({
      name: 'bankroll-reset',
      description: 'Reset all user bankrolls to base + referral bonuses',
      schedule: '0 0 * * 1', // Monday midnight
    });
  }
  
  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    // Get all users with their referral counts
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        referral_count,
        bankrolls!inner(balance)
      `);
    
    if (error) throw error;
    
    const updates = users.map(user => ({
      user_id: user.id,
      balance: 1000 + (user.referral_count * 100),
      weekly_reset_at: new Date().toISOString(),
    }));
    
    if (options.dryRun) {
      console.log(`Would reset ${updates.length} bankrolls`);
      if (options.verbose) {
        updates.forEach(u => 
          console.log(`  User ${u.user_id}: $${u.balance}`)
        );
      }
      return {
        success: true,
        message: `Would reset ${updates.length} bankrolls`,
        affected: updates.length,
      };
    }
    
    // Perform updates
    for (const update of updates) {
      await supabase
        .from('bankrolls')
        .update({
          balance: update.balance,
          weekly_reset_at: update.weekly_reset_at,
        })
        .eq('user_id', update.user_id);
    }
    
    // Send notifications
    await this.sendResetNotifications(users.map(u => u.id));
    
    return {
      success: true,
      message: `Reset ${updates.length} bankrolls`,
      affected: updates.length,
      details: {
        totalNewBalance: updates.reduce((sum, u) => sum + u.balance, 0),
      },
    };
  }
}
```

**4. Badge Calculation Job**:
```typescript
// scripts/jobs/badge-calculation.ts
export class BadgeCalculationJob extends BaseJob {
  constructor() {
    super({
      name: 'badge-calculation',
      description: 'Calculate weekly badges for all users',
      schedule: '0 * * * *', // Every hour
    });
  }
  
  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    const badges = [
      { id: 'hot_streak', calculator: this.calculateHotStreak },
      { id: 'profit_king', calculator: this.calculateProfitKing },
      { id: 'riding_wave', calculator: this.calculateRidingWave },
      { id: 'sharp', calculator: this.calculateSharp },
      { id: 'fade_god', calculator: this.calculateFadeGod },
      { id: 'most_active', calculator: this.calculateMostActive },
      { id: 'ghost', calculator: this.calculateGhost },
      { id: 'sunday_sweep', calculator: this.calculateSundaySweep },
    ];
    
    let totalBadgesAwarded = 0;
    
    for (const badge of badges) {
      const awarded = await badge.calculator.call(this, options);
      totalBadgesAwarded += awarded;
      
      if (options.verbose) {
        console.log(`  ${badge.id}: ${awarded} users`);
      }
    }
    
    // Update effect access based on badge counts
    await this.updateEffectAccess(options);
    
    return {
      success: true,
      message: `Calculated badges for all users`,
      affected: totalBadgesAwarded,
      details: {
        timestamp: new Date().toISOString(),
        badgeTypes: badges.length,
      },
    };
  }
  
  private async calculateHotStreak(options: JobOptions): Promise<number> {
    // Users with 3+ consecutive wins this week
    const query = `
      WITH consecutive_wins AS (
        SELECT 
          user_id,
          COUNT(*) FILTER (WHERE outcome = 'win') as win_count,
          MAX(COUNT(*) FILTER (WHERE outcome = 'win')) 
            OVER (PARTITION BY user_id ORDER BY created_at 
                  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as streak
        FROM bets
        WHERE created_at > NOW() - INTERVAL '7 days'
        AND outcome IS NOT NULL
        GROUP BY user_id, created_at
      )
      SELECT user_id
      FROM consecutive_wins
      WHERE streak >= 3
      GROUP BY user_id
    `;
    
    if (options.dryRun) {
      console.log('Would calculate hot streak badges');
      return 0;
    }
    
    const { data, error } = await supabase.rpc('calculate_hot_streaks');
    if (error) throw error;
    
    // Award badges
    for (const user of data) {
      await badgeService.awardBadge(user.user_id, 'hot_streak');
    }
    
    return data.length;
  }
  
  // Similar methods for other badges...
}
```

**5. CLI Interface**:
```typescript
// scripts/jobs/cli.ts
#!/usr/bin/env bun

import { Command } from 'commander';
import { ContentExpirationJob } from './content-expiration';
import { BankrollResetJob } from './bankroll-reset';
import { BadgeCalculationJob } from './badge-calculation';
// ... other imports

const program = new Command();

program
  .name('jobs')
  .description('Run SnapBet automation jobs')
  .version('1.0.0');

// Run all jobs
program
  .command('all')
  .description('Run all production jobs')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show detailed output')
  .action(async (options) => {
    const jobs = [
      new ContentExpirationJob(),
      new BadgeCalculationJob(),
      // Don't include bankroll reset in "all"
    ];
    
    for (const job of jobs) {
      await job.execute(options);
      console.log('---');
    }
  });

// Individual job commands
program
  .command('expire')
  .description('Expire content')
  .option('--dry-run', 'Preview changes without executing')
  .option('--limit <number>', 'Limit number of items to process')
  .action(async (options) => {
    const job = new ContentExpirationJob();
    await job.execute(options);
  });

program
  .command('badges')
  .description('Calculate weekly badges')
  .option('--dry-run', 'Preview changes without executing')
  .option('--verbose', 'Show badge details')
  .action(async (options) => {
    const job = new BadgeCalculationJob();
    await job.execute(options);
  });

program
  .command('reset-bankrolls')
  .description('Reset weekly bankrolls (use with caution!)')
  .option('--dry-run', 'Preview changes without executing')
  .option('--force', 'Skip confirmation')
  .action(async (options) => {
    if (!options.dryRun && !options.force) {
      const confirm = await prompt('Reset all bankrolls? (yes/no): ');
      if (confirm !== 'yes') {
        console.log('Cancelled');
        return;
      }
    }
    
    const job = new BankrollResetJob();
    await job.execute(options);
  });

// Schedule command to show when jobs run
program
  .command('schedule')
  .description('Show job schedules')
  .action(() => {
    const jobs = [
      { name: 'Content Expiration', schedule: 'Every hour' },
      { name: 'Badge Calculation', schedule: 'Every hour' },
      { name: 'Bankroll Reset', schedule: 'Monday midnight' },
      { name: 'Game Settlement', schedule: 'Every 30 minutes' },
      { name: 'Stats Rollup', schedule: 'Every hour' },
      { name: 'Cleanup', schedule: 'Daily at 3 AM' },
    ];
    
    console.table(jobs);
  });

program.parse();
```

**6. Package.json Scripts**:
```json
{
  "scripts": {
    "jobs": "bun run scripts/jobs/cli.ts",
    "jobs:expire": "bun run scripts/jobs/cli.ts expire",
    "jobs:badges": "bun run scripts/jobs/cli.ts badges",
    "jobs:reset": "bun run scripts/jobs/cli.ts reset-bankrolls",
    "jobs:all": "bun run scripts/jobs/cli.ts all",
    "jobs:schedule": "bun run scripts/jobs/cli.ts schedule"
  }
}
```

**Key Technical Decisions**:
- Each job extends BaseJob for consistent interface
- Dry run mode for safe testing
- Verbose mode for demo visibility
- Job execution tracking in database
- CLI interface for easy manual execution
- Modular design for Edge Function migration

### Dependencies & Risks
**Dependencies**:
- commander (for CLI interface)
- Existing service layer for business logic

**Identified Risks**:
- Long-running jobs might timeout
- Database locks during bulk updates
- Memory usage with large datasets
- Timing conflicts between jobs

**Mitigation**:
- Batch processing with limits
- Transaction management
- Progress logging
- Job coordination through tracking

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

### Database Migration
```sql
-- supabase/migrations/018_job_tracking.sql
CREATE TABLE job_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  message TEXT,
  affected_count INTEGER DEFAULT 0,
  duration_ms INTEGER,
  details JSONB,
  executed_at TIMESTAMP DEFAULT NOW(),
  executed_by TEXT DEFAULT 'system'
);

-- Index for querying job history
CREATE INDEX idx_job_executions_name_time 
ON job_executions(job_name, executed_at DESC);

-- Keep only last 30 days of history
CREATE OR REPLACE FUNCTION cleanup_old_job_executions()
RETURNS void AS $$
BEGIN
  DELETE FROM job_executions
  WHERE executed_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| N/A | Local execution only | CLI args | Console output | WORKING |
| POST | /rest/v1/job_executions | Execution log | Created | WORKING |

### State Management
- Job state tracked in database
- Progress logged to console
- Results returned as structured data
- No UI state management needed

## Testing Performed

### Manual Testing
- [ ] Content expiration dry run shows correct items
- [ ] Badge calculation identifies correct users
- [ ] Bankroll reset calculates correct amounts
- [ ] Game settlement processes correctly
- [ ] Stats rollup aggregates properly
- [ ] Cleanup removes orphaned data
- [ ] CLI commands work as expected
- [ ] Dry run mode prevents changes
- [ ] Verbose mode shows details
- [ ] Job tracking records executions

### Edge Cases Considered
- No items to process → Graceful completion
- Database connection loss → Retry with backoff
- Partial job failure → Track what completed
- Concurrent job execution → Use locks
- Large datasets → Batch processing
- Time zone considerations → UTC everywhere

## Documentation Updates

- [ ] Job schedule documentation
- [ ] CLI usage guide
- [ ] Dry run examples
- [ ] Edge Function migration notes
- [ ] Monitoring recommendations

## Handoff to Reviewer

### What Was Implemented
[Clear summary of all work completed]

### Files Modified/Created
**Created**:
- `scripts/jobs/types.ts` - Job framework
- `scripts/jobs/content-expiration.ts` - Content job
- `scripts/jobs/bankroll-reset.ts` - Bankroll job
- `scripts/jobs/badge-calculation.ts` - Badge job
- `scripts/jobs/game-settlement.ts` - Settlement job
- `scripts/jobs/stats-rollup.ts` - Stats job
- `scripts/jobs/cleanup.ts` - Cleanup job
- `scripts/jobs/media-cleanup.ts` - Media job
- `scripts/jobs/cli.ts` - CLI interface
- `scripts/jobs/runner.ts` - Execution framework

**Modified**:
- `package.json` - Added job scripts
- `services/badges/badgeService.ts` - Extracted logic
- `services/content/postService.ts` - Bulk operations

### Key Decisions Made
1. **BaseJob class**: Consistent interface for all jobs
2. **Dry run mode**: Safe testing and demos
3. **CLI interface**: Easy manual execution
4. **Job tracking**: Database audit trail
5. **Modular design**: Ready for Edge Functions

### Deviations from Original Plan
- Added job execution tracking table
- Enhanced CLI with schedule command
- Added verbose mode for demo visibility

### Known Issues/Concerns
- Long-running jobs need monitoring
- Batch size tuning required
- Memory usage on large operations
- Edge Function timeout limits

### Suggested Review Focus
- Job framework design
- Error handling completeness
- Batch processing logic
- CLI usability
- Database query efficiency

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
- [ ] Jobs are idempotent
- [ ] Error handling comprehensive
- [ ] Performance acceptable

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
**Files Touched**: 14  
**Lines Added**: ~[Estimate]  
**Lines Removed**: ~[Estimate]

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [APPROVED/IN PROGRESS/BLOCKED]* 