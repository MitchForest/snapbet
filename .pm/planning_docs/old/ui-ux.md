# SnapBet UI/UX Design Document

## Table of Contents
1. [Design System](#design-system)
2. [Navigation Structure](#navigation-structure)
3. [Authentication Screens](#authentication-screens)
4. [Main App Screens](#main-app-screens)
5. [Bottom Sheets & Modals](#bottom-sheets--modals)
6. [Profile & Settings](#profile--settings)
7. [Messaging System](#messaging-system)
8. [Betting Flows](#betting-flows)
9. [Social Features](#social-features)
10. [Edge Cases & Empty States](#edge-cases--empty-states)

## Design System

### Color Palette
```
Primary Colors:
- Background:     #FAF9F5 (Warm off-white)
- Surface:        #FFFFFF (Cards, sheets)
- Surface Alt:    #F5F3EE (Subtle sections)
- Primary:        #059669 (Emerald - CTAs)
- Primary Hover:  #047857 (Darker emerald)

Action Colors:
- Tail:          #3B82F6 (Bright blue)
- Tail Hover:    #2563EB (Darker blue)
- Fade:          #FB923C (Orange)
- Fade Hover:    #F97316 (Darker orange)

Outcome Colors:
- Win:           #EAB308 (Gold)
- Loss:          #EF4444 (Red)
- Push:          #6B7280 (Gray)

Text Colors:
- Primary:       #1F2937 (Near black)
- Secondary:     #6B7280 (Gray)
- Tertiary:      #9CA3AF (Light gray)
- Inverse:       #FFFFFF (On dark)

Utility Colors:
- Border:        #E5E7EB (Light)
- Border Strong: #D1D5DB (Medium)
- Divider:       #F3F4F6 (Very light)
- Overlay:       rgba(0,0,0,0.5)
```

### Typography
```
Font Family: System Default (-apple-system, Roboto)

Sizes:
- Heading 1:  32px, Bold (Screen titles)
- Heading 2:  24px, Semibold (Section headers)
- Heading 3:  20px, Semibold (Card titles)
- Body:       16px, Regular (Main content)
- Body Small: 14px, Regular (Secondary text)
- Caption:    12px, Regular (Timestamps, labels)

Line Heights:
- Headings:   1.2
- Body:       1.5
- Compact:    1.3 (Feed cards)
```

### Spacing System
```
Base: 4px

Scale:
- $1: 4px
- $2: 8px
- $3: 12px
- $4: 16px
- $5: 20px
- $6: 24px
- $7: 32px
- $8: 40px
- $9: 48px
```

### Component Styles

#### Buttons
```
Primary Button (Emerald):
- Background: #059669
- Text: White
- Padding: 16px 24px
- Border Radius: 12px
- Font: 16px Semibold
- Min Height: 48px
- Pressed: Scale 0.97, Haptic feedback

Secondary Button:
- Background: #F5F3EE
- Text: #1F2937
- Border: 1px solid #E5E7EB

Tail Button:
- Background: #3B82F6
- Text: White
- Icon: Arrow down-right

Fade Button:
- Background: #FB923C
- Text: White
- Icon: Arrow crossing
```

#### Cards
```
Feed Card:
- Background: #FFFFFF
- Border Radius: 16px
- Padding: 16px
- Shadow: 0px 1px 3px rgba(0,0,0,0.1)
- Border: 1px solid #F3F4F6
```

## Navigation Structure

### App Shell
```
┌─────────────────────────────────┐
│ Status Bar                       │
├─────────────────────────────────┤
│ 👤    SnapBet    🔔(3)         │ ← Header (Fixed)
├─────────────────────────────────┤
│                                 │
│        Screen Content           │
│                                 │
│                                 │
├─────────────────────────────────┤
│  🏠    🏀    📸    💬    🔍    │ ← Tab Bar
│ Feed  Games Camera Chat Search │
└─────────────────────────────────┘
```

### Header Component
```
Height: 56px
Background: #FFFFFF
Border Bottom: 1px solid #F3F4F6

Left: Profile Avatar (32x32)
  - Tap → Opens drawer from left
  
Center: SnapBet Logo
  - Emerald color (#059669)
  - 24px height
  
Right: Notification Bell
  - Badge shows count
  - Red dot for unread
  - Tap → Notifications screen
```

### Tab Bar
```
Height: 56px + Safe Area
Background: #FFFFFF
Border Top: 1px solid #F3F4F6

Icons: 24x24, #6B7280 (inactive), #059669 (active)
Labels: 10px, same colors

Camera Button:
- 56x56 circle
- Background: #059669
- Raised 8px above tab bar
- White camera icon (28x28)
- Shadow: 0px 4px 12px rgba(5,150,105,0.3)
```

## Authentication Screens

### 1. Welcome Screen
```
┌─────────────────────────────────┐
│                                 │
│        [SnapBet Logo]          │
│                                 │
│    "Sports betting with         │
│         friends"                │
│                                 │
│   ┌─────────────────────────┐   │
│   │ 🔵 Continue with Google │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ 🐦 Continue with Twitter│   │
│   └─────────────────────────┘   │
│                                 │
│   "For entertainment only.      │
│    Must be 21+"                 │
└─────────────────────────────────┘

Styling:
- Background: #FAF9F5
- Logo: 80x80
- Buttons: Full width - 32px margins
- OAuth buttons: White bg, border
```

### 2. Username Setup
```
┌─────────────────────────────────┐
│ ← Back          Step 1 of 3     │
├─────────────────────────────────┤
│                                 │
│      [Profile Picture]          │
│     (from OAuth provider)       │
│                                 │
│    "Choose your username"       │
│                                 │
│   ┌─────────────────────────┐   │
│   │ @username               │   │
│   └─────────────────────────┘   │
│   ✓ Username available          │
│                                 │
│   ┌─────────────────────────┐   │
│   │      Continue           │   │
│   └─────────────────────────┘   │
└─────────────────────────────────┘

Input Field:
- Background: White
- Border: 1px solid #E5E7EB
- Focus: Border #059669
- Error: Border #EF4444
```

### 3. Favorite Team Selection
```
┌─────────────────────────────────┐
│ ← Back          Step 2 of 3     │
├─────────────────────────────────┤
│                                 │
│   "Pick your favorite team"     │
│                                 │
│   [NFL]  [NBA]                  │ ← Toggle
│                                 │
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│   │ KC │ │ BUF│ │ DAL│ │ SF │  │
│   │ 🏈 │ │ 🏈 │ │ 🏈 │ │ 🏈 │  │
│   └────┘ └────┘ └────┘ └────┘  │
│                                 │
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│   │ GB │ │ NE │ │ MIA│ │ LV │  │
│   │ 🏈 │ │ 🏈 │ │ 🏈 │ │ 🏈 │  │
│   └────┘ └────┘ └────┘ └────┘  │
│                                 │
│   ┌─────────────────────────┐   │
│   │      Continue           │   │
│   └─────────────────────────┘   │
└─────────────────────────────────┘

Team Cards:
- 80x80 squares
- Team color borders when selected
- Team logo in center
```

### 4. Follow Suggestions
```
┌─────────────────────────────────┐
│ ← Back          Step 3 of 3     │
├─────────────────────────────────┤
│                                 │
│   "Follow some bettors"         │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🏀 @mikebets        [Follow]│ │
│ │ 45-35 • +$420 • Lakers fan │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 💰 @sarah_wins     [Follow]│ │
│ │ 67-40 • +$1,250 • Sharp    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎯 @fadeking    [Following]│ │
│ │ 20-45 • -$800 • Fade me!   │ │
│ └─────────────────────────────┘ │
│                                 │
│   ┌─────────────────────────┐   │
│   │    Start Betting →      │   │
│   └─────────────────────────┘   │
└─────────────────────────────────┘

User Cards:
- White background
- Avatar + username + stats
- Follow button changes to "Following"
```

## Main App Screens

### 1. Feed Screen (Home)
```
┌─────────────────────────────────┐
│ 👤    SnapBet    🔔(3)         │
├─────────────────────────────────┤
│ Stories Bar                     │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ →   │
│ │➕│ │🔴│ │🔵│ │  │ │  │      │
│ └──┘ └──┘ └──┘ └──┘ └──┘      │
│ You  Mike Sarah Dan  Amy        │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ @mikebets +$420 🟢 • 2m ago │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │    [Photo of TV]        │ │ │
│ │ │  ┌─────────────────┐    │ │ │
│ │ │  │ Lakers -5.5     │    │ │ │
│ │ │  │ -110 • $50      │    │ │ │
│ │ │  └─────────────────┘    │ │ │
│ │ └─────────────────────────┘ │ │
│ │ "LeBron cooking tonight 🔥"  │ │
│ │                             │ │
│ │ [Tail 8] [Fade 2] 💬 ❤️    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ @sarah_wins 73% 📈 • 5m ago │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ [Celebration video]     │ │ │
│ │ └─────────────────────────┘ │ │
│ │ "PARLAY HIT! 5-leg +$800"  │ │
│ │                             │ │
│ │ 🔥 💰 🎯 (12 reactions)     │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

Post Card Components:
- Header: Avatar + @username + metric + time
- Media: 16:9 ratio, rounded corners
- Bet overlay: Semi-transparent on media
- Caption: 2 lines max, "See more"
- Actions: Tail/Fade (if pick), reactions

Story Circles:
- 64px diameter
- 3px gradient border if unwatched
- Gray border if watched
- Pulsing red if "live"
```

### 2. Games Screen
```
┌─────────────────────────────────┐
│ 👤    SnapBet    🔔           │
├─────────────────────────────────┤
│ Tonight's Games                 │
│ [All] [NFL] [NBA] [Favorites]  │ ← Filters
├─────────────────────────────────┤
│ NBA • 7:30 PM ET               │
│ ┌─────────────────────────────┐ │
│ │ Lakers      vs    Celtics   │ │
│ │ 45-20            42-23      │ │
│ │                             │ │
│ │ Spread: LAL -5.5 (-110)    │ │
│ │ Total: O/U 220.5 (-110)    │ │
│ │ ML: LAL -200 / BOS +170    │ │
│ │                             │ │
│ │ [Quick Bet →]               │ │
│ └─────────────────────────────┘ │
│                                 │
│ NFL • 8:20 PM ET               │
│ ┌─────────────────────────────┐ │
│ │ Chiefs      vs    Bills     │ │
│ │ 11-3             10-4       │ │
│ │                             │ │
│ │ Spread: KC -3.5 (-110)     │ │
│ │ Total: O/U 47.5 (-110)     │ │
│ │ ML: KC -170 / BUF +145     │ │
│ │                             │ │
│ │ [Quick Bet →]               │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

Game Cards:
- White background
- Team logos + records
- All betting lines visible
- Primary CTA: Quick Bet
- Live indicator if in-progress
```

### 3. Camera Screen (Modal)
```
┌─────────────────────────────────┐
│ ✕                        Effects│
├─────────────────────────────────┤
│                                 │
│                                 │
│        [Camera View]            │
│                                 │
│                                 │
│    ┌───┐  ┌───┐  ┌───┐        │
│    │Win│  │Team│  │Score│      │ ← Filters
│    └───┘  └───┘  └───┘        │
│                                 │
│         ◉                      │ ← Capture
│                                 │
│  [Gallery] [Photo/Video] [📎]   │
└─────────────────────────────────┘

After Capture:
┌─────────────────────────────────┐
│ ✕                          Next │
├─────────────────────────────────┤
│                                 │
│      [Captured Media]           │
│                                 │
│   "Add a caption..."            │
│                                 │
│   Attach a bet:                │
│   ┌─────────────────────────┐   │
│   │ Lakers -5.5 • $50 • 2m  │   │
│   │ [Attach this bet]       │   │
│   └─────────────────────────┘   │
│                                 │
│   Share to:                    │
│   ☑️ My Feed                    │
│   ☑️ My Story                   │
│   ☐ NBA Degens (group)         │
└─────────────────────────────────┘

Effects Panel:
- Slide up from bottom
- Team logo overlays
- Win/loss animations
- Score/odds overlays
```

### 4. Messages Screen
```
┌─────────────────────────────────┐
│ 👤    SnapBet    🔔           │
├─────────────────────────────────┤
│ Messages              [➕ New]  │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ NBA Degens 🏀          • 2m │ │
│ │ Mike: "Who's on Lakers?"    │ │
│ │ 👥 12 members • 3 unread    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ @sarah_wins            • 5m │ │
│ │ You: "Tailing your pick!"   │ │
│ │ Delivered ✓✓                │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Parlay Squad          • 15m │ │
│ │ [Shared pick: KC -3.5]      │ │
│ │ 👥 8 members                │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ @fadeking             • 1h  │ │
│ │ fadeking: "Fade me coward"  │ │
│ │ Read                        │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

Chat List Items:
- Avatar (group icon or user)
- Name + last message
- Timestamp + status
- Unread indicator (emerald dot)
```

### 5. Search/Explore Screen
```
┌─────────────────────────────────┐
│ 👤    SnapBet    🔔           │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ 🔍 Search users, teams...   │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 🔥 Hot Bettors                 │
│ ┌─────┐ ┌─────┐ ┌─────┐ →    │
│ │Mike │ │Sarah│ │Dan  │       │
│ │ 65% │ │ 12W │ │+$2k │       │
│ └─────┘ └─────┘ └─────┘       │
│                                 │
│ 📈 Trending Picks              │
│ ┌─────────────────────────────┐ │
│ │ Lakers -5.5                 │ │
│ │ 45 tails • 12 fades • 73%  │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Chiefs ML                   │ │
│ │ 38 tails • 5 fades • 81%   │ │
│ └─────────────────────────────┘ │
│                                 │
│ 💎 Fade Material               │
│ ┌─────────────────────────────┐ │
│ │ @alwayswrong        [Fade] │ │
│ │ 12-58 • -$2,100 • 17% 📉   │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

Search Results (when typing):
- Users matching query
- Picks containing team/player
- Groups you can join
```

## Bottom Sheets & Modals

### 1. Bet Placement Sheet
```
┌─────────────────────────────────┐
│ ━━━━━                           │ ← Handle
│ Lakers vs Celtics              │
│ Tonight • 7:30 PM ET           │
├─────────────────────────────────┤
│ Select Bet Type:               │
│ ┌─────────────────────────────┐ │
│ │ Spread                  ✓   │ │
│ │ Lakers -5.5 (-110)          │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Total                       │ │
│ │ Over 220.5 (-110)          │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Moneyline                   │ │
│ │ Lakers -200                 │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Bet Amount:                    │
│ ┌─────────────────────────────┐ │
│ │ $50                         │ │
│ └─────────────────────────────┘ │
│ [$25] [$50] [$100] [Max]      │ ← Quick amounts
│                                 │
│ To Win: $45.45                 │
│ Total Payout: $95.45           │
├─────────────────────────────────┤
│ ☐ Share to feed                │
│ ☐ Add to story                 │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │      Place Bet ($50)       │ │
│ └─────────────────────────────┘ │
│ Balance: $1,420                │
└─────────────────────────────────┘

States:
- Slides up from bottom
- 3 snap points: 50%, 75%, 90%
- Backdrop darkens background
```

### 2. Tail/Fade Confirmation
```
┌─────────────────────────────────┐
│ ━━━━━                           │
│ Tail @mikebets' pick?          │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Lakers -5.5 (-110)          │ │
│ │ Bet: $50 → Win: $45.45      │ │
│ └─────────────────────────────┘ │
│                                 │
│ Your bet will track with Mike's│
│ You'll both win or lose together│
│                                 │
│ ┌─────────────────────────────┐ │
│ │    Confirm Tail ($50)      │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │         Cancel             │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

Fade Version:
- Shows opposite bet
- "You're betting AGAINST Mike"
- Orange color scheme
```

### 3. Profile Drawer (Left Side)
```
┌─────────────────────────────┐
│ ┌─────────────────────────┐ │
│ │      [Avatar]           │ │
│ │     @yourusername       │ │
│ │   45-35 • +$420 • 🔥3   │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ 💰 Bankroll      $1,420    │
│ 📊 Win Rate        56.3%    │
│ 🎯 ROI            +12.5%    │
├─────────────────────────────┤
│ 👤 View Profile             │
│ 📜 Bet History              │
│ 👥 Find Friends             │
│ ⚙️  Settings                │
│ 🌙 Dark Mode         ○      │
├─────────────────────────────┤
│ ↻  Reset Bankroll           │
│ 📖 How to Play              │
│ 📧 Support                  │
├─────────────────────────────┤
│ 🚪 Sign Out                 │
└─────────────────────────────┘

Behavior:
- Slides from left
- Backdrop closes drawer
- 80% screen width
- Spring animation
```

## Profile & Settings

### 1. User Profile Screen
```
┌─────────────────────────────────┐
│ ← Back              @mikebets  │
├─────────────────────────────────┤
│          [Avatar]               │
│         @mikebets               │
│     45-35 • +$420 • 🔥3        │
│                                 │
│ [Following]      [Message]      │
├─────────────────────────────────┤
│ [Picks]     [Performance]       │ ← Tabs
├─────────────────────────────────┤
│ Picks Tab:                     │
│ ┌─────────────────────────────┐ │
│ │ Yesterday • 3 picks         │ │
│ ├─────────────────────────────┤ │
│ │ Lakers -5.5 ✅ +$45         │ │
│ │ 12 tails • 3 fades          │ │
│ ├─────────────────────────────┤ │
│ │ Chiefs ML ✅ +$30           │ │
│ │ 8 tails • 1 fade            │ │
│ ├─────────────────────────────┤ │
│ │ Over 220.5 ❌ -$50          │ │
│ │ 5 tails • 2 fades           │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

Performance Tab:
┌─────────────────────────────────┐
│ By Sport:                      │
│ ┌─────────────────────────────┐ │
│ │ 🏀 NBA: 28-20 (+$320)      │ │
│ │ Win Rate: 58.3%            │ │
│ │ Best: Home Dogs +8.5       │ │
│ ├─────────────────────────────┤ │
│ │ 🏈 NFL: 17-15 (+$100)      │ │
│ │ Win Rate: 53.1%            │ │
│ │ Best: Unders in division   │ │
│ └─────────────────────────────┘ │
│                                 │
│ Tail/Fade Impact:              │
│ ┌─────────────────────────────┐ │
│ │ 156 people tailed (89-67)  │ │
│ │ 42 people faded (18-24)    │ │
│ │ Influence Score: 8.2/10    │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

Own Profile:
- "Edit Profile" instead of Follow
- Can see private stats
```

### 2. Settings Screen
```
┌─────────────────────────────────┐
│ ← Back          Settings       │
├─────────────────────────────────┤
│ Account                        │
│ ┌─────────────────────────────┐ │
│ │ Username         @yourname  │ │
│ │ Email      your@email.com   │ │
│ │ Favorite Team    Lakers     │ │
│ └─────────────────────────────┘ │
│                                 │
│ Notifications                  │
│ ┌─────────────────────────────┐ │
│ │ Tails/Fades           ✓     │ │
│ │ Bet Results           ✓     │ │
│ │ Direct Messages       ✓     │ │
│ │ Group Mentions        ✓     │ │
│ └─────────────────────────────┘ │
│                                 │
│ Privacy                        │
│ ┌─────────────────────────────┐ │
│ │ Public Profile        ✓     │ │
│ │ Show Bankroll         ✓     │ │
│ │ Show Win Rate         ✓     │ │
│ └─────────────────────────────┘ │
│                                 │
│ About                          │
│ ┌─────────────────────────────┐ │
│ │ Version 1.0.0               │ │
│ │ Terms of Service            │ │
│ │ Privacy Policy              │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Messaging System

### 1. Direct Message Screen
```
┌─────────────────────────────────┐
│ ← @sarah_wins          📞 ℹ️   │
├─────────────────────────────────┤
│                     Tuesday     │
│ ┌─────────────────────────────┐ │
│ │ Nice parlay! Following your │ │
│ │ picks tonight              ▶│ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │◀ Thanks! Check this out:   │ │
│ │  ┌───────────────────┐     │ │
│ │  │ Lakers -5.5 • $50 │     │ │
│ │  │ [Tail] [Fade]     │     │ │
│ │  └───────────────────┘     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Tailing! LFG 🚀           ▶│ │
│ │                   Read 2:45│ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ [📷] [Type a message...]   [↑] │
└─────────────────────────────────┘

Message Types:
- Text bubbles (blue/gray)
- Shared picks (tappable cards)
- Photos/videos (rounded corners)
- Read receipts
- Disappear after 24h
```

### 2. Group Chat Screen
```
┌─────────────────────────────────┐
│ ← NBA Degens 🏀         👥 12  │
├─────────────────────────────────┤
│ Mike joined the group          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ @mike: Who's on Lakers?    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ @you: I am! Check my pick: │ │
│ │  ┌───────────────────┐     │ │
│ │  │ [Your pick card]  │     │ │
│ │  └───────────────────┘     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ @sarah: Fading lol 😂      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ @dan: [Photo of watch party]│ │
│ │ "Squad ready!"             │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ [@] [📷] [Message...]      [↑] │
└─────────────────────────────────┘

Group Features:
- Member list (tap header)
- @ mentions
- Admin can add/remove
- Group name/photo editable
```

### 3. Group Info Screen
```
┌─────────────────────────────────┐
│ ← Group Info                   │
├─────────────────────────────────┤
│       [Group Avatar]            │
│       NBA Degens 🏀             │
│     Created by @mikebets        │
│                                 │
│ [Edit Name]  [Change Photo]     │
├─────────────────────────────────┤
│ 12 Members                     │
│ ┌─────────────────────────────┐ │
│ │ @mikebets (Admin)      ⋮   │ │
│ │ 45-35 • +$420              │ │
│ ├─────────────────────────────┤ │
│ │ @sarah_wins            ⋮   │ │
│ │ 67-40 • +$1,250            │ │
│ ├─────────────────────────────┤ │
│ │ @you                   ⋮   │ │
│ │ 23-18 • +$180              │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Add Members]                   │
│                                 │
│ [Leave Group]                   │
└─────────────────────────────────┘
```

## Betting Flows

### 1. Place Bet Flow
```
Games Tab → Tap Game → Bottom Sheet
→ Select Bet Type → Enter Amount
→ Toggle "Share to Feed" → Place Bet
→ Success Animation → Return to Games

Key Interactions:
- Amount auto-selects for editing
- Real-time payout calculation
- Insufficient funds error
- Success haptic + animation
```

### 2. Tail Flow
```
Feed/Chat → See Pick → Tap "Tail"
→ Confirmation Sheet → Confirm
→ Success Animation → Update Count

Visual Feedback:
- Button animates to "Tailed ✓"
- Count increments immediately
- Notification to pick owner
```

### 3. Fade Flow
```
Feed/Chat → See Pick → Tap "Fade"
→ Shows Opposite Bet → Confirm
→ Success Animation → Update Count

Fade Logic:
- Spread: Opposite team
- Total: Opposite O/U
- ML: Opposite team
- Shows "Betting against @user"
```

## Social Features

### 1. Follow/Unfollow Flow
```
Tap Username → Profile → "Follow"
→ Button changes to "Following"
→ Can tap to show menu:
  - Unfollow
  - Turn on notifications
  - Message

Animation:
- Button fills with emerald
- Subtle scale animation
- Haptic feedback
```

### 2. Story Viewer
```
┌─────────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━          │ ← Progress
│ @mikebets • 2h ago             │
├─────────────────────────────────┤
│                                 │
│                                 │
│      [Full screen media]        │
│                                 │
│                                 │
│   "5-0 this week 🔥"           │
│                                 │
│                                 │
│                                 │
├─────────────────────────────────┤
│ ↑ Swipe up to reply            │
└─────────────────────────────────┘

Interactions:
- Tap right: Next story
- Tap left: Previous
- Hold: Pause
- Swipe down: Close
- Swipe up: Reply via DM
```

### 3. Notifications Screen
```
┌─────────────────────────────────┐
│ ← Notifications                │
├─────────────────────────────────┤
│ Today                          │
│ ┌─────────────────────────────┐ │
│ │ 🟦 @mike tailed your pick   │ │
│ │ Lakers -5.5 • 2m ago        │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ ✅ Your bet won! +$45       │ │
│ │ Lakers 115 - Celtics 108    │ │
│ └─────────────────────────────┘ │
│                                 │
│ Yesterday                      │
│ ┌─────────────────────────────┐ │
│ │ 🟧 @sarah faded your pick   │ │
│ │ Chiefs ML • 1d ago          │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 👤 @newuser followed you    │ │
│ │ 1d ago                      │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

Notification Types:
- 🟦 Tail (blue)
- 🟧 Fade (orange)
- ✅ Win (green)
- ❌ Loss (red)
- 👤 Follow (gray)
- 💬 Message (emerald)
- 🔥 Streak (fire)
```

## Edge Cases & Empty States

### 1. Empty Feed
```
┌─────────────────────────────────┐
│ 👤    SnapBet    🔔           │
├─────────────────────────────────┤
│                                 │
│                                 │
│         [Icon: 📱]              │
│                                 │
│    "No picks yet today"         │
│                                 │
│  "Follow more bettors or"       │
│   "make the first pick!"        │
│                                 │
│   ┌─────────────────────────┐   │
│   │    Find Bettors         │   │
│   └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### 2. Expired Pick Interaction
```
When tapping Tail/Fade on expired:

┌─────────────────────────────────┐
│        Game Started             │
│                                 │
│  "This pick has expired.        │
│   Game already started."        │
│                                 │
│   ┌─────────────────────────┐   │
│   │         OK              │   │
│   └─────────────────────────┘   │
└─────────────────────────────────┘
```

### 3. Insufficient Funds
```
┌─────────────────────────────────┐
│      Insufficient Funds         │
│                                 │
│  "You need $50 but only         │
│   have $30 available."          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │    Reset Bankroll          │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │      Lower Bet             │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 4. Network Error States
```
- Pull-to-refresh indicator
- "No connection" banner
- Retry buttons on failures
- Cached content when offline
```

## Animation & Interaction Details

### Haptic Feedback Points
- Button taps (light)
- Tail/Fade actions (medium)
- Bet placement (success)
- Pull to refresh (light)
- Story advance (light)

### Animation Timings
- Page transitions: 300ms
- Bottom sheet: Spring damping 0.8
- Button press: Scale 0.97
- Success checkmark: 400ms
- Count updates: 200ms fade

### Gesture Recognizers
- Swipe right: Back navigation
- Swipe down: Close modal
- Pull down: Refresh
- Long press: Context menu
- Pinch: Zoom photos

## Accessibility

### VoiceOver Labels
- Buttons: Action + context
- Images: Description of content
- Counts: "8 tails, 2 fades"
- Status: "Bet won, plus 45 dollars"

### Color Contrast
- All text meets WCAG AA
- Interactive elements 3:1 minimum
- Error states use patterns + color

### Font Scaling
- Supports Dynamic Type
- Minimum 14px equivalent
- Maximum 24px for body text

---

This comprehensive UI/UX document covers every screen, flow, and interaction in SnapBet. Each component has been designed with the warm, clean aesthetic and native mobile patterns in mind.