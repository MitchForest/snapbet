# Sprint 8.09: Mock Data & Demo Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: [TBD]  
**End Date**: [TBD]  
**Epic**: 8 - RAG Implementation

**Sprint Goal**: Create comprehensive mock data scenarios that demonstrate all RAG features including archived content with embeddings, consensus betting patterns, and similar user profiles for a complete demo experience.

**User Story Contribution**: 
- Enables testing and demonstration of all RAG features with realistic data

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
1. Create comprehensive RAG demo data generator
2. Generate archived content with timestamps simulating age
3. Create embeddings for all archived content
4. Set up consensus betting scenarios
5. Create similar user profiles for discovery
6. Ensure 70/30 feed has sufficient content
7. Update orchestrator to run all RAG demo steps

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `scripts/mock/generators/rag-complete-demo.ts` | Comprehensive RAG demo data generator | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `scripts/mock/orchestrators/setup.ts` | Add complete RAG demo setup after initial data | NOT STARTED |
| `scripts/mock/generators/rag-demo.ts` | Enhance with more comprehensive scenarios | NOT STARTED |
| `scripts/mock/generators/embeddings.ts` | Ensure all archived content gets embeddings | NOT STARTED |

### Implementation Approach

**Step 1: Create comprehensive RAG demo generator**
```typescript
// scripts/mock/generators/rag-complete-demo.ts
import { supabase } from '../../supabase-client';
import { ragService } from '@/services/rag/ragService';
import { embeddingPipeline } from '@/services/rag/embeddingPipeline';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type Game = Tables['games']['Row'];

export async function setupCompleteRAGDemo(mockUsers: User[], games: Game[]) {
  console.log('\n🤖 Setting up complete RAG demo...');
  
  // 1. Archive old content first
  await archiveExistingContent();
  
  // 2. Create archived posts with varied captions for AI training
  await createArchivedPostsWithPatterns(mockUsers);
  
  // 3. Create consensus betting scenarios
  await createConsensusBettingScenarios(mockUsers, games);
  
  // 4. Create similar users with matching patterns
  await setupSimilarUserProfiles(mockUsers);
  
  // 5. Generate embeddings for all archived content
  await generateAllEmbeddings();
  
  // 6. Create fresh content for mixed feed
  await createFreshContentForFeed(mockUsers);
  
  console.log('✅ Complete RAG demo setup finished!');
}

async function archiveExistingContent() {
  console.log('  🗄️ Archiving existing content...');
  
  // Archive posts older than 24 hours
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  await supabase
    .from('posts')
    .update({ archived: true })
    .eq('archived', false)
    .lt('created_at', oneDayAgo.toISOString());
    
  // Archive bets older than 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  await supabase
    .from('bets')
    .update({ archived: true })
    .eq('archived', false)
    .lt('created_at', oneWeekAgo.toISOString());
}

async function createArchivedPostsWithPatterns(mockUsers: User[]) {
  console.log('  📝 Creating archived posts with caption patterns...');
  
  // Caption patterns that will train the AI
  const captionPatterns = {
    excitement: [
      "Let's go! 🔥",
      "Easy money tonight 💰",
      "Lock of the day 🔒",
      "Feeling good about this one 🎯",
      "Trust the process 📈"
    ],
    teamSupport: [
      "Lakers all day! 💜💛",
      "Go Niners! ❤️💛",
      "Yankees never disappoint ⚾",
      "Chelsea till I die 💙",
      "Heat nation 🔥🏀"
    ],
    confidence: [
      "Hammer this one 🔨",
      "Max bet territory 💯",
      "Can't lose 🏆",
      "Free money alert 🚨",
      "Bankroll builder 💪"
    ]
  };
  
  // Create 10-15 posts per pattern
  for (const [category, captions] of Object.entries(captionPatterns)) {
    for (const caption of captions) {
      for (let i = 0; i < 3; i++) {
        const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const daysAgo = Math.floor(Math.random() * 30) + 2; // 2-32 days ago
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);
        
        await supabase.from('posts').insert({
          user_id: user.id,
          caption,
          media_type: 'photo',
          media_url: `https://snapbet-mock.s3.us-east-1.amazonaws.com/${category}/${i}.jpg`,
          post_type: 'content',
          created_at: createdAt.toISOString(),
          archived: true,
          expires_at: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }
  }
}

async function createConsensusBettingScenarios(mockUsers: User[], games: Game[]) {
  console.log('  🎲 Creating consensus betting scenarios...');
  
  // Scenario 1: 5 users bet on same team spread within 1 hour
  const consensusGame1 = games.find(g => g.sport === 'nba') || games[0];
  const consensusUsers1 = mockUsers.slice(0, 5);
  const baseTime = new Date();
  baseTime.setHours(baseTime.getHours() - 2);
  
  for (let i = 0; i < consensusUsers1.length; i++) {
    const betTime = new Date(baseTime);
    betTime.setMinutes(betTime.getMinutes() + (i * 10)); // Stagger by 10 mins
    
    await supabase.from('bets').insert({
      user_id: consensusUsers1[i].id,
      game_id: consensusGame1.id,
      bet_type: 'spread',
      bet_details: { 
        team: consensusGame1.home_team, 
        line: -7.5 
      },
      stake: 100 + (i * 50), // Varying stakes
      odds: -110,
      potential_win: (100 + (i * 50)) * 0.909,
      created_at: betTime.toISOString()
    });
  }
  
  // Scenario 2: 4 users bet same total within 30 minutes
  const consensusGame2 = games.find(g => g.sport === 'nfl') || games[1];
  const consensusUsers2 = mockUsers.slice(5, 9);
  const baseTime2 = new Date();
  baseTime2.setMinutes(baseTime2.getMinutes() - 45);
  
  for (let i = 0; i < consensusUsers2.length; i++) {
    const betTime = new Date(baseTime2);
    betTime.setMinutes(betTime.getMinutes() + (i * 7));
    
    await supabase.from('bets').insert({
      user_id: consensusUsers2[i].id,
      game_id: consensusGame2.id,
      bet_type: 'total',
      bet_details: { 
        total_type: 'over',
        line: 48.5
      },
      stake: 200,
      odds: -105,
      potential_win: 190.48,
      created_at: betTime.toISOString()
    });
  }
}

async function setupSimilarUserProfiles(mockUsers: User[]) {
  console.log('  👥 Setting up similar user profiles...');
  
  // Group users by betting patterns
  const groups = {
    nbaFans: mockUsers.slice(0, 5),
    nflFans: mockUsers.slice(5, 10),
    underDogLovers: mockUsers.slice(10, 15),
    favoritesBettors: mockUsers.slice(15, 20)
  };
  
  // Update user profiles with similar characteristics
  for (const [pattern, users] of Object.entries(groups)) {
    for (const user of users) {
      let favoriteTeams: string[] = [];
      let bio = '';
      
      switch(pattern) {
        case 'nbaFans':
          favoriteTeams = ['Lakers', 'Warriors', 'Celtics'];
          bio = 'NBA enthusiast 🏀 Live betting is life';
          break;
        case 'nflFans':
          favoriteTeams = ['Chiefs', 'Bills', 'Cowboys'];
          bio = 'Sunday football all day 🏈';
          break;
        case 'underDogLovers':
          favoriteTeams = ['Various'];
          bio = 'Always fade the public 📊 +EV hunter';
          break;
        case 'favoritesBettors':
          favoriteTeams = ['Various'];
          bio = 'Parlays and favorites 🎯 Let it ride!';
          break;
      }
      
      await supabase
        .from('users')
        .update({ 
          favorite_teams: favoriteTeams,
          bio: bio
        })
        .eq('id', user.id);
    }
  }
}

async function generateAllEmbeddings() {
  console.log('  🧠 Generating embeddings for all content...');
  
  // Generate embeddings for archived posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('archived', true)
    .is('embedding', null);
    
  if (posts) {
    for (const post of posts) {
      try {
        await embeddingPipeline.embedPost(post);
      } catch (error) {
        console.error(`Failed to embed post ${post.id}:`, error);
      }
    }
  }
  
  // Generate embeddings for archived bets
  const { data: bets } = await supabase
    .from('bets')
    .select(`
      *,
      game:games(*)
    `)
    .eq('archived', true)
    .is('embedding', null);
    
  if (bets) {
    for (const bet of bets) {
      try {
        await embeddingPipeline.embedBet(bet);
      } catch (error) {
        console.error(`Failed to embed bet ${bet.id}:`, error);
      }
    }
  }
  
  // Update all user profile embeddings
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .not('username', 'is', null);
    
  if (users) {
    for (const user of users) {
      try {
        await embeddingPipeline.updateUserProfile(user.id);
      } catch (error) {
        console.error(`Failed to update user profile ${user.id}:`, error);
      }
    }
  }
}

async function createFreshContentForFeed(mockUsers: User[]) {
  console.log('  📱 Creating fresh content for mixed feed...');
  
  // Create 20-30 new posts that won't be archived
  const now = new Date();
  
  for (let i = 0; i < 25; i++) {
    const user = mockUsers[i % mockUsers.length];
    const minutesAgo = Math.floor(Math.random() * 180); // 0-3 hours ago
    const createdAt = new Date(now.getTime() - minutesAgo * 60 * 1000);
    
    await supabase.from('posts').insert({
      user_id: user.id,
      caption: `Fresh content ${i} - check out this bet! 🎯`,
      media_type: 'photo',
      media_url: `https://snapbet-mock.s3.us-east-1.amazonaws.com/fresh/${i}.jpg`,
      post_type: 'content',
      created_at: createdAt.toISOString(),
      archived: false,
      expires_at: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString()
    });
  }
}
```

**Step 2: Update orchestrator**
```typescript
// Add to scripts/mock/orchestrators/setup.ts at the end
import { setupCompleteRAGDemo } from '../generators/rag-complete-demo';

// After step 13 (badge users searchable)
// 14. Set up complete RAG demo
await setupCompleteRAGDemo(mockUsers, games);

console.log('\n🎉 Mock data setup complete with full RAG demo!');
console.log('📋 RAG features ready to test:');
console.log('  - AI Caption Generation (trained on archived posts)');
console.log('  - Find Your Tribe (similar users by betting patterns)');
console.log('  - Enhanced Feed (70/30 mix of following/discovery)');
console.log('  - Consensus Alerts (multiple users same bet)');
```

### Dependencies & Risks
**Dependencies**:
- All previous RAG sprints must be complete
- OpenAI API key must be configured
- Embedding pipeline must be functional

**Identified Risks**:
- OpenAI API costs during demo generation
- Time to generate embeddings for all content
- Rate limiting during bulk embedding generation

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

## Testing Performed

### Manual Testing
- [ ] Archived content created with proper timestamps
- [ ] Embeddings generated for all archived content
- [ ] Consensus scenarios trigger notifications
- [ ] Similar users appear in discovery
- [ ] 70/30 feed mix shows discovery posts
- [ ] AI captions reflect learned patterns
- [ ] Performance acceptable during generation

### Edge Cases Considered
- OpenAI API failures during bulk generation
- Rate limiting handling
- Large dataset performance
- Missing embeddings gracefully handled

## Documentation Updates

- [ ] README updated with RAG demo instructions
- [ ] Mock data setup documented
- [ ] OpenAI API key requirement noted

## Handoff to Reviewer

### What Was Implemented
Complete RAG demonstration data including:
- Archived posts with varied caption patterns
- Consensus betting scenarios (multiple users same bet)
- Similar user profiles by betting patterns
- Embeddings for all archived content
- Fresh content for 70/30 feed mixing
- Comprehensive setup script

### Files Modified/Created
**Created**:
- `scripts/mock/generators/rag-complete-demo.ts` - Complete demo generator

**Modified**:
- `scripts/mock/orchestrators/setup.ts` - Added RAG demo step
- `scripts/mock/generators/rag-demo.ts` - Enhanced scenarios
- `scripts/mock/generators/embeddings.ts` - Bulk generation support

### Key Decisions Made
1. **Staggered timestamps**: Realistic betting patterns over time
2. **Caption patterns**: Grouped by category for better AI training
3. **User grouping**: Similar profiles for discovery testing
4. **Fresh content**: Ensures 70/30 mix has sufficient data

### Deviations from Original Plan
- None anticipated

### Known Issues/Concerns
- Embedding generation time (may take 2-3 minutes)
- OpenAI costs for demo data
- Need to monitor rate limits

### Suggested Review Focus
- Data variety and realism
- Timestamp distribution
- Embedding generation error handling
- Performance during setup

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

**Duration**: Planned 3 hours | Actual [Y] hours  
**Scope Changes**: [Number of plan updates]  
**Review Cycles**: [Number of review rounds]  
**Files Touched**: 4  
**Lines Added**: ~500  
**Lines Removed**: ~0

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [APPROVED/IN PROGRESS/BLOCKED]* 