# Epic 4: Feed & Social Engagement Tracker

## Epic Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**Target End Date**: TBD  
**Actual End Date**: TBD

**Epic Goal**: Build the complete social layer of SnapBet including the feed, user profiles, following system with private account support, search/discovery, and all social interactions that make betting a shared experience.

**User Stories Addressed**:
- Story 1: The Shared Experience Problem - Feed and social features for pick sharing
- Story 4: The Isolation Problem - Connect with others through following, engagement, and discovery
- Story 5: The Missing My People Problem - Discovery features to find like-minded bettors

**PRD Reference**: Core social features including feed, profiles, following, discovery, and engagement

## Sprint Breakdown

| Sprint # | Sprint Name | Status | Start Date | End Date | Key Deliverable |
|----------|-------------|--------|------------|----------|-----------------|
| 04.01 | Feed Infrastructure | NOT STARTED | - | - | Following-only feed with FlashList |
| 04.02 | Search & Discovery | NOT STARTED | - | - | User search and discovery sections |
| 04.03 | Following System | NOT STARTED | - | - | Optimistic follow/unfollow |
| 04.04 | Privacy & Follow Requests | NOT STARTED | - | - | Private accounts with requests |
| 04.05 | Engagement Backend | NOT STARTED | - | - | Comments, reactions, tail/fade |
| 04.06 | Story Viewer | NOT STARTED | - | - | Full-screen story experience |
| 04.07 | Content Moderation | NOT STARTED | - | - | Reporting and blocking |
| 04.08 | Referral Rewards | NOT STARTED | - | - | $100 weekly bonus implementation |
| 04.09 | Performance & Polish | NOT STARTED | - | - | 60 FPS optimization |
| 04.10 | Performance Analytics | NOT STARTED | - | - | Sport/bet type analytics |

**Total Duration**: ~13.5-14.5 hours (10 sprints)

**Statuses**: NOT STARTED | IN PROGRESS | IN REVIEW | APPROVED | BLOCKED

## Architecture & Design Decisions

### High-Level Architecture for This Epic

The social layer consists of:
1. **Feed System**: FlashList-based feed showing posts from followed users with real-time updates
2. **Discovery System**: Search and curated discovery sections for finding new users
3. **Following System**: Public/private accounts with follow requests and mutual follow detection
4. **Engagement System**: Comments, reactions, and tail/fade interactions on posts
5. **Moderation System**: User blocking and content reporting with auto-hide logic
6. **Story System**: Full-screen story viewer with view tracking

### Key Design Decisions

1. **FlashList over FlatList**: Better performance for social feeds
   - Alternatives considered: FlatList, ScrollView, VirtualizedList
   - Rationale: FlashList provides better memory management and smoother scrolling
   - Trade-offs: Slightly more complex API but worth it for performance

2. **Following-only feed (no algorithm)**: Simpler initial implementation
   - Alternatives considered: Algorithmic feed from day one
   - Rationale: Get core social features working first
   - Trade-offs: May feel empty for new users, but discovery tab compensates

3. **Private accounts with follow requests**: Required for assignment
   - Alternatives considered: Public-only accounts initially
   - Rationale: Privacy is a core requirement from the assignment
   - Trade-offs: More complex UX but necessary for user trust

4. **$100 permanent weekly bonus per referral**: Strong growth incentive
   - Alternatives considered: One-time bonus, smaller amount
   - Rationale: Permanent bonus creates ongoing value for referrers
   - Trade-offs: Higher cost but drives sustained growth

5. **Tail/fade UI only (no betting)**: Separation of concerns
   - Alternatives considered: Full betting in this epic
   - Rationale: Keep social features separate from betting logic
   - Trade-offs: Some features incomplete until Epic 5

6. **Complete performance analytics**: Finish Epic 8 features
   - Alternatives considered: Defer to separate epic
   - Rationale: Natural fit with profile enhancements
   - Trade-offs: Slightly longer epic but more complete feature set

### Dependencies

**External Dependencies**:
- @shopify/flash-list: ^1.6.0 - High-performance list component
- react-native-mmkv: (already installed) - For search history storage

**Internal Dependencies**:
- Requires: Epic 3 complete (PostCard, StoryBar, engagement UI components)
- Requires: Epic 2 auth system and user profiles
- Provides: Social graph for Epic 5 (betting with friends)
- Provides: User connections for Epic 7 (messaging)

## Implementation Notes

### File Structure for Epic
```
app/
├── (drawer)/
│   ├── (tabs)/
│   │   ├── index.tsx          # Main feed (modify)
│   │   └── search.tsx         # Search/Discovery (create)
│   ├── profile/
│   │   └── [username].tsx     # Other profiles (enhance)
│   ├── followers.tsx          # Followers list (enhance)
│   ├── following.tsx          # Following list (enhance)
│   ├── follow-requests.tsx    # New: Follow requests
│   └── story/
│       └── [id].tsx           # New: Story viewer
├── settings/
│   ├── privacy.tsx            # Privacy settings (connect)
│   └── blocked.tsx            # New: Blocked users

hooks/
├── useFeed.ts                 # Modify for following
├── useSearch.ts               # New: Search logic
├── useFollowRequests.ts       # New: Follow requests
└── useStoryViewer.ts          # New: Story viewer

services/
├── social/
│   ├── followService.ts       # New: Following logic
│   ├── blockService.ts        # New: Blocking logic
│   └── reportService.ts       # New: Reporting logic
└── referral/
    └── referralService.ts     # Modify for rewards
```

### API Endpoints Added
| Method | Path | Purpose | Sprint |
|--------|------|---------|--------|
| GET | /feed | Get posts from followed users | 04.01 |
| GET | /search/users | Search users by username | 04.02 |
| GET | /discover/* | Get discovery sections | 04.02 |
| POST | /follow-requests | Create follow request | 04.04 |
| PUT | /follow-requests/:id | Accept/reject request | 04.04 |
| POST | /posts/:id/comments | Add comment | 04.05 |
| POST | /posts/:id/reactions | Add reaction | 04.05 |
| POST | /reports | Report content | 04.07 |
| POST | /blocks | Block user | 04.07 |

### Data Model Changes
```sql
-- New tables
CREATE TABLE follow_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id uuid REFERENCES users(id),
  requested_id uuid REFERENCES users(id),
  created_at timestamp DEFAULT now(),
  status text DEFAULT 'pending',
  UNIQUE(requester_id, requested_id)
);

CREATE TABLE blocked_users (
  blocker_id uuid REFERENCES users(id),
  blocked_id uuid REFERENCES users(id),
  created_at timestamp DEFAULT now(),
  PRIMARY KEY(blocker_id, blocked_id)
);

CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id uuid REFERENCES users(id),
  content_type text CHECK (content_type IN ('post', 'user', 'comment')),
  content_id uuid,
  reason text,
  created_at timestamp DEFAULT now()
);

-- Modify users table
ALTER TABLE users ADD COLUMN
  is_private boolean DEFAULT false,
  show_bankroll boolean DEFAULT true,
  show_stats boolean DEFAULT true,
  show_picks boolean DEFAULT true;

-- Modify bankrolls table for referral bonuses
ALTER TABLE bankrolls ADD COLUMN
  referral_bonus integer DEFAULT 0; -- in cents
```

### Key Functions/Components Created
- `FeedScreen` - Main feed with FlashList - Sprint 04.01
- `SearchScreen` - User search with discovery sections - Sprint 04.02
- `FollowButton` - Optimistic follow/unfollow - Sprint 04.03
- `FollowRequestSheet` - Private account requests - Sprint 04.04
- `CommentSheet` - Bottom sheet for comments - Sprint 04.05
- `ReactionPicker` - 6-reaction selector - Sprint 04.05
- `StoryViewer` - Full-screen story viewer - Sprint 04.06
- `ReportModal` - Content reporting flow - Sprint 04.07
- `ReferralCard` - Referral sharing component - Sprint 04.08
- `PerformanceTab` - Analytics dashboard - Sprint 04.10

## Sprint Execution Log

### Sprint 04.01: Feed Infrastructure
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

[Continue for each sprint as completed]

## Testing & Quality

### Testing Approach
- Unit tests for all service functions (followService, blockService, etc.)
- Integration tests for feed queries with privacy/blocking
- Performance testing for feed scrolling (must maintain 60 FPS)
- Manual testing of all social interactions
- Edge case testing for follow requests and privacy

### Known Issues
| Issue | Severity | Sprint | Status | Resolution |
|-------|----------|--------|--------|------------|
| [To be filled as issues arise] | - | - | - | - |

## Refactoring Completed

### Code Improvements
- [To be documented as refactoring happens]

### Performance Optimizations
- [To be documented with measured impact]

## Learnings & Gotchas

### What Worked Well
- [To be filled after implementation]

### Challenges Faced
- [To be filled after implementation]

### Gotchas for Future Development
- **FlashList Integration**: Requires different props than FlatList, especially `estimatedItemSize`
- **Follow Request Race Conditions**: Need to handle simultaneous accept/reject
- **Privacy Query Complexity**: Filtering content based on privacy settings adds query complexity
- **Referral Bonus Calculation**: Must be included in bankroll reset logic

## Epic Completion Checklist

- [ ] All planned sprints completed and approved
- [ ] User stories for this epic fully addressed
- [ ] Code refactored and cleaned up
- [ ] Documentation updated
- [ ] No critical bugs remaining
- [ ] Performance acceptable (60 FPS scrolling)
- [ ] Integration with other epics tested
- [ ] Epic summary added to project tracker
- [ ] All Epic 8 features incorporated

## Epic Summary for Project Tracker

**[To be completed at epic end]**

**Delivered Features**:
- [To be listed upon completion]

**Key Architectural Decisions**:
- [To be summarized upon completion]

**Critical Learnings**:
- [To be documented upon completion]

**Technical Debt Created**:
- [To be noted if any]

---

*Epic Started: TBD*  
*Epic Completed: TBD*  
*Total Duration: TBD* 