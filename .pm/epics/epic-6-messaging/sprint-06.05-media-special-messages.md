# Sprint 06.05: Media & Special Messages Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: [Date]  
**End Date**: [Date]  
**Epic**: Epic 6 - Messaging System & Automation

**Sprint Goal**: Handle media messages (photos/videos) and special message types including pick sharing with tail/fade buttons and message reactions using existing UI components.

**User Story Contribution**: 
- Enables Story 3: The Boring Bet Slip Problem - Share picks with personality through media messages
- Enables Story 4: The Isolation Problem - Rich media and reactions make conversations more engaging

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
1. Implement media message selection and compression
2. Create media upload with progress tracking
3. Build media message display components
4. Implement pick sharing from bet slip
5. Add message reactions (reusing post reaction UI)
6. Create message action menu (long press)
7. Handle media expiration alongside messages

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `components/messaging/MediaPicker.tsx` | Photo/video selection UI | NOT STARTED |
| `components/messaging/MediaUploadProgress.tsx` | Upload progress overlay | NOT STARTED |
| `components/messaging/MediaMessageDisplay.tsx` | Photo/video in chat | NOT STARTED |
| `components/messaging/MessageActionMenu.tsx` | Long press menu | NOT STARTED |
| `services/messaging/mediaMessageService.ts` | Media handling logic | NOT STARTED |
| `hooks/useMediaMessage.ts` | Media message hook | NOT STARTED |
| `hooks/useMessageReactions.ts` | Reaction management | NOT STARTED |
| `utils/media/messageCompression.ts` | Media optimization | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `components/messaging/MessageInput.tsx` | Add media picker button | NOT STARTED |
| `components/messaging/ChatBubble.tsx` | Handle media display | NOT STARTED |
| `components/messaging/PickShareCard.tsx` | Add tail/fade handlers | NOT STARTED |
| `components/engagement/ReactionPicker.tsx` | Adapt for messages | NOT STARTED |
| `services/storage/storageService.ts` | Add message media path | NOT STARTED |
| `types/messaging.ts` | Add media message types | NOT STARTED |
| `supabase/migrations/016_add_message_media.sql` | Add media columns | NOT STARTED |

### Implementation Approach

**1. Media Message Flow**:
```typescript
// hooks/useMediaMessage.ts
export const useMediaMessage = (chatId: string) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const sendMediaMessage = async (
    media: { uri: string; type: 'photo' | 'video' },
    caption?: string
  ) => {
    setIsUploading(true);
    
    try {
      // 1. Compress media
      const compressed = await compressMedia(media, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        maxVideoDuration: 30,
      });
      
      // 2. Upload to storage with progress
      const mediaUrl = await storageService.uploadMessageMedia(
        compressed,
        chatId,
        (progress) => setUploadProgress(progress)
      );
      
      // 3. Create message with media URL
      const message = await messageService.sendMessage(chatId, {
        content: caption || '',
        media_url: mediaUrl,
        media_type: media.type,
      });
      
      return message;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  return { sendMediaMessage, uploadProgress, isUploading };
};
```

**2. Pick Share Integration**:
```typescript
// components/messaging/PickShareCard.tsx
interface PickShareCardProps {
  bet: Bet;
  messageId: string;
  chatId: string;
  isOwnMessage: boolean;
}

export const PickShareCard = ({ 
  bet, 
  messageId, 
  chatId,
  isOwnMessage 
}: PickShareCardProps) => {
  const { tailBet, fadeBet } = useBetting();
  const [hasTailed, setHasTailed] = useState(false);
  const [hasFaded, setHasFaded] = useState(false);
  
  const handleTail = async () => {
    if (isOwnMessage || hasTailed || hasFaded) return;
    
    try {
      await tailBet(bet);
      setHasTailed(true);
      
      // Track in message
      await messageService.trackPickAction(messageId, 'tail');
    } catch (error) {
      showToast('Failed to tail bet', 'error');
    }
  };
  
  const handleFade = async () => {
    if (isOwnMessage || hasTailed || hasFaded) return;
    
    try {
      await fadeBet(bet);
      setHasFaded(true);
      
      // Track in message
      await messageService.trackPickAction(messageId, 'fade');
    } catch (error) {
      showToast('Failed to fade bet', 'error');
    }
  };
  
  return (
    <YStack
      backgroundColor="$surface2"
      borderRadius="$3"
      padding="$3"
      marginVertical="$1"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$5" fontWeight="bold">
          {bet.team} {bet.spread > 0 ? `+${bet.spread}` : bet.spread}
        </Text>
        <Text color="$gray11">{bet.odds}</Text>
      </XStack>
      
      <Text color="$gray11" fontSize="$3" marginTop="$1">
        ${bet.amount} to win ${bet.potential_payout}
      </Text>
      
      {!isOwnMessage && (
        <XStack gap="$2" marginTop="$3">
          <Button
            size="$3"
            flex={1}
            backgroundColor={hasTailed ? '$primary' : '$surface3'}
            disabled={hasTailed || hasFaded}
            onPress={handleTail}
          >
            <Text color={hasTailed ? 'white' : '$color'}>
              {hasTailed ? 'Tailed ✓' : 'Tail'}
            </Text>
          </Button>
          
          <Button
            size="$3"
            flex={1}
            backgroundColor={hasFaded ? '$danger' : '$surface3'}
            disabled={hasTailed || hasFaded}
            onPress={handleFade}
          >
            <Text color={hasFaded ? 'white' : '$color'}>
              {hasFaded ? 'Faded ✓' : 'Fade'}
            </Text>
          </Button>
        </XStack>
      )}
    </YStack>
  );
};
```

**3. Message Reactions (Reusing Post UI)**:
```typescript
// hooks/useMessageReactions.ts
export const useMessageReactions = (messageId: string) => {
  const { data: reactions, refetch } = useQuery({
    queryKey: ['message-reactions', messageId],
    queryFn: () => messageService.getMessageReactions(messageId),
  });
  
  const addReaction = useMutation({
    mutationFn: (emoji: string) => 
      messageService.addMessageReaction(messageId, emoji),
    onSuccess: () => {
      refetch();
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });
  
  const removeReaction = useMutation({
    mutationFn: () => 
      messageService.removeMessageReaction(messageId),
    onSuccess: () => refetch(),
  });
  
  return {
    reactions: reactions || [],
    addReaction: addReaction.mutate,
    removeReaction: removeReaction.mutate,
    isLoading: addReaction.isLoading || removeReaction.isLoading,
  };
};
```

**4. Message Action Menu**:
```typescript
// components/messaging/MessageActionMenu.tsx
interface MessageAction {
  label: string;
  icon: string;
  action: () => void;
  destructive?: boolean;
}

export const MessageActionMenu = ({ 
  message,
  onDismiss 
}: MessageActionMenuProps) => {
  const actions: MessageAction[] = [
    {
      label: 'Copy',
      icon: 'copy',
      action: () => {
        Clipboard.setStringAsync(message.content);
        showToast('Copied to clipboard');
      },
    },
    {
      label: 'React',
      icon: 'emoji',
      action: () => {
        // Show reaction picker
        setShowReactionPicker(true);
      },
    },
    {
      label: 'Delete for me',
      icon: 'trash',
      action: () => {
        messageService.deleteForMe(message.id);
      },
      destructive: true,
    },
    {
      label: 'Report',
      icon: 'flag',
      action: () => {
        // Show report modal
        setShowReportModal(true);
      },
      destructive: true,
    },
  ];
  
  return (
    <YStack
      backgroundColor="$surface2"
      borderRadius="$3"
      padding="$2"
    >
      {actions.map((action) => (
        <TouchableOpacity
          key={action.label}
          onPress={() => {
            action.action();
            onDismiss();
          }}
        >
          <XStack
            padding="$3"
            alignItems="center"
            gap="$3"
          >
            <Icon name={action.icon} color={action.destructive ? '$danger' : '$color'} />
            <Text color={action.destructive ? '$danger' : '$color'}>
              {action.label}
            </Text>
          </XStack>
        </TouchableOpacity>
      ))}
    </YStack>
  );
};
```

**Key Technical Decisions**:
- Reuse existing reaction UI components from posts
- Compress media before upload (85% quality, max 1920x1080)
- Video limit of 30 seconds for messages
- Store media in `messages/{chatId}/{messageId}` path
- Track tail/fade actions on pick shares
- Long press gesture for message actions

### Dependencies & Risks
**Dependencies**:
- expo-media-library (for media selection)
- expo-image-manipulator (for compression)
- expo-clipboard (for copy functionality)
- react-native-gesture-handler (for long press)

**Identified Risks**:
- Large media files causing memory issues
- Upload progress accuracy on poor connections
- Media expiration sync with message expiration
- Reaction spam potential

**Mitigation**:
- Stream large files during upload
- Implement chunked upload for reliability
- Link media lifecycle to message lifecycle
- Rate limit reactions per user

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

### Media Compression Utility
```typescript
// utils/media/messageCompression.ts
export const compressMedia = async (
  media: MediaInput,
  options: CompressionOptions
): Promise<CompressedMedia> => {
  if (media.type === 'photo') {
    const manipulated = await ImageManipulator.manipulateAsync(
      media.uri,
      [{ resize: { width: options.maxWidth } }],
      {
        compress: options.quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    
    return {
      uri: manipulated.uri,
      type: 'photo',
      size: await getFileSize(manipulated.uri),
    };
  } else {
    // Video compression
    const compressed = await VideoCompressor.compress(
      media.uri,
      {
        maxDuration: options.maxVideoDuration,
        quality: 'medium',
        maxWidth: 720,
      }
    );
    
    return {
      uri: compressed.uri,
      type: 'video',
      size: compressed.size,
      duration: compressed.duration,
    };
  }
};
```

### Database Migration
```sql
-- supabase/migrations/016_add_message_media.sql
ALTER TABLE messages
ADD COLUMN media_url TEXT,
ADD COLUMN media_type TEXT CHECK (media_type IN ('photo', 'video')),
ADD COLUMN media_thumbnail_url TEXT,
ADD COLUMN bet_id UUID REFERENCES bets(id);

-- Add indexes for performance
CREATE INDEX idx_messages_media ON messages(chat_id, created_at DESC) 
WHERE media_url IS NOT NULL;

CREATE INDEX idx_messages_bet ON messages(chat_id, bet_id) 
WHERE bet_id IS NOT NULL;
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| POST | /storage/v1/object/messages | Binary media | Upload URL | WORKING |
| POST | /rest/v1/message_reactions | Reaction object | Created | PLANNED |
| DELETE | /rest/v1/message_reactions | Message/user ID | Deleted | PLANNED |
| POST | /rest/v1/pick_actions | Action tracking | Tracked | PLANNED |

### State Management
- Upload progress in component state
- Media cache in React Query
- Reactions cached per message
- Pick action state (tailed/faded) in component
- Long press state for action menu

## Testing Performed

### Manual Testing
- [ ] Photo messages send and display correctly
- [ ] Video messages play inline
- [ ] Upload progress accurate
- [ ] Media compression works
- [ ] Pick shares show bet details
- [ ] Tail/fade buttons work once only
- [ ] Reactions display and update
- [ ] Long press shows action menu
- [ ] Copy text works
- [ ] Media expires with messages

### Edge Cases Considered
- Very large media files → Show size warning
- Slow upload connections → Allow cancel
- Multiple simultaneous uploads → Queue them
- Expired media access → Show placeholder
- Reaction limit per message → Max 50 total
- Pick already settled → Disable buttons

## Documentation Updates

- [ ] Media size limits documented
- [ ] Compression settings explained
- [ ] Pick sharing flow documented
- [ ] Reaction system explained
- [ ] Media storage structure documented

## Handoff to Reviewer

### What Was Implemented
[Clear summary of all work completed]

### Files Modified/Created
**Created**:
- `components/messaging/MediaPicker.tsx` - Media selection
- `components/messaging/MediaUploadProgress.tsx` - Upload UI
- `components/messaging/MediaMessageDisplay.tsx` - Media display
- `components/messaging/MessageActionMenu.tsx` - Long press menu
- `services/messaging/mediaMessageService.ts` - Media logic
- `hooks/useMediaMessage.ts` - Media hook
- `hooks/useMessageReactions.ts` - Reactions
- `utils/media/messageCompression.ts` - Compression

**Modified**:
- `components/messaging/MessageInput.tsx` - Media button
- `components/messaging/ChatBubble.tsx` - Media support
- `components/messaging/PickShareCard.tsx` - Tail/fade
- `components/engagement/ReactionPicker.tsx` - Message support
- `services/storage/storageService.ts` - Message paths
- `types/messaging.ts` - Media types

### Key Decisions Made
1. **Reuse reaction UI**: Adapt existing post reaction components
2. **Media limits**: 10MB max, 30s video, 1920x1080 photos
3. **Compression**: 85% JPEG quality, 720p video
4. **Pick actions**: One-time tail/fade per user per pick
5. **Storage path**: `/messages/{chatId}/{messageId}_{timestamp}`

### Deviations from Original Plan
- Removed disappearing photos feature (complexity)
- Simplified to 6 reactions (matching posts)
- No reply-to-message feature (simplified in epic planning)

### Known Issues/Concerns
- Large video compression can be slow
- Media upload can fail on poor connections
- Reaction updates might feel delayed
- Pick share state needs careful handling

### Suggested Review Focus
- Media compression quality settings
- Upload progress accuracy
- Pick share interaction logic
- Reaction performance with many users
- Long press gesture reliability

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
- [ ] Media handling is efficient
- [ ] Pick sharing works correctly
- [ ] Reactions perform well

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

**Duration**: Planned 1.5 days | Actual [Y] days  
**Scope Changes**: [Number of plan updates]  
**Review Cycles**: [Number of review rounds]  
**Files Touched**: 15  
**Lines Added**: ~[Estimate]  
**Lines Removed**: ~[Estimate]

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [APPROVED/IN PROGRESS/BLOCKED]* 