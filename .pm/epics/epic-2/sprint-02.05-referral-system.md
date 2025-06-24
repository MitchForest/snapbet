# Sprint 02.05: Referral System & Badge Automation Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: -  
**End Date**: -  
**Epic**: 02 - Authentication & User System

**Sprint Goal**: Implement a basic referral tracking system (without rewards for MVP) and automate the badge calculation system to ensure badges stay current.

**User Story Contribution**: 
- Enables tracking of viral growth through friend invitations
- Ensures achievement badges reflect real-time performance
- Sets foundation for future referral rewards

## Sprint Plan

### Objectives
1. Create referral code generation and tracking (no rewards yet)
2. Build simple invite screen with sharing options
3. Track referral relationships for future use
4. Automate badge calculation with simple cron job
5. Create badge history tracking
6. Add basic referral analytics view

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `services/referral/referralService.ts` | Referral code generation and tracking | NOT STARTED |
| `services/badges/badgeAutomation.ts` | Automated badge calculation | NOT STARTED |
| `components/invite/InviteCard.tsx` | Shareable invite card | NOT STARTED |
| `components/invite/ReferralStats.tsx` | Basic referral count display | NOT STARTED |
| `hooks/useReferral.ts` | Referral state management | NOT STARTED |
| `scripts/update-badges.ts` | Script to update all user badges | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `app/(drawer)/invite.tsx` | Complete implementation with sharing | NOT STARTED |
| `app/(auth)/welcome.tsx` | Add optional referral code input | NOT STARTED |
| `stores/authStore.ts` | Track referral source | NOT STARTED |
| `supabase/migrations/005_referrals.sql` | Add referral tracking tables | NOT STARTED |

### Implementation Approach

#### 1. Simplified Referral System
```typescript
interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  code: string;
  created_at: Date;
  // No status or rewards for MVP
}

interface ReferralCode {
  user_id: string;
  code: string; // 6-character alphanumeric
  uses_count: number;
  created_at: Date;
}

// Simple code generation
function generateReferralCode(username: string): string {
  // Format: First 3 letters of username + 3 random chars
  // Example: MIK2X9, SAR8K1
  const prefix = username.substring(0, 3).toUpperCase();
  const suffix = generateRandomAlphanumeric(3);
  return `${prefix}${suffix}`;
}
```

#### 2. Basic Invite Flow
```typescript
// Share options
interface ShareOptions {
  message: string;
  url: string;
}

const getShareContent = (code: string): ShareOptions => ({
  message: `Join me on SnapBet! Use my invite code ${code} when you sign up. Let's bet together! 🎯`,
  url: `https://snapbet.app/invite/${code}` // For future web landing page
});

// Sharing methods (MVP)
- Copy code to clipboard
- Share via native share sheet
```

#### 3. Referral Tracking Only (No Rewards)
```typescript
// Just track who referred whom for future use
async function trackReferral(referrerCode: string, newUserId: string) {
  // 1. Find referrer by code
  // 2. Create referral record
  // 3. Increment referrer's uses_count
  // No rewards or notifications for MVP
}

// Simple stats display
interface ReferralStats {
  totalReferrals: number;
  thisWeek: number;
  thisMonth: number;
}
```

#### 4. Simplified Badge Automation
```typescript
// Run as a simple script via cron (every hour)
// scripts/update-badges.ts
export async function updateAllUserBadges() {
  console.log('Starting badge update...');
  
  // 1. Get all active users (with recent activity)
  const users = await getActiveUsers(7); // Active in last 7 days
  
  // 2. Update badges for each user
  for (const user of users) {
    try {
      const currentBadges = await getUserBadges(user.id);
      const newBadges = await calculateUserBadges(user.id);
      
      // 3. Track changes in badge_history
      const added = newBadges.filter(b => !currentBadges.includes(b));
      const removed = currentBadges.filter(b => !newBadges.includes(b));
      
      if (added.length > 0 || removed.length > 0) {
        await updateBadgeHistory(user.id, added, removed);
      }
    } catch (error) {
      console.error(`Failed to update badges for ${user.id}:`, error);
    }
  }
  
  console.log('Badge update complete');
}

// Run with: bun run scripts/update-badges.ts
// Schedule with system cron: 0 * * * * cd /path/to/snapbet && bun run scripts/update-badges.ts
```

#### 5. Badge History Tracking
```typescript
// Track badge changes for user achievements
interface BadgeHistory {
  user_id: string;
  badge_id: string;
  action: 'earned' | 'lost';
  timestamp: Date;
  // Simplified - no stats snapshot for MVP
}
```

#### 6. Welcome Screen Referral Input
```typescript
// Add optional referral code input on welcome screen
<TouchableOpacity onPress={() => setShowReferralInput(true)}>
  <Text style={styles.referralLink}>Have an invite code?</Text>
</TouchableOpacity>

{showReferralInput && (
  <TextInput
    placeholder="Enter invite code"
    value={referralCode}
    onChangeText={setReferralCode}
    autoCapitalize="characters"
    maxLength={6}
  />
)}
```

#### 7. Simplified Database Schema
```sql
-- Referral codes table
CREATE TABLE referral_codes (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  uses_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals tracking table (simplified - no rewards)
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referred_id UUID NOT NULL REFERENCES users(id),
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_id) -- Each user can only be referred once
);

-- Badge history table (simplified)
CREATE TABLE badge_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('earned', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_badge_history_user ON badge_history(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own referral code
CREATE POLICY referral_codes_select ON referral_codes
  FOR SELECT USING (user_id = auth.uid());

-- Users can see referrals they made
CREATE POLICY referrals_select ON referrals
  FOR SELECT USING (referrer_id = auth.uid());

-- Users can see their own badge history
CREATE POLICY badge_history_select ON badge_history
  FOR SELECT USING (user_id = auth.uid());
```

### Key Technical Decisions
- **No Rewards Yet**: Track referrals only, add rewards post-MVP
- **Simple Badge Automation**: Cron script instead of edge functions
- **Basic Tracking**: Just count referrals, no complex analytics
- **Manual Scheduling**: Use system cron for badge updates

### Dependencies & Risks
**Dependencies**:
- User authentication complete ✓
- Badge system initialized (Sprint 02.03) ✓
- Basic user profiles exist ✓

**Identified Risks**:
- Badge update performance (mitigated by only updating active users)
- Referral code collisions (6 chars should be sufficient for MVP)

### Quality Requirements
- Zero TypeScript errors
- Zero ESLint warnings
- Referral codes unique and memorable
- Badge updates accurate
- Proper error handling

## Implementation Log

[To be filled during implementation]

## Handoff to Reviewer

[To be completed at handoff]

---

*Sprint Started: -*  
*Sprint Completed: -*  
*Final Status: NOT STARTED* 