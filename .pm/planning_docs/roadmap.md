# SnapBet Development Roadmap

## Project Timeline Overview

**Total Duration**: 7 Days (MVP + RAG Enhancement)
- **Phase 1**: Days 1-3 (Core MVP)
- **Phase 2**: Days 4-7 (RAG Integration)

**Team Size**: Solo Developer
**Daily Hours**: 8-10 hours/day
**Total Effort**: ~60 hours

## Success Metrics

### MVP Success (Day 3)
- [ ] Fully functional app with core Snapchat features
- [ ] Complete betting system with tail/fade mechanics
- [ ] Real-time messaging and social features
- [ ] Deployed to TestFlight/Internal Testing
- [ ] 30+ mock users with realistic activity

### Final Success (Day 7)
- [ ] 6 RAG-powered features implemented
- [ ] Smooth 60fps performance
- [ ] <3 second load times
- [ ] Ready for r/sportsbook launch
- [ ] Demo video recorded

## Epic Breakdown

### Epic 1: Foundation & Infrastructure (Day 1)
**Goal**: Set up the complete development environment and core architecture

### Epic 2: Authentication & User System (Day 1-2)
**Goal**: Complete OAuth flow, user profiles, badges, notifications, and referral system

### Epic 3: Social Feed & Content (Day 2)
**Goal**: Photo/video sharing with emoji effects, feed, and stories

### Epic 4: Betting System & Pick Sharing (Day 2-3)
**Goal**: Complete betting functionality with three post types, overlays, and social mechanics

### Epic 5: Messaging & Real-time (Day 3)
**Goal**: DMs, group chats, and real-time updates

### Epic 6: Discovery & Polish (Day 3)
**Goal**: Search, explore, notifications, and UI polish

### Epic 7: RAG - Intelligent Insights (Days 4-5)
**Goal**: Pattern recognition and performance analysis

### Epic 8: RAG - Content Generation (Days 5-6)
**Goal**: AI-powered captions and content suggestions

### Epic 9: RAG - Social Intelligence (Day 6)
**Goal**: Smart recommendations and notifications

### Epic 10: Launch Preparation (Day 7)
**Goal**: Testing, optimization, and deployment

---

## Phase 1: Core MVP (Days 1-3)

## Day 1: Foundation & Authentication

### Sprint 1.1: Project Setup (2 hours)
**Epic**: Foundation & Infrastructure

**Goals**:
- Initialize Expo project with TypeScript
- Set up monorepo structure with pnpm workspaces
- Configure Tamagui and theme system
- Set up ESLint, Prettier, and Git hooks
- Initialize Supabase project
- Configure environment variables

**Deliverables**:
- [ ] Working Expo development environment
- [ ] Tamagui theme with SnapBet colors
- [ ] Connected to Supabase
- [ ] Basic navigation structure

**Acceptance Criteria**:
- App launches on iOS simulator
- Can navigate between placeholder screens
- Theme colors match design system

---

### Sprint 1.2: Database & Backend Setup (3 hours)
**Epic**: Foundation & Infrastructure

**Goals**:
- Run database migrations
- Set up Row Level Security policies
- Create Edge Functions scaffolding
- Configure storage buckets
- Set up real-time subscriptions
- Seed initial mock data

**Deliverables**:
- [ ] Complete database schema deployed
- [ ] RLS policies active
- [ ] Storage buckets configured
- [ ] 30 mock users created

**Acceptance Criteria**:
- Can query database from app
- RLS prevents unauthorized access
- Mock users have varied personalities

---

### Sprint 1.3: OAuth Authentication (3 hours)
**Epic**: Authentication & User System

**Goals**:
- Implement Google OAuth
- Implement Twitter OAuth
- Create auth state management
- Build welcome/login screens
- Handle auth redirects
- Secure token storage

**Deliverables**:
- [ ] Working OAuth flow
- [ ] Auth state persisted
- [ ] Welcome screen UI
- [ ] Secure session management

**Acceptance Criteria**:
- Can sign in with Google
- Can sign in with Twitter
- Session persists on app restart
- Logout works correctly

---

### Sprint 1.4: Onboarding Flow (2 hours)
**Epic**: Authentication & User System

**Goals**:
- Build username selection screen
- Build favorite team selection with all 62 teams
- Build follow suggestions with badge display
- Initialize badge system and stats preferences
- Initialize user bankroll
- Complete profile setup

**Deliverables**:
- [ ] Complete 3-step onboarding
- [ ] User profile created with badges
- [ ] Initial follows established
- [ ] $1,000 bankroll initialized
- [ ] Default stats display set

**Acceptance Criteria**:
- Username validation works
- Can select from NFL/NBA teams
- Shows user badges in follow suggestions
- Must follow 3+ users to continue
- Lands on feed after onboarding

---

## Day 2: Core Features

### Sprint 2.1: Camera & Media Creation (3 hours)
**Epic**: Social Feed & Content

**Goals**:
- Implement camera with Expo Camera
- Add photo/video capture
- Build media preview screen
- Add caption input
- Implement emoji effects selector (73 effects)
- Create upload pipeline

**Deliverables**:
- [ ] Working camera interface
- [ ] Photo and video capture
- [ ] Emoji effects carousel
- [ ] Media upload to storage

**Acceptance Criteria**:
- Can capture photos
- Can record 10-second videos
- Effects render correctly
- Media uploads successfully

---

### Sprint 2.2: Feed & Posts (3 hours)
**Epic**: Social Feed & Content

**Goals**:
- Build feed screen with FlashList
- Create post card component
- Implement content post creation flow
- Add emoji reactions
- Add text comments (feed posts only)
- Set up expiration timers for all post types
- Add pull-to-refresh

**Deliverables**:
- [ ] Scrollable feed of posts
- [ ] Content post creation working
- [ ] Comments and reactions functional
- [ ] Posts expire correctly (24h for content/outcome, game end for picks)
- [ ] Shows following only
- [ ] Visual expiration indicators

**Acceptance Criteria**:
- Feed loads <1 second
- Can create content post with media
- Can comment on posts (text only)
- Can react with emojis
- Content posts disappear after 24 hours
- Pick posts show countdown to game
- Expired posts removed from feed

---

### Sprint 2.3: Stories System (2 hours)
**Epic**: Social Feed & Content

**Goals**:
- Build stories bar component
- Create story viewer modal
- Implement story creation
- Add view tracking
- Handle story expiration
- Auto-advance stories

**Deliverables**:
- [ ] Stories bar on feed
- [ ] Full-screen story viewer
- [ ] 24-hour expiration
- [ ] View count tracking

**Acceptance Criteria**:
- Can add to story
- Stories auto-advance
- Shows unwatched indicator
- Expires after 24 hours

---

### Sprint 2.4: Betting System Core (2 hours)
**Epic**: Betting System & Pick Sharing

**Goals**:
- Build games screen with mock data
- Create bet placement bottom sheet
- Implement bankroll deduction
- Add bet types (spread/total/ML)
- Create active bets tracking
- Mock odds data structure
- Add "Share Pick" button to confirmation

**Deliverables**:
- [ ] Games list with odds
- [ ] Bet placement bottom sheet
- [ ] Bankroll updates correctly
- [ ] Bet history tracked
- [ ] Share pick entry point

**Acceptance Criteria**:
- Can browse today's games
- Can place all bet types
- Bankroll deducts on bet
- Shows potential payout
- Share button appears after bet

---

## Day 3: Betting System & Social

### Sprint 3.1: Pick & Outcome Posts (3 hours)
**Epic**: Betting System & Pick Sharing

**Goals**:
- Implement pick post creation flow
- Build bet overlay component
- Create outcome post flow
- Build outcome overlay component
- Integrate with camera system
- Add to profile Bets/Picks tab
- Enable sharing from settled bets

**Implementation Requirements**:
- Read and implement `.pm/execution_docs/overlays.md` for complete overlay system specification
- Overlays must integrate with existing camera and effects system from Epic 3

**Deliverables**:
- [ ] Pick posts with bet overlays
- [ ] Outcome posts with result overlays
- [ ] Camera integration for both types
- [ ] Profile tab shows all picks
- [ ] Share buttons on settled bets

**Acceptance Criteria**:
- Can share pick after placing bet
- Overlay shows teams/odds/selection
- Can combine with emoji effects
- Can share outcome from profile
- Shows W/L and profit/loss

---

### Sprint 3.2: Tail/Fade Mechanics (2 hours)
**Epic**: Betting System & Pick Sharing

**Goals**:
- Add tail/fade buttons to pick posts
- Implement tail logic (copy bet)
- Implement fade logic (opposite bet)
- Update counts in real-time
- Link bets in database
- Add notifications
- Disable after game start

**Deliverables**:
- [ ] Tail/fade UI on pick posts
- [ ] One-tap tail working
- [ ] Fade creates opposite bet
- [ ] Counts update live
- [ ] Cannot tail/fade after game start

**Acceptance Criteria**:
- Can tail from feed
- Can fade from feed
- Shows who tailed/faded
- Notifies pick owner
- Respects game start time

---

### Sprint 3.3: Messaging System (3 hours)
**Epic**: Messaging & Real-time

**Goals**:
- Build chat list screen
- Create DM conversation UI
- Implement group chat creation
- Add message sending with expiration options
- Share picks in chat
- Set up real-time sync
- Implement blocked user filtering

**Deliverables**:
- [ ] Chat list screen
- [ ] DM conversations with expiration selector
- [ ] Group chat creation with admin-set expiration
- [ ] Real-time message updates
- [ ] Message expiration options (1hr, 24hr, 1 week)
- [ ] Server-side expiration job
- [ ] Blocked users cannot message

**Acceptance Criteria**:
- Can send text messages
- Can set expiration per conversation
- Can share picks in chat
- Messages appear instantly
- Shows read receipts
- Messages expire correctly
- Blocked users filtered from messaging

---

### Sprint 3.4: Profile & Discovery (2 hours)
**Epic**: Discovery & Polish

**Goals**:
- Build user profile screen
- Add Bets/Picks tab with filters
- Add follow/unfollow functionality
- Create performance stats display
- Implement profile navigation
- Add bankroll reset option
- Build settings screen

**Deliverables**:
- [ ] Clickable usernames
- [ ] Profile with Posts/Bets tabs
- [ ] Bets tab shows all picks
- [ ] Follow/unfollow working
- [ ] Stats display correctly
- [ ] Can filter bets by status

**Acceptance Criteria**:
- Can view any profile
- Can follow/unfollow
- Shows all user's picks
- Can filter active/settled
- Shows win/loss record
- Can reset bankroll

---

### Sprint 3.5: Discovery & Notifications (2 hours)
**Epic**: Discovery & Polish

**Goals**:
- Build explore/search tab
- Add trending picks section
- Create hot bettors list
- Implement notifications screen
- Add push notification setup
- Final UI polish pass

**Deliverables**:
- [ ] Search functionality
- [ ] Trending sections
- [ ] Notification center
- [ ] Polished UI throughout

**Acceptance Criteria**:
- Can search users
- Shows trending content
- Notifications display
- App feels native

---

## Phase 2: RAG Enhancement (Days 4-7)

## Day 4: RAG Foundation

### Sprint 4.1: RAG Infrastructure Setup (3 hours)
**Epic**: RAG - Intelligent Insights

**Goals**:
- Set up OpenAI integration
- Configure vector database
- Create embedding pipeline
- Build RAG service layer
- Set up Vercel AI SDK
- Create prompt templates

**Deliverables**:
- [ ] OpenAI connected
- [ ] Vector storage ready
- [ ] Embedding generation working
- [ ] RAG queries functional

**Success Criteria**:
- Can generate embeddings
- Can query similar content
- AI responses working

---

### Sprint 4.2: Betting Pattern Analysis (5 hours)
**Epic**: RAG - Intelligent Insights

**Goals**:
- Analyze user betting history
- Identify winning patterns
- Create pattern recognition system
- Build insights UI component
- Generate performance summaries
- Add to profile screen

**Deliverables**:
- [ ] Pattern detection working
- [ ] Insights display on profile
- [ ] Identifies successful trends
- [ ] Shows team/bet type analysis

**Success Criteria**:
- Shows real patterns from data
- Updates as user bets more
- Insights are actionable

---

## Day 5: Content Intelligence

### Sprint 5.1: AI Caption Generation (4 hours)
**Epic**: RAG - Content Generation

**Goals**:
- Build caption suggestion system
- Analyze user's writing style
- Generate contextual captions
- Add to post creation flow
- Include bet context in generation
- Multiple suggestion options

**Deliverables**:
- [ ] Caption suggestions appear
- [ ] Match user's tone
- [ ] Include relevant stats
- [ ] One-tap to use

**Success Criteria**:
- Generates 3 caption options
- Captions feel natural
- Include bet details cleverly

---

### Sprint 5.2: Smart Content Recommendations (4 hours)
**Epic**: RAG - Content Generation

**Goals**:
- Analyze posting patterns
- Suggest optimal post times
- Recommend content types
- Generate story ideas
- Create content calendar
- Build suggestion UI

**Deliverables**:
- [ ] Content suggestions screen
- [ ] Posting time recommendations
- [ ] Story idea generator
- [ ] Integrated in camera flow

**Success Criteria**:
- Suggestions are relevant
- Based on user history
- Improves engagement

---

## Day 6: Social Intelligence

### Sprint 6.1: Intelligent Friend Recommendations (4 hours)
**Epic**: RAG - Social Intelligence

**Goals**:
- Analyze social graph
- Find similar bettors
- Consider betting style
- Match favorite teams
- Build recommendation UI
- Add to explore tab

**Deliverables**:
- [ ] Smart friend suggestions
- [ ] Shows why recommended
- [ ] Updates dynamically
- [ ] Better than random

**Success Criteria**:
- Recommendations make sense
- Shows reasoning
- Higher follow rate

---

### Sprint 6.2: Smart Notifications & Alerts (4 hours)
**Epic**: RAG - Social Intelligence

**Goals**:
- Analyze notification patterns
- Create smart alerts system
- Notify on similar setups
- Milestone predictions
- Optimal betting times
- Intelligent grouping

**Deliverables**:
- [ ] Smart notification system
- [ ] Pattern-based alerts
- [ ] Contextual notifications
- [ ] Reduced notification spam

**Success Criteria**:
- Notifications are valuable
- Good open rate
- Users don't disable

---

## Day 7: Polish & Launch

### Sprint 7.1: RAG Integration Polish (3 hours)
**Epic**: Launch Preparation

**Goals**:
- Optimize AI response times
- Add loading states
- Handle edge cases
- Improve prompt engineering
- Cache AI responses
- Performance testing

**Deliverables**:
- [ ] Sub-2s AI responses
- [ ] Smooth loading states
- [ ] Error handling complete
- [ ] Cached for performance

**Success Criteria**:
- AI features feel instant
- No blocking operations
- Graceful failures

---

### Sprint 7.2: Final Testing & Optimization (3 hours)
**Epic**: Launch Preparation

**Goals**:
- Full app testing pass
- Performance optimization
- Fix critical bugs
- Optimize bundle size
- Test on real devices
- Memory leak checks

**Deliverables**:
- [ ] Bug-free experience
- [ ] 60fps scrolling
- [ ] <3s load time
- [ ] No memory leaks

**Success Criteria**:
- Smooth performance
- No crashes
- Fast load times

---

### Sprint 7.3: Demo & Deployment (2 hours)
**Epic**: Launch Preparation

**Goals**:
- Record demo video
- Create app store assets
- Deploy to TestFlight
- Prepare launch post
- Submit to assignment
- Plan user acquisition

**Deliverables**:
- [ ] 5-minute demo video
- [ ] Deployed build
- [ ] GitHub repo public
- [ ] Launch materials ready

**Success Criteria**:
- Demo shows all features
- Build installable
- Ready for users

---

## Risk Mitigation

### High Risk Items
1. **Real-time Performance**
   - Mitigation: Implement pagination early
   - Fallback: Reduce real-time features

2. **AI Response Times**
   - Mitigation: Aggressive caching
   - Fallback: Pre-generated responses

3. **Odds API Limits**
   - Mitigation: Mock data throughout
   - Fallback: Static odds

### Timeline Buffers
- Each day has 8 hours allocated
- 2 hours buffer for issues
- Day 7 has 4 hours buffer

### Scope Flexibility
**Can Cut if Needed**:
- Complex animations
- Some RAG features
- Advanced stats

**Must Have**:
- Core betting flow
- Tail/fade mechanics
- Basic messaging
- Feed functionality

## Daily Milestones

### Day 1 Complete When:
- [ ] Can sign in with OAuth
- [ ] Complete onboarding
- [ ] Database fully set up
- [ ] Navigation working

### Day 2 Complete When:
- [ ] Can capture and share media
- [ ] Feed shows posts
- [ ] Can place bets
- [ ] Stories working

### Day 3 Complete When:
- [ ] Can tail/fade picks
- [ ] Messaging functional
- [ ] Profiles working
- [ ] MVP feature complete

### Day 4 Complete When:
- [ ] RAG infrastructure ready
- [ ] Pattern analysis working
- [ ] Insights displaying

### Day 5 Complete When:
- [ ] AI captions generating
- [ ] Content recommendations live
- [ ] RAG creating value

### Day 6 Complete When:
- [ ] Smart friends working
- [ ] Intelligent notifications
- [ ] All RAG features integrated

### Day 7 Complete When:
- [ ] Demo recorded
- [ ] App deployed
- [ ] Ready for users
- [ ] Assignment submitted

---

This roadmap provides clear daily goals with specific sprints, allowing for focused development while maintaining flexibility for the realities of software development.

## Implementation Notes

### Three Post Types Architecture
```typescript
// Post type enum
enum PostType {
  CONTENT = 'content',    // General social posts
  PICK = 'pick',         // Bet sharing posts
  OUTCOME = 'outcome'    // Result sharing posts
}

// Entry points
// 1. Content: Camera tab → No bet context
// 2. Pick: Bet confirmation → "Share Pick"
// 3. Outcome: Profile → Settled bet → "Share Result"
```

### Overlay System Design
```typescript
// Bet overlay for pick posts
interface BetOverlay {
  teams: { home: string; away: string };
  betType: 'spread' | 'total' | 'moneyline';
  line: string;
  odds: string;
  selection: string;
  tailedFrom?: string;  // If tailing
  fadedFrom?: string;   // If fading
}

// Outcome overlay for result posts
interface OutcomeOverlay {
  result: 'WIN' | 'LOSS' | 'PUSH';
  profitLoss: number;
  finalScore: { home: number; away: number };
  originalBet: BetOverlay;
  tailFadeCount: { tails: number; fades: number };
}
```

### Engagement Features
```typescript
// Comments (text-only, feed posts only)
interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;  // Max 280 chars
  createdAt: Date;
}

// Reactions (all post types)
interface Reaction {
  postId: string;
  userId: string;
  emoji: '🔥' | '💯' | '😬' | '💰' | '🎯' | '🤝';
}

// Tail/Fade (pick posts only)
interface TailFade {
  pickPostId: string;
  userId: string;
  action: 'tail' | 'fade';
  resultingBetId: string;
}
```

### Profile Bets/Picks Tab
```
Filters:
- All Bets
- Active Only
- Settled Only
- By Sport (NFL/NBA)
- By Type (Spread/Total/ML)
- Wins Only
- Losses Only

Each bet shows:
- Teams & bet details
- Status (active/settled)
- Result (if settled)
- Tail/fade counts
- "Share Pick" or "Share Result" button
```