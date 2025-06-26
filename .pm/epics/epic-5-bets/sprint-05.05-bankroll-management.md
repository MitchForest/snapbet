# Sprint 05.05: Bankroll Management Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 5 - Complete Betting System with Tail/Fade

**Sprint Goal**: Implement the weekly bankroll system with automatic resets, referral bonuses, and real-time balance tracking across the app.

**User Story Contribution**: 
- Enables Story 2 (Permanent Record Problem) with weekly fresh starts
- Supports Story 5 (Missing My People Problem) through referral rewards

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
1. Create bankroll badge component for header display
2. Implement available balance calculation (total - pending bets)
3. Build transaction logging system for all bankroll changes
4. Create weekly reset system (Monday midnight local time)
5. Integrate referral bonus calculation ($100 per active referral)
6. Handle concurrent bet placement safely

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `components/betting/BankrollBadge.tsx` | Header bankroll display | NOT STARTED |
| `services/betting/bankrollService.ts` | Bankroll operations | NOT STARTED |
| `hooks/useBankroll.ts` | React Query hook for bankroll | NOT STARTED |
| `utils/bankroll/calculations.ts` | Balance calculation helpers | NOT STARTED |
| `scripts/weekly-reset.ts` | Weekly reset script | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `app/(drawer)/(tabs)/games.tsx` | Add bankroll badge to header | NOT STARTED |
| `services/betting/bettingService.ts` | Integrate bankroll checks | NOT STARTED |
| `types/database.ts` | Ensure bankroll types complete | NOT STARTED |

### Implementation Approach

1. **Bankroll Display**:
   - Show current balance in header
   - Color coding for profit/loss
   - Tap for detailed view
   - Real-time updates

2. **Balance Calculation**:
   - Total bankroll from DB
   - Subtract pending bet amounts
   - Add referral bonuses
   - Cache for performance

3. **Weekly Reset Logic**:
   - Every Monday at midnight local
   - Base $1,000 for everyone
   - +$100 per active referral
   - Archive previous week stats

**Key Technical Decisions**:
- All money in cents to avoid floating point
- Atomic transactions for concurrent bets
- Optimistic UI with rollback on error
- Local time for user-friendly resets

### Dependencies & Risks
**Dependencies**:
- Existing bankrolls table structure
- Referral tracking from Epic 2
- Auth system for user context
- Betting service integration

**Identified Risks**:
- Concurrent bet race conditions
- Timezone handling complexity
- Reset timing edge cases
- Referral calculation accuracy

## Implementation Details

### BankrollBadge Component
```tsx
interface BankrollBadgeProps {
  onPress?: () => void;
}

export function BankrollBadge({ onPress }: BankrollBadgeProps) {
  const { data: bankroll, isLoading } = useBankroll();
  const { data: pendingBets } = usePendingBets();
  
  // Calculate available balance
  const pendingTotal = pendingBets?.reduce((sum, bet) => sum + bet.stake, 0) || 0;
  const available = (bankroll?.balance || 0) - pendingTotal;
  
  // Determine color based on weekly P&L
  const weeklyPL = bankroll?.balance - bankroll?.weekly_deposit;
  const color = weeklyPL > 0 ? '$green9' : weeklyPL < 0 ? '$red9' : '$gray11';
  
  if (isLoading) {
    return <Skeleton width={80} height={32} />;
  }
  
  return (
    <Pressable onPress={onPress}>
      <XStack 
        bg="$gray3" 
        px="$3" 
        py="$2" 
        br="$4"
        ai="center"
        gap="$1"
      >
        <Text fontSize="$1" color="$gray11">$</Text>
        <Text fontSize="$3" fontWeight="bold" color={color}>
          {formatCents(available)}
        </Text>
      </XStack>
    </Pressable>
  );
}

// Visual states
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ $ 1,420 ✅  │  │ $ 680 📉    │  │ $ 1,000     │
└─────────────┘  └─────────────┘  └─────────────┘
   Profit           Loss            Even
```

### Bankroll Service Implementation
```typescript
class BankrollService {
  private static instance: BankrollService;
  
  // Get current bankroll with metadata
  async getBankroll(userId: string): Promise<Bankroll> {
    const { data, error } = await supabase
      .from('bankrolls')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) throw error;
    return data;
  }
  
  // Update bankroll with transaction logging
  async updateBalance(
    userId: string,
    amount: number,
    type: 'bet_placed' | 'bet_won' | 'bet_lost' | 'bet_push' | 'weekly_reset',
    betId?: string
  ): Promise<void> {
    // Use Supabase transaction for atomicity
    const { error } = await supabase.rpc('update_bankroll', {
      p_user_id: userId,
      p_amount: amount,
      p_type: type,
      p_bet_id: betId
    });
    
    if (error) throw error;
    
    // Emit event for real-time updates
    DeviceEventEmitter.emit('bankrollUpdate', { userId });
  }
  
  // Calculate available balance
  async getAvailableBalance(userId: string): Promise<number> {
    const bankroll = await this.getBankroll(userId);
    const pendingBets = await bettingService.getActiveBets(userId);
    
    const pendingTotal = pendingBets.reduce((sum, bet) => sum + bet.stake, 0);
    return bankroll.balance - pendingTotal;
  }
  
  // Weekly reset logic
  async performWeeklyReset(userId: string): Promise<void> {
    // Get active referral count
    const referralCount = await this.getActiveReferralCount(userId);
    const weeklyDeposit = 100000 + (referralCount * 10000); // $1000 + $100 per referral
    
    // Archive current week stats
    await this.archiveWeekStats(userId);
    
    // Reset bankroll
    await supabase
      .from('bankrolls')
      .update({
        balance: weeklyDeposit,
        weekly_deposit: weeklyDeposit,
        last_reset: new Date().toISOString(),
        metadata: {
          ...metadata,
          reset_count: (metadata.reset_count || 0) + 1,
          referral_bonus: referralCount * 10000
        }
      })
      .eq('user_id', userId);
      
    // Log transaction
    await this.updateBalance(userId, weeklyDeposit, 'weekly_reset');
  }
  
  // Get active referral count
  private async getActiveReferralCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by', userId)
      .not('last_active', 'is', null)
      .gte('last_active', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
    return count || 0;
  }
}
```

### Weekly Reset Script
```typescript
// scripts/weekly-reset.ts
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

async function performWeeklyResets() {
  console.log('Starting weekly bankroll reset...');
  
  // Get all users
  const { data: users, error } = await supabase
    .from('users')
    .select('id, username');
    
  if (error) {
    console.error('Failed to fetch users:', error);
    return;
  }
  
  // Reset each user's bankroll
  for (const user of users) {
    try {
      await bankrollService.performWeeklyReset(user.id);
      console.log(`✅ Reset bankroll for ${user.username}`);
    } catch (error) {
      console.error(`❌ Failed to reset ${user.username}:`, error);
    }
  }
  
  // Update badges after reset
  console.log('Updating weekly badges...');
  await updateWeeklyBadges();
  
  console.log('Weekly reset complete!');
}

// Schedule for Monday midnight
// Future: Move to Supabase Edge Function with cron
if (require.main === module) {
  performWeeklyResets();
}
```

### Bankroll Hook with Real-time Updates
```typescript
export function useBankroll() {
  const { user } = useAuth();
  
  const query = useQuery({
    queryKey: ['bankroll', user?.id],
    queryFn: () => bankrollService.getBankroll(user!.id),
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  });
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;
    
    const subscription = DeviceEventEmitter.addListener(
      'bankrollUpdate',
      ({ userId }) => {
        if (userId === user.id) {
          query.refetch();
        }
      }
    );
    
    return () => subscription.remove();
  }, [user, query]);
  
  return query;
}

// Available balance hook
export function useAvailableBalance() {
  const { data: bankroll } = useBankroll();
  const { data: pendingBets } = usePendingBets();
  
  const available = useMemo(() => {
    if (!bankroll) return 0;
    const pending = pendingBets?.reduce((sum, bet) => sum + bet.stake, 0) || 0;
    return bankroll.balance - pending;
  }, [bankroll, pendingBets]);
  
  return available;
}
```

### Concurrent Bet Handling
```typescript
// Supabase RPC function for atomic bet placement
CREATE OR REPLACE FUNCTION place_bet_with_bankroll_check(
  p_user_id UUID,
  p_stake INTEGER,
  p_bet_data JSONB
) RETURNS JSONB AS $$
DECLARE
  v_bankroll RECORD;
  v_pending_total INTEGER;
  v_available INTEGER;
  v_bet_id UUID;
BEGIN
  -- Lock user's bankroll row
  SELECT * INTO v_bankroll
  FROM bankrolls
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Calculate pending bets total
  SELECT COALESCE(SUM(stake), 0) INTO v_pending_total
  FROM bets
  WHERE user_id = p_user_id
  AND status = 'pending';
  
  -- Check available balance
  v_available := v_bankroll.balance - v_pending_total;
  
  IF v_available < p_stake THEN
    RAISE EXCEPTION 'Insufficient funds. Available: %, Required: %', 
      v_available, p_stake;
  END IF;
  
  -- Create bet
  INSERT INTO bets (user_id, stake, ...)
  VALUES (p_user_id, p_stake, ...)
  RETURNING id INTO v_bet_id;
  
  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'bet_id', v_bet_id,
    'remaining_balance', v_available - p_stake
  );
END;
$$ LANGUAGE plpgsql;
```

### Bankroll Stats Display
```typescript
interface BankrollStats {
  currentBalance: number;
  weeklyDeposit: number;
  weeklyPL: number;
  weeklyPLPercent: number;
  pendingBets: number;
  available: number;
  lastReset: Date;
  nextReset: Date;
  referralBonus: number;
}

export function BankrollStatsModal({ isOpen, onClose }) {
  const stats = useBankrollStats();
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <YStack p="$4" gap="$4">
        <Text fontSize="$6" fontWeight="bold">Bankroll Details</Text>
        
        <YStack gap="$2">
          <StatRow label="Current Balance" value={`$${stats.currentBalance / 100}`} />
          <StatRow label="Pending Bets" value={`-$${stats.pendingBets / 100}`} />
          <Separator />
          <StatRow 
            label="Available to Bet" 
            value={`$${stats.available / 100}`}
            bold
          />
        </YStack>
        
        <YStack gap="$2">
          <Text fontSize="$4" fontWeight="bold">This Week</Text>
          <StatRow label="Started With" value={`$${stats.weeklyDeposit / 100}`} />
          <StatRow 
            label="Profit/Loss" 
            value={`${stats.weeklyPL >= 0 ? '+' : ''}$${stats.weeklyPL / 100}`}
            color={stats.weeklyPL > 0 ? '$green9' : stats.weeklyPL < 0 ? '$red9' : '$gray11'}
          />
          <StatRow 
            label="ROI" 
            value={`${stats.weeklyPLPercent.toFixed(1)}%`}
          />
        </YStack>
        
        <YStack gap="$2">
          <Text fontSize="$3" color="$gray11">
            Resets {format(stats.nextReset, 'EEEE')} at midnight
          </Text>
          {stats.referralBonus > 0 && (
            <Text fontSize="$3" color="$green11">
              +${stats.referralBonus / 100} weekly from referrals
            </Text>
          )}
        </YStack>
      </YStack>
    </Modal>
  );
}
```

## Testing Checklist

### Manual Testing
- [ ] Bankroll badge displays correctly
- [ ] Balance updates on bet placement
- [ ] Balance updates on settlement
- [ ] Available balance calculates correctly
- [ ] Pending bets subtract properly
- [ ] Weekly reset works at midnight
- [ ] Referral bonus applies correctly
- [ ] Concurrent bets handled safely
- [ ] Stats modal shows accurate data
- [ ] Real-time updates work

### Edge Cases to Test
- [ ] Bet exactly equal to balance
- [ ] Multiple rapid bets
- [ ] Reset during active betting
- [ ] Negative balance prevention
- [ ] Referral count changes
- [ ] Timezone boundaries

### Reset Testing
- [ ] Manual reset script works
- [ ] Previous week archived
- [ ] Badges recalculated
- [ ] Notifications sent
- [ ] Balance set correctly

## Documentation Updates

- [ ] Document bankroll system rules
- [ ] Add reset schedule info
- [ ] Document referral bonuses
- [ ] Update API documentation

## Handoff Checklist

### Pre-Handoff Requirements
- [ ] All files created/modified
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] Manual testing complete
- [ ] Concurrent bet handling verified
- [ ] Reset logic tested

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
- [ ] Balance calculations accurate
- [ ] Atomic operations work
- [ ] UI updates in real-time
- [ ] Reset logic sound
- [ ] Error handling complete
- [ ] Performance acceptable

### Review Outcome

**Status**: [PENDING]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [Status]* 