# Sprint 8.05: AI Caption Generation Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: [TBD]  
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

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `components/creation/AICaptionButton.tsx` | Button component with sparkle icon and loading state | NOT STARTED |
| `hooks/useAICaption.ts` | Hook for caption generation state and logic | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `components/creation/CaptionInput.tsx` | Add AI button to caption input area | NOT STARTED |
| `services/rag/ragService.ts` | Implement generateCaption method with style learning | NOT STARTED |
| `app/(drawer)/camera/index.tsx` | Integrate useAICaption hook in camera flow | NOT STARTED |
| `app/(drawer)/camera/preview.tsx` | Add AI caption option in preview screen | NOT STARTED |
| `services/content/postService.ts` | Generate embedding after post creation | NOT STARTED |

### Implementation Approach

**Step 1: Create AI caption button component**
```typescript
// components/creation/AICaptionButton.tsx
import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme';

interface AICaptionButtonProps {
  onPress: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function AICaptionButton({ onPress, isGenerating, disabled }: AICaptionButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={disabled || isGenerating}
    >
      {isGenerating ? (
        <ActivityIndicator size="small" color={Colors.white} />
      ) : (
        <XStack alignItems="center" gap="$1">
          <Ionicons name="sparkles" size={20} color={Colors.white} />
          <Text color="$white" fontSize={14} fontWeight="600">
            Generate
          </Text>
        </XStack>
      )}
    </TouchableOpacity>
  );
}
```

**Step 2: Create useAICaption hook**
```typescript
// hooks/useAICaption.ts
import { useState, useCallback } from 'react';
import { ragService } from '@/services/rag/ragService';
import { useAuth } from '@/hooks/useAuth';

export function useAICaption(options: UseAICaptionOptions) {
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCaption = useCallback(async () => {
    if (!user) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const generated = await ragService.generateCaption(user.id, {
        bet: options.bet,
        postType: options.postType,
      });
      
      setCaption(generated);
    } catch (err) {
      setError('Failed to generate caption');
      console.error('Caption generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [user, options.bet, options.postType]);

  return {
    caption,
    isGenerating,
    error,
    generateCaption,
    clearCaption,
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

**Key Technical Decisions**:
- Sparkle icon for AI indication (industry standard)
- 20/day rate limit to control costs
- Learn from last 10 user captions for style
- 100 character limit for punchiness
- GPT-3.5-turbo for speed and cost

### Dependencies & Risks
**Dependencies**:
- RAG service from Sprint 8.04
- OpenAI API key configured
- User authentication working

**Identified Risks**:
- Caption quality varies → Allow editing
- Rate limit too restrictive → Monitor usage
- Style learning insufficient → Iterate on prompt

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

### What Was Implemented
Complete AI caption generation feature:
- Sparkle button component with loading states
- Hook for managing caption generation
- Integration with existing caption input
- Style learning from user history
- Rate limiting (20/day)
- Error handling and recovery

### Files Modified/Created
**Created**:
- `components/creation/AICaptionButton.tsx` - AI button component
- `hooks/useAICaption.ts` - Caption generation hook

**Modified**:
- `components/creation/CaptionInput.tsx` - Added AI button integration
- `services/rag/ragService.ts` - Implemented caption generation
- Post creation screens - Integrated AI caption hook

### Key Decisions Made
1. **Sparkle icon**: Industry standard for AI features
2. **20/day limit**: Balance between usage and cost
3. **Style learning**: Last 10 captions for context
4. **Edit capability**: Users can modify AI suggestions

### Deviations from Original Plan
- None anticipated

### Known Issues/Concerns
- Rate limiting is in-memory (resets on restart)
- Style learning could be more sophisticated
- Need to find all post creation screens

### Suggested Review Focus
- UI/UX of button placement
- Hook integration pattern
- Rate limiting implementation
- Error handling completeness

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