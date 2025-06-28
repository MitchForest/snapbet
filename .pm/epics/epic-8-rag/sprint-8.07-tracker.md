# Sprint 8.07: Enhanced Feed Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: [TBD]  
**End Date**: [TBD]  
**Epic**: 8 - RAG Implementation

**Sprint Goal**: Implement enhanced feed that mixes 70% following content with 30% AI-discovered posts to improve content discovery and engagement.

**User Story Contribution**: 
- Story 3: Enhanced Feed - Users see 70% following content + 30% AI-discovered posts

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
1. Create smart feed service for hybrid content mixing
2. Implement 70/30 mixing algorithm with pattern distribution
3. Add discovery badges to AI-suggested posts
4. Integrate with existing feed service
5. Ensure performance with parallel fetching
6. Update mock setup to demonstrate discovery posts in feed

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `services/rag/smartFeedService.ts` | Service for mixing following and discovery content | NOT STARTED |
| `components/feed/DiscoveryBadge.tsx` | Badge component to indicate AI-suggested posts | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `services/feed/feedService.ts` | Integrate smart feed mixing when enabled | NOT STARTED |
| `components/content/PostCard.tsx` | Add discovery badge for AI posts | NOT STARTED |
| `hooks/useFeed.ts` | Ensure proper handling of mixed feed | NOT STARTED |
| `scripts/mock/orchestrators/setup.ts` | Add note about discovery posts appearing in feed | NOT STARTED |

### Implementation Approach

**Step 1: Create smart feed service**
```typescript
// services/rag/smartFeedService.ts
import { supabase } from '@/services/supabase/client';
import { Post } from '@/types/content';
import { withActiveContent } from '@/utils/database/archiveFilter';

export class SmartFeedService {
  private static instance: SmartFeedService;
  
  static getInstance(): SmartFeedService {
    if (!SmartFeedService.instance) {
      SmartFeedService.instance = new SmartFeedService();
    }
    return SmartFeedService.instance;
  }

  async getHybridFeed(
    userId: string, 
    followingIds: string[],
    cursor?: string,
    limit: number = 20
  ): Promise<{
    posts: Post[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const followingRatio = 0.7;
    const discoveryRatio = 0.3;
    
    // Calculate splits
    const followingCount = Math.ceil(limit * followingRatio);
    const discoveryCount = Math.floor(limit * discoveryRatio);
    
    // Get user's embedding for discovery
    const { data: user } = await supabase
      .from('users')
      .select('profile_embedding')
      .eq('id', userId)
      .single();
    
    // Fetch both in parallel for performance
    const [followingPosts, discoveryPosts] = await Promise.all([
      this.getFollowingPosts(userId, followingIds, cursor, followingCount),
      user?.profile_embedding 
        ? this.getDiscoveryPosts(userId, user.profile_embedding, followingIds, discoveryCount)
        : Promise.resolve([])
    ]);
    
    // Mix posts using pattern
    const mixedPosts = this.mixPosts(followingPosts, discoveryPosts, followingRatio);
    
    return {
      posts: mixedPosts,
      nextCursor: followingPosts[followingPosts.length - 1]?.id,
      hasMore: followingPosts.length === followingCount
    };
  }

  private async getFollowingPosts(
    userId: string,
    followingIds: string[],
    cursor?: string,
    limit: number
  ): Promise<Post[]> {
    let query = withActiveContent(
      supabase
        .from('posts')
        .select(`
          *,
          users!posts_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          ),
          bets!posts_bet_id_fkey (*),
          reactions (*)
        `)
    )
    .in('user_id', [...followingIds, userId])
    .order('created_at', { ascending: false })
    .limit(limit);
    
    if (cursor) {
      query = query.lt('id', cursor);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data || [];
  }

  private async getDiscoveryPosts(
    userId: string,
    userEmbedding: number[],
    excludeUserIds: string[],
    limit: number
  ): Promise<Post[]> {
    // Use RPC to find similar posts
    const { data: postIds } = await supabase
      .rpc('find_similar_posts', {
        user_embedding: userEmbedding,
        user_id: userId,
        exclude_user_ids: [...excludeUserIds, userId],
        time_window: '24 hours',
        limit_count: limit
      });
    
    if (!postIds || postIds.length === 0) return [];
    
    // Fetch full post data
    const { data: posts } = await supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        ),
        bets!posts_bet_id_fkey (*),
        reactions (*)
      `)
      .in('id', postIds.map(p => p.id));
    
    // Mark as discovery posts
    return posts?.map(post => ({
      ...post,
      isDiscovery: true,
      similarity: postIds.find(p => p.id === post.id)?.similarity
    })) || [];
  }

  private mixPosts(
    following: Post[],
    discovery: Post[],
    ratio: number
  ): Post[] {
    const mixed: Post[] = [];
    let followingIndex = 0;
    let discoveryIndex = 0;
    
    // Use pattern: FFF-D-FFF-D (3 following, 1 discovery)
    const pattern = Math.round(1 / (1 - ratio));
    
    while (followingIndex < following.length || discoveryIndex < discovery.length) {
      // Add following posts
      for (let i = 0; i < pattern && followingIndex < following.length; i++) {
        mixed.push(following[followingIndex]);
        followingIndex++;
      }
      
      // Add discovery post
      if (discoveryIndex < discovery.length) {
        mixed.push(discovery[discoveryIndex]);
        discoveryIndex++;
      }
    }
    
    return mixed;
  }
}

export const smartFeedService = SmartFeedService.getInstance();
```

**Step 2: Create discovery badge component**
```typescript
// components/feed/DiscoveryBadge.tsx
import React from 'react';
import { XStack, Text } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme';

interface DiscoveryBadgeProps {
  similarity?: number;
}

export function DiscoveryBadge({ similarity }: DiscoveryBadgeProps) {
  return (
    <XStack 
      backgroundColor={Colors.primary + '20'}
      paddingHorizontal="$2"
      paddingVertical="$1"
      borderRadius="$1"
      alignItems="center"
      gap="$1"
    >
      <Ionicons name="sparkles" size={12} color={Colors.primary} />
      <Text fontSize="$2" color={Colors.primary} fontWeight="500">
        Suggested
      </Text>
    </XStack>
  );
}
```

**Step 3: Update feed service**
```typescript
// services/feed/feedService.ts
import { smartFeedService } from '../rag/smartFeedService';

// Add feature flag
const ENABLE_SMART_FEED = true; // Can be environment variable

export class FeedService {
  async getFeedPosts(userId: string, cursor?: FeedCursor): Promise<FeedResponse> {
    try {
      // Get following IDs
      const followingIds = await getFollowingIds();

      // Use smart feed if enabled and user has enough following
      if (ENABLE_SMART_FEED && followingIds.length >= 5) {
        const result = await smartFeedService.getHybridFeed(
          userId,
          followingIds,
          cursor?.id,
          POSTS_PER_PAGE
        );
        
        return {
          posts: result.posts,
          nextCursor: result.nextCursor ? {
            timestamp: result.posts[result.posts.length - 1].created_at,
            id: result.nextCursor
          } : null,
          hasMore: result.hasMore
        };
      }

      // Otherwise use traditional feed
      // ... existing implementation ...
    } catch (error) {
      console.error('Error fetching feed:', error);
      throw error;
    }
  }
}
```

**Step 4: Update PostCard component**
```typescript
// components/content/PostCard.tsx
import { DiscoveryBadge } from '../feed/DiscoveryBadge';

// In the PostCard component, add discovery indicator
export function PostCard({ post, ...props }: PostCardProps) {
  return (
    <YStack {...props}>
      {/* Header section */}
      <XStack justifyContent="space-between" alignItems="center">
        <XStack gap="$2" alignItems="center">
          {/* User info */}
        </XStack>
        
        {/* Add discovery badge if applicable */}
        {post.isDiscovery && (
          <DiscoveryBadge similarity={post.similarity} />
        )}
      </XStack>
      
      {/* Rest of post content */}
    </YStack>
  );
}
```

**Step 5: Add inline follow for discovery posts**
```typescript
// In PostCard, add follow button for discovery posts
{post.isDiscovery && !isFollowing && (
  <XStack marginTop="$2" justifyContent="flex-end">
    <FollowButton 
      userId={post.user_id}
      size="small"
      variant="outline"
    />
  </XStack>
)}
```

**Key Technical Decisions**:
- 70/30 ratio for familiarity with discovery
- Pattern-based mixing (FFF-D) for predictable distribution
- Parallel fetching for performance
- Feature flag for easy rollout control
- Inline follow for quick actions on discovery

### Dependencies & Risks
**Dependencies**:
- find_similar_posts RPC function from Sprint 8.01
- User profile embeddings from Sprint 8.04
- Archive filtering from Sprint 8.03

**Identified Risks**:
- Performance with two parallel queries → Monitor latency
- Discovery quality varies → Need good embeddings
- User confusion → Clear discovery indicators

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
// SmartFeedService
getHybridFeed(userId, followingIds, cursor?, limit): Promise<FeedResult>
getFollowingPosts(userId, followingIds, cursor?, limit): Promise<Post[]>
getDiscoveryPosts(userId, embedding, excludeIds, limit): Promise<Post[]>
mixPosts(following, discovery, ratio): Post[]
```

### Mixing Pattern
```
F F F D F F F D F F F D ... (3:1 ratio)
Where F = Following post, D = Discovery post
```

### Post Enhancement
```typescript
interface DiscoveryPost extends Post {
  isDiscovery: true;
  similarity: number;
}
```

## Testing Performed

### Manual Testing
- [ ] Feed shows 70/30 mix when enabled
- [ ] Discovery posts have badges
- [ ] Pattern distribution is correct (FFF-D)
- [ ] Cursor pagination works properly
- [ ] Discovery posts are relevant
- [ ] Follow button appears on discovery posts
- [ ] Performance is acceptable
- [ ] Fallback to regular feed when disabled

### Edge Cases Considered
- User with <5 following (use regular feed)
- No discovery posts available
- User has no embedding
- All discovery users already followed
- Cursor at boundary between following/discovery

## Documentation Updates

- [ ] Smart feed algorithm documented
- [ ] Mixing pattern explained
- [ ] Feature flag usage documented
- [ ] Performance considerations noted

## Handoff to Reviewer

### What Was Implemented
Complete enhanced feed with 70/30 mixing:
- Smart feed service with parallel fetching
- Pattern-based content mixing (FFF-D)
- Discovery badges for AI-suggested posts
- Inline follow buttons for discovery
- Feature flag for controlled rollout

### Files Modified/Created
**Created**:
- `services/rag/smartFeedService.ts` - Core mixing logic
- `components/feed/DiscoveryBadge.tsx` - Visual indicator

**Modified**:
- `services/feed/feedService.ts` - Integration point
- `components/content/PostCard.tsx` - Discovery indicators
- `hooks/useFeed.ts` - Handle mixed content

### Key Decisions Made
1. **70/30 ratio**: Balance familiarity with discovery
2. **Pattern mixing**: Predictable distribution vs random
3. **Parallel fetch**: Performance over simplicity
4. **Feature flag**: Safe rollout mechanism

### Deviations from Original Plan
- None anticipated

### Known Issues/Concerns
- Performance impact of dual queries
- Discovery quality depends on embeddings
- Need to educate users about suggested content

### Suggested Review Focus
- Mixing algorithm correctness
- Performance with parallel queries
- UI/UX of discovery indicators
- Error handling for partial failures

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
**Files Touched**: 5  
**Lines Added**: ~500  
**Lines Removed**: ~20

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [APPROVED/IN PROGRESS/BLOCKED]* 