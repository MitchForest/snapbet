# Epic 3: Camera & Content Creation - Detailed Roadmap

## Epic Overview

**Epic Goal**: Build a camera-first content creation system with emoji effects, enabling users to create and share three types of ephemeral content (Content, Pick, Outcome) as either posts or stories.

**Duration**: Day 2 of Development (8-10 hours)
**Dependencies**: Epic 1 (Foundation) and Epic 2 (Auth) must be complete
**Outcome**: Users can create, view, and interact with media-rich content

---

## Sprint Breakdown

### Sprint 3.0: Profile & Badge Catchup (1.5 hours)

**Goal**: Complete minimum profile and badge system to support effect gating

**Features**:

#### Profile Screen (Current User Only)
- Profile header with avatar, username, stats
- Badge display section showing earned badges
- Basic stats: W/L record, ROI, current profit
- Settings button (already implemented)
- Tab structure (prepare for future: Picks, Performance)

#### Badge System Implementation
- Badge calculation engine (runs on data change)
- Weekly reset logic (every Monday)
- Badge display components with animations
- Badge data structure and storage

#### The 8 Weekly Badges:
- 🔥 **Hot Right Now** - Won last 3+ picks this week
- 💰 **Week's Profit King** - Up the most this week  
- 🌊 **Riding the Wave** - Others profiting from your picks this week
- 🎯 **This Week's Sharp** - 70%+ win rate (min 5 bets)
- 🎪 **Fade God** - People made money fading you this week
- ⚡ **Most Active** - Posted 10+ picks this week
- 👻 **Ghost** - Haven't posted in 3+ days
- 🏆 **Sunday Sweep** - Perfect NFL Sunday

**Technical Tasks**:
- Create ProfileScreen component
- Build badge calculation functions
- Implement badge display grid
- Add stats calculation from mock data
- Create badge unlock animations
- Store badge state in Zustand

**Mock Data Requirements**:
- Need mock betting history for current user
- Mock tail/fade data for social badges
- Mock post history for activity badges
- **Note**: May need DB migration for existing mock users

**Acceptance Criteria**:
- [ ] Profile screen shows current user info
- [ ] All 8 badges display correctly
- [ ] Badge calculation works with mock data
- [ ] Earned badges highlighted, others grayed
- [ ] Badge count available globally for effects
- [ ] Weekly reset logic implemented

---

### Sprint 3.1: Camera Foundation (2 hours)

**Goal**: Implement core camera functionality with photo/video capture

**Features**:
- Camera modal/screen implementation
- Photo capture mode
- Video recording (10 second limit)
- Front/back camera toggle
- Flash control (on/off/auto)
- Grid overlay toggle
- Camera permissions handling
- Error states (permission denied)

**Technical Tasks**:
- Set up Expo Camera component
- Create camera UI controls
- Implement capture functionality
- Handle media temporary storage
- Add countdown timer for video
- Platform-specific camera settings

**Acceptance Criteria**:
- [ ] Camera opens when tapping camera tab
- [ ] Can capture photos
- [ ] Can record videos up to 10 seconds
- [ ] Can switch between cameras
- [ ] Flash settings work correctly
- [ ] Permissions handled gracefully

---

### Sprint 3.2: Effects System (2 hours)

**Goal**: Implement emoji effects with proper tier gating based on badges

**Features**:

#### Effect Categories (UI Organization):
- 🏆 **WINS** - Fire, Money, Celebrations, Charts Up
- 😭 **LOSSES** - Tears, Skull, Charts Down, Big L  
- 🎭 **VIBES** - Gen Z Memes, Gaming Culture, Reaction Memes
- ⚡ **HYPE** - Sports, Strength, Confidence, Chaos Energy
- 🎲 **WILD CARDS** - Gambling, Weather, Magic, Viral Combos

#### Effect Tiers (Based on Weekly Badges):
- **Tier 0**: 48 base effects - Available to everyone
- **Tier 1**: 15 enhanced effects - Unlocked with ANY 1 badge this week
- **Tier 2**: 10 premium effects - Unlocked with 3+ badges this week

#### Gating Implementation:
- Locked effects show grayed out with lock icon
- Tap locked effect shows unlock requirement
- Visual distinction between tiers
- Badge count from Sprint 3.0 determines access

**Technical Tasks**:
- Create effects overlay system using React Native Reanimated
- Implement emoji particle physics (bounce, fall, float, explode)
- Build categorized effects picker UI
- Add tier-based gating logic
- Effect preview system with lock states
- Performance optimization for 60 FPS

**Example Effects by Tier**:
- **Tier 0**: Basic fire (🔥), money rain (💵), skull float (💀)
- **Tier 1**: Enhanced fire with sparkles, money shower mix
- **Tier 2**: Inferno mode, make it rain with explosions

**Acceptance Criteria**:
- [ ] All effects implemented with proper physics
- [ ] Effects organized in 5 UI categories
- [ ] Tier gating works based on badge count
- [ ] Locked effects clearly indicated
- [ ] Smooth 60 FPS performance
- [ ] Effects apply to both photos and videos

---

### Sprint 3.3: Post Type System (1.5 hours)

**Goal**: Implement three distinct post types with appropriate overlays

**Features**:

#### Content Posts
- No overlay required
- Just media + effects + caption
- Entry from camera button

#### Pick Posts  
- Bet details overlay:
  - Team selection
  - Spread/Total/ML
  - Odds
  - Stake amount
- Semi-transparent overlay on media
- "Share Pick" entry point (from bet confirmation)
- Tail/Fade buttons visible (inactive for now)

#### Outcome Posts
- Result overlay:
  - Win/Loss/Push badge
  - Profit/loss amount
  - Final score (optional)
  - Game details
- "Share Result" entry point (from bet history)
- Auto-suggested celebration/commiseration effects

**Technical Tasks**:
- Create overlay components
- Design overlay layouts
- Implement type selection logic
- Build type-specific UI elements
- Create preview system for overlays

**Acceptance Criteria**:
- [ ] Can create all three post types
- [ ] Overlays display correctly on media
- [ ] Pick posts show bet details clearly
- [ ] Outcome posts show results prominently
- [ ] Type determines available options

---

### Sprint 3.4: Content Composition (1.5 hours)

**Goal**: Complete the content creation flow with captions and sharing options

**Features**:
- Caption input (280 character limit)
- Character counter
- Emoji keyboard support
- Post/Story destination toggle
- Media preview screen
- Edit/retake options
- Share button with loading state
- Expiration time display:
  - Pick posts: "Expires at game time"
  - Other posts: "Expires in 24 hours"

**Technical Tasks**:
- Build caption input component
- Create preview screen
- Add destination selector
- Implement share flow (mock for now)
- Add loading states
- Create success feedback

**Acceptance Criteria**:
- [ ] Can add captions up to 280 chars
- [ ] Can choose post vs story
- [ ] Preview shows final result
- [ ] Can retake/re-edit
- [ ] Clear expiration information
- [ ] Share button works (mock save)

---

### Sprint 3.5: Feed Display (2 hours)

**Goal**: Display all content types in the feed with proper UI (Note: Full feed is Epic 4, this is just displaying our own posts)

**Features**:
- Post card component:
  - User info (avatar, username, badge)
  - Media display (photo/video)
  - Overlays (for pick/outcome)
  - Caption text
  - Engagement metrics (mocked)
  - Expiration countdown
  - Action buttons
- Story bar:
  - Horizontal scroll
  - User avatars with rings
  - "Your story" first
  - Unwatched indicator (mocked)
  - Live indicator (red ring)
- Basic list implementation (full FlashList in Epic 4)

**Technical Tasks**:
- Create PostCard component
- Build StoryBar component
- Implement media player for videos
- Add countdown timers
- Create loading skeletons
- Mock data for testing display

**Acceptance Criteria**:
- [ ] Feed shows all post types correctly
- [ ] Stories appear at top
- [ ] Videos play inline
- [ ] Overlays render properly
- [ ] Components ready for Epic 4 integration

---

### Sprint 3.6: Engagement UI (2 hours)

**Goal**: Implement interaction UI (even if not fully functional)

**Features**:

#### Comments (Posts only)
- Comment button with count
- Comment composer (280 chars)
- Comment list view
- User avatar + username
- Timestamp
- Reply option (UI only)

#### Reactions (Posts & Stories)
- 6 reaction options: 🔥💰😂😭💯🎯
- Quick reaction picker
- Reaction counts
- Animated reaction selection
- "Who reacted" list

#### Tail/Fade (Pick posts/stories only)
- Prominent Tail button (blue)
- Prominent Fade button (orange)
- Count displays
- "Coming soon" toast for now
- Visual feedback on tap

**Technical Tasks**:
- Build comment UI components
- Create reaction picker
- Design tail/fade buttons
- Add interaction animations
- Create count displays
- Build "who interacted" views

**Acceptance Criteria**:
- [ ] Comments UI works on posts
- [ ] Reactions work on posts and stories
- [ ] Tail/Fade buttons appear on pick content
- [ ] All interactions have visual feedback
- [ ] Counts display (mocked data)
- [ ] Smooth animations

---

## Technical Architecture

### Component Structure
```
components/
├── profile/                 # Sprint 3.0 additions
│   ├── ProfileScreen.tsx
│   ├── ProfileHeader.tsx
│   ├── BadgeGrid.tsx
│   ├── BadgeItem.tsx
│   └── StatsDisplay.tsx
├── badges/                  # Sprint 3.0 additions
│   ├── BadgeCalculator.ts
│   ├── BadgeDefinitions.ts
│   └── WeeklyReset.ts
├── camera/
│   ├── CameraView.tsx
│   ├── CameraControls.tsx
│   ├── MediaPreview.tsx
│   └── EffectsPicker.tsx
├── effects/                 # Updated for emoji system
│   ├── EmojiEffectsManager.tsx
│   ├── categories/
│   │   ├── WinsEffects.tsx
│   │   ├── LossesEffects.tsx
│   │   ├── VibesEffects.tsx
│   │   ├── HypeEffects.tsx
│   │   └── WildCardsEffects.tsx
│   ├── particles/
│   │   ├── BaseParticle.tsx
│   │   └── physics/
│   └── EffectGating.tsx
├── content/
│   ├── PostCard.tsx
│   ├── StoryBar.tsx
│   ├── StoryCircle.tsx
│   └── ContentOverlay.tsx
├── creation/
│   ├── CaptionInput.tsx
│   ├── TypeSelector.tsx
│   ├── ShareOptions.tsx
│   └── ExpirationInfo.tsx
└── engagement/
    ├── CommentSection.tsx
    ├── ReactionPicker.tsx
    ├── TailFadeButtons.tsx
    └── EngagementCounts.tsx
```

### State Management (Zustand)
```typescript
interface ContentCreationState {
  // Camera state
  cameraMode: 'photo' | 'video';
  cameraFacing: 'front' | 'back';
  flashMode: 'on' | 'off' | 'auto';
  
  // Creation state
  capturedMedia: {
    uri: string;
    type: 'photo' | 'video';
  } | null;
  selectedEffect: string | null;
  postType: 'content' | 'pick' | 'outcome';
  caption: string;
  destination: 'post' | 'story';
  
  // Badge state (Sprint 3.0)
  currentWeekBadges: Badge[];
  badgeCount: number;
  
  // Actions
  setCameraMode: (mode: 'photo' | 'video') => void;
  toggleCamera: () => void;
  captureMedia: (uri: string, type: 'photo' | 'video') => void;
  selectEffect: (effect: string | null) => void;
  setPostType: (type: 'content' | 'pick' | 'outcome') => void;
  setCaption: (text: string) => void;
  resetCreation: () => void;
  updateBadges: (badges: Badge[]) => void;
}
```
```

### Mock Data Structure
```typescript
// Badge types (Sprint 3.0)
interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  earnedAt?: Date;
  expiresAt: Date; // Monday reset
}

interface UserStats {
  wins: number;
  losses: number;
  currentStreak: number;
  weeklyProfit: number;
  roi: number;
  activeDays: number;
}

// Existing post structure
interface MockPost {
  id: string;
  userId: string;
  type: 'content' | 'pick' | 'outcome';
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  caption: string;
  effect?: string;
  overlay?: PickOverlay | OutcomeOverlay;
  expiresAt: Date;
  createdAt: Date;
  
  // Engagement
  comments: Comment[];
  reactions: Reaction[];
  tailCount: number;
  fadeCount: number;
}

interface PickOverlay {
  gameId: string;
  betType: 'spread' | 'total' | 'moneyline';
  selection: string;
  odds: number;
  stake: number;
}

interface OutcomeOverlay {
  result: 'win' | 'loss' | 'push';
  profitLoss: number;
  gameScore?: string;
}
```

---

## Database Migration Notes

**Required for Sprint 3.0**:
- Add `badges` table if not exists
- Add `user_stats` table for weekly calculations
- Add mock betting history to existing mock users
- Add `weekly_reset_at` timestamp tracking
- Ensure mock data supports badge calculations:
  - Recent wins/losses for streak badges
  - Profit/loss data for money badges
  - Post history for activity badges
  - Tail/fade data for social badges

---

## Integration Points

### With Epic 2 (Auth)
- User avatar for story circle
- Username for post attribution
- Auth state for permissions

### With Epic 4 (Feed)
- Feed will consume PostCard component
- Story bar integration
- Real-time updates preparation
- Other users' profiles

### With Epic 5 (Betting)
- Pick post creation from bet placement
- Outcome post creation from bet settlement
- Bet details for overlays
- Real badge calculations from actual bets

---

## Testing Checklist

### Profile & Badges (Sprint 3.0)
- [ ] Profile screen displays correctly
- [ ] All 8 badges show with proper state
- [ ] Badge calculations work with mock data
- [ ] Weekly reset logic functions
- [ ] Badge count affects effect unlocking

### Camera Functionality
- [ ] Photo capture works
- [ ] Video recording stops at 10 seconds
- [ ] Camera switch works
- [ ] Flash modes work
- [ ] Permissions handled

### Effects System
- [ ] All Tier 0 effects available to everyone
- [ ] Tier 1 effects locked without badges
- [ ] Tier 2 effects locked without 3 badges
- [ ] Lock UI shows requirements
- [ ] Performance stays at 60 FPS

### Content Types
- [ ] Can create content posts
- [ ] Can create pick posts (UI only)
- [ ] Can create outcome posts (UI only)
- [ ] Overlays display correctly

### Feed Display
- [ ] Posts render correctly
- [ ] Stories show at top
- [ ] Videos play inline
- [ ] Expiration shows

### Engagement
- [ ] Comment UI functions
- [ ] Reactions animate
- [ ] Tail/Fade buttons visible
- [ ] Counts display

---

## Success Metrics

- Camera opens in < 500ms
- Effects preview at 60 FPS
- Badge calculations complete in < 100ms
- Effect gating works correctly
- All content types functional
- Complete UI for comments/reactions/tail/fade

---

## Notes & Considerations

1. **Sprint 3.0 Priority**: Complete profile/badges first to enable effect gating
2. **Mock Data**: Ensure existing mock users have sufficient data for badge testing
3. **Performance**: Use React.memo extensively for feed items
4. **Media Storage**: For now, use local storage. Supabase upload in Epic 4
5. **Offline**: Store captured media locally until upload
6. **Accessibility**: Ensure all interactive elements are accessible
7. **Testing**: Focus on UI/UX, backend integration comes later

---

## Next Steps (Epic 4)
- Connect to real Supabase storage
- Implement full feed with other users
- Other user profiles
- Real-time updates
- Complete engagement features backend
- Story viewer
- Pull-to-refresh