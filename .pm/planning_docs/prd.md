# SnapBet PRD

## Project Overview

**Vision**: Build a social sports betting platform that transforms solitary betting into a shared social experience through ephemeral content, tail/fade mechanics, and community engagement.

**Problem Statement**: Sports betting is currently a solo activity despite sports being inherently social. Bettors lack a platform to share picks, celebrate wins, commiserate losses, and build camaraderie around their betting journey. Existing platforms focus on transactions, not community.

**Success Criteria**: 
- Fully functional MVP with core Snapchat-like features by Day 3
- 6 complete RAG-enhanced user stories by Day 7  
- Smooth, native-feeling mobile experience with 60fps animations
- Active user engagement with tail/fade mechanics
- Successful demo showing the social betting experience

## User Stories

### Story 1: Social Pick Sharing
**As a** semi-casual sports bettor  
**I want to** share my picks with friends through photos/videos  
**So that** I can build credibility and create accountability for my bets

### Story 2: Tail/Fade Decisions  
**As a** semi-casual sports bettor  
**I want to** quickly tail or fade my friends' picks  
**So that** I can leverage collective knowledge or bet against poor performers

### Story 3: Ephemeral Content
**As a** semi-casual sports bettor  
**I want** all my content to be ephemeral with appropriate expiration times  
**So that** my feed stays fresh and my bad picks don't haunt me forever

**Acceptance Criteria**:
- Pick posts expire at game end (~3 hours after start)
- Outcome posts expire 24 hours after creation
- Content posts expire 24 hours after creation
- Stories always expire after 24 hours
- Clear visual indicators of expiration time
- Cannot interact with expired content

### Story 4: Group Betting Coordination
**As a** semi-casual sports bettor  
**I want to** coordinate bets with my friend groups through messaging  
**So that** we can share the excitement of wins and losses together

### Story 5: Performance Tracking
**As a** semi-casual sports bettor  
**I want to** see my stats and others' performance metrics  
**So that** I know who to tail and who to fade

### Story 6: AI-Powered Insights (RAG)
**As a** semi-casual sports bettor  
**I want** AI to identify my successful patterns and generate relevant content  
**So that** I can improve my betting and share better content

## User Story to Feature Mapping

| User Story | Required Features | Epic |
|------------|------------------|------|
| Story 1: Social Pick Sharing | - Camera with overlays<br>- Pick post creation<br>- Feed display<br>- Media storage<br>- Bet attachment to photos<br>- Three post types system | Epic 3, 4 |
| Story 2: Tail/Fade Decisions | - Tail/fade buttons<br>- Bet mirroring logic<br>- Opposite bet logic for fades<br>- Action tracking<br>- Real-time counts | Epic 4 |
| Story 3: Ephemeral Content | - Auto-expiration system<br>- Stories feature<br>- Countdown displays<br>- Cleanup jobs<br>- Game-time expiration | Epic 1, 4 |
| Story 4: Group Coordination | - DM system<br>- Group chat creation<br>- Pick sharing in chat<br>- Message reactions<br>- Disappearing messages | Epic 5 |
| Story 5: Performance Tracking | - Stats calculation<br>- Profile displays<br>- Bankroll tracking<br>- Performance tabs<br>- Gamification badges<br>- Bets/Picks profile tab | Epic 2, 4 |
| Story 6: AI Insights | - Pattern analysis<br>- Caption generation<br>- Smart notifications<br>- Friend recommendations<br>- Weekly recaps | Epic 7, 8, 9 |

## Content & Posting System

### Three Types of Posts/Stories

#### 1. Content Posts/Stories
**Purpose**: General social content, reactions, commentary  
**Features**:
- Photo/video with emoji effects only
- No bet attachments
- Text comments and emoji reactions
- 24-hour expiration
- Created from camera tab

#### 2. Pick Posts/Stories  
**Purpose**: Share betting picks with tail/fade functionality  
**Features**:
- Photo/video with bet overlay showing:
  - Teams involved
  - Bet type (spread/total/moneyline)
  - Odds
  - Side selected
  - "Tailing @username" or "Fading @username" badge if applicable
- Combined with emoji effects for personality
- Tail/fade buttons enabled
- Expires at game start time
- Created from bet confirmation screen
- Shows in profile Bets/Picks tab

#### 3. Outcome Posts/Stories
**Purpose**: Share results and build reputation  
**Features**:
- Photo/video with outcome overlay showing:
  - Win/Loss badge
  - Profit/loss amount
  - Final score
  - Original bet details
  - Number of people who tailed/faded
- Automatic emoji effects based on outcome
- Comments enabled for reactions
- 24-hour expiration
- Created from settled bets in profile
- Updates user's visible stats

### Entry Points & User Flow

#### Pick Post Creation Flow
1. User places bet through Games tab
2. Bet confirmation shows "Share Pick" button
3. Camera opens with bet overlay pre-loaded
4. User can add selfie/video reaction
5. Select emoji effect for confidence/style
6. Post to feed and/or story
7. Pick appears with tail/fade buttons

#### Outcome Post Creation Flow
1. Bet settles (win/loss determined)
2. User receives notification
3. Navigate to Profile → Bets/Picks tab
4. Tap settled bet
5. "Share Result" button appears
6. Camera opens with outcome overlay pre-loaded
7. Capture reaction with auto-suggested effects
8. Post to feed and/or story

#### Content Post Creation Flow
1. Tap camera tab (raised button)
2. No bet context loaded
3. Full emoji effects library available
4. Capture photo/video
5. Add caption
6. Post to feed and/or story

### Overlay System

#### Bet Overlays (Pick Posts)
**Visual Design**: Semi-transparent card overlay
**Information Displayed**:
- Team logos or abbreviated names
- Bet type indicator
- Line/odds in large text
- Potential payout (optional - privacy setting)
- Tail/fade origin if applicable

**Positioning**: Bottom third or top banner based on content

#### Outcome Overlays (Result Posts)
**Visual Design**: Bold result indicator with details
**Information Displayed**:
- Large WIN/LOSS indicator
- Profit/loss amount (e.g., "+$150" or "-$100")
- Final score
- Original bet line for context
- Tail/fade summary (e.g., "12 people tailed this")

**Positioning**: Centered or bottom third

### Engagement Features

#### Comments (Feed Posts Only)
- Text-only comments to maintain focus
- Character limit: 280
- Common comment types:
  - Analysis: "Love this over, refs calling everything"
  - Questions: "Why fade the home team?"
  - Support: "Tailing! Let's ride"
  - Results: "We cashed! 💰"

#### Reactions (All Posts)
- Quick emoji reactions: 🔥💯😬💰🎯🤝
- Tap to react, tap again to remove
- Show reaction count and top 3 emojis
- See who reacted with each emoji

#### Tail/Fade (Pick Posts Only)
- One-tap action buttons
- Cannot tail/fade after game starts
- Cannot tail/fade own picks
- Updates counts in real-time
- Creates linked bet in system
- Notifies original poster

### Profile Integration

#### Bets/Picks Tab
**Displays**:
- All user's picks (active and settled)
- Win/loss record
- Profit/loss tracking
- Sport-specific performance
- Tail/fade counts per pick
- Quick "Share Result" for settled bets

**Filters**:
- Active bets
- Settled bets
- By sport
- By bet type
- Wins only / Losses only

## Technical Architecture

### High-Level Architecture
The system follows a client-server architecture with real-time capabilities:
- **Mobile Client**: React Native/Expo app with Tamagui UI components
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage + Edge Functions)  
- **External Services**: Mock Odds API following The Odds API specification
- **AI Services**: OpenAI GPT-4 via Vercel AI SDK for RAG features (Phase 2)
- **State Management**: Zustand for client state + React Query for server state

*See: [Technical Architecture Document](./docs/technical-architecture.md) for detailed diagrams*

### Technology Stack
- **Frontend Framework**: React Native with Expo (SDK 50)
- **UI Library**: Tamagui for native-performance components
- **Animation**: React Native Reanimated 3 for 60fps animations
- **Navigation**: Expo Router (file-based routing)
- **State Management**: 
  - Zustand for app state
  - React Query for server state
  - MMKV for persistent storage
- **Backend**: 
  - Supabase (PostgreSQL, Auth, Realtime, Storage)
  - Edge Functions for business logic
- **Authentication**: Supabase Auth (Google/Twitter OAuth only)
- **Media Handling**: 
  - Expo Camera for capture
  - Expo Image for optimized display
  - React Native ViewShot for overlay composition
- **Lists**: FlashList for high-performance scrolling
- **Bottom Sheets**: @gorhom/bottom-sheet for native feel
- **Haptics**: react-native-haptic-feedback
- **Hosting**: 
  - Mobile: Expo EAS Build + Updates
  - Backend: Supabase Cloud
- **AI/RAG** (Phase 2): 
  - Vercel AI SDK
  - OpenAI GPT-4
  - Supabase Vector embeddings
- **Package Manager**: Bun (with workspaces)

### Repository Structure
```
snapbet/
├── apps/
│   └── mobile/                    # React Native/Expo app
│       ├── app/                   # Expo Router screens
│       ├── components/            # UI components
│       │   ├── overlays/          # Bet and outcome overlays
│       │   ├── effects/           # Emoji effects system
│       │   └── feed/              # Post cards, comments
│       ├── hooks/                 # Custom hooks
│       ├── services/              # API services
│       ├── stores/                # Zustand stores
│       └── theme/                 # Tamagui theme
├── packages/
│   ├── shared/                    # Shared types, utils
│   └── supabase/                  # DB client, queries
├── supabase/
│   ├── migrations/                # Database migrations
│   └── functions/                 # Edge functions
├── scripts/                       # Admin scripts
│   ├── add-games.ts              # Add mock games
│   ├── settle-bets.ts            # Settle bets
│   └── seed-data.ts              # Seed mock users
└── docs/                         # All documentation
```

*See: [Repository Structure Document](./docs/repository-structure.md) for complete details*

## API Specifications

Core API endpoints include:
- Authentication (OAuth flow - Google/Twitter only)
- User management (profiles, follows, stats)
- Feed operations (posts, stories, reactions, comments) 
- Betting operations (place, tail, fade, settle)
- Messaging (DMs, group chats, reactions)
- Games/Odds (mock data following The Odds API spec)
- Notifications (tails, fades, wins, followers)
- Real-time subscriptions (feed, chats, notifications)

*See: [API Specification Document](./docs/api-specification.md) for complete endpoint documentation*

## Data Models

Primary entities:
- Users (profiles, OAuth data, preferences)
- Bankrolls (mock money tracking, resets)
- Bets (picks, outcomes, settlements, tail/fade links)
- Posts (media required, captions, expiration, pick details, post type)
- Stories (24-hour media content)
- Comments (text-only, on feed posts)
- Reactions (emoji reactions on all content)
- Pick Actions (tails, fades, resulting bets)
- Chats & Messages (DMs, groups, disappearing)
- Games & Odds (cached from mock API)
- Notifications (betting events, social events)

Key relationships:
- Posts can have attached bets (pick posts)
- Posts have specific types: content, pick, outcome
- Tails create linked bets with same parameters
- Fades create opposite bets
- All content has expiration times
- Comments belong to posts
- Reactions belong to posts/stories

*See: [Database Design Document](./docs/database-design.md) for complete schema*

## UI/UX Design System

### Design Principles
- Light theme with warm, clean aesthetic
- Native iOS/Android patterns (platform-specific)
- 60fps animations with spring physics
- Haptic feedback on all interactions
- Instagram-style stories at feed top
- Bottom sheets for contextual actions
- Emerald primary color for CTAs
- Card-based layout with subtle shadows
- Clear visual hierarchy for overlays

### Navigation Structure
- **Header**: Profile drawer (left), Logo (center), Notifications (right)
- **Bottom Tabs**: Feed, Games, Camera (raised button), Messages, Search
- **Modals**: Camera, story viewer, bet placement

### Key UI Components (Tamagui)
- Native-feeling buttons with spring animations
- Smooth bottom sheets for betting flows
- FlashList for high-performance feed scrolling
- Gesture-based story viewer
- Haptic feedback on tails/fades
- Overlay templates for bet information
- Comment threads with proper nesting
- Reaction picker with animation

### Visual Identity
- **Primary**: Emerald (#059669)
- **Tail**: Bright Blue (#3B82F6)
- **Fade**: Orange (#FB923C)
- **Win**: Gold (#EAB308)
- **Loss**: Red (#EF4444)
- **Background**: Warm off-white (#FAF9F5)
- **Surface**: White (#FFFFFF)
- **Surface Alt**: Light warm (#F5F3EE)

*See: [UI/UX Design Document](./docs/ui-ux-design.md) for all screens and flows*

## Features to Include (MVP)

### Epic 1: Foundation & Infrastructure
- **Goal**: Core app infrastructure and foundational setup
- **User Stories Addressed**: Enables all stories
- **Features**:
  - Monorepo structure with bun workspaces
  - Expo/React Native project setup
  - Supabase backend configuration
  - Database schema deployment
  - Navigation structure with drawer + tabs
  - Tamagui theme setup
  - 30 mock users with personalities
  - Admin scripts for development

### Epic 2: Authentication & User System
- **Goal**: OAuth implementation, user onboarding, and engagement systems
- **User Stories Addressed**: Enables all stories, particularly Story 5
- **Features**:
  - Passwordless OAuth (Google/Twitter only)
  - Automatic profile picture/username from OAuth
  - Username selection and validation
  - Favorite team selection (all 62 NFL/NBA teams)
  - Initial friend suggestions with badge display
  - Badge/achievement system (8 types)
  - Stats display customization
  - Profile with Posts/Bets tabs
  - Complete drawer navigation menu
  - Notification system foundation
  - Referral system with rewards
  - Bankroll initialization ($1,000)
  - User settings and preferences

### Epic 3: Social Feed & Camera
- **Goal**: Content creation and consumption with emoji effects
- **User Stories Addressed**: Story 1, 3
- **Features**:
  - Camera with emoji effects system (73 effects)
  - Required photo/video for all posts
  - Three types of posts/stories (content, pick, outcome)
  - Feed with engagement features
  - Instagram-style stories bar
  - Post expiration (24h or game time)
  - Text comments on feed posts
  - Emoji reactions on all content
  - Username displays with profit/streak badges

### Epic 4: Betting System & Pick Sharing
- **Goal**: Complete betting functionality with social mechanics
- **User Stories Addressed**: Story 1, 2, 5
- **Features**:
  - Mock games following The Odds API format
  - Bottom sheet bet placement
  - **Pick Post Creation**:
    - "Share Pick" from bet confirmation
    - Bet overlay system showing teams/odds/selection
    - Combine with emoji effects
    - Enable tail/fade buttons
  - **Tail/Fade Mechanics**:
    - One-tap from pick posts
    - Tail copies exact bet
    - Fade creates opposite bet
    - Real-time count updates
    - Notifications to poster
  - **Outcome Post Creation**:
    - "Share Result" from settled bets
    - Outcome overlay showing W/L and profit/loss
    - Auto-suggested celebration/commiseration effects
  - **Profile Integration**:
    - Bets/Picks tab showing all picks
    - Quick share buttons for settled bets
    - Performance tracking by sport/type
  - Bet settlement engine
  - Unlimited bankroll resets
  - Manual settlement via scripts

### Epic 5: Messaging & Real-time
- **Goal**: Private communication features
- **User Stories Addressed**: Story 4
- **Features**:
  - Direct messages (1-on-1)
  - Group chats (2-50 members)
  - Share picks to chats
  - Tail/fade from within chats
  - Message reactions
  - 24-hour disappearing messages
  - Read receipts
  - Real-time updates

### Epic 6: Discovery & Polish
- **Goal**: User profiles and social discovery
- **User Stories Addressed**: Story 5
- **Features**:
  - Click username → profile
  - Profile tabs (Picks, Performance)
  - Follow/unfollow functionality
  - Performance breakdown by sport/type
  - Search/explore tab
  - Trending picks & hot bettors
  - Notifications system
  - UI polish and animations

*See: [Feature Specification Document](./docs/feature-specification.md) for detailed requirements*

## Features to Exclude (Post-MVP)

### Future Enhancements
- Live betting/in-game updates
- Complex parlays
- Public tournaments/contests
- Advanced analytics dashboard
- Voice/video calls
- Web version
- Apple Watch app
- Public/verified accounts
- Live score integration
- Automatic outcome post generation

### Explicitly Out of Scope
- Real money transactions
- Direct sportsbook integration
- Live game streaming
- NFT/crypto features
- Betting advice/tips content
- Odds comparison across books
- Responsible gambling tools (MVP is entertainment only)

## Development Approach

### Sprint Plan
- **Sprint 1 (Day 1)**: Foundation - Auth, Navigation, Database, Tamagui Setup
- **Sprint 2 (Day 2)**: Core Features - Camera, Feed, Stories, Effects
- **Sprint 3 (Day 2-3)**: Betting System - Games, Bets, Pick/Outcome Posts, Tail/Fade
- **Sprint 4 (Day 3)**: Social Layer - Messaging, Profiles, Comments, Polish
- **Sprint 5 (Days 4-5)**: RAG Integration - AI Features, Embeddings
- **Sprint 6 (Days 6-7)**: Enhancement, Testing & Launch Prep

*See: [Development Roadmap Document](./docs/development-roadmap.md) for detailed sprint plans*

### Coding Standards
- TypeScript strict mode
- Modular component architecture
- Optimistic UI updates for snappy feel
- Error boundaries for stability
- Accessibility compliance (a11y)
- Platform-specific code when needed

### Testing Strategy
- Unit tests for betting logic
- Integration tests for tail/fade flows
- Manual testing for animations/gestures
- Mock data for consistent demos
- Beta testing with r/sportsbook community

### Mock Data Strategy
- 20-30 fake users with personalities
- 50+ pre-generated picks
- Active group chats with history
- Realistic bet distribution
- Trending content that updates
- Sample celebration videos

*See: [Mock Data Strategy Document](./docs/mock-data-strategy.md) for details*

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| API rate limits (500/month) | High | Use mock data for MVP, aggressive caching |
| Real-time performance at scale | Medium | Optimize subscriptions, implement pagination |
| Bet settlement accuracy | High | Manual settlement for demo, comprehensive testing |
| Complex tail/fade edge cases | Medium | Clear rules, thorough documentation |
| User adoption | Medium | Launch to r/sportsbook, referral incentives |
| App store approval | Low | Clear "entertainment only" disclaimers |
| Overlay readability | Medium | High contrast design, user testing |

## Open Questions

- Should we support simple 2-3 leg parlays in MVP?
- How do we handle ties/pushes in fade scenarios?
- Should stories auto-generate for milestones?
- What's the max group chat size?
- Do we need a tutorial/onboarding flow?

## Admin Tools

### Settlement & Game Management
- Scripts to add games with mock odds
- Scripts to settle bets with scores
- Scripts to trigger notifications
- Debug panel in app (dev only)
- Ability to reset all data

*See: [Admin Tools Document](./docs/admin-tools.md) for details*

## Notification Strategy

### Push Notification Triggers
- Someone tails/fades your pick
- Your bet wins/loses
- Your tail/fade wins/loses
- New follower
- Direct message received
- Mentioned in group chat
- Milestone achieved (streak, profit)
- Comment on your post
- Reaction to your content

## User Acquisition Plan

### Launch Strategy
- Soft launch to r/sportsbook subreddit
- Referral system (bonus bankroll)
- Social media presence (Twitter/X)
- Influencer partnerships
- App Store optimization

### Bonus Points System
- 5 points per 10 users acquired
- Maximum 50 bonus points
- Track via invite codes

## Appendix

### Supporting Documents
1. [Technical Architecture](./docs/technical-architecture.md)
2. [API Specification](./docs/api-specification.md)
3. [Database Design](./docs/database-design.md)
4. [UI/UX Design](./docs/ui-ux-design.md)
5. [Feature Specification](./docs/feature-specification.md)
6. [Development Roadmap](./docs/development-roadmap.md)
7. [State Management Architecture](./docs/state-management.md)
8. [Mock Data Strategy](./docs/mock-data-strategy.md)
9. [Admin Tools](./docs/admin-tools.md)
10. [Notification System](./docs/notification-system.md)

---

*This PRD is a living document. It will be updated as decisions are made during implementation. All significant changes should be documented and approved.*