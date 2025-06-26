# Sprint 06.03: Group Messaging Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: [Date]  
**End Date**: [Date]  
**Epic**: Epic 6 - Messaging System & Automation

**Sprint Goal**: Implement group chat functionality with member management, @mentions, and simplified admin controls (creator-only).

**User Story Contribution**: 
- Enables Story 4: The Isolation Problem - Users can connect with multiple bettors in group conversations
- Enables Story 5: The Missing My People Problem - Groups help users find their betting tribe

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
1. Create group creation flow (name, photo, members)
2. Build group chat UI with member indicators
3. Implement @mentions with autocomplete
4. Add simplified member management (creator only)
5. Create group info screen
6. Handle group-specific message display
7. Implement member limit enforcement (2-50)

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `app/(drawer)/create-group.tsx` | Group creation flow | NOT STARTED |
| `components/messaging/GroupCreationFlow.tsx` | Multi-step group setup | NOT STARTED |
| `components/messaging/MemberSelector.tsx` | User selection for groups | NOT STARTED |
| `components/messaging/GroupChatHeader.tsx` | Header with member count | NOT STARTED |
| `components/messaging/MentionInput.tsx` | @mention autocomplete | NOT STARTED |
| `components/messaging/MentionableText.tsx` | Highlighted @mentions | NOT STARTED |
| `app/(drawer)/group-info/[id].tsx` | Group info/settings screen | NOT STARTED |
| `components/messaging/GroupInfoHeader.tsx` | Group photo/name edit | NOT STARTED |
| `components/messaging/MemberList.tsx` | Group member display | NOT STARTED |
| `services/messaging/groupService.ts` | Group management logic | NOT STARTED |
| `hooks/useGroupMembers.ts` | Member list with updates | NOT STARTED |
| `hooks/useMentions.ts` | @mention functionality | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `app/(drawer)/(tabs)/messages.tsx` | Add "New Group" button | NOT STARTED |
| `components/messaging/ChatListItem.tsx` | Handle group chat display | NOT STARTED |
| `components/messaging/ChatBubble.tsx` | Show sender name in groups | NOT STARTED |
| `services/messaging/chatService.ts` | Add group chat creation | NOT STARTED |
| `types/messaging.ts` | Add group-specific types | NOT STARTED |
| `hooks/useMessages.ts` | Handle group message events | NOT STARTED |

### Implementation Approach

**1. Group Creation Flow**:
```typescript
// Step 1: Select Members
interface MemberSelectorProps {
  selectedUsers: string[];
  onSelect: (users: string[]) => void;
  minMembers?: number; // 2
  maxMembers?: number; // 50
}

// Step 2: Group Details
interface GroupDetailsProps {
  onSubmit: (details: {
    name: string;
    photo?: File;
    expirationHours: number;
  }) => void;
}

// Create group with transaction
const createGroup = async (details: GroupCreationData) => {
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .insert({
      type: 'group',
      name: details.name,
      photo_url: details.photoUrl,
      expiration_hours: details.expirationHours,
      created_by: user.id,
    })
    .select()
    .single();
    
  if (chatError) throw chatError;
  
  // Add all members including creator
  const members = [user.id, ...details.memberIds].map(id => ({
    chat_id: chat.id,
    user_id: id,
    role: id === user.id ? 'admin' : 'member',
  }));
  
  const { error: memberError } = await supabase
    .from('chat_members')
    .insert(members);
    
  if (memberError) {
    // Rollback chat creation
    await supabase.from('chats').delete().eq('id', chat.id);
    throw memberError;
  }
  
  return chat;
};
```

**2. @Mention System**:
```typescript
// Mention detection and parsing
const parseMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

// Autocomplete component
const MentionAutocomplete = ({ 
  members, 
  query, 
  onSelect 
}: MentionAutocompleteProps) => {
  const filtered = members.filter(m => 
    m.username.toLowerCase().includes(query.toLowerCase())
  );
  
  return (
    <YStack position="absolute" bottom="$12" width="100%">
      {filtered.map(member => (
        <TouchableOpacity
          key={member.id}
          onPress={() => onSelect(member)}
        >
          <XStack padding="$2" alignItems="center">
            <Avatar size="$3" source={{ uri: member.avatar_url }} />
            <Text marginLeft="$2">@{member.username}</Text>
          </XStack>
        </TouchableOpacity>
      ))}
    </YStack>
  );
};
```

**3. Group-Specific UI**:
- Show sender names above messages (except consecutive messages)
- Display member count in header
- Show "X added Y" system messages
- Highlight @mentions in messages
- Group avatar with stacked member photos

**4. Simplified Admin Controls**:
- Only group creator can:
  - Add members (up to 50 total)
  - Remove members
  - Edit group name/photo
  - Delete group
- No role management or permissions
- Members can only leave group

**Key Technical Decisions**:
- Limit @mention autocomplete to 10 results for performance
- Cache group members in memory during chat session
- Use transaction for group creation to ensure consistency
- Show system messages for member changes
- Batch member additions to reduce DB calls

### Dependencies & Risks
**Dependencies**:
- Existing chat infrastructure from Sprint 06.01-06.02
- User search/selection components

**Identified Risks**:
- Group creation transaction failures
- @mention performance with large groups
- Member limit enforcement edge cases
- Handling deleted/blocked users in groups

**Mitigation**:
- Proper transaction rollback on failures
- Debounce @mention search
- Server-side member count validation
- Filter blocked users from member lists

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

### Group Member Management Hook
```typescript
// hooks/useGroupMembers.ts
export const useGroupMembers = (chatId: string) => {
  const { data: members, isLoading } = useQuery({
    queryKey: ['group-members', chatId],
    queryFn: () => groupService.getGroupMembers(chatId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Real-time member updates
  useEffect(() => {
    const channel = supabase
      .channel(`group-members:${chatId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_members',
        filter: `chat_id=eq.${chatId}`,
      }, (payload) => {
        queryClient.invalidateQueries(['group-members', chatId]);
      })
      .subscribe();
      
    return () => {
      channel.unsubscribe();
    };
  }, [chatId]);
  
  const addMember = async (userId: string) => {
    // Check member limit
    if (members && members.length >= 50) {
      throw new Error('Group has reached maximum capacity (50 members)');
    }
    
    return groupService.addGroupMember(chatId, userId);
  };
  
  const removeMember = async (userId: string) => {
    return groupService.removeGroupMember(chatId, userId);
  };
  
  return { members, isLoading, addMember, removeMember };
};
```

### Mention Detection and Rendering
```typescript
// components/messaging/MentionableText.tsx
export const MentionableText = ({ 
  text, 
  mentions,
  onMentionPress 
}: MentionableTextProps) => {
  const parts = text.split(/(@\w+)/g);
  
  return (
    <Text>
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          const username = part.slice(1);
          const isMentioned = mentions.includes(username);
          
          return (
            <Text
              key={index}
              color={isMentioned ? '$primary' : '$color'}
              fontWeight={isMentioned ? 'bold' : 'normal'}
              onPress={() => onMentionPress?.(username)}
            >
              {part}
            </Text>
          );
        }
        return <Text key={index}>{part}</Text>;
      })}
    </Text>
  );
};
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| POST | /rest/v1/chats | Group chat object | Created chat | WORKING |
| POST | /rest/v1/chat_members | Member array | Added members | WORKING |
| DELETE | /rest/v1/chat_members | Member removal | Success | PLANNED |
| PATCH | /rest/v1/chats | Group updates | Updated chat | PLANNED |

### State Management
- Group members cached in React Query
- @mention suggestions in local component state
- Group creation flow in multi-step form state
- Active mentions tracked for notifications
- Member presence synced via real-time

## Testing Performed

### Manual Testing
- [ ] Group creation with 2+ members works
- [ ] Member limit (50) properly enforced
- [ ] @mentions autocomplete correctly
- [ ] Only creator can manage members
- [ ] Group info screen updates work
- [ ] System messages display properly
- [ ] Blocked users filtered from groups
- [ ] Leave group functionality works
- [ ] Delete group (creator only) works
- [ ] Group expiration settings apply

### Edge Cases Considered
- Creating group with blocked users → Filter them out
- Member leaves during typing → Handle gracefully
- Creator leaves group → Assign new admin or delete
- Reaching member limit → Show clear error
- @mentioning non-members → No autocomplete
- Rapid member additions → Batch operations

## Documentation Updates

- [ ] Group creation flow documented
- [ ] @mention system explained
- [ ] Member management rules documented
- [ ] System message types listed
- [ ] Group limits documented

## Handoff to Reviewer

### What Was Implemented
[Clear summary of all work completed]

### Files Modified/Created
**Created**:
- `app/(drawer)/create-group.tsx` - Group creation screen
- `components/messaging/GroupCreationFlow.tsx` - Multi-step flow
- `components/messaging/MemberSelector.tsx` - Member selection
- `components/messaging/GroupChatHeader.tsx` - Group header
- `components/messaging/MentionInput.tsx` - @mention input
- `components/messaging/MentionableText.tsx` - Mention rendering
- `app/(drawer)/group-info/[id].tsx` - Group settings
- `components/messaging/GroupInfoHeader.tsx` - Info header
- `components/messaging/MemberList.tsx` - Member display
- `services/messaging/groupService.ts` - Group logic
- `hooks/useGroupMembers.ts` - Member management
- `hooks/useMentions.ts` - Mention functionality

**Modified**:
- `app/(drawer)/(tabs)/messages.tsx` - Added new group button
- `components/messaging/ChatListItem.tsx` - Group chat display
- `components/messaging/ChatBubble.tsx` - Sender names
- `services/messaging/chatService.ts` - Group creation
- `types/messaging.ts` - Group types
- `hooks/useMessages.ts` - Group events

### Key Decisions Made
1. **Creator-only admin**: Simplified permissions model
2. **50 member limit**: Enforced at application level
3. **@mention limit**: Max 10 suggestions for performance
4. **System messages**: Track all member changes
5. **Blocked user handling**: Completely hidden in groups

### Deviations from Original Plan
- Removed complex role system (only creator as admin)
- Simplified permissions (no granular controls)
- No invite links in this sprint (moved to future)

### Known Issues/Concerns
- Large groups (40+) might have performance issues
- @mention autocomplete needs optimization
- Member presence tracking scales poorly
- Group photo upload needs size limits

### Suggested Review Focus
- Group creation transaction integrity
- Member limit enforcement
- @mention parsing and rendering
- Blocked user filtering in all contexts
- System message generation

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
- [ ] Member limits enforced
- [ ] @mentions work correctly
- [ ] Admin controls function properly

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
**Files Touched**: 18  
**Lines Added**: ~[Estimate]  
**Lines Removed**: ~[Estimate]

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [APPROVED/IN PROGRESS/BLOCKED]* 