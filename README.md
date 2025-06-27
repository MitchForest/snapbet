# SnapBet

A social betting app that combines the ephemeral content style of Snapchat with sports betting picks sharing.

## Quick Start

### Prerequisites

- **macOS** with Xcode installed (for iOS development)
- **Node.js 18+**
- **Bun** package manager

### Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/mitchforest/snapbet.git
cd snapbet

# 2. Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# 3. Install dependencies
bun install

# 4. iOS setup
cd ios && pod install && cd ..

# 5. Create environment file
cat > .env << EOF
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

X_API=you_twitter_api
X_API_KEY_SECRET=your_twitter_api_secret
X_CLIENT_ID=your_twitter_client_id
X_CLIENT_SECRET=your_twitter_client_secret
X_BEARER_TOKEN=your_twitter_bearer_token

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EOF

# 6. Run the app
bun run ios
```

### Test with Demo Data

To see the app fully populated with realistic content:

```bash
# Create a complete mock ecosystem
bun run mock:setup --username=YOUR_USERNAME

# This creates:
# - 30 mock users with distinct personalities
# - Active stories and posts
# - Group chats with conversations
# - Trending picks and hot bettors
# - Your personalized feed
```

### Troubleshooting

```bash
# Clear Metro cache
bun expo start -c

# iOS build issues
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..

# TypeScript errors
bun run typecheck

# Linting issues
bun run lint
```

## Development

### Tech Stack

- **Frontend**: React Native with Expo
- **UI**: Tamagui components
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State**: Zustand
- **Language**: TypeScript

### Project Structure

```
snapbet/
├── app/          # Expo Router screens
├── components/   # Reusable UI components
├── services/     # API and business logic
├── hooks/        # Custom React hooks
├── stores/       # Global state management
├── types/        # TypeScript definitions
└── supabase/     # Database migrations
```

### Available Scripts

```bash
# Development
bun start               # Start Expo dev server
bun run ios            # Run on iOS simulator
bun run android        # Run on Android emulator

# Code Quality
bun run lint           # Run ESLint
bun run typecheck      # Check TypeScript

# Mock Data
bun run mock:setup     # Create demo environment
bun run mock:progress  # Simulate activity
bun run mock:cleanup   # Remove all mock data

# Database
bun run db:add-games   # Add real games from API
bun run db:settle      # Settle completed games
```

### Database Setup

If using a real Supabase instance:

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations from `supabase/migrations/` in order
3. Update `.env` with your project credentials

For local testing, you can use dummy environment values.

---

## What is SnapBet?

SnapBet is the ephemeral social betting platform where Gen Z shares picks, celebrates wins, and forgets losses - all before tomorrow.

### Our Spiky POVs: Why Sports Betting is Broken for Young People

#### POV 1: Sports Betting Has a Social Contradiction
Sports are inherently social - we watch together, celebrate together, suffer together. Yet sports betting has been relegated to a solitary, transactional experience. Current sportsbooks treat betting like stock trading when it should feel like tailgating.

**The Non-Consensus Truth**: The real product isn't efficient bet placement - it's the shared emotional journey. The memory of "that night we all tailed Jake's terrible Knicks pick" is worth more than any individual win.

#### POV 2: Gen Z Demands Ephemerality
Gen Z uses ephemeral content as rebellion against the "permanent record" internet. They've watched millennials get canceled for old tweets and their parents post cringe on Facebook. They understand that context changes, and content should too.

**The Non-Consensus Truth**: Permanence is a bug, not a feature. Gen Z doesn't want to build a betting portfolio - they want to live in the moment with people who get it.

## Meet Tyler: Our Target User

**Tyler, 24, Junior Data Analyst in Chicago**

Tyler lives two lives:
- **9-5 Tyler**: LinkedIn optimized, building his "personal brand," careful about his digital footprint
- **Weekend Tyler**: Six beers deep, screaming at RedZone, has $200 across five different parlays

His current reality:
- Makes $75K, bets $100-200 per week as "entertainment budget"
- Has 4 sportsbook apps but none feel social
- Screenshots every bet to share across 3 different group chats
- Follows betting Twitter but won't tweet (boss might see)
- Posts in r/sportsbook but it's impersonal and full of liars

What Tyler actually needs:
- **Identity Separation**: A betting identity that won't haunt his LinkedIn
- **Trust & Reputation**: Know who's actually good vs. who's just loud
- **Shared Experiences**: Celebrate wins and commiserate losses with people who get it
- **Authentic Reactions**: Somewhere to post "HOLY FUCK WE HIT THE OVER" at 11:47 PM
- **Tribal Belonging**: Find his people without the professional risk

## User Stories & Solutions

### 1. The Credibility Problem
**"I don't know who to trust - everyone claims they're winning but I can't verify it."**

SnapBet Solutions:
- **Performance Tracking**: Real-time win/loss records, ROI, sport-specific breakdowns
- **Badge System**: 🔥 Hot Streak, 💰 Profit Leader, 📈 High ROI, 🎯 Sharp
- **Transparent Stats**: Can't delete bad picks or manipulate records

### 2. The Permanent Record Problem
**"I don't want my degen parlays from college haunting me forever."**

SnapBet Solutions:
- **Pick Post Expiration**: Expires at game start time
- **24-Hour Content**: All posts disappear after a day
- **Ephemeral Messages**: DMs expire (1hr/24hr/1 week options)
- **Bankroll Resets**: Unlimited fresh starts

### 3. The Boring Bet Slip Problem
**"Screenshots of bet slips are lifeless and boring."**

SnapBet Solutions:
- **Camera-First Creation**: Required photo/video for all posts
- **73 Emoji Effects**: Fire for hot picks, money rain for confidence
- **Custom Overlays**: Bet details that pop
- **Three Post Types**: Content, picks, and outcomes

### 4. The Isolation Problem
**"I just hit a 5-leg parlay and my girlfriend doesn't care."**

SnapBet Solutions:
- **Tail/Fade Mechanics**: One-tap to join someone's pick
- **Real-Time Engagement**: Live counts, comments, reactions
- **Group Chats**: Coordinate bets with your crew
- **Shared Outcomes**: Celebrate/commiserate together

### 5. The Missing My People Problem (AI-Enhanced)
**"I know my tribe is out there - people who bet like me, love the same teams, take similar risks - but I can't find them."**

SnapBet AI Solutions:
- **Pattern Analysis**: Identifies your betting style, team preferences, risk profile
- **Smart Recommendations**: "Follow @sarah - 68% on Cowboys unders like you"
- **Compatibility Scoring**: Matches based on risk profiles, teams, timing
- **Dynamic Updates**: Recommendations evolve as your style changes

### 6. The Notification Chaos Problem (AI-Enhanced)
**"I'm either missing great picks from people I trust or getting spammed with notifications I don't care about."**

SnapBet AI Solutions:
- **Pattern Recognition**: Learns whose picks you actually tail
- **Smart Prioritization**: "3 of your most tailed users bet the same game"
- **Contextual Filtering**: Quiet during losing streaks, active during your betting windows
- **Intelligent Grouping**: "5 people tailed your pick" (not 5 separate alerts)

## The Mock Ecosystem

Our sophisticated mock system creates a living, breathing betting community:

### Mock User Personalities
- **Sharp Bettors** (4): Data-driven, analytical, post early morning
- **Degens** (5): High-energy, emotional, active late night
- **Fade Material** (4): Overconfident, often wrong, make bad parlays
- **Contrarians** (3): Fade public sentiment, look for value
- **Homers** (3): Bet on favorite teams, biased but passionate

### Explore Page Sections
- **🔥 Hot Bettors**: Users with 70%+ win rate in last 7 days
- **📈 Trending Picks**: Posts with 15-25 tails in last 24 hours
- **🎪 Fade Gods**: Users with poor records that others successfully fade
- **⭐ Rising Stars**: New users with 75%+ win rate

## Why SnapBet is the Inevitable Solution

We're building the anti-LinkedIn for sports betting. SnapBet is the first platform that understands:

1. **Betting content should expire like the games themselves**
2. **Your Wednesday night degen parlay shouldn't define your Friday job interview**
3. **The social experience is the product, not a feature**
4. **Gen Z wants to be legendary for 24 hours, not archived forever**

### Our Three Core Innovations

1. **Ephemeral by Design** - Pick posts expire at game time, bad beats disappear, fresh starts weekly
2. **Social Mechanics That Mirror Real Betting Culture** - Tail/fade with one tap, group chats like you're at the bar
3. **Built for the 95% (Not the Sharps)** - For people who bet socially, not professionally

## Our Vision

**Year 1**: The default "second screen" for social bettors  
**Year 3**: The cultural hub where every betting meme starts  
**Year 5**: Redefine how a generation experiences sports

We're not building another betting app. We're building a social platform that happens to involve betting. A place where every game day is legendary, until tomorrow.

---

*"Because sometimes the best memories are the ones that don't last forever."*

