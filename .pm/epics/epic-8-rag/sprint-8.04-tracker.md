# Sprint 8.04: RAG Service Layer Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: [TBD]  
**End Date**: [TBD]  
**Epic**: 8 - RAG Implementation

**Sprint Goal**: Implement the core RAG service layer including OpenAI integration, embedding generation pipeline, and foundational services for AI-powered features.

**User Story Contribution**: 
- Provides the AI infrastructure needed for caption generation, user discovery, feed enhancement, and consensus detection

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
1. Set up OpenAI client with proper configuration
2. Implement embedding generation with error handling
3. Create embedding pipeline for posts, bets, and user profiles
4. Implement async processing to avoid blocking UI
5. Add cost tracking and rate limiting
6. Create mock embedding generator for demo archived content
7. Generate embeddings for all mock data to enable RAG demo

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `services/rag/ragService.ts` | Core OpenAI integration and caption generation | NOT STARTED |
| `services/rag/embeddingPipeline.ts` | Embedding generation pipeline for all content types | NOT STARTED |
| `services/rag/types.ts` | TypeScript types for RAG features | NOT STARTED |
| `components/common/AIBadge.tsx` | Unified AI indicator component with sparkle icon | NOT STARTED |
| `scripts/mock/generators/embeddings.ts` | Generate embeddings for mock archived content | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `package.json` | Add openai dependency (^4.0.0) | NOT STARTED |
| `services/content/postService.ts` | Hook embedding generation into createPost | NOT STARTED |
| `services/betting/bettingService.ts` | Hook embedding generation into placeBet | NOT STARTED |
| `scripts/supabase-client.ts` | Ensure service key client available for background jobs | NOT STARTED |
| `scripts/mock/orchestrators/setup.ts` | Add embedding generation step after RAG demo creation | NOT STARTED |

### Implementation Approach

**Step 1: Install OpenAI SDK**
```bash
bun add openai
```

**Step 2: Create RAG types**
```typescript
// services/rag/types.ts
export interface EmbeddingMetadata {
  entity_type: 'post' | 'bet' | 'user';
  entity_id: string;
  model_version: string;
  generated_at: string;
  token_count?: number;
}

export interface CaptionContext {
  bet?: any;
  postType: 'pick' | 'story' | 'post';
  previousCaptions?: string[];
}

export interface SimilarUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  similarity: number;
  win_rate: number;
  total_bets: number;
  favorite_teams: string[];
  common_sports: string[];
}
```

**Step 3: Implement RAG service**
```typescript
// services/rag/ragService.ts
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export class RAGService {
  private static instance: RAGService;
  
  static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Implementation with error handling, retries, and tracking
  }

  async generateCaption(userId: string, context: CaptionContext): Promise<string> {
    // Implementation with user style learning
  }

  async batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
    // Batch processing for efficiency
  }
}
```

**Step 4: Implement embedding pipeline**
```typescript
// services/rag/embeddingPipeline.ts
export class EmbeddingPipeline {
  async embedPost(postId: string, post: any) {
    // Generate embedding from post content
    // Store in database
    // Track metadata
  }

  async embedBet(betId: string, bet: any) {
    // Get game details
    // Generate embedding from bet details
    // Store in database
  }

  async updateUserProfile(userId: string) {
    // Analyze user's betting history
    // Generate profile embedding
    // Update user record
  }
}
```

**Step 5: Hook into content creation**
```typescript
// services/content/postService.ts
import { embeddingPipeline } from '../rag/embeddingPipeline';

async createPost(params: CreatePostParams): Promise<PostWithType> {
  // ... existing code ...
  
  // Generate embedding asynchronously
  embeddingPipeline.embedPost(post.id, post).catch(error => {
    console.error('Failed to generate post embedding:', error);
  });
  
  return post;
}
```

**Key Technical Decisions**:
- Use text-embedding-3-small model for cost efficiency
- Async embedding generation to not block UI
- Singleton pattern for service instances
- Admin client for background operations
- Error boundaries to prevent feature failures from affecting core functionality

### Dependencies & Risks
**Dependencies**:
- openai package
- EXPO_PUBLIC_OPENAI_API_KEY environment variable
- SUPABASE_SERVICE_KEY for admin operations
- Database tables from Sprint 8.01

**Identified Risks**:
- OpenAI API failures → Graceful degradation
- API key exposure → Use environment variables
- Cost overruns → Implement rate limiting
- Large text inputs → Truncate to 8000 chars

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

### Service Methods
```typescript
// RAGService methods
generateEmbedding(text: string): Promise<number[]>
generateCaption(userId: string, context: CaptionContext): Promise<string>
batchGenerateEmbeddings(texts: string[]): Promise<number[][]>

// EmbeddingPipeline methods
embedPost(postId: string, post: any): Promise<void>
embedBet(betId: string, bet: any): Promise<void>
updateUserProfile(userId: string): Promise<void>
batchUpdateUserProfiles(userIds: string[]): Promise<void>
```

### Error Handling Pattern
```typescript
try {
  const embedding = await ragService.generateEmbedding(text);
  // Store embedding
} catch (error) {
  console.error('Embedding generation failed:', error);
  // Continue without embedding - don't break core functionality
}
```

### Rate Limiting
```typescript
// Simple rate limiter for caption generation
const captionRateLimit = new Map<string, number[]>();
const RATE_LIMIT = 20; // per day
const WINDOW = 24 * 60 * 60 * 1000; // 24 hours
```

**Step 8: Create mock embedding generator**
```typescript
// scripts/mock/generators/embeddings.ts
import { supabase } from '../../supabase-client';
import { ragService } from '@/services/rag/ragService';
import { embeddingPipeline } from '@/services/rag/embeddingPipeline';

export async function generateMockEmbeddings() {
  console.log('🤖 Generating embeddings for archived content...');
  
  // Get archived posts without embeddings
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('archived', true)
    .is('embedding', null)
    .limit(50);
    
  if (posts && posts.length > 0) {
    console.log(`  📝 Processing ${posts.length} archived posts...`);
    
    for (const post of posts) {
      await embeddingPipeline.embedPost(post);
    }
  }
  
  // Get archived bets without embeddings
  const { data: bets } = await supabase
    .from('bets')
    .select(`
      *,
      game:games(*)
    `)
    .eq('archived', true)
    .is('embedding', null)
    .limit(50);
    
  if (bets && bets.length > 0) {
    console.log(`  🎲 Processing ${bets.length} archived bets...`);
    
    for (const bet of bets) {
      await embeddingPipeline.embedBet(bet);
    }
  }
  
  // Update user profile embeddings
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .not('username', 'is', null)
    .or('profile_embedding.is.null,last_embedding_update.lt.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .limit(20);
    
  if (users && users.length > 0) {
    console.log(`  👤 Processing ${users.length} user profiles...`);
    
    for (const user of users) {
      await embeddingPipeline.updateUserProfile(user.id);
    }
  }
  
  console.log('  ✅ Embedding generation complete');
}

// Add to mock setup orchestrator after RAG demo scenarios
await generateMockEmbeddings();
```

**Step 9: Create unified AI badge component**
```typescript
// components/common/AIBadge.tsx
import React from 'react';
import { View, Text, XStack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme';

interface AIBadgeProps {
  variant?: 'small' | 'medium' | 'large';
  text?: string;
  showTooltip?: boolean;
}

export function AIBadge({ 
  variant = 'small', 
  text = 'AI',
  showTooltip = false 
}: AIBadgeProps) {
  const sizes = {
    small: { icon: 12, text: 10, padding: '$1' },
    medium: { icon: 16, text: 12, padding: '$2' },
    large: { icon: 20, text: 14, padding: '$3' }
  };
  
  const size = sizes[variant];
  
  return (
    <XStack
      backgroundColor="$purple9"
      borderRadius="$2"
      paddingHorizontal={size.padding}
      paddingVertical={size.padding}
      alignItems="center"
      gap="$1"
    >
      <Ionicons 
        name="sparkles" 
        size={size.icon} 
        color={Colors.white} 
      />
      {text && (
        <Text 
          fontSize={size.text} 
          color="$white"
          fontWeight="600"
        >
          {text}
        </Text>
      )}
    </XStack>
  );
}
```

## Testing Performed

### Manual Testing
- [ ] OpenAI client initializes correctly
- [ ] Embedding generation works for various text lengths
- [ ] Caption generation produces appropriate results
- [ ] Async processing doesn't block UI
- [ ] Error handling prevents crashes
- [ ] Rate limiting enforces limits
- [ ] Service key client works for admin operations
- [ ] Embeddings stored correctly in database

### Edge Cases Considered
- Empty text input
- Very long text (>8000 chars)
- OpenAI API timeout
- Invalid API key
- Rate limit exceeded
- Network failures
- Concurrent requests

## Documentation Updates

- [ ] Service methods documented with JSDoc
- [ ] Error handling patterns documented
- [ ] Rate limiting explained
- [ ] Environment variables documented

## Handoff to Reviewer

### What Was Implemented
Complete RAG service layer providing:
- OpenAI integration for embeddings and completions
- Embedding pipeline for posts, bets, and user profiles
- Async processing to maintain UI responsiveness
- Error handling and rate limiting
- Cost tracking infrastructure

### Files Modified/Created
**Created**:
- `services/rag/ragService.ts` - Core AI service
- `services/rag/embeddingPipeline.ts` - Content embedding pipeline
- `services/rag/types.ts` - TypeScript types

**Modified**:
- `package.json` - Added openai dependency
- `services/content/postService.ts` - Hooked embedding generation
- `services/betting/bettingService.ts` - Hooked embedding generation
- `scripts/supabase-client.ts` - Ensured admin client available

### Key Decisions Made
1. **Async by default**: All embedding generation is non-blocking
2. **Error boundaries**: AI failures don't break core features
3. **text-embedding-3-small**: Balance of cost and quality
4. **Singleton services**: Consistent state management

### Deviations from Original Plan
- None anticipated

### Known Issues/Concerns
- Need to monitor OpenAI costs closely
- Rate limiting is basic, may need enhancement
- Batch processing could be optimized further

### Suggested Review Focus
- Error handling completeness
- Async patterns correctness
- Type safety of services
- Integration points with existing services

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
**Files Touched**: 7  
**Lines Added**: ~600  
**Lines Removed**: ~0

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [APPROVED/IN PROGRESS/BLOCKED]* 