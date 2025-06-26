# Sprint 06.01: Chat List & Navigation Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: [Date]  
**End Date**: [Date]  
**Epic**: Epic 6 - Messaging System & Automation

**Sprint Goal**: Create a WhatsApp-style unified chat list interface with real-time updates, search functionality, and smooth navigation to individual chats.

**User Story Contribution**: 
- Enables Story 4: The Isolation Problem - Users can see all their conversations in one place and easily connect with other bettors

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
1. Create the main messages tab screen with chat list
2. Implement real-time updates for last messages and unread counts
3. Build swipe actions for archive/mute functionality
4. Add search functionality for finding conversations
5. Create empty state for new users
6. Implement navigation to individual chat screens

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `app/(drawer)/(tabs)/messages.tsx` | Main messages tab screen | NOT STARTED |
| `components/messaging/ChatListItem.tsx` | Individual chat row component | NOT STARTED |
| `components/messaging/ChatListSkeleton.tsx` | Loading skeleton for chat list | NOT STARTED |
| `components/messaging/EmptyChats.tsx` | Empty state component | NOT STARTED |
| `components/messaging/ChatSearch.tsx` | Search bar component | NOT STARTED |
| `services/messaging/chatService.ts` | Chat list data fetching | NOT STARTED |
| `hooks/useChats.ts` | Chat list hook with real-time | NOT STARTED |
| `hooks/useChatSearch.ts` | Search functionality hook | NOT STARTED |
| `types/messaging.ts` | TypeScript types for messaging | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `app/(drawer)/(tabs)/_layout.tsx` | Update messages tab icon/badge | NOT STARTED |
| `types/supabase.ts` | Add generated types for chats/messages | NOT STARTED |
| `services/supabase/index.ts` | Export messaging services | NOT STARTED |

### Implementation Approach

**1. Database Queries**:
```typescript
// Get user's chats with last message and unread count
const getChatsWithDetails = async (userId: string) => {
  return supabase
    .from('chats')
    .select(`
      *,
      members:chat_members!inner(
        user:users(*)
      ),
      last_message:messages(
        content,
        created_at,
        sender:users(username)
      ),
      unread_count:messages(count)
    `)
    .or(`
      members.user_id.eq.${userId},
      type.eq.group
    `)
    .order('last_message.created_at', { ascending: false });
};
```

**2. Real-time Subscriptions**:
- Subscribe to new messages in user's chats
- Update last message and unread count optimistically
- Handle online/offline status for DMs

**3. UI Components**:
- Use FlashList for performance
- Implement swipe actions with react-native-gesture-handler
- Add haptic feedback for interactions
- Show typing indicators in list

**Key Technical Decisions**:
- Use FlashList over FlatList for better performance with large chat lists
- Implement optimistic updates for real-time feel
- Cache chat list in React Query with 5-minute stale time
- Use Tamagui's Sheet component for swipe action confirmations

### Dependencies & Risks
**Dependencies**:
- react-native-gesture-handler (for swipe actions)
- @shopify/flash-list (for performance)
- date-fns (for timestamp formatting)

**Identified Risks**:
- Real-time subscription complexity with multiple chats
- Performance with large number of chats
- Unread count accuracy with real-time updates

**Mitigation**:
- Limit initial chat list to 50, paginate rest
- Batch real-time updates
- Use database triggers for accurate unread counts

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

### Chat List Hook
```typescript
// hooks/useChats.ts
export const useChats = () => {
  const { user } = useAuth();
  
  // Query for chat list
  const { data: chats, isLoading } = useQuery({
    queryKey: ['chats', user?.id],
    queryFn: () => chatService.getUserChats(user!.id),
    enabled: !!user,
  });
  
  // Real-time subscription
  useEffect(() => {
    if (!user) return;
    
    const subscription = supabase
      .channel('chat-list')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=in.(${chats?.map(c => c.id).join(',')})`
      }, handleNewMessage)
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [chats, user]);
  
  return { chats, isLoading };
};
```

### Chat List Item Component
```typescript
// components/messaging/ChatListItem.tsx
interface ChatListItemProps {
  chat: Chat;
  onPress: () => void;
  onArchive: () => void;
  onMute: () => void;
}

export const ChatListItem = ({ chat, onPress, onArchive, onMute }: ChatListItemProps) => {
  // Component implementation
};
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| GET | /rest/v1/rpc/get_user_chats | `{ user_id }` | Chat[] with details | WORKING |
| PATCH | /rest/v1/chat_members | Archive/mute updates | Updated member | PLANNED |

### State Management
- Chat list stored in React Query cache
- Unread counts managed via real-time subscriptions
- Search results in local component state
- Archive/mute status in chat_members table

## Testing Performed

### Manual Testing
- [ ] Chat list loads correctly
- [ ] Real-time updates work for new messages
- [ ] Unread counts update properly
- [ ] Search filters results correctly
- [ ] Swipe actions trigger correctly
- [ ] Navigation to chat works
- [ ] Empty state displays for new users
- [ ] Pull-to-refresh works
- [ ] Online status indicators update

### Edge Cases Considered
- User with no chats → Show empty state
- User blocked by all chat members → Handle gracefully
- Very long chat names → Truncate properly
- Network offline → Show cached data
- Rapid message updates → Batch and debounce

## Documentation Updates

- [ ] Code comments added for complex logic
- [ ] Real-time subscription pattern documented
- [ ] Swipe gesture implementation documented
- [ ] Search algorithm explained

## Handoff to Reviewer

### What Was Implemented
[Clear summary of all work completed]

### Files Modified/Created
**Created**:
- `app/(drawer)/(tabs)/messages.tsx` - Main chat list screen
- `components/messaging/ChatListItem.tsx` - Individual chat row
- `components/messaging/ChatListSkeleton.tsx` - Loading state
- `components/messaging/EmptyChats.tsx` - Empty state
- `components/messaging/ChatSearch.tsx` - Search functionality
- `services/messaging/chatService.ts` - Data fetching logic
- `hooks/useChats.ts` - Chat list with real-time
- `hooks/useChatSearch.ts` - Search logic
- `types/messaging.ts` - TypeScript definitions

**Modified**:
- `app/(drawer)/(tabs)/_layout.tsx` - Added unread badge to tab
- `types/supabase.ts` - Generated types for messaging tables

### Key Decisions Made
1. **FlashList over FlatList**: Better performance for large lists
2. **Optimistic updates**: Immediate UI feedback for better UX
3. **5-minute cache**: Balance between freshness and performance
4. **Swipe actions**: Archive and mute only (delete too dangerous)

### Deviations from Original Plan
- [Any deviations with explanations]

### Known Issues/Concerns
- Real-time subscriptions need careful cleanup to prevent memory leaks
- Unread count calculation might need optimization for users with many chats
- Search currently client-side only, might need server-side for scale

### Suggested Review Focus
- Real-time subscription implementation and cleanup
- Performance with mock data (50+ chats)
- Swipe gesture UX and haptic feedback
- TypeScript types completeness

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
- [ ] Real-time updates work correctly
- [ ] Performance is acceptable

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

**Duration**: Planned 2 days | Actual [Y] days  
**Scope Changes**: [Number of plan updates]  
**Review Cycles**: [Number of review rounds]  
**Files Touched**: 11  
**Lines Added**: ~[Estimate]  
**Lines Removed**: ~[Estimate]

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [APPROVED/IN PROGRESS/BLOCKED]* 