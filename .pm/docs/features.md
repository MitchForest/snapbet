# SnapFade Feature Specification Document

## Table of Contents
1. [Authentication & Onboarding](#authentication--onboarding)
2. [User Profile & Account Management](#user-profile--account-management)
3. [Social Feed & Content](#social-feed--content)
4. [Camera & Media Creation](#camera--media-creation)
5. [Betting System](#betting-system)
6. [Tail/Fade Mechanics](#tailfade-mechanics)
7. [Messaging System](#messaging-system)
8. [Social Features](#social-features)
9. [Discovery & Search](#discovery--search)
10. [Gamification & Achievements](#gamification--achievements)
11. [Notifications](#notifications)
12. [Data Management](#data-management)
13. [Admin Tools](#admin-tools)
14. [RAG Features (Phase 2)](#rag-features-phase-2)

## Authentication & Onboarding

### OAuth Authentication
**Description**: Passwordless authentication using OAuth providers.

**Requirements**:
- Support Google OAuth 2.0
- Support Twitter/X OAuth 2.0
- No email/password option
- Automatic profile picture import from OAuth provider
- Automatic name suggestion from OAuth provider
- Store OAuth tokens securely
- Handle token refresh automatically
- Support account linking (same email)

**User Flow**:
1. User opens app → Welcome screen
2. Selects OAuth provider (Google/Twitter)
3. Redirected to provider login
4. Grants permissions
5. Returns to app authenticated
6. Proceeds to onboarding if first time

**Edge Cases**:
- OAuth provider down → Show error with retry
- User denies permissions → Return to welcome
- Email already exists → Link accounts automatically
- Network timeout → Show timeout error

### Username Selection
**Description**: Users must choose a unique username after OAuth.

**Requirements**:
- Username 3-20 characters
- Alphanumeric + underscores only
- Case insensitive for uniqueness
- Real-time availability checking
- Suggest variations if taken
- Cannot be changed after setting
- Pre-fill with OAuth username if available

**Validation Rules**:
- No spaces or special characters
- Cannot start with underscore
- Cannot be offensive words (basic filter)
- Must be unique in system

### Favorite Team Selection
**Description**: Users select one favorite team during onboarding.

**Requirements**:
- Show NFL and NBA teams
- Toggle between sports
- Visual team logos/colors
- Can change later in settings
- Affects content recommendations
- Used for friend suggestions

**Teams Data**:
- All 32 NFL teams
- All 30 NBA teams
- Team colors for UI theming
- Team logos from ESPN API

### Follow Suggestions
**Description**: Suggest initial accounts to follow.

**Requirements**:
- Show 10 mock users
- Display key stats (record, ROI, profit)
- Mix of personalities (sharps, squares, fade material)
- One-tap follow/unfollow
- Must follow at least 3 to continue
- Based on favorite team selection

**Suggestion Algorithm**:
- 2-3 users who like same team
- 2-3 high performers
- 1-2 entertainment accounts (fade material)
- Random selection from remaining

## User Profile & Account Management

### Profile Information
**Description**: User profile data and display.

**Core Fields**:
- Username (immutable)
- Avatar (from OAuth)
- Display name (optional)
- Bio (140 characters)
- Favorite team
- Join date
- Following/Follower counts

**Calculated Stats**:
- Win-Loss record
- Current profit/loss
- ROI percentage
- Win rate
- Current streak
- Bankroll (if public)
- Hot/Cold status

**Privacy Settings**:
- Show/hide bankroll
- Show/hide win rate
- Show/hide profit
- Public/private profile

### Bankroll Management
**Description**: Mock money system for betting.

**Requirements**:
- Starting bankroll: $1,000
- Minimum bet: $5
- Maximum bet: Current bankroll
- Track all transactions
- Show current balance prominently
- Allow unlimited resets
- Reset clears history warning

**Bankroll Operations**:
- Deduct on bet placement
- Add on bet win
- No change on push
- Cannot go negative
- Reset returns to $1,000

### Profile Badges & Metrics
**Description**: Visual indicators of performance shown next to username.

**Badge Types**:
- 🔥 Hot Streak (3+ wins)
- 💰 Profit Leader (+$500+)
- 📈 High ROI (20%+ with 20+ bets)
- 🎯 Sharp (60%+ win rate, 20+ bets)
- 🎪 Fade Material (others profit by fading)
- 👑 Influencer (50+ followers)
- 💎 Perfect Day (5-0 or better)

**Display Rules**:
- Show most relevant badge
- Update in real-time
- Appear next to username in feed
- Clicking shows all earned badges

### Settings Management
**Description**: User preferences and app settings.

**Account Settings**:
- Change display name
- Update bio
- Change favorite team
- Manage linked accounts
- Download data
- Delete account

**Notification Settings**:
- Push notification toggles by type
- In-app notification preferences
- Quiet hours
- Notification sounds

**Display Settings**:
- Show/hide stats publicly
- Default bet amount
- Preferred odds format
- Time zone

## Social Feed & Content

### Feed Algorithm
**Description**: Determines what content appears in user's feed.

**Content Sources**:
- Posts from followed users
- Own posts
- No algorithmic recommendations in MVP

**Ordering**:
- Chronological (newest first)
- No algorithmic ranking
- Pull-to-refresh for latest

**Content Types in Feed**:
- Pick posts (bets with media)
- Result posts (win/loss celebrations)
- General content (game reactions)
- All require photo/video

### Post Creation
**Description**: Creating content for the feed.

**Requirements**:
- Must include photo or video
- Optional caption (280 characters)
- Optional bet attachment
- Can share to multiple destinations
- Auto-expire based on type

**Post Types**:
1. **Pick Post**:
   - Has attached bet
   - Shows bet details overlay
   - Enables tail/fade buttons
   - Expires at game time

2. **Result Post**:
   - References completed bet
   - Shows win/loss amount
   - Celebration/commiseration
   - Expires in 24 hours

3. **Content Post**:
   - General sports content
   - No bet attached
   - Expires in 24 hours

### Stories System
**Description**: 24-hour ephemeral content shown at top of feed.

**Requirements**:
- Horizontal scrollable bar
- User's story first (or add button)
- Unwatched stories have gradient ring
- Watched stories have gray ring
- Auto-advance through stories
- Can reply via DM

**Story Types**:
- Manual stories (user created)
- Auto-generated (milestones)
- Live stories (watching game)

**Story Features**:
- View count visible to owner
- List of viewers
- Direct reply goes to DM
- Screenshot notification (iOS only)

### Content Expiration
**Description**: All content disappears after set time.

**Expiration Rules**:
- Pick posts: Expire at game start time
- Stories: 24 hours from creation
- Regular posts: 24 hours from creation
- Messages: 24 hours from sending
- Group messages: 24 hours

**Cleanup Process**:
- Soft delete (hidden from UI)
- Hard delete after 7 days
- Media files purged
- Stats preserved

## Camera & Media Creation

### Camera Interface
**Description**: Built-in camera for content creation.

**Camera Features**:
- Photo mode (default)
- Video mode (10 seconds max)
- Switch front/back camera
- Flash toggle
- Grid overlay option
- Timer (3s, 10s)

**Technical Requirements**:
- Use Expo Camera
- Request permissions properly
- Handle permission denial
- Support all orientations
- Auto-focus/exposure

### Filters & Effects
**Description**: Overlays and effects for media.

**Available Effects**:
1. **Team Overlays**:
   - Favorite team logo
   - Opponent team logo
   - VS graphic

2. **Result Effects**:
   - Confetti animation (wins)
   - Rain animation (losses)
   - Fire effect (hot streak)
   - Money falling (big win)

3. **Info Overlays**:
   - Current odds
   - Bet details
   - Score bug
   - Bankroll badge

**Implementation**:
- Real-time preview
- Adjustable positioning
- Save with effects burned in

### Media Processing
**Description**: Handling captured media.

**Photo Requirements**:
- Max resolution: 1920x1080
- Format: JPEG
- Compression: 85% quality
- Auto-rotate based on EXIF

**Video Requirements**:
- Max length: 10 seconds
- Resolution: 1080p
- Format: MP4 H.264
- Compression: Medium quality
- Generate thumbnail

**Upload Process**:
- Show progress indicator
- Retry on failure
- Queue if offline
- Compress before upload

### Caption & Bet Attachment
**Description**: Adding context to media.

**Caption Features**:
- 280 character limit
- Emoji support
- @ mentions (future)
- # hashtags (future)
- Character counter

**Bet Attachment**:
- Show recent 5 bets
- Select one to attach
- Creates pick post type
- Shows bet overlay on media
- Links to bet for tail/fade

## Betting System

### Game Data Management
**Description**: Displaying available games and odds.

**Data Source**:
- Mock data following The Odds API format
- Cached locally
- Updated via admin scripts

**Game Display**:
- Group by sport
- Sort by start time
- Show team records
- Display all bet types
- Live indicator

**Supported Sports** (MVP):
- NFL
- NBA
- Future: MLB, NHL, Soccer

### Bet Types
**Description**: Types of bets users can place.

**1. Spread Betting**:
- Point spread for each team
- Standard -110 odds
- Show line movement (future)
- Example: Lakers -5.5 (-110)

**2. Totals (Over/Under)**:
- Combined score line
- Over/under options
- Standard -110 odds
- Example: O/U 220.5 (-110)

**3. Moneyline**:
- Pick winner straight up
- Variable odds based on favorite
- Show implied probability
- Example: Lakers -200, Celtics +170

**Parlay Support** (Post-MVP):
- Not in initial version
- Single bets only

### Bet Placement Flow
**Description**: Process of placing a bet.

**Steps**:
1. Browse games in Games tab
2. Tap game for details
3. Bottom sheet appears
4. Select bet type (spread/total/ML)
5. Enter amount (or use quick buttons)
6. See potential payout
7. Toggle sharing options
8. Confirm placement

**Validation**:
- Sufficient bankroll
- Minimum $5 bet
- Game hasn't started
- Odds haven't expired

**Calculations**:
- American odds conversion
- Potential payout
- Total return
- Show break-even percentage

### Bet Settlement
**Description**: Determining bet outcomes.

**Settlement Process**:
- Admin runs settlement script
- Input final scores
- System calculates winners
- Update bet statuses
- Adjust bankrolls
- Send notifications

**Outcome Types**:
- Win: Full payout credited
- Loss: Stake lost
- Push: Stake returned
- Cancelled: Stake returned

**Settlement Rules**:
- Spreads: Cover or not
- Totals: Over or under
- Moneyline: Win or lose
- No overtime special rules

## Tail/Fade Mechanics

### Tail Functionality
**Description**: Copy another user's bet exactly.

**Requirements**:
- One-tap from feed or chat
- Use same odds if available
- Use current odds if changed
- Same stake amount
- Link bets in database
- Track together

**Tail Process**:
1. See pick in feed/chat
2. Tap "Tail" button
3. Confirmation sheet shows bet
4. Confirm to place
5. Notification to original bettor
6. Count updates on post

**Tail Restrictions**:
- Cannot tail after game starts
- Cannot tail own picks
- Cannot tail twice on same pick
- Must have sufficient bankroll

### Fade Functionality
**Description**: Bet opposite of another user's pick.

**Requirements**:
- One-tap from feed or chat
- Calculate opposite bet
- Use current odds
- Same stake amount
- Link as fade in database

**Fade Logic**:
- **Spread**: Take opposite team with opposite line
- **Total**: Take Over if they have Under (vice versa)
- **Moneyline**: Take opposite team

**Fade Process**:
1. See pick in feed/chat
2. Tap "Fade" button
3. Shows opposite bet details
4. Confirm to place
5. Notification to original bettor
6. Count updates on post

### Tail/Fade Tracking
**Description**: Track performance of tails and fades.

**Tracked Metrics**:
- Number of times tailed
- Number of times faded
- Tail win rate
- Fade win rate
- Money won/lost by tailers
- Money won/lost by faders

**Display Features**:
- Show counts on each pick
- List of who tailed/faded
- Performance impact on profile
- "Influence score"

**Special Statuses**:
- "Fade God": People profit by fading you
- "Tail Master": High tail success rate
- "Influencer": 50+ total tails

## Messaging System

### Direct Messages
**Description**: One-on-one private conversations.

**Features**:
- Text messages
- Photo/video sharing
- Pick sharing (with tail/fade)
- Reactions (emoji)
- Read receipts
- Typing indicators
- 24-hour expiration

**DM Capabilities**:
- Start from profile or feed
- Share posts to DM
- Reply to stories via DM
- Mute conversations
- Clear chat history

### Group Chats
**Description**: Multi-person conversations.

**Group Features**:
- 2-50 members
- Custom group name
- Group avatar
- Admin privileges
- Add/remove members
- Leave group

**Group Messaging**:
- All DM features
- @ mentions
- Show member list
- Member roles (admin/member)
- Join/leave notifications

### Message Types
**Description**: Different content types in messages.

**1. Text Messages**:
- Plain text
- Emoji support
- Link preview (future)
- 1000 character limit

**2. Media Messages**:
- Photos from camera/gallery
- Videos (10 seconds max)
- Disappear after viewing
- Save notification (future)

**3. Pick Shares**:
- Share active picks
- Tappable card format
- Shows bet details
- Enable tail/fade from chat

**4. Reactions**:
- Long press to react
- 6 quick emojis
- Show reaction count

### Message Expiration
**Description**: Auto-deletion of messages.

**Expiration Rules**:
- All messages: 24 hours
- Timer starts on send
- No way to save (MVP)
- Deleted from server

**Visual Indicators**:
- Countdown timer (future)
- Fading effect (future)
- "Expired" placeholder

## Social Features

### Following System
**Description**: Create social connections.

**Follow Features**:
- Follow/unfollow users
- No follow requests (public)
- Follower/following counts
- Following feed only
- Mutual follow indicator

**Follow Limits**:
- No limit on following (MVP)
- Rate limiting (future)

**Discovery**:
- Through friend suggestions
- From bet interactions
- Search function
- Group members

### User Search
**Description**: Find other users.

**Search Features**:
- Search by username
- Search by display name
- Real-time results
- Show key stats in results
- Recent searches

**Search Filters** (Future):
- By favorite team
- By performance
- By location

### Social Interactions
**Description**: Ways users interact with content.

**Interaction Types**:
1. **Reactions**:
   - 6 emoji options
   - One per user per post
   - Visible count
   - Tap to see who

2. **Shares** (Future):
   - Share to story
   - Share to chat
   - Share externally

3. **Comments** (Not in MVP):
   - Decided against for simplicity

### Profile Interactions
**Description**: Actions on user profiles.

**Profile Actions**:
- Follow/Unfollow
- Message (if following)
- View picks history
- View performance
- Copy username
- Block/Report (future)

## Discovery & Search

### Explore Tab
**Description**: Discover new users and content.

**Sections**:
1. **Hot Bettors**:
   - Top performers this week
   - Sorted by ROI
   - Min 10 bets
   - Show key stats

2. **Trending Picks**:
   - Most tailed picks today
   - Active games only
   - Show consensus
   - Quick tail/fade

3. **Fade Material**:
   - Worst performers
   - Entertainment value
   - Clear labeling
   - Inverse badge

4. **Rising Stars** (Future):
   - New users doing well
   - Under 50 followers
   - Good early record

### Search Functionality
**Description**: Find specific content.

**Search Types**:
- Users (by username)
- Teams (show picks for team)
- Games (show picks for game)

**Search UX**:
- Instant results
- Recent searches saved
- Clear search history
- Relevant suggestions

### Trending Algorithm
**Description**: Surface popular content.

**Trending Factors**:
- Tail count (primary)
- Recency (last 24h)
- Success rate
- Interaction rate

**Updates**:
- Refresh every hour
- Cache for performance
- Show "last updated"

## Gamification & Achievements

### Streak Tracking
**Description**: Track consecutive wins/losses.

**Streak Types**:
- Win streak (consecutive wins)
- Loss streak (consecutive losses)
- Day streak (positive days)

**Display**:
- Show current streak
- 🔥 emoji for 3+ wins
- Best streak on profile
- Streak ended notification

### Milestones
**Description**: Notable achievements.

**Milestone Types**:
- First win
- 10th, 50th, 100th win
- Profit milestones ($500, $1000)
- Perfect days (5-0, 10-0)
- Follower milestones
- Tail milestones

**Celebration**:
- In-app notification
- Shareable graphic
- Auto-story (optional)
- Profile badge

### Leaderboards (Future)
**Description**: Competitive rankings.

**Planned Boards**:
- Weekly profit
- Monthly ROI
- Sport-specific
- Friend group only

## Notifications

### Push Notifications
**Description**: System-level alerts.

**Notification Types**:
1. **Betting**:
   - Bet won/lost
   - Someone tailed you
   - Someone faded you
   - Tail/fade outcome

2. **Social**:
   - New follower
   - Direct message
   - Group mention
   - Story reply

3. **Milestones**:
   - Streak achievement
   - Profit milestone
   - New badge earned

**Settings**:
- Toggle by category
- Quiet hours
- Sound preferences
- Badge count

### In-App Notifications
**Description**: Notification center in app.

**Features**:
- Chronological list
- Group by day
- Mark as read
- Clear all
- Tap to navigate

**Retention**:
- Keep 7 days
- Then auto-delete
- Important ones starred

## Data Management

### Data Retention
**Description**: How long data is kept.

**Retention Policies**:
- Posts: 24 hours visible, 7 days stored
- Stories: 24 hours visible, 48 hours stored
- Messages: 24 hours visible, 7 days stored
- Bets: Forever (for stats)
- Profile data: Until account deletion

### Privacy & Security
**Description**: Protecting user data.

**Security Measures**:
- OAuth tokens encrypted
- No password storage
- HTTPS everywhere
- Media URLs expire
- No PII in analytics

**Privacy Features**:
- Private profiles (future)
- Block users (future)
- Report content (future)
- Data export option
- Account deletion

### Performance Optimization
**Description**: Keep app fast and responsive.

**Optimization Strategies**:
- Image compression
- Lazy loading
- Pagination (20 items)
- Caching strategy
- Background refresh

**Cache Policies**:
- User profiles: 5 minutes
- Game data: 1 hour
- Odds: 10 minutes
- Media: Until expiration

## Admin Tools

### Game Management Scripts
**Description**: Add and update games.

**Add Games Script**:
```bash
npm run add-games -- --date=2024-06-23 --sport=nba
```
- Fetches from mock data
- Adds to database
- Sets commence times
- Initializes odds

**Update Odds Script**:
```bash
npm run update-odds -- --game=GAME_ID --spread=-6.5
```
- Updates specific game
- Changes lines
- Logs changes

### Settlement Scripts
**Description**: Settle completed games.

**Settlement Process**:
```bash
npm run settle -- --game=GAME_ID --home=110 --away=105
```
- Input final scores
- Calculate all bet outcomes
- Update bankrolls
- Send notifications
- Log all changes

**Bulk Settlement**:
```bash
npm run settle-all -- --date=2024-06-23
```
- Settle all games from date
- Show summary report

### Data Management Scripts
**Description**: Manage app data.

**Reset Script**:
```bash
npm run reset -- --type=all|users|bets
```
- Clear specified data
- Reset to initial state
- Preserve specific users

**Seed Data Script**:
```bash
npm run seed
```
- Create 30 mock users
- Generate bet history
- Create sample content
- Set up relationships

### Debug Tools
**Description**: Development helpers.

**Debug Features**:
- Show user token
- Force refresh
- Clear cache
- View logs
- Performance stats

**Debug Menu** (Dev only):
- Shake to open
- Various shortcuts
- Direct database access

## RAG Features (Phase 2)

### Pattern Recognition
**Description**: Identify user betting patterns.

**Analyzed Patterns**:
- Success by team
- Success by bet type
- Success by sport
- Time-based patterns
- Situational patterns

**Pattern Examples**:
- "You're 8-2 on Lakers unders"
- "You hit 70% on home dogs"
- "Monday NFL unders: 5-1"

**Display**:
- Insights tab on profile
- Weekly summary
- Pre-bet suggestions

### AI Caption Generation
**Description**: Generate engaging captions.

**Generation Triggers**:
- After photo capture
- Based on bet context
- User style matching
- Trending phrases

**Caption Types**:
- Pick explanations
- Confidence statements
- Entertainment value
- Stats-based

**Examples**:
- "Lakers covering easily tonight 🔥"
- "Fade the public on this one 💰"
- "My model loves the under 📊"

### Smart Recommendations
**Description**: AI-powered suggestions.

**Recommendation Types**:
1. **Friend Suggestions**:
   - Similar betting style
   - Same favorite teams
   - Complementary patterns

2. **Content Suggestions**:
   - When to post
   - What to share
   - Engagement optimization

3. **Bet Insights**:
   - Similar historical setups
   - Pattern matching
   - Success probability

### Weekly AI Recaps
**Description**: Automated performance summaries.

**Recap Contents**:
- Week's record
- Profit/loss
- Best picks
- Worst picks
- Patterns noticed
- Shareable graphic

**Generation**:
- Every Sunday night
- Posted to story
- Sent via notification
- Personalized insights

### Personalization Engine
**Description**: Adapt to user behavior.

**Personalization Areas**:
- Feed algorithm (future)
- Notification timing
- Content suggestions
- Friend recommendations

**Learning Factors**:
- Interaction patterns
- Betting preferences
- Active hours
- Social connections

---

This comprehensive feature specification covers every aspect of SnapFade, from core functionality to future RAG enhancements. Each feature is detailed with requirements, user flows, edge cases, and technical considerations.