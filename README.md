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

EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
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
- **Behavioral Embeddings**: Converts your betting patterns into a 1536-dimensional vector capturing your unique style
- **Smart Recommendations**: "Follow @sarah - 68% on Cowboys unders like you"
- **Similarity Scoring**: Uses cosine similarity to find users with compatible betting DNA
- **Context-Aware Reasons**: Different explanations for discovery vs notifications
  - Discovery: "Bets Lakers & Warriors" 
  - Feed: "Lakers pick from a sharp bettor"
- **Dynamic Updates**: Recommendations evolve as your style changes

### 6. The Notification Chaos Problem (AI-Enhanced)
**"I'm either missing great picks from people I trust or getting spammed with notifications I don't care about."**

SnapBet AI Solutions:
- **Behavioral Analysis**: Tracks who you tail, when you bet, what sports you follow
- **Smart Notifications**: Two intelligent alert types:
  - Similar User Bets: "sharp-steve just placed $100 on Lakers -3.5" (Reason: "Lakers bettor like you")
  - Consensus Patterns: "5 sharp bettors are on Celtics -7" (Reason: "Popular with Celtics fans")
- **Contextual Filtering**: Quiet during losing streaks, active during your betting windows
- **Intelligent Grouping**: "5 people tailed your pick" (not 5 separate alerts)

## AI & RAG Implementation

### Overview

SnapBet uses AI-powered recommendations to help users discover their betting tribe and stay informed about relevant activity. Our system analyzes betting patterns, social interactions, and content preferences to deliver personalized experiences across three key features:

1. **AI Feed (30% Discovery)** - Mixes following content with AI-recommended posts from similar users
2. **Find Your Tribe** - User discovery based on betting style compatibility
3. **Smart Notifications** - Intelligent alerts about relevant betting activity

### How It Works: Embeddings & Similarity

#### User Behavioral Embeddings
Each user has a behavioral profile that captures their betting personality:

```typescript
const behavioralProfile = `
  ${username} betting behavior:
  - Frequently bets on: ${topTeams.join(', ')}
  - Prefers ${dominantBetType} bets (${percentage}%)
  - Active during ${activeTimeSlots}
  - Average stake: $${avgStake}
  - Betting style: ${bettingStyle}
  - Win rate: ${winRate}%
`;
```

This profile is converted to a 1536-dimensional vector using OpenAI's `text-embedding-3-small` model.

#### Cosine Similarity Search
We use pgvector to find users with similar betting patterns:

```sql
SELECT 
  u.id,
  u.username,
  1 - (u.profile_embedding <=> query_embedding) as similarity
FROM users u
WHERE u.id != p_user_id
  AND u.profile_embedding IS NOT NULL
ORDER BY u.profile_embedding <=> query_embedding
LIMIT 20;
```

The `<=>` operator calculates cosine distance. A similarity score of 1 means identical betting patterns, while 0 means completely different.

### Behavioral Scoring System

Our AI evaluates compatibility across multiple dimensions:

1. **Team Affinity** (Highest weight): Shared team preferences
2. **Stake Style**: Micro ($1-10), Conservative ($10-50), Moderate ($50-100), Confident ($100-500), Aggressive ($500+)
3. **Time Patterns**: Morning sharps vs late-night degens
4. **Sport Preference**: NBA specialist, NFL only, multi-sport
5. **Bet Type**: Spread specialist, totals expert, moneyline player
6. **Performance**: Similar win rates attract

### AI Features in Action

#### 1. AI Feed Discovery
The feed intelligently mixes content:
- 70% from users you follow
- 30% AI-discovered posts from similar bettors
- Each discovered post includes a reason: "From a Lakers bettor", "Conservative stake like you"

#### 2. Find Your Tribe Suggestions
Recommends users with specific compatibility reasons:
- "Bets Lakers & Warriors" - Team alignment
- "Conservative bettor ($25 avg)" - Similar stake style
- "Spread specialist" - Matching bet types
- "Crushing at 68%" - Performance similarity

#### 3. Smart Notifications
Two types of intelligent alerts:
- **Similar User Activity**: When behaviorally similar users place interesting bets
- **Consensus Detection**: When multiple users in your cohort bet the same way

### Technical Architecture

```
AI Reasoning Service (Centralized Logic)
    ├── Feed Service (30% discovery content)
    ├── Friend Discovery (Find your tribe)
    └── Smart Notifications (Relevant alerts)
         │
         └── All powered by:
             - OpenAI Embeddings (text-embedding-3-small)
             - pgvector (Cosine similarity search)
             - Behavioral metrics (Pre-computed)
             - Context-aware reasoning
```

The AI system enhances SnapBet's core mission: helping Tyler find his people and share the emotional journey of betting, without the permanent record.