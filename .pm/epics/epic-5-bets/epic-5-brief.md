# Epic 5: Complete Betting System with Tail/Fade - Detailed Roadmap

## Epic Overview

**Epic Goal**: Build the complete betting system including bet placement, bankroll management, tail/fade mechanics, and social betting features that make SnapBet viral.

**Duration**: Day 4 of Development (10-12 hours)
**Dependencies**: Epic 4 (Feed & Social) must be complete
**Outcome**: Full betting platform with viral tail/fade mechanics

---

## Sprint Breakdown

### Sprint 5.0: Mock Data Enhancement (1.5 hours)

**Goal**: Enhance existing mock users with realistic betting data

**Features**:

#### Mock User Betting History
- Add 30 days of historical bets for each mock user
- Win rates based on personality types:
  - Sharp Bettor: 58% win rate
  - Square Bettor: 48% win rate
  - Fade Material: 38% win rate
  - Homer: 45% win rate (worse on their team)
  - Parlay Degen: 12% win rate

#### Mock Game Data
- NFL games: Sunday (1pm, 4pm slots), Monday, Thursday nights
- NBA games: Daily with realistic scheduling
- Realistic odds:
  - NFL spreads: -3, -3.5, -6.5, -7, -10
  - NBA spreads: -2.5, -5.5, -8, -12.5
  - Totals with standard -110 juice
  - Moneylines derived from spreads

#### Mock Social Activity
- Pick posts from mock users
- Tail/fade relationships between mock users
- Comments and reactions on picks
- Group chat betting discussions

**Technical Tasks**:
- Create betting history migration
- Generate realistic game schedules
- Add pick posts for recent bets
- Create tail/fade relationships
- Update mock user stats/badges
- Seed group chat messages

**Acceptance Criteria**:
- [ ] Each mock user has 50+ historical bets
- [ ] Games have realistic odds/times
- [ ] Pick posts exist in feed
- [ ] Mock users interact with each other
- [ ] Stats reflect betting history

---

### Sprint 5.1: Games Tab Implementation (2 hours)

**Goal**: Create the games browsing and selection interface

**Features**:

#### Games List Screen
- Tab in bottom navigation
- Sport filter toggle (NFL/NBA)
- Chronological by start time
- Today/Tomorrow/This Week views
- Pull-to-refresh for updates

#### Game Card Design
- Team colors in circles (no logos)
- Team abbreviations (LAL, BOS)
- Team records below names
- All three bet types displayed
- Odds for each (-110, +150, etc.)
- "Quick Bet" primary CTA

#### Game States
- **Scheduled**: Shows countdown
- **Live**: Red "LIVE" indicator
- **Final**: Shows final score
- **Postponed**: Grayed out

#### Visual Design
```
┌─────────────────────────────────┐
│ NBA • Tonight 7:30 PM ET     LIVE│
│ ┌────┐                    ┌────┐ │
│ │ LAL │    115 - 108      │ BOS │ │
│ │45-20│                   │42-23│ │
│ └────┘                    └────┘ │
│                                  │
│ Spread: LAL -5.5 │ BOS +5.5     │
│         (-110)   │  (-110)       │
│                                  │
│ Total:  O 220.5  │  U 220.5     │
│         (-110)   │  (-110)       │
│                                  │
│ Money:  LAL -200 │ BOS +170     │
│                                  │
│        [Quick Bet →]             │
└─────────────────────────────────┘
```

**Technical Tasks**:
- Create Games tab screen
- Build GameCard component
- Implement sport filtering
- Add time-based sections
- Create odds display components
- Mock game data integration
- Auto-refresh for live scores

**Acceptance Criteria**:
- [ ] Games display correctly
- [ ] Filters work properly
- [ ] Odds show for all bet types
- [ ] Team colors display
- [ ] Live games update
- [ ] Quick bet navigation works

---

### Sprint 5.2: Bet Placement System (2.5 hours)

**Goal**: Build the complete bet slip and placement flow

**Features**:

#### Bet Sheet Component
- Bottom sheet with 3 snap points (25%, 50%, 90%)
- Swipe gestures for height adjustment
- Backdrop tap to dismiss
- Smooth spring animations

#### Bet Configuration
- **Bet Type Selector**: Spread/Total/Moneyline tabs
- **Side Selection**: Team/Over/Under buttons
- **Stake Input**: 
  - Number pad keyboard
  - Quick amounts: $25, $50, $100, MAX
  - Shows available balance
- **Payout Display**:
  - "To Win: $45.45"
  - "Total Return: $95.45"
  - Updates in real-time

#### Bankroll Integration
- Current balance shown
- Pending bets considered
- Validation for sufficient funds
- Weekly reset reminder if low

#### Share Options
- "Share Pick" toggle (on by default)
- Opens camera after placement
- Pre-attached bet details

**Technical Tasks**:
- Create BetSheet component
- Build bet type selector
- Implement stake input with validation
- Add payout calculations
- Integrate bankroll checks
- Create success animations
- Add haptic feedback

**Mock Bet Placement Flow**:
```typescript
interface BetFlow {
  1. "Select game" → Opens bet sheet
  2. "Choose bet type" → Spread selected by default
  3. "Pick side" → Highlight selection
  4. "Enter stake" → Keyboard appears
  5. "Review" → See potential payout
  6. "Place bet" → Success animation
  7. "Share?" → Camera or skip
}
```

**Acceptance Criteria**:
- [ ] Bet sheet opens smoothly
- [ ] All bet types available
- [ ] Stake input works with validation
- [ ] Payout calculates correctly
- [ ] Bankroll check prevents over-betting
- [ ] Success feedback clear
- [ ] Share option prominent

---

### Sprint 5.3: Bankroll Management (1.5 hours)

**Goal**: Implement the weekly bankroll system

**Features**:

#### Bankroll Display
- Header badge on Games tab
- Shows: Available / Pending / Total
- Color coding:
  - Green: Positive for week
  - Red: Negative for week
  - Gold: Hot streak

#### Weekly Reset System
- Every Monday at midnight local time
- Base $1,000 for everyone
- +$100 per active referral
- No manual reset option
- Push notification on reset

#### Transaction Tracking
- Every bet placed
- Every bet settled
- Running balance
- Weekly P&L
- Best/worst weeks

#### Bankroll States
```typescript
interface BankrollState {
  balance: number;        // Current available
  pending: number;        // In active bets
  weeklyPL: number;      // This week's profit/loss
  weeklyDeposit: number; // 1000 + (referrals * 100)
  lastReset: Date;       // Last Monday
  allTimeHigh: number;   // Best balance ever
}
```

**Technical Tasks**:
- Create bankroll display component
- Implement weekly reset logic
- Add transaction logging
- Build bankroll history view
- Create low balance warnings
- Add referral bonus calculation
- Schedule reset notifications

**Acceptance Criteria**:
- [ ] Balance displays everywhere needed
- [ ] Updates real-time on bet/settle
- [ ] Weekly reset works automatically
- [ ] Referral bonuses apply
- [ ] Transaction history accurate
- [ ] Warnings at low balance

---

### Sprint 5.4: Tail/Fade Implementation (2.5 hours)

**Goal**: Build viral tail/fade mechanics for social betting

**Features**:

#### Tail Functionality
- Blue "Tail" button on pick posts/stories
- One tap to copy exact bet
- Uses same stake amount
- Shows confirmation sheet
- Links bets in database
- Updates count in real-time
- Notifies original poster

#### Fade Functionality  
- Orange "Fade" button on pick posts/stories
- Calculates opposite bet:
  - Spread: Other team
  - Total: Opposite O/U
  - Moneyline: Other team
- Shows what you're betting
- Same stake as original
- Tracks fade relationship

#### Confirmation Sheets
```
┌─────────────────────────────────┐
│ Tail @mikebets?                 │
│                                 │
│ Lakers -5.5 (-110)              │
│ Bet: $50 → Win: $45.45          │
│                                 │
│ You'll ride with Mike on this   │
│ pick. Win or lose together! 🤝  │
│                                 │
│ [Confirm Tail - $50]            │
│ [Cancel]                        │
└─────────────────────────────────┘
```

#### Social Proof Display
- Live tail/fade counts
- "8 tails • 2 fades"
- Tap to see who tailed/faded
- Updates in real-time
- Shows outcome correlation

**Technical Tasks**:
- Add tail/fade buttons to PostCard
- Create confirmation bottom sheets
- Implement opposite bet calculator
- Build relationship tracking
- Add real-time count updates
- Create notifications
- Track performance impact

**Opposite Bet Logic**:
```typescript
function calculateFade(originalBet: Bet): Bet {
  switch (originalBet.type) {
    case 'spread':
      return {
        type: 'spread',
        team: originalBet.team === home ? away : home,
        line: -originalBet.line,
        odds: originalBet.odds // Usually same
      };
    case 'total':
      return {
        type: 'total',
        side: originalBet.side === 'over' ? 'under' : 'over',
        line: originalBet.line,
        odds: originalBet.odds
      };
    case 'moneyline':
      return {
        type: 'moneyline',
        team: originalBet.team === home ? away : home,
        odds: oppositeMLOdds // Calculate from original
      };
  }
}
```

**Acceptance Criteria**:
- [ ] Tail button copies bet exactly
- [ ] Fade calculates opposite correctly
- [ ] Confirmations show clear info
- [ ] Counts update instantly
- [ ] Notifications work
- [ ] Can see who tailed/faded
- [ ] 5-min cutoff before games

---

### Sprint 5.5: Pick & Outcome Posts (2 hours)

**Goal**: Complete the betting content creation flow

**Features**:

#### Pick Post Creation
- "Share Pick" after bet placement
- Opens camera with bet attached
- Bet overlay on media:
  - Semi-transparent background
  - Team, line, odds
  - Stake amount
  - Potential win
- Auto-caption with bet details
- Expires at game start

#### Outcome Post Creation
- "Share Result" from bet history
- Available after settlement
- Outcome overlay:
  - WIN/LOSS/PUSH badge
  - Profit/loss amount
  - Final score (optional)
  - Emoji effects auto-suggested
- Celebrates or commiserates

#### Overlay Designs
```
Pick Overlay:
┌─────────────────────┐
│ Lakers -5.5 (-110)  │
│ $50 to win $45.45   │
│ 🎯 Confident        │
└─────────────────────┘

Outcome Overlay:
┌─────────────────────┐
│     ✅ WIN!         │
│    +$45.45          │
│ Lakers 115, Bos 108 │
└─────────────────────┘
```

**Technical Tasks**:
- Create pick post flow
- Build bet overlay component
- Create outcome post flow
- Build result overlay component
- Auto-suggest effects based on result
- Add caption templates
- Set proper expiration times

**Acceptance Criteria**:
- [ ] Share Pick opens camera
- [ ] Bet details overlay correctly
- [ ] Pick posts expire at game time
- [ ] Share Result available post-settlement
- [ ] Outcome shows clear result
- [ ] Effects match outcome mood
- [ ] Captions pre-populate

---

### Sprint 5.6: Bet Management & History (1.5 hours)

**Goal**: Build bet tracking and history features

**Features**:

#### Active Bets Tab
- Shows all pending bets
- Groups by sport/date
- Shows potential payouts
- Live score updates
- Time until start
- Cancel option (pre-game only)

#### Bet History
- Settled bets list
- Filter by:
  - Sport (NFL/NBA)
  - Result (Won/Lost/Push)
  - Date range
  - Bet type
- Shows all details
- Links to outcome posts

#### Bet Card Design
```
┌─────────────────────────────────┐
│ NBA • Lakers @ Celtics      LIVE│
│ Lakers -5.5 (-110)              │
│ $50 to win $45.45               │
│                                 │
│ Current: LAL 58, BOS 52 ✅      │
│ 2nd Quarter - 5:23              │
│                                 │
│ Tailed by: @user1, @user2 +3   │
└─────────────────────────────────┘
```

#### Performance Stats
- Update in real-time
- Sport-specific breakdown
- ROI calculations
- Win rate by bet type
- Best/worst streaks
- Money won from tails/fades

**Technical Tasks**:
- Create bet management screen
- Build active bets list
- Implement bet history with filters
- Add live score integration
- Create bet card component
- Calculate performance metrics
- Link to social features

**Acceptance Criteria**:
- [ ] Active bets show live status
- [ ] History filterable
- [ ] Stats calculate correctly
- [ ] Can share results
- [ ] Links to tail/fade data
- [ ] Performance updates real-time

---

### Sprint 5.7: Settlement System (1 hour)

**Goal**: Build admin tools for settling bets

**Features**:

#### Settlement Script
- Admin command line tool
- Input game ID and score
- Validates all bets
- Calculates outcomes
- Updates bankrolls
- Triggers notifications

#### Settlement Logic
```typescript
function settleBet(bet: Bet, finalScore: Score): BetResult {
  switch (bet.type) {
    case 'spread':
      const coveringTeam = calculateCover(finalScore, bet.line);
      return bet.team === coveringTeam ? 'won' : 'lost';
      
    case 'total':
      const totalScore = finalScore.home + finalScore.away;
      if (totalScore === bet.line) return 'push';
      const wentOver = totalScore > bet.line;
      return (bet.side === 'over') === wentOver ? 'won' : 'lost';
      
    case 'moneyline':
      const winner = finalScore.home > finalScore.away ? 'home' : 'away';
      return bet.team === winner ? 'won' : 'lost';
  }
}
```

#### Post-Settlement Actions
- Update user bankrolls
- Calculate new stats
- Update badges
- Send notifications
- Prompt outcome posts
- Update tail/fade results

**Technical Tasks**:
- Create settlement script
- Implement bet outcome logic
- Add bankroll updates
- Create notification system
- Update stats calculations
- Trigger outcome post prompts
- Handle edge cases (pushes)

**Acceptance Criteria**:
- [ ] Script settles all bet types
- [ ] Handles pushes correctly
- [ ] Bankrolls update accurately
- [ ] Stats recalculate
- [ ] Notifications sent
- [ ] Outcome posts prompted

---

### Sprint 5.8: Notifications & Analytics (1 hour)

**Goal**: Implement betting-related notifications and tracking

**Features**:

#### Notification Types
- Bet won/lost/pushed
- Someone tailed your pick
- Someone faded your pick  
- Your tail/fade won/lost
- Game starting soon
- Bankroll reset
- Hot streak achieved

#### Analytics Tracking
- Bet placement funnel
- Tail/fade rates
- Share pick rate
- Popular bet types
- Peak betting times
- Viral pick tracking

#### Push Notification Setup
- Request permissions
- Store FCM tokens
- Notification preferences
- Delivery optimization
- Deep linking to app

**Technical Tasks**:
- Set up push notifications
- Create notification templates
- Implement delivery logic
- Add analytics events
- Create notification center
- Build preference screen
- Test deep linking

**Acceptance Criteria**:
- [ ] Notifications deliver reliably
- [ ] Preferences respected
- [ ] Analytics track all events
- [ ] Deep links work
- [ ] Notification center shows history

---

## Technical Architecture

### Database Schema Updates
```sql
-- Bets table (already exists, verify schema)
CREATE TABLE bets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  game_id TEXT NOT NULL,
  bet_type TEXT CHECK (bet_type IN ('spread', 'total', 'moneyline')),
  bet_details JSONB NOT NULL,
  stake INTEGER NOT NULL,
  potential_win INTEGER NOT NULL,
  actual_win INTEGER,
  status TEXT DEFAULT 'pending',
  settled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tail/Fade relationships
CREATE TABLE pick_actions (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  user_id UUID REFERENCES users(id),
  action_type TEXT CHECK (action_type IN ('tail', 'fade')),
  resulting_bet_id UUID REFERENCES bets(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Bankroll history
CREATE TABLE bankroll_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  transaction_type TEXT,
  bet_id UUID REFERENCES bets(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_bets_user_status ON bets(user_id, status);
CREATE INDEX idx_pick_actions_post ON pick_actions(post_id);
CREATE INDEX idx_bankroll_user_date ON bankroll_transactions(user_id, created_at DESC);
```

### State Management Updates
```typescript
interface BettingState {
  // Current bet creation
  currentBet: {
    gameId: string | null;
    betType: 'spread' | 'total' | 'moneyline';
    selection: any;
    stake: number;
    odds: number;
    toWin: number;
  };
  
  // Active bets
  activeBets: Bet[];
  betHistory: Bet[];
  
  // Tail/fade data
  tailedPicks: string[]; // post IDs
  fadedPicks: string[];
  
  // Actions
  placeBet: (bet: BetInput, shareToFeed: boolean) => Promise<void>;
  tailPick: (postId: string) => Promise<void>;
  fadePick: (postId: string) => Promise<void>;
  loadActiveBets: () => Promise<void>;
  loadBetHistory: (filters?: BetFilters) => Promise<void>;
}
```

---

## Integration Points

### With Epic 3 (Camera & Content)
- Pick post creation after bet
- Outcome post after settlement
- Bet overlays on media
- Effect suggestions based on result

### With Epic 4 (Feed & Social)
- Tail/fade buttons on pick posts
- Social proof displays
- Share to feed/story
- Performance stats in profile

### With Epic 7 (Messaging)
- Share picks via DM
- Group betting discussions
- Tail/fade from messages

---

## Testing Checklist

### Games & Betting
- [ ] Games display with correct odds
- [ ] Bet sheet opens smoothly
- [ ] Can place all bet types
- [ ] Bankroll updates correctly
- [ ] Share pick flow works

### Tail/Fade
- [ ] Buttons appear on pick posts
- [ ] Tail copies bet exactly
- [ ] Fade calculates opposite
- [ ] Counts update real-time
- [ ] Confirmations clear
- [ ] Notifications work

### Settlement
- [ ] Admin script runs correctly
- [ ] All bet types settle properly
- [ ] Pushes handled
- [ ] Bankrolls update
- [ ] Stats recalculate

### Content Creation
- [ ] Pick posts create properly
- [ ] Overlays display correctly
- [ ] Outcome posts available
- [ ] Expiration times correct

---

## Success Metrics

- Bet placement in < 10 seconds
- 50%+ users share picks
- 30%+ pick engagement (tail/fade)
- Tail/fade actions < 2 taps
- Settlement < 30 min after game
- Zero bankroll calculation errors

---

## Notes & Considerations

1. **Mock Data**: Ensure mock users have realistic betting patterns
2. **Performance**: Optimize real-time updates for counts
3. **Validation**: Strict checks on bet amounts and timing
4. **Social Proof**: Make tail/fade counts prominent
5. **Notifications**: Don't overwhelm users
6. **Analytics**: Track everything for viral optimization

---

## Next Steps (Epic 6)
- Messaging system implementation
- Share picks via DM
- Group betting discussions
- Enhanced real-time features
- Story reactions
- Typing indicators