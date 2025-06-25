# SnapBet Development Roadmap v2.0

## Project Overview

**Timeline**: 7 Days  
**Phase 1**: Core MVP (Days 1-3)  
**Phase 2**: AI Enhancement (Days 4-7)  
**Platform**: Mobile-first (React Native/Expo)

---

## Epic 1: Foundation & Infrastructure

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

## Epic 2: Authentication & User System

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

## Epic 3: Camera & Content Creation

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

---

## Epic 4: Feed & Social Engagement

**Goal**: Create engaging social feed with ephemeral content

### Core Features
- **Feed Implementation**
  - FlashList for performance
  - Following-only content (Phase 1)
  - Three content types display
  - Pull-to-refresh
  - Infinite scroll

- **Post Features**
  - Emoji reactions (6 types)
  - Text comments (280 chars)
  - View counts
  - Expiration timers
  - Share to story/DM

- **Stories System**
  - Horizontal story bar
  - Full-screen viewer
  - Auto-advance
  - View tracking
  - 24-hour expiration

- **Content Expiration**
  - Pick posts: Game end time
  - Other posts: 24 hours
  - Visual countdown indicators
  - Auto-removal from feed
  - Soft delete implementation

- **Content Moderation**
  - Report posts/users
  - 3 reports = auto-hide
  - Block user functionality
  - Hide blocked users' content
  - Admin review queue

---

## Epic 5: Betting & Bankroll System

**Goal**: Complete betting functionality with weekly reset system

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

---

## Epic 6: Tail/Fade & Social Betting

**Goal**: Build viral betting mechanics with shared outcomes

### Core Features
- **Tail Mechanics**
  - One-tap to copy bet
  - Same stake amount
  - Link to original pick
  - Real-time count updates
  - Notification to poster

- **Fade Mechanics**
  - One-tap opposite bet
  - Smart opposite calculation
  - Link as fade
  - Track fade performance
  - Build "fade god" reputation

- **Social Proof**
  - Live tail/fade counts
  - List of who tailed/faded
  - Influence scoring
  - Performance impact display

- **Restrictions**
  - Disable 5 min before game
  - Cannot tail/fade own picks
  - Cannot tail/fade twice
  - Respect private accounts
  - Bankroll requirements

- **Pick Sharing**
  - From bet confirmation
  - "Share Pick" button
  - Auto-create pick post
  - Enable tail/fade buttons
  - Track engagement

---

## Epic 7: Messaging & Real-time

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

## Epic 8: Profiles & Discovery

**Goal**: User profiles, discovery, and weekly achievements

### Core Features
- **User Profiles**
  - Posts tab (ephemeral content)
  - Bets/Picks tab (permanent record)
  - Performance stats display
  - Follow/unfollow
  - Follow requests (private accounts)

- **Weekly Badge System**
  - 🔥 Hot Right Now (3+ wins this week)
  - 💰 Week's Profit King
  - 🌊 Riding the Wave
  - 🎯 This Week's Sharp (70%+)
  - 🎪 Fade God
  - ⚡ Most Active (10+ picks)
  - 👻 Ghost (inactive 3+ days)
  - 🏆 Sunday Sweep

- **Discovery Features**
  - User search
  - Team-based discovery
  - Trending picks (today)
  - Hot bettors (this week)
  - Fade material section

- **Performance Tracking**
  - Rolling 7-day stats
  - Sport-specific breakdown
  - Bet type analysis
  - Time-based patterns
  - Visual charts

- **Profile Management**
  - Edit display name/pic
  - Privacy controls
  - Block/unblock users
  - Bankroll visibility
  - Stats preferences

---

## Epic 9: AI-Powered Discovery

**Goal**: Smart friend recommendations and feed algorithm

### Core Features
- **Friend Recommendations**
  - Analyze betting patterns
  - Match favorite teams
  - Similar risk profiles
  - Compatible bet types
  - Active time alignment

- **"Find Your Tribe" Algorithm**
  - Daily suggestions
  - Show reasoning ("Bets 68% NBA unders like you")
  - Compatibility scoring
  - Success prediction
  - Diverse recommendations

- **Feed Algorithm** (Upgrade from following-only)
  - Mix following + recommended
  - Based on teams you bet
  - Betting style matching
  - Time-based relevance
  - Engagement optimization

- **Discovery Surfaces**
  - "Bettors Like You" section
  - Post-bet recommendations
  - Similar bettor alerts
  - Tribe notifications
  - Weekly summaries

- **AI Content Moderation**
  - Toxic content detection
  - Spam identification
  - Harmful pattern recognition
  - Priority flagging
  - Automated actions

---

## Epic 10: Intelligent Notifications & Safety

**Goal**: Smart notification system with enhanced safety features

### Core Features
- **Smart Notifications**
  - Learn user patterns
  - Priority filtering
  - Consensus alerts ("3 people you trust bet Lakers")
  - Time-based delivery
  - Importance scoring

- **Notification Types**
  - Tail/fade alerts
  - Win/loss results
  - New followers
  - Badge achievements
  - Trending picks

- **Intelligent Bundling**
  - Group similar notifications
  - Daily summaries
  - Peak time delivery
  - Quiet hour respect
  - Context awareness

- **AI Safety Features**
  - Harassment detection
  - Pattern recognition
  - User behavior analysis
  - Automated interventions
  - Risk scoring

- **Advanced Moderation**
  - AI-powered review queue
  - Severity classification
  - Context understanding
  - False positive reduction
  - Learning from decisions

---

## Implementation Timeline

### Phase 1: Core MVP (Days 1-3)
**Day 1**: Epics 1-2 (Foundation & Auth)  
**Day 2**: Epics 3-4 (Camera & Feed)  
**Day 3**: Epics 5-7 (Betting, Tail/Fade, Messaging)

### Phase 2: AI Enhancement (Days 4-7)
**Day 4**: Epic 8 (Profiles & Discovery)  
**Day 5**: Epic 9 (AI Discovery)  
**Day 6**: Epic 10 (Smart Notifications)  
**Day 7**: Polish, Testing & Launch

---

## Technical Milestones

### Day 1 Complete
- [ ] OAuth working
- [ ] Users can onboard
- [ ] Database ready
- [ ] Jobs scheduled

### Day 2 Complete  
- [ ] Camera captures media
- [ ] Feed displays posts
- [ ] Stories working
- [ ] Effects apply

### Day 3 Complete
- [ ] Bets can be placed
- [ ] Tail/fade functional
- [ ] Messages sending
- [ ] MVP feature complete

### Day 4 Complete
- [ ] Profiles polished
- [ ] Badges calculating
- [ ] Discovery working
- [ ] Search functional

### Day 5 Complete
- [ ] AI recommendations live
- [ ] Feed algorithm active
- [ ] Tribe finding works
- [ ] Smart suggestions

### Day 6 Complete
- [ ] Notifications intelligent
- [ ] Safety features active
- [ ] All AI integrated
- [ ] Performance optimized

### Day 7 Complete
- [ ] App polished
- [ ] Demo recorded
- [ ] Deployed to TestFlight
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