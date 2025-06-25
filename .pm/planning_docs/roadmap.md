# SnapBet Development Roadmap v2.0

## Project Overview

**Timeline**: 7 Days  
**Phase 1**: Core MVP (Days 1-4)  
**Phase 2**: AI Enhancement & Polish (Days 5-7)  
**Platform**: Mobile-first (React Native/Expo)

---

## Epic Summary

### Epic 1: Foundation & Infrastructure ✅
Core setup: Expo, navigation, storage, theming, and database structure.

### Epic 2: Authentication & Onboarding ✅
OAuth, user creation, onboarding flow, team selection, and initial profiles.

### Epic 3: Camera, Effects & Content Creation 🚧
Camera integration, 40+ effects system, content types, ephemeral posts, and weekly badges.

### Epic 4: Feed & Social Engagement
Social feed, profiles, following, search/discovery, engagement, privacy, and performance analytics.

### Epic 5: Betting System & Tail/Fade
Real betting, tail/fade mechanics, bankroll, bet history, and settlement.

### Epic 6: Messaging & Real-time
DMs, group chats, ephemeral messages, reactions, and real-time sync.

### Epic 7: Polish, Mock Data & Automation
Comprehensive mock data for all features, edge function migration, automated services, code refactoring, demo environment, and remaining polish features.

### Epic 8: AI-Powered Intelligence
Smart picks, bet analysis, trend detection, and AI chat assistant.

### Epic 9: Launch Preparation
App store submission, analytics, marketing site, and go-live checklist.

---

## Epic 1: Foundation & Infrastructure (COMPLETED)

**Goal**: Set up the complete development environment and core architecture with ephemeral-first design

### Core Features
- **Database Schema**
  - Ephemeral content tables (posts, stories, messages)
  - Permanent data tables (users, bets, stats)
  - Soft delete/hard delete architecture
  - Report and moderation tables

- **Supabase Configuration**
  - Authentication setup
  - Realtime subscriptions
  - Storage buckets for media
  - Edge Functions scaffolding
  - Row Level Security policies

- **Scheduled Jobs**
  - Content expiration (hourly)
  - Monday bankroll resets (midnight)
  - Badge calculations (hourly)
  - Hard delete cleanup (daily)

- **Technical Setup**
  - Expo project with TypeScript
  - Tamagui theme (SnapBet colors)
  - Navigation structure (drawer + tabs)
  - Environment variables
  - Error tracking

- **Mock Data**
  - 30 diverse user personas
  - Betting history for each
  - Active group chats
  - Sample posts/stories

---

## Epic 2: Authentication & User System (COMPLETED)

**Goal**: Complete user authentication, profiles, and privacy controls

### Core Features
- **OAuth Authentication**
  - Google OAuth only
  - Twitter/X OAuth only
  - No email/password option
  - Secure token storage
  - Auto-refresh handling

- **User Profile Creation**
  - Username selection (permanent)
  - Display name (editable)
  - Profile picture (custom upload)
  - Bio (140 characters)
  - Favorite team selection

- **Privacy Settings**
  - Public/private account toggle
  - Follow request system
  - Show/hide bankroll
  - Show/hide stats
  - Blocked users list

- **Onboarding Flow**
  - 3-step process
  - Initial follow suggestions
  - Must follow 3+ users
  - Starting bankroll ($1,000)

- **Referral System**
  - Unique referral codes
  - $100 weekly bankroll bonus per referral (permanent)
  - Track successful referrals
  - Deep linking support

- **Settings Management**
  - Notification preferences
  - Display preferences
  - Account management
  - Data export option

---

## Epic 3: Camera & Content Creation (IN PROGRESS)

**Goal**: Build camera-first content creation with emoji effects

### Core Features
- **Camera Implementation**
  - Photo capture
  - Video recording (10 seconds max)
  - Front/back camera toggle
  - Flash control
  - Grid overlay option

- **Emoji Effects System**
  - 73 total effects
  - Tier 0: Free for everyone (48 effects)
  - Tier 1: Any badge unlocks (15 effects)
  - Tier 2: 3+ badges unlock (10 effects)
  - Real-time preview
  - Effect categories (Wins, Losses, Vibes, etc.)

- **Three Post Types**
  - Content posts (no bet data)
  - Pick posts (bet overlay)
  - Outcome posts (result overlay)
  - Type determines available overlays

- **Media Processing**
  - Compression pipeline
  - Upload to Supabase storage
  - Progress indicators
  - Retry on failure
  - Thumbnail generation

- **Post Creation Flow**
  - Capture media
  - Apply effects
  - Add caption (280 chars)
  - Select destination (feed/story)
  - Set appropriate expiration

- **Weekly Badge System**
  - 🔥 Hot Right Now (3+ wins this week)
  - 💰 Week's Profit King
  - 🌊 Riding the Wave
  - 🎯 This Week's Sharp (70%+)
  - 🎪 Fade God
  - ⚡ Most Active (10+ picks)
  - 👻 Ghost (inactive 3+ days)
  - 🏆 Sunday Sweep

---

## Epic 4: Feed & Social Engagement

**Goal**: Create complete social platform with feed, profiles, and discovery

### Core Features
- **Feed Implementation**
  - FlashList for performance
  - Following-only content (Phase 1)
  - Three content types display
  - Pull-to-refresh
  - Infinite scroll
  - Real-time updates

- **Search & Discovery**
  - User search functionality
  - Hot bettors (this week)
  - Trending picks (today)
  - Fade material section
  - Team-based discovery
  - Your favorite teams content

- **Following System**
  - Follow/unfollow with optimistic updates
  - Following/followers lists
  - Mutual follow indicators
  - Private accounts with follow requests
  - Request notifications

- **Social Engagement**
  - Emoji reactions (6 types)
  - Text comments (280 chars)
  - View counts
  - Share to story/DM
  - Tail/fade UI (buttons only)

- **Story System**
  - Full-screen viewer
  - Progress bars
  - Auto-advance
  - View tracking
  - Reply to story → DM

- **Content Moderation**
  - Report posts/users
  - 3 reports = auto-hide
  - Block user functionality
  - Hide blocked users' content
  - Admin review queue

- **Referral Rewards**
  - $100 weekly bankroll bonus
  - Deep link integration
  - Share functionality
  - Track referral success

- **Performance & Polish**
  - 60 FPS scrolling optimization
  - Loading states and skeletons
  - Error boundaries
  - Network status handling
  - Haptic feedback

---

## Epic 5: Betting & Bankroll System

**Goal**: Complete betting functionality with weekly reset system and performance analytics

### Core Features
- **Games Display**
  - Mock games data
  - NFL and NBA support
  - Odds for all bet types
  - Sort by start time
  - Live status indicators

- **Bet Placement**
  - Bottom sheet interface
  - Spread, Total, Moneyline
  - Quick bet amounts
  - Potential payout display
  - Bankroll validation

- **Weekly Bankroll System**
  - $1,000 base amount
  - +$100 per referral (permanent)
  - Auto-reset Mondays at midnight
  - Manual reset available
  - Transaction history

- **Bet Management**
  - Active bets tracking
  - Settled bets history
  - Win/loss/push outcomes
  - Permanent record keeping
  - Sport-specific filtering

- **Settlement System**
  - Admin scripts for results
  - Automatic bankroll updates
  - Push notifications
  - Outcome post prompts

- **Tail/Fade Mechanics**
  - One-tap to copy bet
  - Smart opposite calculation
  - Link to original pick
  - Real-time count updates
  - Performance tracking

- **Performance Analytics**
  - 7-day rolling stats
  - Sport-specific breakdown
  - Bet type analysis (spread vs total vs ML)
  - Time-based patterns
  - Visual charts and graphs
  - Best/worst performing areas
  - ROI and win rate tracking

---

## Epic 6: Messaging & Real-time

**Goal**: Private ephemeral conversations with betting integration

### Core Features
- **Direct Messages**
  - 1-on-1 conversations
  - Expiration options (1hr, 24hr, 1 week)
  - Photo/video sharing
  - Pick sharing with tail/fade
  - Read receipts

- **Group Chats**
  - 2-50 members
  - Admin controls
  - Group-wide expiration
  - Member management
  - Named groups

- **Message Features**
  - Text messages (1000 chars)
  - Media messages
  - Emoji reactions
  - Typing indicators
  - Message deletion

- **Real-time Sync**
  - Instant delivery
  - Online status
  - Push notifications
  - Background sync
  - Offline queue

- **Safety Features**
  - Block user filtering
  - Report messages
  - Leave groups
  - Mute conversations
  - Clear chat history

---

## Epic 7: Polish & Feature Completion

**Goal**: Complete remaining features, refactor for maintainability, update all mock data to showcase features, and create a realistic demo environment

### Core Features

#### Comprehensive Mock Data Update
- **Update Mock Users**
  - Add private/public account status
  - Update stats to reflect betting history
  - Add mutual follow relationships
  - Include blocked user examples
  - Add referral relationships

- **Create Mock Content**
  - 100+ posts across all three types (content, pick, outcome)
  - 50+ active stories from various users
  - Expired content examples
  - Different media types (photos/videos)
  - Varied caption lengths and emoji usage

- **Mock Social Engagement**
  - 500+ comments across posts
  - 1000+ reactions with all 6 types
  - Tail/fade relationships on pick posts
  - View counts on stories
  - Follow request examples (for private accounts)

- **Mock Betting Data**
  - Active bets for current games
  - Settled bets with wins/losses/pushes
  - Bet history spanning multiple weeks
  - Various bet types (spread, total, moneyline)
  - Tail/fade outcome tracking

- **Mock Games & Odds**
  - Current week NFL/NBA games
  - Live games with scores
  - Upcoming games with odds
  - Recently completed games
  - Historical games for bet history

- **Weekly Badge Calculations**
  - Calculate badges based on mock data
  - Ensure variety (hot streak, profit king, fade god, etc.)
  - Some users with multiple badges
  - Some users with no badges

- **Mock Messages**
  - Active DM conversations
  - Group chats with 3-10 members
  - Messages at various expiration stages
  - Pick shares in messages
  - Read/unread states

#### Edge Function Migration
- **Badge Calculation Service**
  - Move from scripts to Supabase Edge Function
  - Run hourly via cron
  - Calculate all 8 weekly badges
  - Handle Monday resets

- **Bet Settlement Service**
  - Move from manual script to Edge Function
  - Run every 5 minutes for live games
  - Update bet outcomes
  - Calculate winnings
  - Update user stats

- **Game Data Service**
  - Move from script to Edge Function
  - Run daily at 3 AM ET
  - Fetch latest games and odds
  - Update game scores
  - Mark completed games

- **Content Expiration Service**
  - Create Edge Function for cleanup
  - Run hourly
  - Soft delete expired content
  - Hard delete after 7 days
  - Update story view counts

- **Mock Data Generation Service**
  - Edge Function to refresh demo data
  - Generate realistic activity
  - Simulate user interactions
  - Keep demo fresh

#### Code Quality & Refactoring
- **Service Layer Consolidation**
  - Extract all Supabase queries to services
  - Implement repository pattern
  - Create unified error handling
  - Standardize API responses
  - Remove code duplication

- **Component Architecture**
  - Extract reusable components
  - Implement compound components
  - Create component library
  - Standardize prop interfaces
  - Document component APIs

- **State Management Cleanup**
  - Migrate scattered state to Zustand
  - Implement proper store patterns
  - Add state persistence where needed
  - Remove prop drilling
  - Optimize re-renders

- **Type Safety Improvements**
  - Generate types from Supabase
  - Remove all `any` types
  - Add strict null checks
  - Create type guards
  - Implement branded types

- **Performance Refactoring**
  - Implement React.memo properly
  - Add useMemo/useCallback where needed
  - Lazy load heavy components
  - Code split by route
  - Optimize bundle size

#### Infrastructure Features
- **Push Notifications**
  - FCM/APNs setup
  - Notification categories
  - Rich notifications
  - Badge counts
  - Sound preferences

- **Deep Linking**
  - Universal links setup
  - App links configuration
  - Share to app flows
  - OAuth callback handling
  - Referral code links

- **Performance Optimization**
  - Image compression
  - Lazy loading
  - Cache strategies
  - Bundle optimization
  - Memory management

- **Error Handling**
  - Global error boundaries
  - Network error states
  - Retry mechanisms
  - Offline mode
  - Error tracking (Sentry)

- **Loading States**
  - Skeleton screens
  - Progressive loading
  - Optimistic updates
  - Smooth transitions
  - Pull-to-refresh

#### Code Organization
- **File Structure Refactoring**
  - Implement feature-based structure
  - Separate concerns properly
  - Create barrel exports
  - Organize by domain
  - Remove circular dependencies

- **Testing Infrastructure**
  - Unit test utilities
  - Integration test setup
  - E2E test framework
  - Mock service layer
  - Test data factories

- **Documentation**
  - API documentation
  - Component storybook
  - Architecture diagrams
  - Setup guides
  - Troubleshooting docs

- **Developer Experience**
  - Pre-commit hooks
  - Automated formatting
  - Lint rule enforcement
  - Type checking in CI
  - Bundle size monitoring

#### Demo Environment Setup
- **Demo Mode Toggle**
  - Special demo user accounts
  - Accelerated timers for expiration
  - Simulated live betting
  - Auto-refreshing content
  - Guided tour capability

- **Demo Scenarios**
  - New user experience
  - Power user with history
  - Winning streak scenario
  - Social engagement demo
  - Private account flows

---

## Epic 8: AI-Powered Intelligence

**Goal**: Add AI/RAG features for smart discovery and assistance

### Core Features
- **Friend Discovery ("Find Your Tribe")**
  - Analyze betting patterns
  - Match favorite teams
  - Similar risk profiles
  - Compatible bet types
  - Daily recommendations

- **Smart Feed Algorithm**
  - Mix following + recommended
  - Based on teams you bet
  - Betting style matching
  - Time-based relevance
  - Engagement optimization

- **Intelligent Notifications**
  - Learn user patterns
  - Priority filtering
  - Consensus alerts ("3 trusted friends bet Lakers")
  - Time-based delivery
  - Bundling similar notifications

- **AI Content Generation**
  - Smart caption suggestions
  - Betting insight generation
  - Pattern recognition alerts
  - Performance summaries
  - Weekly recap generation

- **Context-Aware Features**
  - Best time to post suggestions
  - What to share recommendations
  - Betting opportunity alerts
  - Risk management insights
  - Trend identification

- **AI Moderation**
  - Toxic content detection
  - Spam identification
  - Pattern recognition
  - Priority flagging
  - Learning from decisions

---

## Epic 9: Launch Preparation

**Goal**: Final polish and deployment readiness

### Core Features
- **App Store Preparation**
  - App icons (all sizes)
  - Screenshots
  - App Store descriptions
  - Privacy policy
  - Terms of service

- **Play Store Preparation**
  - Feature graphics
  - Promotional materials
  - Content rating
  - Data safety form
  - Target audience

- **Final UI Polish**
  - Animation refinement
  - Haptic feedback
  - Sound effects
  - Dark mode support
  - Accessibility features

- **Analytics Setup**
  - Event tracking
  - User flows
  - Conversion funnels
  - Performance metrics
  - Crash reporting

- **Launch Infrastructure**
  - Production environment
  - Monitoring setup
  - Backup strategies
  - Support system
  - Update mechanism

---

## Implementation Timeline

### Phase 1: Core MVP (Days 1-4)
**Day 1**: Epic 1-2 (Foundation & Auth) ✅  
**Day 2**: Epic 3 (Camera & Content) 🚧  
**Day 3**: Epic 4 (Feed & Social)  
**Day 4**: Epic 5 (Betting System)

### Phase 2: Enhancement (Days 5-6)
**Day 5**: Epic 6 (Messaging)  
**Day 6**: Epic 7 (Polish, Mock Data & Automation)

### Phase 3: AI & Launch (Day 7)
**Day 7 AM**: Epic 8 (AI Features)  
**Day 7 PM**: Epic 9 (Launch Prep)

---

## Technical Milestones

### Day 1 Complete ✅
- [x] OAuth working
- [x] Users can onboard
- [x] Database ready
- [x] Jobs scheduled

### Day 2 Complete  
- [ ] Camera captures media
- [ ] Effects system working
- [ ] Posts can be created
- [ ] Stories functional

### Day 3 Complete
- [ ] Feed displays posts
- [ ] Search/discovery works
- [ ] Following system active
- [ ] Social features complete

### Day 4 Complete
- [ ] Bets can be placed
- [ ] Tail/fade functional
- [ ] Bankroll system works
- [ ] MVP feature complete

### Day 5 Complete
- [ ] Messages sending
- [ ] Groups functional
- [ ] Real-time working
- [ ] Notifications active

### Day 6 Complete
- [ ] All mock data updated
- [ ] Edge functions deployed
- [ ] Automated systems running
- [ ] Demo environment ready
- [ ] Performance optimized
- [ ] Errors handled

### Day 7 Complete
- [ ] AI features integrated
- [ ] App store ready
- [ ] Analytics tracking
- [ ] Ready for launch

---

## Key Implementation Notes

### Ephemeral Architecture
```typescript
// All content has expiration
interface EphemeralContent {
  id: string;
  expiresAt: Date;
  softDeletedAt?: Date;
  hardDeletedAt?: Date;
}

// Permanent data for trust
interface PermanentRecord {
  userId: string;
  bets: Bet[];
  winLossRecord: Stats;
  weeklySnapshots: WeeklyPerformance[];
}
```

### Weekly Reset System
```typescript
// Every Monday at midnight
async function weeklyReset() {
  // Reset all bankrolls to base + referral bonus
  await resetBankrolls();
  
  // Recalculate all badges
  await calculateWeeklyBadges();
  
  // Archive previous week's performance
  await archiveWeeklyStats();
  
  // Send "Fresh Week" notifications
  await notifyFreshStart();
}
```

### Privacy-First Design
- Private accounts require approval
- Blocked users see nothing
- Display names enable anonymity
- OAuth data never exposed
- Ephemeral by default

---

*This roadmap represents the complete SnapBet vision: where betting becomes social, ephemeral, and intelligent.*