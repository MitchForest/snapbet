# Epic 6: Messaging System & Automation - Detailed Roadmap

## Epic Overview

**Epic Goal**: Build a complete real-time messaging system with ephemeral messages, group chats, and comprehensive automation through cron jobs for all platform features.

**Duration**: Day 5 of Development (12-14 hours)
**Dependencies**: Epic 5 (Betting & Tail/Fade) must be complete
**Outcome**: Full messaging platform with automated background jobs

---

## Sprint Breakdown

### Sprint 6.1: Chat List & Navigation (2 hours)

**Goal**: Create WhatsApp-style unified chat list interface

**Features**:

#### Chat List Screen
- Unified list showing DMs and groups
- Last message preview (truncated to 2 lines)
- Unread count badges
- Online status indicators (green dot)
- Message status icons (sent/delivered/read)
- Search bar at top
- Pull-to-refresh

#### Chat List Items
```
┌─────────────────────────────────┐
│ 🟢 NBA Degens 🏀          • 2m │
│ Mike: "Lakers -5.5 lock it" 🔥  │
│ 📎 💬 12 unread                 │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ⚫ @sarah_wins            • 5m │
│ You: "Tailing that pick!" ✓✓   │
│                                 │
└─────────────────────────────────┘
```

#### List Organization
- Sort by last message time
- Pin up to 3 chats
- Archive old conversations
- Swipe actions:
  - Left: Archive
  - Right: Mute
- Long press: Delete chat

#### Empty State
- "No messages yet"
- "Start a conversation" CTA
- Suggested users to message

**Technical Tasks**:
- Create ChatListScreen component
- Build ChatListItem with swipe actions
- Implement real-time last message updates
- Add unread count tracking
- Create search functionality
- Add pull-to-refresh
- Implement archive feature

**Acceptance Criteria**:
- [ ] Chat list loads all conversations
- [ ] Shows correct last message
- [ ] Unread counts accurate
- [ ] Online status shows
- [ ] Swipe actions work
- [ ] Search filters results
- [ ] Real-time updates work

---

### Sprint 6.2: Direct Messaging (2.5 hours)

**Goal**: Build complete 1-on-1 messaging with expiration

**Features**:

#### Chat Screen UI
```
┌─────────────────────────────────┐
│ ← @mikebets              🟢 ⚙️  │
├─────────────────────────────────┤
│ Yesterday 2:45 PM               │
│ ┌─────────────────────────────┐ │
│ │ Check out this pick:        │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Lakers -5.5 (-110)      │ │ │
│ │ │ $50 to win $45.45       │ │ │
│ │ │ [Tail] [Fade]           │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Tailing! Let's ride 🚀    ✓│ │
│ │ Expires in 23h            ⏱│ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 💬 Type a message...        📸  │
└─────────────────────────────────┘
```

#### Message Types
- **Text**: Up to 1000 characters
- **Media**: Photos/videos with compression
- **Pick shares**: Bet cards with tail/fade
- **Disappearing photos**: View once

#### Expiration Options
- Per-conversation setting
- Options: 1 hour, 24 hours, 1 week
- Visual countdown on messages
- "Message expired" placeholder

#### Message Features
- Read receipts (✓✓)
- Typing indicators
- Reply to message
- Reactions (long press)
- Delete for me
- Report message

**Technical Tasks**:
- Create ChatScreen component
- Build message bubble components
- Implement message sending flow
- Add media message support
- Create pick share cards
- Add typing indicators
- Implement read receipts

**State Management**:
```typescript
// Zustand store for active chat
interface ChatState {
  activeChat: string | null;
  messages: Record<string, Message[]>;
  drafts: Record<string, string>;
  isTyping: Record<string, boolean>;
  
  sendMessage: (chatId: string, content: MessageContent) => void;
  setTyping: (chatId: string, isTyping: boolean) => void;
  markAsRead: (chatId: string) => void;
}
```

**Acceptance Criteria**:
- [ ] Can send/receive text messages
- [ ] Media messages work
- [ ] Pick shares show with buttons
- [ ] Expiration countdown visible
- [ ] Read receipts update
- [ ] Typing indicators show
- [ ] Messages expire correctly

---

### Sprint 6.3: Group Messaging (2.5 hours)

**Goal**: Implement group chat functionality with admin controls

**Features**:

#### Group Creation Flow
1. "New Group" button
2. Select members (search/select UI)
3. Set group name and photo
4. Choose expiration setting
5. Create group

#### Group Features
- 2-50 members max
- Admin controls:
  - Add/remove members
  - Change group info
  - Promote other admins
  - Delete group
- Member list with roles
- @mentions with autocomplete
- Join via invite link

#### Group-Specific UI
```
┌─────────────────────────────────┐
│ ← NBA Degens 🏀          👥 12 │
├─────────────────────────────────┤
│ @mike added @sarah_wins         │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ @mike: Who's on Lakers? 🤔  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ @sarah: I got them -5.5 💪  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ @you: Same here! LFG 🔥     │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ [@] Type a message...       📸  │
└─────────────────────────────────┘
```

#### Group Info Screen
- Group name and photo (editable by admin)
- Member list with admin badges
- Add members button
- Group settings
- Leave group / Delete group

**Technical Tasks**:
- Create group creation flow
- Build group chat UI
- Implement @mentions
- Add member management
- Create invite link system
- Build group info screen
- Handle admin permissions

**Database Schema**:
```sql
-- Group chats table
CREATE TABLE group_chats (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  photo_url TEXT,
  created_by UUID REFERENCES users(id),
  expiration_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Group members table
CREATE TABLE group_members (
  group_id UUID REFERENCES group_chats(id),
  user_id UUID REFERENCES users(id),
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);
```

**Acceptance Criteria**:
- [ ] Can create groups
- [ ] Add/remove members works
- [ ] @mentions trigger notifications
- [ ] Admin controls function
- [ ] Invite links work
- [ ] Group info editable
- [ ] Member limit enforced

---

### Sprint 6.4: Real-time Infrastructure (2 hours)

**Goal**: Implement robust real-time messaging with Supabase

**Features**:

#### Realtime Channels
- One channel per active chat
- Presence channel for online status
- Broadcast for typing indicators
- Efficient subscription management

#### Message Delivery
- Optimistic sending
- Delivery confirmation
- Retry failed messages
- Queue for offline sending
- Background sync

#### Presence System
- Track online/offline status
- Last seen timestamps
- "Active now" in chat
- Typing indicators

**Technical Implementation**:
```typescript
// Realtime subscription manager
class ChatRealtimeManager {
  subscribeToChat(chatId: string) {
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        // Add message to store
        this.handleNewMessage(payload.new);
      })
      .on('presence', { event: 'sync' }, () => {
        // Update online status
        this.updatePresence(channel.presenceState());
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        // Show typing indicator
        this.handleTyping(payload);
      })
      .subscribe();
  }
}
```

#### Offline Queue
- Store failed messages in MMKV
- Retry on reconnection
- Exponential backoff
- Clear on success

**Technical Tasks**:
- Set up Supabase channels
- Implement subscription manager
- Add presence tracking
- Build typing indicators
- Create offline queue
- Add retry logic
- Optimize subscriptions

**Acceptance Criteria**:
- [ ] Messages deliver instantly
- [ ] Presence updates work
- [ ] Typing indicators show
- [ ] Offline messages queue
- [ ] Reconnection works
- [ ] No duplicate messages
- [ ] Subscriptions clean up

---

### Sprint 6.5: Media & Special Messages (1.5 hours)

**Goal**: Handle media messages and special message types

**Features**:

#### Media Messages
- Photo/video selection
- Automatic compression
- Progress indicators
- Thumbnail generation
- Expiration with message

#### Disappearing Photos
- Special camera mode
- "Photo waiting" notification
- Full-screen viewer
- Auto-disappear after view
- No screenshots warning

#### Pick Sharing
- Share from bet slip
- Full bet card in chat
- Active tail/fade buttons
- Links to original pick
- Shows outcome when settled

#### Message Actions
- Long press menu:
  - Copy (text only)
  - Reply
  - React (6 emojis)
  - Delete for me
  - Report
  - Info

**Technical Tasks**:
- Implement media picker
- Add compression pipeline
- Create disappearing photo flow
- Build pick share cards
- Add message action menu
- Create reaction picker
- Handle media expiration

**Media Limits**:
- Max file size: 10MB
- Images: 1920x1080
- Videos: 720p, 30 seconds
- Compression: 85% quality

**Acceptance Criteria**:
- [ ] Can send photos/videos
- [ ] Compression works
- [ ] Disappearing photos function
- [ ] Pick shares interactive
- [ ] Long press menu works
- [ ] Reactions display
- [ ] Media expires properly

---

### Sprint 6.6: Privacy & Safety (1.5 hours)

**Goal**: Implement blocking, reporting, and privacy features

**Features**:

#### Blocking System
- Block from profile or chat
- Blocked users list in settings
- Can't send/receive messages
- Hidden in groups (both ways)
- "User has blocked you" error

#### Privacy Settings
- Who can message me:
  - Everyone (default)
  - Only people I follow
  - Nobody
- Read receipts toggle
- Online status visibility
- Typing indicators toggle

#### Content Moderation
- Client-side profanity filter
- Report message option
- 3 reports = auto-hide
- Admin review queue
- User warnings system

#### Group Privacy
- Blocked users can't see each other's messages in groups
- Leave group silently option
- Hide from member list

**Technical Tasks**:
- Implement blocking logic
- Create privacy settings UI
- Add content filtering
- Build report system
- Create moderation queue
- Handle group blocking
- Add privacy checks

**Database Updates**:
```sql
-- Update messages query to exclude blocked
CREATE OR REPLACE VIEW visible_messages AS
SELECT m.* FROM messages m
WHERE NOT EXISTS (
  SELECT 1 FROM blocked_users b
  WHERE (b.blocker_id = current_user_id() AND b.blocked_id = m.sender_id)
  OR (b.blocker_id = m.sender_id AND b.blocked_id = current_user_id())
);
```

**Acceptance Criteria**:
- [ ] Blocking prevents all contact
- [ ] Group blocking works
- [ ] Privacy settings enforced
- [ ] Reports tracked
- [ ] Content filter works
- [ ] Moderation queue functional

---

### Sprint 6.7: Message Expiration System (1 hour)

**Goal**: Implement message expiration and cleanup

**Features**:

#### Expiration Logic
- Countdown from send time
- Visual indicators (clock icon)
- "Message expired" placeholder
- Soft delete → hard delete

#### Cleanup Process
- Hourly cron job
- Soft delete expired messages
- Hard delete after 24 hours
- Remove associated media
- Update chat list

#### User Experience
- See time remaining
- Warning before expiry
- Can't interact with expired
- Chat clears when all expired

**Technical Tasks**:
- Add expiration timestamps
- Create countdown displays
- Build cleanup cron job
- Handle soft/hard delete
- Update UI for expired
- Clean up media files
- Test edge cases

**Cron Job**:
```sql
-- Message expiration function
CREATE OR REPLACE FUNCTION expire_messages()
RETURNS void AS $$
BEGIN
  -- Soft delete expired messages
  UPDATE messages 
  SET deleted_at = NOW()
  WHERE expires_at < NOW() 
  AND deleted_at IS NULL;
  
  -- Hard delete old soft-deleted
  DELETE FROM messages
  WHERE deleted_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
```

**Acceptance Criteria**:
- [ ] Messages expire on time
- [ ] Visual countdown works
- [ ] Expired messages handled
- [ ] Media cleaned up
- [ ] Cron job runs hourly
- [ ] No data leaks

---

### Sprint 6.8: Cron Jobs & Automation (2.5 hours)

**Goal**: Set up all platform automation with Supabase cron jobs

**Features**:

#### Content Expiration Jobs

**1. Post/Story Expiration** (hourly)
```sql
-- Expire posts and stories
SELECT cron.schedule(
  'expire-content',
  '0 * * * *', -- Every hour
  $$
  UPDATE posts SET deleted_at = NOW() 
  WHERE expires_at < NOW() AND deleted_at IS NULL;
  
  DELETE FROM posts 
  WHERE deleted_at < NOW() - INTERVAL '7 days';
  $$
);
```

**2. Message Expiration** (hourly)
- Expire based on chat settings
- Clean up media
- Update chat list

#### Financial Jobs

**3. Weekly Bankroll Reset** (Monday midnight)
```sql
SELECT cron.schedule(
  'reset-bankrolls',
  '0 0 * * 1', -- Monday midnight
  $$
  UPDATE bankrolls 
  SET balance = 1000 + (referral_count * 100),
      weekly_reset_at = NOW();
  $$
);
```

**4. Settlement Processing** (every 30 minutes)
```sql
SELECT cron.schedule(
  'settle-bets',
  '*/30 * * * *',
  $$
  SELECT settle_completed_games();
  $$
);
```

#### Stats & Badges Jobs

**5. Badge Calculations** (hourly)
```sql
SELECT cron.schedule(
  'calculate-badges',
  '0 * * * *',
  $$
  SELECT calculate_weekly_badges();
  SELECT update_effect_access();
  $$
);
```

**6. Stats Rollup** (hourly)
- Calculate ROI, win rates
- Update streaks
- Cache expensive queries

#### Activity Jobs

**7. Mock User Activity** (every 15 minutes)
```sql
SELECT cron.schedule(
  'mock-activity',
  '*/15 * * * *',
  $$
  SELECT generate_mock_bets();
  SELECT generate_mock_posts();
  SELECT generate_mock_interactions();
  $$
);
```

#### Maintenance Jobs

**8. Daily Cleanup** (3 AM)
```sql
SELECT cron.schedule(
  'daily-cleanup',
  '0 3 * * *',
  $$
  DELETE FROM orphaned_media;
  VACUUM ANALYZE;
  $$
);
```

**9. Health Monitoring** (every 5 minutes)
- Check job status
- Alert on failures
- Track performance

**Technical Tasks**:
- Install pg_cron extension
- Create all cron job functions
- Set up monitoring
- Add error handling
- Create job dashboard
- Test all schedules
- Document jobs

**Monitoring Dashboard**:
```sql
-- Job monitoring view
CREATE VIEW cron_job_status AS
SELECT 
  jobname,
  schedule,
  last_run,
  next_run,
  status,
  error_count
FROM cron.job_run_details
ORDER BY last_run DESC;
```

**Acceptance Criteria**:
- [ ] All jobs scheduled correctly
- [ ] Jobs run on schedule
- [ ] Error handling works
- [ ] Monitoring dashboard live
- [ ] Performance acceptable
- [ ] No data inconsistencies

---

## Technical Architecture

### Database Schema
```sql
-- Chats table (unified DMs and groups)
CREATE TABLE chats (
  id UUID PRIMARY KEY,
  type TEXT CHECK (type IN ('dm', 'group')),
  name TEXT, -- NULL for DMs
  photo_url TEXT,
  expiration_hours INTEGER DEFAULT 24,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  chat_id UUID REFERENCES chats(id),
  sender_id UUID REFERENCES users(id),
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  bet_id UUID REFERENCES bets(id), -- For pick shares
  reply_to_id UUID REFERENCES messages(id),
  expires_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP, -- Soft delete
  created_at TIMESTAMP DEFAULT NOW()
);

-- Message reactions
CREATE TABLE message_reactions (
  message_id UUID REFERENCES messages(id),
  user_id UUID REFERENCES users(id),
  emoji TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

-- Read receipts
CREATE TABLE message_reads (
  message_id UUID REFERENCES messages(id),
  user_id UUID REFERENCES users(id),
  read_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

-- Chat members (for both DMs and groups)
CREATE TABLE chat_members (
  chat_id UUID REFERENCES chats(id),
  user_id UUID REFERENCES users(id),
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  last_read_at TIMESTAMP,
  muted_until TIMESTAMP,
  PRIMARY KEY (chat_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_expires ON messages(expires_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_chat_members_user ON chat_members(user_id);
```

### State Management
```typescript
interface MessagingState {
  // Active chat
  activeChat: string | null;
  
  // Messages cache
  messages: Record<string, Message[]>;
  
  // UI state
  drafts: Record<string, string>;
  typingUsers: Record<string, string[]>;
  unreadCounts: Record<string, number>;
  
  // Realtime
  subscriptions: Map<string, RealtimeChannel>;
  
  // Actions
  openChat: (chatId: string) => void;
  sendMessage: (content: MessageContent) => Promise<void>;
  markAsRead: (chatId: string) => void;
  setTyping: (isTyping: boolean) => void;
}

// React Query keys
const messageKeys = {
  all: ['messages'] as const,
  chats: () => [...messageKeys.all, 'chats'] as const,
  chat: (id: string) => [...messageKeys.all, 'chat', id] as const,
  messages: (chatId: string) => [...messageKeys.all, 'messages', chatId] as const,
};
```

---

## Integration Points

### With Epic 4 (Feed & Social)
- Message button on profiles
- Share posts to DMs
- User blocking affects messaging

### With Epic 5 (Betting)
- Share picks in messages
- Tail/fade from chat
- Group betting discussions

### With All Epics (Cron Jobs)
- Content expiration
- Stats calculations
- Badge updates
- Cleanup routines

---

## Testing Checklist

### Messaging Core
- [ ] Chat list updates real-time
- [ ] Messages send/receive instantly
- [ ] Media messages work
- [ ] Expiration functions correctly
- [ ] Read receipts accurate

### Groups
- [ ] Can create/manage groups
- [ ] Admin controls work
- [ ] @mentions function
- [ ] Member limits enforced

### Privacy & Safety
- [ ] Blocking works completely
- [ ] Privacy settings enforced
- [ ] Reports tracked
- [ ] Moderation functional

### Automation
- [ ] All cron jobs run on schedule
- [ ] No data inconsistencies
- [ ] Performance acceptable
- [ ] Monitoring works

---

## Success Metrics

- Message delivery < 100ms
- 99.9% delivery success rate
- Zero messages lost
- Cron job success rate > 99%
- Message search < 500ms
- UI stays at 60 FPS

---

## Notes & Considerations

1. **Real-time First**: Every feature should feel instant
2. **Privacy Critical**: Blocking must be bulletproof
3. **Scale Ready**: Design for millions of messages
4. **Automation Reliable**: Cron jobs must not fail
5. **Expiration Sacred**: Never recover expired content
6. **Performance Key**: Pagination and caching essential

---

## Next Steps (Epic 7)
- AI-powered features
- Smart notifications
- Friend discovery
- Pattern recognition
- Enhanced moderation