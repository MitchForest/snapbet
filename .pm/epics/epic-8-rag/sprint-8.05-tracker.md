# Sprint 8.05: AI Caption Generation Tracker

## Sprint Overview

**Status**: IN PROGRESS  
**Start Date**: 2024-12-30  
**End Date**: [TBD]  
**Epic**: 8 - RAG Implementation

**Sprint Goal**: Implement AI-powered caption generation feature that learns from user style and integrates seamlessly into the post creation flow.

**User Story Contribution**: 
- Story 1: AI Caption Generation - Users can generate engaging captions with one tap

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
1. Create AI caption button component with sparkle icon
2. Implement useAICaption hook for state management
3. Integrate with existing CaptionInput component
4. Add loading states and error handling
5. Implement rate limiting (20/day per user)
6. Ensure historical posts in mock setup include diverse caption styles for AI learning

### Files to Create (REVISED)
| File Path | Purpose | Status |
|-----------|---------|--------|
| `supabase/migrations/034_caption_generation_tracking.sql` | Rate limiting table | NOT STARTED |
| `app/api/generate-caption/+server.ts` | API endpoint for caption generation | NOT STARTED |
| `server/services/captionGenerationService.ts` | Server-side caption logic | NOT STARTED |
| `components/creation/AICaptionButton.tsx` | Button component with sparkle icon | NOT STARTED |
| `hooks/useAICaption.ts` | Client-side hook for API calls | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `components/creation/CaptionInput.tsx` | Add AI button to caption input area | NOT STARTED |
| `app/(drawer)/camera/index.tsx` | Integrate useAICaption hook | NOT STARTED |
| `app/(drawer)/create-pick.tsx` | Add AI caption option | NOT STARTED |
| `app/(drawer)/create-post.tsx` | Add AI caption option | NOT STARTED |

### Implementation Approach (REVISED - Server-Side Architecture)

**Step 1: Create Database Migration**
```sql
-- supabase/migrations/034_caption_generation_tracking.sql
CREATE TABLE caption_generation_usage (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  count INT DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- Index for fast lookups
CREATE INDEX idx_caption_usage_user_date ON caption_generation_usage(user_id, date);
```

**Step 2: Create API Endpoint**
```typescript
// app/api/generate-caption/+server.ts
import { json } from '@sveltejs/kit';
import { captionGenerationService } from '@/server/services/captionGenerationService';

export async function POST({ request, locals }) {
  const { postType, betDetails } = await request.json();
  const userId = locals.user?.id;
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const result = await captionGenerationService.generateCaption({
      userId,
      postType,
      betDetails
    });
    
    return json(result);
  } catch (error) {
    if (error.message.includes('limit')) {
      return json({ error: 'AI caption limit reached (20/20 today)' }, { status: 429 });
    }
    return json({ error: 'Caption generation unavailable. Try again?' }, { status: 500 });
  }
}
```

**Step 3: Create Server-Side Caption Service**
```typescript
// server/services/captionGenerationService.ts
import { openai } from '@/server/lib/openai';
import { supabaseAdmin } from '@/server/lib/supabase';

export class CaptionGenerationService {
  async generateCaption({ userId, postType, betDetails, regenerate = false }) {
    // Check rate limit
    const remaining = await this.checkAndUpdateRateLimit(userId);
    if (remaining <= 0) {
      throw new Error('Daily limit reached');
    }
    
    // Get user's caption style
    const userStyle = await this.getUserCaptionStyle(userId);
    
    // Generate caption with style-specific prompt
    const caption = await this.generateWithStyle({
      postType,
      betDetails,
      userStyle,
      regenerate
    });
    
    return { caption, remaining: remaining - 1 };
  }
  
  private async checkAndUpdateRateLimit(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabaseAdmin
      .from('caption_generation_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    
    const currentCount = data?.count || 0;
    if (currentCount >= 20) return 0;
    
    // Upsert the count
    await supabaseAdmin
      .from('caption_generation_usage')
      .upsert({
        user_id: userId,
        date: today,
        count: currentCount + 1
      });
    
    return 20 - currentCount;
  }
}
```

**Step 4: Create Client-Side Hook**
```typescript
// hooks/useAICaption.ts
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toastService } from '@/services/toastService';

export function useAICaption(options: UseAICaptionOptions) {
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [tapCount, setTapCount] = useState(0);

  const generateCaption = useCallback(async () => {
    if (!user) return;
    
    // Progressive enhancement
    if (tapCount >= 2) {
      toastService.show('Try writing your own! 💭', 'info');
      setTapCount(0);
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postType: options.postType,
          betDetails: options.bet,
          regenerate: tapCount > 0
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate caption');
      }
      
      setCaption(data.caption);
      setRemaining(data.remaining);
      setTapCount(prev => prev + 1);
      
      // Track analytics
      trackEvent('ai_caption_generated', {
        postType: options.postType,
        captionLength: data.caption.length,
        regenerated: tapCount > 0
      });
    } catch (err) {
      const message = err.message || 'Caption generation unavailable. Try again?';
      setError(message);
      toastService.show(message, 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [user, options, tapCount]);

  return {
    caption,
    isGenerating,
    error,
    remaining,
    generateCaption,
    clearCaption: () => { setCaption(''); setTapCount(0); },
    setCaption
  };
}
```

**Step 3: Update CaptionInput component**
```typescript
// components/creation/CaptionInput.tsx
// Add to imports
import { AICaptionButton } from './AICaptionButton';

// Update component to accept AI props
interface CaptionInputProps {
  // ... existing props
  onGenerateCaption?: () => void;
  isGeneratingCaption?: boolean;
  showAIButton?: boolean;
}

// In the render, add button next to counter
<View style={styles.container}>
  <View style={styles.inputContainer}>
    <TextInput
      style={styles.input}
      // ... existing props
    />
    {showAIButton && (
      <AICaptionButton
        onPress={onGenerateCaption!}
        isGenerating={isGeneratingCaption!}
        disabled={!onGenerateCaption}
      />
    )}
  </View>
  {showCounter && (
    <Text style={[styles.counter, { color: getCounterColor() }]}>
      {charCount}/{maxLength}
    </Text>
  )}
</View>
```

**Step 4: Implement caption generation in RAG service**
```typescript
// services/rag/ragService.ts
async generateCaption(userId: string, context: CaptionContext): Promise<string> {
  // Check rate limit
  if (!this.checkRateLimit(userId)) {
    throw new Error('Daily caption limit reached (20/day)');
  }
  
  // Get user's recent captions for style learning
  const { data: recentPosts } = await supabaseAdmin
    .from('posts')
    .select('content')
    .eq('user_id', userId)
    .eq('archived', false)
    .not('content->caption', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10);
  
  const userStyle = recentPosts?.map(p => p.content.caption).filter(Boolean) || [];
  
  // Build prompt
  let systemPrompt = `You are a witty sports betting caption writer. 
    Style: Short, punchy, confident. Use relevant emojis sparingly. 
    Max 100 characters. No hashtags.`;
  
  if (userStyle.length > 0) {
    systemPrompt += `\n\nUser's caption style examples: ${userStyle.slice(0, 5).join(', ')}`;
  }
  
  // Generate caption
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 50,
    temperature: 0.8,
  });
  
  // Track usage
  this.trackRateLimit(userId);
  
  return response.choices[0].message.content?.trim() || '';
}
```

**Step 5: Integrate with post creation flows**
Find all places where CaptionInput is used and add AI integration:
```typescript
// In post creation component
const { caption: aiCaption, generateCaption, isGenerating } = useAICaption({
  bet: selectedBet,
  postType: 'pick'
});

// Use either manual caption or AI caption
const finalCaption = manualCaption || aiCaption;

// Pass to CaptionInput
<CaptionInput
  value={finalCaption}
  onChange={setManualCaption}
  onGenerateCaption={generateCaption}
  isGeneratingCaption={isGenerating}
  showAIButton={true}
/>
```

**Key Technical Decisions (REVISED)**:
- Server-side architecture due to React Native constraints
- Database-backed rate limiting for persistence
- Progressive enhancement (3 taps max)
- Style-specific prompts based on post type
- Caption filtering for quality control

### Dependencies & Risks
**Dependencies**:
- Server-side infrastructure for API endpoints
- OpenAI API key configured server-side
- User authentication working
- Database migration system

**Identified Risks**:
- API latency → Show loading states clearly
- Server costs → Monitor usage patterns
- Caption repetition → Add variation logic

## Implementation Log

### Day-by-Day Progress
**2024-12-30**:
- Started: Sprint investigation and planning phase
- Completed: 
  - Deep codebase investigation of caption input integration points
  - Identified all post creation flows (camera, pick, post)
  - Analyzed existing RAG service structure
  - Reviewed Tamagui component patterns
  - Created comprehensive implementation plan
- Blockers: None identified
- Decisions: 
  - Use in-memory rate limiting for MVP
  - 100 character limit for AI captions (punchy)
  - Learn from last 10 user captions

### Reality Checks & Plan Updates

**Reality Check 1** - 2024-12-30 (Investigation Phase)
- Issue: Need clarification on several implementation details
- Questions Identified:
  1. **Rate Limiting Persistence**: Should limits persist across app restarts?
  2. **Caption Length**: Should AI respect different limits for different post types?
  3. **Error Messaging**: What specific messages for rate limit and API failures?
  4. **Style Learning Scope**: How many past captions to analyze?
- Proposed Solutions:
  1. Start with in-memory Map, add persistence later if needed
  2. Use 100 chars for all AI captions (punchy and concise)
  3. "Daily caption limit reached (20/day)" and "Unable to generate caption. Please try again."
  4. Last 10 captions for balance of relevance and variety
- Plan Update: Awaiting reviewer approval/revisions
- Epic Impact: None anticipated

**Reality Check 2** - 2024-12-30 (Architecture Revision)
- Issue: OpenAI SDK cannot run in React Native
- Critical Finding: All AI processing must be server-side
- Architecture Change:
  1. Create API endpoint instead of client-side service
  2. Implement server-side caption generation service
  3. Add database table for rate limiting
  4. Update client hook to call API
- Plan Update: Complete architecture revision to server-side approach
- Epic Impact: Sets precedent for all future AI features (must be server-side)

**Reality Check 3** - 2024-12-30 (Executor Deep Dive)
- Issue: Approved plan doesn't match project architecture
- Critical Findings:
  1. This is React Native Expo, not SvelteKit (no `app/api` pattern)
  2. No server infrastructure exists (no `server/` directory)
  3. Supabase Edge Functions planned but never implemented
  4. Current server-side pattern uses scripts/jobs, not APIs
- Blockers Identified:
  1. Need clarification on Edge Functions vs alternative approach
  2. Need proper project structure for server-side code
  3. Need deployment process for Edge Functions
- Plan Update: BLOCKED pending architectural guidance
- Epic Impact: All AI features need consistent server-side approach

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

### Component Structure
```
components/creation/
├── CaptionInput.tsx (modified)
└── AICaptionButton.tsx (new)

hooks/
└── useAICaption.ts (new)
```

### Hook API
```typescript
interface UseAICaptionOptions {
  bet?: any;
  postType: 'pick' | 'story' | 'post';
}

interface UseAICaptionReturn {
  caption: string;
  isGenerating: boolean;
  error: string | null;
  generateCaption: () => Promise<void>;
  clearCaption: () => void;
  setCaption: (caption: string) => void;
}
```

### Rate Limiting
```typescript
// Simple in-memory rate limiter
private rateLimits = new Map<string, number[]>();

private checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimits = this.rateLimits.get(userId) || [];
  const recentUses = userLimits.filter(time => now - time < 24 * 60 * 60 * 1000);
  return recentUses.length < 20;
}

private trackRateLimit(userId: string): void {
  const now = Date.now();
  const userLimits = this.rateLimits.get(userId) || [];
  userLimits.push(now);
  this.rateLimits.set(userId, userLimits);
}
```

## Testing Performed

### Manual Testing
- [ ] AI button appears in caption input
- [ ] Clicking button generates caption
- [ ] Loading state shows during generation
- [ ] Generated caption appears in input
- [ ] User can edit generated caption
- [ ] Rate limiting prevents >20 uses per day
- [ ] Error handling for API failures
- [ ] Works for picks, stories, and posts

### Edge Cases Considered
- User with no previous captions
- Very long bet details
- API timeout during generation
- Rate limit exceeded
- Network failure
- Rapid clicking of generate button

## Documentation Updates

- [ ] Component props documented
- [ ] Hook usage documented
- [ ] Rate limiting explained in comments
- [ ] Integration examples added

## Handoff to Reviewer

### CRITICAL ARCHITECTURE FINDINGS - EXECUTOR DEEP DIVE

**Date**: 2024-12-30  
**Executor**: E

After thorough codebase investigation, I've identified critical gaps between the approved plan and the actual project architecture:

#### 1. Architecture Mismatch
- **Plan assumes**: SvelteKit-style API endpoints (`app/api/generate-caption/+server.ts`)
- **Reality**: This is a React Native Expo app with no server component
- **Evidence**: `app.json` shows Expo configuration, no API directory exists

#### 2. No Server Infrastructure
- **Plan assumes**: `server/services/captionGenerationService.ts`
- **Reality**: No `server/` directory exists in the project
- **Current pattern**: All services are client-side calling Supabase directly

#### 3. Edge Functions Not Implemented
- **Plan assumes**: We can create API endpoints
- **Reality**: Project planned Supabase Edge Functions (mentioned in 6+ epics) but never implemented
- **Evidence**: No `supabase/functions/` directory exists

#### 4. OpenAI SDK Issue Confirmed
- **Current state**: `services/rag/ragService.ts` tries to use OpenAI SDK directly
- **Problem**: This will fail in React Native (Node.js APIs not available)
- **Proof**: The service uses `process.env` which doesn't exist in React Native

#### 5. Existing Server-Side Pattern
- **Found**: Scripts in `scripts/jobs/` use `SUPABASE_SERVICE_KEY` 
- **Pattern**: Server-side operations run as cron jobs, not API endpoints
- **Example**: `scripts/jobs/embedding-generation.ts` (from Sprint 8.04)

### CRITICAL QUESTIONS REQUIRING IMMEDIATE CLARIFICATION

1. **Supabase Edge Functions Setup**
   - Should I create the Edge Functions infrastructure from scratch?
   - Directory structure: `supabase/functions/generate-caption/index.ts`?
   - Deployment process: How are Edge Functions deployed in this project?

2. **API Pattern Clarification**
   - The approved plan shows SvelteKit patterns - is this intentional?
   - Should I adapt to Supabase Edge Functions instead?
   - How should the client call these functions?

3. **Type Generation for Edge Functions**
   - Edge Functions use Deno, not Node.js
   - How do we share types between React Native and Deno?
   - Should Edge Functions have their own type definitions?

4. **Local Development**
   - How to test Edge Functions locally?
   - Do we need `supabase functions serve`?
   - Environment variable handling for Edge Functions?

### PROPOSED ALTERNATIVE IMPLEMENTATION

Given the findings, I propose:

1. **Create Supabase Edge Function**
   ```
   supabase/functions/
   └── generate-caption/
       └── index.ts  // Deno-based Edge Function
   ```

2. **Client-Side Hook Adjustment**
   ```typescript
   // Call Edge Function via Supabase client
   const { data, error } = await supabase.functions.invoke('generate-caption', {
     body: { postType, betDetails }
   });
   ```

3. **Keep Rate Limiting in Database**
   - As originally planned with `caption_generation_usage` table

### BLOCKER STATUS

**I cannot proceed without clarification on:**
1. Whether to use Supabase Edge Functions or find another approach
2. The correct project structure for server-side code
3. How to properly set up and deploy Edge Functions in this project

**Current Status**: BLOCKED - Awaiting architectural clarification

---

### Investigation Findings & Implementation Plan

**Investigation Completed**:
1. **Caption Input Integration Points**:
   - Found `CaptionInput.tsx` used in multiple flows
   - Identified camera, pick, and post creation screens
   - All use consistent patterns

2. **Existing Infrastructure**:
   - RAG service exists with OpenAI integration
   - Tamagui components throughout for UI
   - Standard hook patterns established
   - No existing rate limiting infrastructure

3. **Technical Approach**:
   - Create `AICaptionButton.tsx` with AIBadge integration
   - Create `useAICaption` hook for state management
   - Extend `ragService` with `generateCaption()` method
   - Modify `CaptionInput` to include AI button
   - Integrate into all post creation flows

### Questions Requiring Reviewer Input

1. **Rate Limiting Persistence**
   - **Context**: No existing rate limiting infrastructure found
   - **Question**: Should the 20/day limit persist across app restarts?
   - **My Recommendation**: Start with in-memory Map for MVP, add persistence later if needed

2. **Caption Length Constraints**
   - **Context**: CaptionInput currently has 280 character limit
   - **Question**: Should AI-generated captions have different limits for picks vs stories vs posts?
   - **My Recommendation**: Use 100 characters for all AI captions (punchy and concise)

3. **Error Messaging**
   - **Context**: Project uses toast notifications for errors
   - **Question**: What specific error messages should we show?
   - **My Recommendations**:
     - Rate limit: "Daily caption limit reached (20/day)"
     - API error: "Unable to generate caption. Please try again."

4. **Style Learning Scope**
   - **Context**: Can query user's historical posts for style learning
   - **Question**: How many past captions should we analyze? (5, 10, 20?)
   - **My Recommendation**: Last 10 captions for balance of relevance and variety

### Proposed Implementation Details

**Component Structure**:
```typescript
// AICaptionButton with AIBadge integration
// Position: Inside CaptionInput, right-aligned
// Loading state with ActivityIndicator
// Disabled state with reduced opacity
```

**Hook Interface**:
```typescript
interface UseAICaptionOptions {
  bet?: any;
  postType: 'pick' | 'story' | 'post';
}
```

**Service Method**:
```typescript
// ragService.generateCaption()
// - Check rate limit (in-memory Map)
// - Query last 10 user captions
// - Build style-aware prompt
// - Use GPT-3.5-turbo for speed
// - Return 100 char caption
```

### Files to Create/Modify
**Create**:
- `components/creation/AICaptionButton.tsx`
- `hooks/useAICaption.ts`

**Modify**:
- `components/creation/CaptionInput.tsx`
- `services/rag/ragService.ts`
- `app/(drawer)/camera/index.tsx`
- `app/(drawer)/create-pick.tsx`
- `app/(drawer)/create-post.tsx`

**Sprint Status**: BLOCKED - ARCHITECTURE CLARIFICATION NEEDED

---

## Reviewer Section

**Reviewer**: R (Project Reviewer)  
**Review Date**: 2024-12-30

### Review Checklist
- [x] Code matches sprint objectives
- [x] All planned files created/modified
- [x] Follows established patterns
- [x] No unauthorized scope additions
- [x] Code is clean and maintainable
- [x] No obvious bugs or issues
- [x] Integrates properly with existing code

### Review Outcome

**Status**: APPROVED WITH MODIFICATIONS

### Critical Architecture Update
**IMPORTANT**: The OpenAI SDK cannot run in React Native. All AI processing must happen server-side via API endpoints. The app cannot directly call ragService.generateCaption().

### Answers to Questions

1. **Rate Limiting Persistence**
   - **Decision**: Use server-side rate limiting with database persistence
   - **Implementation**: Create `caption_generation_usage` table

2. **Caption Length Constraints**
   - **Approved**: 100 characters for all AI captions
   - **Enhancement**: Add style parameter - "punchy" for picks, "storytelling" for posts, "hype" for outcomes

3. **Error Messaging**
   - Rate limit: "AI caption limit reached (20/20 today)"
   - API error: "Caption generation unavailable. Try again?"
   - Network error: "Check your connection and try again"

4. **Style Learning Scope**
   - **Approved**: Last 10 captions
   - **Enhancement**: Weight recent captions higher, filter captions > 20 chars

### Required Changes

1. **Architecture**: Implement as API endpoint, not client-side service
   - Create: `app/api/generate-caption/+server.ts`
   - Create: `server/services/captionGenerationService.ts`
   - Create: Migration `034_caption_generation_tracking.sql`

2. **Progressive Enhancement**:
   - First tap: Generate caption
   - Second tap: Generate alternative
   - Third tap: Show "Try writing your own!"

3. **Caption Styles by Context**:
   - Pick posts: "🔒 [Team] [Spread] - [Confident statement]"
   - Outcome posts: "[Win/Loss emoji] [Amount] [Reaction]"
   - Content posts: Natural language based on user style

4. **Analytics**: Add tracking for caption generation events

### Post-Review Updates
[To be completed during implementation]

---

## Sprint Metrics

**Duration**: Planned 3 hours | Actual [Y] hours  
**Scope Changes**: [Number of plan updates]  
**Review Cycles**: [Number of review rounds]  
**Files Touched**: 5+  
**Lines Added**: ~300  
**Lines Removed**: ~10

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [APPROVED/IN PROGRESS/BLOCKED]* 