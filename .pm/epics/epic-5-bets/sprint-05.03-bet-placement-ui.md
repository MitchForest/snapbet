# Sprint 05.03: Bet Placement UI Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 5 - Complete Betting System with Tail/Fade

**Sprint Goal**: Build the bottom sheet bet slip interface with smooth animations, bet configuration options, and seamless navigation to pick sharing.

**User Story Contribution**: 
- Delivers Story 3 (Boring Bet Slip Problem) with 10-second bet placement
- Enables Story 2 (Permanent Record Problem) with Share Pick flow

## 🚨 Required Development Practices

### Database Management
- **Use Supabase MCP** to inspect current database state
- **Keep types synchronized**: Run type generation after ANY schema changes
- **Migration files required**: Every database change needs a migration file
- **Test migrations**: Ensure migrations run cleanly on fresh database

### UI/UX Consistency
- **Use Tamagui components**: `View`, `Text`, `XStack`, `YStack`, `Stack`
- **Follow UI/UX rules**: See `.pm/process/ui-ux-consistency-rules.md`
- **Use Colors constant**: Import from `@/theme` - NEVER hardcode colors
- **Standard spacing**: Use Tamagui's `$1`, `$2`, `$3`, etc. tokens

### Code Quality
- **Zero tolerance**: No lint errors, no TypeScript errors
- **Type safety**: No `any` types without explicit justification
- **Run before handoff**: `bun run lint && bun run typecheck`

## Sprint Plan

### Objectives
1. Implement bottom sheet with 3 snap points (25%, 50%, 90%)
2. Create bet type selector tabs (Spread/Total/Moneyline)
3. Build team/side selection with visual feedback
4. Implement stake input with quick amounts and keyboard
5. Show real-time payout calculations
6. Add Place Bet action with loading states
7. Navigate to camera on Share Pick selection

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `components/betting/BetSheet.tsx` | Main bottom sheet container | NOT STARTED |
| `components/betting/BetTypeSelector.tsx` | Spread/Total/ML tab selector | NOT STARTED |
| `components/betting/TeamSelector.tsx` | Team/side selection buttons | NOT STARTED |
| `components/betting/StakeInput.tsx` | Bet amount input component | NOT STARTED |
| `components/betting/PayoutDisplay.tsx` | Shows potential win/return | NOT STARTED |
| `components/betting/PlaceBetButton.tsx` | Primary CTA with states | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `components/betting/GameCard.tsx` | Add onQuickBet handler | NOT STARTED |
| `app/(drawer)/(tabs)/games.tsx` | Integrate BetSheet | NOT STARTED |
| `hooks/useBetting.ts` | Connect UI to betting logic | NOT STARTED |

### Implementation Approach

1. **Bottom Sheet Architecture**:
   - Use @gorhom/bottom-sheet (same as Epic 4)
   - Three snap points for different viewing modes
   - Backdrop with opacity animation
   - Gesture handling for swipe/tap

2. **UI Flow**:
   - Quick Bet → Opens sheet at 50%
   - Spread selected by default (most common)
   - Quick amounts visible immediately
   - Share Pick toggle on by default
   - Place Bet → Success → Camera or Close

3. **Visual Design**:
   - Consistent with engagement sheets
   - Team colors from existing data
   - Clear selected states
   - Smooth spring animations
   - Haptic feedback on actions

**Key Technical Decisions**:
- Reuse bottom sheet patterns from Epic 4
- Pre-select spread bet for speed
- Keyboard avoidance with KeyboardAvoidingView
- Optimistic UI updates before server confirmation

### Dependencies & Risks
**Dependencies**:
- BetSlipStore from Sprint 05.02
- BettingService from Sprint 05.02
- Team colors from data/teams.ts
- Navigation to camera tab

**Identified Risks**:
- Keyboard handling on different devices
- Animation performance with keyboard
- State sync between sheet and store
- Navigation timing after bet placement

## Implementation Details

### BetSheet Component Structure
```tsx
<BottomSheet
  ref={bottomSheetRef}
  snapPoints={['25%', '50%', '90%']}
  initialSnapIndex={1}
  backdropComponent={CustomBackdrop}
>
  <View style={styles.container}>
    {/* Game Header */}
    <GameHeader game={selectedGame} />
    
    {/* Bet Type Tabs */}
    <BetTypeSelector 
      selected={betType}
      onChange={setBetType}
    />
    
    {/* Team/Side Selection */}
    <TeamSelector
      game={selectedGame}
      betType={betType}
      selected={selection}
      onChange={setSelection}
    />
    
    {/* Stake Input Section */}
    <StakeInput
      value={stake}
      onChange={setStake}
      quickAmounts={[25, 50, 100]}
      maxAmount={availableBankroll}
    />
    
    {/* Payout Display */}
    <PayoutDisplay
      stake={stake}
      odds={currentOdds}
      potentialWin={potentialWin}
    />
    
    {/* Share Toggle */}
    <XStack ai="center" jc="space-between">
      <Text>Share Pick to Feed</Text>
      <Switch value={shareToFeed} onValueChange={toggleShare} />
    </XStack>
    
    {/* Place Bet Button */}
    <PlaceBetButton
      onPress={handlePlaceBet}
      isLoading={isPlacing}
      isDisabled={!isValid}
      errorMessage={validationError}
    />
  </View>
</BottomSheet>
```

### Bet Type Selector Design
```tsx
// Visual tab design
┌─────────────────────────────────────┐
│   Spread    │    Total    │   ML    │
│  ━━━━━━━    │             │         │
└─────────────────────────────────────┘

// Implementation
<XStack bg="$background" p="$2" br="$4">
  {['spread', 'total', 'moneyline'].map(type => (
    <Pressable
      key={type}
      onPress={() => onChange(type)}
      style={[
        styles.tab,
        selected === type && styles.selectedTab
      ]}
    >
      <Text color={selected === type ? '$primary' : '$gray11'}>
        {type === 'moneyline' ? 'ML' : capitalize(type)}
      </Text>
    </Pressable>
  ))}
</XStack>
```

### Team Selector Variations
```tsx
// Spread & Moneyline: Team buttons
<XStack gap="$4">
  <TeamButton
    team={game.away_team}
    line={betType === 'spread' ? `+${spread}` : null}
    odds={awayOdds}
    isSelected={selection === 'away'}
    onPress={() => setSelection('away')}
  />
  <TeamButton
    team={game.home_team}
    line={betType === 'spread' ? `${spread}` : null}
    odds={homeOdds}
    isSelected={selection === 'home'}
    onPress={() => setSelection('home')}
  />
</XStack>

// Total: Over/Under buttons
<XStack gap="$4">
  <TotalButton
    type="over"
    line={totalLine}
    odds={overOdds}
    isSelected={selection === 'over'}
    onPress={() => setSelection('over')}
  />
  <TotalButton
    type="under"
    line={totalLine}
    odds={underOdds}
    isSelected={selection === 'under'}
    onPress={() => setSelection('under')}
  />
</XStack>
```

### Stake Input Component
```tsx
// Quick amounts + custom input
<YStack gap="$3">
  <XStack gap="$2">
    {quickAmounts.map(amount => (
      <QuickAmountButton
        key={amount}
        amount={amount}
        onPress={() => onChange(amount * 100)} // Convert to cents
        isSelected={stake === amount * 100}
      />
    ))}
    <QuickAmountButton
      amount="MAX"
      onPress={() => onChange(maxAmount)}
      isMax
    />
  </XStack>
  
  <XStack ai="center" gap="$2">
    <Text fontSize="$6">$</Text>
    <Input
      value={formatCentsToDisplay(stake)}
      onChangeText={handleCustomAmount}
      keyboardType="numeric"
      placeholder="0.00"
      fontSize="$6"
      flex={1}
    />
  </XStack>
</YStack>
```

### Animation & Haptics
```typescript
// Haptic feedback points
- Bet type selection: light impact
- Team/side selection: medium impact
- Quick amount tap: light impact
- Place bet: heavy impact
- Success: notification success

// Spring animations
const animatedHeight = useSpring({
  to: { height: isExpanded ? 400 : 200 },
  config: { tension: 300, friction: 30 }
})
```

### Success Flow
```typescript
async function handlePlaceBet() {
  setIsPlacing(true)
  
  try {
    // Place bet via service
    const bet = await bettingService.placeBet({
      gameId: game.id,
      betType,
      selection,
      stake,
      odds: currentOdds
    })
    
    // Success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    
    // Handle share flow
    if (shareToFeed) {
      // Store bet ID for camera
      Storage.betting.set('pendingShareBetId', bet.id)
      
      // Navigate to camera
      router.push('/camera')
    } else {
      // Just close sheet
      bottomSheetRef.current?.close()
    }
    
    // Reset store
    betSlipStore.reset()
    
  } catch (error) {
    // Error handling
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    showToast({ message: error.message, type: 'error' })
  } finally {
    setIsPlacing(false)
  }
}
```

## Testing Checklist

### Manual Testing
- [ ] Sheet opens at correct snap point
- [ ] All three bet types selectable
- [ ] Team/side selection works
- [ ] Quick amounts update stake
- [ ] Custom amount input works
- [ ] Keyboard doesn't break layout
- [ ] Payout calculates correctly
- [ ] Validation messages show
- [ ] Loading states display
- [ ] Success navigates to camera
- [ ] Sheet closes properly
- [ ] Haptics feel right

### Edge Cases to Test
- [ ] MAX bet with exact bankroll
- [ ] Below minimum bet ($5)
- [ ] Invalid custom amounts
- [ ] Rapid tap prevention
- [ ] Sheet dismissal during loading
- [ ] Navigation with sheet open

### Performance Testing
- [ ] Sheet animation smooth
- [ ] No lag on stake updates
- [ ] Keyboard appearance smooth
- [ ] Team color loading fast

## Documentation Updates

- [ ] Document bet sheet states
- [ ] Add UI flow diagrams
- [ ] Document haptic patterns
- [ ] Update navigation docs

## Handoff Checklist

### Pre-Handoff Requirements
- [ ] All components created
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] Animations smooth
- [ ] Manual testing complete
- [ ] Success flow works

### What Was Implemented
[To be completed during implementation]

### Files Modified/Created
[To be completed during implementation]

### Key Decisions Made
[To be completed during implementation]

### Known Issues/Concerns
[To be completed during implementation]

**Sprint Status**: NOT STARTED

---

## Reviewer Section

**Reviewer**: [R persona]  
**Review Date**: [Date]

### Review Checklist
- [ ] UI matches design patterns
- [ ] Animations are smooth
- [ ] State management clean
- [ ] Navigation flow correct
- [ ] Error handling complete
- [ ] Accessibility considered

### Review Outcome

**Status**: [PENDING]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [Status]* 