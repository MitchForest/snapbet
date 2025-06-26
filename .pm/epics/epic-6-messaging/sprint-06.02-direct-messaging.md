# Sprint 06.02: Direct Messaging Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: [Date]  
**End Date**: [Date]  
**Epic**: Epic 6 - Messaging System & Automation

**Sprint Goal**: Build complete 1-on-1 messaging functionality with text/media messages, typing indicators, read receipts, pick sharing, and message expiration.

**User Story Contribution**: 
- Enables Story 4: The Isolation Problem - Users can have private conversations about bets and connect with other bettors
- Enables Story 2: The Permanent Record Problem - Messages expire based on user-selected timeframes

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
1. Create individual chat screen with message history
2. Implement text message sending with delivery status
3. Add media message support (photos/videos)
4. Build typing indicators with real-time updates
5. Implement read receipts (double checkmarks)
6. Create pick sharing functionality (bet cards in messages)
7. Add message expiration options and visual countdown

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `app/(drawer)/chat/[id].tsx` | Individual chat screen | NOT STARTED |
| `components/messaging/ChatBubble.tsx` | Message bubble component | NOT STARTED |
| `components/messaging/MessageInput.tsx` | Text input with media button | NOT STARTED |
| `components/messaging/TypingIndicator.tsx` | Animated typing display | NOT STARTED |
| `components/messaging/PickShareCard.tsx` | Bet card in messages | NOT STARTED |
| `components/messaging/MediaMessage.tsx` | Photo/video message display | NOT STARTED |
| `components/messaging/MessageStatus.tsx` | Delivery/read status icons | NOT STARTED |
| `components/messaging/ExpirationTimer.tsx` | Countdown display | NOT STARTED |
| `services/messaging/messageService.ts` | Message sending/receiving | NOT STARTED |
| `hooks/useMessages.ts` | Message list with real-time | NOT STARTED |
| `hooks/useTypingIndicator.ts` | Typing status management | NOT STARTED |
| `hooks/useReadReceipts.ts` | Read receipt tracking | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `services/messaging/chatService.ts` | Add DM creation logic | NOT STARTED |
| `types/messaging.ts` | Add message types and interfaces | NOT STARTED |
| `services/storage/storageService.ts` | Add message media upload | NOT STARTED |
| `components/common/Avatar.tsx` | Add online status indicator | NOT STARTED |

### Implementation Approach

**1. Message Sending Flow**:
```typescript
// Send message with optimistic update
const sendMessage = async (chatId: string, content: MessageContent) => {
  // Create optimistic message
  const tempMessage = {
    id: `temp-${Date.now()}`,
    chat_id: chatId,
    sender_id: user.id,
    content: content.text,
    media_url: content.mediaUrl,
    bet_id: content.betId,
    status: 'sending',
    created_at: new Date().toISOString(),
    expires_at: calculateExpiration(chatExpiration),
  };
  
  // Add to UI immediately
  addOptimisticMessage(tempMessage);
  
  // Send to server
  const { data, error } = await supabase
    .from('messages')
    .insert({
      ...tempMessage,
      id: undefined, // Let DB generate
    })
    .select()
    .single();
    
  // Update with real message or handle error
  if (data) {
    replaceOptimisticMessage(tempMessage.id, data);
  } else {
    markMessageFailed(tempMessage.id);
  }
};
```

**2. Real-time Features**:
- **Typing Indicators**: Broadcast on channel with debouncing
- **Read Receipts**: Update when message enters viewport
- **New Messages**: Subscribe to chat-specific channel
- **Online Status**: Presence tracking on chat channel

**3. UI Components**:
- Chat bubbles with tail (own messages right, others left)
- Media messages with loading/progress
- Pick share cards with tail/fade buttons
- Typing indicator with 3-dot animation
- Double checkmark system (sent ✓, delivered ✓, read ✓✓)

**Key Technical Decisions**:
- Use intersection observer for read receipt tracking
- Debounce typing indicators (500ms) to prevent spam
- Batch read receipt updates to reduce DB writes
- Pre-compress media before upload for faster sending
- Use optimistic updates for instant feedback

### Dependencies & Risks
**Dependencies**:
- expo-av (for video playback)
- expo-image-manipulator (for image compression)
- react-native-intersection-observer (for read receipts)

**Identified Risks**:
- Message ordering with optimistic updates
- Read receipt accuracy with fast scrolling
- Typing indicator performance with many users
- Media upload progress tracking

**Mitigation**:
- Use high-precision timestamps for ordering
- Debounce read receipt updates
- Limit typing broadcast frequency
- Show upload progress in message bubble

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

### Message Hook with Real-time
```typescript
// hooks/useMessages.ts
export const useMessages = (chatId: string) => {
  const queryClient = useQueryClient();
  
  // Query messages with pagination
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['messages', chatId],
    queryFn: ({ pageParam = 0 }) => 
      messageService.getChatMessages(chatId, pageParam),
    getNextPageParam: (lastPage) => 
      lastPage.length === PAGE_SIZE ? lastPage.length : undefined,
  });
  
  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      }, (payload) => {
        // Add new message to cache
        queryClient.setQueryData(['messages', chatId], (old) => {
          // Add to first page
          return {
            ...old,
            pages: [[payload.new, ...old.pages[0]], ...old.pages.slice(1)],
          };
        });
      })
      .subscribe();
      
    return () => {
      channel.unsubscribe();
    };
  }, [chatId]);
  
  return { messages: data?.pages.flat() ?? [], fetchNextPage, hasNextPage };
};
```

### Typing Indicator Management
```typescript
// hooks/useTypingIndicator.ts
export const useTypingIndicator = (chatId: string) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channel = useRef<RealtimeChannel>();
  const typingTimeout = useRef<NodeJS.Timeout>();
  
  // Broadcast typing status
  const setTyping = useCallback((isTyping: boolean) => {
    if (!channel.current) return;
    
    channel.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id, isTyping },
    });
    
    // Auto-stop typing after 3 seconds
    if (isTyping) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        setTyping(false);
      }, 3000);
    }
  }, [user.id]);
  
  // Debounced version for text input
  const debouncedSetTyping = useMemo(
    () => debounce(setTyping, 500),
    [setTyping]
  );
  
  return { typingUsers, setTyping: debouncedSetTyping };
};
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| POST | /rest/v1/messages | Message object | Created message | WORKING |
| GET | /rest/v1/messages | `?chat_id=eq.{id}` | Message array | WORKING |
| PATCH | /rest/v1/message_reads | Mark as read | Updated reads | PLANNED |
| POST | /storage/v1/object/messages | Binary media | Upload result | PLANNED |

### State Management
- Messages stored in React Query infinite query cache
- Optimistic messages in local state until confirmed
- Typing status in real-time channel state
- Read receipts batched and synced periodically
- Chat expiration setting in chat_members table

## Testing Performed

### Manual Testing
- [ ] Text messages send and display correctly
- [ ] Media messages upload with progress
- [ ] Pick shares show bet details and buttons
- [ ] Typing indicators appear/disappear properly
- [ ] Read receipts update accurately
- [ ] Message expiration countdown works
- [ ] Optimistic updates feel instant
- [ ] Failed messages can be retried
- [ ] Scroll to bottom on new messages
- [ ] Load more messages on scroll up

### Edge Cases Considered
- Sending message while offline → Queue and retry
- Rapid message sending → Maintain order
- Large media files → Show compression progress
- Expired messages → Show placeholder
- Blocked users → Hide messages appropriately
- Network interruption → Reconnect gracefully

## Documentation Updates

- [ ] Message sending flow documented
- [ ] Real-time subscription patterns explained
- [ ] Read receipt logic documented
- [ ] Typing indicator debouncing explained
- [ ] Media compression settings documented

## Handoff to Reviewer

### What Was Implemented
[Clear summary of all work completed]

### Files Modified/Created
**Created**:
- `app/(drawer)/chat/[id].tsx` - Individual chat screen
- `components/messaging/ChatBubble.tsx` - Message display
- `components/messaging/MessageInput.tsx` - Input with media
- `components/messaging/TypingIndicator.tsx` - Typing animation
- `components/messaging/PickShareCard.tsx` - Bet cards
- `components/messaging/MediaMessage.tsx` - Photo/video display
- `components/messaging/MessageStatus.tsx` - Delivery status
- `components/messaging/ExpirationTimer.tsx` - Countdown
- `services/messaging/messageService.ts` - Message logic
- `hooks/useMessages.ts` - Message list management
- `hooks/useTypingIndicator.ts` - Typing status
- `hooks/useReadReceipts.ts` - Read tracking

**Modified**:
- `services/messaging/chatService.ts` - Added DM creation
- `types/messaging.ts` - Added message interfaces
- `services/storage/storageService.ts` - Message media upload
- `components/common/Avatar.tsx` - Online status indicator

### Key Decisions Made
1. **Optimistic updates**: Messages appear instantly for better UX
2. **Debounced typing**: 500ms delay prevents indicator spam
3. **Batched read receipts**: Update every 2 seconds to reduce DB writes
4. **Media compression**: 85% quality, max 1920x1080 for photos
5. **Message ordering**: Use created_at with microsecond precision

### Deviations from Original Plan
- [Any deviations with explanations]

### Known Issues/Concerns
- Read receipts might miss very fast scrolling
- Typing indicators need cleanup on unmount
- Large media files still take time despite compression
- Message ordering edge cases with poor connectivity

### Suggested Review Focus
- Optimistic update implementation and error handling
- Real-time subscription cleanup
- Read receipt accuracy
- Typing indicator performance
- Media upload progress tracking

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
- [ ] Typing indicators work smoothly
- [ ] Read receipts are accurate
- [ ] Message expiration functions correctly

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

**Duration**: Planned 2.5 days | Actual [Y] days  
**Scope Changes**: [Number of plan updates]  
**Review Cycles**: [Number of review rounds]  
**Files Touched**: 16  
**Lines Added**: ~[Estimate]  
**Lines Removed**: ~[Estimate]

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [APPROVED/IN PROGRESS/BLOCKED]* 