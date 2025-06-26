# Sprint 05.07 Integration Checklist

## Critical Integration Points for Complete Betting System

This checklist ensures that all betting features built in previous sprints are properly connected and functional by the end of Epic 5.

### 🚨 MUST-HAVE Integrations

#### 1. Feed Query Integration
**Current State**: Posts have `bet_id` but no bet data is loaded
**Required Changes**:
```typescript
// services/feed/feedService.ts
.select(`
  ...,
  bet:bets!bet_id (
    id,
    game_id,
    bet_type,
    bet_details,
    stake,
    odds,
    potential_win,
    status,
    is_tail,
    is_fade,
    original_pick_id,
    game:games!game_id (
      id,
      sport,
      home_team,
      away_team,
      commence_time,
      home_score,
      away_score,
      status,
      bookmakers
    )
  )
`)
```

- [ ] Update feed service query to include bet relationship
- [ ] Update PostWithType interface to include bet data
- [ ] Test that bet data loads with posts
- [ ] Ensure game data is nested within bet data

#### 2. PostCard Tail/Fade Integration
**Current State**: Shows placeholder text
**Required Changes**:
```typescript
// components/content/PostCard.tsx
import { TailFadeButtons } from '@/components/engagement/buttons/TailFadeButtons';

// Replace placeholder with:
{post.post_type === PostType.PICK && post.bet && post.bet.game && (
  <TailFadeButtons 
    post={post}
    bet={post.bet}
    game={post.bet.game}
    onTailFadePress={() => {
      // Optional: pause video, analytics, etc.
    }}
  />
)}
```

- [ ] Import TailFadeButtons component
- [ ] Remove placeholder tail/fade container
- [ ] Pass correct props (post, bet, game)
- [ ] Test tail/fade buttons appear on pick posts
- [ ] Verify counts update in real-time

#### 3. Pick Post Creation with Bet Link
**Current State**: Share Pick stores bet ID in MMKV but doesn't link to post
**Required Changes**:
```typescript
// services/content/postService.ts
async createPost(input: CreatePostInput) {
  // If this is a pick post, ensure bet_id is set
  if (input.post_type === 'pick' && input.metadata?.bet_id) {
    postData.bet_id = input.metadata.bet_id;
  }
  
  // Create post with bet_id linked
  const { data: post } = await supabase
    .from('posts')
    .insert({
      ...postData,
      bet_id: input.metadata?.bet_id || null
    })
    .select('*, bet:bets!bet_id(*)') // Return with bet data
    .single();
}
```

- [ ] Ensure bet_id is saved when creating pick posts
- [ ] Return post with bet data after creation
- [ ] Test that newly created pick posts have tail/fade buttons
- [ ] Verify bet details show in overlay

#### 4. Bet Overlays with Real Data
**Current State**: Shows "Coming soon" placeholder
**Required Changes**:
```typescript
// components/overlays/PickOverlay.tsx
export function PickOverlay({ post }: { post: PostWithType }) {
  if (!post.bet) return null;
  
  return (
    <BetPickOverlay 
      bet={post.bet}
      game={post.bet.game}
    />
  );
}
```

- [ ] Replace placeholder overlays with real components
- [ ] Use actual bet data from post
- [ ] Display correct bet type, odds, stake
- [ ] Show team colors and details
- [ ] Test all bet types (spread, total, ML)

#### 5. Outcome Post Integration
**Current State**: Share Result button exists but doesn't link settled bet
**Required Changes**:
```typescript
// When creating outcome post
if (input.post_type === 'outcome' && input.metadata?.bet_id) {
  postData.settled_bet_id = input.metadata.bet_id;
}
```

- [ ] Add settled_bet_id to outcome posts
- [ ] Load settled bet data in feed query
- [ ] Show win/loss overlay with actual amounts
- [ ] Display final scores
- [ ] Auto-suggest appropriate effects

### 🔄 Data Flow Verification

#### Bet Placement → Pick Post Flow
1. [ ] User places bet via BetSheet
2. [ ] Bet is created in database with all details
3. [ ] If "Share Pick" is on, navigate to camera
4. [ ] Camera receives bet data from MMKV
5. [ ] Pick overlay shows bet details
6. [ ] Post is created with bet_id linked
7. [ ] Post appears in feed with tail/fade buttons
8. [ ] Other users can tail/fade the pick

#### Tail/Fade Flow
1. [ ] User sees pick post with bet details
2. [ ] Tail/fade buttons show current counts
3. [ ] Clicking opens TailFadeSheet
4. [ ] Sheet shows original bet details
5. [ ] User can match or enter custom stake
6. [ ] Confirmation places new bet
7. [ ] pick_actions record is created
8. [ ] Counts update via EventEmitter
9. [ ] Original poster gets notification

#### Settlement → Outcome Post Flow
1. [ ] Admin runs settlement script
2. [ ] Bets are marked won/lost/push
3. [ ] Bankrolls are updated
4. [ ] User sees Share Result button
5. [ ] Camera opens with outcome overlay
6. [ ] Post created with settled_bet_id
7. [ ] Shows win/loss amount and score

### 📊 Testing Checklist

#### Feed Integration Tests
- [ ] Pick posts show tail/fade buttons
- [ ] Bet details are loaded with posts
- [ ] Game data is accessible
- [ ] Expired games disable tail/fade
- [ ] Counts reflect actual pick_actions

#### Tail/Fade Function Tests
- [ ] Can tail a pick with same stake
- [ ] Can tail with custom amount
- [ ] Can fade with opposite bet calculated
- [ ] Cannot tail/fade own picks
- [ ] Cannot tail/fade after game starts
- [ ] Cannot tail/fade same pick twice
- [ ] Counts update optimistically
- [ ] Who tailed modal shows users

#### Camera Integration Tests
- [ ] Share Pick navigates to camera
- [ ] Pick overlay displays correctly
- [ ] Bet details are accurate
- [ ] Share Result works for settled bets
- [ ] Outcome overlay shows W/L
- [ ] Effects are suggested appropriately

#### End-to-End Scenarios
- [ ] Place bet → Share pick → Others tail → Settle → Share outcome
- [ ] Fade a pick → Game settles → Both users can share outcomes
- [ ] Tail with custom amount → Verify in who tailed modal
- [ ] Pick expires at game time → No longer tailabale

### 🐛 Known Issues to Fix

1. **Type Safety**
   - [ ] Update PostWithType to include bet relationship
   - [ ] Fix any TypeScript errors from bet data access
   - [ ] Ensure JSONB fields are properly typed

2. **Performance**
   - [ ] Optimize feed query with bet joins
   - [ ] Consider pagination for pick_actions
   - [ ] Cache bet data appropriately

3. **Edge Cases**
   - [ ] Handle deleted bets gracefully
   - [ ] Show appropriate UI for pushes
   - [ ] Handle missing game data

### ✅ Definition of Done

The betting system is considered fully integrated when:

1. **All pick posts in feed show functional tail/fade buttons**
2. **Clicking tail/fade opens sheet with correct bet details**
3. **Users can successfully tail/fade with real bets placed**
4. **Counts update in real-time across the app**
5. **Pick overlays show actual bet information**
6. **Outcome overlays show real win/loss data**
7. **Share Pick flow works end-to-end**
8. **Share Result flow works for settled bets**
9. **All TypeScript errors are resolved**
10. **Manual testing confirms all flows work**

### 🚀 Post-Integration Enhancements

Once core integration is complete:
- [ ] Add animations for tail/fade actions
- [ ] Implement push notifications for tail/fade
- [ ] Add haptic feedback throughout
- [ ] Consider caching strategies for bet data
- [ ] Add analytics tracking for viral metrics

---

**Note**: This integration MUST be completed in Sprint 05.07 or the entire betting system will remain non-functional. The tail/fade viral mechanics are the core differentiator of SnapBet. 