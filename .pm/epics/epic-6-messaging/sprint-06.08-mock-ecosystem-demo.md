# Sprint 06.08: Mock Ecosystem & Demo Tools Tracker (MVP)

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: [Date]  
**End Date**: [Date]  
**Epic**: Epic 6 - Messaging System & Automation

**Sprint Goal**: Create a simplified mock ecosystem with personality-driven users and scheduled activity patterns for compelling platform demos.

**MVP Focus**: 
- Leverage existing infrastructure (30 mock users, job system)
- Template-based conversations and posts
- Scheduled activity bursts (not real-time simulation)
- 3 key demo scenarios only

**User Story Contribution**: 
- Creates immediate community feel for new users
- Enables compelling demo recordings with realistic activity
- Showcases core platform features through mock interactions

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

## Sprint Plan (MVP - 2-3 Days)

### MVP Objectives
1. Enhance existing mock users with conversation templates
2. Create hourly activity generation job
3. Build simple demo scenario preparation
4. Add template-based social interactions

### Files to Create (Simplified)
| File Path | Purpose | Status |
|-----------|---------|--------|
| `scripts/mock/templates.ts` | Message/post templates by personality | NOT STARTED |
| `scripts/mock/activity-generator.ts` | Hourly activity generation | NOT STARTED |
| `scripts/mock/demo-scenarios.ts` | 3 key demo preparations | NOT STARTED |
| `scripts/jobs/mock-activity.ts` | Scheduled activity job | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `scripts/jobs/runner.ts` | Add mock activity job | NOT STARTED |
| `scripts/generate-activity.ts` | Enhance with templates | NOT STARTED |
| `package.json` | Add demo commands | NOT STARTED |

### MVP Implementation Approach

**1. Template System (Simplified)**:
```typescript
// scripts/mock/templates.ts
export const messageTemplates = {
  'sharp-bettor': {
    greeting: ["Line value on {team} looking good", "Early money coming in on {game}"],
    reaction: ["Called it 📊", "Numbers don't lie", "Value was there"],
    discussion: ["Check the reverse line movement", "Sharp action on the under"],
  },
  'degen': {
    greeting: ["WHO'S READY TO EAT?? 🍽️", "FEELING LUCKY TODAY"],
    reaction: ["LFG!!! 🚀🚀🚀", "PAIN.", "Why do I do this to myself"],
    discussion: ["Tailing whoever's hot 🔥", "Last leg prayer circle 🙏"],
  },
  'fade-material': {
    greeting: ["Lock of the century coming up", "Can't lose parlay inside"],
    reaction: ["Rigged!!!", "Refs cost me again", "Taking a break (back tomorrow)"],
    discussion: ["All favorites parlay = free money", "{team} is a LOCK trust me"],
  },
}

export const postTemplates = {
  'pick-share': [
    "{team} {spread} {odds}\n\n{confidence} play 🎯",
    "Hammer time 🔨\n{team} {type} {line}",
  ],
  'outcome-positive': [
    "CASH IT ✅💰\n\n{result}",
    "Another one in the books 📚\n\n{record} on the week",
  ],
  'outcome-negative': [
    "Tough loss. On to the next 💪",
    "Can't win em all. {record} this week",
  ],
}
```

**2. Hourly Activity Generator (Simplified)**:
```typescript
// scripts/mock/activity-generator.ts
export async function generateHourlyActivity() {
  const hour = new Date().getHours();
  const mockUsers = await getMockUsersForHour(hour);
  
  for (const user of mockUsers) {
    const personality = getPersonalityType(user);
    
    // 30% chance of activity per hour
    if (Math.random() < 0.3) {
      const activityType = pickActivityType(personality, hour);
      
      switch (activityType) {
        case 'post':
          await createMockPost(user, personality);
          break;
        case 'message':
          await sendMockMessage(user, personality);
          break;
        case 'reaction':
          await addMockReaction(user, personality);
          break;
      }
    }
  }
}

// scripts/jobs/mock-activity.ts
export class MockActivityJob extends BaseJob {
  constructor() {
    super({
      name: 'mock-activity',
      description: 'Generate hourly mock user activity',
      schedule: '0 * * * *', // Every hour
    });
  }

  async run(options: JobOptions) {
    // Skip late night hours
    const hour = new Date().getHours();
    if (hour >= 2 && hour <= 6) {
      return { success: true, message: 'Skipping late night hours' };
    }
    
    await generateHourlyActivity();
    return { success: true, message: 'Generated mock activity' };
  }
}
```

**3. Demo Scenarios (Simplified)**:
```typescript
// scripts/mock/demo-scenarios.ts
export async function prepareDemo(scenario: 'new-user' | 'saturday-football' | 'active-chat') {
  switch (scenario) {
    case 'new-user':
      // Clear old activity, generate fresh content
      await clearRecentActivity();
      await generateRecentPosts(5); // 5 recent posts
      await generateActiveChat(); // 1 active group chat
      break;
      
    case 'saturday-football':
      // Pre-game betting rush
      await generateBettingRush('NFL', 10); // 10 users placing bets
      await generatePickPosts(5); // 5 pick shares
      await generateGroupDiscussion('game-day');
      break;
      
    case 'active-chat':
      // Recent chat activity
      const chat = await getOrCreateDemoChat('NBA Degens 🏀');
      await generateChatMessages(chat, 20); // 20 recent messages
      break;
  }
}

// Add to package.json scripts
"demo:new-user": "bun run scripts/mock/demo-scenarios.ts new-user",
"demo:saturday": "bun run scripts/mock/demo-scenarios.ts saturday-football",
"demo:chat": "bun run scripts/mock/demo-scenarios.ts active-chat",
```

**Key Technical Decisions (MVP)**:
- Template-based content (no complex AI generation)
- Scheduled activity via existing job system
- Reuse existing mock users and personalities
- Simple presence simulation (active hours only)
- 3 focused demo scenarios only

### Dependencies & Risks (MVP)
**Dependencies**:
- Existing 30 mock users
- Job runner system
- Current activity generation

**Identified Risks**:
- Template repetition becoming obvious
- Activity timing feeling artificial

**Mitigation**:
- 50+ template variations per personality
- Randomized timing within active hours
- Mix of activity types

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

## Key Code Additions (MVP)

### Simple Activity Patterns
```typescript
// Hourly activity chances by personality type
const activityPatterns = {
  'sharp-bettor': { morning: 0.4, afternoon: 0.3, evening: 0.2 },
  'degen': { morning: 0.1, afternoon: 0.3, evening: 0.6 },
  'fade-material': { morning: 0.2, afternoon: 0.4, evening: 0.4 },
};

// Reaction patterns
const reactionPatterns = {
  'sharp-bettor': { like: 0.3, fire: 0.1, money: 0.2 },
  'degen': { like: 0.2, fire: 0.5, rocket: 0.3 },
  'fade-material': { like: 0.4, laugh: 0.3, cry: 0.2 },
};
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| N/A | Local execution only | CLI args | Generated data | WORKING |

### State Management
- Mock user state in database
- Activity tracking for realism
- Conversation state for continuity
- No UI state needed

## Testing Performed (MVP)

### Manual Testing
- [ ] Hourly job generates appropriate activity
- [ ] Templates vary enough to feel natural
- [ ] Demo scenarios create expected state
- [ ] Activity respects personality active hours
- [ ] Reactions match personality types

### Edge Cases Considered
- No activity during late night (2-6am)
- Template fallbacks if none match
- Graceful handling of missing mock users

## Documentation Updates (MVP)

- [ ] Template contribution guide
- [ ] Demo scenario usage
- [ ] Job schedule documentation

## Handoff to Reviewer

### What Was Implemented
[Clear summary of all work completed]

### Files Modified/Created (MVP)
**Created**:
- `scripts/mock/templates.ts` - Message/post templates
- `scripts/mock/activity-generator.ts` - Hourly activity
- `scripts/mock/demo-scenarios.ts` - Demo preparations
- `scripts/jobs/mock-activity.ts` - Activity job

**Modified**:
- `scripts/jobs/runner.ts` - Add mock activity job
- `scripts/generate-activity.ts` - Use templates
- `package.json` - Demo commands

### Key Decisions Made (MVP)
1. **Template-based**: Fast, predictable content generation
2. **Hourly jobs**: Leverage existing infrastructure
3. **Limited scenarios**: Focus on highest-impact demos
4. **No real-time**: Scheduled bursts sufficient for demos

### Deviations from Original Plan
- Removed complex simulation features
- Cut live betting and WebSocket activity
- Simplified to 3 demo scenarios
- Using job system instead of custom CLI

### Known Issues/Concerns
- Templates may become repetitive over time
- No true real-time feel during demos
- Limited to pre-defined scenarios

### Suggested Review Focus
- Template variety and naturalness
- Demo scenario effectiveness
- Job scheduling appropriateness

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
- [ ] Mock activity feels realistic
- [ ] Personalities are diverse
- [ ] Demo scenarios work well

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

**Duration**: Planned 2-3 days | Actual [Y] days  
**Scope Changes**: Major simplification from original  
**Review Cycles**: [Number of review rounds]  
**Files Touched**: 7  
**Lines Added**: ~500  
**Lines Removed**: ~0

## Learnings for Future Sprints

1. MVP-first approach reduces complexity significantly
2. Leveraging existing infrastructure (jobs, mock users) saves time
3. Templates can create sufficiently realistic content for demos

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [APPROVED/IN PROGRESS/BLOCKED]* 