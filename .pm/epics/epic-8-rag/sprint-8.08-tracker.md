# Sprint 8.08: Consensus Alerts Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: [TBD]  
**End Date**: [TBD]  
**Epic**: 8 - RAG Implementation

**Sprint Goal**: Implement consensus betting alerts that notify users when multiple people they follow make similar bets, helping identify popular betting trends.

**User Story Contribution**: 
- Story 4: Consensus Alerts - Users get notified when multiple friends make similar bets

## 🚨 Required Development Practices

### Database Management
- **Use Supabase MCP** to inspect current database state: `mcp_supabase_get_schemas`, `mcp_supabase_get_tables`, etc.
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

### 🚨 Architecture Constraint (from Sprint 8.04)
- **OpenAI SDK cannot run in React Native** - All AI/embedding operations must be server-side
- **RPC calls must be through production jobs** - Consensus checking happens server-side
- **Notifications created by server jobs** - Not directly from the app

## Sprint Plan

### Objectives
1. Create consensus detection service
2. Implement notification creation for consensus events
3. Hook into bet placement flow
4. Add consensus notification type to system
5. Add AI visual indicators to consensus notifications
6. Test with various consensus scenarios
7. Ensure mock data includes consensus scenarios for demo
8. Historical phase should include consensus betting scenarios for testing

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `scripts/jobs/consensus-detection.ts` | Production job for detecting betting consensus | NOT STARTED |
| `hooks/useBetWithConsensus.ts` | Client hook that triggers server-side consensus check | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `services/betting/bettingService.ts` | Add consensus check after bet placement | NOT STARTED |
| `services/notifications/notificationService.ts` | Handle consensus notification type in display | NOT STARTED |
| `types/database.ts` | Add 'consensus_alert' to notification_type enum (if not done in 8.01) | NOT STARTED |
| `components/notifications/NotificationItem.tsx` | Add rendering for consensus notifications with tail/fade buttons | NOT STARTED |
| `services/rag/consensusService.ts` | Hook into bet creation flow | NOT STARTED |

### Implementation Approach

**Step 1: Create production job for consensus detection**
```typescript
// scripts/jobs/consensus-detection.ts
#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '../supabase-client';
import type { Database } from '@/types/database';

export class ConsensusService {
  private static instance: ConsensusService;
  
  static getInstance(): ConsensusService {
    if (!ConsensusService.instance) {
      ConsensusService.instance = new ConsensusService();
    }
    return ConsensusService.instance;
  }

  async checkAndNotifyConsensus(bet: any, userId: string) {
    try {
      // Check for consensus using RPC
      const { data: consensus } = await supabase
        .rpc('check_bet_consensus', {
          check_game_id: bet.game_id,
          check_bet_details: bet.bet_details,
          check_user_id: userId,
          time_window: '1 hour'
        });

      if (!consensus || consensus.length === 0) return;

      const result = consensus[0];
      if (result.consensus_count < 3) return; // Need at least 3 for consensus

      // Create notification for the user who just bet
      await this.createConsensusNotification(userId, result, bet);

      // Check if followers might be interested
      const { data: followers } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId);

      if (followers) {
        // Check consensus for each follower
        for (const { follower_id } of followers) {
          await this.checkFollowerConsensus(follower_id, bet);
        }
      }
    } catch (error) {
      console.error('Error checking consensus:', error);
    }
  }

  private async checkFollowerConsensus(followerId: string, bet: any) {
    const { data: consensus } = await supabase
      .rpc('check_bet_consensus', {
        check_game_id: bet.game_id,
        check_bet_details: bet.bet_details,
        check_user_id: followerId,
        time_window: '2 hours' // Wider window for followers
      });

    if (consensus?.[0]?.consensus_count >= 3) {
      await this.createConsensusNotification(followerId, consensus[0], bet);
    }
  }

  private async createConsensusNotification(
    userId: string,
    consensus: any,
    bet: any
  ) {
    // Format user list
    const userList = consensus.usernames.slice(0, 3).join(', ');
    const others = consensus.consensus_count > 3 
      ? ` and ${consensus.consensus_count - 3} others` 
      : '';
    
    const team = bet.bet_details?.team || '';
    const betType = bet.bet_type;
    const message = `🔥 ${userList}${others} all took ${team} ${betType}`;
    
    // Direct database insert (no notification service method exists)
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'consensus',
        data: {
          title: '🤖 Consensus Alert',
          body: message,
          bet_id: bet.id,
          game_id: bet.game_id,
          team: team,
          bet_type: betType,
          avg_odds: consensus.avg_odds,
          total_stake: consensus.total_stake,
          user_ids: consensus.user_ids,
          usernames: consensus.usernames,
          consensus_count: consensus.consensus_count
        },
        read: false,
        created_at: new Date().toISOString()
      });
  }
}

export const consensusService = ConsensusService.getInstance();
```

**Step 2: Update betting service**
```typescript
// services/betting/bettingService.ts
// In placeBet method, after successful bet placement
async placeBet(betData: PlaceBetData): Promise<Bet> {
  // ... existing bet placement logic ...
  
  const { data: bet, error } = await supabase
    .from('bets')
    .insert(betData)
    .select()
    .single();

  if (error) throw error;

  // Mark bet for consensus checking (will be processed by job)
  await supabase
    .from('bets')
    .update({ needs_consensus_check: true })
    .eq('id', bet.id);

  return bet;
}

// Note: Consensus detection happens via production job, not directly
```

**Step 3: Update notification types**
```typescript
// types/database.ts
// Update notification type enum
export type NotificationType = 
  | 'tail'
  | 'fade'
  | 'bet_won'
  | 'bet_lost'
  | 'tail_won'
  | 'tail_lost'
  | 'fade_won'
  | 'fade_lost'
  | 'follow'
  | 'follow_request'
  | 'message'
  | 'mention'
  | 'milestone'
  | 'consensus' // ADD THIS
  | 'system';
```

**Step 4: Update notification service**
```typescript
// services/notifications/notificationService.ts
// In getNotificationText method, add case for consensus
case 'consensus':
  return {
    title: data.title || 'Consensus Alert 🔥',
    body: data.body || `Multiple people you follow made the same bet!`,
  };
```

**Step 5: Update notification UI**
```typescript
// components/notifications/NotificationItem.tsx
// Add special rendering for consensus notifications
if (notification.type === 'consensus') {
  return (
    <YStack padding="$3" onPress={handlePress}>
      <XStack gap="$2" alignItems="center">
        <View 
          width={40} 
          height={40} 
          borderRadius={20}
          backgroundColor={Colors.primary + '20'}
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize="$6">🔥</Text>
        </View>
        
        <YStack flex={1}>
          <XStack alignItems="center" gap="$2">
            <Text fontSize="$4" fontWeight="600">
              {notification.data.title}
            </Text>
            <AIBadge variant="small" text="" />
          </XStack>
          <Text fontSize="$3" color="$textSecondary">
            {notification.data.title}
          </Text>
          <Text fontSize="$3" color="$textSecondary" numberOfLines={2}>
            {notification.data.body}
          </Text>
          {notification.data.avg_odds && (
            <Text fontSize="$2" color="$textSecondary" marginTop="$1">
              Avg odds: {notification.data.avg_odds} • Total: ${notification.data.total_stake}
            </Text>
          )}
        </YStack>
      </XStack>
      
      {/* Show user avatars if available */}
      {notification.data.user_ids && (
        <XStack gap="$1" marginTop="$2" marginLeft={48}>
          {notification.data.user_ids.slice(0, 5).map((userId: string, index: number) => (
            <Avatar
              key={userId}
              size="$2"
              username={notification.data.usernames?.[index]}
              marginLeft={index > 0 ? -8 : 0}
              zIndex={5 - index}
            />
          ))}
          {notification.data.consensus_count > 5 && (
            <View
              width={24}
              height={24}
              borderRadius={12}
              backgroundColor="$backgroundHover"
              justifyContent="center"
              alignItems="center"
              marginLeft={-8}
            >
              <Text fontSize="$1">+{notification.data.consensus_count - 5}</Text>
            </View>
          )}
        </XStack>
      )}
    </YStack>
  );
}
```

**Key Technical Decisions**:
- Minimum 3 users for consensus (configurable)
- 1 hour window for initial consensus
- 2 hour window for follower notifications
- Direct database insert for notifications
- Show up to 5 user avatars in notification

### Dependencies & Risks
**Dependencies**:
- check_bet_consensus RPC function from Sprint 8.01 (server-side only)
- Notification system infrastructure
- Betting service hooks
- Production job infrastructure from Sprint 8.04
- Database flag for consensus processing

**Identified Risks**:
- Notification spam → Limit to one per bet/game combo
- Performance with many followers → Async processing
- Stale notifications → Time window limits

## Implementation Log

### Day-by-Day Progress
**[Date]**:
- Started: [What was begun]
- Completed: [What was finished]
- Blockers: [Any issues]
- Decisions: [Any changes to plan]

### Reality Checks & Plan Updates

**Reality Check 1** - [Date]
- Issue: [What wasn't working]
- Options Considered:
  1. [Option 1] - Pros/Cons
  2. [Option 2] - Pros/Cons
- Decision: [What was chosen]
- Plan Update: [How sprint plan changed]
- Epic Impact: [Any epic updates needed]

### Code Quality Checks

**Linting Results**:
- [ ] Initial run: [X errors, Y warnings]
- [ ] Final run: [Should be 0 errors]

**Type Checking Results**:
- [ ] Initial run: [X errors]
- [ ] Final run: [Should be 0 errors]

**Build Results**:
- [ ] Development build passes
- [ ] Production build passes

## Key Code Additions

### Service Methods
```typescript
// ConsensusService
checkAndNotifyConsensus(bet: any, userId: string): Promise<void>
checkFollowerConsensus(followerId: string, bet: any): Promise<void>
createConsensusNotification(userId: string, consensus: any, bet: any): Promise<void>
```

### Notification Data Structure
```typescript
{
  type: 'consensus',
  data: {
    title: 'Consensus Alert',
    body: string,
    bet_id: string,
    game_id: string,
    team: string,
    bet_type: string,
    avg_odds: number,
    total_stake: number,
    user_ids: string[],
    usernames: string[],
    consensus_count: number
  }
}
```

### RPC Response Structure
```typescript
{
  consensus_count: number,
  user_ids: string[],
  usernames: string[],
  avg_odds: number,
  total_stake: number
}
```

## Testing Performed

### Manual Testing
- [ ] Consensus detected when 3+ users make same bet
- [ ] Notification created for betting user
- [ ] Followers get notified if they follow 3+ consensus users
- [ ] Notification displays correctly
- [ ] User avatars show in notification
- [ ] Tap notification goes to game/bet
- [ ] No duplicate notifications
- [ ] Time window works correctly

### Edge Cases Considered
- User bets on already-consensus game
- User follows someone after consensus
- Same user bets multiple times
- Consensus with exactly 3 users
- Consensus with 10+ users
- User blocks consensus participant

## Documentation Updates

- [ ] Consensus logic documented
- [ ] Notification format documented
- [ ] Time window strategy explained
- [ ] Integration points documented

## Handoff to Reviewer

### What Was Implemented
Complete consensus betting alerts:
- Consensus detection service
- Automatic notifications on consensus
- Follower cascade notifications
- Rich notification UI with avatars
- Integration with bet placement flow

### Files Modified/Created
**Created**:
- `services/rag/consensusService.ts` - Core consensus logic

**Modified**:
- `services/betting/bettingService.ts` - Added consensus check
- `types/database.ts` - Added consensus notification type
- `services/notifications/notificationService.ts` - Handle consensus type
- `components/notifications/NotificationItem.tsx` - Consensus UI

### Key Decisions Made
1. **3 user minimum**: Enough for trend without spam
2. **1 hour window**: Recent bets only
3. **Direct insert**: No notification service method exists
4. **Avatar display**: Visual representation of consensus

### Deviations from Original Plan
- None anticipated

### Known Issues/Concerns
- Notification frequency might need tuning
- Performance with many simultaneous bets
- Need to prevent duplicate notifications

### Suggested Review Focus
- Consensus threshold appropriateness
- Notification UI/UX
- Performance implications
- Edge case handling

**Sprint Status**: READY FOR REVIEW

---

## Reviewer Section

**Reviewer**: [R persona]  
**Review Date**: [Date]

### Review Checklist
- [ ] Code matches sprint objectives
- [ ] All planned files created/modified
- [ ] Follows established patterns
- [ ] No unauthorized scope additions
- [ ] Code is clean and maintainable
- [ ] No obvious bugs or issues
- [ ] Integrates properly with existing code

### Review Outcome

**Status**: APPROVED | NEEDS REVISION

### Feedback
[If NEEDS REVISION, specific feedback here]

**Required Changes**:
1. **File**: `[filename]`
   - Issue: [What's wrong]
   - Required Change: [What to do]
   - Reasoning: [Why it matters]

### Post-Review Updates
[Track changes made in response to review]

**Update 1** - [Date]
- Changed: [What was modified]
- Result: [New status]

---

## Sprint Metrics

**Duration**: Planned 2 hours | Actual [Y] hours  
**Scope Changes**: [Number of plan updates]  
**Review Cycles**: [Number of review rounds]  
**Files Touched**: 5  
**Lines Added**: ~300  
**Lines Removed**: ~0

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [APPROVED/IN PROGRESS/BLOCKED]* 