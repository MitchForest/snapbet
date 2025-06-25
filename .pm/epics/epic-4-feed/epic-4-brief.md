# Epic 4: Feed & Social Engagement - Detailed Roadmap

## Epic Overview

**Epic Goal**: Build the complete social layer of SnapBet including the feed, user profiles, following system, search/discovery, and all social interactions that make betting a shared experience.

**Duration**: Day 3 of Development (13-14 hours)
**Dependencies**: Epic 3 (Camera & Content) must be complete
**Outcome**: Full social platform with feed, profiles, following, and discovery

---

## Sprint Breakdown

### Sprint 4.1: Feed Implementation (2.5 hours)

**Goal**: Create the main feed showing posts from followed users

**Features**:

#### Feed Architecture
- FlashList implementation for performance
- Following-only content (no algorithmic feed yet)
- Chronological ordering (newest first)
- All three content types (content, pick, outcome)
- Pagination with infinite scroll
- Pull-to-refresh functionality
- Empty states for new users

#### Feed Components
- Feed container with proper navigation
- Post cards from Epic 3
- Story bar integration at top
- Loading states and skeletons
- Error boundaries
- Network status handling

#### Real-time Updates
- Subscribe to new posts from followed users
- Optimistic UI for interactions
- Real-time comment/reaction counts
- Live expiration countdown
- Auto-remove expired content

**Technical Tasks**:
- Set up FlashList with proper configuration
- Implement feed query with following filter
- Add pull-to-refresh with haptic feedback
- Create infinite scroll with pagination
- Add real-time subscriptions
- Handle offline/online states
- Implement empty state UI

**Acceptance Criteria**:
- [ ] Feed loads posts from followed users only
- [ ] Pull-to-refresh works smoothly
- [ ] Infinite scroll loads more content
- [ ] Real-time updates appear instantly
- [ ] Expired content auto-removes
- [ ] Empty state guides new users
- [ ] Performance stays at 60 FPS

---

### Sprint 4.2: Other User Profiles (2 hours)

**Goal**: Enable viewing and interacting with other users' profiles

**Features**:

#### Profile Screen Enhancements
- Route to profile from username taps
- Show user's badges and stats
- Display their posts/picks
- Follow/Unfollow button
- Message button (if following)
- Block/Report options

#### Profile Tabs
- **Posts Tab**: Their content/pick/outcome posts
- **Picks Tab**: Betting history with results
- **Performance Tab**: Stats by sport, ROI, streaks

#### Privacy Handling
- Respect privacy settings
- Show limited info for private accounts
- Follow request UI for private profiles
- Hide sensitive stats if user chose to

**Technical Tasks**:
- Create dynamic profile route
- Fetch user data with privacy filters
- Build follow/unfollow logic
- Implement profile tab navigation
- Add block/report functionality
- Create "user not found" state
- Handle navigation stack properly

**Mock Data Requirements**:
- Other users' profiles in database
- Their posts and betting history
- Privacy settings variations
- Follow relationships

**Acceptance Criteria**:
- [ ] Can navigate to any user's profile
- [ ] Follow/Unfollow updates instantly
- [ ] Privacy settings respected
- [ ] All three tabs display data
- [ ] Block/Report options work
- [ ] Back navigation works correctly

---

### Sprint 4.3: Following System (1.5 hours)

**Goal**: Complete following/follower functionality

**Features**:

#### Following Mechanics
- Follow/Unfollow with optimistic updates
- Following count updates
- Follower count updates
- Mutual follow indicators
- Follow request system for private accounts

#### Following/Followers Lists
- View lists from profile
- Search within lists
- Navigate to profiles from lists
- Remove followers (your profile)
- Cancel follow requests

#### Privacy Integration
- Public accounts: Instant follow
- Private accounts: Request system
- Approve/Deny requests
- Request notifications

**Technical Tasks**:
- Create follow/unfollow mutations
- Build following/followers list screens
- Implement follow request flow
- Add mutual follow detection
- Create notification triggers
- Update counts in real-time
- Handle edge cases (blocking, etc.)

**Acceptance Criteria**:
- [ ] Follow/Unfollow works instantly
- [ ] Counts update everywhere
- [ ] Follow requests work for private
- [ ] Can view/search follow lists
- [ ] Mutual follows indicated
- [ ] Notifications trigger properly

---

### Sprint 4.4: Search & Discovery (2 hours)

**Goal**: Build the search/explore tab for discovering users and content

**Features**:

#### Search Functionality
- User search by username/display name
- Real-time search results
- Recent searches (stored locally)
- Clear search history
- Search result previews with key stats

#### Discovery Sections
- **Hot Bettors**: Top performers this week
- **Trending Picks**: Most tailed picks today
- **Fade Material**: Worst performers (entertainment)
- **Your Teams**: Content related to favorite teams
- **Rising Stars**: New users with good records

#### UI Components
- Search bar with animations
- Sectioned discovery feed
- User cards with quick follow
- Pick cards with quick tail/fade
- Loading states for each section

**Technical Tasks**:
- Implement search with debouncing
- Create discovery algorithms
- Build sectioned list components
- Add follow actions to cards
- Cache discovery data
- Create refresh mechanism
- Track search analytics

**Acceptance Criteria**:
- [ ] Search returns relevant users
- [ ] Discovery sections populate
- [ ] Can follow from search results
- [ ] Recent searches persist
- [ ] Each section refreshes independently
- [ ] Smooth scrolling performance

---

### Sprint 4.5: Privacy & Settings Completion (1.5 hours)

**Goal**: Complete all privacy settings and user preferences

**Features**:

#### Privacy Settings
- Public/Private account toggle
- Show/Hide bankroll
- Show/Hide win rate  
- Show/Hide profit
- Who can message you
- Who can see your stories

#### Account Settings
- Edit profile (display name, bio, avatar)
- Change favorite team
- Notification preferences by type
- Blocked users list management
- Data download request
- Account deletion

#### Settings UI
- Grouped settings sections
- Toggle switches with descriptions
- Confirmation dialogs for critical actions
- Success feedback
- Settings sync across devices

**Technical Tasks**:
- Create settings screen hierarchy
- Build privacy toggles with mutations
- Implement edit profile flow
- Add blocked users management
- Create data export function
- Add account deletion flow
- Persist settings in database

**Acceptance Criteria**:
- [ ] All privacy toggles work
- [ ] Profile edits save properly
- [ ] Blocked users list manageable
- [ ] Settings persist across sessions
- [ ] Confirmations prevent accidents
- [ ] Data export generates file

---

### Sprint 4.6: Engagement Features (2 hours)

**Goal**: Implement comments, reactions, and sharing functionality

**Features**:

#### Comments System
- Add comments to posts (not stories)
- 280 character limit
- Real-time comment updates
- Delete own comments
- Report inappropriate comments
- Load more pagination

#### Reactions System
- 6 reaction types: 🔥💰😂😭💯🎯
- Quick tap to react
- See who reacted
- Change reaction
- Real-time reaction counts

#### Sharing Features
- Share post to your story
- Share post via DM
- Share externally (generate link)
- Copy post link
- Share analytics tracking

**Technical Tasks**:
- Build comment thread component
- Create reaction picker UI
- Implement share bottom sheet
- Add real-time subscriptions
- Create moderation flags
- Build "who reacted" modal
- Track sharing analytics

**Acceptance Criteria**:
- [ ] Comments add/display properly
- [ ] Reactions animate smoothly
- [ ] Share options work correctly
- [ ] Real-time updates function
- [ ] Can delete own comments
- [ ] Moderation flags trigger

---

### Sprint 4.7: Story Viewer (1 hour)

**Goal**: Build full-screen story viewing experience

**Features**:

#### Story Viewer UI
- Full screen immersive view
- Progress bars at top
- Tap to advance/go back
- Swipe down to dismiss
- Auto-advance after 5 seconds
- Pause on long press

#### Story Features
- View tracking (who viewed)
- Reply to story → DM
- React to stories
- Report inappropriate stories
- Story expiration display
- Mute user's stories

**Technical Tasks**:
- Create story viewer screen
- Implement gesture controls
- Add progress bar animations
- Track story views
- Build reply-to-DM flow
- Add report functionality
- Handle story expiration

**Acceptance Criteria**:
- [ ] Stories display full screen
- [ ] Navigation gestures work
- [ ] Progress bars animate
- [ ] Views track properly
- [ ] Can reply via DM
- [ ] Auto-advance works

---

### Sprint 4.8: Referral System (1.5 hours)

**Goal**: Implement referral program for user growth

**Features**:

#### Referral Code Generation
- Unique 6-character codes (e.g., MIK2X9)
- Based on username + random
- Display in profile/settings
- Copy to clipboard
- QR code generation (future)

#### Sharing Referral
- Pre-written share messages
- Native share sheet
- Track share attempts
- Deep link support
- Custom referral landing page

#### Referral Rewards
- $100 weekly bankroll bonus (permanent)
- Track successful referrals
- Show referral count in profile
- Referral leaderboard (future)
- Milestone rewards (future)

#### Referral Flow
- New user enters code during onboarding
- Validate code exists
- Link referrer and referred
- Apply bankroll bonus
- Send success notification

**Technical Tasks**:
- Generate unique referral codes
- Create referral share flow
- Build code validation
- Implement deep linking
- Add referral tracking
- Update bankroll calculations
- Create referral stats display

**Acceptance Criteria**:
- [ ] Referral codes generate properly
- [ ] Share flow works smoothly
- [ ] Code validation during onboarding
- [ ] Bankroll bonus applies
- [ ] Referral tracking accurate
- [ ] Deep links work correctly

---

### Sprint 4.9: Content Moderation (1 hour)

**Goal**: Implement reporting and blocking functionality

**Features**:

#### Reporting System
- Report posts/stories/comments
- Report users
- Report categories (spam, inappropriate, etc.)
- 3 reports = auto-hide
- Admin review queue
- Report confirmation feedback

#### Blocking System
- Block users from profiles
- Blocked users list in settings
- Unblock functionality
- Hide all content from blocked users
- Prevent interactions both ways
- Block applies to DMs

#### Moderation UI
- Report option in context menus
- Block confirmation dialog
- Success feedback
- Blocked content placeholder
- Admin moderation panel (basic)

**Technical Tasks**:
- Create report functionality
- Build blocking system
- Update feed queries for blocks
- Hide blocked user content
- Create admin review panel
- Add moderation counters
- Implement auto-hide logic

**Acceptance Criteria**:
- [ ] Can report content/users
- [ ] Blocking hides all content
- [ ] 3 reports trigger auto-hide
- [ ] Blocked users list works
- [ ] Can unblock users
- [ ] Admin panel shows reports

---

### Sprint 4.10: Performance Analytics (1.5 hours)

**Goal**: Build comprehensive performance analytics for user profiles

**Features**:

#### 7-Day Rolling Stats
- Win/Loss/Push record
- Total profit/loss display
- ROI percentage calculation
- Win rate with trend indicators

#### Sport-Specific Breakdown
- Performance by sport (NFL, NBA, etc.)
- Best performing sport highlighted
- Profit/loss by sport
- Favorite teams analysis

#### Bet Type Analysis
- Spread vs Total vs Moneyline comparison
- Success rate by bet type
- Visual charts (pie/bar)
- Recommendations based on data

#### Time-Based Patterns
- Best day of week performance
- Prime time vs day games
- Streak visualization
- Profit trend line chart

**Technical Tasks**:
- Create performance calculation service
- Build analytics components
- Implement chart visualizations
- Add performance tab to profiles
- Query optimization for speed
- Cache calculations
- Handle empty states

**Acceptance Criteria**:
- [ ] Performance tab shows in profiles
- [ ] All calculations accurate
- [ ] Charts render at 60 FPS
- [ ] Sport breakdown complete
- [ ] Bet type analysis visual
- [ ] Time patterns detected
- [ ] Empty states handled

---

## Technical Architecture

### Navigation Structure
```
app/
├── (tabs)/
│   ├── feed.tsx          # Main feed
│   ├── search.tsx        # Search/Discovery
│   └── [others...]
├── profile/
│   ├── [username].tsx    # Other user profiles
│   ├── followers.tsx     # Followers list
│   ├── following.tsx     # Following list
│   └── edit.tsx          # Edit profile
├── settings/
│   ├── index.tsx         # Settings menu
│   ├── privacy.tsx       # Privacy settings
│   ├── blocked.tsx       # Blocked users
│   └── referral.tsx      # Referral program
└── story/
    └── [id].tsx          # Story viewer
```

### State Management Updates
```typescript
interface SocialState {
  // Feed state
  feedPosts: Post[];
  hasMore: boolean;
  isRefreshing: boolean;
  
  // Following state
  following: string[];
  followers: string[];
  followRequests: FollowRequest[];
  
  // Discovery state
  searchQuery: string;
  searchResults: User[];
  hotBettors: User[];
  trendingPicks: Pick[];
  
  // Privacy state
  isPrivate: boolean;
  showBankroll: boolean;
  showStats: boolean;
  blockedUsers: string[];
  
  // Actions
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  reportContent: (contentId: string, reason: string) => Promise<void>;
}
```

### Database Considerations
```sql
-- New tables/columns needed
follow_requests (
  id uuid PRIMARY KEY,
  requester_id uuid REFERENCES users(id),
  requested_id uuid REFERENCES users(id),
  created_at timestamp,
  UNIQUE(requester_id, requested_id)
);

blocked_users (
  blocker_id uuid REFERENCES users(id),
  blocked_id uuid REFERENCES users(id),
  created_at timestamp,
  PRIMARY KEY(blocker_id, blocked_id)
);

reports (
  id uuid PRIMARY KEY,
  reporter_id uuid REFERENCES users(id),
  content_type text, -- 'post', 'user', 'comment'
  content_id uuid,
  reason text,
  created_at timestamp
);

referrals (
  id uuid PRIMARY KEY,
  referrer_id uuid REFERENCES users(id),
  referred_id uuid REFERENCES users(id),
  code text UNIQUE,
  created_at timestamp
);

-- Update users table
ALTER TABLE users ADD COLUMN
  is_private boolean DEFAULT false,
  show_bankroll boolean DEFAULT true,
  show_stats boolean DEFAULT true,
  referral_code text UNIQUE;
```

---

## Integration Points

### With Epic 3 (Camera & Content)
- PostCard component in feed
- StoryBar component integration
- Comment/Reaction components
- Share functionality for posts

### With Epic 5 (Betting)
- Pick posts with real bet data
- Tail/Fade functionality activation
- Performance stats from real bets
- Trending picks based on real data

### With Epic 7 (Messaging)
- Share to DM functionality
- Reply to story creates DM
- Message button on profiles
- Block affects DMs

---

## Testing Checklist

### Feed Testing
- [ ] Feed loads and scrolls smoothly
- [ ] Pull-to-refresh works
- [ ] Infinite scroll loads more
- [ ] Real-time updates appear
- [ ] Empty states display

### Profile Testing
- [ ] Other profiles load correctly
- [ ] Follow/Unfollow works
- [ ] Privacy settings respected
- [ ] All tabs show data
- [ ] Navigation works properly

### Social Features
- [ ] Comments add/display
- [ ] Reactions work smoothly
- [ ] Share options function
- [ ] Search returns results
- [ ] Discovery sections populate

### Privacy & Moderation
- [ ] Privacy toggles work
- [ ] Blocking hides content
- [ ] Reports submit properly
- [ ] Settings persist
- [ ] Referral system works

---

## Success Metrics

- Feed loads in < 1 second
- Scroll performance at 60 FPS
- Search results in < 500ms
- Follow actions complete instantly
- Zero blocked content visible
- Referral conversion > 20%

---

## Notes & Considerations

1. **Performance**: Use FlashList for all lists, implement proper memoization
2. **Privacy First**: Always check privacy settings before displaying data
3. **Optimistic Updates**: All social actions should feel instant
4. **Moderation**: Auto-hide at 3 reports prevents abuse
5. **Referrals**: Deep linking critical for viral growth
6. **Real-time**: Subscribe carefully to avoid performance issues
7. **Offline**: Cache feed data for offline viewing

---

## Next Steps (Epic 5)
- Real betting system implementation
- Actual tail/fade functionality
- Real performance calculations
- Bet settlement and notifications
- Games data integration
- Odds updates