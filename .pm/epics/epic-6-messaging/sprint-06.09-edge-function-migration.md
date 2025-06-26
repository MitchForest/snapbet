# Sprint 06.09: Edge Function Migration Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: [Date]  
**End Date**: [Date]  
**Epic**: Epic 6 - Messaging System & Automation

**Sprint Goal**: Migrate all local scripts to Supabase Edge Functions, set up cron schedules, and maintain manual trigger capability for demos while enabling production automation.

**User Story Contribution**: 
- Enables fully automated platform operations
- Maintains demo control through HTTP triggers
- Provides production-ready infrastructure

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
1. Set up Edge Function infrastructure
2. Migrate production jobs to Edge Functions
3. Configure cron schedules
4. Implement manual HTTP triggers
5. Migrate mock ecosystem functions
6. Add monitoring and error handling
7. Create deployment scripts
8. Test both cron and manual execution

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `supabase/functions/_shared/types.ts` | Shared types | NOT STARTED |
| `supabase/functions/_shared/utils.ts` | Common utilities | NOT STARTED |
| `supabase/functions/_shared/jobs/index.ts` | Job implementations | NOT STARTED |
| `supabase/functions/content-expiration/index.ts` | Content job | NOT STARTED |
| `supabase/functions/bankroll-reset/index.ts` | Bankroll job | NOT STARTED |
| `supabase/functions/badge-calculation/index.ts` | Badge job | NOT STARTED |
| `supabase/functions/game-settlement/index.ts` | Settlement job | NOT STARTED |
| `supabase/functions/stats-rollup/index.ts` | Stats job | NOT STARTED |
| `supabase/functions/cleanup/index.ts` | Cleanup job | NOT STARTED |
| `supabase/functions/mock-activity/index.ts` | Mock generator | NOT STARTED |
| `supabase/functions/.env.example` | Environment template | NOT STARTED |
| `scripts/deploy-functions.ts` | Deployment script | NOT STARTED |
| `scripts/trigger-function.ts` | Manual trigger CLI | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `package.json` | Add function scripts | NOT STARTED |
| `supabase/config.toml` | Configure functions | NOT STARTED |
| `.github/workflows/deploy.yml` | Add function deploy | NOT STARTED |

### Implementation Approach

**1. Shared Job Infrastructure**:
```typescript
// supabase/functions/_shared/types.ts
export interface FunctionRequest {
  trigger: 'cron' | 'manual' | 'http';
  options?: {
    dryRun?: boolean;
    verbose?: boolean;
    limit?: number;
  };
  auth?: {
    token?: string;
    userId?: string;
  };
}

export interface FunctionResponse {
  success: boolean;
  message: string;
  affected: number;
  duration: number;
  details?: Record<string, any>;
  error?: string;
}

// supabase/functions/_shared/utils.ts
import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient(authHeader?: string) {
  // Use service role for cron, user token for manual
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    return createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );
  }
  
  // Service role for cron jobs
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

export async function handleRequest(
  req: Request,
  handler: (data: FunctionRequest) => Promise<FunctionResponse>
): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() });
  }
  
  const start = Date.now();
  
  try {
    const data: FunctionRequest = await req.json();
    
    // Log trigger type
    console.log(`Function triggered via: ${data.trigger}`);
    
    const result = await handler(data);
    const duration = Date.now() - start;
    
    return new Response(
      JSON.stringify({ ...result, duration }),
      {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        status: result.success ? 200 : 400,
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
        affected: 0,
        duration: Date.now() - start,
        error: error.toString(),
      }),
      {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}
```

**2. Content Expiration Function**:
```typescript
// supabase/functions/content-expiration/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleRequest, getSupabaseClient } from '../_shared/utils.ts';
import { ContentExpirationJob } from '../_shared/jobs/content-expiration.ts';

serve(async (req: Request) => {
  return handleRequest(req, async (data) => {
    const supabase = getSupabaseClient(req.headers.get('Authorization'));
    const job = new ContentExpirationJob(supabase);
    
    // Check if manual trigger requires auth
    if (data.trigger === 'manual' && !req.headers.get('Authorization')) {
      throw new Error('Manual triggers require authentication');
    }
    
    const result = await job.execute(data.options || {});
    
    // Track execution
    if (!data.options?.dryRun) {
      await supabase.from('job_executions').insert({
        job_name: 'content-expiration',
        trigger: data.trigger,
        success: result.success,
        message: result.message,
        affected_count: result.affected,
        duration_ms: result.duration,
        details: result.details,
      });
    }
    
    return result;
  });
});
```

**3. Cron Configuration**:
```sql
-- supabase/migrations/019_setup_cron_jobs.sql

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres user
GRANT USAGE ON SCHEMA cron TO postgres;

-- Content expiration - every hour
SELECT cron.schedule(
  'content-expiration',
  '0 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://[PROJECT_REF].supabase.co/functions/v1/content-expiration',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || '[SERVICE_ROLE_KEY]'
      ),
      body := jsonb_build_object(
        'trigger', 'cron',
        'options', jsonb_build_object('verbose', false)
      )
    );
  $$
);

-- Badge calculation - every hour
SELECT cron.schedule(
  'badge-calculation',
  '0 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://[PROJECT_REF].supabase.co/functions/v1/badge-calculation',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || '[SERVICE_ROLE_KEY]'
      ),
      body := jsonb_build_object('trigger', 'cron')
    );
  $$
);

-- Bankroll reset - Monday midnight
SELECT cron.schedule(
  'bankroll-reset',
  '0 0 * * 1',
  $$
  SELECT
    net.http_post(
      url := 'https://[PROJECT_REF].supabase.co/functions/v1/bankroll-reset',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || '[SERVICE_ROLE_KEY]'
      ),
      body := jsonb_build_object('trigger', 'cron')
    );
  $$
);

-- Game settlement - every 30 minutes
SELECT cron.schedule(
  'game-settlement',
  '*/30 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://[PROJECT_REF].supabase.co/functions/v1/game-settlement',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || '[SERVICE_ROLE_KEY]'
      ),
      body := jsonb_build_object('trigger', 'cron')
    );
  $$
);

-- Daily cleanup - 3 AM
SELECT cron.schedule(
  'daily-cleanup',
  '0 3 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://[PROJECT_REF].supabase.co/functions/v1/cleanup',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || '[SERVICE_ROLE_KEY]'
      ),
      body := jsonb_build_object('trigger', 'cron')
    );
  $$
);

-- Mock activity - every 15 minutes (only in dev/staging)
SELECT cron.schedule(
  'mock-activity',
  '*/15 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://[PROJECT_REF].supabase.co/functions/v1/mock-activity',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || '[SERVICE_ROLE_KEY]'
      ),
      body := jsonb_build_object(
        'trigger', 'cron',
        'options', jsonb_build_object('scenario', 'continuous')
      )
    );
  $$
);

-- Function to list all cron jobs
CREATE OR REPLACE FUNCTION list_cron_jobs()
RETURNS TABLE (
  jobid bigint,
  schedule text,
  command text,
  nodename text,
  nodeport integer,
  database text,
  username text,
  active boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM cron.job ORDER BY jobid;
END;
$$ LANGUAGE plpgsql;
```

**4. Mock Activity Function**:
```typescript
// supabase/functions/mock-activity/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleRequest, getSupabaseClient } from '../_shared/utils.ts';
import { MockActivityGenerator } from '../_shared/mock/generator.ts';

serve(async (req: Request) => {
  return handleRequest(req, async (data) => {
    const supabase = getSupabaseClient(req.headers.get('Authorization'));
    const generator = new MockActivityGenerator(supabase);
    
    // Determine scenario
    const scenario = data.options?.scenario || 'continuous';
    
    switch (scenario) {
      case 'continuous':
        // For cron - generate natural ongoing activity
        return await generator.generateContinuousActivity({
          intensity: 'medium',
          duration: 15, // 15 minutes worth
        });
        
      case 'demo-prep':
        // For manual trigger - prepare specific demo
        return await generator.prepareDemo(data.options?.demoType || 'new-user');
        
      case 'burst':
        // For manual trigger - create activity burst
        return await generator.generateBurst({
          users: data.options?.users || 10,
          duration: data.options?.duration || 5,
        });
        
      default:
        throw new Error(`Unknown scenario: ${scenario}`);
    }
  });
});
```

**5. Manual Trigger CLI**:
```typescript
// scripts/trigger-function.ts
#!/usr/bin/env bun

import { Command } from 'commander';

const FUNCTION_BASE_URL = process.env.SUPABASE_URL + '/functions/v1';
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function triggerFunction(
  functionName: string,
  options: any,
  authToken?: string
) {
  const url = `${FUNCTION_BASE_URL}/${functionName}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'apikey': ANON_KEY!,
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      trigger: 'manual',
      options,
    }),
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    console.error('❌ Function error:', result.error);
    process.exit(1);
  }
  
  console.log('✅ Function executed successfully');
  console.log(`   Message: ${result.message}`);
  console.log(`   Affected: ${result.affected}`);
  console.log(`   Duration: ${result.duration}ms`);
  
  if (options.verbose && result.details) {
    console.log('   Details:', JSON.stringify(result.details, null, 2));
  }
}

const program = new Command();

program
  .name('trigger')
  .description('Manually trigger Edge Functions')
  .version('1.0.0');

// Trigger any function
program
  .command('function <name>')
  .description('Trigger a specific function')
  .option('--dry-run', 'Preview without executing')
  .option('--verbose', 'Show detailed output')
  .option('--limit <number>', 'Limit items processed')
  .option('--auth <token>', 'Auth token for manual trigger')
  .action(async (name, options) => {
    await triggerFunction(name, {
      dryRun: options.dryRun,
      verbose: options.verbose,
      limit: options.limit ? parseInt(options.limit) : undefined,
    }, options.auth);
  });

// Convenience commands
program
  .command('expire')
  .description('Trigger content expiration')
  .option('--dry-run', 'Preview without executing')
  .action(async (options) => {
    await triggerFunction('content-expiration', options);
  });

program
  .command('badges')
  .description('Trigger badge calculation')
  .option('--verbose', 'Show badge details')
  .action(async (options) => {
    await triggerFunction('badge-calculation', options);
  });

program
  .command('mock <scenario>')
  .description('Trigger mock activity')
  .option('--users <number>', 'Number of users')
  .option('--duration <number>', 'Duration in minutes')
  .action(async (scenario, options) => {
    await triggerFunction('mock-activity', {
      scenario,
      users: options.users,
      duration: options.duration,
    });
  });

// List functions
program
  .command('list')
  .description('List all Edge Functions')
  .action(async () => {
    const functions = [
      { name: 'content-expiration', schedule: 'Every hour' },
      { name: 'badge-calculation', schedule: 'Every hour' },
      { name: 'bankroll-reset', schedule: 'Monday midnight' },
      { name: 'game-settlement', schedule: 'Every 30 min' },
      { name: 'stats-rollup', schedule: 'Every hour' },
      { name: 'cleanup', schedule: 'Daily 3 AM' },
      { name: 'mock-activity', schedule: 'Every 15 min' },
    ];
    
    console.table(functions);
  });

program.parse();
```

**6. Deployment Script**:
```typescript
// scripts/deploy-functions.ts
#!/usr/bin/env bun

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const FUNCTIONS = [
  'content-expiration',
  'badge-calculation',
  'bankroll-reset',
  'game-settlement',
  'stats-rollup',
  'cleanup',
  'mock-activity',
];

async function deployFunctions() {
  console.log('🚀 Deploying Edge Functions...\n');
  
  // Check Supabase CLI
  try {
    execSync('supabase --version', { stdio: 'pipe' });
  } catch {
    console.error('❌ Supabase CLI not found. Install it first.');
    process.exit(1);
  }
  
  // Deploy each function
  for (const func of FUNCTIONS) {
    console.log(`📦 Deploying ${func}...`);
    
    try {
      execSync(`supabase functions deploy ${func}`, {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
      
      console.log(`✅ ${func} deployed successfully\n`);
    } catch (error) {
      console.error(`❌ Failed to deploy ${func}\n`);
      process.exit(1);
    }
  }
  
  console.log('🎉 All functions deployed successfully!');
  
  // Update cron job URLs
  console.log('\n📝 Updating cron job configuration...');
  await updateCronJobs();
}

async function updateCronJobs() {
  const projectRef = process.env.SUPABASE_PROJECT_REF;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!projectRef || !serviceRoleKey) {
    console.error('❌ Missing SUPABASE_PROJECT_REF or SUPABASE_SERVICE_ROLE_KEY');
    return;
  }
  
  // Read migration file
  const migrationPath = path.join(
    process.cwd(),
    'supabase/migrations/019_setup_cron_jobs.sql'
  );
  
  let migration = readFileSync(migrationPath, 'utf-8');
  
  // Replace placeholders
  migration = migration
    .replace(/\[PROJECT_REF\]/g, projectRef)
    .replace(/\[SERVICE_ROLE_KEY\]/g, serviceRoleKey);
  
  // Write updated migration
  const outputPath = path.join(
    process.cwd(),
    'supabase/migrations/019_setup_cron_jobs_configured.sql'
  );
  
  writeFileSync(outputPath, migration);
  
  console.log('✅ Cron job configuration updated');
  console.log(`   Run: supabase db reset to apply`);
}

// Run deployment
deployFunctions().catch(console.error);
```

**7. Monitoring Function**:
```typescript
// supabase/functions/health-check/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleRequest, getSupabaseClient } from '../_shared/utils.ts';

serve(async (req: Request) => {
  return handleRequest(req, async (data) => {
    const supabase = getSupabaseClient();
    
    // Check recent job executions
    const { data: recentJobs, error } = await supabase
      .from('job_executions')
      .select('*')
      .order('executed_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    
    // Group by job name
    const jobStats = recentJobs.reduce((acc, job) => {
      if (!acc[job.job_name]) {
        acc[job.job_name] = {
          total: 0,
          success: 0,
          failed: 0,
          lastRun: job.executed_at,
          avgDuration: 0,
        };
      }
      
      acc[job.job_name].total++;
      if (job.success) {
        acc[job.job_name].success++;
      } else {
        acc[job.job_name].failed++;
      }
      
      return acc;
    }, {});
    
    return {
      success: true,
      message: 'Health check complete',
      affected: Object.keys(jobStats).length,
      details: {
        jobStats,
        timestamp: new Date().toISOString(),
      },
    };
  });
});
```

**Key Technical Decisions**:
- Dual trigger support (cron + manual HTTP)
- Service role for cron, user auth for manual
- Shared code between local scripts and functions
- Comprehensive error handling and logging
- Easy local testing with trigger CLI

### Dependencies & Risks
**Dependencies**:
- Supabase CLI for deployment
- pg_cron extension
- Deno runtime knowledge

**Identified Risks**:
- Edge Function timeout (150s max)
- Cold start delays
- Cron job failures
- Rate limiting on manual triggers

**Mitigation**:
- Batch operations within timeout
- Keep functions warm with health checks
- Job execution tracking
- Rate limit manual triggers

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

### Environment Configuration
```bash
# supabase/functions/.env.example
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]

# Feature flags
ENABLE_MOCK_ACTIVITY=true
ENABLE_VERBOSE_LOGGING=false
```

### Package.json Scripts
```json
{
  "scripts": {
    "functions:deploy": "bun run scripts/deploy-functions.ts",
    "functions:serve": "supabase functions serve",
    "trigger": "bun run scripts/trigger-function.ts",
    "trigger:expire": "bun run scripts/trigger-function.ts expire",
    "trigger:badges": "bun run scripts/trigger-function.ts badges",
    "trigger:mock": "bun run scripts/trigger-function.ts mock",
    "cron:list": "supabase db query 'SELECT * FROM list_cron_jobs()'"
  }
}
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| POST | /functions/v1/content-expiration | FunctionRequest | FunctionResponse | DEPLOYED |
| POST | /functions/v1/badge-calculation | FunctionRequest | FunctionResponse | DEPLOYED |
| POST | /functions/v1/bankroll-reset | FunctionRequest | FunctionResponse | DEPLOYED |
| POST | /functions/v1/game-settlement | FunctionRequest | FunctionResponse | DEPLOYED |
| POST | /functions/v1/stats-rollup | FunctionRequest | FunctionResponse | DEPLOYED |
| POST | /functions/v1/cleanup | FunctionRequest | FunctionResponse | DEPLOYED |
| POST | /functions/v1/mock-activity | FunctionRequest | FunctionResponse | DEPLOYED |
| POST | /functions/v1/health-check | FunctionRequest | HealthStatus | DEPLOYED |

### State Management
- Job execution state in database
- Function logs in Supabase dashboard
- Health monitoring via dedicated function
- No client state needed

## Testing Performed

### Manual Testing
- [ ] Functions deploy successfully
- [ ] Cron triggers work on schedule
- [ ] Manual HTTP triggers work
- [ ] Auth required for manual triggers
- [ ] Dry run mode prevents changes
- [ ] Job tracking records executions
- [ ] Error handling works properly
- [ ] Timeouts handled gracefully
- [ ] CORS headers correct
- [ ] Health check accurate

### Edge Cases Considered
- Function timeout → Batch processing
- Cold starts → Keep-warm strategy
- Auth failures → Clear error messages
- Network issues → Retry logic
- Concurrent executions → Idempotent design
- Time zone issues → UTC everywhere

## Documentation Updates

- [ ] Edge Function deployment guide
- [ ] Cron schedule documentation
- [ ] Manual trigger examples
- [ ] Monitoring setup guide
- [ ] Troubleshooting guide

## Handoff to Reviewer

### What Was Implemented
[Clear summary of all work completed]

### Files Modified/Created
**Created**:
- `supabase/functions/_shared/types.ts` - Shared types
- `supabase/functions/_shared/utils.ts` - Utilities
- `supabase/functions/_shared/jobs/*` - Job logic
- `supabase/functions/*/index.ts` - Function handlers
- `supabase/functions/.env.example` - Config template
- `scripts/deploy-functions.ts` - Deploy script
- `scripts/trigger-function.ts` - Trigger CLI
- `supabase/migrations/019_setup_cron_jobs.sql` - Cron setup

**Modified**:
- `package.json` - Function scripts
- `supabase/config.toml` - Function config
- `.github/workflows/deploy.yml` - CI/CD

### Key Decisions Made
1. **Dual triggers**: Both cron and manual HTTP
2. **Shared code**: Reuse job logic from local scripts
3. **Auth strategy**: Service role for cron, user auth for manual
4. **Error tracking**: Comprehensive logging and monitoring
5. **Deployment automation**: Script for easy updates

### Deviations from Original Plan
- Added health check function for monitoring
- Enhanced auth security for manual triggers
- Added deployment automation script
- Included CORS support for browser testing

### Known Issues/Concerns
- 150-second timeout limit for functions
- Cold start delays on first execution
- pg_cron requires database access
- Manual triggers need rate limiting

### Suggested Review Focus
- Function timeout handling
- Auth security model
- Error handling completeness
- Cron schedule accuracy
- Deployment process

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
- [ ] Functions handle timeouts
- [ ] Auth is properly secured
- [ ] Monitoring is adequate

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

**Duration**: Planned 1 hour | Actual [Y] hours  
**Scope Changes**: [Number of plan updates]  
**Review Cycles**: [Number of review rounds]  
**Files Touched**: 20+  
**Lines Added**: ~[Estimate]  
**Lines Removed**: ~[Estimate]

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [APPROVED/IN PROGRESS/BLOCKED]* 