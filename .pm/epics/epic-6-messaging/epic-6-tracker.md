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

---

## Sprint Structure

### Sprint 6.1: Chat List & Navigation (2 hours)
**Goal**: Create WhatsApp-style unified chat list interface with real-time updates  
**Status**: NOT STARTED  
**Key Deliverables**:
- Chat list screen with DMs and groups
- Real-time last message updates
- Search functionality
- Swipe actions (archive/mute)

### Sprint 6.2: Direct Messaging (2.5 hours)
**Goal**: Build complete 1-on-1 messaging with text, media, typing indicators, and read receipts  
**Status**: NOT STARTED  
**Key Deliverables**:
- Individual chat screen
- Message sending with optimistic updates
- Typing indicators and read receipts
- Message expiration

### Sprint 6.3: Group Messaging (2.5 hours)
**Goal**: Implement group chat functionality with member management and @mentions  
**Status**: NOT STARTED  
**Key Deliverables**:
- Group creation flow
- Member management (creator-only admin)
- @mentions with autocomplete
- Group info screen

### Sprint 6.4: Real-time Infrastructure (2 hours)
**Goal**: Implement robust real-time messaging infrastructure with Supabase channels  
**Status**: NOT STARTED  
**Key Deliverables**:
- Centralized subscription manager
- Presence tracking system
- Offline message queue
- Connection state management

### Sprint 6.5: Media & Special Messages (1.5 hours)
**Goal**: Handle media messages and special message types including pick sharing  
**Status**: NOT STARTED  
**Key Deliverables**:
- Photo/video messages with compression
- Pick sharing with tail/fade buttons
- Message reactions (reusing post UI)
- Long press action menu

### Sprint 6.6: Privacy & Safety (1.5 hours)
**Goal**: Implement blocking, privacy settings, and content moderation  
**Status**: NOT STARTED  
**Key Deliverables**:
- Comprehensive blocking in messaging
- Simplified global notification settings
- Message reporting system
- Content filtering

### Sprint 6.7: Production Jobs as Local Scripts (2 hours)
**Goal**: Build all production automation jobs as local TypeScript scripts  
**Status**: NOT STARTED  
**Key Deliverables**:
- Job framework with consistent interface
- Content expiration, bankroll reset, badge calculation
- Game settlement, stats rollup, cleanup jobs
- CLI interface for manual execution
- Demo control capabilities

### Sprint 6.8: Mock Ecosystem & Demo Tools (2.5 hours)
**Goal**: Create living mock ecosystem with personality-driven users and demo tools  
**Status**: NOT STARTED  
**Key Deliverables**:
- 20+ personality-driven mock users
- Activity generation for all features
- Demo scenario orchestrator
- Timeline simulation tools
- Conversation generators

### Sprint 6.9: Edge Function Migration (1 hour)
**Goal**: Migrate all local scripts to Supabase Edge Functions with cron schedules  
**Status**: NOT STARTED  
**Key Deliverables**:
- Edge Function infrastructure
- Cron job configuration
- Manual HTTP triggers for demos
- Deployment automation
- Health monitoring

**Total Estimated Time**: 17 hours (was 14 hours)

---

## Architecture Decisions

### Messaging Architecture
- **Database**: Unified chats table for DMs and groups
- **Real-time**: Supabase channels with presence
- **Storage**: Media in Supabase storage with expiration
- **State**: Zustand for active chat, React Query for messages

### Privacy & Safety
- **Blocking**: Complete message hiding in all contexts
- **Groups**: Blocked users filtered from member lists
- **Notifications**: Simplified to global categories only
- **Moderation**: 3 reports auto-hide pending review

### Automation Strategy
- **Local First**: Scripts for demo control and testing
- **Edge Functions**: Production automation with cron
- **Dual Triggers**: Both cron and manual HTTP
- **Mock Ecosystem**: Personality-driven for realism

---

## Technical Implementation

### Key Components Created
- `ChatListScreen` - Main messaging interface
- `ChatScreen` - Individual chat view
- `RealtimeManager` - Centralized subscriptions
- `MessagingPrivacyService` - Privacy enforcement
- `BaseJob` - Job framework
- `DemoOrchestrator` - Demo control
- `Edge Functions` - Production automation

### Database Schema
```sql
-- Core tables
chats (id, type, name, photo_url, expiration_hours)
messages (id, chat_id, sender_id, content, media_url, expires_at)
chat_members (chat_id, user_id, role, last_read_at)
message_reads (message_id, user_id, read_at)
message_reactions (message_id, user_id, emoji)
message_privacy_settings (user_id, who_can_message, read_receipts_enabled)
job_executions (job_name, success, affected_count, duration_ms)
```

### Real-time Channels
- `chat:{chatId}` - Message updates
- `presence:global` - Online status
- `typing:{chatId}` - Typing indicators
- `group-members:{chatId}` - Member changes

### Edge Functions
- `/content-expiration` - Expire posts/messages
- `/badge-calculation` - Weekly badges
- `/bankroll-reset` - Monday resets
- `/game-settlement` - Bet outcomes
- `/mock-activity` - Demo ecosystem
- `/health-check` - Monitoring

---

## Features Explicitly Out of Scope

These features were removed during planning to reduce complexity:
- Message search functionality
- Reply to specific messages
- Complex group permissions/roles
- Per-chat notification settings
- Message forwarding
- Voice messages
- Location sharing

---

## Risk Mitigation

### Identified Risks & Mitigations
1. **Channel Limits** → Channel pooling and reuse
2. **Message Ordering** → High-precision timestamps
3. **Group Complexity** → Creator-only admin model
4. **Demo Realism** → Personality-driven behaviors
5. **Function Timeouts** → Batch processing

---

## Testing Strategy

### Unit Testing
- Message service functions
- Privacy rule enforcement
- Job execution logic
- Mock user behaviors

### Integration Testing
- Real-time message delivery
- Group member management
- Blocking across features
- Cron job execution

### Manual Testing
- Chat creation flows
- Media upload/display
- Demo scenarios
- Edge Function triggers

---

## Rollout Plan

1. **Messaging Core** (Sprints 6.1-6.4)
   - Deploy basic messaging
   - Test with internal users
   - Monitor performance

2. **Enhanced Features** (Sprints 6.5-6.6)
   - Add media and reactions
   - Enable privacy controls
   - Gather feedback

3. **Automation** (Sprints 6.7-6.9)
   - Test jobs locally
   - Deploy Edge Functions
   - Monitor execution

---

## Success Metrics

- Message delivery < 100ms
- 99.9% delivery success rate
- Zero messages lost
- Job success rate > 99%
- Mock activity feels realistic
- Demo scenarios work smoothly

---

## Dependencies on Other Epics

- **Epic 4**: User profiles and blocking
- **Epic 5**: Bet sharing functionality
- **Epic 3**: Reaction UI components

---

## Open Questions

All major questions have been resolved:
- ✅ Media storage approach (messages/ prefix)
- ✅ Group admin model (creator-only)
- ✅ Notification settings (global only)
- ✅ Automation approach (local scripts → Edge Functions)

---

## Sprint Status Summary

| Sprint | Status | Start Date | End Date | Reviewer | Review Status |
|--------|--------|------------|----------|----------|---------------|
| 6.1 | NOT STARTED | - | - | - | - |
| 6.2 | NOT STARTED | - | - | - | - |
| 6.3 | NOT STARTED | - | - | - | - |
| 6.4 | NOT STARTED | - | - | - | - |
| 6.5 | NOT STARTED | - | - | - | - |
| 6.6 | NOT STARTED | - | - | - | - |
| 6.7 | NOT STARTED | - | - | - | - |
| 6.8 | NOT STARTED | - | - | - | - |
| 6.9 | NOT STARTED | - | - | - | - |

---

## Notes & Learnings

- Simplified admin model reduces complexity significantly
- Local scripts provide excellent demo control
- Personality-driven mock users create realistic ecosystem
- Edge Functions with manual triggers best of both worlds

---

*Epic Tracker Last Updated: [Current Date]* 