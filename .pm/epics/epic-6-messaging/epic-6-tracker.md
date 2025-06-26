# Epic 6: Messaging System & Automation Tracker

## Epic Overview

**Status**: NOT STARTED  
**Start Date**: [TBD]  
**Target End Date**: [TBD]  
**Actual End Date**: [TBD]

**Epic Goal**: Build a complete real-time messaging system with ephemeral messages, group chats, and comprehensive automation through Edge Functions for all platform features including a living mock ecosystem.

**User Stories Addressed**:
- Story 4: The Isolation Problem - Connect with others on betting journey through DMs and group chats
- Story 2: The Permanent Record Problem - Messages expire, maintaining ephemeral nature
- All Stories: Mock ecosystem provides immediate community feel for new users

**PRD Reference**: Messaging system, ephemeral content, automation requirements

## Sprint Breakdown

| Sprint # | Sprint Name | Status | Start Date | End Date | Key Deliverable |
|----------|-------------|--------|------------|----------|-----------------|
| 06.01 | Chat List & Navigation | NOT STARTED | - | - | WhatsApp-style chat list with real-time updates |
| 06.02 | Direct Messaging | NOT STARTED | - | - | 1-on-1 messaging with expiration, typing indicators, read receipts |
| 06.03 | Group Messaging (Simplified) | NOT STARTED | - | - | Group chats with basic creator controls |
| 06.04 | Real-time Infrastructure | NOT STARTED | - | - | Supabase Realtime channels |
| 06.05 | Media & Special Messages | NOT STARTED | - | - | Photos, videos, pick shares, reactions (reusing post UI) |
| 06.06 | Privacy & Safety (Simplified) | NOT STARTED | - | - | Block user, leave group, basic filtering |
| 06.07 | Production Cron Jobs | NOT STARTED | - | - | All real app automation |
| 06.08 | Mock Ecosystem Engine | NOT STARTED | - | - | Living demo environment |

**Statuses**: NOT STARTED | IN PROGRESS | IN REVIEW | APPROVED | BLOCKED

## Architecture & Design Decisions

### High-Level Architecture for This Epic

**Messaging Architecture**:
```
Components:
├── ChatListScreen (main messaging tab)
├── ChatScreen (individual conversation)
├── MessageComponents/
│   ├── ChatBubble (text/media/pick)
│   ├── MessageInput
│   ├── TypingIndicator
│   └── MessageReactions (adapted from post reactions)
└── GroupComponents/
    ├── GroupInfo
    └── MemberList (simplified - no roles)

Services:
├── messageService (send/receive)
├── chatService (create/manage chats)
├── realtimeService (subscriptions)
└── expirationService (cleanup)

Edge Functions:
├── Production Cron Jobs/
│   ├── cleanup-expired
│   ├── calculate-badges
│   ├── reset-bankrolls
│   ├── settle-bets
│   └── process-notifications
└── Mock Ecosystem/
    ├── mock-user-activity
    ├── mock-betting
    ├── mock-social
    ├── mock-messages
    └── mock-games
```

### Key Design Decisions

1. **Message Expiration Strategy**: 
   - Alternatives considered: Client-side deletion, server-side immediate deletion
   - Rationale: Server-side soft delete → hard delete provides recovery window and better UX
   - Trade-offs: More complex but safer and more user-friendly

2. **Real-time Architecture**:
   - Alternatives considered: Polling, Server-Sent Events
   - Rationale: Supabase Realtime provides WebSocket efficiency with built-in auth
   - Trade-offs: Requires subscription management but provides instant updates

3. **Edge Functions vs pg_cron**:
   - Alternatives considered: pg_cron for simple SQL tasks
   - Rationale: Edge Functions provide full programming capabilities needed for complex logic
   - Trade-offs: Slightly more setup but much more flexible and debuggable

4. **Mock User System**:
   - Alternatives considered: Simple random data, static fixtures
   - Rationale: Personality-driven behavior creates believable ecosystem
   - Trade-offs: More complex but provides authentic experience

5. **Simplified Group Admin**:
   - Alternatives considered: Full role-based permissions
   - Rationale: MVP only needs creator controls, avoids complexity
   - Trade-offs: Less flexible but much simpler to implement and use

6. **Reuse Reaction UI**:
   - Alternatives considered: Build new reaction system
   - Rationale: Consistency with post reactions, faster development
   - Trade-offs: May need minor adaptations for message context

### Dependencies
**External Dependencies**:
- Supabase Realtime - WebSocket connections
- Deno runtime - Edge Functions
- expo-image-picker - Media messages
- date-fns - Message timestamps

**Internal Dependencies**:
- Requires: Auth system, User profiles, Storage setup, Post reaction components
- Provides: Messaging for future features, automation infrastructure

## Implementation Notes

### File Structure for Epic
```
app/(drawer)/(tabs)/
└── messages.tsx          # Chat list screen

app/(drawer)/chat/
└── [id].tsx             # Individual chat screen

components/messaging/
├── ChatListItem.tsx
├── ChatBubble.tsx
├── MessageInput.tsx
├── TypingIndicator.tsx
├── PickShareCard.tsx
├── GroupHeader.tsx
└── MessageReactions.tsx  # Adapted from post reactions

services/messaging/
├── chatService.ts
├── messageService.ts
├── realtimeService.ts
└── expirationService.ts

supabase/functions/
├── cleanup-expired/
├── calculate-badges/
├── reset-bankrolls/
├── settle-bets/
├── mock-user-activity/
├── mock-betting/
├── mock-social/
└── _shared/
    ├── supabase-client.ts
    └── utils.ts

hooks/
├── useChat.ts
├── useMessages.ts
├── useTypingIndicator.ts
└── useMessageReactions.ts
```

### API Endpoints Added
| Method | Path | Purpose | Sprint |
|--------|------|---------|--------|
| POST | /functions/v1/cleanup-expired | Clean expired content | 06.07 |
| POST | /functions/v1/calculate-badges | Update user badges | 06.07 |
| POST | /functions/v1/reset-bankrolls | Weekly bankroll reset | 06.07 |
| POST | /functions/v1/mock-user-activity | Simulate user actions | 06.08 |

### Data Model Changes
```sql
-- Already exist from initial schema
-- chats, messages, chat_members, message_reads
-- No new tables needed

-- New indexes for performance
CREATE INDEX idx_messages_expiration ON messages(expires_at) 
  WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at DESC);

-- Message reactions will reuse similar structure to post reactions
CREATE TABLE message_reactions (
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  emoji TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);
```

### Key Functions/Components Created
- `ChatService` - Chat creation and management - Sprint 06.01
- `MessageService` - Message sending/receiving with read receipts - Sprint 06.02
- `TypingIndicatorService` - Real-time typing status - Sprint 06.02
- `RealtimeManager` - WebSocket subscription handling - Sprint 06.04
- `MessageReactions` - Adapted from post reactions - Sprint 06.05
- `ExpirationService` - Message cleanup logic - Sprint 06.07
- `MockUserEngine` - Personality-driven behavior - Sprint 06.08

## Sprint Execution Log

### Sprint 06.01: Chat List & Navigation
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

### Sprint 06.02: Direct Messaging
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Features**: 
- Text messaging with delivery status
- Typing indicators
- Read receipts (double checkmarks)
- Message expiration options
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

### Sprint 06.03: Group Messaging (Simplified)
**Status**: NOT STARTED
**Summary**: [To be completed]
**Simplifications Made**:
- Only creator can add/remove members
- No role system or permissions
- No admin promotion features
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

### Sprint 06.04: Real-time Infrastructure
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

### Sprint 06.05: Media & Special Messages
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Features**:
- Photo/video messages
- Pick share cards
- Message reactions (reusing post reaction UI)
- Long press to delete (no reply feature)
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

### Sprint 06.06: Privacy & Safety (Simplified)
**Status**: NOT STARTED
**Summary**: [To be completed]
**Simplifications Made**:
- Block user affects all features (no granular control)
- No message reporting (just user blocking)
- Basic profanity filter only
- Global notification on/off (no per-chat settings)
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

### Sprint 06.07: Production Cron Jobs
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

### Sprint 06.08: Mock Ecosystem Engine
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

## Testing & Quality

### Testing Approach
- Unit tests for message services
- Integration tests for real-time features (typing, read receipts)
- E2E tests for full messaging flows
- Manual testing of expiration timers
- Load testing for mock ecosystem
- Test reaction UI adaptation from posts

### Known Issues
| Issue | Severity | Sprint | Status | Resolution |
|-------|----------|--------|--------|------------|
| [To be populated] | - | - | - | - |

## Features Explicitly Removed/Simplified

### Removed Features
1. **Message Search** - Not needed for ephemeral content
2. **Reply to Message** - Adds UI complexity with minimal benefit
3. **Message Info/Details View** - Not essential for MVP
4. **Complex Group Permissions** - Simplified to creator-only controls
5. **Per-Chat Notification Settings** - Global on/off only

### Simplified Features
1. **Group Admin** - Only creator has controls, no roles
2. **Privacy Settings** - Just block user, no granular controls
3. **Notification Preferences** - Global message notifications on/off
4. **Message Reactions** - Reuse existing post reaction components

## Refactoring Completed

### Code Improvements
- [To be populated as sprints complete]

### Performance Optimizations
- [To be populated as sprints complete]

## Learnings & Gotchas

### What Worked Well
- [To be populated]

### Challenges Faced
- [To be populated]

### Gotchas for Future Development
- **Edge Function Cold Starts**: First run after idle period takes ~100-300ms
- **Realtime Subscriptions**: Must clean up on unmount to prevent memory leaks
- **Message Ordering**: Use created_at with high precision for proper ordering
- **Typing Indicators**: Need debouncing to prevent spam
- **Read Receipts**: Batch updates to reduce database writes

## Migration from Local Scripts

### Scripts Being Replaced
1. **add-games.ts** → `mock-games` Edge Function
2. **settle-bets.ts** → `settle-bets` Edge Function  
3. **update-badges.ts** → `calculate-badges` Edge Function
4. **generate-activity.ts** → `mock-user-activity` Edge Function
5. **seed-mock-data.ts** → Multiple mock Edge Functions

### Local Development Strategy
All Edge Functions can be triggered locally:

```bash
# Serve functions locally
supabase functions serve

# Trigger manually via HTTP
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/cleanup-expired' \
  --header 'Authorization: Bearer [anon-key]'

# Or create npm scripts for convenience
"scripts": {
  "cron:cleanup": "supabase functions invoke cleanup-expired --local",
  "cron:badges": "supabase functions invoke calculate-badges --local",
  "mock:activity": "supabase functions invoke mock-user-activity --local"
}
```

### Production Deployment
```bash
# Deploy all functions
supabase functions deploy

# Set up cron schedules via Supabase Dashboard
# Or use Management API for programmatic setup
```

## Build Testing & Verification

### Epic-End Build Process (MANDATORY)

Before marking an epic as complete, the following build verification MUST be performed:

1. **Clean all caches:**
   ```bash
   rm -rf .expo node_modules/.cache .tamagui ios/build android/build
   ```

2. **Force clean prebuild for both platforms:**
   ```bash
   bun expo prebuild --platform ios --clean
   bun expo prebuild --platform android --clean
   ```

3. **Run full quality checks:**
   ```bash
   bun run lint      # MUST return 0 errors, 0 warnings
   bun run typecheck # MUST return 0 errors
   ```

4. **Test builds on both platforms:**
   ```bash
   # iOS
   bun expo run:ios
   
   # Android
   bun expo run:android
   ```

5. **Verification checklist:**
   - [ ] App launches without crashes on iOS
   - [ ] App launches without crashes on Android
   - [ ] Messaging works on both platforms
   - [ ] Real-time updates function properly
   - [ ] Typing indicators work
   - [ ] Read receipts display correctly
   - [ ] Message reactions work (adapted from posts)
   - [ ] Edge Functions deploy successfully
   - [ ] Cron jobs execute on schedule
   - [ ] Mock ecosystem generates realistic activity
   - [ ] No console errors during runtime
   - [ ] Screenshots taken of working features

### Build Issues Resolution
If any build issues are encountered:
1. Create a fix-build sprint immediately
2. Document all errors and resolutions
3. Update dependencies if needed
4. Re-run the entire verification process

**NO EPIC CAN BE MARKED COMPLETE WITHOUT SUCCESSFUL BUILDS ON BOTH PLATFORMS**

## Epic Completion Checklist

- [ ] All planned sprints completed and approved
- [ ] Messaging system fully functional with typing and read receipts
- [ ] Message reactions working (adapted from post reactions)
- [ ] Simplified group management implemented
- [ ] Production cron jobs deployed and tested
- [ ] Mock ecosystem generating realistic activity
- [ ] Local scripts migrated to Edge Functions
- [ ] Real-time features working reliably
- [ ] Message expiration functioning correctly
- [ ] Basic privacy features implemented
- [ ] No critical bugs remaining
- [ ] Performance acceptable
- [ ] Integration with other epics tested
- [ ] Epic summary added to project tracker

## Epic Summary for Project Tracker

**[To be completed at epic end]**

**Delivered Features**:
- [Feature 1 with brief description]
- [Feature 2 with brief description]

**Key Architectural Decisions**:
- [Decision 1 - impact on future development]

**Critical Learnings**:
- [Learning that affects future epics]

**Technical Debt Created**:
- [Any shortcuts taken that need future attention]

---

*Epic Started: [Date]*  
*Epic Completed: [Date]*  
*Total Duration: [X days/weeks]* 