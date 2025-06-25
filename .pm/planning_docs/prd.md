# SnapBet PRD v2.0

**Version**: 2.0  
**Last Updated**: January 2025  
**Status**: In Development

---

## Executive Summary

**SnapBet** is the anti-LinkedIn for sports betting - a social platform where picks expire, bad beats disappear, and finding your tribe matters more than your all-time record.

**One-Liner**: "Where every bet's a story, but only today's matter."

**Core Innovation**: We're building the first truly ephemeral sports betting social network where content expires naturally, bankrolls reset weekly, and your reputation is only as good as your last seven days.

---

## The Spiky POV

### POV 1: The Social Contradiction in Sports Betting
Sports are inherently social - we watch together, celebrate together, suffer together. Yet sports betting has been relegated to a solitary, transactional experience. Current sportsbooks treat betting like stock trading when it should feel like tailgating.

**The Non-Consensus Truth**: The real product isn't efficient bet placement - it's the shared emotional journey. The memory of "that night we all tailed Jake's terrible pick" is worth more than any individual win.

### POV 2: Gen Z's Ephemeral Rebellion
Gen Z uses ephemeral content as rebellion against the "permanent record" internet. They've watched millennials get canceled for old tweets and their parents post cringe on Facebook. They understand that context changes, and content should too.

**The Non-Consensus Truth**: Permanence is a bug, not a feature. Gen Z doesn't want to build a betting portfolio - they want to live in the moment with people who get it. Your Wednesday night degen parlay shouldn't define your Friday job interview.

---

## Target User Persona

### Meet Tyler, 24, Junior Data Analyst in Chicago

**Professional Life**:
- Makes $75K at a tech company
- LinkedIn optimized, building his "personal brand"
- Lives with one roommate in Lincoln Park
- Careful about his digital footprint

**Betting Life**:
- Deposits $100-200 every couple weeks ("entertainment budget")
- Has 4 different sportsbook apps for the promos
- Screenshots bet slips to 3 different group chats
- Follows betting Twitter but won't tweet (boss might see)
- Posts in r/sportsbook but it's impersonal

**The Problem He Faces**:
- Can't build a betting identity without professional risk
- No way to share the excitement of wins/losses authentically
- Group chats are chaos, screenshots get buried
- Doesn't know who to actually trust with picks
- Missing his tribe of like-minded bettors

**What He Actually Wants**:
- A place to be "Weekend Tyler" without haunting "Professional Tyler"
- To find 2-3 people who actually know ball to tail
- To celebrate wins without building a degenerate archive
- Authentic connections through shared betting experiences
- The freedom to be himself for 24 hours at a time

---

## Core User Stories

### Story 1: The Credibility Problem
**As a** semi-casual sports bettor  
**I want to** see verified performance history of other bettors  
**So that** I can make informed decisions about who to follow and whose picks to trust

**Solved by**: Transparent stats, rolling 7-day performance, honest win/loss records, dynamic badge system

### Story 2: The Permanent Record Problem
**As a** semi-casual sports bettor  
**I want** my betting content to disappear after it's relevant  
**So that** I can share authentically without fear of my bad picks haunting me forever

**Solved by**: Pick posts expire at game end, all content gone in 24 hours, weekly bankroll resets, ephemeral messages

### Story 3: The Boring Bet Slip Problem
**As a** semi-casual sports bettor  
**I want to** share my picks with personality and style  
**So that** my betting content is as entertaining as my wins feel

**Solved by**: Camera-first creation, 73 emoji effects, custom overlays, three distinct post types

### Story 4: The Isolation Problem
**As a** semi-casual sports bettor  
**I want to** connect with others on my betting journey  
**So that** wins feel more celebrated and losses feel less painful

**Solved by**: Tail/fade mechanics, group chats, real-time engagement, shared outcomes

### Story 5: The Missing My People Problem (AI-Enhanced)
**As a** semi-casual sports bettor  
**I want** AI to help me find bettors who match my style  
**So that** I can build a network of like-minded people to follow and engage with

**Solved by**: Smart friend recommendations based on betting patterns, team preferences, and risk profiles

### Story 6: The Notification Chaos Problem (AI-Enhanced)
**As a** semi-casual sports bettor  
**I want** AI to intelligently filter my notifications  
**So that** I see important picks without drowning in noise

**Solved by**: Pattern recognition, smart prioritization, contextual filtering

---

## Product Philosophy

### Ephemeral First
- **Pick posts** expire at game end (~3 hours after start)
- **All other content** expires in 24 hours  
- **Messages** expire in 1 hour, 24 hours, or 1 week (user choice)
- **Bankrolls** reset every Monday to $1,000
- **Badges** are rolling weekly achievements

### Trust Through Transparency
- **Permanent**: Your betting record (W/L, ROI, bet history for stats)
- **Ephemeral**: The actual posts, comments, reactions
- **Result**: Credibility without the cringe

### FOMO as a Feature
- "Jake is on a 5-pick hot streak TODAY"
- "Sarah's picks expire in 2 hours"
- "Your crew is active now"
- You have to be there or miss out

---

## Core Features

### 1. Three Types of Content

**Every post requires photo/video** - this is a camera-first platform. The difference is what gets overlaid on your media:

#### Content Posts
- **Entry**: Camera tab (raised button)
- **Purpose**: General reactions, game commentary, lifestyle content
- **Media**: Photo/video + emoji effects + caption
- **Overlays**: None - just your content with effects
- **Example**: Video of you watching the game with fire emojis
- **Expiration**: 24 hours

#### Pick Posts  
- **Entry**: "Share Pick" button after placing bet
- **Purpose**: Share bets for others to tail/fade
- **Media**: Photo/video + emoji effects + bet overlay + caption
- **Overlays**: Semi-transparent bet details (teams, odds, selection)
- **Example**: Selfie at the bar with "Lakers -5.5 (-110)" overlay
- **Expiration**: Game end time

#### Outcome Posts
- **Entry**: "Share Result" button from settled bets in profile
- **Purpose**: Celebrate wins, commiserate losses
- **Media**: Photo/video + emoji effects + outcome overlay + caption
- **Overlays**: Win/loss badge, profit/loss amount, final score
- **Example**: Celebration video with "+$250 WIN" overlay
- **Expiration**: 24 hours

### 2. Weekly Badge System

**Philosophy**: Your reputation resets weekly. You're only as good as your last seven days.

#### Current Week Badges (Reset Every Monday)
- 🔥 **Hot Right Now** - Won last 3+ picks this week
- 💰 **Week's Profit King** - Up the most this week
- 🌊 **Riding the Wave** - Others profiting from your picks this week
- 🎯 **This Week's Sharp** - 70%+ win rate (min 5 bets)
- 🎪 **Fade God** - People made money fading you this week
- ⚡ **Most Active** - Posted 10+ picks this week
- 👻 **Ghost** - Haven't posted in 3+ days
- 🏆 **Sunday Sweep** - Perfect NFL Sunday

**Key**: Badges are contradictory - you can't have them all, creating interesting dynamics

### 3. Emoji Effects System

**Tier 0 (Everyone)**: 48 base effects including fire, money, tears, all Gen Z memes
**Tier 1 (Any 1 Badge)**: Enhanced versions, ~15 additional effects
**Tier 2 (Any 3 Badges)**: Premium effects, combinations, ~10 exclusive effects

### 4. Tail/Fade Mechanics

- One-tap to copy someone's bet (tail) or take the opposite (fade)
- Creates shared outcomes - win together, lose together
- Real-time counts show social proof
- Expires when game starts

### 5. Ephemeral Messaging

- **DMs**: 1 hour, 24 hours, or 1 week expiration
- **Group Chats**: Admin sets expiration for all
- **Pick Sharing**: Tail/fade directly from chat
- **No Screenshots**: What's shared in chat, stays in chat

### 6. Weekly Bankroll System

- Everyone starts with $1,000
- Resets every Monday at midnight
- Unlimited manual resets available
- Removes "down bad" permanence
- Makes betting social, not financial

### 7. AI-Powered Friend Discovery

**The Problem**: Finding your betting tribe in a sea of users
**The Solution**: AI analyzes patterns to surface compatible bettors

**How It Works**:
- Analyzes your betting patterns (sports, bet types, risk level)
- Considers favorite teams and active hours
- Identifies compatible betting styles
- Shows WHY someone is recommended

**Example Recommendations**:
- "Sarah bets 68% NBA unders like you"
- "Mike is also a Cowboys fan who loves prime time unders"
- "Jake has similar risk tolerance and betting volume"

**Discovery Surfaces**:
- Daily "Find Your Tribe" suggestions
- "Bettors Like You" in explore tab
- Post-bet recommendations ("Others who bet this also...")

### 8. Intelligent Notification System

**The Problem**: Missing important picks while drowning in noise
**The Solution**: AI learns what matters to you and filters accordingly

**Smart Filtering**:
- Learns whose picks you actually tail
- Identifies your active betting windows
- Recognizes patterns in your engagement
- Prioritizes consensus plays from trusted sources

**Example Notifications**:
- "3 people you tail all took Lakers -5.5"
- "Sarah (who you tail 80%) just posted a pick"
- "Unusual: Your whole crew is on the under"
- Silence during your usual work hours

**Notification Controls**:
- AI-suggested quiet hours
- Smart bundling (one alert for multiple similar picks)
- Importance scoring (critical vs. nice-to-know)
- Weekly pattern analysis and adjustment

---

## Technical Architecture

### Core Stack
- **Frontend**: React Native/Expo with Tamagui
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **State**: Zustand + React Query + MMKV
- **AI/RAG**: OpenAI GPT-4 via Vercel AI SDK

### Data Architecture
- **Permanent**: User profiles, betting records (W/L, ROI, bet history)
- **Ephemeral**: Posts, stories, messages, reactions, comments
- **Implementation**: Soft delete on expiration, hard delete after 7 days

---

## Development Roadmap

### Phase 1: Core MVP
- Foundation, Auth, Onboarding
- Camera, Feed, Stories, Betting  
- Tail/Fade, Messaging, Profiles

### Phase 2: AI Enhancement
- Smart friend discovery
- Intelligent notifications
- Polish and launch prep

---

## What We're NOT Building

- Permanent betting portfolio
- Professional betting tools
- Live scores or odds comparison
- Real money transactions
- Responsible gambling features (this is entertainment)
- Complex parlays
- Web version (mobile only)

---

## Launch Strategy

1. **Soft Launch**: r/sportsbook subreddit exclusive
2. **Referral System**: Bonus bankroll for invites
3. **Content Creators**: Partner with betting Twitter personalities
4. **App Store**: "Entertainment" category, not "Sports Betting"

---

## The Vision

In one year, SnapBet becomes the default second screen for social bettors. Tyler and his friends check it every Saturday morning, share picks throughout the day, and celebrate (or commiserate) together on Sunday night. 

By Monday, last week's bad beats are gone, everyone has a fresh $1,000, and the cycle begins again. It's not about becoming a sharp bettor - it's about sharing the journey with people who get it.

**Because in betting, like in life, it's not about where you've been - it's about where you're going.**

---

*This PRD is a living document. Major updates will be tracked in version history.*